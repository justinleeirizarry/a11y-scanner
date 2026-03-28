/**
 * test_keyboard Tool
 *
 * Runs keyboard navigation tests on a page using the core auditKeyboard function.
 * Tests: tab order, focus traps, focus indicators, skip links.
 *
 * This gives the agent real keyboard interaction data for manual WCAG checks
 * that axe-core cannot automate (2.1.1, 2.1.2, 2.4.1, 2.4.3, 2.4.7).
 */
import { z } from 'zod';
import { auditKeyboard, type KeyboardAuditResult } from '@aria51/core';
import type { AgentToolDef } from '../agent/provider.js';
import type { AuditSession } from '../types.js';

function formatKeyboardResult(result: KeyboardAuditResult): string {
    const lines = [
        `## Keyboard Navigation Test: ${result.url}`,
        ``,
        `- **Tab stops found:** ${result.tabStops}`,
        `- **Interactive elements on page:** ${result.totalInteractive}`,
        `- **Focus trap detected:** ${result.focusTrapDetected ? 'YES' : 'no'}`,
        `- **Skip link present:** ${result.hasSkipLink ? 'yes' : 'NO'}`,
        `- **Elements without focus indicator:** ${result.elementsWithoutFocusIndicator}`,
        ``,
    ];

    if (result.issues.length > 0) {
        lines.push(`### Issues (${result.issues.length})`);
        for (const issue of result.issues) {
            lines.push(`- ${issue.message}`);
        }
        lines.push('');
    }

    lines.push(`### Tab Order (first ${Math.min(result.tabOrder.length, 20)} elements)`);
    for (const entry of result.tabOrder.slice(0, 20)) {
        const focusIcon = entry.hasFocusStyle ? '\u2713' : '\u2717';
        lines.push(`${entry.index}. [${focusIcon}] ${entry.role} "${entry.name.slice(0, 40)}" \u2014 ${entry.selector}`);
    }
    if (result.tabOrder.length > 20) {
        lines.push(`... and ${result.tabOrder.length - 20} more`);
    }

    return lines.join('\n');
}

function formatDeepAnalysis(deepAnalysis: any): string {
    const lines = ['\n\n### Deep Analysis (AI-enhanced)'];
    if (deepAnalysis.issues?.length > 0) {
        for (const i of deepAnalysis.issues) {
            lines.push(`- [${i.severity || i.impact || ''}] ${i.description || i.message || i.element || ''}`);
        }
    }
    if (deepAnalysis.summary) lines.push(`\n${deepAnalysis.summary}`);
    if (deepAnalysis.coverage?.percentage !== undefined) lines.push(`Coverage: ${deepAnalysis.coverage.percentage}%`);
    return lines.join('\n');
}

export const createTestKeyboardTool = (session: AuditSession): AgentToolDef =>
    ({
        name: 'test_keyboard',
        description:
            'Test keyboard navigation on a page by actually pressing Tab and analyzing focus behavior. Returns tab order, focus trap detection, focus indicator presence, and skip link status. Use this for WCAG 2.1.1 (Keyboard), 2.1.2 (No Keyboard Trap), 2.4.1 (Bypass Blocks), 2.4.3 (Focus Order), and 2.4.7 (Focus Visible) manual checks.',
        inputSchema: z.object({
            url: z.string().url().describe('The URL to test keyboard navigation on'),
            maxTabs: z.number().optional().default(50).describe('Maximum Tab presses before stopping (default: 50)'),
            deep: z.boolean().optional().default(false).describe('Enable AI-enhanced deep analysis (requires OPENAI_API_KEY)'),
        }),
        run: async ({ url, maxTabs, deep }: any) => {
            try {
                let result: any;
                if (deep) {
                    const { deepAuditKeyboard } = await import('@aria51/ai-auditor');
                    result = await deepAuditKeyboard(url, { maxTabs });
                } else {
                    result = await auditKeyboard(url, {
                        maxTabs,
                        headless: session.config.headless,
                    });
                }
                let output = formatKeyboardResult(result);
                if (result.deep && result.deepAnalysis) {
                    output += formatDeepAnalysis(result.deepAnalysis);
                }
                return output;
            } catch (error) {
                return `Keyboard test failed for ${url}: ${error instanceof Error ? error.message : String(error)}`;
            }
        },
    });
