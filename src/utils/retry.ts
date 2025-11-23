/**
 * Retry utility with configurable backoff strategies
 */

import { MaxRetriesExceededError } from '../errors/index.js';

export interface RetryOptions {
    maxRetries: number;
    delayMs: number;
    backoff?: 'linear' | 'exponential';
    onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Execute a function with retry logic
 * 
 * @param fn - Async function to execute
 * @param options - Retry configuration
 * @returns Result of the function
 * @throws MaxRetriesExceededError if all retries fail
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions
): Promise<T> {
    const { maxRetries, delayMs, backoff = 'linear', onRetry } = options;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Add delay before retry (skip on first attempt)
            if (attempt > 1) {
                const delay = backoff === 'exponential'
                    ? delayMs * Math.pow(2, attempt - 2) // 2^0, 2^1, 2^2...
                    : delayMs * attempt; // 1x, 2x, 3x...

                await new Promise(resolve => setTimeout(resolve, delay));
            }

            // Execute the function
            return await fn();
        } catch (error) {
            lastError = error as Error;

            // If this is the last attempt, throw
            if (attempt === maxRetries) {
                throw new MaxRetriesExceededError(maxRetries, lastError);
            }

            // Call retry callback if provided
            onRetry?.(attempt, lastError);
        }
    }

    // Should never reach here, but TypeScript needs this
    throw lastError!;
}

/**
 * Calculate delay for a given attempt
 */
export function calculateDelay(
    attempt: number,
    baseDelay: number,
    backoff: 'linear' | 'exponential'
): number {
    if (backoff === 'exponential') {
        return baseDelay * Math.pow(2, attempt - 1);
    }
    return baseDelay * attempt;
}
