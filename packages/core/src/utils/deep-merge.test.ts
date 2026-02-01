import { describe, it, expect } from 'vitest';
import { deepMerge, type DeepPartial } from './deep-merge.js';

describe('deepMerge', () => {
    it('merges flat objects', () => {
        const target = { a: 1, b: 2 };
        const source = { b: 3, c: 4 };

        const result = deepMerge(target, source);

        expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('deeply merges nested objects', () => {
        const target = {
            level1: {
                a: 1,
                b: 2,
                level2: {
                    x: 10,
                    y: 20,
                },
            },
        };
        const source: DeepPartial<typeof target> = {
            level1: {
                b: 3,
                level2: {
                    y: 30,
                },
            },
        };

        const result = deepMerge(target, source);

        expect(result).toEqual({
            level1: {
                a: 1,
                b: 3,
                level2: {
                    x: 10,
                    y: 30,
                },
            },
        });
    });

    it('replaces arrays entirely', () => {
        const target = { items: [1, 2, 3] };
        const source = { items: [4, 5] };

        const result = deepMerge(target, source);

        expect(result).toEqual({ items: [4, 5] });
    });

    it('does not modify original objects', () => {
        const target = { a: 1, nested: { b: 2 } };
        const source = { nested: { b: 3 } };

        const result = deepMerge(target, source);

        expect(target.nested.b).toBe(2);
        expect(result.nested.b).toBe(3);
    });

    it('skips undefined values in source', () => {
        const target = { a: 1, b: 2 };
        const source: DeepPartial<typeof target> = { a: undefined, b: 3 };

        const result = deepMerge(target, source);

        expect(result).toEqual({ a: 1, b: 3 });
    });

    it('handles null values in source', () => {
        const target = { a: 1, b: { c: 2 } as { c: number } | null };
        const source = { b: null };

        const result = deepMerge(target, source);

        expect(result).toEqual({ a: 1, b: null });
    });

    it('works with real config structure', () => {
        const defaultConfig = {
            browser: {
                headless: true,
                timeout: 30000,
                stabilizationDelay: 3000,
            },
            scan: {
                maxRetries: 3,
                retryDelayBase: 2000,
            },
        };

        const userConfig: DeepPartial<typeof defaultConfig> = {
            browser: {
                timeout: 60000,
            },
        };

        const result = deepMerge(defaultConfig, userConfig);

        expect(result).toEqual({
            browser: {
                headless: true,
                timeout: 60000,
                stabilizationDelay: 3000,
            },
            scan: {
                maxRetries: 3,
                retryDelayBase: 2000,
            },
        });
    });

    it('handles deeply nested partial updates', () => {
        const target = {
            a: {
                b: {
                    c: {
                        d: 1,
                        e: 2,
                    },
                },
            },
        };
        const source: DeepPartial<typeof target> = {
            a: {
                b: {
                    c: {
                        e: 3,
                    },
                },
            },
        };

        const result = deepMerge(target, source);

        expect(result).toEqual({
            a: {
                b: {
                    c: {
                        d: 1,
                        e: 3,
                    },
                },
            },
        });
    });

    it('handles empty objects', () => {
        const target = { a: 1 };
        const source = {};

        const result = deepMerge(target, source);

        expect(result).toEqual({ a: 1 });
    });

    it('handles source with new keys', () => {
        const target = { a: 1 } as Record<string, unknown>;
        const source = { b: 2, c: { d: 3 } };

        const result = deepMerge(target, source);

        expect(result).toEqual({ a: 1, b: 2, c: { d: 3 } });
    });

    it('replaces primitives with objects', () => {
        const target = { a: 1 as number | { nested: number } };
        const source = { a: { nested: 2 } };

        const result = deepMerge(target, source);

        expect(result).toEqual({ a: { nested: 2 } });
    });

    it('replaces objects with primitives', () => {
        const target = { a: { nested: 1 } as { nested: number } | number };
        const source = { a: 2 };

        const result = deepMerge(target, source);

        expect(result).toEqual({ a: 2 });
    });
});
