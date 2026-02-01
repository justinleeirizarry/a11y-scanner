import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EXIT_CODES, setExitCode, exitWithCode, type ExitCode } from './exit-codes.js';

describe('exit-codes', () => {
    describe('EXIT_CODES constants', () => {
        it('defines SUCCESS as 0', () => {
            expect(EXIT_CODES.SUCCESS).toBe(0);
        });

        it('defines RUNTIME_ERROR as 1', () => {
            expect(EXIT_CODES.RUNTIME_ERROR).toBe(1);
        });

        it('defines VALIDATION_ERROR as 2', () => {
            expect(EXIT_CODES.VALIDATION_ERROR).toBe(2);
        });

        it('defines VIOLATIONS_FOUND as 1', () => {
            expect(EXIT_CODES.VIOLATIONS_FOUND).toBe(1);
        });
    });

    describe('setExitCode', () => {
        beforeEach(() => {
            // Reset exit code before each test
            process.exitCode = undefined;
        });

        afterEach(() => {
            process.exitCode = undefined;
        });

        it('sets process.exitCode to SUCCESS', () => {
            setExitCode(EXIT_CODES.SUCCESS);
            expect(process.exitCode).toBe(0);
        });

        it('sets process.exitCode to RUNTIME_ERROR', () => {
            setExitCode(EXIT_CODES.RUNTIME_ERROR);
            expect(process.exitCode).toBe(1);
        });

        it('sets process.exitCode to VALIDATION_ERROR', () => {
            setExitCode(EXIT_CODES.VALIDATION_ERROR);
            expect(process.exitCode).toBe(2);
        });
    });

    describe('exitWithCode', () => {
        it('calls process.exit with the correct code', () => {
            const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
                throw new Error('process.exit called');
            });

            try {
                exitWithCode(EXIT_CODES.VALIDATION_ERROR);
            } catch (e) {
                // Expected - we mock exit to throw
            }

            expect(mockExit).toHaveBeenCalledWith(2);
            mockExit.mockRestore();
        });
    });

    describe('ExitCode type', () => {
        it('accepts valid exit codes', () => {
            const codes: ExitCode[] = [
                EXIT_CODES.SUCCESS,
                EXIT_CODES.RUNTIME_ERROR,
                EXIT_CODES.VALIDATION_ERROR,
                EXIT_CODES.VIOLATIONS_FOUND,
            ];

            // Type check - these should all be valid ExitCode values
            codes.forEach((code) => {
                expect(typeof code).toBe('number');
            });
        });
    });
});
