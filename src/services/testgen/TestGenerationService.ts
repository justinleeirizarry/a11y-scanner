/**
 * Test Generation Service - Manages AI-driven test generation
 *
 * Wraps StagehandScanner and TestGenerator with a cleaner interface
 */
import type { Page } from 'playwright';
import { StagehandScanner } from '../../scanner/stagehand/index.js';
import { TestGenerator } from '../../scanner/stagehand/test-generator.js';
import type { ElementDiscovery } from '../../types.js';
import { logger } from '../../utils/logger.js';
import { ServiceStateError } from '../../errors/index.js';
import type { TestGenerationConfig, ITestGenerationService } from './types.js';

/**
 * TestGenerationService - Clean interface for AI-driven test generation
 *
 * This service wraps:
 * - StagehandScanner for element discovery
 * - TestGenerator for Playwright test file generation
 */
export class TestGenerationService implements ITestGenerationService {
    private scanner: StagehandScanner | null = null;
    private generator: TestGenerator;
    private config: TestGenerationConfig = {};

    constructor() {
        this.generator = new TestGenerator();
    }

    /**
     * Initialize the Stagehand scanner
     */
    async init(config?: TestGenerationConfig): Promise<void> {
        this.config = config ?? {};

        if (this.config.verbose) {
            logger.setLevel(0); // DEBUG
        }

        this.scanner = new StagehandScanner({
            enabled: true,
            model: this.config.model,
            verbose: this.config.verbose,
        });

        logger.info('Initializing Stagehand for test generation...');
    }

    /**
     * Check if service is initialized
     */
    isInitialized(): boolean {
        return this.scanner !== null;
    }

    /**
     * Get the underlying page instance
     */
    getPage(): Page | null {
        return this.scanner?.page ?? null;
    }

    /**
     * Navigate to a URL (initializes Stagehand if needed)
     */
    async navigateTo(url: string): Promise<void> {
        if (!this.scanner) {
            throw new ServiceStateError('TestGenerationService', 'initialized', 'not initialized');
        }

        // Initialize Stagehand with the URL
        await this.scanner.init(url);

        const page = this.getPage();
        if (!page) {
            throw new ServiceStateError('TestGenerationService', 'initialized with page', 'page unavailable');
        }

        logger.info(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle' });

        // Wait for page to settle
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    /**
     * Discover interactive elements on the page using AI
     */
    async discoverElements(): Promise<ElementDiscovery[]> {
        if (!this.scanner) {
            throw new ServiceStateError('TestGenerationService', 'initialized', 'not initialized');
        }

        logger.info('Discovering interactive elements...');
        const elements = await this.scanner.discoverElements();

        if (elements.length === 0) {
            logger.warn('No interactive elements discovered');
        } else {
            logger.info(`Discovered ${elements.length} interactive elements`);
        }

        return elements;
    }

    /**
     * Generate a Playwright test file from discovered elements
     */
    generateTest(url: string, elements: ElementDiscovery[]): string {
        logger.info('Generating Playwright test file...');
        return this.generator.generateTest(url, elements);
    }

    /**
     * Close the scanner and clean up resources
     */
    async close(): Promise<void> {
        if (this.scanner) {
            await this.scanner.close();
            this.scanner = null;
        }
        logger.debug('TestGenerationService closed');
    }
}

/**
 * Create a new TestGenerationService instance
 */
export function createTestGenerationService(): ITestGenerationService {
    return new TestGenerationService();
}
