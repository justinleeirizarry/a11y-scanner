import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrchestrationService, createOrchestrationService } from './OrchestrationService.js';
import { ReactNotDetectedError } from '../../errors/index.js';

// Mock fs/promises
vi.mock('fs/promises', () => ({
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
}));

// Mock instances
let mockBrowserServiceInstance: any;
let mockScannerServiceInstance: any;
let mockProcessorServiceInstance: any;
let mockTestGenServiceInstance: any;

// Mock BrowserService
vi.mock('../browser/index.js', () => ({
    createBrowserService: vi.fn().mockImplementation(function () {
        return mockBrowserServiceInstance;
    }),
    BrowserService: vi.fn(),
}));

// Mock ScannerService
vi.mock('../scanner/index.js', () => ({
    createScannerService: vi.fn().mockImplementation(function () {
        return mockScannerServiceInstance;
    }),
    ScannerService: vi.fn(),
}));

// Mock ResultsProcessorService
vi.mock('../processor/index.js', () => ({
    createResultsProcessorService: vi.fn().mockImplementation(function () {
        return mockProcessorServiceInstance;
    }),
    ResultsProcessorService: vi.fn(),
}));

// Mock TestGenerationService
vi.mock('../testgen/index.js', () => ({
    createTestGenerationService: vi.fn().mockImplementation(function () {
        return mockTestGenServiceInstance;
    }),
    TestGenerationService: vi.fn(),
}));

// Mock Logger
vi.mock('../../utils/logger.js', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    },
}));

describe('OrchestrationService', () => {
    let service: OrchestrationService;
    const mockPage = { goto: vi.fn() };

    const mockScanResults = {
        url: 'http://localhost:3000',
        timestamp: '2024-01-01T00:00:00.000Z',
        browser: 'chromium',
        components: [],
        violations: [],
        summary: {
            totalComponents: 0,
            totalViolations: 0,
            violationsBySeverity: { critical: 0, serious: 0, moderate: 0, minor: 0 },
            componentsWithViolations: 0,
        },
    };

    const mockRawScanData = {
        components: [],
        violations: [],
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Reset mock instances
        mockBrowserServiceInstance = {
            launch: vi.fn().mockResolvedValue(undefined),
            navigate: vi.fn().mockResolvedValue(undefined),
            waitForStability: vi.fn().mockResolvedValue({ isStable: true }),
            detectReact: vi.fn().mockResolvedValue(true),
            getPage: vi.fn().mockReturnValue(mockPage),
            close: vi.fn().mockResolvedValue(undefined),
        };

        mockScannerServiceInstance = {
            scan: vi.fn().mockResolvedValue(mockRawScanData),
        };

        mockProcessorServiceInstance = {
            process: vi.fn().mockReturnValue(mockScanResults),
            formatAsJSON: vi.fn().mockReturnValue('{}'),
            formatForCI: vi.fn().mockReturnValue({
                passed: true,
                totalViolations: 0,
                criticalViolations: 0,
                threshold: 0,
                message: 'CI Check Passed',
            }),
        };

        mockTestGenServiceInstance = {
            init: vi.fn().mockResolvedValue(undefined),
            navigateTo: vi.fn().mockResolvedValue(undefined),
            discoverElements: vi.fn().mockResolvedValue([]),
            generateTest: vi.fn().mockReturnValue('test content'),
            close: vi.fn().mockResolvedValue(undefined),
        };

        service = new OrchestrationService();
    });

    describe('performScan', () => {
        it('should perform a basic scan', async () => {
            const result = await service.performScan({
                url: 'http://localhost:3000',
                browser: 'chromium',
                headless: true,
            });

            expect(mockBrowserServiceInstance.launch).toHaveBeenCalledWith({
                browserType: 'chromium',
                headless: true,
            });
            expect(mockBrowserServiceInstance.navigate).toHaveBeenCalledWith('http://localhost:3000');
            expect(mockBrowserServiceInstance.detectReact).toHaveBeenCalled();
            expect(mockScannerServiceInstance.scan).toHaveBeenCalled();
            expect(result.results).toEqual(mockScanResults);
        });

        it('should throw ReactNotDetectedError when React not found', async () => {
            mockBrowserServiceInstance.detectReact.mockResolvedValue(false);

            await expect(
                service.performScan({
                    url: 'http://localhost:3000',
                    browser: 'chromium',
                    headless: true,
                })
            ).rejects.toThrow(ReactNotDetectedError);

            // Should still close browser
            expect(mockBrowserServiceInstance.close).toHaveBeenCalled();
        });

        it('should handle CI mode', async () => {
            const result = await service.performScan({
                url: 'http://localhost:3000',
                browser: 'chromium',
                headless: true,
                ciMode: true,
                ciThreshold: 5,
            });

            expect(mockProcessorServiceInstance.formatForCI).toHaveBeenCalledWith(
                mockScanResults,
                5
            );
            expect(result.ciPassed).toBe(true);
        });

        it('should pass tags and keyboard test options', async () => {
            await service.performScan({
                url: 'http://localhost:3000',
                browser: 'chromium',
                headless: true,
                tags: ['wcag2a'],
                includeKeyboardTests: true,
            });

            expect(mockScannerServiceInstance.scan).toHaveBeenCalledWith(mockPage, {
                tags: ['wcag2a'],
                includeKeyboardTests: true,
            });
        });

        it('should always close browser on error', async () => {
            mockScannerServiceInstance.scan.mockRejectedValue(new Error('Scan failed'));

            await expect(
                service.performScan({
                    url: 'http://localhost:3000',
                    browser: 'chromium',
                    headless: true,
                })
            ).rejects.toThrow('Scan failed');

            expect(mockBrowserServiceInstance.close).toHaveBeenCalled();
        });
    });

    describe('performTestGeneration', () => {
        it('should generate tests successfully', async () => {
            const result = await service.performTestGeneration({
                url: 'http://example.com',
                outputFile: 'tests/test.spec.ts',
            });

            expect(mockTestGenServiceInstance.init).toHaveBeenCalled();
            expect(mockTestGenServiceInstance.navigateTo).toHaveBeenCalledWith('http://example.com');
            expect(mockTestGenServiceInstance.discoverElements).toHaveBeenCalled();
            expect(mockTestGenServiceInstance.generateTest).toHaveBeenCalled();
            expect(result.success).toBe(true);
        });

        it('should handle test generation failure', async () => {
            mockTestGenServiceInstance.navigateTo.mockRejectedValue(new Error('Navigation failed'));

            const result = await service.performTestGeneration({
                url: 'http://example.com',
                outputFile: 'tests/test.spec.ts',
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Navigation failed');

            // Should still close
            expect(mockTestGenServiceInstance.close).toHaveBeenCalled();
        });

        it('should pass model and verbose options', async () => {
            await service.performTestGeneration({
                url: 'http://example.com',
                outputFile: 'tests/test.spec.ts',
                model: 'anthropic/claude-3',
                verbose: true,
            });

            expect(mockTestGenServiceInstance.init).toHaveBeenCalledWith({
                model: 'anthropic/claude-3',
                verbose: true,
            });
        });
    });

    describe('createOrchestrationService', () => {
        it('should create a new OrchestrationService instance', () => {
            const service = createOrchestrationService();
            expect(service).toBeInstanceOf(OrchestrationService);
        });
    });
});
