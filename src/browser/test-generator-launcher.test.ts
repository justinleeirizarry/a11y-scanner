/**
 * Tests for runTestGeneration function
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runTestGeneration } from './test-generator-launcher.js';

// Mock implementations that can be modified per test
let mockScanner: any;
let mockGenerator: any;

// Mock StagehandScanner
vi.mock('../scanner/stagehand/index.js', () => ({
    StagehandScanner: vi.fn().mockImplementation(function() {
        return mockScanner;
    })
}));

// Mock TestGenerator
vi.mock('../scanner/stagehand/test-generator.js', () => ({
    TestGenerator: vi.fn().mockImplementation(function() {
        return mockGenerator;
    })
}));

// Mock logger
vi.mock('../utils/logger.js', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        setLevel: vi.fn()
    }
}));

// Mock fs/promises
vi.mock('fs/promises', () => ({
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined)
}));

import { StagehandScanner } from '../scanner/stagehand/index.js';
import { TestGenerator } from '../scanner/stagehand/test-generator.js';
import { logger } from '../utils/logger.js';
import * as fsPromises from 'fs/promises';

describe('runTestGeneration', () => {
    let mockPage: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockPage = {
            goto: vi.fn().mockResolvedValue(undefined)
        };

        mockScanner = {
            init: vi.fn().mockResolvedValue(undefined),
            discoverElements: vi.fn().mockResolvedValue([]),
            close: vi.fn().mockResolvedValue(undefined),
            page: mockPage
        };

        mockGenerator = {
            generateTest: vi.fn().mockReturnValue('// Generated test')
        };
    });

    describe('Initialization', () => {
        it('should create StagehandScanner with correct config', async () => {
            await runTestGeneration({
                url: 'http://example.com',
                outputFile: 'test.spec.ts',
                model: 'openai/gpt-4o',
                verbose: true
            });

            expect(StagehandScanner).toHaveBeenCalledWith({
                enabled: true,
                model: 'openai/gpt-4o',
                verbose: true
            });
        });

        it('should set logger level to DEBUG when verbose', async () => {
            await runTestGeneration({
                url: 'http://example.com',
                outputFile: 'test.spec.ts',
                verbose: true
            });

            expect(logger.setLevel).toHaveBeenCalledWith(0);
        });

        it('should not set logger level when not verbose', async () => {
            await runTestGeneration({
                url: 'http://example.com',
                outputFile: 'test.spec.ts',
                verbose: false
            });

            expect(logger.setLevel).not.toHaveBeenCalled();
        });
    });

    describe('Navigation', () => {
        it('should navigate to URL with networkidle', async () => {
            await runTestGeneration({
                url: 'http://example.com',
                outputFile: 'test.spec.ts'
            });

            expect(mockPage.goto).toHaveBeenCalledWith(
                'http://example.com',
                { waitUntil: 'networkidle' }
            );
        });

        it('should return error if page is not available', async () => {
            mockScanner.page = null;

            const result = await runTestGeneration({
                url: 'http://example.com',
                outputFile: 'test.spec.ts'
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain('Failed to get Stagehand page');
        });
    });

    describe('Element Discovery', () => {
        it('should call discoverElements', async () => {
            await runTestGeneration({
                url: 'http://example.com',
                outputFile: 'test.spec.ts'
            });

            expect(mockScanner.discoverElements).toHaveBeenCalled();
        });

        it('should return discovered element count', async () => {
            mockScanner.discoverElements.mockResolvedValue([
                { selector: '#btn1', description: 'Button 1', type: 'button' },
                { selector: '#btn2', description: 'Button 2', type: 'button' }
            ]);

            const result = await runTestGeneration({
                url: 'http://example.com',
                outputFile: 'test.spec.ts'
            });

            expect(result.elementsDiscovered).toBe(2);
        });

        it('should log warning when no elements discovered', async () => {
            mockScanner.discoverElements.mockResolvedValue([]);

            await runTestGeneration({
                url: 'http://example.com',
                outputFile: 'test.spec.ts'
            });

            expect(logger.warn).toHaveBeenCalledWith('No interactive elements discovered');
        });
    });

    describe('Test Generation', () => {
        it('should create TestGenerator and generate test', async () => {
            const mockElements = [
                { selector: '#btn', description: 'Button', type: 'button' }
            ];
            mockScanner.discoverElements.mockResolvedValue(mockElements);

            await runTestGeneration({
                url: 'http://example.com',
                outputFile: 'test.spec.ts'
            });

            expect(TestGenerator).toHaveBeenCalled();
            expect(mockGenerator.generateTest).toHaveBeenCalledWith('http://example.com', mockElements);
        });
    });

    describe('File Writing', () => {
        it('should write test file to specified path', async () => {
            await runTestGeneration({
                url: 'http://example.com',
                outputFile: 'test.spec.ts'
            });

            expect(fsPromises.writeFile).toHaveBeenCalledWith(
                'test.spec.ts',
                expect.any(String)
            );
        });

        it('should create directory if needed', async () => {
            await runTestGeneration({
                url: 'http://example.com',
                outputFile: 'tests/a11y/test.spec.ts'
            });

            expect(fsPromises.mkdir).toHaveBeenCalledWith(
                expect.stringContaining('tests'),
                { recursive: true }
            );
        });

        it('should not create directory for current directory', async () => {
            await runTestGeneration({
                url: 'http://example.com',
                outputFile: 'test.spec.ts'
            });

            expect(fsPromises.mkdir).not.toHaveBeenCalled();
        });
    });

    describe('Return Values', () => {
        it('should return success result on successful generation', async () => {
            mockScanner.discoverElements.mockResolvedValue([
                { selector: '#btn', description: 'Button', type: 'button' }
            ]);

            const result = await runTestGeneration({
                url: 'http://example.com',
                outputFile: 'test.spec.ts'
            });

            expect(result.success).toBe(true);
            expect(result.url).toBe('http://example.com');
            expect(result.outputFile).toBe('test.spec.ts');
            expect(result.elementsDiscovered).toBe(1);
            expect(result.elements).toHaveLength(1);
            expect(result.timestamp).toBeDefined();
            expect(result.error).toBeUndefined();
        });

        it('should return failure result on error', async () => {
            mockScanner.init.mockRejectedValue(new Error('Init failed'));

            const result = await runTestGeneration({
                url: 'http://example.com',
                outputFile: 'test.spec.ts'
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Init failed');
            expect(result.elementsDiscovered).toBe(0);
            expect(result.elements).toEqual([]);
        });

        it('should include elements in successful result', async () => {
            const mockElements = [
                { selector: '#btn1', description: 'Button 1', type: 'button' },
                { selector: '#input', description: 'Input field', type: 'input' }
            ];
            mockScanner.discoverElements.mockResolvedValue(mockElements);

            const result = await runTestGeneration({
                url: 'http://example.com',
                outputFile: 'test.spec.ts'
            });

            expect(result.elements).toEqual(mockElements);
        });
    });

    describe('Cleanup', () => {
        it('should always close scanner on success', async () => {
            await runTestGeneration({
                url: 'http://example.com',
                outputFile: 'test.spec.ts'
            });

            expect(mockScanner.close).toHaveBeenCalled();
        });

        it('should always close scanner on error', async () => {
            mockScanner.discoverElements.mockRejectedValue(new Error('Discovery failed'));

            await runTestGeneration({
                url: 'http://example.com',
                outputFile: 'test.spec.ts'
            });

            expect(mockScanner.close).toHaveBeenCalled();
        });
    });

    describe('Model Configuration', () => {
        it('should pass model to StagehandScanner', async () => {
            await runTestGeneration({
                url: 'http://example.com',
                outputFile: 'test.spec.ts',
                model: 'anthropic/claude-3-5-sonnet-latest'
            });

            expect(StagehandScanner).toHaveBeenCalledWith(
                expect.objectContaining({
                    model: 'anthropic/claude-3-5-sonnet-latest'
                })
            );
        });

        it('should work without model specified', async () => {
            await runTestGeneration({
                url: 'http://example.com',
                outputFile: 'test.spec.ts'
            });

            expect(StagehandScanner).toHaveBeenCalledWith(
                expect.objectContaining({
                    model: undefined
                })
            );
        });
    });
});
