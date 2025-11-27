/**
 * Scanner Service Types
 */
import type { Page } from 'playwright';
import type { BrowserScanData } from '../../types.js';

export interface ScanOptions {
    tags?: string[];
    includeKeyboardTests?: boolean;
}

export interface IScannerService {
    injectBundle(page: Page): Promise<void>;
    scan(page: Page, options?: ScanOptions): Promise<BrowserScanData>;
    isBundleInjected(page: Page): Promise<boolean>;
}
