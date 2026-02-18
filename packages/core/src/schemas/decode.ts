/**
 * Browser boundary validation
 *
 * Decode functions for validating data crossing the browser->Node boundary
 * at the page.evaluate() call site in ScannerService.
 */
import { Schema, Effect } from 'effect';
import { BrowserScanData as BrowserScanDataSchema } from './scan-results.js';
import type { BrowserScanData } from './scan-results.js';
import { EffectScanDataError } from '../errors/effect-errors.js';
import { logger } from '../utils/logger.js';

const decode = Schema.decodeUnknown(BrowserScanDataSchema);

/**
 * Strict decoder — fails with EffectScanDataError on invalid data.
 * Use this when you want to enforce schema compliance.
 */
export function decodeBrowserScanData(data: unknown): Effect.Effect<BrowserScanData, EffectScanDataError> {
    return decode(data).pipe(
        Effect.map((result) => result as unknown as BrowserScanData),
        Effect.mapError((parseError) =>
            new EffectScanDataError({
                reason: `Browser scan data failed schema validation: ${String(parseError)}`,
            })
        ),
    );
}

/**
 * Lenient decoder — validates and logs warnings on failure, falls back to raw cast.
 * Use this during the initial rollout to avoid breaking existing scans.
 */
export function decodeBrowserScanDataLenient(data: unknown): Effect.Effect<BrowserScanData, never> {
    return decode(data).pipe(
        Effect.map((result) => result as unknown as BrowserScanData),
        Effect.catchAll((parseError) => {
            logger.warn(
                `Browser scan data did not pass schema validation (falling back to raw data): ${String(parseError)}`,
            );
            return Effect.succeed(data as BrowserScanData);
        }),
    );
}
