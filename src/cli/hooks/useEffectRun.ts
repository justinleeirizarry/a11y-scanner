/**
 * React hook for running Effect workflows in Ink components
 *
 * This hook provides a bridge between Effect and React's useEffect,
 * handling fiber interruption on component unmount.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Effect, Exit, Fiber, Runtime, Layer, Scope } from 'effect';

/**
 * State returned by useEffectRun
 */
export interface EffectRunState<A, E> {
    /** Current status of the Effect execution */
    status: 'idle' | 'pending' | 'success' | 'error';
    /** Result value when status is 'success' */
    data: A | null;
    /** Error when status is 'error' */
    error: E | null;
    /** Whether the Effect is currently running */
    isRunning: boolean;
    /** Function to manually re-run the Effect */
    rerun: () => void;
}

/**
 * Options for useEffectRun
 */
export interface UseEffectRunOptions {
    /** Whether to run the Effect immediately on mount (default: true) */
    immediate?: boolean;
    /** Callback when Effect succeeds */
    onSuccess?: <A>(data: A) => void;
    /** Callback when Effect fails */
    onError?: <E>(error: E) => void;
}

/**
 * Run an Effect as a React hook
 *
 * This hook runs an Effect when the component mounts (or when rerun is called),
 * and automatically interrupts the fiber if the component unmounts before completion.
 *
 * @example
 * ```tsx
 * function ScanComponent({ url }: { url: string }) {
 *   const { status, data, error } = useEffectRun(
 *     () => pipe(
 *       performScan({ url, browser: 'chromium', headless: true }),
 *       Effect.provide(AppLayer)
 *     ),
 *     [url] // re-run when url changes
 *   );
 *
 *   if (status === 'pending') return <Spinner />;
 *   if (status === 'error') return <Text color="red">{String(error)}</Text>;
 *   if (status === 'success') return <Results data={data} />;
 *   return null;
 * }
 * ```
 */
export function useEffectRun<A, E>(
    effectFn: () => Effect.Effect<A, E, never>,
    deps: readonly unknown[] = [],
    options: UseEffectRunOptions = {}
): EffectRunState<A, E> {
    const { immediate = true, onSuccess, onError } = options;

    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>(
        immediate ? 'pending' : 'idle'
    );
    const [data, setData] = useState<A | null>(null);
    const [error, setError] = useState<E | null>(null);

    // Track the current fiber for interruption
    const fiberRef = useRef<Fiber.RuntimeFiber<A, E> | null>(null);

    // Track if component is mounted
    const isMountedRef = useRef(true);

    const run = useCallback(() => {
        // Interrupt any existing fiber
        if (fiberRef.current) {
            Effect.runFork(Fiber.interrupt(fiberRef.current));
            fiberRef.current = null;
        }

        setStatus('pending');
        setData(null);
        setError(null);

        const effect = effectFn();

        // Fork the effect to get a fiber we can interrupt
        const fiber = Effect.runFork(effect);
        fiberRef.current = fiber;

        // Join the fiber and handle the result
        Effect.runPromise(Fiber.join(fiber))
            .then((result) => {
                if (!isMountedRef.current) return;

                fiberRef.current = null;
                setStatus('success');
                setData(result);
                onSuccess?.(result);
            })
            .catch((exit) => {
                if (!isMountedRef.current) return;

                fiberRef.current = null;

                // Check if this was an interruption
                if (Exit.isInterrupted(exit)) {
                    // Don't update state for interruptions
                    return;
                }

                // Extract the error from the Exit
                if (Exit.isFailure(exit)) {
                    const cause = exit.cause;
                    if (cause._tag === 'Fail') {
                        setStatus('error');
                        setError(cause.error as E);
                        onError?.(cause.error as E);
                    }
                }
            });
    }, [effectFn, onSuccess, onError]);

    useEffect(() => {
        isMountedRef.current = true;

        if (immediate) {
            run();
        }

        return () => {
            isMountedRef.current = false;

            // Interrupt fiber on unmount
            if (fiberRef.current) {
                Effect.runFork(Fiber.interrupt(fiberRef.current));
                fiberRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return {
        status,
        data,
        error,
        isRunning: status === 'pending',
        rerun: run,
    };
}

/**
 * Run an Effect with a provided Layer as a React hook
 *
 * This is a convenience hook that combines useEffectRun with Layer provision.
 *
 * @example
 * ```tsx
 * function ScanComponent({ url }: { url: string }) {
 *   const { status, data, error } = useEffectRunWithLayer(
 *     () => performScan({ url, browser: 'chromium', headless: true }),
 *     AppLayer,
 *     [url]
 *   );
 *   // ...
 * }
 * ```
 */
export function useEffectRunWithLayer<A, E, R>(
    effectFn: () => Effect.Effect<A, E, R>,
    layer: Layer.Layer<R, never, never>,
    deps: readonly unknown[] = [],
    options: UseEffectRunOptions = {}
): EffectRunState<A, E> {
    return useEffectRun(
        () => Effect.provide(effectFn(), layer),
        deps,
        options
    );
}
