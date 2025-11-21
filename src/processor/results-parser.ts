import type { BrowserScanData, ScanResults, AttributedViolation, ComponentInfo } from '../types.js';

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
    const { components, violations: axeViolations } = rawData;

    // Build a map of DOM nodes to components for attribution
    const domToComponent = new Map<Element, ComponentInfo>();

    for (const component of components) {
        if (component.domNode) {
            domToComponent.set(component.domNode, component);
        }
    }

    // Attribute violations to components
    const attributedViolations: AttributedViolation[] = [];

    for (const violation of axeViolations) {
        for (const node of violation.nodes) {
            // For now, use basic attribution - can be enhanced later
            const attributed: AttributedViolation = {
                id: violation.id,
                impact: violation.impact,
                description: violation.description,
                help: violation.help,
                helpUrl: violation.helpUrl,
                component: null, // Will be enhanced in Phase 4
                componentPath: [],
                target: node.target,
                html: node.html,
                failureSummary: node.failureSummary,
            };

            attributedViolations.push(attributed);
        }
    }

    // Calculate summary statistics
    const summary = {
        totalComponents: components.length,
        totalViolations: attributedViolations.length,
        violationsBySeverity: {
            critical: attributedViolations.filter(v => v.impact === 'critical').length,
            serious: attributedViolations.filter(v => v.impact === 'serious').length,
            moderate: attributedViolations.filter(v => v.impact === 'moderate').length,
            minor: attributedViolations.filter(v => v.impact === 'minor').length,
        },
        componentsWithViolations: 0, // Will be calculated when we do proper attribution
    };

    return {
        url,
        timestamp: new Date().toISOString(),
        browser,
        components,
        violations: attributedViolations,
        summary,
    };
}
