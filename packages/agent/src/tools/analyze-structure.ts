/**
 * analyze_structure Tool
 *
 * Gets the accessibility tree and analyzes document structure using the core
 * auditStructure function.
 *
 * This gives the agent structural data for manual WCAG checks:
 * 1.3.1 (Info and Relationships), 2.4.2 (Page Titled), 2.4.6 (Headings and Labels),
 * 4.1.1 (Parsing), 4.1.2 (Name, Role, Value).
 */
import { z } from 'zod';
import { auditStructure, type StructureAuditResult } from '@aria51/core';
import type { AgentToolDef } from '../agent/provider.js';
import type { AuditSession } from '../types.js';

function formatStructureResult(result: StructureAuditResult): string {
    const landmarkCounts: Record<string, number> = {};
    for (const l of result.landmarks) {
        landmarkCounts[l.role] = (landmarkCounts[l.role] || 0) + 1;
    }

    const h1Count = result.headings.filter(h => h.level === 1).length;
    const unlabeled = result.formInputs.filter(f => !f.hasLabel && f.type !== 'hidden');

    const lines = [
        `## Structure Analysis: ${result.url}`,
        ``,
        `**Title:** ${result.title || '(empty)'}`,
        `**Landmarks:** ${result.landmarks.length} (${Object.entries(landmarkCounts).map(([r, c]) => `${c} ${r}`).join(', ') || 'none'})`,
        `**Headings:** ${result.headings.length} (h1: ${h1Count})`,
        `**Form inputs:** ${result.formInputs.length} (${unlabeled.length} unlabeled)`,
        ``,
    ];

    if (result.issues.length > 0) {
        lines.push(`### Issues (${result.issues.length})`);
        for (const issue of result.issues) lines.push(`- ${issue.message}`);
        lines.push('');
    }

    lines.push('### Heading Hierarchy');
    for (const h of result.headings.slice(0, 20)) {
        lines.push(`${'  '.repeat(h.level - 1)}h${h.level}: ${h.text || '(empty)'}`);
    }

    lines.push('', '### Landmarks');
    for (const l of result.landmarks) {
        lines.push(`- ${l.role}${l.label ? ` "${l.label}"` : ''} (${l.tag})`);
    }

    if (result.formInputs.length > 0) {
        lines.push('', '### Form Inputs');
        for (const f of result.formInputs.slice(0, 15)) {
            const labelIcon = f.hasLabel ? '\u2713' : '\u2717';
            lines.push(`- [${labelIcon}] ${f.type}${f.name ? ` "${f.name}"` : ''} \u2014 ${f.hasLabel ? `label: "${f.labelText}"` : 'NO LABEL'}`);
        }
    }

    // Include condensed a11y tree
    if (result.accessibilityTree) {
        lines.push('', '### Accessibility Tree (top level)');
        const topChildren = result.accessibilityTree.children?.slice(0, 15) || [];
        for (const child of topChildren) {
            const name = child.name ? ` "${child.name.slice(0, 40)}"` : '';
            lines.push(`- ${child.role}${name}`);
            if (child.children) {
                for (const grandchild of child.children.slice(0, 3)) {
                    const gcName = grandchild.name ? ` "${grandchild.name.slice(0, 30)}"` : '';
                    lines.push(`  - ${grandchild.role}${gcName}`);
                }
                if (child.children.length > 3) {
                    lines.push(`  ... ${child.children.length - 3} more children`);
                }
            }
        }
    }

    return lines.join('\n');
}

export const createAnalyzeStructureTool = (session: AuditSession): AgentToolDef =>
    ({
        name: 'analyze_structure',
        description:
            'Analyze a page\'s accessibility structure: landmarks, heading hierarchy, ARIA roles, form labels, and interactive elements. Returns the accessibility tree with structural validation. Use this for WCAG 1.3.1 (Info and Relationships), 2.4.2 (Page Titled), 2.4.6 (Headings and Labels), 4.1.2 (Name, Role, Value) manual checks.',
        inputSchema: z.object({
            url: z.string().url().describe('The URL to analyze'),
        }),
        run: async ({ url }: any) => {
            try {
                const result = await auditStructure(url, {
                    headless: session.config.headless,
                });
                return formatStructureResult(result);
            } catch (error) {
                return `Structure analysis failed for ${url}: ${error instanceof Error ? error.message : String(error)}`;
            }
        },
    });
