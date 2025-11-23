/**
 * Unit tests for logger utility
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Logger, LogLevel } from './logger.js';

describe('Logger', () => {
    let consoleLogSpy: any;
    let consoleDebugSpy: any;
    let consoleWarnSpy: any;
    let consoleErrorSpy: any;

    beforeEach(() => {
        // Spy on console methods
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
        consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => { });
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        // Restore console methods
        consoleLogSpy.mockRestore();
        consoleDebugSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    describe('Log Levels', () => {
        it('should log debug messages when level is DEBUG', () => {
            const logger = new Logger(LogLevel.DEBUG);
            logger.debug('test message');
            expect(consoleDebugSpy).toHaveBeenCalledWith('[DEBUG] test message');
        });

        it('should not log debug messages when level is INFO', () => {
            const logger = new Logger(LogLevel.INFO);
            logger.debug('test message');
            expect(consoleDebugSpy).not.toHaveBeenCalled();
        });

        it('should log info messages when level is INFO', () => {
            const logger = new Logger(LogLevel.INFO);
            logger.info('test message');
            expect(consoleLogSpy).toHaveBeenCalledWith('[INFO] test message');
        });

        it('should not log info messages when level is WARN', () => {
            const logger = new Logger(LogLevel.WARN);
            logger.info('test message');
            expect(consoleLogSpy).not.toHaveBeenCalled();
        });

        it('should log warn messages when level is WARN', () => {
            const logger = new Logger(LogLevel.WARN);
            logger.warn('test message');
            expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] test message');
        });

        it('should not log warn messages when level is ERROR', () => {
            const logger = new Logger(LogLevel.ERROR);
            logger.warn('test message');
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it('should log error messages when level is ERROR', () => {
            const logger = new Logger(LogLevel.ERROR);
            logger.error('test message');
            expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] test message');
        });

        it('should not log anything when level is SILENT', () => {
            const logger = new Logger(LogLevel.SILENT);
            logger.debug('test');
            logger.info('test');
            logger.warn('test');
            logger.error('test');

            expect(consoleDebugSpy).not.toHaveBeenCalled();
            expect(consoleLogSpy).not.toHaveBeenCalled();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });
    });

    describe('Always log', () => {
        it('should always log regardless of level', () => {
            const logger = new Logger(LogLevel.SILENT);
            logger.always('important message');
            expect(consoleLogSpy).toHaveBeenCalledWith('important message');
        });
    });

    describe('Additional arguments', () => {
        it('should pass additional arguments to console', () => {
            const logger = new Logger(LogLevel.INFO);
            const obj = { foo: 'bar' };
            logger.info('test', obj, 123);
            expect(consoleLogSpy).toHaveBeenCalledWith('[INFO] test', obj, 123);
        });
    });

    describe('Set and get level', () => {
        it('should allow changing log level', () => {
            const logger = new Logger(LogLevel.INFO);
            expect(logger.getLevel()).toBe(LogLevel.INFO);

            logger.setLevel(LogLevel.DEBUG);
            expect(logger.getLevel()).toBe(LogLevel.DEBUG);

            logger.debug('test');
            expect(consoleDebugSpy).toHaveBeenCalled();
        });
    });

    describe('Default level', () => {
        it('should default to INFO when no level provided', () => {
            const logger = new Logger();
            expect(logger.getLevel()).toBe(LogLevel.INFO);
        });
    });
});
