import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mock instances that we can access in tests
let mockScannerInstance: any;
let mockGeneratorInstance: any;

// Mock StagehandScanner
vi.mock('../../scanner/stagehand/index.js', () => ({
    StagehandScanner: vi.fn().mockImplementation(function () {
        return mockScannerInstance;
    }),
}));

// Mock TestGenerator
vi.mock('../../scanner/stagehand/test-generator.js', () => ({
    TestGenerator: vi.fn().mockImplementation(function () {
        return mockGeneratorInstance;
    }),
}));

// Mock Logger to silence output during tests
vi.mock('../../utils/logger.js', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        setLevel: vi.fn(),
    },
}));

// Import after mocks are set up
import { TestGenerationService, createTestGenerationService } from './TestGenerationService.js';

describe('TestGenerationService', () => {
    let service: TestGenerationService;

    beforeEach(() => {
        vi.clearAllMocks();

        // Reset mock instances
        mockScannerInstance = {
            page: null,
            init: vi.fn().mockResolvedValue(undefined),
            discoverElements: vi.fn().mockResolvedValue([]),
            close: vi.fn().mockResolvedValue(undefined),
        };

        mockGeneratorInstance = {
            generateTest: vi.fn().mockReturnValue('test file content'),
        };

        service = new TestGenerationService();
    });

    describe('init', () => {
        it('should initialize the service', async () => {
            await service.init();
            expect(service.isInitialized()).toBe(true);
        });

        it('should accept model configuration', async () => {
            await service.init({ model: 'anthropic/claude-3' });
            expect(service.isInitialized()).toBe(true);
        });

        it('should accept verbose configuration', async () => {
            await service.init({ verbose: true });
            expect(service.isInitialized()).toBe(true);
        });
    });

    describe('isInitialized', () => {
        it('should return false before init', () => {
            expect(service.isInitialized()).toBe(false);
        });

        it('should return true after init', async () => {
            await service.init();
            expect(service.isInitialized()).toBe(true);
        });
    });

    describe('getPage', () => {
        it('should return null before init', () => {
            expect(service.getPage()).toBeNull();
        });

        it('should return page from scanner after init', async () => {
            const mockPage = { goto: vi.fn() };
            mockScannerInstance.page = mockPage;

            await service.init();
            expect(service.getPage()).toBe(mockPage);
        });
    });

    describe('navigateTo', () => {
        it('should throw if not initialized', async () => {
            await expect(service.navigateTo('http://example.com')).rejects.toThrow(
                'not initialized'
            );
        });
    });

    describe('discoverElements', () => {
        it('should throw if not initialized', async () => {
            await expect(service.discoverElements()).rejects.toThrow('not initialized');
        });

        it('should return elements from scanner', async () => {
            const mockElements = [
                { selector: 'button', description: 'Click me', type: 'button' as const },
            ];
            mockScannerInstance.discoverElements.mockResolvedValue(mockElements);

            await service.init();
            const elements = await service.discoverElements();

            expect(elements).toEqual(mockElements);
        });
    });

    describe('generateTest', () => {
        it('should generate test content', () => {
            const elements = [
                {
                    selector: 'button',
                    description: 'Click me button',
                    type: 'button' as const,
                },
            ];

            const result = service.generateTest('http://example.com', elements);

            expect(result).toBe('test file content');
            expect(mockGeneratorInstance.generateTest).toHaveBeenCalledWith(
                'http://example.com',
                elements
            );
        });
    });

    describe('close', () => {
        it('should handle close when not initialized', async () => {
            // Should not throw
            await service.close();
            expect(service.isInitialized()).toBe(false);
        });

        it('should close scanner after init', async () => {
            await service.init();
            await service.close();

            expect(mockScannerInstance.close).toHaveBeenCalled();
            expect(service.isInitialized()).toBe(false);
        });
    });

    describe('createTestGenerationService', () => {
        it('should create a new TestGenerationService instance', () => {
            const service = createTestGenerationService();
            expect(service).toBeInstanceOf(TestGenerationService);
        });
    });
});
