/**
 * test_screen_reader Tool
 *
 * Simulates screen reader navigation patterns using the core auditScreenReader function.
 * Tests: page title, landmarks, heading navigation, link/button names,
 * form labels, image alt text, ARIA live regions.
 *
 * This gives the agent screen reader perspective data for manual WCAG checks:
 * 1.1.1 (Non-text Content), 1.3.1 (Info and Relationships),
 * 2.4.1 (Bypass Blocks), 2.4.4 (Link Purpose), 3.3.2 (Labels or Instructions),
 * 4.1.2 (Name, Role, Value).
 */
import { z } from 'zod';
import { auditScreenReader, type ScreenReaderAuditResult } from '@aria51/core';
import type { AgentToolDef } from '../agent/provider.js';
import type { AuditSession } from '../types.js';

function formatScreenReaderResult(result: ScreenReaderAuditResult): string {
    const lines = [
        `## Screen Reader Navigation Test: ${result.url}`,
        ``,
        `**Page title:** ${result.title ? `"${result.title}"` : '(none)'}`,
        `**Language:** ${result.lang || '(not set)'}`,
        `**Images:** ${result.images.total} total, ${result.images.missingAlt} missing alt`,
        `**Links:** ${result.links.total} total, ${result.links.noName} without name, ${result.links.vague} non-descriptive`,
        `**Buttons:** ${result.buttons.total} total, ${result.buttons.noName} without name`,
        `**Form inputs:** ${result.formInputs.total} total, ${result.formInputs.unlabeled} unlabeled`,
        `**Live regions:** ${result.liveRegions}`,
        ``,
    ];

    if (result.issues.length > 0) {
        lines.push(`### Issues (${result.issues.length})`);
        for (const issue of result.issues) {
            lines.push(`- **[${issue.severity}] WCAG ${issue.wcag}:** ${issue.message}`);
        }
    } else {
        lines.push('### No critical screen reader issues detected');
    }

    return lines.join('\n');
}

export const createTestScreenReaderTool = (session: AuditSession): AgentToolDef =>
    ({
        name: 'test_screen_reader',
        description:
            'Simulate screen reader navigation on a page. Tests how the page would be experienced by a screen reader user: page title announcement, landmark navigation, heading traversal, link/button accessible names, image alt text, and form label associations. Use this for WCAG 1.1.1, 1.3.1, 2.4.1, 2.4.4, 3.3.2, 4.1.2 manual checks.',
        inputSchema: z.object({
            url: z.string().url().describe('The URL to test screen reader navigation on'),
        }),
        run: async ({ url }: any) => {
            try {
                const result = await auditScreenReader(url, {
                    headless: session.config.headless,
                });
                return formatScreenReaderResult(result);
            } catch (error) {
                return `Screen reader test failed for ${url}: ${error instanceof Error ? error.message : String(error)}`;
            }
        },
    });
