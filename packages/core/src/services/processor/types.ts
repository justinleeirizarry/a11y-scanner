/**
 * Results Processor Service Types
 */
import type { Effect } from 'effect';
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

export interface MCPFormatOptions {
    includeTree?: boolean;
}

/**
 * Effect-first Results Processor Service interface
 *
 * All methods return Effects for composability with the Effect ecosystem.
 * Since all operations are pure/synchronous, errors are never expected.
 */
export interface IResultsProcessorService {
    /**
     * Process raw scan data into structured results
     */
    process(data: BrowserScanData, metadata: ScanMetadata): Effect.Effect<ScanResults>;

    /**
     * Format results as JSON string
     */
    formatAsJSON(results: ScanResults, pretty?: boolean): Effect.Effect<string>;

    /**
     * Format results for MCP output
     */
    formatForMCP(results: ScanResults, options?: MCPFormatOptions): Effect.Effect<MCPToolContent[]>;

    /**
     * Format results for CI mode with threshold checking
     */
    formatForCI(results: ScanResults, threshold: number): Effect.Effect<CIResult>;
}

