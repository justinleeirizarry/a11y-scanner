/**
 * Configuration management
 */

import { DEFAULT_CONFIG, type ScannerConfig } from './defaults.js';

let currentConfig: ScannerConfig = DEFAULT_CONFIG;

/**
 * Get the current configuration
 */
export function getConfig(): ScannerConfig {
    return currentConfig;
}

/**
 * Update configuration (deep merge)
 */
export function updateConfig(partialConfig: Partial<ScannerConfig>): void {
    currentConfig = {
        ...currentConfig,
        ...partialConfig,
    };
}

/**
 * Reset configuration to defaults
 */
export function resetConfig(): void {
    currentConfig = DEFAULT_CONFIG;
}

// Re-export for convenience
export { DEFAULT_CONFIG, type ScannerConfig } from './defaults.js';
