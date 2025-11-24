import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runScan } from './launcher.js';
import { chromium, firefox, webkit } from 'playwright';
import * as configModule from '../config/index.js';
import { ReactNotDetectedError, BrowserLaunchError } from '../errors/index.js';

// Mock Playwright
vi.mock('playwright', () => ({
    chromium: { launch: vi.fn() },
    firefox: { launch: vi.fn() },
    webkit: { launch: vi.fn() }
}));

// Mock Config
vi.mock('../config/index.js', () => ({
    getConfig: vi.fn()
}));

// Mock Logger to silence output during tests
vi.mock('../utils/logger.js', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn()
    }
}));

describe('Browser Launcher', () => {
    let mockBrowser: any;
    let mockPage: any;

    const mockConfig = {
        browser: {
            timeout: 1000,
            stabilizationDelay: 100,
            networkIdleTimeout: 1000,
            maxNavigationWaits: 1,
            postNavigationDelay: 100,
            navigationCheckInterval: 100
        },
        scan: {
            maxRetries: 1,
            retryDelayBase: 100
        }
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
            addScriptTag: vi.fn(),
            waitForLoadState: vi.fn(),
            waitForNavigation: vi.fn().mockRejectedValue(new Error('Timeout')), // Default to no navigation
            close: vi.fn()
        };

        mockBrowser = {
            newPage: vi.fn().mockResolvedValue(mockPage),
            close: vi.fn()
        };

        (chromium.launch as any).mockResolvedValue(mockBrowser);
        (firefox.launch as any).mockResolvedValue(mockBrowser);
        (webkit.launch as any).mockResolvedValue(mockBrowser);
    });

    it('should launch chromium by default and return results', async () => {
        // Mock React detection (first evaluate call)
        mockPage.evaluate.mockImplementationOnce(() => true);

        // Mock Scanner check (second evaluate call inside withRetry)
        mockPage.evaluate.mockImplementationOnce(() => true);

        // Mock Scan execution (third evaluate call inside withRetry)
        const mockScanData = {
            components: [],
            violations: [],
            accessibilityTree: { children: [] }
        };
        mockPage.evaluate.mockImplementationOnce(() => mockScanData);

        const results = await runScan({
            url: 'http://localhost:3000',
            browser: 'chromium',
            headless: true,
            tags: ['wcag2a']
        });

        expect(chromium.launch).toHaveBeenCalledWith({ headless: true });
        expect(mockPage.goto).toHaveBeenCalledWith('http://localhost:3000', expect.any(Object));
        expect(results.summary.totalViolations).toBe(0);
    });

    it('should throw ReactNotDetectedError if React is not found', async () => {
        // Mock React detection to return false
        mockPage.evaluate.mockImplementationOnce(() => false);

        await expect(runScan({
            url: 'http://localhost:3000',
            browser: 'chromium',
            headless: true
        })).rejects.toThrow(ReactNotDetectedError);
    });

    it('should throw BrowserLaunchError if browser fails to launch', async () => {
        (chromium.launch as any).mockRejectedValue(new Error('Failed to launch'));

        await expect(runScan({
            url: 'http://localhost:3000',
            browser: 'chromium',
            headless: true
        })).rejects.toThrow(BrowserLaunchError);
    });

    it('should handle scanner injection failure', async () => {
        // Mock React detection
        mockPage.evaluate.mockImplementationOnce(() => true);

        // Mock script injection failure
        mockPage.addScriptTag.mockRejectedValue(new Error('File not found'));

        await expect(runScan({
            url: 'http://localhost:3000',
            browser: 'chromium',
            headless: true
        })).rejects.toThrow(/Failed to inject scanner bundle/);
    });
});
