import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserService, createBrowserService } from './BrowserService.js';
import { chromium, firefox, webkit } from 'playwright';
import * as configModule from '../../config/index.js';
import { BrowserLaunchError, ServiceStateError } from '../../errors/index.js';

// Mock Playwright
vi.mock('playwright', () => ({
    chromium: { launch: vi.fn() },
    firefox: { launch: vi.fn() },
    webkit: { launch: vi.fn() },
}));

// Mock Config
vi.mock('../../config/index.js', () => ({
    getConfig: vi.fn(),
}));

// Mock Logger to silence output during tests
vi.mock('../../utils/logger.js', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    },
}));

describe('BrowserService', () => {
    let mockBrowser: any;
    let mockPage: any;
    let service: BrowserService;

    const mockConfig = {
        browser: {
            timeout: 1000,
            stabilizationDelay: 100,
            networkIdleTimeout: 1000,
            maxNavigationWaits: 1,
            postNavigationDelay: 100,
            navigationCheckInterval: 100,
        },
        scan: {
            maxRetries: 1,
            retryDelayBase: 100,
        },
    };

    beforeEach(() => {
        vi.resetAllMocks();

        // Setup default config mock
        (configModule.getConfig as any).mockReturnValue(mockConfig);

        // Setup Playwright mocks
        mockPage = {
            goto: vi.fn(),
            waitForTimeout: vi.fn(),
            evaluate: vi.fn(),
            waitForLoadState: vi.fn(),
            waitForNavigation: vi.fn().mockRejectedValue(new Error('Timeout')),
            close: vi.fn(),
        };

        mockBrowser = {
            newPage: vi.fn().mockResolvedValue(mockPage),
            close: vi.fn(),
        };

        (chromium.launch as any).mockResolvedValue(mockBrowser);
        (firefox.launch as any).mockResolvedValue(mockBrowser);
        (webkit.launch as any).mockResolvedValue(mockBrowser);

        service = new BrowserService();
    });

    describe('launch', () => {
        it('should launch chromium browser', async () => {
            await service.launch({ browserType: 'chromium', headless: true });

            expect(chromium.launch).toHaveBeenCalledWith({ headless: true });
            expect(service.isLaunched()).toBe(true);
            expect(service.getPage()).toBe(mockPage);
            expect(service.getBrowser()).toBe(mockBrowser);
        });

        it('should launch firefox browser', async () => {
            await service.launch({ browserType: 'firefox', headless: false });

            expect(firefox.launch).toHaveBeenCalledWith({ headless: false });
            expect(service.isLaunched()).toBe(true);
        });

        it('should launch webkit browser', async () => {
            await service.launch({ browserType: 'webkit', headless: true });

            expect(webkit.launch).toHaveBeenCalledWith({ headless: true });
            expect(service.isLaunched()).toBe(true);
        });

        it('should throw error if browser already launched', async () => {
            await service.launch({ browserType: 'chromium', headless: true });

            await expect(
                service.launch({ browserType: 'chromium', headless: true })
            ).rejects.toThrow(ServiceStateError);
        });

        it('should throw BrowserLaunchError on launch failure', async () => {
            (chromium.launch as any).mockRejectedValue(new Error('Failed to launch'));

            await expect(
                service.launch({ browserType: 'chromium', headless: true })
            ).rejects.toThrow(BrowserLaunchError);
        });

        it('should detect missing Playwright browsers', async () => {
            (chromium.launch as any).mockRejectedValue(new Error('No browsers found'));

            await expect(
                service.launch({ browserType: 'chromium', headless: true })
            ).rejects.toThrow(/npx playwright install/);
        });
    });

    describe('navigate', () => {
        it('should navigate to URL', async () => {
            await service.launch({ browserType: 'chromium', headless: true });
            await service.navigate('http://localhost:3000');

            expect(mockPage.goto).toHaveBeenCalledWith('http://localhost:3000', {
                waitUntil: 'networkidle',
                timeout: mockConfig.browser.timeout,
            });
        });

        it('should throw error if browser not launched', async () => {
            await expect(service.navigate('http://localhost:3000')).rejects.toThrow(
                ServiceStateError
            );
        });

        it('should use custom navigate options', async () => {
            await service.launch({ browserType: 'chromium', headless: true });
            await service.navigate('http://localhost:3000', {
                waitUntil: 'domcontentloaded',
                timeout: 5000,
            });

            expect(mockPage.goto).toHaveBeenCalledWith('http://localhost:3000', {
                waitUntil: 'domcontentloaded',
                timeout: 5000,
            });
        });
    });

    describe('waitForStability', () => {
        it('should return stable when no navigation detected', async () => {
            await service.launch({ browserType: 'chromium', headless: true });

            // Mock: waitForNavigation rejects (no navigation happened)
            mockPage.waitForNavigation.mockRejectedValue(new Error('Timeout'));

            const result = await service.waitForStability();

            expect(result.isStable).toBe(true);
            expect(result.navigationCount).toBe(0);
        });

        it('should detect navigation and retry', async () => {
            // Override config to allow more navigation waits
            (configModule.getConfig as any).mockReturnValue({
                ...mockConfig,
                browser: {
                    ...mockConfig.browser,
                    maxNavigationWaits: 3,
                },
            });

            await service.launch({ browserType: 'chromium', headless: true });

            // First call: navigation happens (resolves)
            // Second call: no navigation (rejects with timeout)
            mockPage.waitForNavigation
                .mockResolvedValueOnce(undefined) // Navigation detected
                .mockRejectedValueOnce(new Error('Timeout')); // No more navigation

            const result = await service.waitForStability();

            expect(result.isStable).toBe(true);
            expect(result.navigationCount).toBe(1);
        });

        it('should throw error if browser not launched', async () => {
            await expect(service.waitForStability()).rejects.toThrow(ServiceStateError);
        });
    });

    describe('detectReact', () => {
        it('should return true when React is detected', async () => {
            await service.launch({ browserType: 'chromium', headless: true });
            mockPage.evaluate.mockResolvedValue(true);

            const result = await service.detectReact();

            expect(result).toBe(true);
        });

        it('should return false when React is not detected', async () => {
            await service.launch({ browserType: 'chromium', headless: true });
            mockPage.evaluate.mockResolvedValue(false);

            const result = await service.detectReact();

            expect(result).toBe(false);
        });

        it('should throw error if browser not launched', async () => {
            await expect(service.detectReact()).rejects.toThrow(ServiceStateError);
        });
    });

    describe('close', () => {
        it('should close browser and page', async () => {
            await service.launch({ browserType: 'chromium', headless: true });
            await service.close();

            expect(mockPage.close).toHaveBeenCalled();
            expect(mockBrowser.close).toHaveBeenCalled();
            expect(service.isLaunched()).toBe(false);
            expect(service.getPage()).toBeNull();
            expect(service.getBrowser()).toBeNull();
        });

        it('should handle close when not launched', async () => {
            // Should not throw
            await service.close();
            expect(service.isLaunched()).toBe(false);
        });
    });

    describe('createBrowserService', () => {
        it('should create a new BrowserService instance', () => {
            const service = createBrowserService();
            expect(service).toBeInstanceOf(BrowserService);
        });
    });
});
