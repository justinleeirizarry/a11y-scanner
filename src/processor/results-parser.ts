import type { BrowserScanData, ScanResults, AttributedViolation } from '../types.js';

interface ProcessOptions {
    rawData: BrowserScanData;
    url: string;
    browser: string;
}

/**
 * Count violations by WCAG level based on tags
 */
function countViolationsByWcagLevel(violations: AttributedViolation[]): ScanResults['summary']['violationsByWcagLevel'] {
    const counts = {
        wcag2a: 0,
        wcag2aa: 0,
        wcag2aaa: 0,
        wcag21a: 0,
        wcag21aa: 0,
        wcag22aa: 0,
        bestPractice: 0,
    };

    for (const violation of violations) {
        const nodeCount = violation.nodes.length;
        const tags = violation.tags || [];

        // Count by the most specific WCAG level tag present
        if (tags.includes('wcag2a')) counts.wcag2a += nodeCount;
        if (tags.includes('wcag2aa')) counts.wcag2aa += nodeCount;
        if (tags.includes('wcag2aaa')) counts.wcag2aaa += nodeCount;
        if (tags.includes('wcag21a')) counts.wcag21a += nodeCount;
        if (tags.includes('wcag21aa')) counts.wcag21aa += nodeCount;
        if (tags.includes('wcag22aa')) counts.wcag22aa += nodeCount;
        if (tags.includes('best-practice')) counts.bestPractice += nodeCount;
    }

    return counts;
}

/**
 * Process raw scan data into structured results
 */
export function processResults(options: ProcessOptions): ScanResults {
    const { rawData, url, browser } = options;
    const {
        components,
        violations: attributedViolations,
        passes,
        incomplete,
        inapplicable,
        keyboardTests,
        wcag22
    } = rawData;

    // Count unique components with violations
    const componentsWithViolationsSet = new Set<string>();

    for (const violation of attributedViolations) {
        for (const node of violation.nodes) {
            if (node.component) {
                componentsWithViolationsSet.add(node.component);
            }
        }
    }

    // Calculate total violations (sum of all instances)
    const totalViolations = attributedViolations.reduce((acc, v) => acc + v.nodes.length, 0);

    // Calculate totals for passes, incomplete, inapplicable
    const totalPasses = passes?.length || 0;
    const totalIncomplete = incomplete?.length || 0;
    const totalInapplicable = inapplicable?.length || 0;

    // Calculate keyboard issues if keyboard tests were run
    const keyboardIssues = keyboardTests?.summary.totalIssues;

    // Calculate WCAG 2.2 issues if checks were run
    const wcag22Issues = wcag22?.summary.totalViolations;

    // Calculate severity breakdown by instances
    const violationsBySeverity = {
        critical: attributedViolations.filter(v => v.impact === 'critical').reduce((acc, v) => acc + v.nodes.length, 0),
        serious: attributedViolations.filter(v => v.impact === 'serious').reduce((acc, v) => acc + v.nodes.length, 0),
        moderate: attributedViolations.filter(v => v.impact === 'moderate').reduce((acc, v) => acc + v.nodes.length, 0),
        minor: attributedViolations.filter(v => v.impact === 'minor').reduce((acc, v) => acc + v.nodes.length, 0),
    };

    // Calculate WCAG level breakdown
    const violationsByWcagLevel = countViolationsByWcagLevel(attributedViolations);

    // Add WCAG 2.2 violations to the level counts
    if (wcag22 && violationsByWcagLevel) {
        violationsByWcagLevel.wcag22aa += wcag22.targetSize.length +
            wcag22.focusObscured.length +
            wcag22.dragging.length +
            wcag22.authentication.length;
        // Focus Appearance is AAA
        violationsByWcagLevel.wcag2aaa += wcag22.focusAppearance.length;
    }

    // Calculate summary statistics
    const summary = {
        totalComponents: components.length,
        totalViolations,
        totalPasses,
        totalIncomplete,
        totalInapplicable,
        violationsBySeverity,
        violationsByWcagLevel,
        componentsWithViolations: componentsWithViolationsSet.size,
        keyboardIssues,
        wcag22Issues,
    };

    return {
        url,
        timestamp: new Date().toISOString(),
        browser,
        components,
        violations: attributedViolations,
        passes,
        incomplete,
        inapplicable,
        keyboardTests,
        wcag22,
        summary,
    };
}
