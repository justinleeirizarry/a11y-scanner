/**
 * Shared Types for Stagehand Services
 */
import type { Effect } from 'effect';
import type { Page } from 'playwright';
import type {
    StagehandKeyboardConfig,
    StagehandKeyboardResults,
    TreeAnalysisConfig,
    TreeAnalysisResult,
    WcagAuditOptions,
    WcagAuditResult,
} from '../types.js';
import type {
    EffectKeyboardTestInitError,
    EffectKeyboardTestError,
    EffectKeyboardTestNotInitializedError,
    EffectTreeAnalysisInitError,
    EffectTreeAnalysisError,
    EffectTreeAnalysisNotInitializedError,
    EffectWcagAuditInitError,
    EffectWcagAuditError,
    EffectWcagAuditNotInitializedError,
} from '../errors.js';

/**
 * Effect-first Keyboard Test Service interface
 */
export interface IKeyboardTestService {
    /**
     * Initialize the keyboard test service
     */
    init(config?: StagehandKeyboardConfig): Effect.Effect<void, EffectKeyboardTestInitError>;

    /**
     * Run keyboard navigation tests on a URL
     */
    test(url: string): Effect.Effect<
        StagehandKeyboardResults,
        EffectKeyboardTestNotInitializedError | EffectKeyboardTestError
    >;

    /**
     * Get the underlying page instance
     */
    getPage(): Effect.Effect<Page, EffectKeyboardTestNotInitializedError>;

    /**
     * Close the service and clean up resources
     */
    close(): Effect.Effect<void>;

    /**
     * Check if service is initialized
     */
    isInitialized(): Effect.Effect<boolean>;
}

/**
 * Effect-first Tree Analysis Service interface
 */
export interface ITreeAnalysisService {
    /**
     * Initialize the tree analysis service
     */
    init(config?: TreeAnalysisConfig): Effect.Effect<void, EffectTreeAnalysisInitError>;

    /**
     * Analyze accessibility tree of a URL
     */
    analyze(url: string): Effect.Effect<
        TreeAnalysisResult,
        EffectTreeAnalysisNotInitializedError | EffectTreeAnalysisError
    >;

    /**
     * Get the underlying page instance
     */
    getPage(): Effect.Effect<Page, EffectTreeAnalysisNotInitializedError>;

    /**
     * Close the service and clean up resources
     */
    close(): Effect.Effect<void>;

    /**
     * Check if service is initialized
     */
    isInitialized(): Effect.Effect<boolean>;
}

/**
 * Effect-first WCAG Audit Service interface
 */
export interface IWcagAuditService {
    /**
     * Initialize the WCAG audit service
     */
    init(options?: WcagAuditOptions): Effect.Effect<void, EffectWcagAuditInitError>;

    /**
     * Run a WCAG audit on a URL
     */
    audit(url: string): Effect.Effect<
        WcagAuditResult,
        EffectWcagAuditNotInitializedError | EffectWcagAuditError
    >;

    /**
     * Get the underlying page instance
     */
    getPage(): Effect.Effect<Page, EffectWcagAuditNotInitializedError>;

    /**
     * Close the service and clean up resources
     */
    close(): Effect.Effect<void>;

    /**
     * Check if service is initialized
     */
    isInitialized(): Effect.Effect<boolean>;
}
