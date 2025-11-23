/**
 * Unit tests for retry utility
 */

import { describe, it, expect, vi } from 'vitest';
import { withRetry, calculateDelay } from './retry.js';
import { MaxRetriesExceededError } from '../errors/index.js';

describe('withRetry', () => {
    describe('Success cases', () => {
        it('should return result on first attempt if successful', async () => {
            const fn = vi.fn().mockResolvedValue('success');

            const result = await withRetry(fn, {
                maxRetries: 3,
                delayMs: 100,
            });

            expect(result).toBe('success');
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should retry and eventually succeed', async () => {
            const fn = vi.fn()
                .mockRejectedValueOnce(new Error('fail 1'))
                .mockRejectedValueOnce(new Error('fail 2'))
                .mockResolvedValue('success');

            const result = await withRetry(fn, {
                maxRetries: 3,
                delayMs: 10,
            });

            expect(result).toBe('success');
            expect(fn).toHaveBeenCalledTimes(3);
        });
    });

    describe('Failure cases', () => {
        it('should throw MaxRetriesExceededError after all retries fail', async () => {
            const fn = vi.fn().mockRejectedValue(new Error('always fails'));

            await expect(
                withRetry(fn, {
                    maxRetries: 3,
                    delayMs: 10,
                })
            ).rejects.toThrow(MaxRetriesExceededError);

            expect(fn).toHaveBeenCalledTimes(3);
        });

        it('should include last error in MaxRetriesExceededError', async () => {
            const lastError = new Error('final failure');
            const fn = vi.fn().mockRejectedValue(lastError);

            try {
                await withRetry(fn, {
                    maxRetries: 2,
                    delayMs: 10,
                });
                expect.fail('Should have thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(MaxRetriesExceededError);
                if (error instanceof MaxRetriesExceededError) {
                    expect(error.message).toContain('final failure');
                }
            }
        });
    });

    describe('Retry callback', () => {
        it('should call onRetry callback on each retry', async () => {
            const fn = vi.fn()
                .mockRejectedValueOnce(new Error('fail 1'))
                .mockRejectedValueOnce(new Error('fail 2'))
                .mockResolvedValue('success');

            const onRetry = vi.fn();

            await withRetry(fn, {
                maxRetries: 3,
                delayMs: 10,
                onRetry,
            });

            expect(onRetry).toHaveBeenCalledTimes(2);
            expect(onRetry).toHaveBeenNthCalledWith(1, 1, expect.any(Error));
            expect(onRetry).toHaveBeenNthCalledWith(2, 2, expect.any(Error));
        });

        it('should not call onRetry if succeeds on first attempt', async () => {
            const fn = vi.fn().mockResolvedValue('success');
            const onRetry = vi.fn();

            await withRetry(fn, {
                maxRetries: 3,
                delayMs: 10,
                onRetry,
            });

            expect(onRetry).not.toHaveBeenCalled();
        });
    });

    describe('Backoff strategies', () => {
        it('should use linear backoff by default', async () => {
            const fn = vi.fn()
                .mockRejectedValueOnce(new Error('fail'))
                .mockResolvedValue('success');

            const start = Date.now();
            await withRetry(fn, {
                maxRetries: 2,
                delayMs: 100,
                backoff: 'linear',
            });
            const elapsed = Date.now() - start;

            // Should wait ~200ms (100ms * 2 for second attempt)
            expect(elapsed).toBeGreaterThanOrEqual(150);
            expect(elapsed).toBeLessThan(300);
        });

        it('should use exponential backoff when specified', async () => {
            const fn = vi.fn()
                .mockRejectedValueOnce(new Error('fail'))
                .mockResolvedValue('success');

            const start = Date.now();
            await withRetry(fn, {
                maxRetries: 2,
                delayMs: 100,
                backoff: 'exponential',
            });
            const elapsed = Date.now() - start;

            // Should wait ~100ms (100ms * 2^0 for second attempt)
            expect(elapsed).toBeGreaterThanOrEqual(80);
            expect(elapsed).toBeLessThan(200);
        });
    });

    describe('Edge cases', () => {
        it('should handle maxRetries of 1', async () => {
            const fn = vi.fn().mockRejectedValue(new Error('fail'));

            await expect(
                withRetry(fn, {
                    maxRetries: 1,
                    delayMs: 10,
                })
            ).rejects.toThrow(MaxRetriesExceededError);

            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should handle zero delay', async () => {
            const fn = vi.fn()
                .mockRejectedValueOnce(new Error('fail'))
                .mockResolvedValue('success');

            const start = Date.now();
            await withRetry(fn, {
                maxRetries: 2,
                delayMs: 0,
            });
            const elapsed = Date.now() - start;

            // Should be very fast with no delay
            expect(elapsed).toBeLessThan(50);
        });
    });
});

describe('calculateDelay', () => {
    describe('Linear backoff', () => {
        it('should calculate linear delays correctly', () => {
            expect(calculateDelay(1, 100, 'linear')).toBe(100);
            expect(calculateDelay(2, 100, 'linear')).toBe(200);
            expect(calculateDelay(3, 100, 'linear')).toBe(300);
        });
    });

    describe('Exponential backoff', () => {
        it('should calculate exponential delays correctly', () => {
            expect(calculateDelay(1, 100, 'exponential')).toBe(100);  // 100 * 2^0
            expect(calculateDelay(2, 100, 'exponential')).toBe(200);  // 100 * 2^1
            expect(calculateDelay(3, 100, 'exponential')).toBe(400);  // 100 * 2^2
            expect(calculateDelay(4, 100, 'exponential')).toBe(800);  // 100 * 2^3
        });
    });
});
