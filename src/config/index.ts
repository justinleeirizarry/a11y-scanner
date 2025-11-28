/**
 * Configuration management
 */

import { DEFAULT_CONFIG, type ScannerConfig } from './defaults.js';
import { deepMerge, type DeepPartial } from '../utils/deep-merge.js';

let currentConfig: ScannerConfig = structuredClone(DEFAULT_CONFIG);

/**
 * Get the current configuration
 */
export function getConfig(): ScannerConfig {
    return currentConfig;
}

/**
 * Update configuration with deep merge support.
 * Nested objects are merged recursively, arrays are replaced entirely.
 */
export function updateConfig(partialConfig: DeepPartial<ScannerConfig>): void {
    currentConfig = deepMerge(currentConfig, partialConfig);
}

/**
 * Reset configuration to defaults
 */
export function resetConfig(): void {
    currentConfig = structuredClone(DEFAULT_CONFIG);
}

// Re-export for convenience
export { DEFAULT_CONFIG, type ScannerConfig } from './defaults.js';
