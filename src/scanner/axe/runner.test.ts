// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runAxeScan, runAxeFullScan } from './runner.js';
import axe from 'axe-core';

// Mock axe-core
vi.mock('axe-core', () => ({
    default: {
        run: vi.fn()
    }
}));

describe('Axe Runner', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    const createMockResults = () => ({
        violations: [],
        passes: [],
        incomplete: [],
        inapplicable: []
    });

    it('should run axe with default tags if none provided', async () => {
        const mockResults = createMockResults();
        (axe.run as any).mockResolvedValue(mockResults);

        await runAxeScan();

        expect(axe.run).toHaveBeenCalledWith(document, {
            resultTypes: ['violations', 'passes', 'incomplete', 'inapplicable'],
            runOnly: {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']
            }
        });
    });

    it('should run axe with provided tags', async () => {
        const mockResults = createMockResults();
        (axe.run as any).mockResolvedValue(mockResults);

        await runAxeScan(['wcag2a']);

        expect(axe.run).toHaveBeenCalledWith(document, {
            resultTypes: ['violations', 'passes', 'incomplete', 'inapplicable'],
            runOnly: {
                type: 'tag',
                values: ['wcag2a']
            }
        });
    });

    it('should return violations from axe results', async () => {
        const mockViolations = [{ id: 'color-contrast', nodes: [], tags: ['wcag2aa'] }];
        const mockResults = {
            violations: mockViolations,
            passes: [],
            incomplete: [],
            inapplicable: []
        };
        (axe.run as any).mockResolvedValue(mockResults);

        const result = await runAxeScan();

        expect(result).toEqual(mockViolations);
    });

    it('should handle errors gracefully', async () => {
        (axe.run as any).mockRejectedValue(new Error('Axe failed'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const result = await runAxeScan();

        expect(result).toEqual([]);
        expect(consoleSpy).toHaveBeenCalledWith('Axe scan failed:', expect.any(Error));
    });

    describe('runAxeFullScan', () => {
        it('should return all result types', async () => {
            const mockResults = {
                violations: [{ id: 'violation-1', nodes: [], tags: ['wcag2a'] }],
                passes: [{ id: 'pass-1', nodes: [], tags: ['wcag2aa'] }],
                incomplete: [{ id: 'incomplete-1', nodes: [], tags: ['wcag21aa'] }],
                inapplicable: [{ id: 'inapplicable-1', description: 'Test', help: 'Help', helpUrl: 'url', tags: ['wcag2a'] }]
            };
            (axe.run as any).mockResolvedValue(mockResults);

            const result = await runAxeFullScan();

            expect(result.violations).toEqual(mockResults.violations);
            expect(result.passes).toEqual(mockResults.passes);
            expect(result.incomplete).toEqual(mockResults.incomplete);
            expect(result.inapplicable).toHaveLength(1);
            expect(result.inapplicable[0].id).toBe('inapplicable-1');
        });

        it('should return empty arrays on error', async () => {
            (axe.run as any).mockRejectedValue(new Error('Axe failed'));
            vi.spyOn(console, 'error').mockImplementation(() => { });

            const result = await runAxeFullScan();

            expect(result.violations).toEqual([]);
            expect(result.passes).toEqual([]);
            expect(result.incomplete).toEqual([]);
            expect(result.inapplicable).toEqual([]);
        });
    });
});
