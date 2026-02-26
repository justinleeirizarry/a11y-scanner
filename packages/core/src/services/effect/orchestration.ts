/**
 * Effect-based Orchestration
 *
 * This module provides Effect-based scan workflows with proper error typing
 * and automatic resource management.
 */
import { Effect, Exit, Cause, Chunk, Option, pipe, type Layer } from 'effect';
import { mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';
import type { ScanResults, BrowserScanData } from '../../types.js';
import type { BaseScanOptions, ScanOperationResult } from '../orchestration/types.js';
import { logger } from '../../utils/logger.js';
import {
    BrowserService,
    ScannerService,
    ResultsProcessorService,
} from './tags.js';
import {
    EffectReactNotDetectedError,
    EffectFileSystemError,
    EffectScanDataError,
    type BrowserErrors,
    type ScanErrors,
} from '../../errors/effect-errors.js';
import { ScanError, formatTaggedError } from '../../errors/scan-error.js';
import { createRetrySchedule } from '../../utils/effect-retry.js';
import { getConfig } from '../../config/index.js';

// ============================================================================
// Types
// ============================================================================

/**
 * Options for the Effect-based scan operation
 * Uses the shared BaseScanOptions
 */
export type EffectScanOptions = BaseScanOptions;

/**
 * Result of the Effect-based scan operation
 * Uses the shared ScanOperationResult
 */
export type EffectScanResult = ScanOperationResult;

/**
 * Union of all errors that can occur during the scan workflow
 */
export type PerformScanError = BrowserErrors | ScanErrors | EffectReactNotDetectedError | EffectFileSystemError;

// ============================================================================
// Scan Workflow
// ============================================================================

/**
 * Perform an accessibility scan using Effect
 *
 * This is the main Effect-based scan workflow. It:
 * 1. Launches the browser
 * 2. Navigates to the URL
 * 3. Waits for page stability
 * 4. Checks for React
 * 5. Runs the scan with retry logic
 * 6. Processes the results
 * 7. Optionally writes to file and checks CI threshold
 *
 * The browser is automatically cleaned up when the Effect completes.
 *
 * @example
 * ```ts
 * const result = yield* pipe(
 *   performScan({
 *     url: 'http://localhost:3000',
 *     browser: 'chromium',
 *     headless: true
 *   }),
 *   Effect.provide(AppLayer),
 *   Effect.scoped
 * );
 * ```
 */
export const performScan = (
    options: EffectScanOptions
): Effect.Effect<
    EffectScanResult,
    PerformScanError,
    BrowserService | ScannerService | ResultsProcessorService
> =>
    Effect.gen(function* () {
        const browser = yield* BrowserService;
        const scanner = yield* ScannerService;
        const processor = yield* ResultsProcessorService;
        const config = getConfig();

        const {
            url,
            browser: browserType,
            headless,
            tags,
            includeKeyboardTests,
            outputFile,
            ciMode,
            ciThreshold = 0,
            reactBundlePath,
            mobile,
            disableRules,
            exclude,
        } = options;

        // Launch browser (with mobile viewport if requested)
        yield* browser.launch({
            browserType,
            headless,
            ...(mobile ? {
                viewport: { width: 375, height: 812 },
                isMobile: true,
                hasTouch: true,
            } : {}),
        });

        // Navigate to URL
        yield* browser.navigate(url);

        // Wait for page stability (important for SPAs)
        yield* browser.waitForStability();

        // Check for React (only fail if explicitly required)
        const hasReact = yield* browser.detectReact();
        if (options.requireReact && !hasReact) {
            return yield* Effect.fail(new EffectReactNotDetectedError({ url }));
        }
        if (!hasReact) {
            logger.debug('React not detected on page - running generic accessibility scan');
        }

        // Get page for scanning
        const page = yield* browser.getPage();

        // Create retry schedule for scan
        const retrySchedule = createRetrySchedule({
            maxRetries: config.scan.maxRetries,
            delayMs: config.scan.retryDelayBase,
            backoff: 'linear',
        });

        // Run scan with retry logic
        let rawData = yield* pipe(
            scanner.scan(page, { tags, includeKeyboardTests, disableRules, exclude }),
            Effect.retry(retrySchedule),
            Effect.tap(() => Effect.sync(() => logger.info('Scan completed successfully')))
        );

        // If React detected and React bundle path provided, inject and attribute
        logger.debug(`React detected: ${hasReact}, bundle path: ${reactBundlePath ?? 'not provided'}`);
        if (hasReact && reactBundlePath) {
            rawData = yield* attributeWithReactPlugin(page, rawData, reactBundlePath);
        }

        // Process results
        const results = yield* processor.process(rawData, {
            url,
            browser: browserType,
        });

        // Build result
        const result: EffectScanResult = { results };

        // Handle CI mode
        if (ciMode) {
            const ciResult = yield* processor.formatForCI(results, ciThreshold);
            result.ciPassed = ciResult.passed;
            logger.info(ciResult.message);
        }

        // Handle file output
        if (outputFile) {
            yield* writeResultsToFile(results, outputFile, processor);
            result.outputFile = outputFile;
        }

        return result;
    });

/**
 * Perform scan with explicit cleanup
 *
 * This wraps performScan with Effect.ensuring to guarantee
 * browser cleanup even if the scan fails.
 *
 * NOTE: Use this with `AppLayerManual` (non-scoped browser layer).
 * If using `AppLayer` (scoped), prefer `performScan` with `Effect.scoped`
 * to avoid double cleanup.
 *
 * @example
 * ```ts
 * const result = yield* pipe(
 *   performScanWithCleanup(options),
 *   Effect.provide(AppLayerManual)
 * );
 * ```
 */
export const performScanWithCleanup = (
    options: EffectScanOptions
): Effect.Effect<
    EffectScanResult,
    PerformScanError,
    BrowserService | ScannerService | ResultsProcessorService
> =>
    Effect.gen(function* () {
        const browser = yield* BrowserService;

        return yield* pipe(
            performScan(options),
            Effect.ensuring(browser.close())
        );
    });

// ============================================================================
// React Plugin Attribution
// ============================================================================

/**
 * Inject the React plugin bundle and attribute violations to React components
 *
 * This injects react-bundle.js into the page, which uses Bippy to traverse
 * the React Fiber tree and map DOM elements to component names.
 */
const attributeWithReactPlugin = (
    page: import('playwright').Page,
    rawData: BrowserScanData,
    reactBundlePath: string
): Effect.Effect<BrowserScanData, EffectScanDataError> =>
    Effect.gen(function* () {
        // Inject the React plugin bundle
        yield* Effect.tryPromise({
            try: () => page.addScriptTag({ path: reactBundlePath }),
            catch: (error) => {
                const msg = error instanceof Error ? error.message : String(error);
                logger.warn(`Failed to inject React bundle: ${msg}`);
                return new EffectScanDataError({
                    reason: `Failed to inject React plugin bundle: ${msg}`
                });
            }
        });

        // Verify ReactA11yPlugin is available
        const hasPlugin = yield* Effect.tryPromise({
            try: () => page.evaluate(() => typeof (window as any).ReactA11yPlugin !== 'undefined'),
            catch: () => new EffectScanDataError({ reason: 'Failed to verify React plugin injection' })
        });

        if (!hasPlugin) {
            logger.warn('React plugin bundle did not expose ReactA11yPlugin on window');
            return rawData;
        }

        logger.info('React plugin injected, attributing violations to components...');

        // Call ReactA11yPlugin.attributeViolations in browser context
        const attributed = yield* Effect.tryPromise({
            try: () => page.evaluate(
                ({ violations, passes, incomplete }) => {
                    return (window as any).ReactA11yPlugin.attributeViolations(
                        violations,
                        passes || [],
                        incomplete || []
                    );
                },
                {
                    violations: rawData.violations,
                    passes: rawData.passes || [],
                    incomplete: rawData.incomplete || [],
                }
            ),
            catch: (error) => {
                const msg = error instanceof Error ? error.message : String(error);
                logger.warn(`React attribution failed: ${msg}`);
                return new EffectScanDataError({ reason: `React attribution failed: ${msg}` });
            }
        });

        if (attributed && attributed.components) {
            logger.info(`React attribution complete: ${attributed.components.length} components found`);
            return {
                ...rawData,
                components: attributed.components,
                violations: attributed.violations,
                passes: attributed.passes,
                incomplete: attributed.incomplete,
            };
        }

        return rawData;
    }).pipe(
        // Don't fail the entire scan if React attribution fails - just log and continue
        Effect.catchAll((error) => {
            logger.warn(`React component attribution failed, continuing without it: ${error.reason}`);
            return Effect.succeed(rawData);
        })
    );

// ============================================================================
// File Output Helpers
// ============================================================================

/**
 * Write results to file with directory creation
 */
const writeResultsToFile = (
    results: ScanResults,
    filePath: string,
    processor: { formatAsJSON: (results: ScanResults) => Effect.Effect<string> }
): Effect.Effect<void, EffectFileSystemError> =>
    Effect.gen(function* () {
        const jsonContent = yield* processor.formatAsJSON(results);

        // Create directory if needed (mkdir with recursive:true is idempotent)
        const dir = dirname(filePath);
        if (dir !== '.') {
            yield* Effect.tryPromise({
                try: () => mkdir(dir, { recursive: true }),
                catch: (error) =>
                    new EffectFileSystemError({
                        operation: 'mkdir',
                        path: dir,
                        reason: error instanceof Error ? error.message : String(error),
                    }),
            });
        }

        // Write file
        yield* Effect.tryPromise({
            try: () => writeFile(filePath, jsonContent),
            catch: (error) =>
                new EffectFileSystemError({
                    operation: 'write',
                    path: filePath,
                    reason: error instanceof Error ? error.message : String(error),
                }),
        });

        logger.info(`Results written to ${filePath}`);
    });

// ============================================================================
// Promise Adapter
// ============================================================================

/**
 * Run the scan workflow and return a Promise
 *
 * This is a convenience function for code that can't use Effect directly.
 * It provides a backwards-compatible Promise-based API.
 *
 * Uses `performScan` with `Effect.scoped` to properly handle scoped layers
 * like `AppLayer`. The browser is automatically cleaned up when the scope ends.
 *
 * @example
 * ```ts
 * const result = await runScanAsPromise({
 *   url: 'http://localhost:3000',
 *   browser: 'chromium',
 *   headless: true
 * }, AppLayer);
 * ```
 */
export const runScanAsPromise = (
    options: EffectScanOptions,
    layer: Layer.Layer<BrowserService | ScannerService | ResultsProcessorService, never, never>
): Promise<EffectScanResult> => {
    const program = pipe(
        performScan(options),
        Effect.provide(layer),
        Effect.scoped
    );
    return Effect.runPromiseExit(program).then((exit) => {
        if (Exit.isSuccess(exit)) {
            return exit.value;
        }
        // Extract typed failures from the Cause
        const failures = Cause.failures(exit.cause);
        const firstError = Chunk.head(failures);
        if (Option.isSome(firstError)) {
            const tagged = firstError.value as { _tag: string; [key: string]: unknown };
            throw new ScanError(
                tagged._tag,
                formatTaggedError(tagged),
                { ...tagged },
                tagged
            );
        }
        // Defects or interrupts — no typed error available
        throw new Error(Cause.pretty(exit.cause));
    });
};

// ============================================================================
// Multi-Page Scanning
// ============================================================================

/**
 * Run scans for multiple URLs sequentially and return a Promise.
 *
 * Each URL gets its own browser session (launched and closed per scan).
 * Results are returned as an array, one per URL.
 */
export const runMultiScanAsPromise = async (
    urls: string[],
    baseOptions: Omit<EffectScanOptions, 'url'>,
    layer: Layer.Layer<BrowserService | ScannerService | ResultsProcessorService, never, never>
): Promise<EffectScanResult[]> => {
    const results: EffectScanResult[] = [];
    for (const url of urls) {
        const result = await runScanAsPromise({ ...baseOptions, url }, layer);
        results.push(result);
    }
    return results;
};
