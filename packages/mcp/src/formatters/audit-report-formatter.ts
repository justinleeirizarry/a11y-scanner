/**
 * Full Audit Report Formatter
 *
 * Converts raw audit data into a structured markdown compliance report
 * for MCP tool responses.
 */
import type {
    ScanResults,
    DiscoveredPage,
    RemediationPlan,
    KeyboardAuditResult,
    StructureAuditResult,
    ScreenReaderAuditResult,
} from '@aria51/core';

export interface FullAuditData {
    url: string;
    discoveredPages: DiscoveredPage[];
    scanResults: Array<{ url: string; results: ScanResults }>;
    keyboardResults?: Array<{ url: string; result: KeyboardAuditResult }>;
    structureResults?: Array<{ url: string; result: StructureAuditResult }>;
    screenReaderResults?: Array<{ url: string; result: ScreenReaderAuditResult }>;
    remediationPlan?: RemediationPlan;
    wcagLevel: string;
    durationMs: number;
}

export function formatFullAuditReport(
    data: FullAuditData,
): Array<{ type: 'text'; text: string }> {
    const lines: string[] = [];

    // ── Summary ──────────────────────────────────────────────
    const totalViolations = data.scanResults.reduce(
        (sum, r) => sum + (r.results.violations?.length || 0), 0,
    );
    const totalNodes = data.scanResults.reduce((sum, r) => {
        const violations = r.results.violations || [];
        return sum + violations.reduce((s, v) => s + (v.nodes?.length || 0), 0);
    }, 0);
    const totalPasses = data.scanResults.reduce(
        (sum, r) => sum + (r.results.passes?.length || 0), 0,
    );

    lines.push(`# WCAG ${data.wcagLevel} Compliance Audit: ${data.url}`);
    lines.push('');
    lines.push(`| Metric | Value |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Pages scanned | ${data.scanResults.length} |`);
    lines.push(`| Pages discovered | ${data.discoveredPages.length} |`);
    lines.push(`| Total violation rules | ${totalViolations} |`);
    lines.push(`| Total violation instances | ${totalNodes} |`);
    lines.push(`| Total rules passed | ${totalPasses} |`);
    lines.push(`| Duration | ${(data.durationMs / 1000).toFixed(1)}s |`);
    lines.push('');

    // ── Violations by Page ───────────────────────────────────
    lines.push('## Violations by Page');
    lines.push('');
    lines.push('| Page | Violations | Critical | Serious | Top Issue |');
    lines.push('|------|-----------|----------|---------|-----------|');

    for (const { url, results } of data.scanResults) {
        const violations = results.violations || [];
        const severity = { critical: 0, serious: 0, moderate: 0, minor: 0 };
        for (const v of violations) {
            const count = v.nodes?.length || 0;
            const impact = (v.impact || 'moderate') as keyof typeof severity;
            severity[impact] = (severity[impact] || 0) + count;
        }
        const topIssue = violations
            .sort((a, b) => (b.nodes?.length || 0) - (a.nodes?.length || 0))[0];
        const topStr = topIssue
            ? `\`${topIssue.id}\` (${topIssue.nodes?.length || 0})`
            : '—';
        const shortUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
        lines.push(`| ${shortUrl} | ${violations.length} | ${severity.critical} | ${severity.serious} | ${topStr} |`);
    }
    lines.push('');

    // ── Keyboard Findings ────────────────────────────────────
    if (data.keyboardResults && data.keyboardResults.length > 0) {
        lines.push('## Keyboard Navigation');
        lines.push('');
        for (const { url, result } of data.keyboardResults) {
            const shortUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
            lines.push(`### ${shortUrl}`);
            lines.push('');
            lines.push(`| Metric | Value |`);
            lines.push(`|--------|-------|`);
            lines.push(`| Tab stops reached | ${result.tabStops} |`);
            lines.push(`| Total interactive elements | ${result.totalInteractive} |`);
            lines.push(`| Focus trap detected | ${result.focusTrapDetected ? 'Yes' : 'No'} |`);
            lines.push(`| Has skip link | ${result.hasSkipLink ? 'Yes' : 'No'} |`);
            lines.push(`| Elements without focus indicator | ${result.elementsWithoutFocusIndicator} |`);
            if (result.issues.length > 0) {
                lines.push('');
                lines.push('**Issues:**');
                for (const issue of result.issues.slice(0, 10)) {
                    lines.push(`- [${issue.severity}] ${issue.message}`);
                }
                if (result.issues.length > 10) {
                    lines.push(`- ... and ${result.issues.length - 10} more`);
                }
            }
            lines.push('');
        }
    }

    // ── Structure Findings ───────────────────────────────────
    if (data.structureResults && data.structureResults.length > 0) {
        lines.push('## Page Structure');
        lines.push('');
        for (const { url, result } of data.structureResults) {
            const shortUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
            lines.push(`### ${shortUrl}`);
            lines.push('');
            lines.push(`- **Title:** ${result.title || '(none)'}`);
            lines.push(`- **Landmarks:** ${result.landmarks.length}`);
            lines.push(`- **Headings:** ${result.headings.length}`);
            lines.push(`- **Form inputs:** ${result.formInputs.length}`);
            if (result.issues.length > 0) {
                lines.push('');
                lines.push('**Issues:**');
                for (const issue of result.issues.slice(0, 10)) {
                    lines.push(`- [${issue.severity}] ${issue.message}`);
                }
                if (result.issues.length > 10) {
                    lines.push(`- ... and ${result.issues.length - 10} more`);
                }
            }
            lines.push('');
        }
    }

    // ── Screen Reader Findings ───────────────────────────────
    if (data.screenReaderResults && data.screenReaderResults.length > 0) {
        lines.push('## Screen Reader Compatibility');
        lines.push('');
        for (const { url, result } of data.screenReaderResults) {
            const shortUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
            lines.push(`### ${shortUrl}`);
            lines.push('');
            lines.push(`| Check | Result |`);
            lines.push(`|-------|--------|`);
            lines.push(`| Page language | ${result.lang || 'Missing'} |`);
            lines.push(`| Images missing alt | ${result.images.missingAlt}/${result.images.total} |`);
            lines.push(`| Links without name | ${result.links.noName}/${result.links.total} |`);
            lines.push(`| Buttons without name | ${result.buttons.noName}/${result.buttons.total} |`);
            lines.push(`| Unlabeled form inputs | ${result.formInputs.unlabeled}/${result.formInputs.total} |`);
            lines.push(`| Live regions | ${result.liveRegions} |`);
            if (result.issues.length > 0) {
                lines.push('');
                lines.push('**Issues:**');
                for (const issue of result.issues.slice(0, 10)) {
                    lines.push(`- [${issue.severity}] ${issue.message}`);
                }
                if (result.issues.length > 10) {
                    lines.push(`- ... and ${result.issues.length - 10} more`);
                }
            }
            lines.push('');
        }
    }

    // ── Remediation Plan ─────────────────────────────────────
    if (data.remediationPlan) {
        const plan = data.remediationPlan;
        lines.push('## Remediation Plan');
        lines.push('');
        lines.push(`*${plan.summary}*`);
        lines.push('');

        for (const phase of plan.phases) {
            lines.push(`### ${phase.title}`);
            lines.push('');
            lines.push(phase.description);
            lines.push('');
            for (const item of phase.items.slice(0, 15)) {
                const pages = item.affectedPages.length > 1
                    ? ` (${item.affectedPages.length} pages)`
                    : '';
                lines.push(`- **${item.finding.criterion.id}** ${item.finding.description}${pages} [effort: ${item.estimatedEffort}]`);
            }
            if (phase.items.length > 15) {
                lines.push(`- ... and ${phase.items.length - 15} more items`);
            }
            lines.push('');
        }
    }

    return [{ type: 'text' as const, text: lines.join('\n') }];
}
