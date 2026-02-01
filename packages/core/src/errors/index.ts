/**
 * Error handling for the scanner
 *
 * This module exports two sets of errors:
 * 1. Legacy class-based errors (extending ScanError) - for Promise-based code
 * 2. Effect-compatible errors (Data.TaggedError) - for Effect-based code
 *
 * New code should prefer the Effect-compatible errors from './effect-errors'.
 */

// Re-export Effect-compatible errors for Effect workflows
export * from './effect-errors.js';

/**
 * Base error class for all scanner errors
 * @deprecated Use Effect-compatible errors from './effect-errors' for new code
 */
export class ScanError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly recoverable: boolean = false,
        public readonly context?: Record<string, any>
    ) {
        super(message);
        this.name = 'ScanError';

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * React was not detected on the page
 * @deprecated Use EffectReactNotDetectedError or ReactNotDetected from effect-errors for Effect workflows
 */
export class ReactNotDetectedError extends ScanError {
    constructor(url: string) {
        super(
            'React was not detected on this page. This tool only works with React applications.',
            'REACT_NOT_FOUND',
            false,
            { url }
        );
        this.name = 'ReactNotDetectedError';
    }
}

/**
 * Page navigation timed out
 * @deprecated Use EffectNavigationTimeoutError or NavigationTimeout from effect-errors for Effect workflows
 */
export class NavigationTimeoutError extends ScanError {
    constructor(url: string, timeout: number) {
        super(
            `Page navigation timed out after ${timeout}ms`,
            'NAV_TIMEOUT',
            true,
            { url, timeout }
        );
        this.name = 'NavigationTimeoutError';
    }
}

/**
 * Browser context was destroyed during scan
 * @deprecated Use EffectContextDestroyedError or ContextDestroyed from effect-errors for Effect workflows
 */
export class ContextDestroyedError extends ScanError {
    constructor(message?: string) {
        super(
            message || 'Browser execution context was destroyed. This may be due to page navigation or heavy libraries.',
            'CONTEXT_DESTROYED',
            true
        );
        this.name = 'ContextDestroyedError';
    }
}

/**
 * Scanner bundle failed to inject or execute
 * @deprecated Use EffectScannerInjectionError or ScannerInjectionFailed from effect-errors for Effect workflows
 */
export class ScannerInjectionError extends ScanError {
    constructor(reason: string) {
        super(
            `Failed to inject or execute scanner: ${reason}`,
            'SCANNER_INJECTION_FAILED',
            true,
            { reason }
        );
        this.name = 'ScannerInjectionError';
    }
}

/**
 * Scan exceeded maximum retry attempts
 * @deprecated Use EffectMaxRetriesExceededError or MaxRetriesExceeded from effect-errors for Effect workflows
 */
export class MaxRetriesExceededError extends ScanError {
    constructor(attempts: number, lastError?: Error) {
        super(
            `Failed to scan after ${attempts} attempts. Last error: ${lastError?.message || 'Unknown'}`,
            'MAX_RETRIES_EXCEEDED',
            false,
            { attempts, lastError: lastError?.message }
        );
        this.name = 'MaxRetriesExceededError';
    }
}

/**
 * Invalid configuration provided
 * @deprecated Use EffectConfigurationError or InvalidConfiguration from effect-errors for Effect workflows
 */
export class ConfigurationError extends ScanError {
    constructor(message: string, invalidField?: string) {
        super(
            message,
            'INVALID_CONFIGURATION',
            false,
            { invalidField }
        );
        this.name = 'ConfigurationError';
    }
}

/**
 * Invalid URL provided
 * @deprecated Use EffectInvalidUrlError or InvalidUrl from effect-errors for Effect workflows
 */
export class InvalidUrlError extends ScanError {
    constructor(url: string, reason?: string) {
        super(
            `Invalid URL: ${url}${reason ? ` (${reason})` : ''}`,
            'INVALID_URL',
            false,
            { url, reason }
        );
        this.name = 'InvalidUrlError';
    }
}

/**
 * File system operation failed
 * @deprecated Use EffectFileSystemError or FileSystemFailed from effect-errors for Effect workflows
 */
export class FileSystemError extends ScanError {
    constructor(operation: string, path: string, reason?: string) {
        super(
            `File system ${operation} failed for ${path}${reason ? `: ${reason}` : ''}`,
            'FILE_SYSTEM_ERROR',
            false,
            { operation, path, reason }
        );
        this.name = 'FileSystemError';
    }
}

/**
 * Browser launch failed
 * @deprecated Use EffectBrowserLaunchError or BrowserLaunchFailed from effect-errors for Effect workflows
 */
export class BrowserLaunchError extends ScanError {
    constructor(browserType: string, reason?: string) {
        super(
            `Failed to launch ${browserType} browser${reason ? `: ${reason}` : ''}`,
            'BROWSER_LAUNCH_FAILED',
            false,
            { browserType, reason }
        );
        this.name = 'BrowserLaunchError';
    }
}

/**
 * Service is in an invalid state for the requested operation
 * @deprecated Use EffectServiceStateError or InvalidServiceState from effect-errors for Effect workflows
 */
export class ServiceStateError extends ScanError {
    constructor(service: string, expectedState: string, actualState: string) {
        super(
            `${service} is ${actualState}, expected ${expectedState}`,
            'SERVICE_STATE_ERROR',
            false,
            { service, expectedState, actualState }
        );
        this.name = 'ServiceStateError';
    }
}

/**
 * Scan data is invalid or missing
 * @deprecated Use EffectScanDataError or InvalidScanData from effect-errors for Effect workflows
 */
export class ScanDataError extends ScanError {
    constructor(reason: string) {
        super(
            `Invalid scan data: ${reason}`,
            'SCAN_DATA_ERROR',
            false,
            { reason }
        );
        this.name = 'ScanDataError';
    }
}
