// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runAxeScan } from './runner.js';
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

    it('should run axe with default tags if none provided', async () => {
        const mockResults = { violations: [] };
        (axe.run as any).mockResolvedValue(mockResults);

        await runAxeScan();

        expect(axe.run).toHaveBeenCalledWith(document, {
            runOnly: {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
            }
        });
    });

    it('should run axe with provided tags', async () => {
        const mockResults = { violations: [] };
        (axe.run as any).mockResolvedValue(mockResults);

        await runAxeScan(['wcag2a']);

        expect(axe.run).toHaveBeenCalledWith(document, {
            runOnly: {
                type: 'tag',
                values: ['wcag2a']
            }
        });
    });

    it('should return violations from axe results', async () => {
        const mockViolations = [{ id: 'color-contrast', nodes: [] }];
        const mockResults = { violations: mockViolations };
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
});
