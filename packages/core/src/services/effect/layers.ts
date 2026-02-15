/**
 * Effect Service Layers - Implements services as Effect Layers
 *
 * These layers provide the actual implementations of the service interfaces.
 * They can be composed together to create the full application layer.
 *
 * All services now return Effects directly, so layers are simple pass-throughs.
 */
import { Effect, Layer } from 'effect';
import {
    BrowserService as BrowserServiceClass,
    createBrowserService,
} from '../browser/index.js';
import { createScannerService } from '../scanner/index.js';
import { createResultsProcessorService } from '../processor/index.js';
import {
    BrowserService,
    ScannerService,
    ResultsProcessorService,
    type EffectBrowserService,
    type EffectScannerService,
    type EffectResultsProcessorService,
} from './tags.js';

// ============================================================================
// Browser Service Layer
// ============================================================================

/**
 * BrowserService layer with scoped lifecycle
 *
 * The service now returns Effects directly, so no wrapping is needed.
 * The browser is automatically closed when the scope ends.
 */
export const BrowserServiceLive = Layer.scoped(
    BrowserService,
    Effect.gen(function* () {
        const instance = createBrowserService() as BrowserServiceClass;

        // Register cleanup finalizer - runs when scope ends
        yield* Effect.addFinalizer(() =>
            Effect.catchAll(instance.close(), () => Effect.void)
        );

        return instance as EffectBrowserService;
    })
);

// ============================================================================
// Scanner Service Layer
// ============================================================================

/**
 * ScannerService layer
 *
 * The service now returns Effects directly, so no wrapping is needed.
 * This is a simple pass-through layer.
 */
export const ScannerServiceLive = Layer.succeed(
    ScannerService,
    createScannerService() as EffectScannerService
);

// ============================================================================
// Results Processor Service Layer
// ============================================================================

/**
 * ResultsProcessorService layer
 *
 * The service now returns Effects directly, so no wrapping is needed.
 * This is a simple pass-through layer.
 */
export const ResultsProcessorServiceLive = Layer.succeed(
    ResultsProcessorService,
    createResultsProcessorService() as EffectResultsProcessorService
);

// ============================================================================
// Non-scoped Browser Service Layer (for manual lifecycle management)
// ============================================================================

/**
 * Creates a non-scoped BrowserService layer
 *
 * Use this when you want to manage the browser lifecycle manually
 * rather than having it automatically close when the scope ends.
 */
export const BrowserServiceManual = Layer.succeed(
    BrowserService,
    createBrowserService() as EffectBrowserService
);

