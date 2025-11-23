/**
 * Unit tests for error classes
 */

import { describe, it, expect } from 'vitest';
import {
    ScanError,
    ReactNotDetectedError,
    NavigationTimeoutError,
    ContextDestroyedError,
    ScannerInjectionError,
    MaxRetriesExceededError,
    ConfigurationError,
    InvalidUrlError,
    FileSystemError,
    BrowserLaunchError,
} from './index.js';

describe('ScanError', () => {
    it('should create error with message and code', () => {
        const error = new ScanError('Test error', 'TEST_CODE');

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Test error');
        expect(error.code).toBe('TEST_CODE');
        expect(error.name).toBe('ScanError');
    });

    it('should default to non-recoverable', () => {
        const error = new ScanError('Test error', 'TEST_CODE');
        expect(error.recoverable).toBe(false);
    });

    it('should allow setting recoverable flag', () => {
        const error = new ScanError('Test error', 'TEST_CODE', true);
        expect(error.recoverable).toBe(true);
    });

    it('should store context', () => {
        const context = { url: 'http://example.com', attempt: 1 };
        const error = new ScanError('Test error', 'TEST_CODE', false, context);

        expect(error.context).toEqual(context);
    });

    it('should have stack trace', () => {
        const error = new ScanError('Test error', 'TEST_CODE');
        expect(error.stack).toBeDefined();
    });
});

describe('ReactNotDetectedError', () => {
    it('should create error with URL context', () => {
        const url = 'http://example.com';
        const error = new ReactNotDetectedError(url);

        expect(error).toBeInstanceOf(ScanError);
        expect(error.name).toBe('ReactNotDetectedError');
        expect(error.code).toBe('REACT_NOT_FOUND');
        expect(error.message).toContain('React was not detected');
        expect(error.context).toEqual({ url });
        expect(error.recoverable).toBe(false);
    });
});

describe('NavigationTimeoutError', () => {
    it('should create error with timeout context', () => {
        const url = 'http://example.com';
        const timeout = 30000;
        const error = new NavigationTimeoutError(url, timeout);

        expect(error).toBeInstanceOf(ScanError);
        expect(error.name).toBe('NavigationTimeoutError');
        expect(error.code).toBe('NAV_TIMEOUT');
        expect(error.message).toContain('30000ms');
        expect(error.context).toEqual({ url, timeout });
        expect(error.recoverable).toBe(true);
    });
});

describe('ContextDestroyedError', () => {
    it('should create error with default message', () => {
        const error = new ContextDestroyedError();

        expect(error).toBeInstanceOf(ScanError);
        expect(error.name).toBe('ContextDestroyedError');
        expect(error.code).toBe('CONTEXT_DESTROYED');
        expect(error.message).toContain('execution context was destroyed');
        expect(error.recoverable).toBe(true);
    });

    it('should accept custom message', () => {
        const customMessage = 'Custom context error';
        const error = new ContextDestroyedError(customMessage);

        expect(error.message).toBe(customMessage);
    });
});

describe('ScannerInjectionError', () => {
    it('should create error with reason', () => {
        const reason = 'Script failed to load';
        const error = new ScannerInjectionError(reason);

        expect(error).toBeInstanceOf(ScanError);
        expect(error.name).toBe('ScannerInjectionError');
        expect(error.code).toBe('SCANNER_INJECTION_FAILED');
        expect(error.message).toContain(reason);
        expect(error.context).toEqual({ reason });
        expect(error.recoverable).toBe(true);
    });
});

describe('MaxRetriesExceededError', () => {
    it('should create error with attempt count', () => {
        const attempts = 3;
        const error = new MaxRetriesExceededError(attempts);

        expect(error).toBeInstanceOf(ScanError);
        expect(error.name).toBe('MaxRetriesExceededError');
        expect(error.code).toBe('MAX_RETRIES_EXCEEDED');
        expect(error.message).toContain('3 attempts');
        expect(error.recoverable).toBe(false);
    });

    it('should include last error message', () => {
        const lastError = new Error('Connection failed');
        const error = new MaxRetriesExceededError(3, lastError);

        expect(error.message).toContain('Connection failed');
        expect(error.context?.lastError).toBe('Connection failed');
    });

    it('should handle missing last error', () => {
        const error = new MaxRetriesExceededError(3);
        expect(error.message).toContain('Unknown');
    });
});

describe('ConfigurationError', () => {
    it('should create error with message', () => {
        const message = 'Invalid configuration';
        const error = new ConfigurationError(message);

        expect(error).toBeInstanceOf(ScanError);
        expect(error.name).toBe('ConfigurationError');
        expect(error.code).toBe('INVALID_CONFIGURATION');
        expect(error.message).toBe(message);
        expect(error.recoverable).toBe(false);
    });

    it('should store invalid field', () => {
        const error = new ConfigurationError('Invalid config', 'timeout');
        expect(error.context).toEqual({ invalidField: 'timeout' });
    });
});

describe('InvalidUrlError', () => {
    it('should create error with URL', () => {
        const url = 'not-a-url';
        const error = new InvalidUrlError(url);

        expect(error).toBeInstanceOf(ScanError);
        expect(error.name).toBe('InvalidUrlError');
        expect(error.code).toBe('INVALID_URL');
        expect(error.message).toContain(url);
        expect(error.context).toEqual({ url, reason: undefined });
    });

    it('should include reason when provided', () => {
        const url = 'http://example.com';
        const reason = 'Protocol not supported';
        const error = new InvalidUrlError(url, reason);

        expect(error.message).toContain(reason);
        expect(error.context?.reason).toBe(reason);
    });
});

describe('FileSystemError', () => {
    it('should create error with operation and path', () => {
        const operation = 'write';
        const path = '/tmp/report.json';
        const error = new FileSystemError(operation, path);

        expect(error).toBeInstanceOf(ScanError);
        expect(error.name).toBe('FileSystemError');
        expect(error.code).toBe('FILE_SYSTEM_ERROR');
        expect(error.message).toContain('write');
        expect(error.message).toContain(path);
        expect(error.context).toEqual({ operation, path, reason: undefined });
    });

    it('should include reason when provided', () => {
        const reason = 'Permission denied';
        const error = new FileSystemError('write', '/tmp/file', reason);

        expect(error.message).toContain(reason);
        expect(error.context?.reason).toBe(reason);
    });
});

describe('BrowserLaunchError', () => {
    it('should create error with browser type', () => {
        const browserType = 'chromium';
        const error = new BrowserLaunchError(browserType);

        expect(error).toBeInstanceOf(ScanError);
        expect(error.name).toBe('BrowserLaunchError');
        expect(error.code).toBe('BROWSER_LAUNCH_FAILED');
        expect(error.message).toContain('chromium');
        expect(error.context).toEqual({ browserType, reason: undefined });
    });

    it('should include reason when provided', () => {
        const reason = 'Executable not found';
        const error = new BrowserLaunchError('firefox', reason);

        expect(error.message).toContain(reason);
        expect(error.context?.reason).toBe(reason);
    });
});
