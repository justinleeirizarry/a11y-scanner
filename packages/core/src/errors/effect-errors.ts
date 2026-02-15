/**
 * Effect-compatible error types using Data.TaggedError
 *
 * These error types can be used with Effect's typed error channel
 * for exhaustive error handling in Effect workflows.
 */
import { Data } from 'effect';

/**
 * React was not detected on the page
 */
export class EffectReactNotDetectedError extends Data.TaggedError('ReactNotDetectedError')<{
    readonly url: string;
}> {}

/**
 * Browser launch failed
 */
export class EffectBrowserLaunchError extends Data.TaggedError('BrowserLaunchError')<{
    readonly browserType: string;
    readonly reason?: string;
}> {}

/**
 * Browser is not in the expected state
 */
export class EffectBrowserNotLaunchedError extends Data.TaggedError('BrowserNotLaunchedError')<{
    readonly operation: string;
}> {}

/**
 * Browser is already launched when it shouldn't be
 */
export class EffectBrowserAlreadyLaunchedError extends Data.TaggedError(
    'BrowserAlreadyLaunchedError'
)<Record<string, never>> {}

/**
 * Page navigation timed out
 */
export class EffectNavigationTimeoutError extends Data.TaggedError('NavigationTimeoutError')<{
    readonly url: string;
    readonly timeout: number;
}> {}

/**
 * Page navigation failed
 */
export class EffectNavigationError extends Data.TaggedError('NavigationError')<{
    readonly url: string;
    readonly reason?: string;
}> {}

/**
 * Browser context was destroyed during scan
 */
export class EffectContextDestroyedError extends Data.TaggedError('ContextDestroyedError')<{
    readonly message?: string;
}> {}

/**
 * Scanner bundle failed to inject or execute
 */
export class EffectScannerInjectionError extends Data.TaggedError('ScannerInjectionError')<{
    readonly reason: string;
}> {}

/**
 * Scan exceeded maximum retry attempts
 */
export class EffectMaxRetriesExceededError extends Data.TaggedError('MaxRetriesExceededError')<{
    readonly attempts: number;
    readonly lastError?: string;
}> {}

/**
 * Invalid configuration provided
 */
export class EffectConfigurationError extends Data.TaggedError('ConfigurationError')<{
    readonly message: string;
    readonly invalidField?: string;
}> {}

/**
 * Invalid URL provided
 */
export class EffectInvalidUrlError extends Data.TaggedError('InvalidUrlError')<{
    readonly url: string;
    readonly reason?: string;
}> {}

/**
 * File system operation failed
 */
export class EffectFileSystemError extends Data.TaggedError('FileSystemError')<{
    readonly operation: string;
    readonly path: string;
    readonly reason?: string;
}> {}

/**
 * Service is in an invalid state for the requested operation
 */
export class EffectServiceStateError extends Data.TaggedError('ServiceStateError')<{
    readonly service: string;
    readonly expectedState: string;
    readonly actualState: string;
}> {}

/**
 * Scan data is invalid or missing
 */
export class EffectScanDataError extends Data.TaggedError('ScanDataError')<{
    readonly reason: string;
}> {}

/**
 * Union of all browser-related errors
 */
export type BrowserErrors =
    | EffectBrowserLaunchError
    | EffectBrowserNotLaunchedError
    | EffectBrowserAlreadyLaunchedError
    | EffectNavigationTimeoutError
    | EffectNavigationError
    | EffectContextDestroyedError;

/**
 * Union of all scan-related errors
 */
export type ScanErrors =
    | EffectReactNotDetectedError
    | EffectScannerInjectionError
    | EffectMaxRetriesExceededError
    | EffectScanDataError;

/**
 * Union of all validation errors
 */
export type ValidationErrors = EffectConfigurationError | EffectInvalidUrlError;

/**
 * Union of all errors for the scan workflow
 */
export type ScanWorkflowErrors =
    | BrowserErrors
    | ScanErrors
    | ValidationErrors
    | EffectServiceStateError
    | EffectFileSystemError;

