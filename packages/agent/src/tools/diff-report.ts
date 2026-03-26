/**
 * diff_report Tool
 */
import { z } from 'zod';
import type { AgentToolDef } from '../agent/provider.js';
import type { AuditSession, DiffReport, VerifiedFinding } from '../types.js';

export const createDiffReportTool = (session: AuditSession): AgentToolDef =>
    ({
        name: 'diff_report',
        description: 'Compare current audit findings against a previous snapshot to track remediation progress.',
        inputSchema: z.object({
            baselineSessionId: z.string().optional().describe('Session ID to compare against. Defaults to most recent snapshot.'),
        }),
        run: async ({ baselineSessionId }: any) => {
            const snapshots = session.previousSnapshots;
            if (snapshots.length === 0) return 'No previous snapshots available for comparison.';

            const baseline = baselineSessionId
                ? snapshots.find((s) => s.sessionId === baselineSessionId)
                : snapshots[snapshots.length - 1];
            if (!baseline) return `Snapshot not found. Available: ${snapshots.map((s) => s.sessionId).join(', ')}`;

            const diff = computeDiff(baseline.findings, session.findings, baseline.sessionId, session.id);
            const lines = [
                `## Diff Report`,
                `- New violations: **${diff.regressionCount}**`,
                `- Resolved: **${diff.improvementCount}**`,
                `- Persistent: **${diff.persistentViolations.length}**`,
            ];
            return lines.join('\n');
        },
    });

function computeDiff(baselineFindings: VerifiedFinding[], currentFindings: VerifiedFinding[], baselineId: string, currentId: string): DiffReport {
    const key = (f: VerifiedFinding) => `${f.url}|${f.criterion.id}|${f.selector || ''}`;
    const baseKeys = new Set(baselineFindings.map(key));
    const currKeys = new Set(currentFindings.map(key));
    return {
        baselineSessionId: baselineId, currentSessionId: currentId,
        newViolations: currentFindings.filter((f) => !baseKeys.has(key(f))),
        resolvedViolations: baselineFindings.filter((f) => !currKeys.has(key(f))),
        persistentViolations: currentFindings.filter((f) => baseKeys.has(key(f))),
        regressionCount: currentFindings.filter((f) => !baseKeys.has(key(f))).length,
        improvementCount: baselineFindings.filter((f) => !currKeys.has(key(f))).length,
    };
}
