/**
 * Results Processor Service - Centralizes results transformation and formatting
 *
 * Combines logic from results-parser.ts, mcp-server.ts, and App.tsx
 */
import type { BrowserScanData, ScanResults } from '../../types.js';
import { formatViolations } from '../../prompts/formatters.js';
import type {
    ScanMetadata,
    MCPToolContent,
    MCPFormatOptions,
    CIResult,
    IResultsProcessorService,
} from './types.js';

/**
 * ResultsProcessorService - Handles all results transformation and formatting
 *
 * This service centralizes:
 * - Raw data to ScanResults transformation
 * - JSON formatting (with circular reference handling)
 * - MCP format output
 * - CI mode threshold checking
 */
export class ResultsProcessorService implements IResultsProcessorService {
    /**
     * Process raw scan data into structured results
     * (Extracted from results-parser.ts)
     */
    process(data: BrowserScanData, metadata: ScanMetadata): ScanResults {
        const { components, violations: attributedViolations, keyboardTests, accessibilityTree } = data;
        const { url, browser, timestamp } = metadata;

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
            critical: attributedViolations
                .filter((v) => v.impact === 'critical')
                .reduce((acc, v) => acc + v.nodes.length, 0),
            serious: attributedViolations
                .filter((v) => v.impact === 'serious')
                .reduce((acc, v) => acc + v.nodes.length, 0),
            moderate: attributedViolations
                .filter((v) => v.impact === 'moderate')
                .reduce((acc, v) => acc + v.nodes.length, 0),
            minor: attributedViolations
                .filter((v) => v.impact === 'minor')
                .reduce((acc, v) => acc + v.nodes.length, 0),
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
            timestamp: timestamp ?? new Date().toISOString(),
            browser,
            components,
            violations: attributedViolations,
            accessibilityTree,
            keyboardTests,
            summary,
        };
    }

    /**
     * Format results as JSON string
     * Handles circular references that can occur with Fiber data
     */
    formatAsJSON(results: ScanResults, pretty = true): string {
        const seen = new WeakSet();
        const replacer = (_key: string, value: any) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return '[Circular Reference]';
                }
                seen.add(value);
            }
            return value;
        };

        return pretty ? JSON.stringify(results, replacer, 2) : JSON.stringify(results, replacer);
    }

    /**
     * Format results for MCP (Model Context Protocol) output
     * (Extracted from mcp-server.ts)
     */
    formatForMCP(results: ScanResults, options?: MCPFormatOptions): MCPToolContent[] {
        const violationCount = results.violations.length;
        const criticalCount = results.summary.violationsBySeverity.critical;

        let summary = `## Scan Complete for ${results.url}\n\n`;
        summary += `Found **${violationCount}** violations (**${criticalCount}** critical).\n\n`;

        if (violationCount > 0) {
            summary += '### Violations Summary\n';
            summary += formatViolations(results.violations);
        } else {
            summary += 'No accessibility violations found!';
        }

        const content: MCPToolContent[] = [
            {
                type: 'text',
                text: summary,
            },
        ];

        // Optionally include accessibility tree
        if (options?.includeTree && results.accessibilityTree) {
            content.push({
                type: 'text',
                text:
                    '\n\n### Accessibility Tree\n```json\n' +
                    JSON.stringify(results.accessibilityTree, null, 2) +
                    '\n```',
            });
        }

        return content;
    }

    /**
     * Format results for CI mode with threshold checking
     * (Extracted from App.tsx)
     */
    formatForCI(results: ScanResults, threshold: number): CIResult {
        const totalViolations = results.summary.totalViolations;
        const criticalViolations = results.summary.violationsBySeverity.critical;
        const passed = totalViolations <= threshold;

        let message: string;
        if (passed) {
            message = `CI Check Passed: ${totalViolations} violation(s) found (threshold: ${threshold})`;
        } else {
            message = `CI Check Failed: ${totalViolations} violation(s) found (threshold: ${threshold})`;
        }

        return {
            passed,
            totalViolations,
            criticalViolations,
            threshold,
            message,
        };
    }
}

/**
 * Create a new ResultsProcessorService instance
 */
export function createResultsProcessorService(): IResultsProcessorService {
    return new ResultsProcessorService();
}
