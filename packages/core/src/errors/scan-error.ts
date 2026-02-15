/**
 * ScanError - A well-formatted Error subclass for scan workflow failures.
 *
 * When `runScanAsPromise` encounters typed Effect errors, it throws a `ScanError`
 * with a human-readable message derived from the tagged error. This allows all
 * callers (CLI, MCP, App) to get useful error messages via standard `error.message`
 * without needing to understand Effect internals.
 */

/**
 * Error class thrown by `runScanAsPromise` when the Effect workflow fails
 * with a typed (tagged) error.
 *
 * - `tag`: the `_tag` discriminant from the tagged error (e.g. "NavigationError")
 * - `details`: all fields from the original tagged error
 * - `message`: human-readable formatted string
 * - `cause`: the original tagged error object (via Error.cause)
 */
export class ScanError extends Error {
    readonly tag: string;
    readonly details: Record<string, unknown>;

    constructor(
        tag: string,
        message: string,
        details: Record<string, unknown>,
        originalError?: unknown
    ) {
        super(message, { cause: originalError });
        this.name = 'ScanError';
        this.tag = tag;
        this.details = details;
    }
}

/**
 * Format a tagged Effect error into a human-readable message.
 *
 * Handles all 25 error types from effect-errors.ts with specific formatting
 * per error type. Falls back to JSON stringification for unknown tags.
 */
export function formatTaggedError(error: { _tag: string; [key: string]: unknown }): string {
    const tag = error._tag;

    switch (tag) {
        // Browser errors
        case 'BrowserLaunchError':
            return error.reason
                ? `Failed to launch ${error.browserType || 'browser'}: ${error.reason}`
                : `Failed to launch ${error.browserType || 'browser'}`;

        case 'BrowserNotLaunchedError':
            return `Browser not launched: cannot perform "${error.operation}"`;

        case 'BrowserAlreadyLaunchedError':
            return 'Browser is already launched';

        case 'NavigationTimeoutError':
            return `Navigation to ${error.url} timed out after ${error.timeout}ms`;

        case 'NavigationError':
            return error.reason
                ? `Navigation to ${error.url} failed: ${error.reason}`
                : `Navigation to ${error.url} failed`;

        case 'ContextDestroyedError':
            return error.message
                ? `Browser context destroyed: ${error.message}`
                : 'Browser context was destroyed during scan';

        // Scan errors
        case 'ReactNotDetectedError':
            return `React was not detected on ${error.url}`;

        case 'ScannerInjectionError':
            return `Scanner injection failed: ${error.reason}`;

        case 'MaxRetriesExceededError':
            return error.lastError
                ? `Scan failed after ${error.attempts} attempts: ${error.lastError}`
                : `Scan failed after ${error.attempts} attempts`;

        case 'ScanDataError':
            return `Invalid scan data: ${error.reason}`;

        // Validation errors
        case 'ConfigurationError':
            return error.invalidField
                ? `Configuration error in "${error.invalidField}": ${error.message}`
                : `Configuration error: ${error.message}`;

        case 'InvalidUrlError':
            return error.reason
                ? `Invalid URL "${error.url}": ${error.reason}`
                : `Invalid URL: ${error.url}`;

        // Infrastructure errors
        case 'FileSystemError':
            return `File system error during ${error.operation} on ${error.path}${error.reason ? `: ${error.reason}` : ''}`;

        case 'ServiceStateError':
            return `Service "${error.service}" is in state "${error.actualState}" but expected "${error.expectedState}"`;

        // Test generation errors
        case 'TestGenNotInitializedError':
            return error.operation
                ? `Test generation service not initialized: cannot perform "${error.operation}"`
                : 'Test generation service not initialized';

        case 'TestGenInitError':
            return `Test generation initialization failed: ${error.reason}`;

        case 'TestGenNavigationError':
            return `Test generation navigation to ${error.url} failed: ${error.reason}`;

        case 'TestGenDiscoveryError':
            return `Element discovery failed: ${error.reason}`;

        // Keyboard test errors
        case 'KeyboardTestInitError':
            return `Keyboard test initialization failed: ${error.reason}`;

        case 'KeyboardTestError':
            return `Keyboard test "${error.operation}" failed: ${error.reason}`;

        case 'KeyboardTestNotInitializedError':
            return error.operation
                ? `Keyboard test service not initialized: cannot perform "${error.operation}"`
                : 'Keyboard test service not initialized';

        // Tree analysis errors
        case 'TreeAnalysisInitError':
            return `Tree analysis initialization failed: ${error.reason}`;

        case 'TreeAnalysisError':
            return `Tree analysis failed: ${error.reason}`;

        case 'TreeAnalysisNotInitializedError':
            return error.operation
                ? `Tree analysis service not initialized: cannot perform "${error.operation}"`
                : 'Tree analysis service not initialized';

        // WCAG audit errors
        case 'WcagAuditInitError':
            return `WCAG audit initialization failed: ${error.reason}`;

        case 'WcagAuditError':
            return `WCAG audit "${error.operation}" failed: ${error.reason}`;

        case 'WcagAuditNotInitializedError':
            return error.operation
                ? `WCAG audit service not initialized: cannot perform "${error.operation}"`
                : 'WCAG audit service not initialized';

        default:
            return `${tag}: ${JSON.stringify(error)}`;
    }
}
