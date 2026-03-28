/**
 * save_snapshot Tool
 *
 * Saves the current audit state as a snapshot for later comparison via diff_report.
 */
import { z } from 'zod';
import type { AgentToolDef } from '../agent/provider.js';
import type { AuditSession } from '../types.js';
import { createSnapshot } from '../state/audit-session.js';

export const createSaveSnapshotTool = (session: AuditSession): AgentToolDef =>
    ({
        name: 'save_snapshot',
        description:
            'Save the current audit findings as a snapshot. Use this before rescanning to enable comparison via diff_report. The snapshot preserves the current findings so you can track remediation progress.',
        inputSchema: z.object({
            label: z.string().optional().describe('Optional label for this snapshot (e.g., "before fixes", "baseline")'),
        }),
        run: async ({ label }: any) => {
            if (session.findings.length === 0 && session.scannedUrls.length === 0) {
                return 'No findings or scanned pages to snapshot. Run scan_page or verify_findings first.';
            }

            const snapshot = createSnapshot(session);
            session.previousSnapshots.push(snapshot);

            const lines = [
                `## Snapshot Saved`,
                `- **Session ID:** ${snapshot.sessionId}`,
                `- **Timestamp:** ${snapshot.timestamp}`,
                `- **Findings:** ${snapshot.findings.length}`,
                `- **Pages scanned:** ${snapshot.pagesScanned}`,
            ];
            if (label) lines.push(`- **Label:** ${label}`);
            lines.push(``, `You can now rescan and use \`diff_report\` to compare against this snapshot.`);

            return lines.join('\n');
        },
    });
