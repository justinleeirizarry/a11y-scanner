/**
 * Effect Service Layers - Implements services as Effect Layers
 *
 * These layers provide the actual implementations of the service interfaces.
 * They can be composed together to create the full application layer.
 */
import { Effect, Layer, pipe } from 'effect';
import {
    BrowserService as BrowserServiceClass,
    createBrowserService,
} from '../browser/index.js';
import {
    ScannerService as ScannerServiceClass,
    createScannerService,
} from '../scanner/index.js';
import {
    ResultsProcessorService as ResultsProcessorServiceClass,
    createResultsProcessorService,
} from '../processor/index.js';
import {
    BrowserService,
    ScannerService,
    ResultsProcessorService,
    type EffectBrowserService,
    type EffectScannerService,
    type EffectResultsProcessorService,
} from './tags.js';
import {
    EffectBrowserLaunchError,
    EffectBrowserNotLaunchedError,
    EffectBrowserAlreadyLaunchedError,
    EffectNavigationError,
    EffectScannerInjectionError,
    EffectScanDataError,
} from '../../errors/effect-errors.js';
import { BrowserLaunchError, ServiceStateError, ScanDataError } from '../../errors/index.js';

// ============================================================================
// Browser Service Layer
// ============================================================================

/**
 * Creates an Effect-wrapped browser service from an instance
 *
 * This helper extracts the common logic for wrapping BrowserService methods.
 */
const createEffectBrowserService = (instance: BrowserServiceClass): EffectBrowserService => ({
    launch: (config) =>
        Effect.tryPromise({
            try: () => instance.launch(config),
            catch: (error): EffectBrowserLaunchError | EffectBrowserAlreadyLaunchedError => {
                if (error instanceof ServiceStateError) {
                    return new EffectBrowserAlreadyLaunchedError({});
                }
                if (error instanceof BrowserLaunchError) {
                    return new EffectBrowserLaunchError({
                        browserType: config.browserType,
                        reason: error.message,
                    });
                }
                return new EffectBrowserLaunchError({
                    browserType: config.browserType,
                    reason: error instanceof Error ? error.message : String(error),
                });
            },
        }),

    getPage: () =>
        Effect.sync(() => instance.getPage()).pipe(
            Effect.flatMap((page) =>
                page
                    ? Effect.succeed(page)
                    : Effect.fail(new EffectBrowserNotLaunchedError({ operation: 'getPage' }))
            )
        ),

    getBrowser: () =>
        Effect.sync(() => instance.getBrowser()).pipe(
            Effect.flatMap((browser) =>
                browser
                    ? Effect.succeed(browser)
                    : Effect.fail(new EffectBrowserNotLaunchedError({ operation: 'getBrowser' }))
            )
        ),

    isLaunched: () => Effect.sync(() => instance.isLaunched()),

    navigate: (url, options) =>
        Effect.tryPromise({
            try: () => instance.navigate(url, options),
            catch: (error) => {
                if (error instanceof ServiceStateError) {
                    return new EffectBrowserNotLaunchedError({ operation: 'navigate' });
                }
                return new EffectNavigationError({
                    url,
                    reason: error instanceof Error ? error.message : String(error),
                });
            },
        }),

    waitForStability: () =>
        Effect.tryPromise({
            try: () => instance.waitForStability(),
            catch: (error) => {
                if (error instanceof ServiceStateError) {
                    return new EffectBrowserNotLaunchedError({ operation: 'waitForStability' });
                }
                return new EffectBrowserNotLaunchedError({ operation: 'waitForStability' });
            },
        }),

    detectReact: () =>
        Effect.tryPromise({
            try: () => instance.detectReact(),
            catch: (error) => {
                if (error instanceof ServiceStateError) {
                    return new EffectBrowserNotLaunchedError({ operation: 'detectReact' });
                }
                return new EffectBrowserNotLaunchedError({ operation: 'detectReact' });
            },
        }),

    close: () => Effect.promise(() => instance.close()),
});

/**
 * Creates an Effect-wrapped BrowserService with scoped lifecycle
 *
 * This layer wraps the existing BrowserService class with Effect error handling.
 * The browser is automatically closed when the scope ends.
 */
export const BrowserServiceLive = Layer.scoped(
    BrowserService,
    Effect.gen(function* () {
        const instance = createBrowserService() as BrowserServiceClass;

        // Register cleanup finalizer - runs when scope ends
        yield* Effect.addFinalizer(() =>
            Effect.promise(async () => {
                await instance.close().catch(() => {});
            })
        );

        return createEffectBrowserService(instance);
    })
);

// ============================================================================
// Scanner Service Layer
// ============================================================================

/**
 * Creates an Effect-wrapped ScannerService
 *
 * This layer wraps the existing ScannerService class with Effect error handling.
 */
export const ScannerServiceLive = Layer.succeed(
    ScannerService,
    (() => {
        const instance = createScannerService() as ScannerServiceClass;

        const service: EffectScannerService = {
            isBundleInjected: (page) => Effect.promise(() => instance.isBundleInjected(page)),

            injectBundle: (page) =>
                Effect.tryPromise({
                    try: () => instance.injectBundle(page),
                    catch: (error) =>
                        new EffectScannerInjectionError({
                            reason: error instanceof Error ? error.message : String(error),
                        }),
                }),

            scan: (page, options) =>
                Effect.tryPromise({
                    try: () => instance.scan(page, options),
                    catch: (error) => {
                        if (error instanceof ScanDataError) {
                            return new EffectScanDataError({ reason: error.message });
                        }
                        return new EffectScannerInjectionError({
                            reason: error instanceof Error ? error.message : String(error),
                        });
                    },
                }),
        };

        return service;
    })()
);

// ============================================================================
// Results Processor Service Layer
// ============================================================================

/**
 * Creates an Effect-wrapped ResultsProcessorService
 *
 * This layer wraps the existing ResultsProcessorService class with Effect.
 * Since the processor is pure (no side effects), errors are unlikely.
 */
export const ResultsProcessorServiceLive = Layer.succeed(
    ResultsProcessorService,
    (() => {
        const instance = createResultsProcessorService() as ResultsProcessorServiceClass;

        const service: EffectResultsProcessorService = {
            process: (data, metadata) => Effect.sync(() => instance.process(data, metadata)),

            formatAsJSON: (results, pretty) => Effect.sync(() => instance.formatAsJSON(results, pretty)),

            formatForMCP: (results, options) => Effect.sync(() => instance.formatForMCP(results, options)),

            formatForCI: (results, threshold) => Effect.sync(() => instance.formatForCI(results, threshold)),
        };

        return service;
    })()
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
    createEffectBrowserService(createBrowserService() as BrowserServiceClass)
);
