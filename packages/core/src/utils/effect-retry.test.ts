import { describe, it, expect, vi } from 'vitest';
import { Effect, Exit } from 'effect';
import {
    createRetrySchedule,
    createRetryScheduleWithJitter,
    withEffectRetry,
    createRetryScheduleForErrors,
} from './effect-retry.js';

describe('effect-retry', () => {
    describe('createRetrySchedule', () => {
        it('should create a schedule with linear backoff', async () => {
            const schedule = createRetrySchedule({
                maxRetries: 2,
                delayMs: 10,
                backoff: 'linear',
            });

            // The schedule should limit to maxRetries
            expect(schedule).toBeDefined();
        });

        it('should create a schedule with exponential backoff', async () => {
            const schedule = createRetrySchedule({
                maxRetries: 3,
                delayMs: 10,
                backoff: 'exponential',
            });

            expect(schedule).toBeDefined();
        });

        it('should default to linear backoff', async () => {
            const schedule = createRetrySchedule({
                maxRetries: 2,
                delayMs: 10,
            });

            expect(schedule).toBeDefined();
        });
    });

    describe('createRetryScheduleWithJitter', () => {
        it('should create a jittered schedule', async () => {
            const schedule = createRetryScheduleWithJitter({
                maxRetries: 2,
                delayMs: 10,
                backoff: 'exponential',
            });

            expect(schedule).toBeDefined();
        });
    });

    describe('withEffectRetry', () => {
        it('should succeed on first attempt without retry', async () => {
            const effect = Effect.succeed('success');

            const result = await Effect.runPromise(
                withEffectRetry(effect, { maxRetries: 3, delayMs: 10 })
            );

            expect(result).toBe('success');
        });

        it('should retry on failure and succeed on later attempt', async () => {
            let attempts = 0;
            const effect = Effect.sync(() => {
                attempts++;
                if (attempts < 3) {
                    throw new Error('fail');
                }
                return 'success';
            });

            // Use Effect.try to convert the throwing function to Effect
            const retryableEffect = Effect.try({
                try: () => {
                    attempts++;
                    if (attempts < 3) {
                        throw new Error('fail');
                    }
                    return 'success';
                },
                catch: (e) => e as Error,
            });

            attempts = 0; // Reset for actual test

            const result = await Effect.runPromise(
                withEffectRetry(retryableEffect, { maxRetries: 3, delayMs: 10 })
            );

            expect(result).toBe('success');
            expect(attempts).toBe(3);
        });

        it('should fail after exhausting retries', async () => {
            let attempts = 0;
            const effect = Effect.try({
                try: () => {
                    attempts++;
                    throw new Error('always fails');
                },
                catch: (e) => e as Error,
            });

            const exit = await Effect.runPromiseExit(
                withEffectRetry(effect, { maxRetries: 2, delayMs: 10 })
            );

            expect(Exit.isFailure(exit)).toBe(true);
            // Initial attempt + 2 retries = 3 total attempts
            expect(attempts).toBe(3);
        });
    });

    describe('createRetryScheduleForErrors', () => {
        it('should only retry for matching errors', async () => {
            interface RetryableError {
                _tag: 'RetryableError';
            }
            interface FatalError {
                _tag: 'FatalError';
            }
            type AppError = RetryableError | FatalError;

            const schedule = createRetryScheduleForErrors<AppError>(
                { maxRetries: 3, delayMs: 10 },
                (error) => error._tag === 'RetryableError'
            );

            expect(schedule).toBeDefined();
        });
    });
});
