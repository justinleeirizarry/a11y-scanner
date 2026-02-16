/**
 * Tests for Zod configuration schema validation
 */
import { describe, it, expect } from 'vitest';
import {
    scannerConfigSchema,
    browserConfigSchema,
    scanConfigSchema,
    frameworkConfigSchema,
    validateConfig,
    parseConfig,
    formatConfigErrors,
} from './schema.js';

describe('Config Schema Validation', () => {
    describe('browserConfigSchema', () => {
        it('should accept valid browser config', () => {
            const config = {
                headless: true,
                timeout: 30000,
                stabilizationDelay: 3000,
                maxNavigationWaits: 3,
                navigationCheckInterval: 1000,
                networkIdleTimeout: 5000,
                postNavigationDelay: 2000,
            };

            const result = browserConfigSchema.safeParse(config);
            expect(result.success).toBe(true);
        });

        it('should apply defaults for missing fields', () => {
            const result = browserConfigSchema.parse({});

            expect(result.headless).toBe(true);
            expect(result.timeout).toBe(30000);
            expect(result.stabilizationDelay).toBe(3000);
        });

        it('should reject negative timeout', () => {
            const result = browserConfigSchema.safeParse({ timeout: -1000 });
            expect(result.success).toBe(false);
        });

        it('should reject non-integer timeout', () => {
            const result = browserConfigSchema.safeParse({ timeout: 30000.5 });
            expect(result.success).toBe(false);
        });

        it('should reject non-boolean headless', () => {
            const result = browserConfigSchema.safeParse({ headless: 'yes' });
            expect(result.success).toBe(false);
        });
    });

    describe('scanConfigSchema', () => {
        it('should accept valid scan config', () => {
            const config = {
                maxRetries: 5,
                retryDelayBase: 1000,
                maxElementsToCheck: 200,
            };

            const result = scanConfigSchema.safeParse(config);
            expect(result.success).toBe(true);
        });

        it('should apply defaults', () => {
            const result = scanConfigSchema.parse({});

            expect(result.maxRetries).toBe(3);
            expect(result.retryDelayBase).toBe(2000);
            expect(result.maxElementsToCheck).toBe(100);
        });

        it('should allow zero retries', () => {
            const result = scanConfigSchema.safeParse({ maxRetries: 0 });
            expect(result.success).toBe(true);
        });

        it('should reject negative retries', () => {
            const result = scanConfigSchema.safeParse({ maxRetries: -1 });
            expect(result.success).toBe(false);
        });
    });

    describe('frameworkConfigSchema', () => {
        it('should accept valid framework config', () => {
            const config = {
                patterns: ['ServerRoot', 'AppRouter', 'CustomComponent'],
            };

            const result = frameworkConfigSchema.safeParse(config);
            expect(result.success).toBe(true);
        });

        it('should apply default patterns', () => {
            const result = frameworkConfigSchema.parse({});

            expect(result.patterns).toContain('ServerRoot');
            expect(result.patterns).toContain('AppRouter');
            expect(result.patterns).toContain('Fragment');
        });

        it('should allow empty patterns array', () => {
            const result = frameworkConfigSchema.safeParse({ patterns: [] });
            expect(result.success).toBe(true);
        });

        it('should reject non-string patterns', () => {
            const result = frameworkConfigSchema.safeParse({ patterns: [123, 'valid'] });
            expect(result.success).toBe(false);
        });
    });

    describe('scannerConfigSchema (full config)', () => {
        it('should accept valid full config', () => {
            const config = {
                browser: {
                    headless: false,
                    timeout: 60000,
                },
                scan: {
                    maxRetries: 5,
                },
                framework: {
                    patterns: ['CustomWrapper'],
                },
            };

            const result = scannerConfigSchema.safeParse(config);
            expect(result.success).toBe(true);
        });

        it('should apply all defaults for empty config', () => {
            const result = scannerConfigSchema.parse({});

            expect(result.browser.headless).toBe(true);
            expect(result.scan.maxRetries).toBe(3);
            expect(result.framework.patterns.length).toBeGreaterThan(0);
        });

        it('should merge partial config with defaults', () => {
            const result = scannerConfigSchema.parse({
                browser: { timeout: 60000 },
            });

            // Custom value preserved
            expect(result.browser.timeout).toBe(60000);
            // Defaults applied
            expect(result.browser.headless).toBe(true);
            expect(result.scan.maxRetries).toBe(3);
        });
    });

    describe('validateConfig', () => {
        it('should return success for valid config', () => {
            const result = validateConfig({});
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.errors).toBeUndefined();
        });

        it('should return errors for invalid config', () => {
            const result = validateConfig({
                browser: { timeout: 'invalid' },
            });
            expect(result.success).toBe(false);
            expect(result.errors).toBeDefined();
            expect(result.data).toBeUndefined();
        });

        it('should validate nested properties', () => {
            const result = validateConfig({
                browser: { timeout: -100 },
            });
            expect(result.success).toBe(false);
        });
    });

    describe('parseConfig', () => {
        it('should parse valid config', () => {
            const config = parseConfig({ browser: { headless: false } });
            expect(config.browser.headless).toBe(false);
        });

        it('should throw for invalid config', () => {
            expect(() =>
                parseConfig({ browser: { timeout: 'not a number' } })
            ).toThrow();
        });
    });

    describe('formatConfigErrors', () => {
        it('should format errors as readable messages', () => {
            const result = validateConfig({
                browser: { timeout: 'invalid', headless: 'not boolean' },
            });

            expect(result.success).toBe(false);
            if (result.errors) {
                const messages = formatConfigErrors(result.errors);
                expect(messages.length).toBeGreaterThan(0);
                expect(messages.some((m) => m.includes('timeout'))).toBe(true);
            }
        });

        it('should include path in error message', () => {
            const result = validateConfig({
                browser: { timeout: -100 },
            });

            expect(result.success).toBe(false);
            if (result.errors) {
                const messages = formatConfigErrors(result.errors);
                expect(messages.some((m) => m.includes('browser.timeout'))).toBe(true);
            }
        });
    });

    describe('Type inference', () => {
        it('should infer correct types from schema', () => {
            const config = scannerConfigSchema.parse({});

            // These should compile without errors
            const _headless: boolean = config.browser.headless;
            const _timeout: number = config.browser.timeout;
            const _patterns: string[] = config.framework.patterns;

            expect(_headless).toBe(true);
            expect(_timeout).toBe(30000);
            expect(_patterns).toBeInstanceOf(Array);
        });
    });

    describe('Edge cases', () => {
        it('should handle null values', () => {
            const result = validateConfig(null);
            expect(result.success).toBe(false);
        });

        it('should handle undefined values', () => {
            const result = validateConfig(undefined);
            expect(result.success).toBe(false);
        });

        it('should handle extra unknown fields', () => {
            // Zod by default strips unknown fields
            const result = scannerConfigSchema.parse({
                unknownField: 'should be ignored',
                browser: { unknownBrowserField: true },
            });

            expect(result).not.toHaveProperty('unknownField');
            expect(result.browser).not.toHaveProperty('unknownBrowserField');
        });

        it('should handle boundary values', () => {
            const result = scannerConfigSchema.safeParse({
                browser: {
                    timeout: Number.MAX_SAFE_INTEGER,
                    stabilizationDelay: 0, // Minimum allowed
                },
            });
            expect(result.success).toBe(true);
        });
    });
});
