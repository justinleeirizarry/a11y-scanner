import { describe, it, expect } from 'vitest';
import { ScanError, formatTaggedError } from './scan-error.js';

describe('ScanError', () => {
    it('should be an instance of Error', () => {
        const error = new ScanError('NavigationError', 'test message', {});
        expect(error).toBeInstanceOf(Error);
    });

    it('should have correct name', () => {
        const error = new ScanError('NavigationError', 'test message', {});
        expect(error.name).toBe('ScanError');
    });

    it('should expose tag and details', () => {
        const details = { url: 'http://example.com', reason: 'Connection refused' };
        const error = new ScanError('NavigationError', 'nav failed', details);
        expect(error.tag).toBe('NavigationError');
        expect(error.details).toEqual(details);
    });

    it('should set message', () => {
        const error = new ScanError('NavigationError', 'Navigation failed', {});
        expect(error.message).toBe('Navigation failed');
    });

    it('should set cause from original error', () => {
        const original = { _tag: 'NavigationError', url: 'http://example.com' };
        const error = new ScanError('NavigationError', 'nav failed', {}, original);
        expect(error.cause).toBe(original);
    });

    it('should have a stack trace', () => {
        const error = new ScanError('NavigationError', 'test', {});
        expect(error.stack).toBeDefined();
        expect(error.stack).toContain('ScanError');
    });
});

describe('formatTaggedError', () => {
    describe('browser errors', () => {
        it('formats BrowserLaunchError with reason', () => {
            const msg = formatTaggedError({ _tag: 'BrowserLaunchError', browserType: 'chromium', reason: 'Not installed' });
            expect(msg).toBe('Failed to launch chromium: Not installed');
        });

        it('formats BrowserLaunchError without reason', () => {
            const msg = formatTaggedError({ _tag: 'BrowserLaunchError', browserType: 'firefox' });
            expect(msg).toBe('Failed to launch firefox');
        });

        it('formats BrowserNotLaunchedError', () => {
            const msg = formatTaggedError({ _tag: 'BrowserNotLaunchedError', operation: 'navigate' });
            expect(msg).toBe('Browser not launched: cannot perform "navigate"');
        });

        it('formats BrowserAlreadyLaunchedError', () => {
            const msg = formatTaggedError({ _tag: 'BrowserAlreadyLaunchedError' });
            expect(msg).toBe('Browser is already launched');
        });

        it('formats NavigationTimeoutError', () => {
            const msg = formatTaggedError({ _tag: 'NavigationTimeoutError', url: 'http://example.com', timeout: 30000 });
            expect(msg).toBe('Navigation to http://example.com timed out after 30000ms');
        });

        it('formats NavigationError with reason', () => {
            const msg = formatTaggedError({ _tag: 'NavigationError', url: 'http://example.com', reason: 'Connection refused' });
            expect(msg).toBe('Navigation to http://example.com failed: Connection refused');
        });

        it('formats NavigationError without reason', () => {
            const msg = formatTaggedError({ _tag: 'NavigationError', url: 'http://example.com' });
            expect(msg).toBe('Navigation to http://example.com failed');
        });

        it('formats ContextDestroyedError with message', () => {
            const msg = formatTaggedError({ _tag: 'ContextDestroyedError', message: 'Page was closed' });
            expect(msg).toBe('Browser context destroyed: Page was closed');
        });

        it('formats ContextDestroyedError without message', () => {
            const msg = formatTaggedError({ _tag: 'ContextDestroyedError' });
            expect(msg).toBe('Browser context was destroyed during scan');
        });
    });

    describe('scan errors', () => {
        it('formats ReactNotDetectedError', () => {
            const msg = formatTaggedError({ _tag: 'ReactNotDetectedError', url: 'http://example.com' });
            expect(msg).toBe('React was not detected on http://example.com');
        });

        it('formats ScannerInjectionError', () => {
            const msg = formatTaggedError({ _tag: 'ScannerInjectionError', reason: 'Bundle not found' });
            expect(msg).toBe('Scanner injection failed: Bundle not found');
        });

        it('formats MaxRetriesExceededError with lastError', () => {
            const msg = formatTaggedError({ _tag: 'MaxRetriesExceededError', attempts: 3, lastError: 'Timeout' });
            expect(msg).toBe('Scan failed after 3 attempts: Timeout');
        });

        it('formats MaxRetriesExceededError without lastError', () => {
            const msg = formatTaggedError({ _tag: 'MaxRetriesExceededError', attempts: 5 });
            expect(msg).toBe('Scan failed after 5 attempts');
        });

        it('formats ScanDataError', () => {
            const msg = formatTaggedError({ _tag: 'ScanDataError', reason: 'No data returned' });
            expect(msg).toBe('Invalid scan data: No data returned');
        });
    });

    describe('validation errors', () => {
        it('formats ConfigurationError with invalidField', () => {
            const msg = formatTaggedError({ _tag: 'ConfigurationError', message: 'Invalid value', invalidField: 'timeout' });
            expect(msg).toBe('Configuration error in "timeout": Invalid value');
        });

        it('formats ConfigurationError without invalidField', () => {
            const msg = formatTaggedError({ _tag: 'ConfigurationError', message: 'Invalid value' });
            expect(msg).toBe('Configuration error: Invalid value');
        });

        it('formats InvalidUrlError with reason', () => {
            const msg = formatTaggedError({ _tag: 'InvalidUrlError', url: 'not-a-url', reason: 'Missing protocol' });
            expect(msg).toBe('Invalid URL "not-a-url": Missing protocol');
        });

        it('formats InvalidUrlError without reason', () => {
            const msg = formatTaggedError({ _tag: 'InvalidUrlError', url: 'bad' });
            expect(msg).toBe('Invalid URL: bad');
        });
    });

    describe('infrastructure errors', () => {
        it('formats FileSystemError with reason', () => {
            const msg = formatTaggedError({ _tag: 'FileSystemError', operation: 'write', path: '/tmp/out.json', reason: 'Permission denied' });
            expect(msg).toBe('File system error during write on /tmp/out.json: Permission denied');
        });

        it('formats FileSystemError without reason', () => {
            const msg = formatTaggedError({ _tag: 'FileSystemError', operation: 'mkdir', path: '/tmp/dir' });
            expect(msg).toBe('File system error during mkdir on /tmp/dir');
        });

        it('formats ServiceStateError', () => {
            const msg = formatTaggedError({ _tag: 'ServiceStateError', service: 'BrowserService', expectedState: 'launched', actualState: 'closed' });
            expect(msg).toBe('Service "BrowserService" is in state "closed" but expected "launched"');
        });
    });

    describe('test generation errors', () => {
        it('formats TestGenNotInitializedError with operation', () => {
            const msg = formatTaggedError({ _tag: 'TestGenNotInitializedError', operation: 'generateTest' });
            expect(msg).toBe('Test generation service not initialized: cannot perform "generateTest"');
        });

        it('formats TestGenNotInitializedError without operation', () => {
            const msg = formatTaggedError({ _tag: 'TestGenNotInitializedError' });
            expect(msg).toBe('Test generation service not initialized');
        });

        it('formats TestGenInitError', () => {
            const msg = formatTaggedError({ _tag: 'TestGenInitError', reason: 'Missing API key' });
            expect(msg).toBe('Test generation initialization failed: Missing API key');
        });

        it('formats TestGenNavigationError', () => {
            const msg = formatTaggedError({ _tag: 'TestGenNavigationError', url: 'http://example.com', reason: 'Page not found' });
            expect(msg).toBe('Test generation navigation to http://example.com failed: Page not found');
        });

        it('formats TestGenDiscoveryError', () => {
            const msg = formatTaggedError({ _tag: 'TestGenDiscoveryError', reason: 'No elements found' });
            expect(msg).toBe('Element discovery failed: No elements found');
        });
    });

    describe('keyboard test errors', () => {
        it('formats KeyboardTestInitError', () => {
            const msg = formatTaggedError({ _tag: 'KeyboardTestInitError', reason: 'Stagehand unavailable' });
            expect(msg).toBe('Keyboard test initialization failed: Stagehand unavailable');
        });

        it('formats KeyboardTestError', () => {
            const msg = formatTaggedError({ _tag: 'KeyboardTestError', operation: 'tabNavigation', reason: 'Element not focusable' });
            expect(msg).toBe('Keyboard test "tabNavigation" failed: Element not focusable');
        });

        it('formats KeyboardTestNotInitializedError with operation', () => {
            const msg = formatTaggedError({ _tag: 'KeyboardTestNotInitializedError', operation: 'test' });
            expect(msg).toBe('Keyboard test service not initialized: cannot perform "test"');
        });

        it('formats KeyboardTestNotInitializedError without operation', () => {
            const msg = formatTaggedError({ _tag: 'KeyboardTestNotInitializedError' });
            expect(msg).toBe('Keyboard test service not initialized');
        });
    });

    describe('tree analysis errors', () => {
        it('formats TreeAnalysisInitError', () => {
            const msg = formatTaggedError({ _tag: 'TreeAnalysisInitError', reason: 'Failed to connect' });
            expect(msg).toBe('Tree analysis initialization failed: Failed to connect');
        });

        it('formats TreeAnalysisError', () => {
            const msg = formatTaggedError({ _tag: 'TreeAnalysisError', reason: 'Timeout' });
            expect(msg).toBe('Tree analysis failed: Timeout');
        });

        it('formats TreeAnalysisNotInitializedError with operation', () => {
            const msg = formatTaggedError({ _tag: 'TreeAnalysisNotInitializedError', operation: 'analyze' });
            expect(msg).toBe('Tree analysis service not initialized: cannot perform "analyze"');
        });

        it('formats TreeAnalysisNotInitializedError without operation', () => {
            const msg = formatTaggedError({ _tag: 'TreeAnalysisNotInitializedError' });
            expect(msg).toBe('Tree analysis service not initialized');
        });
    });

    describe('WCAG audit errors', () => {
        it('formats WcagAuditInitError', () => {
            const msg = formatTaggedError({ _tag: 'WcagAuditInitError', reason: 'Missing config' });
            expect(msg).toBe('WCAG audit initialization failed: Missing config');
        });

        it('formats WcagAuditError', () => {
            const msg = formatTaggedError({ _tag: 'WcagAuditError', operation: 'colorContrast', reason: 'Cannot compute' });
            expect(msg).toBe('WCAG audit "colorContrast" failed: Cannot compute');
        });

        it('formats WcagAuditNotInitializedError with operation', () => {
            const msg = formatTaggedError({ _tag: 'WcagAuditNotInitializedError', operation: 'audit' });
            expect(msg).toBe('WCAG audit service not initialized: cannot perform "audit"');
        });

        it('formats WcagAuditNotInitializedError without operation', () => {
            const msg = formatTaggedError({ _tag: 'WcagAuditNotInitializedError' });
            expect(msg).toBe('WCAG audit service not initialized');
        });
    });

    describe('unknown errors', () => {
        it('falls back to JSON for unknown tags', () => {
            const msg = formatTaggedError({ _tag: 'UnknownError', foo: 'bar' });
            expect(msg).toContain('UnknownError');
            expect(msg).toContain('foo');
            expect(msg).toContain('bar');
        });
    });

    describe('all error types produce non-empty messages', () => {
        const allTags = [
            'BrowserLaunchError',
            'BrowserNotLaunchedError',
            'BrowserAlreadyLaunchedError',
            'NavigationTimeoutError',
            'NavigationError',
            'ContextDestroyedError',
            'ReactNotDetectedError',
            'ScannerInjectionError',
            'MaxRetriesExceededError',
            'ScanDataError',
            'ConfigurationError',
            'InvalidUrlError',
            'FileSystemError',
            'ServiceStateError',
            'TestGenNotInitializedError',
            'TestGenInitError',
            'TestGenNavigationError',
            'TestGenDiscoveryError',
            'KeyboardTestInitError',
            'KeyboardTestError',
            'KeyboardTestNotInitializedError',
            'TreeAnalysisInitError',
            'TreeAnalysisError',
            'TreeAnalysisNotInitializedError',
            'WcagAuditInitError',
            'WcagAuditError',
            'WcagAuditNotInitializedError',
        ];

        for (const tag of allTags) {
            it(`produces a non-empty message for ${tag}`, () => {
                const msg = formatTaggedError({ _tag: tag });
                expect(msg).toBeTruthy();
                expect(msg.length).toBeGreaterThan(0);
            });
        }
    });
});
