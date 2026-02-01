import { describe, it, expect } from 'vitest';
import { Effect, Exit } from 'effect';
import { createRetrySchedule } from './effect-retry.js';

describe('effect-retry', () => {
    describe('createRetrySchedule', () => {
        it('should create a schedule with linear backoff', async () => {
            const schedule = createRetrySchedule({
                maxRetries: 2,
                delayMs: 10,
                backoff: 'linear',
            });

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

        it('should retry on failure and succeed on later attempt', async () => {
            let attempts = 0;
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

            const schedule = createRetrySchedule({ maxRetries: 3, delayMs: 10 });
            const result = await Effect.runPromise(
                Effect.retry(retryableEffect, schedule)
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

            const schedule = createRetrySchedule({ maxRetries: 2, delayMs: 10 });
            const exit = await Effect.runPromiseExit(
                Effect.retry(effect, schedule)
            );

            expect(Exit.isFailure(exit)).toBe(true);
            // Initial attempt + 2 retries = 3 total attempts
            expect(attempts).toBe(3);
        });
    });
});
