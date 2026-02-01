/**
 * Axe-core accessibility scanner runner
 */

// @ts-ignore - axe-core is bundled as IIFE by esbuild and TypeScript cannot resolve the runtime import
import axe from 'axe-core';
import type { RunOptions, Result } from 'axe-core';
import type { AxeResult, AxeViolation } from '../../types.js';

// Full axe-core result structure
export interface AxeFullResults {
    violations: AxeViolation[];
    passes: AxeResult[];
    incomplete: AxeResult[];
    inapplicable: Array<{
        id: string;
        description: string;
        help: string;
        helpUrl: string;
        tags: string[];
    }>;
    error?: {
        message: string;
        stack?: string;
    };
}

/**
 * Run axe-core accessibility scan and return all result types
 */
export async function runAxeScan(tags?: string[]): Promise<AxeViolation[]> {
    const results = await runAxeFullScan(tags);
    return results.violations;
}

/**
 * Run axe-core accessibility scan with full results
 * Returns violations, passes, incomplete, and inapplicable
 */
export async function runAxeFullScan(tags?: string[]): Promise<AxeFullResults> {
    try {
        const options: RunOptions = {
            // Request all result types
            resultTypes: ['violations', 'passes', 'incomplete', 'inapplicable'],
            runOnly: tags && tags.length > 0
                ? { type: 'tag', values: tags }
                : { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }
        };

        const results = await axe.run(document, options);

        return {
            violations: results.violations as AxeViolation[],
            passes: results.passes as AxeResult[],
            incomplete: results.incomplete as AxeResult[],
            inapplicable: results.inapplicable.map((r: Result) => ({
                id: r.id,
                description: r.description,
                help: r.help,
                helpUrl: r.helpUrl,
                tags: r.tags || []
            }))
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('Axe scan failed:', error);
        return {
            violations: [],
            passes: [],
            incomplete: [],
            inapplicable: [],
            error: {
                message: errorMessage,
                stack: errorStack,
            },
        };
    }
}
