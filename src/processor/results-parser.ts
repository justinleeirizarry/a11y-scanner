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

    // Calculate total violations (sum of all instances)
    const totalViolations = attributedViolations.reduce((acc, v) => acc + v.nodes.length, 0);

    // Calculate keyboard issues if keyboard tests were run
    const keyboardIssues = keyboardTests?.summary.totalIssues;

    // Calculate severity breakdown by instances
    const violationsBySeverity = {
        critical: attributedViolations.filter(v => v.impact === 'critical').reduce((acc, v) => acc + v.nodes.length, 0),
        serious: attributedViolations.filter(v => v.impact === 'serious').reduce((acc, v) => acc + v.nodes.length, 0),
        moderate: attributedViolations.filter(v => v.impact === 'moderate').reduce((acc, v) => acc + v.nodes.length, 0),
        minor: attributedViolations.filter(v => v.impact === 'minor').reduce((acc, v) => acc + v.nodes.length, 0),
    };

    // Calculate summary statistics
    const summary = {
        totalComponents: components.length,
        totalViolations,
        violationsBySeverity,
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
