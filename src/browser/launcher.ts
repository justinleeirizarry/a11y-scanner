import type { ScanOptions, ScanResults } from '../types.js';
import {
    createBrowserService,
    createScannerService,
    createResultsProcessorService,
} from '../services/index.js';
import { ReactNotDetectedError } from '../errors/index.js';
import { logger } from '../utils/logger.js';

/**
 * Launch browser and run the scan
 *
 * @deprecated This function is maintained for backwards compatibility.
 * For new code, use OrchestrationService.performScan() instead:
 *
 * ```typescript
 * import { createOrchestrationService } from './services';
 * const orchestration = createOrchestrationService();
 * const result = await orchestration.performScan({ url, browser, headless });
 * ```
 */
export async function runScan(options: ScanOptions): Promise<ScanResults> {
    const { url, browser: browserType, headless, tags, includeKeyboardTests } = options;

    const browserService = createBrowserService();
    const scannerService = createScannerService();
    const processorService = createResultsProcessorService();

    try {
        // Launch browser
        await browserService.launch({ browserType, headless });

        // Navigate to URL
        await browserService.navigate(url);

        // Wait for page stability (important for SPAs)
        await browserService.waitForStability();

        // Check for React
        const hasReact = await browserService.detectReact();
        if (!hasReact) {
            throw new ReactNotDetectedError(url);
        }

        // Get page for scanning
        const page = browserService.getPage();
        if (!page) {
            throw new Error('Failed to get browser page');
        }

        // Run scan
        const rawData = await scannerService.scan(page, {
            tags,
            includeKeyboardTests,
        });

        // Validate results
        if (!rawData) {
            throw new Error('No scan data returned from browser');
        }

        logger.info(`Scan complete: Found ${rawData.components.length} components and ${rawData.violations.length} violations`);

        // Process results
        const results = processorService.process(rawData, {
            url,
            browser: browserType,
        });

        return results;
    } finally {
        // Always clean up
        await browserService.close();
    }
}
