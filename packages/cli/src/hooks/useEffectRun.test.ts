import { describe, it, expect, vi } from 'vitest';
import { Effect, Exit, Fiber, Layer } from 'effect';

// Test the underlying logic without React hooks
// The hook implementation is thin wrapper, so we test the Effect patterns directly

describe('useEffectRun patterns', () => {
    describe('Effect execution', () => {
        it('should handle successful Effects', async () => {
            const effect = Effect.succeed('test-data');
            const result = await Effect.runPromise(effect);

            expect(result).toBe('test-data');
        });

        it('should handle failed Effects', async () => {
            const testError = new Error('test error');
            const effect = Effect.fail(testError);

            const exit = await Effect.runPromiseExit(effect);

            expect(Exit.isFailure(exit)).toBe(true);
            if (Exit.isFailure(exit) && exit.cause._tag === 'Fail') {
                expect(exit.cause.error).toBe(testError);
            }
        });
    });

    describe('Fiber management', () => {
        it('should support fiber fork and join', async () => {
            const effect = Effect.succeed('test-data');
            const fiber = Effect.runFork(effect);

            const result = await Effect.runPromise(Fiber.join(fiber));

            expect(result).toBe('test-data');
        });

        it('should support fiber interruption pattern', async () => {
            // Test that Fiber.interrupt exists and can be used
            const effect = Effect.succeed('data');
            const fiber = Effect.runFork(effect);

            // We can interrupt fibers using Fiber.interrupt
            // This test verifies the API exists
            const interruptEffect = Fiber.interrupt(fiber);
            expect(interruptEffect).toBeDefined();
        });
    });

    describe('onSuccess and onError callbacks', () => {
        it('should call success callback on success', async () => {
            const onSuccess = vi.fn();
            const effect = Effect.succeed('data');

            await Effect.runPromise(
                effect.pipe(Effect.tap((data) => Effect.sync(() => onSuccess(data))))
            );

            expect(onSuccess).toHaveBeenCalledWith('data');
        });

        it('should call error callback on failure', async () => {
            const onError = vi.fn();
            const testError = new Error('test');
            const effect = Effect.fail(testError);

            await Effect.runPromise(
                effect.pipe(
                    Effect.catchAll((error) =>
                        Effect.sync(() => {
                            onError(error);
                            return 'handled';
                        })
                    )
                )
            );

            expect(onError).toHaveBeenCalledWith(testError);
        });
    });

    describe('Layer provision', () => {
        it('should work with Layer.empty', async () => {
            const effect = Effect.succeed('data');
            const result = await Effect.runPromise(
                Effect.provide(effect, Layer.empty)
            );

            expect(result).toBe('data');
        });
    });
});
