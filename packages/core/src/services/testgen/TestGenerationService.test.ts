import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Effect, Exit } from 'effect';

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
            await Effect.runPromise(service.init());

            const isInitialized = await Effect.runPromise(service.isInitialized());
            expect(isInitialized).toBe(true);
        });

        it('should accept model configuration', async () => {
            await Effect.runPromise(service.init({ model: 'anthropic/claude-3' }));

            const isInitialized = await Effect.runPromise(service.isInitialized());
            expect(isInitialized).toBe(true);
        });

        it('should accept verbose configuration', async () => {
            await Effect.runPromise(service.init({ verbose: true }));

            const isInitialized = await Effect.runPromise(service.isInitialized());
            expect(isInitialized).toBe(true);
        });
    });

    describe('isInitialized', () => {
        it('should return false before init', async () => {
            const isInitialized = await Effect.runPromise(service.isInitialized());
            expect(isInitialized).toBe(false);
        });

        it('should return true after init', async () => {
            await Effect.runPromise(service.init());

            const isInitialized = await Effect.runPromise(service.isInitialized());
            expect(isInitialized).toBe(true);
        });
    });

    describe('getPage', () => {
        it('should fail with TestGenNotInitializedError before init', async () => {
            const exit = await Effect.runPromiseExit(service.getPage());

            expect(Exit.isFailure(exit)).toBe(true);
            if (Exit.isFailure(exit) && exit.cause._tag === 'Fail') {
                expect(exit.cause.error._tag).toBe('TestGenNotInitializedError');
            }
        });

        it('should return page from scanner after init', async () => {
            const mockPage = { goto: vi.fn() };
            mockScannerInstance.page = mockPage;

            await Effect.runPromise(service.init());

            const page = await Effect.runPromise(service.getPage());
            expect(page).toBe(mockPage);
        });
    });

    describe('navigateTo', () => {
        it('should fail with TestGenNotInitializedError if not initialized', async () => {
            const exit = await Effect.runPromiseExit(service.navigateTo('http://example.com'));

            expect(Exit.isFailure(exit)).toBe(true);
            if (Exit.isFailure(exit) && exit.cause._tag === 'Fail') {
                expect(exit.cause.error._tag).toBe('TestGenNotInitializedError');
            }
        });
    });

    describe('discoverElements', () => {
        it('should fail with TestGenNotInitializedError if not initialized', async () => {
            const exit = await Effect.runPromiseExit(service.discoverElements());

            expect(Exit.isFailure(exit)).toBe(true);
            if (Exit.isFailure(exit) && exit.cause._tag === 'Fail') {
                expect(exit.cause.error._tag).toBe('TestGenNotInitializedError');
            }
        });

        it('should return elements from scanner', async () => {
            const mockElements = [
                { selector: 'button', description: 'Click me', type: 'button' as const },
            ];
            mockScannerInstance.discoverElements.mockResolvedValue(mockElements);

            await Effect.runPromise(service.init());
            const elements = await Effect.runPromise(service.discoverElements());

            expect(elements).toEqual(mockElements);
        });
    });

    describe('generateTest', () => {
        it('should generate test content', async () => {
            const elements = [
                {
                    selector: 'button',
                    description: 'Click me button',
                    type: 'button' as const,
                },
            ];

            const result = await Effect.runPromise(service.generateTest('http://example.com', elements));

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
            await Effect.runPromise(service.close());

            const isInitialized = await Effect.runPromise(service.isInitialized());
            expect(isInitialized).toBe(false);
        });

        it('should close scanner after init', async () => {
            await Effect.runPromise(service.init());
            await Effect.runPromise(service.close());

            expect(mockScannerInstance.close).toHaveBeenCalled();

            const isInitialized = await Effect.runPromise(service.isInitialized());
            expect(isInitialized).toBe(false);
        });
    });

    describe('createTestGenerationService', () => {
        it('should create a new TestGenerationService instance', () => {
            const service = createTestGenerationService();
            expect(service).toBeInstanceOf(TestGenerationService);
        });
    });
});
