/**
 * Browser Service Types
 */
import type { Effect } from 'effect';
import type { Page, Browser } from 'playwright';
import type { BrowserType } from '../../types.js';
import type {
    EffectBrowserLaunchError,
    EffectBrowserNotLaunchedError,
    EffectBrowserAlreadyLaunchedError,
    EffectNavigationError,
} from '../../errors/effect-errors.js';

// Re-export for convenience
export type { BrowserType };

export interface BrowserServiceConfig {
    browserType: BrowserType;
    headless: boolean;
    timeout?: number;
    stabilizationDelay?: number;
    maxNavigationWaits?: number;
    navigationCheckInterval?: number;
    networkIdleTimeout?: number;
    postNavigationDelay?: number;
}

export interface NavigateOptions {
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
    timeout?: number;
}

export interface StabilityCheckResult {
    isStable: boolean;
    navigationCount: number;
    lastError?: Error;
}

/**
 * Effect-first Browser Service interface
 *
 * All methods return Effects for composability with the Effect ecosystem.
 */
export interface IBrowserService {
    /**
     * Launch the browser with the given configuration
     */
    launch(config: BrowserServiceConfig): Effect.Effect<void, EffectBrowserLaunchError | EffectBrowserAlreadyLaunchedError>;

    /**
     * Get the current page
     */
    getPage(): Effect.Effect<Page, EffectBrowserNotLaunchedError>;

    /**
     * Get the current browser instance
     */
    getBrowser(): Effect.Effect<Browser, EffectBrowserNotLaunchedError>;

    /**
     * Navigate to a URL
     */
    navigate(url: string, options?: NavigateOptions): Effect.Effect<void, EffectBrowserNotLaunchedError | EffectNavigationError>;

    /**
     * Wait for page stability (network idle)
     */
    waitForStability(): Effect.Effect<StabilityCheckResult, EffectBrowserNotLaunchedError>;

    /**
     * Detect if React is present on the page
     * @deprecated Use @accessibility-toolkit/react plugin's detect() method instead
     */
    detectReact(): Effect.Effect<boolean, EffectBrowserNotLaunchedError>;

    /**
     * Close the browser
     */
    close(): Effect.Effect<void>;

    /**
     * Check if the browser is currently launched
     */
    isLaunched(): Effect.Effect<boolean>;
}

