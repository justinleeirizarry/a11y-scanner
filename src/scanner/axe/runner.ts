/**
 * Axe-core accessibility scanner runner
 */

// @ts-ignore - axe-core will be bundled
import axe from 'axe-core';
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
        const options: any = {
            // Request all result types
            resultTypes: ['violations', 'passes', 'incomplete', 'inapplicable']
        };

        if (tags && tags.length > 0) {
            options.runOnly = {
                type: 'tag',
                values: tags
            };
        } else {
            // Default to full scan if no tags provided
            options.runOnly = {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']
            };
        }

        const results = await (axe as any).run(document, options);

        return {
            violations: results.violations as AxeViolation[],
            passes: results.passes as AxeResult[],
            incomplete: results.incomplete as AxeResult[],
            inapplicable: results.inapplicable.map((r: any) => ({
                id: r.id,
                description: r.description,
                help: r.help,
                helpUrl: r.helpUrl,
                tags: r.tags || []
            }))
        };
    } catch (error) {
        console.error('Axe scan failed:', error);
        return {
            violations: [],
            passes: [],
            incomplete: [],
            inapplicable: []
        };
    }
}
