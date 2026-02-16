/**
 * Zod schema for configuration validation
 *
 * Provides runtime validation and type inference for scanner configuration.
 */
import { z } from 'zod';

/**
 * Browser configuration schema
 */
export const browserConfigSchema = z.object({
    /** Run browser in headless mode */
    headless: z.boolean().default(true),
    /** Navigation timeout in milliseconds */
    timeout: z.number().int().positive().default(30000),
    /** Delay after page load before scanning (ms) */
    stabilizationDelay: z.number().int().nonnegative().default(3000),
    /** Maximum number of navigation waits during stability check */
    maxNavigationWaits: z.number().int().positive().default(3),
    /** Interval between navigation checks (ms) */
    navigationCheckInterval: z.number().int().positive().default(1000),
    /** Timeout for network idle state (ms) */
    networkIdleTimeout: z.number().int().positive().default(5000),
    /** Delay after navigation before stability check (ms) */
    postNavigationDelay: z.number().int().nonnegative().default(2000),
});

/**
 * Scan configuration schema
 */
export const scanConfigSchema = z.object({
    /** Maximum number of retries for failed scans */
    maxRetries: z.number().int().nonnegative().default(3),
    /** Base delay between retries (ms), multiplied by attempt number */
    retryDelayBase: z.number().int().positive().default(2000),
    /** Maximum elements to check for React detection */
    maxElementsToCheck: z.number().int().positive().default(100),
});

/**
 * Framework configuration schema
 */
export const frameworkConfigSchema = z.object({
    /** Patterns to identify framework components (filtered from user components) */
    patterns: z.array(z.string()).default([
        // Next.js
        'ServerRoot',
        'AppRouter',
        'RootErrorBoundary',
        'ErrorBoundary',
        'ErrorBoundaryHandler',
        'NotFoundErrorBoundary',
        'RedirectErrorBoundary',
        'RedirectBoundary',
        'InnerLayoutRouter',
        'OuterLayoutRouter',
        'ScrollAndFocusHandler',
        'StaticGenerationSearchParamsBailoutProvider',
        // React Router
        'RouterProvider',
        'DataRouterContext',
        'LocationContext',
        'RouteContext',
        // Common HOCs
        'Context.Provider',
        'Context.Consumer',
        'ForwardRef',
        'Memo',
        // Generic
        'Root',
        'App',
        'Fragment',
    ]),
});

/**
 * Complete scanner configuration schema
 */
export const scannerConfigSchema = z.object({
    browser: browserConfigSchema.default({}),
    scan: scanConfigSchema.default({}),
    framework: frameworkConfigSchema.default({}),
});

/**
 * Type for full scanner configuration (inferred from schema)
 */
export type ScannerConfigSchema = z.infer<typeof scannerConfigSchema>;

/**
 * Type for partial scanner configuration updates
 */
export type PartialScannerConfig = z.input<typeof scannerConfigSchema>;

/**
 * Validation result type
 */
export interface ConfigValidationResult {
    success: boolean;
    data?: ScannerConfigSchema;
    errors?: z.ZodError;
}

/**
 * Validate configuration against the schema
 *
 * @param config - Configuration object to validate
 * @returns Validation result with parsed config or errors
 */
export function validateConfig(config: unknown): ConfigValidationResult {
    const result = scannerConfigSchema.safeParse(config);

    if (result.success) {
        return {
            success: true,
            data: result.data,
        };
    }

    return {
        success: false,
        errors: result.error,
    };
}

/**
 * Parse and validate configuration, throwing on error
 *
 * @param config - Configuration object to validate
 * @returns Validated configuration
 * @throws ZodError if validation fails
 */
export function parseConfig(config: unknown): ScannerConfigSchema {
    return scannerConfigSchema.parse(config);
}

/**
 * Format validation errors as human-readable messages
 *
 * @param errors - Zod validation errors
 * @returns Array of error message strings
 */
export function formatConfigErrors(errors: z.ZodError): string[] {
    return errors.errors.map((err) => {
        const path = err.path.join('.');
        return path ? `${path}: ${err.message}` : err.message;
    });
}
