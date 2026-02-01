/**
 * Effect-based Orchestration
 *
 * This module provides Effect-based scan workflows with proper error typing
 * and automatic resource management.
 */
import { Effect, pipe } from 'effect';
import { mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';
import type { ScanResults } from '../../types.js';
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
    type BrowserErrors,
    type ScanErrors,
} from '../../errors/effect-errors.js';
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
        } = options;

        // Launch browser
        yield* browser.launch({ browserType, headless });

        // Navigate to URL
        yield* browser.navigate(url);

        // Wait for page stability (important for SPAs)
        yield* browser.waitForStability();

        // Check for React
        const hasReact = yield* browser.detectReact();
        if (!hasReact) {
            return yield* Effect.fail(new EffectReactNotDetectedError({ url }));
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
        const rawData = yield* pipe(
            scanner.scan(page, { tags, includeKeyboardTests }),
            Effect.retry(retrySchedule),
            Effect.tap(() => Effect.sync(() => logger.info('Scan completed successfully')))
        );

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
 * Perform scan with automatic cleanup
 *
 * This wraps performScan with Effect.ensuring to guarantee
 * browser cleanup even if the scan fails.
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
// File Output Helpers
// ============================================================================

/**
 * Write results to file with directory creation
 */
const writeResultsToFile = (
    results: ScanResults,
    filePath: string,
    processor: ResultsProcessorService extends { Type: infer T } ? T : never
): Effect.Effect<void, EffectFileSystemError> =>
    Effect.gen(function* () {
        const jsonContent = yield* processor.formatAsJSON(results);

        // Create directory if needed
        const dir = dirname(filePath);
        if (dir !== '.') {
            yield* Effect.tryPromise({
                try: async () => {
                    try {
                        await mkdir(dir, { recursive: true });
                    } catch (err) {
                        // Only ignore EEXIST error
                        if (err instanceof Error) {
                            const nodeError = err as NodeJS.ErrnoException;
                            if (nodeError.code !== 'EEXIST') {
                                throw err;
                            }
                        }
                    }
                },
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
    layer: import('effect').Layer.Layer<BrowserService | ScannerService | ResultsProcessorService, never, never>
): Promise<EffectScanResult> =>
    Effect.runPromise(
        pipe(performScanWithCleanup(options), Effect.provide(layer))
    );
