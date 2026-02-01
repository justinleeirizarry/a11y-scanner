/**
 * Composed Application Layer
 *
 * This module exports pre-composed layers for common use cases.
 */
import { Layer } from 'effect';
import { BrowserServiceLive, BrowserServiceManual, ScannerServiceLive, ResultsProcessorServiceLive } from './layers.js';

// ============================================================================
// Composed Layers
// ============================================================================

/**
 * Full application layer with scoped browser lifecycle
 *
 * Use this for the standard scan workflow where the browser should
 * automatically close when the Effect scope ends.
 *
 * @example
 * ```ts
 * const result = yield* pipe(
 *   scanEffect,
 *   Effect.provide(AppLayer),
 *   Effect.scoped
 * );
 * ```
 */
export const AppLayer = Layer.mergeAll(
    BrowserServiceLive,
    ScannerServiceLive,
    ResultsProcessorServiceLive
);

/**
 * Application layer with manual browser lifecycle
 *
 * Use this when you need to control when the browser opens and closes,
 * such as in long-running processes or when reusing the browser.
 *
 * @example
 * ```ts
 * const result = yield* pipe(
 *   scanEffect,
 *   Effect.provide(AppLayerManual)
 * );
 * // Browser stays open until you explicitly call browser.close()
 * ```
 */
export const AppLayerManual = Layer.mergeAll(
    BrowserServiceManual,
    ScannerServiceLive,
    ResultsProcessorServiceLive
);

/**
 * Minimal layer for testing - only includes non-browser services
 *
 * Use this for unit tests where you want to mock the browser service.
 *
 * @example
 * ```ts
 * const mockBrowserLayer = Layer.succeed(BrowserService, mockBrowserService);
 * const testLayer = Layer.merge(mockBrowserLayer, CoreServicesLayer);
 * ```
 */
export const CoreServicesLayer = Layer.mergeAll(
    ScannerServiceLive,
    ResultsProcessorServiceLive
);

// ============================================================================
// Re-exports for convenience
// ============================================================================

export { BrowserServiceLive, BrowserServiceManual, ScannerServiceLive, ResultsProcessorServiceLive };
