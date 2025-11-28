import type { BrowserScanData, ScanResults } from '../types.js';
import { countViolationsByWcagLevel, addWcag22ToLevelCounts } from '../utils/wcag-utils.js';

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
    if (wcag22) {
        addWcag22ToLevelCounts(violationsByWcagLevel, wcag22);
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
