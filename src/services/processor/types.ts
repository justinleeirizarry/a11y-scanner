/**
 * Results Processor Service Types
 */
import type { BrowserScanData, ScanResults, AttributedViolation } from '../../types.js';

export interface ScanMetadata {
    url: string;
    browser: string;
    timestamp?: string;
}

export interface MCPToolContent {
    type: 'text';
    text: string;
}

export interface CIResult {
    passed: boolean;
    totalViolations: number;
    criticalViolations: number;
    threshold: number;
    message: string;
}

export interface IResultsProcessorService {
    process(data: BrowserScanData, metadata: ScanMetadata): ScanResults;
    formatAsJSON(results: ScanResults, pretty?: boolean): string;
    formatForMCP(results: ScanResults, options?: MCPFormatOptions): MCPToolContent[];
    formatForCI(results: ScanResults, threshold: number): CIResult;
}

export interface MCPFormatOptions {
    includeTree?: boolean;
}
