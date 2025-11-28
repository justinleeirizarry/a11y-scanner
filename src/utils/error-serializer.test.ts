import { describe, it, expect } from 'vitest';
import {
    serializeError,
    errorToJSON,
    getErrorMessage,
    hasErrorCode,
    type SerializedError,
} from './error-serializer.js';

describe('error-serializer', () => {
    describe('serializeError', () => {
        it('serializes a basic Error', () => {
            const error = new Error('Something went wrong');
            const serialized = serializeError(error);

            expect(serialized.message).toBe('Something went wrong');
            expect(serialized.name).toBe('Error');
            expect(serialized.stack).toBeDefined();
            expect(serialized.code).toBeUndefined();
            expect(serialized.cause).toBeUndefined();
        });

        it('serializes a TypeError', () => {
            const error = new TypeError('Invalid type');
            const serialized = serializeError(error);

            expect(serialized.message).toBe('Invalid type');
            expect(serialized.name).toBe('TypeError');
        });

        it('serializes an error with a code', () => {
            const error = new Error('File not found') as NodeJS.ErrnoException;
            error.code = 'ENOENT';

            const serialized = serializeError(error);

            expect(serialized.code).toBe('ENOENT');
        });

        it('serializes an error with a cause', () => {
            const cause = new Error('Original error');
            const error = new Error('Wrapped error', { cause });

            const serialized = serializeError(error);

            expect(serialized.cause).toBeDefined();
            expect(serialized.cause?.message).toBe('Original error');
            expect(serialized.cause?.name).toBe('Error');
        });

        it('handles deeply nested causes', () => {
            const root = new Error('Root cause');
            const middle = new Error('Middle error', { cause: root });
            const outer = new Error('Outer error', { cause: middle });

            const serialized = serializeError(outer);

            expect(serialized.message).toBe('Outer error');
            expect(serialized.cause?.message).toBe('Middle error');
            expect(serialized.cause?.cause?.message).toBe('Root cause');
        });

        it('handles string errors', () => {
            const serialized = serializeError('Something failed');

            expect(serialized.message).toBe('Something failed');
            expect(serialized.name).toBe('UnknownError');
        });

        it('handles number errors', () => {
            const serialized = serializeError(404);

            expect(serialized.message).toBe('404');
            expect(serialized.name).toBe('UnknownError');
        });

        it('handles null', () => {
            const serialized = serializeError(null);

            expect(serialized.message).toBe('null');
            expect(serialized.name).toBe('UnknownError');
        });

        it('handles undefined', () => {
            const serialized = serializeError(undefined);

            expect(serialized.message).toBe('undefined');
            expect(serialized.name).toBe('UnknownError');
        });

        it('handles objects', () => {
            const serialized = serializeError({ error: 'custom' });

            expect(serialized.message).toBe('[object Object]');
            expect(serialized.name).toBe('UnknownError');
        });
    });

    describe('errorToJSON', () => {
        it('converts error to JSON string', () => {
            const error = new Error('Test error');
            const json = errorToJSON(error);

            const parsed = JSON.parse(json) as SerializedError;
            expect(parsed.message).toBe('Test error');
            expect(parsed.name).toBe('Error');
        });

        it('returns minified JSON by default', () => {
            const error = new Error('Test');
            const json = errorToJSON(error);

            expect(json).not.toContain('\n');
        });

        it('returns pretty JSON when requested', () => {
            const error = new Error('Test');
            const json = errorToJSON(error, true);

            expect(json).toContain('\n');
            expect(json).toContain('  '); // indentation
        });

        it('handles non-Error values', () => {
            const json = errorToJSON('string error');
            const parsed = JSON.parse(json) as SerializedError;

            expect(parsed.message).toBe('string error');
            expect(parsed.name).toBe('UnknownError');
        });
    });

    describe('getErrorMessage', () => {
        it('extracts message from Error', () => {
            const error = new Error('The error message');
            expect(getErrorMessage(error)).toBe('The error message');
        });

        it('converts non-Error to string', () => {
            expect(getErrorMessage('string message')).toBe('string message');
            expect(getErrorMessage(123)).toBe('123');
            expect(getErrorMessage(null)).toBe('null');
        });
    });

    describe('hasErrorCode', () => {
        it('returns true for matching error code', () => {
            const error = new Error('File not found') as NodeJS.ErrnoException;
            error.code = 'ENOENT';

            expect(hasErrorCode(error, 'ENOENT')).toBe(true);
        });

        it('returns false for non-matching error code', () => {
            const error = new Error('File exists') as NodeJS.ErrnoException;
            error.code = 'EEXIST';

            expect(hasErrorCode(error, 'ENOENT')).toBe(false);
        });

        it('returns false for errors without code', () => {
            const error = new Error('Generic error');

            expect(hasErrorCode(error, 'ENOENT')).toBe(false);
        });

        it('returns false for non-Error values', () => {
            expect(hasErrorCode('string', 'ENOENT')).toBe(false);
            expect(hasErrorCode(null, 'ENOENT')).toBe(false);
            expect(hasErrorCode(undefined, 'ENOENT')).toBe(false);
        });
    });
});
