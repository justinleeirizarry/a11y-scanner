/**
 * Axe-core accessibility scanner runner
 */

// @ts-ignore - axe-core will be bundled
import axe from 'axe-core';

export interface AxeViolation {
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    help: string;
    helpUrl: string;
    nodes: Array<{
        html: string;
        target: string[];
        failureSummary: string;
    }>;
}

/**
 * Run axe-core accessibility scan
 */
export async function runAxeScan(tags?: string[]): Promise<AxeViolation[]> {
    try {
        const options: any = {};

        if (tags && tags.length > 0) {
            options.runOnly = {
                type: 'tag',
                values: tags
            };
        } else {
            // Default to full scan if no tags provided
            options.runOnly = {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
            };
        }

        const results = await (axe as any).run(document, options);
        return results.violations as AxeViolation[];
    } catch (error) {
        console.error('Axe scan failed:', error);
        return [];
    }
}
