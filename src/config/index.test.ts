/**
 * Unit tests for config management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { getConfig, updateConfig, resetConfig, DEFAULT_CONFIG } from './index.js';

describe('Config Management', () => {
    beforeEach(() => {
        // Reset to defaults before each test
        resetConfig();
    });

    describe('getConfig', () => {
        it('should return default config initially', () => {
            const config = getConfig();
            expect(config).toEqual(DEFAULT_CONFIG);
        });

        it('should return current config after updates', () => {
            updateConfig({ browser: { ...DEFAULT_CONFIG.browser, timeout: 60000 as any } });
            const config = getConfig();
            expect(config.browser.timeout).toBe(60000);
        });
    });

    describe('updateConfig', () => {
        it('should update browser config', () => {
            updateConfig({
                browser: {
                    ...DEFAULT_CONFIG.browser,
                    timeout: 45000 as any,
                    headless: false as any
                }
            });

            const config = getConfig();
            expect(config.browser.timeout).toBe(45000);
            expect(config.browser.headless).toBe(false);
        });

        it('should update scan config', () => {
            updateConfig({
                scan: {
                    ...DEFAULT_CONFIG.scan,
                    maxRetries: 5 as any
                }
            });

            const config = getConfig();
            expect(config.scan.maxRetries).toBe(5);
        });

        it('should merge partial updates', () => {
            const originalTimeout = DEFAULT_CONFIG.browser.timeout;

            updateConfig({
                browser: {
                    ...DEFAULT_CONFIG.browser,
                    headless: false as any
                }
            });

            const config = getConfig();
            expect(config.browser.headless).toBe(false);
            expect(config.browser.timeout).toBe(originalTimeout); // Should preserve other values
        });

        it('should allow multiple updates', () => {
            updateConfig({
                browser: {
                    ...DEFAULT_CONFIG.browser,
                    timeout: 10000 as any
                }
            });
            updateConfig({
                scan: {
                    ...DEFAULT_CONFIG.scan,
                    maxRetries: 10 as any
                }
            });

            const config = getConfig();
            expect(config.browser.timeout).toBe(10000);
            expect(config.scan.maxRetries).toBe(10);
        });
    });

    describe('resetConfig', () => {
        it('should reset to default config', () => {
            // Make some changes
            updateConfig({
                browser: {
                    ...DEFAULT_CONFIG.browser,
                    timeout: 99999 as any
                }
            });

            // Reset
            resetConfig();

            const config = getConfig();
            expect(config).toEqual(DEFAULT_CONFIG);
        });

        it('should reset all nested properties', () => {
            updateConfig({
                browser: {
                    ...DEFAULT_CONFIG.browser,
                    timeout: 1000 as any,
                    headless: false as any
                },
                scan: {
                    ...DEFAULT_CONFIG.scan,
                    maxRetries: 99 as any
                }
            });

            resetConfig();

            const config = getConfig();
            expect(config.browser.timeout).toBe(DEFAULT_CONFIG.browser.timeout);
            expect(config.browser.headless).toBe(DEFAULT_CONFIG.browser.headless);
            expect(config.scan.maxRetries).toBe(DEFAULT_CONFIG.scan.maxRetries);
        });
    });

    describe('DEFAULT_CONFIG', () => {
        it('should have browser configuration', () => {
            expect(DEFAULT_CONFIG.browser).toBeDefined();
            expect(DEFAULT_CONFIG.browser.timeout).toBe(30000);
            expect(DEFAULT_CONFIG.browser.headless).toBe(true);
        });

        it('should have scan configuration', () => {
            expect(DEFAULT_CONFIG.scan).toBeDefined();
            expect(DEFAULT_CONFIG.scan.maxRetries).toBe(3);
        });

        it('should have framework configuration', () => {
            expect(DEFAULT_CONFIG.framework).toBeDefined();
            expect(DEFAULT_CONFIG.framework.patterns).toBeInstanceOf(Array);
            expect(DEFAULT_CONFIG.framework.patterns.length).toBeGreaterThan(0);
        });
    });
});
