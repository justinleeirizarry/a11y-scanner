/**
 * @deprecated Use ResultsProcessorService.process() instead.
 * This module is maintained for backwards compatibility only.
 */
import type { BrowserScanData, ScanResults } from '../types.js';
import { createResultsProcessorService } from '../services/processor/index.js';

interface ProcessOptions {
    rawData: BrowserScanData;
    url: string;
    browser: string;
}

/**
 * Process raw scan data into structured results
 *
 * @deprecated Use ResultsProcessorService.process() instead.
 * This function is maintained for backwards compatibility only.
 */
export function processResults(options: ProcessOptions): ScanResults {
    const { rawData, url, browser } = options;
    const processor = createResultsProcessorService();
    return processor.process(rawData, { url, browser });
}
