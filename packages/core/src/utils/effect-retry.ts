/**
 * Effect-based retry utilities using Schedule
 *
 * These utilities provide type-safe retry logic using Effect's Schedule API.
 */
import { Effect, Schedule, Duration, pipe } from 'effect';

/**
 * Configuration for retry schedules
 */
export interface EffectRetryConfig {
    /** Maximum number of retries (not including initial attempt) */
    maxRetries: number;
    /** Base delay in milliseconds between retries */
    delayMs: number;
    /** Backoff strategy: 'linear' or 'exponential' */
    backoff?: 'linear' | 'exponential';
}

/**
 * Create a retry schedule from configuration
 *
 * @example
 * ```ts
 * const schedule = createRetrySchedule({ maxRetries: 3, delayMs: 1000, backoff: 'exponential' });
 * const result = yield* Effect.retry(myEffect, schedule);
 * ```
 */
export const createRetrySchedule = (config: EffectRetryConfig) => {
    const { maxRetries, delayMs, backoff = 'linear' } = config;

    const baseDelay = Duration.millis(delayMs);

    // Create delay schedule based on backoff strategy
    const delaySchedule =
        backoff === 'exponential'
            ? Schedule.exponential(baseDelay, 2) // doubles each time
            : Schedule.linear(baseDelay); // adds base delay each time

    // Limit to maxRetries attempts
    return pipe(Schedule.recurs(maxRetries), Schedule.intersect(delaySchedule));
};

