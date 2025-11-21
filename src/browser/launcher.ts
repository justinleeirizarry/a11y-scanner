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
    const { url, browser: browserType, headless } = options;

    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
        // Launch the appropriate browser
        browser = await launchBrowser(browserType, headless);
        page = await browser.newPage();

        // Navigate to the URL
        await page.goto(url, { waitUntil: 'load' });

        // Wait a bit for React to mount
        await page.waitForTimeout(1000);

        // Check if React is present
        const hasReact = await detectReact(page);
        if (!hasReact) {
            throw new Error('React was not detected on this page. This tool only works with React applications.');
        }

        // Load and inject the scanner bundle
        const scannerBundlePath = join(__dirname, '../../dist/scanner-bundle.js');

        // Inject the scanner script into the page
        await page.addScriptTag({ path: scannerBundlePath });

        // Run the scanner (it's now available as window.ReactA11yScanner)
        const rawData = await page.evaluate(() => {
            // @ts-ignore - ReactA11yScanner is injected
            return window.ReactA11yScanner.scan();
        }) as BrowserScanData;

        // Process the results
        const results = processResults({
            rawData,
            url,
            browser: browserType,
        });

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

/**
 * Detect if React is present on the page
 */
async function detectReact(page: Page): Promise<boolean> {
    return await page.evaluate(() => {
        // Check for React DevTools hook
        if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            return true;
        }

        // Check for React root
        const rootElements = document.querySelectorAll('[data-reactroot], #root, #app');
        for (const element of rootElements) {
            const keys = Object.keys(element);
            if (keys.some(key => key.startsWith('__react'))) {
                return true;
            }
        }

        return false;
    });
}
