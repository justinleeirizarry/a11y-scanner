/**
 * Full Audit Pipeline
 *
 * Deterministic WCAG compliance audit that discovers pages, scans with
 * axe-core, runs focused audits, and generates a remediation plan.
 * No LLM needed.
 */
import {
    runScanAsPromise,
    AppLayer,
    getComponentBundlePath,
    logger,
    AXE_WCAG_MAP,
    getCriterionById,
} from '../../index.js';
import type {
    ScanResults,
    KeyboardAuditResult,
    StructureAuditResult,
    ScreenReaderAuditResult,
} from '../../index.js';
import { parseSitemap } from '../planning/sitemap-parser.js';
import { discoverLinks } from '../planning/link-discoverer.js';
import { deduplicatePages } from '../planning/page-prioritizer.js';
import { generateRemediationPlan } from '../remediation/prioritizer.js';
import type {
    DiscoveredPage,
    RemediationPlan,
    VerifiedFinding,
    AgentWcagCriterionInfo,
    AuditSessionMinimal,
} from '../types.js';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface FullAuditOptions {
    url: string;
    maxPages?: number;
    includeAudits?: boolean;
    wcagLevel?: 'A' | 'AA' | 'AAA';
    onProgress?: (message: string) => void;
}

export interface FullAuditResult {
    url: string;
    discoveredPages: DiscoveredPage[];
    scanResults: Array<{ url: string; results: ScanResults }>;
    keyboardResults?: Array<{ url: string; result: KeyboardAuditResult }>;
    structureResults?: Array<{ url: string; result: StructureAuditResult }>;
    screenReaderResults?: Array<{ url: string; result: ScreenReaderAuditResult }>;
    findings: VerifiedFinding[];
    remediationPlan?: RemediationPlan;
    wcagLevel: string;
    durationMs: number;
}

// ─────────────────────────────────────────────────────────────
// Pipeline
// ─────────────────────────────────────────────────────────────

const MAX_FOCUS_PAGES = 3;

export async function runFullAudit(options: FullAuditOptions): Promise<FullAuditResult> {
    const {
        url,
        maxPages = 10,
        includeAudits = true,
        wcagLevel = 'AA',
        onProgress,
    } = options;

    const startTime = Date.now();
    const progress = (msg: string) => {
        logger.info(msg);
        onProgress?.(msg);
    };

    // ── 1. Discover pages ────────────────────────────────────
    progress(`Discovering pages for ${url}`);

    let sitemapEntries: Array<{ url: string; lastmod?: string; priority?: number }> = [];
    let crawledUrls: string[] = [];

    try {
        sitemapEntries = await parseSitemap(url);
        progress(`Sitemap: ${sitemapEntries.length} entries`);
    } catch { /* non-fatal */ }

    try {
        crawledUrls = await discoverLinks(url, { browser: 'chromium', headless: true });
        progress(`Crawl: ${crawledUrls.length} links`);
    } catch { /* non-fatal */ }

    const allUrls = [url, ...sitemapEntries.map((e) => e.url), ...crawledUrls];
    const discoveredPages = deduplicatePages(allUrls, sitemapEntries, maxPages);
    const pageUrls = discoveredPages.map((p) => p.url);
    progress(`Auditing ${pageUrls.length} pages`);

    // ── 2. Batch scan all pages with axe-core ────────────────
    const scanResults: Array<{ url: string; results: ScanResults }> = [];
    const scanResultsMap: Record<string, ScanResults> = {};

    for (const pageUrl of pageUrls) {
        try {
            progress(`Scanning ${pageUrl}`);
            const { results } = await runScanAsPromise({
                url: pageUrl,
                browser: 'chromium',
                headless: true,
                includeKeyboardTests: true,
                componentBundlePath: getComponentBundlePath(),
            }, AppLayer);
            scanResults.push({ url: pageUrl, results });
            scanResultsMap[pageUrl] = results;
            progress(`  ${results.violations?.length || 0} violations, ${results.passes?.length || 0} passes`);
        } catch {
            progress(`  Scan failed for ${pageUrl} (skipping)`);
        }
    }

    // ── 3. Focused audits on key pages ───────────────────────
    let keyboardResults: Array<{ url: string; result: KeyboardAuditResult }> | undefined;
    let structureResults: Array<{ url: string; result: StructureAuditResult }> | undefined;
    let screenReaderResults: Array<{ url: string; result: ScreenReaderAuditResult }> | undefined;

    if (includeAudits) {
        const { auditKeyboard, auditStructure, auditScreenReader } = await import('../../index.js');

        const focusUrls = [url];
        for (const pageUrl of pageUrls) {
            if (focusUrls.length >= MAX_FOCUS_PAGES) break;
            if (pageUrl !== url) focusUrls.push(pageUrl);
        }

        keyboardResults = [];
        structureResults = [];
        screenReaderResults = [];

        for (const pageUrl of focusUrls) {
            progress(`Running focused audits on ${pageUrl}`);
            try {
                const [kb, struct, sr] = await Promise.all([
                    auditKeyboard(pageUrl).catch(() => null),
                    auditStructure(pageUrl).catch(() => null),
                    auditScreenReader(pageUrl).catch(() => null),
                ]);
                if (kb) keyboardResults.push({ url: pageUrl, result: kb });
                if (struct) structureResults.push({ url: pageUrl, result: struct });
                if (sr) screenReaderResults.push({ url: pageUrl, result: sr });
            } catch {
                progress(`  Focused audits failed for ${pageUrl}`);
            }
        }
    }

    // ── 4. Build findings + remediation plan ─────────────────
    const findings = axeViolationsToFindings(scanResultsMap);
    let remediationPlan: RemediationPlan | undefined;

    if (findings.length > 0) {
        try {
            const session: AuditSessionMinimal = {
                findings,
                config: { wcagLevel },
            };
            remediationPlan = generateRemediationPlan(session, { focusLevel: wcagLevel });
        } catch {
            progress('Remediation plan generation failed');
        }
    }

    const durationMs = Date.now() - startTime;
    progress(`Full audit complete: ${scanResults.length} pages, ${findings.length} findings, ${(durationMs / 1000).toFixed(1)}s`);

    return {
        url,
        discoveredPages,
        scanResults,
        keyboardResults,
        structureResults,
        screenReaderResults,
        findings,
        remediationPlan,
        wcagLevel,
        durationMs,
    };
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function axeViolationsToFindings(
    scanResultsMap: Record<string, ScanResults>,
): VerifiedFinding[] {
    const findings: VerifiedFinding[] = [];
    let counter = 0;

    for (const [url, scanResults] of Object.entries(scanResultsMap)) {
        const violations = scanResults.violations || [];
        for (const violation of violations) {
            const wcagMapping = AXE_WCAG_MAP[violation.id];
            const criterionId = wcagMapping?.criteria?.[0] || '';
            const coreCriterion = criterionId ? getCriterionById(criterionId) : undefined;

            const criterion: AgentWcagCriterionInfo = coreCriterion
                ? {
                    id: coreCriterion.id,
                    title: coreCriterion.title,
                    level: coreCriterion.level,
                    principle: coreCriterion.principle as AgentWcagCriterionInfo['principle'],
                    w3cUrl: `https://www.w3.org/WAI/WCAG22/Understanding/${coreCriterion.id.replace(/\./g, '')}.html`,
                }
                : {
                    id: criterionId || violation.id,
                    title: violation.description || violation.id,
                    level: 'A',
                    principle: 'Perceivable',
                    w3cUrl: '',
                };

            const nodes = violation.nodes || [];
            for (const node of nodes) {
                counter++;
                findings.push({
                    id: `axe-${counter}`,
                    url,
                    criterion,
                    description: violation.description || violation.help || violation.id,
                    impact: (violation.impact as VerifiedFinding['impact']) || 'moderate',
                    selector: Array.isArray(node.target) ? node.target.join(' ') : undefined,
                    element: node.html,
                    confidence: 'confirmed',
                    sources: [{
                        type: 'axe-core',
                        ruleId: violation.id,
                        detail: violation.help || violation.description || '',
                    }],
                    evidence: `axe-core rule "${violation.id}" flagged this element`,
                });
            }
        }
    }

    return findings;
}
