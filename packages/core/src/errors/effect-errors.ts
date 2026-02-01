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

// ============================================================================
// Test Generation Errors
// ============================================================================

/**
 * Test generation service is not initialized
 */
export class EffectTestGenNotInitializedError extends Data.TaggedError('TestGenNotInitializedError')<{
    readonly operation?: string;
}> {}

/**
 * Test generation service initialization failed
 */
export class EffectTestGenInitError extends Data.TaggedError('TestGenInitError')<{
    readonly reason: string;
}> {}

/**
 * Test generation navigation failed
 */
export class EffectTestGenNavigationError extends Data.TaggedError('TestGenNavigationError')<{
    readonly url: string;
    readonly reason: string;
}> {}

/**
 * Test generation element discovery failed
 */
export class EffectTestGenDiscoveryError extends Data.TaggedError('TestGenDiscoveryError')<{
    readonly reason: string;
}> {}

// ============================================================================
// Stagehand Keyboard Test Errors
// ============================================================================

/**
 * Keyboard test service initialization failed
 */
export class EffectKeyboardTestInitError extends Data.TaggedError('KeyboardTestInitError')<{
    readonly reason: string;
}> {}

/**
 * Keyboard test operation failed
 */
export class EffectKeyboardTestError extends Data.TaggedError('KeyboardTestError')<{
    readonly operation: string;
    readonly reason: string;
}> {}

/**
 * Keyboard test service is not initialized
 */
export class EffectKeyboardTestNotInitializedError extends Data.TaggedError('KeyboardTestNotInitializedError')<{
    readonly operation?: string;
}> {}

// ============================================================================
// Stagehand Tree Analysis Errors
// ============================================================================

/**
 * Tree analysis service initialization failed
 */
export class EffectTreeAnalysisInitError extends Data.TaggedError('TreeAnalysisInitError')<{
    readonly reason: string;
}> {}

/**
 * Tree analysis operation failed
 */
export class EffectTreeAnalysisError extends Data.TaggedError('TreeAnalysisError')<{
    readonly reason: string;
}> {}

/**
 * Tree analysis service is not initialized
 */
export class EffectTreeAnalysisNotInitializedError extends Data.TaggedError('TreeAnalysisNotInitializedError')<{
    readonly operation?: string;
}> {}

// ============================================================================
// Stagehand WCAG Audit Errors
// ============================================================================

/**
 * WCAG audit service initialization failed
 */
export class EffectWcagAuditInitError extends Data.TaggedError('WcagAuditInitError')<{
    readonly reason: string;
}> {}

/**
 * WCAG audit operation failed
 */
export class EffectWcagAuditError extends Data.TaggedError('WcagAuditError')<{
    readonly operation: string;
    readonly reason: string;
}> {}

/**
 * WCAG audit service is not initialized
 */
export class EffectWcagAuditNotInitializedError extends Data.TaggedError('WcagAuditNotInitializedError')<{
    readonly operation?: string;
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
 * Union of all test generation errors
 */
export type TestGenErrors =
    | EffectTestGenNotInitializedError
    | EffectTestGenInitError
    | EffectTestGenNavigationError
    | EffectTestGenDiscoveryError;

/**
 * Union of all keyboard test errors
 */
export type KeyboardTestErrors =
    | EffectKeyboardTestInitError
    | EffectKeyboardTestError
    | EffectKeyboardTestNotInitializedError;

/**
 * Union of all tree analysis errors
 */
export type TreeAnalysisErrors =
    | EffectTreeAnalysisInitError
    | EffectTreeAnalysisError
    | EffectTreeAnalysisNotInitializedError;

/**
 * Union of all WCAG audit errors
 */
export type WcagAuditErrors =
    | EffectWcagAuditInitError
    | EffectWcagAuditError
    | EffectWcagAuditNotInitializedError;

/**
 * Union of all Stagehand-related errors
 */
export type StagehandErrors =
    | TestGenErrors
    | KeyboardTestErrors
    | TreeAnalysisErrors
    | WcagAuditErrors;

/**
 * Union of all errors for the scan workflow
 */
export type ScanWorkflowErrors =
    | BrowserErrors
    | ScanErrors
    | ValidationErrors
    | EffectServiceStateError
    | EffectFileSystemError
    | StagehandErrors;

