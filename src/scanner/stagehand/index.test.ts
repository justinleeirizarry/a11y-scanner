/**
 * Tests for StagehandScanner class
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StagehandScanner } from './index.js';
import { Stagehand } from '@browserbasehq/stagehand';

// Create mock implementations
let mockStagehandInstance: any;

vi.mock('@browserbasehq/stagehand', () => {
    return {
        Stagehand: vi.fn().mockImplementation(function() {
            return mockStagehandInstance;
        })
    };
});

// Mock logger
vi.mock('../../utils/logger.js', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn()
    }
}));

describe('StagehandScanner', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Reset mock instance with default behavior
        mockStagehandInstance = {
            init: vi.fn().mockResolvedValue(undefined),
            observe: vi.fn().mockResolvedValue([]),
            close: vi.fn().mockResolvedValue(undefined),
            page: { goto: vi.fn() }
        };
    });

    describe('constructor', () => {
        it('should create instance with config', () => {
            const scanner = new StagehandScanner({
                enabled: true,
                model: 'openai/gpt-4o',
                verbose: false
            });

            expect(scanner).toBeDefined();
        });
    });

    describe('init', () => {
        it('should not initialize when disabled', async () => {
            const scanner = new StagehandScanner({
                enabled: false
            });

            await scanner.init('http://example.com');

            expect(Stagehand).not.toHaveBeenCalled();
        });

        it('should initialize Stagehand when enabled', async () => {
            const scanner = new StagehandScanner({
                enabled: true,
                model: 'openai/gpt-4o-mini'
            });

            await scanner.init('http://example.com');

            expect(Stagehand).toHaveBeenCalledWith({
                env: 'LOCAL',
                model: 'openai/gpt-4o-mini',
                verbose: 0
            });
            expect(mockStagehandInstance.init).toHaveBeenCalled();
        });

        it('should use default model if not specified', async () => {
            const scanner = new StagehandScanner({
                enabled: true
            });

            await scanner.init('http://example.com');

            expect(Stagehand).toHaveBeenCalledWith(
                expect.objectContaining({
                    model: 'openai/gpt-4o-mini'
                })
            );
        });

        it('should set verbose level 2 when verbose is true', async () => {
            const scanner = new StagehandScanner({
                enabled: true,
                verbose: true
            });

            await scanner.init('http://example.com');

            expect(Stagehand).toHaveBeenCalledWith(
                expect.objectContaining({
                    verbose: 2
                })
            );
        });

        it('should throw error if Stagehand init fails', async () => {
            mockStagehandInstance.init.mockRejectedValue(new Error('API key invalid'));

            const scanner = new StagehandScanner({
                enabled: true
            });

            await expect(scanner.init('http://example.com')).rejects.toThrow('API key invalid');
        });
    });

    describe('page getter', () => {
        it('should return null when not initialized', () => {
            const scanner = new StagehandScanner({ enabled: true });
            expect(scanner.page).toBeNull();
        });

        it('should return page after initialization', async () => {
            const mockPage = { goto: vi.fn() };
            mockStagehandInstance.page = mockPage;

            const scanner = new StagehandScanner({ enabled: true });
            await scanner.init('http://example.com');

            expect(scanner.page).toBe(mockPage);
        });
    });

    describe('discoverElements', () => {
        it('should throw if not initialized', async () => {
            const scanner = new StagehandScanner({ enabled: true });

            await expect(scanner.discoverElements()).rejects.toThrow('Stagehand not initialized');
        });

        it('should call stagehand.observe with correct prompt', async () => {
            const scanner = new StagehandScanner({ enabled: true });
            await scanner.init('http://example.com');
            await scanner.discoverElements();

            expect(mockStagehandInstance.observe).toHaveBeenCalledWith(
                expect.stringContaining('interactive elements')
            );
        });

        it('should return empty array when observe returns nothing', async () => {
            mockStagehandInstance.observe.mockResolvedValue([]);

            const scanner = new StagehandScanner({ enabled: true });
            await scanner.init('http://example.com');
            const elements = await scanner.discoverElements();

            expect(elements).toEqual([]);
        });

        it('should transform observed actions into ElementDiscovery objects', async () => {
            const mockActions = [
                { selector: '#submit-btn', description: 'Submit button', method: 'click' },
                { selector: '#email-input', description: 'Email input field', method: 'fill' }
            ];
            mockStagehandInstance.observe.mockResolvedValue(mockActions);

            const scanner = new StagehandScanner({ enabled: true });
            await scanner.init('http://example.com');
            const elements = await scanner.discoverElements();

            expect(elements).toHaveLength(2);
            expect(elements[0]).toEqual({
                selector: '#submit-btn',
                description: 'Submit button',
                suggestedMethod: 'click',
                type: 'button'
            });
            expect(elements[1]).toEqual({
                selector: '#email-input',
                description: 'Email input field',
                suggestedMethod: 'fill',
                type: 'input'
            });
        });

        it('should categorize elements correctly', async () => {
            const mockActions = [
                { selector: '#btn', description: 'Click this button', method: 'click' },
                { selector: '#link', description: 'Navigation link to home', method: 'click' },
                { selector: '#text', description: 'Text input for name', method: 'fill' },
                { selector: '#check', description: 'Checkbox for terms', method: 'check' },
                { selector: '#radio', description: 'Radio option', method: 'check' },
                { selector: '#select', description: 'Select dropdown menu', method: 'selectOption' },
                { selector: '#custom', description: 'Custom widget', method: 'click' }
            ];
            mockStagehandInstance.observe.mockResolvedValue(mockActions);

            const scanner = new StagehandScanner({ enabled: true });
            await scanner.init('http://example.com');
            const elements = await scanner.discoverElements();

            expect(elements[0].type).toBe('button');
            expect(elements[1].type).toBe('link');
            expect(elements[2].type).toBe('input');
            expect(elements[3].type).toBe('checkbox');
            expect(elements[4].type).toBe('radio');
            expect(elements[5].type).toBe('select');
            expect(elements[6].type).toBe('custom');
        });

        it('should return empty array on observe error', async () => {
            mockStagehandInstance.observe.mockRejectedValue(new Error('Observe failed'));

            const scanner = new StagehandScanner({ enabled: true });
            await scanner.init('http://example.com');
            const elements = await scanner.discoverElements();

            expect(elements).toEqual([]);
        });
    });

    describe('close', () => {
        it('should close stagehand when initialized', async () => {
            const scanner = new StagehandScanner({ enabled: true });
            await scanner.init('http://example.com');
            await scanner.close();

            expect(mockStagehandInstance.close).toHaveBeenCalled();
        });

        it('should not throw when not initialized', async () => {
            const scanner = new StagehandScanner({ enabled: true });

            // Should not throw
            await expect(scanner.close()).resolves.toBeUndefined();
        });
    });
});
