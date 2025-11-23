/**
 * Error handling for the scanner
 */

/**
 * Base error class for all scanner errors
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
