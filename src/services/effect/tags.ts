/**
 * Effect Service Tags - Defines service interfaces for dependency injection
 *
 * These tags define the contract for each service in the Effect ecosystem.
 * They enable type-safe dependency injection and make services testable.
 */
import { Context, Effect } from 'effect';
import type { Page, Browser } from 'playwright';
import type {
    BrowserScanData,
    ScanResults,
} from '../../types.js';
import type { BrowserServiceConfig, StabilityCheckResult, NavigateOptions } from '../browser/types.js';
import type { ScanExecutionOptions } from '../scanner/types.js';
import type { ScanMetadata, MCPToolContent, MCPFormatOptions, CIResult } from '../processor/types.js';
import {
    EffectBrowserLaunchError,
    EffectBrowserNotLaunchedError,
    EffectBrowserAlreadyLaunchedError,
    EffectNavigationError,
    EffectReactNotDetectedError,
    EffectScannerInjectionError,
    EffectScanDataError,
    type BrowserErrors,
    type ScanErrors,
} from '../../errors/effect-errors.js';

// ============================================================================
// Browser Service
// ============================================================================

/**
 * Browser Service interface for Effect
 *
 * Manages browser lifecycle and page operations.
 */
export interface EffectBrowserService {
    /**
     * Launch a browser with the specified configuration
     */
    readonly launch: (
        config: BrowserServiceConfig
    ) => Effect.Effect<void, EffectBrowserLaunchError | EffectBrowserAlreadyLaunchedError>;

    /**
     * Get the current page instance
     */
    readonly getPage: () => Effect.Effect<Page, EffectBrowserNotLaunchedError>;

    /**
     * Get the current browser instance
     */
    readonly getBrowser: () => Effect.Effect<Browser, EffectBrowserNotLaunchedError>;

    /**
     * Check if browser is launched
     */
    readonly isLaunched: () => Effect.Effect<boolean>;

    /**
     * Navigate to a URL
     */
    readonly navigate: (
        url: string,
        options?: NavigateOptions
    ) => Effect.Effect<void, EffectBrowserNotLaunchedError | EffectNavigationError>;

    /**
     * Wait for the page to stabilize
     */
    readonly waitForStability: () => Effect.Effect<StabilityCheckResult, EffectBrowserNotLaunchedError>;

    /**
     * Detect if React is present on the page
     */
    readonly detectReact: () => Effect.Effect<boolean, EffectBrowserNotLaunchedError>;

    /**
     * Close the browser and clean up resources
     */
    readonly close: () => Effect.Effect<void>;
}

/**
 * Tag for BrowserService dependency injection
 */
export class BrowserService extends Context.Tag('BrowserService')<
    BrowserService,
    EffectBrowserService
>() {}

// ============================================================================
// Scanner Service
// ============================================================================

/**
 * Scanner Service interface for Effect
 *
 * Handles injecting and executing the scanner bundle in pages.
 */
export interface EffectScannerService {
    /**
     * Check if the scanner bundle is already injected
     */
    readonly isBundleInjected: (page: Page) => Effect.Effect<boolean>;

    /**
     * Inject the scanner bundle into the page
     */
    readonly injectBundle: (page: Page) => Effect.Effect<void, EffectScannerInjectionError>;

    /**
     * Run the scan on the page
     */
    readonly scan: (
        page: Page,
        options?: ScanExecutionOptions
    ) => Effect.Effect<BrowserScanData, EffectScannerInjectionError | EffectScanDataError>;
}

/**
 * Tag for ScannerService dependency injection
 */
export class ScannerService extends Context.Tag('ScannerService')<
    ScannerService,
    EffectScannerService
>() {}

// ============================================================================
// Results Processor Service
// ============================================================================

/**
 * Results Processor Service interface for Effect
 *
 * Handles all results transformation and formatting.
 */
export interface EffectResultsProcessorService {
    /**
     * Process raw scan data into structured results
     */
    readonly process: (data: BrowserScanData, metadata: ScanMetadata) => Effect.Effect<ScanResults>;

    /**
     * Format results as JSON string
     */
    readonly formatAsJSON: (results: ScanResults, pretty?: boolean) => Effect.Effect<string>;

    /**
     * Format results for MCP output
     */
    readonly formatForMCP: (
        results: ScanResults,
        options?: MCPFormatOptions
    ) => Effect.Effect<MCPToolContent[]>;

    /**
     * Format results for CI mode with threshold checking
     */
    readonly formatForCI: (results: ScanResults, threshold: number) => Effect.Effect<CIResult>;
}

/**
 * Tag for ResultsProcessorService dependency injection
 */
export class ResultsProcessorService extends Context.Tag('ResultsProcessorService')<
    ResultsProcessorService,
    EffectResultsProcessorService
>() {}

// ============================================================================
// Convenience type aliases
// ============================================================================

/**
 * All service dependencies for the scan workflow
 */
export type ScanWorkflowServices = BrowserService | ScannerService | ResultsProcessorService;
