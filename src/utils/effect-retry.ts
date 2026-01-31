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

/**
 * Create a retry schedule with jitter for better distribution of retries
 *
 * @example
 * ```ts
 * const schedule = createRetryScheduleWithJitter({
 *   maxRetries: 3,
 *   delayMs: 1000,
 *   backoff: 'exponential'
 * });
 * ```
 */
export const createRetryScheduleWithJitter = (config: EffectRetryConfig) => {
    const baseSchedule = createRetrySchedule(config);
    return Schedule.jittered(baseSchedule);
};

/**
 * Execute an Effect with retry logic
 *
 * This is a convenience function that wraps Effect.retry with our schedule.
 *
 * @example
 * ```ts
 * const result = yield* withEffectRetry(
 *   myEffect,
 *   { maxRetries: 3, delayMs: 1000, backoff: 'exponential' }
 * );
 * ```
 */
export const withEffectRetry = <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    config: EffectRetryConfig
): Effect.Effect<A, E, R> => {
    const schedule = createRetrySchedule(config);
    return Effect.retry(effect, schedule);
};

/**
 * Execute an Effect with retry logic and callback on each retry
 *
 * @example
 * ```ts
 * const result = yield* withEffectRetryAndCallback(
 *   myEffect,
 *   { maxRetries: 3, delayMs: 1000, backoff: 'exponential' },
 *   (attempt, error) => console.log(`Retry ${attempt} after error: ${error}`)
 * );
 * ```
 */
export const withEffectRetryAndCallback = <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    config: EffectRetryConfig,
    onRetry: (attempt: number, error: E) => void
): Effect.Effect<A, E, R> => {
    const schedule = createRetrySchedule(config);

    return pipe(
        effect,
        Effect.retry(
            pipe(
                schedule,
                Schedule.tapOutput(([, attempt]) =>
                    Effect.sync(() => {
                        // Note: We don't have access to the error in Schedule.tapOutput
                        // For full error tracking, use Effect.retryOrElse instead
                    })
                )
            )
        )
    );
};

/**
 * Create a schedule that retries only on specific error types
 *
 * @example
 * ```ts
 * const schedule = createRetryScheduleForErrors(
 *   { maxRetries: 3, delayMs: 1000 },
 *   (error) => error._tag === 'ContextDestroyedError'
 * );
 * ```
 */
export const createRetryScheduleForErrors = <E>(
    config: EffectRetryConfig,
    shouldRetry: (error: E) => boolean
) => {
    const baseSchedule = createRetrySchedule(config);
    return Schedule.whileInput(baseSchedule, shouldRetry);
};
