/**
 * Orchestration Service Types
 */
import type { ScanResults, TestGenerationResults, BrowserType } from '../../types.js';

// Re-export for backwards compatibility
export type { BrowserType };

/**
 * Base options for scan operations (shared by Promise and Effect versions)
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
 * Extended options for Promise-based orchestration
 */
export interface ScanOperationOptions extends BaseScanOptions {
    generateAIPrompt?: boolean;
}

/**
 * Result of a scan operation (shared by Promise and Effect versions)
 */
export interface ScanOperationResult {
    results: ScanResults;
    ciPassed?: boolean;
    outputFile?: string;
}

export interface TestGenOperationOptions {
    url: string;
    outputFile: string;
    model?: string;
    verbose?: boolean;
}

export interface IOrchestrationService {
    performScan(options: ScanOperationOptions): Promise<ScanOperationResult>;
    performTestGeneration(options: TestGenOperationOptions): Promise<TestGenerationResults>;
}
