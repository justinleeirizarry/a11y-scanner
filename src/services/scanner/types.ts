/**
 * Scanner Service Types
 */
import type { Page } from 'playwright';
import type { BrowserScanData } from '../../types.js';

/**
 * Options for scanner execution (subset of full ScanOptions)
 */
export interface ScanExecutionOptions {
    tags?: string[];
    includeKeyboardTests?: boolean;
}

export interface IScannerService {
    injectBundle(page: Page): Promise<void>;
    scan(page: Page, options?: ScanExecutionOptions): Promise<BrowserScanData>;
    isBundleInjected(page: Page): Promise<boolean>;
}
