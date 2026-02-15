/**
 * Effect-compatible error types for AI Auditor services
 *
 * These error types are used with Effect's typed error channel
 * for exhaustive error handling in Effect workflows.
 */
import { Data } from 'effect';

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
