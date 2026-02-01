/**
 * Browser Service Types
 */
import type { Page, Browser } from 'playwright';
import type { BrowserType } from '../../types.js';

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

export interface IBrowserService {
    launch(config: BrowserServiceConfig): Promise<void>;
    getPage(): Page | null;
    getBrowser(): Browser | null;
    navigate(url: string, options?: NavigateOptions): Promise<void>;
    waitForStability(): Promise<StabilityCheckResult>;
    detectReact(): Promise<boolean>;
    close(): Promise<void>;
    isLaunched(): boolean;
}
