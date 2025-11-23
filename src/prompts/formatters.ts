import type { AttributedViolation } from '../types.js';

/**
 * Format violations summary for prompts
 */
export function formatViolationSummary(violations: AttributedViolation[]): string {
    const bySeverity = violations.reduce((acc, v) => {
        acc[v.impact] = (acc[v.impact] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const lines: string[] = [];
    if (bySeverity.critical) lines.push(`- Critical: ${bySeverity.critical}`);
    if (bySeverity.serious) lines.push(`- Serious: ${bySeverity.serious}`);
    if (bySeverity.moderate) lines.push(`- Moderate: ${bySeverity.moderate}`);
    if (bySeverity.minor) lines.push(`- Minor: ${bySeverity.minor}`);

    return lines.join('\n');
}

/**
 * Format detailed violations for prompts
 */
export function formatViolations(violations: AttributedViolation[]): string {
    return violations.map((violation, idx) => {
        const firstNode = violation.nodes[0];
        const userPath = firstNode?.userComponentPath && firstNode.userComponentPath.length > 0
            ? firstNode.userComponentPath.join(' > ')
            : firstNode?.componentPath?.join(' > ') || 'Unknown';

        let output = `### ${idx + 1}. ${violation.id} (${violation.impact})\n\n`;
        output += `**Description:** ${violation.description}\n`;
        output += `**Help:** [${violation.help}](${violation.helpUrl})\n\n`;

        output += `**Component Path:** \`${userPath}\`\n`;

        if (firstNode?.cssSelector) {
            output += `**Selector:** \`${firstNode.cssSelector}\`\n`;
        }

        if (firstNode?.htmlSnippet) {
            output += `\n**HTML Element:**\n\`\`\`html\n${firstNode.htmlSnippet}\n\`\`\`\n`;
        }

        if (firstNode?.failureSummary) {
            output += `\n**Failure Summary:**\n> ${firstNode.failureSummary.split('\n').join('\n> ')}\n`;
        }

        if (violation.fixSuggestion) {
            output += `\n**How to Fix:**\n${violation.fixSuggestion.summary}\n`;
            if (violation.fixSuggestion.codeExample) {
                output += `\n**Example:**\n\`\`\`jsx\n${violation.fixSuggestion.codeExample}\n\`\`\`\n`;
            }
        }

        if (violation.nodes.length > 1) {
            output += `\n*Found in ${violation.nodes.length} instances total.*\n`;
        }

        return output;
    }).join('\n---\n\n');
}

/**
 * Format violations by component for prompts
 */
export function formatViolationsByComponent(violations: AttributedViolation[]): string {
    const byComponent = new Map<string, AttributedViolation[]>();

    violations.forEach(violation => {
        const firstNode = violation.nodes[0];
        const component = firstNode?.component || 'Unknown';

        if (!byComponent.has(component)) {
            byComponent.set(component, []);
        }
        byComponent.get(component)!.push(violation);
    });

    const lines: string[] = [];
    byComponent.forEach((violations, component) => {
        lines.push(`\n### ${component} (${violations.length} violation(s))`);
        violations.forEach(v => {
            lines.push(`- ${v.help} (${v.impact})`);
        });
    });

    return lines.join('\n');
}

/**
 * Get quick win violations (easy fixes)
 */
export function getQuickWins(violations: AttributedViolation[]): AttributedViolation[] {
    const quickWinIds = [
        'image-alt',
        'button-name',
        'link-name',
        'label',
        'html-has-lang',
        'document-title'
    ];

    return violations.filter(v => quickWinIds.includes(v.id));
}

/**
 * Get critical violations only
 */
export function getCriticalViolations(violations: AttributedViolation[]): AttributedViolation[] {
    return violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
}
