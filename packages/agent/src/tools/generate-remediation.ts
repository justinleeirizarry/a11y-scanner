/**
 * generate_remediation Tool
 */
import { z } from 'zod';
import { generateRemediationPlan } from '../remediation/prioritizer.js';
import type { AgentToolDef } from '../agent/provider.js';
import type { AuditSession } from '../types.js';

export const createGenerateRemediationTool = (session: AuditSession): AgentToolDef =>
    ({
        name: 'generate_remediation',
        description: 'Generate a prioritized remediation plan from verified findings. Groups issues into phases by severity and confidence.',
        inputSchema: z.object({
            focusLevel: z.enum(['A', 'AA', 'AAA']).optional().describe('Only include issues at this WCAG level and below'),
            maxItems: z.number().optional().describe('Maximum items per phase'),
        }),
        run: async ({ focusLevel, maxItems }: any) => {
            if (session.findings.length === 0) return 'No verified findings. Use verify_findings first.';

            const plan = generateRemediationPlan(session, { focusLevel, maxItems });
            session.remediationPlan = plan;
            session.status = 'remediating';

            const lines = [`## Remediation Plan`, `- **Total Issues**: ${plan.totalIssues}`, `- **Effort**: ${plan.estimatedEffort}`, ''];
            for (const phase of plan.phases) {
                lines.push(`### Phase ${phase.priority}: ${phase.title}`);
                for (const item of phase.items) {
                    lines.push(`- **${item.finding.criterion.id}** (${item.finding.impact}, ${item.estimatedEffort} effort): ${item.fix}`);
                }
                lines.push('');
            }
            return lines.join('\n');
        },
    });
