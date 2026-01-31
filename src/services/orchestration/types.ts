/**
 * Orchestration Service Types
 */
import type { ScanResults, TestGenerationResults } from '../../types.js';
import type { BrowserType } from '../browser/types.js';

// Re-export for backwards compatibility
export type { BrowserType };

export interface ScanOperationOptions {
    url: string;
    browser: BrowserType;
    headless: boolean;
    tags?: string[];
    includeKeyboardTests?: boolean;
    outputFile?: string;
    generateAIPrompt?: boolean;
    ciMode?: boolean;
    ciThreshold?: number;
}

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
