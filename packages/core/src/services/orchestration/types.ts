/**
 * Orchestration Service Types
 */
import type { ScanResults, BrowserType } from '../../types.js';

// Re-export for backwards compatibility
export type { BrowserType };

/**
 * Base options for scan operations (used by Effect-based implementation)
 */
export interface BaseScanOptions {
    url: string;
    browser: BrowserType;
    headless: boolean;
    tags?: string[];
    includeKeyboardTests?: boolean;
    outputFile?: string;
    ciMode?: boolean;
    ciThreshold?: number;
}

/**
 * Result of a scan operation (used by Effect-based implementation)
 */
export interface ScanOperationResult {
    results: ScanResults;
    ciPassed?: boolean;
    outputFile?: string;
}
