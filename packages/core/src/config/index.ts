/**
 * Configuration management
 */

import { DEFAULT_CONFIG, type ScannerConfig } from './defaults.js';
import { deepMerge, type DeepPartial } from '../utils/deep-merge.js';
import {
    validateConfig,
    parseConfig,
    formatConfigErrors,
    type ConfigValidationResult,
} from './schema.js';

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
 *
 * @param partialConfig - Partial configuration to merge
 * @param validate - Whether to validate the merged config (default: false for backwards compat)
 * @throws Error if validation is enabled and the merged config is invalid
 */
export function updateConfig(
    partialConfig: DeepPartial<ScannerConfig>,
    validate = false
): void {
    const merged = deepMerge(currentConfig, partialConfig);

    if (validate) {
        const result = validateConfig(merged);
        if (!result.success && result.errors) {
            const errorMessages = formatConfigErrors(result.errors);
            throw new Error(`Invalid configuration: ${errorMessages.join(', ')}`);
        }
    }

    currentConfig = merged;
}

/**
 * Load and validate configuration from an unknown source.
 * Unlike updateConfig, this replaces the entire config and always validates.
 *
 * @param config - Configuration object to load
 * @returns The validated configuration
 * @throws Error if validation fails
 */
export function loadConfig(config: unknown): ScannerConfig {
    const validated = parseConfig(config);
    // Cast through unknown since Zod schema types don't match readonly const types exactly
    currentConfig = validated as unknown as ScannerConfig;
    return currentConfig;
}

/**
 * Validate a configuration object without loading it.
 *
 * @param config - Configuration to validate
 * @returns Validation result with success status and any errors
 */
export function validateConfiguration(config: unknown): ConfigValidationResult {
    return validateConfig(config);
}

/**
 * Reset configuration to defaults
 */
export function resetConfig(): void {
    currentConfig = structuredClone(DEFAULT_CONFIG);
}

// Re-export for convenience
export { DEFAULT_CONFIG, type ScannerConfig } from './defaults.js';
export {
    validateConfig,
    parseConfig,
    formatConfigErrors,
    scannerConfigSchema,
    browserConfigSchema,
    scanConfigSchema,
    frameworkConfigSchema,
    type ScannerConfigSchema,
    type PartialScannerConfig,
    type ConfigValidationResult,
} from './schema.js';
export {
    loadEnvConfig,
    hasEnvConfig,
    getSupportedEnvVars,
    getEnvVarDocs,
} from './env.js';
export { loadConfigFile } from './file.js';
