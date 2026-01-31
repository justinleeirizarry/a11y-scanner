import { describe, it, expect } from 'vitest';
import { Effect, Exit } from 'effect';
import {
    EffectReactNotDetectedError,
    EffectBrowserLaunchError,
    EffectBrowserNotLaunchedError,
    EffectBrowserAlreadyLaunchedError,
    EffectNavigationTimeoutError,
    EffectNavigationError,
    EffectContextDestroyedError,
    EffectScannerInjectionError,
    EffectMaxRetriesExceededError,
    EffectConfigurationError,
    EffectInvalidUrlError,
    EffectFileSystemError,
    EffectServiceStateError,
    EffectScanDataError,
} from './effect-errors.js';

describe('Effect Errors', () => {
    describe('EffectReactNotDetectedError', () => {
        it('should create error with url', () => {
            const error = new EffectReactNotDetectedError({ url: 'http://example.com' });
            expect(error._tag).toBe('ReactNotDetectedError');
            expect(error.url).toBe('http://example.com');
        });

        it('should work in Effect error channel', async () => {
            const effect = Effect.fail(
                new EffectReactNotDetectedError({ url: 'http://example.com' })
            );
            const exit = await Effect.runPromiseExit(effect);

            expect(Exit.isFailure(exit)).toBe(true);
            if (Exit.isFailure(exit)) {
                const error = exit.cause._tag === 'Fail' ? exit.cause.error : null;
                expect(error?._tag).toBe('ReactNotDetectedError');
            }
        });
    });

    describe('EffectBrowserLaunchError', () => {
        it('should create error with browserType and optional reason', () => {
            const error = new EffectBrowserLaunchError({
                browserType: 'chromium',
                reason: 'Not installed',
            });
            expect(error._tag).toBe('BrowserLaunchError');
            expect(error.browserType).toBe('chromium');
            expect(error.reason).toBe('Not installed');
        });

        it('should create error without reason', () => {
            const error = new EffectBrowserLaunchError({ browserType: 'firefox' });
            expect(error.reason).toBeUndefined();
        });
    });

    describe('EffectBrowserNotLaunchedError', () => {
        it('should create error with operation', () => {
            const error = new EffectBrowserNotLaunchedError({ operation: 'navigate' });
            expect(error._tag).toBe('BrowserNotLaunchedError');
            expect(error.operation).toBe('navigate');
        });
    });

    describe('EffectBrowserAlreadyLaunchedError', () => {
        it('should create error', () => {
            const error = new EffectBrowserAlreadyLaunchedError({});
            expect(error._tag).toBe('BrowserAlreadyLaunchedError');
        });
    });

    describe('EffectNavigationTimeoutError', () => {
        it('should create error with url and timeout', () => {
            const error = new EffectNavigationTimeoutError({
                url: 'http://example.com',
                timeout: 30000,
            });
            expect(error._tag).toBe('NavigationTimeoutError');
            expect(error.url).toBe('http://example.com');
            expect(error.timeout).toBe(30000);
        });
    });

    describe('EffectNavigationError', () => {
        it('should create error with url and optional reason', () => {
            const error = new EffectNavigationError({
                url: 'http://example.com',
                reason: 'Connection refused',
            });
            expect(error._tag).toBe('NavigationError');
            expect(error.url).toBe('http://example.com');
            expect(error.reason).toBe('Connection refused');
        });
    });

    describe('EffectContextDestroyedError', () => {
        it('should create error with optional message', () => {
            const error = new EffectContextDestroyedError({
                message: 'Page was closed',
            });
            expect(error._tag).toBe('ContextDestroyedError');
            expect(error.message).toBe('Page was closed');
        });
    });

    describe('EffectScannerInjectionError', () => {
        it('should create error with reason', () => {
            const error = new EffectScannerInjectionError({
                reason: 'Bundle not found',
            });
            expect(error._tag).toBe('ScannerInjectionError');
            expect(error.reason).toBe('Bundle not found');
        });
    });

    describe('EffectMaxRetriesExceededError', () => {
        it('should create error with attempts and optional lastError', () => {
            const error = new EffectMaxRetriesExceededError({
                attempts: 3,
                lastError: 'Connection timeout',
            });
            expect(error._tag).toBe('MaxRetriesExceededError');
            expect(error.attempts).toBe(3);
            expect(error.lastError).toBe('Connection timeout');
        });
    });

    describe('EffectConfigurationError', () => {
        it('should create error with message and optional field', () => {
            const error = new EffectConfigurationError({
                message: 'Invalid timeout value',
                invalidField: 'timeout',
            });
            expect(error._tag).toBe('ConfigurationError');
            expect(error.message).toBe('Invalid timeout value');
            expect(error.invalidField).toBe('timeout');
        });
    });

    describe('EffectInvalidUrlError', () => {
        it('should create error with url and optional reason', () => {
            const error = new EffectInvalidUrlError({
                url: 'not-a-url',
                reason: 'Missing protocol',
            });
            expect(error._tag).toBe('InvalidUrlError');
            expect(error.url).toBe('not-a-url');
            expect(error.reason).toBe('Missing protocol');
        });
    });

    describe('EffectFileSystemError', () => {
        it('should create error with operation, path, and optional reason', () => {
            const error = new EffectFileSystemError({
                operation: 'write',
                path: '/tmp/output.json',
                reason: 'Permission denied',
            });
            expect(error._tag).toBe('FileSystemError');
            expect(error.operation).toBe('write');
            expect(error.path).toBe('/tmp/output.json');
            expect(error.reason).toBe('Permission denied');
        });
    });

    describe('EffectServiceStateError', () => {
        it('should create error with service, expectedState, and actualState', () => {
            const error = new EffectServiceStateError({
                service: 'BrowserService',
                expectedState: 'launched',
                actualState: 'not launched',
            });
            expect(error._tag).toBe('ServiceStateError');
            expect(error.service).toBe('BrowserService');
            expect(error.expectedState).toBe('launched');
            expect(error.actualState).toBe('not launched');
        });
    });

    describe('EffectScanDataError', () => {
        it('should create error with reason', () => {
            const error = new EffectScanDataError({
                reason: 'No scan data returned from browser',
            });
            expect(error._tag).toBe('ScanDataError');
            expect(error.reason).toBe('No scan data returned from browser');
        });
    });

    describe('Error matching with Effect', () => {
        it('should support pattern matching on error types', async () => {
            type AppError = EffectReactNotDetectedError | EffectBrowserLaunchError;

            const effect: Effect.Effect<string, AppError> = Effect.fail(
                new EffectReactNotDetectedError({ url: 'http://example.com' })
            );

            const handled = effect.pipe(
                Effect.catchTag('ReactNotDetectedError', (error) =>
                    Effect.succeed(`React not found at ${error.url}`)
                ),
                Effect.catchTag('BrowserLaunchError', (error) =>
                    Effect.succeed(`Failed to launch ${error.browserType}`)
                )
            );

            const result = await Effect.runPromise(handled);
            expect(result).toBe('React not found at http://example.com');
        });
    });
});
