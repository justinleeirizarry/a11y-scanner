import type { BrowserScanData, ScanResults } from '../types.js';

interface ProcessOptions {
    rawData: BrowserScanData;
    url: string;
    browser: string;
}

/**
 * Process raw scan data into structured results
 */
export function processResults(options: ProcessOptions): ScanResults {
    const { rawData, url, browser } = options;
    const { components, violations: attributedViolations, keyboardTests } = rawData;

    // Count unique components with violations
    const componentsWithViolationsSet = new Set<string>();

    for (const violation of attributedViolations) {
        for (const node of violation.nodes) {
            if (node.component) {
                componentsWithViolationsSet.add(node.component);
            }
        }
    }

    // Calculate total violations (count nodes across all violations)
    const totalViolations = attributedViolations.reduce((sum, v) => sum + v.nodes.length, 0);

    // Calculate keyboard issues if keyboard tests were run
    const keyboardIssues = keyboardTests?.summary.totalIssues;

    // Calculate summary statistics
    const summary = {
        totalComponents: components.length,
        totalViolations,
        violationsBySeverity: {
            critical: attributedViolations.filter(v => v.impact === 'critical').length,
            serious: attributedViolations.filter(v => v.impact === 'serious').length,
            moderate: attributedViolations.filter(v => v.impact === 'moderate').length,
            minor: attributedViolations.filter(v => v.impact === 'minor').length,
        },
        componentsWithViolations: componentsWithViolationsSet.size,
        keyboardIssues,
    };

    return {
        url,
        timestamp: new Date().toISOString(),
        browser,
        components,
        violations: attributedViolations,
        keyboardTests,
        summary,
    };
}
