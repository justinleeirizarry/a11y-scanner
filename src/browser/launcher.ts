import { chromium, firefox, webkit, type Browser, type Page } from 'playwright';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { ScanOptions, ScanResults, BrowserScanData } from '../types.js';
import { processResults } from '../processor/results-parser.js';
import { getConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { withRetry } from '../utils/retry.js';
import {
    ReactNotDetectedError,
    NavigationTimeoutError,
    ContextDestroyedError,
    MaxRetriesExceededError,
    BrowserLaunchError,
} from '../errors/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Launch browser and run the scan
 */
export async function runScan(options: ScanOptions): Promise<ScanResults> {
    const { url, browser: browserType, headless, tags } = options;

    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
        // Launch the appropriate browser
        browser = await launchBrowser(browserType, headless);
        page = await browser.newPage();

        const config = getConfig();

        // Navigate to the URL with network idle wait
        await page.goto(url, {
            waitUntil: 'networkidle',
            timeout: config.browser.timeout
        });

        // Wait longer for React to mount and stabilize (especially for Next.js)
        await page.waitForTimeout(config.browser.stabilizationDelay);

        // Check if React is present
        const hasReact = await detectReact(page);
        if (!hasReact) {
            throw new ReactNotDetectedError(url);
        }

        // Wait for any pending navigations to complete
        // Some apps (especially Next.js) do client-side navigation after initial load
        let isStable = false;
        let navigationCount = 0;

        while (!isStable && navigationCount < config.browser.maxNavigationWaits) {
            try {
                // Wait for network to be completely idle
                await page.waitForLoadState('networkidle', { timeout: config.browser.networkIdleTimeout });

                // Extra wait to ensure React has settled
                await page.waitForTimeout(config.browser.postNavigationDelay);

                // Check if page is truly stable by monitoring for a period
                try {
                    await page.waitForNavigation({
                        timeout: config.browser.navigationCheckInterval
                    });
                    // Navigation happened, increment counter and retry
                    navigationCount++;
                    logger.warn(`Navigation detected (${navigationCount}/${config.browser.maxNavigationWaits}), waiting...`);
                } catch (error) {
                    // No navigation in the check interval, we're stable
                    isStable = true;
                }
            } catch (error) {
                // Network idle timeout - assume stable
                isStable = true;
            }
        }

        if (!isStable) {
            logger.warn('Page may still be navigating, but proceeding with scan...');
        }
        logger.info('Page appears stable, proceeding with scan...');

        // Load and inject the scanner bundle
        const scannerBundlePath = join(__dirname, '../../dist/scanner-bundle.js');

        // Inject the scanner script into the page
        await page.addScriptTag({ path: scannerBundlePath });

        // Run the scanner with retry logic for heavy sites
        const rawData = await withRetry(
            async () => {
                if (!page) {
                    throw new Error('Page is null');
                }

                // Block navigation during scan to prevent context destruction
                return await page.evaluate(({ tags, includeKeyboardTests }) => {
                    // Save original navigation methods
                    const originalPushState = history.pushState;
                    const originalReplaceState = history.replaceState;

                    try {
                        // Temporarily block navigation
                        history.pushState = () => { };
                        history.replaceState = () => { };

                        // @ts-ignore - ReactA11yScanner is injected
                        const result = window.ReactA11yScanner.scan({ tags, includeKeyboardTests });

                        return result;
                    } finally {
                        // Always restore navigation
                        history.pushState = originalPushState;
                        history.replaceState = originalReplaceState;
                    }
                }, { tags, includeKeyboardTests: options.includeKeyboardTests }) as BrowserScanData;
            },
            {
                maxRetries: config.scan.maxRetries,
                delayMs: config.scan.retryDelayBase,
                backoff: 'linear',
                onRetry: (attempt, error) => {
                    logger.warn(`Scan attempt ${attempt} failed, retrying...`);
                    logger.debug(`Error: ${error.message}`);
                }
            }
        );

        // Capture accessibility tree snapshot
        let accessibilityTree = null;
        try {
            accessibilityTree = await page.accessibility.snapshot();
            logger.info('✓ Captured accessibility tree snapshot');
        } catch (error) {
            logger.warn('Failed to capture accessibility tree:', error);
        }

        // Process the results
        const results = processResults({
            rawData,
            url,
            browser: browserType,
        });

        // Add accessibility tree to results
        results.accessibilityTree = accessibilityTree;

        return results;
    } catch (error) {
        // Re-throw our custom errors as-is
        if (error instanceof ReactNotDetectedError ||
            error instanceof MaxRetriesExceededError ||
            error instanceof NavigationTimeoutError ||
            error instanceof ContextDestroyedError) {
            throw error;
        }
        // Wrap other errors
        throw new Error(`Scan failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        // Clean up
        if (page) await page.close();
        if (browser) await browser.close();
    }
}

/**
 * Launch the specified browser type
 */
async function launchBrowser(browserType: 'chromium' | 'firefox' | 'webkit', headless: boolean): Promise<Browser> {
    const launchOptions = { headless };

    try {
        switch (browserType) {
            case 'chromium':
                return await chromium.launch(launchOptions);
            case 'firefox':
                return await firefox.launch(launchOptions);
            case 'webkit':
                return await webkit.launch(launchOptions);
            default:
                throw new BrowserLaunchError(browserType, 'Unsupported browser type');
        }
    } catch (error) {
        if (error instanceof BrowserLaunchError) {
            throw error;
        }
        throw new BrowserLaunchError(browserType, error instanceof Error ? error.message : String(error));
    }
}

async function detectReact(page: Page): Promise<boolean> {
    return await page.evaluate(() => {
        // Helper function to check if element has React fiber
        function hasReactFiber(element: Element): boolean {
            const keys = Object.keys(element);
            return keys.some(key =>
                key.startsWith('__reactFiber') ||
                key.startsWith('__reactProps') ||
                key.startsWith('__reactInternalInstance')
            );
        }

        // 1. Fast path: Check DevTools hook first (most reliable)
        if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
            if (hook.getFiberRoots && hook.getFiberRoots(1)?.size > 0) {
                return true;
            }
        }

        // 2. Check common React root containers (most likely locations)
        const rootSelectors = ['#root', '#app', '#__next', '[data-reactroot]', '[data-reactid]'];
        for (const selector of rootSelectors) {
            const element = document.querySelector(selector);
            if (element && hasReactFiber(element)) {
                return true;
            }
        }

        // 3. Sample random elements instead of checking all (performance optimization)
        const allElements = document.querySelectorAll('*');
        const sampleSize = Math.min(100, allElements.length);
        const step = Math.max(1, Math.floor(allElements.length / sampleSize));

        for (let i = 0; i < allElements.length; i += step) {
            if (hasReactFiber(allElements[i])) {
                return true;
            }
        }

        return false;
    });
}
