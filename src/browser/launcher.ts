import { chromium, firefox, webkit, type Browser, type Page } from 'playwright';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { ScanOptions, ScanResults, BrowserScanData } from '../types.js';
import { processResults } from '../processor/results-parser.js';

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

        // Navigate to the URL with network idle wait
        await page.goto(url, {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // Wait longer for React to mount and stabilize (especially for Next.js)
        await page.waitForTimeout(3000);

        // Check if React is present
        const hasReact = await detectReact(page);
        if (!hasReact) {
            throw new Error('React was not detected on this page. This tool only works with React applications.');
        }

        // Wait for any pending navigations to complete
        // Some apps (especially Next.js) do client-side navigation after initial load
        let navigationCount = 0;
        const maxNavigationWaits = 3;

        while (navigationCount < maxNavigationWaits) {
            try {
                // Wait for network to be completely idle
                await page.waitForLoadState('networkidle', { timeout: 5000 });

                // Extra wait to ensure React has settled
                await page.waitForTimeout(2000);

                // Check if another navigation happens immediately
                const navigationHappened = await Promise.race([
                    page.waitForNavigation({ timeout: 1000 }).then(() => true).catch(() => false),
                    new Promise(resolve => setTimeout(() => resolve(false), 1000))
                ]);

                if (!navigationHappened) {
                    // No navigation in the last second, we're stable
                    break;
                }

                navigationCount++;
                console.warn(`Navigation detected (${navigationCount}/${maxNavigationWaits}), waiting...`);
            } catch (error) {
                // Timeout is fine, means no navigation
                break;
            }
        }

        console.log('Page appears stable, proceeding with scan...');

        // Load and inject the scanner bundle
        const scannerBundlePath = join(__dirname, '../../dist/scanner-bundle.js');

        // Inject the scanner script into the page
        await page.addScriptTag({ path: scannerBundlePath });

        // Run the scanner with retry logic for heavy sites
        let rawData: BrowserScanData | null = null;
        let lastError: Error | null = null;
        const maxRetries = 3;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Wait a bit before each attempt (especially important for GSAP/Three.js)
                if (attempt > 1) {
                    await page.waitForTimeout(2000 * attempt);
                }

                // Block navigation during scan to prevent context destruction
                rawData = await page.evaluate(({ tags }) => {
                    // Save original navigation methods
                    const originalPushState = history.pushState;
                    const originalReplaceState = history.replaceState;
                    const originalLocation = window.location.href;

                    // Temporarily block navigation
                    history.pushState = () => { };
                    history.replaceState = () => { };

                    try {
                        // @ts-ignore - ReactA11yScanner is injected
                        const result = window.ReactA11yScanner.scan({ tags });

                        // Restore navigation
                        history.pushState = originalPushState;
                        history.replaceState = originalReplaceState;

                        return result;
                    } catch (error) {
                        // Restore navigation even on error
                        history.pushState = originalPushState;
                        history.replaceState = originalReplaceState;
                        throw error;
                    }
                }, { tags }) as BrowserScanData;

                // Success! Break out of retry loop
                break;
            } catch (error) {
                lastError = error as Error;

                // If this is the last attempt, throw
                if (attempt === maxRetries) {
                    throw new Error(
                        `Failed to scan after ${maxRetries} attempts. ` +
                        `This might be due to heavy libraries (GSAP, Three.js, etc.) ` +
                        `causing page instability. Last error: ${lastError.message}`
                    );
                }

                // Otherwise, log and retry
                console.warn(`Scan attempt ${attempt} failed, retrying...`);
            }
        }

        if (!rawData) {
            throw new Error('No scan data received');
        }

        // Capture accessibility tree snapshot
        let accessibilityTree = null;
        try {
            accessibilityTree = await page.accessibility.snapshot();
            console.log('✓ Captured accessibility tree snapshot');
        } catch (error) {
            console.warn('Failed to capture accessibility tree:', error);
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

    switch (browserType) {
        case 'chromium':
            return await chromium.launch(launchOptions);
        case 'firefox':
            return await firefox.launch(launchOptions);
        case 'webkit':
            return await webkit.launch(launchOptions);
        default:
            throw new Error(`Unsupported browser: ${browserType}`);
    }
}

async function detectReact(page: Page): Promise<boolean> {
    return await page.evaluate(() => {
        // Check for React DevTools hook
        if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
            // Check if it has fiber roots (actual React app running)
            if (hook.getFiberRoots && hook.getFiberRoots(1)?.size > 0) {
                return true;
            }
        }

        // Check for React fiber keys on DOM elements (works in prod)
        const allElements = document.querySelectorAll('*');
        for (let i = 0; i < Math.min(allElements.length, 100); i++) {
            const element = allElements[i];
            const keys = Object.keys(element);
            // Look for React internal fiber keys
            if (keys.some(key =>
                key.startsWith('__reactFiber') ||
                key.startsWith('__reactProps') ||
                key.startsWith('__reactInternalInstance')
            )) {
                return true;
            }
        }

        // Check common React root containers
        const containers = [
            '#root', '#app', '#__next', // Next.js uses #__next
            '[data-reactroot]', '[data-reactid]'
        ];

        for (const selector of containers) {
            const element = document.querySelector(selector);
            if (element) {
                const keys = Object.keys(element);
                if (keys.some(key => key.startsWith('__react') || key.startsWith('_react'))) {
                    return true;
                }
            }
        }

        return false;
    });
}
