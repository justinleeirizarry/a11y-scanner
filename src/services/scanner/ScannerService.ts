/**
 * Scanner Service - Manages in-page scanning operations
 *
 * Extracts scanner bundle injection and scan execution from launcher.ts
 */
import type { Page } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { BrowserScanData } from '../../types.js';
import { getConfig } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { withRetry } from '../../utils/retry.js';
import { BrowserLaunchError } from '../../errors/index.js';
import type { ScanOptions, IScannerService } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * ScannerService - Handles injecting and executing the scanner bundle in pages
 *
 * This service encapsulates:
 * - Scanner bundle injection
 * - Scan execution with retry logic
 * - Navigation blocking during scan
 */
export class ScannerService implements IScannerService {
    private bundlePath: string;

    constructor(bundlePath?: string) {
        // Default to the standard bundle location
        this.bundlePath = bundlePath ?? join(__dirname, '../../../dist/scanner-bundle.js');
    }

    /**
     * Check if the scanner bundle is already injected in the page
     */
    async isBundleInjected(page: Page): Promise<boolean> {
        return await page.evaluate(() => {
            return typeof window.ReactA11yScanner !== 'undefined';
        });
    }

    /**
     * Inject the scanner bundle into the page
     */
    async injectBundle(page: Page): Promise<void> {
        // Check if already injected
        const alreadyInjected = await this.isBundleInjected(page);
        if (alreadyInjected) {
            logger.debug('Scanner bundle already injected, skipping');
            return;
        }

        try {
            await page.addScriptTag({ path: this.bundlePath });
            logger.debug('Scanner bundle injected successfully');
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            throw new BrowserLaunchError(
                'scanner',
                `Failed to inject scanner bundle: ${errorMsg}. The dist/scanner-bundle.js file may be missing or corrupted. Try running "npm run build" to regenerate it.`
            );
        }

        // Verify injection was successful
        const isInjected = await this.isBundleInjected(page);
        if (!isInjected) {
            throw new BrowserLaunchError(
                'scanner',
                'Scanner bundle failed to load in page context. This may indicate a JavaScript error in the page. Try running with --headless=false to debug.'
            );
        }
    }

    /**
     * Run the scan on the page with retry logic
     */
    async scan(page: Page, options?: ScanOptions): Promise<BrowserScanData> {
        const config = getConfig();
        const { tags, includeKeyboardTests } = options ?? {};

        // Ensure bundle is injected
        await this.injectBundle(page);

        // Run the scanner with retry logic for heavy sites
        const rawData = await withRetry(
            async () => {
                // Block navigation during scan to prevent context destruction
                return await page.evaluate(
                    ({ scanTags, runKeyboardTests }) => {
                        // Save original navigation methods
                        const originalPushState = history.pushState;
                        const originalReplaceState = history.replaceState;

                        try {
                            // Temporarily block navigation
                            history.pushState = () => {};
                            history.replaceState = () => {};

                            const result = window.ReactA11yScanner!.scan({
                                tags: scanTags,
                                includeKeyboardTests: runKeyboardTests,
                            });

                            return result;
                        } finally {
                            // Always restore navigation
                            history.pushState = originalPushState;
                            history.replaceState = originalReplaceState;
                        }
                    },
                    { scanTags: tags, runKeyboardTests: includeKeyboardTests }
                ) as BrowserScanData;
            },
            {
                maxRetries: config.scan.maxRetries,
                delayMs: config.scan.retryDelayBase,
                backoff: 'linear',
                onRetry: (attempt, error) => {
                    logger.warn(`Scan attempt ${attempt} failed, retrying...`);
                    logger.debug(`Error: ${error.message}`);
                },
            }
        );

        // Validate that we got results
        if (!rawData) {
            throw new Error('No scan data returned from browser');
        }

        // Validate results have expected structure
        if (!Array.isArray(rawData.components)) {
            logger.warn('Scan returned invalid component data');
            rawData.components = [];
        }

        if (!Array.isArray(rawData.violations)) {
            logger.warn('Scan returned invalid violations data');
            rawData.violations = [];
        }

        // Warn if accessibility tree is empty (page may have no accessible content)
        if (!rawData.accessibilityTree) {
            logger.debug('No accessibility tree generated - page may have no accessible content');
        }

        logger.info(
            `Scan complete: Found ${rawData.components.length} components and ${rawData.violations.length} violations`
        );

        return rawData;
    }
}

/**
 * Create a new ScannerService instance
 */
export function createScannerService(bundlePath?: string): IScannerService {
    return new ScannerService(bundlePath);
}
