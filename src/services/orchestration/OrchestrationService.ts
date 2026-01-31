/**
 * Orchestration Service - Coordinates scan and test generation workflows
 *
 * Single entry point for all operations, using the other services.
 */
import { mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';
import type { ScanResults, TestGenerationResults } from '../../types.js';
import { logger } from '../../utils/logger.js';
import { ReactNotDetectedError, ServiceStateError } from '../../errors/index.js';
import { BrowserService, createBrowserService } from '../browser/index.js';
import { ScannerService, createScannerService } from '../scanner/index.js';
import { ResultsProcessorService, createResultsProcessorService } from '../processor/index.js';
import { TestGenerationService, createTestGenerationService } from '../testgen/index.js';
import type {
    ScanOperationOptions,
    ScanOperationResult,
    TestGenOperationOptions,
    IOrchestrationService,
} from './types.js';

/**
 * OrchestrationService - Coordinates all scan and test generation workflows
 *
 * This service:
 * - Coordinates BrowserService, ScannerService, ResultsProcessorService
 * - Handles file I/O for results output
 * - Manages CI mode threshold checking
 * - Provides clean interface for all entry points (CLI, MCP, etc.)
 */
export class OrchestrationService implements IOrchestrationService {
    private browserService: BrowserService;
    private scannerService: ScannerService;
    private processorService: ResultsProcessorService;
    private testGenService: TestGenerationService;

    constructor() {
        this.browserService = createBrowserService() as BrowserService;
        this.scannerService = createScannerService() as ScannerService;
        this.processorService = createResultsProcessorService() as ResultsProcessorService;
        this.testGenService = createTestGenerationService() as TestGenerationService;
    }

    /**
     * Perform an accessibility scan
     */
    async performScan(options: ScanOperationOptions): Promise<ScanOperationResult> {
        const {
            url,
            browser: browserType,
            headless,
            tags,
            includeKeyboardTests,
            outputFile,
            ciMode,
            ciThreshold = 0,
        } = options;

        try {
            // Launch browser
            await this.browserService.launch({ browserType, headless });

            // Navigate to URL
            await this.browserService.navigate(url);

            // Wait for page stability (important for SPAs)
            await this.browserService.waitForStability();

            // Check for React
            const hasReact = await this.browserService.detectReact();
            if (!hasReact) {
                throw new ReactNotDetectedError(url);
            }

            // Get page for scanning
            const page = this.browserService.getPage();
            if (!page) {
                throw new ServiceStateError('BrowserService', 'launched with page', 'page unavailable');
            }

            // Run scan
            const rawData = await this.scannerService.scan(page, {
                tags,
                includeKeyboardTests,
            });

            // Process results
            const results = this.processorService.process(rawData, {
                url,
                browser: browserType,
            });

            // Build result
            const result: ScanOperationResult = { results };

            // Handle CI mode
            if (ciMode) {
                const ciResult = this.processorService.formatForCI(results, ciThreshold);
                result.ciPassed = ciResult.passed;
                logger.info(ciResult.message);
            }

            // Handle file output
            if (outputFile) {
                await this.writeResultsToFile(results, outputFile);
                result.outputFile = outputFile;
            }

            return result;
        } finally {
            // Always clean up
            await this.browserService.close();
        }
    }

    /**
     * Perform test generation
     */
    async performTestGeneration(options: TestGenOperationOptions): Promise<TestGenerationResults> {
        const { url, outputFile, model, verbose } = options;

        try {
            // Initialize test generation service
            await this.testGenService.init({ model, verbose });

            // Navigate to URL
            await this.testGenService.navigateTo(url);

            // Discover elements
            const elements = await this.testGenService.discoverElements();

            // Generate test file
            const testContent = this.testGenService.generateTest(url, elements);

            // Write test file
            await this.writeFileWithDir(outputFile, testContent);
            logger.info(`Test file written to ${outputFile}`);

            return {
                url,
                timestamp: new Date().toISOString(),
                outputFile,
                elementsDiscovered: elements.length,
                elements,
                success: true,
            };
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            logger.error(`Test generation failed: ${errorMsg}`);

            return {
                url,
                timestamp: new Date().toISOString(),
                outputFile,
                elementsDiscovered: 0,
                elements: [],
                success: false,
                error: errorMsg,
            };
        } finally {
            // Always clean up
            await this.testGenService.close();
        }
    }

    /**
     * Write results to file with circular reference handling
     */
    private async writeResultsToFile(results: ScanResults, filePath: string): Promise<void> {
        const jsonContent = this.processorService.formatAsJSON(results);
        await this.writeFileWithDir(filePath, jsonContent);
        logger.info(`Results written to ${filePath}`);
    }

    /**
     * Write content to file, creating directory if needed
     */
    private async writeFileWithDir(filePath: string, content: string): Promise<void> {
        const dir = dirname(filePath);
        if (dir !== '.') {
            try {
                await mkdir(dir, { recursive: true });
            } catch (err) {
                // Only ignore EEXIST error (directory already exists)
                if (err instanceof Error) {
                    const nodeError = err as NodeJS.ErrnoException;
                    if (nodeError.code !== 'EEXIST') {
                        throw err;
                    }
                }
            }
        }
        await writeFile(filePath, content);
    }
}

/**
 * Create a new OrchestrationService instance
 */
export function createOrchestrationService(): IOrchestrationService {
    return new OrchestrationService();
}
