/**
 * verify_findings Tool
 */
import { z } from 'zod';
import { crossReferenceFindingsWithAxe } from '../verification/cross-reference.js';
import { sortByScore } from '../verification/confidence-scorer.js';
import type { AgentToolDef } from '../agent/provider.js';
import type { AuditSession } from '../types.js';

export const createVerifyFindingsTool = (session: AuditSession): AgentToolDef =>
    ({
        name: 'verify_findings',
        description:
            'Cross-reference your accessibility observations with axe-core deterministic scan results. Each finding gets a confidence level: confirmed, corroborated, ai-only, or contradicted.',
        inputSchema: z.object({
            findings: z.array(z.object({
                url: z.string().describe('URL where the issue was observed'),
                description: z.string().describe('Description of the accessibility issue'),
                criterion: z.string().optional().describe('WCAG criterion ID (e.g., "2.4.7")'),
                selector: z.string().optional().describe('CSS selector of the affected element'),
                impact: z.enum(['critical', 'serious', 'moderate', 'minor']).optional().describe('Severity'),
            })).describe('Findings to verify'),
        }),
        run: async ({ findings }: any) => {
            const verified = crossReferenceFindingsWithAxe(findings, session);
            const sorted = sortByScore(verified);
            session.findings.push(...sorted);
            session.status = 'verifying';

            const byConfidence = {
                confirmed: sorted.filter((f) => f.confidence === 'confirmed'),
                corroborated: sorted.filter((f) => f.confidence === 'corroborated'),
                'ai-only': sorted.filter((f) => f.confidence === 'ai-only'),
                contradicted: sorted.filter((f) => f.confidence === 'contradicted'),
            };

            const lines = [`## Verification Results: ${sorted.length} findings analyzed`, ''];
            for (const [level, items] of Object.entries(byConfidence)) {
                if (items.length > 0) {
                    lines.push(`### ${level} (${items.length}):`);
                    for (const f of items) lines.push(`- **${f.criterion.id}** (${f.impact}): ${f.description}`);
                    lines.push('');
                }
            }
            return lines.join('\n');
        },
    });
