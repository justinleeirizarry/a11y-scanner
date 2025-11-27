/**
 * Browser Service - Manages browser lifecycle and page operations
 *
 * Extracts browser-related logic from launcher.ts into a reusable service.
 */
import { chromium, firefox, webkit, type Browser, type Page } from 'playwright';
import { getConfig } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { BrowserLaunchError, ReactNotDetectedError } from '../../errors/index.js';
import type {
    BrowserServiceConfig,
    BrowserType,
    NavigateOptions,
    StabilityCheckResult,
    IBrowserService,
} from './types.js';

/**
 * Get Playwright browser install instructions
 */
function getPlaywrightInstallInstructions(browserType: string): string {
    return `
Playwright browsers are not installed. Please install them with:

    npx playwright install ${browserType}

Or install all browsers with:

    npx playwright install

For more information, visit: https://playwright.dev/docs/intro
`;
}

/**
 * BrowserService - Centralized browser lifecycle management
 *
 * This service encapsulates all browser-related operations:
 * - Browser launching (chromium, firefox, webkit)
 * - Page creation and navigation
 * - Stability checking (waiting for SPAs to settle)
 * - React detection
 * - Cleanup
 */
export class BrowserService implements IBrowserService {
    private browser: Browser | null = null;
    private page: Page | null = null;
    private config: BrowserServiceConfig | null = null;

    /**
     * Launch a browser with the specified configuration
     */
    async launch(config: BrowserServiceConfig): Promise<void> {
        if (this.browser) {
            throw new Error('Browser already launched. Call close() before launching again.');
        }

        this.config = config;
        const launchOptions = { headless: config.headless };

        try {
            switch (config.browserType) {
                case 'chromium':
                    this.browser = await chromium.launch(launchOptions);
                    break;
                case 'firefox':
                    this.browser = await firefox.launch(launchOptions);
                    break;
                case 'webkit':
                    this.browser = await webkit.launch(launchOptions);
                    break;
                default:
                    throw new BrowserLaunchError(config.browserType, 'Unsupported browser type');
            }

            this.page = await this.browser.newPage();
            logger.debug(`Browser ${config.browserType} launched successfully`);
        } catch (error) {
            if (error instanceof BrowserLaunchError) {
                throw error;
            }

            const errorMessage = error instanceof Error ? error.message : String(error);

            // Detect Playwright browser not installed error
            if (
                errorMessage.includes('No browsers found') ||
                errorMessage.includes('browser executable path') ||
                errorMessage.includes('Failed to find') ||
                errorMessage.includes('not installed')
            ) {
                throw new BrowserLaunchError(
                    config.browserType,
                    getPlaywrightInstallInstructions(config.browserType)
                );
            }

            throw new BrowserLaunchError(config.browserType, errorMessage);
        }
    }

    /**
     * Get the current page instance
     */
    getPage(): Page | null {
        return this.page;
    }

    /**
     * Get the current browser instance
     */
    getBrowser(): Browser | null {
        return this.browser;
    }

    /**
     * Check if browser is launched
     */
    isLaunched(): boolean {
        return this.browser !== null && this.page !== null;
    }

    /**
     * Navigate to a URL
     */
    async navigate(url: string, options?: NavigateOptions): Promise<void> {
        if (!this.page) {
            throw new Error('Browser not launched. Call launch() first.');
        }

        const globalConfig = getConfig();
        const timeout = options?.timeout ?? this.config?.timeout ?? globalConfig.browser.timeout;
        const waitUntil = options?.waitUntil ?? 'networkidle';

        await this.page.goto(url, { waitUntil, timeout });
        logger.debug(`Navigated to ${url}`);

        // Initial stabilization delay
        const stabilizationDelay = this.config?.stabilizationDelay ?? globalConfig.browser.stabilizationDelay;
        await this.page.waitForTimeout(stabilizationDelay);
    }

    /**
     * Wait for the page to stabilize (especially important for SPAs like Next.js)
     *
     * This monitors for client-side navigations and waits until the page
     * appears stable (no more navigations happening).
     */
    async waitForStability(): Promise<StabilityCheckResult> {
        if (!this.page) {
            throw new Error('Browser not launched. Call launch() first.');
        }

        const globalConfig = getConfig();
        const maxNavigationWaits = this.config?.maxNavigationWaits ?? globalConfig.browser.maxNavigationWaits;
        const navigationCheckInterval = this.config?.navigationCheckInterval ?? globalConfig.browser.navigationCheckInterval;
        const networkIdleTimeout = this.config?.networkIdleTimeout ?? globalConfig.browser.networkIdleTimeout;
        const postNavigationDelay = this.config?.postNavigationDelay ?? globalConfig.browser.postNavigationDelay;

        let isStable = false;
        let navigationCount = 0;
        let lastError: Error | undefined;

        while (!isStable && navigationCount < maxNavigationWaits) {
            try {
                // Wait for network to be completely idle
                try {
                    await this.page.waitForLoadState('networkidle', { timeout: networkIdleTimeout });
                } catch {
                    // Network idle timeout could mean slow network or infinite loaders
                    logger.debug('Network idle timeout - may indicate slow network or infinite loaders');
                }

                // Extra wait to ensure React has settled
                await this.page.waitForTimeout(postNavigationDelay);

                // Check if page is truly stable by monitoring for a period
                try {
                    await this.page.waitForNavigation({ timeout: navigationCheckInterval });
                    // Navigation happened, increment counter and retry
                    navigationCount++;
                    logger.warn(`Navigation detected (${navigationCount}/${maxNavigationWaits}), waiting for stabilization...`);
                } catch {
                    // No navigation in the check interval, we're stable
                    isStable = true;
                    logger.debug('No navigation detected - page appears stable');
                }
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                logger.debug(`Stability check iteration ${navigationCount} failed: ${lastError.message}`);
                navigationCount++;
            }
        }

        if (!isStable && navigationCount >= maxNavigationWaits) {
            logger.warn(`Page did not stabilize after ${navigationCount} navigation checks. Proceeding anyway...`);
            logger.debug(`Last error: ${lastError?.message || 'Unknown'}`);
        } else if (isStable) {
            logger.info('Page appears stable, proceeding...');
        }

        return { isStable, navigationCount, lastError };
    }

    /**
     * Detect if React is present on the page
     */
    async detectReact(): Promise<boolean> {
        if (!this.page) {
            throw new Error('Browser not launched. Call launch() first.');
        }

        return await this.page.evaluate(() => {
            // Helper function to check if element has React fiber
            function hasReactFiber(element: Element): boolean {
                const keys = Object.keys(element);
                return keys.some(
                    (key) =>
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

    /**
     * Close the browser and clean up resources
     */
    async close(): Promise<void> {
        if (this.page) {
            await this.page.close();
            this.page = null;
        }
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
        this.config = null;
        logger.debug('Browser closed');
    }
}

/**
 * Create a new BrowserService instance
 */
export function createBrowserService(): IBrowserService {
    return new BrowserService();
}
