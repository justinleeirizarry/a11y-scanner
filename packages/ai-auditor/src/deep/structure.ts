/**
 * Deep Structure Audit
 *
 * Composes core auditStructure (tier 1) with StagehandTreeAnalyzer (tier 2).
 * Runs both on a shared browser session, then merges results.
 * Falls back to tier 1 only if Stagehand fails.
 */
import { auditStructure, logger } from '@aria51/core';
import type { StructureAuditResult } from '@aria51/core';
import { StagehandTreeAnalyzer } from '../stagehand/a11y-tree-analyzer.js';
import type { DeepStructureAuditResult, DeepAuditOptions } from './types.js';

export async function deepAuditStructure(
    url: string,
    options: DeepAuditOptions = {}
): Promise<StructureAuditResult | DeepStructureAuditResult> {
    const { model, verbose, headless } = options;

    let analyzer: StagehandTreeAnalyzer | null = null;

    try {
        // Init Stagehand — this launches a browser
        analyzer = new StagehandTreeAnalyzer({ model, verbose });
        await analyzer.init();

        const page = analyzer.page;
        let coreResult: StructureAuditResult;

        if (page) {
            // Navigate once for the core audit
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Run tier 1 on Stagehand's browser — no second browser launch
            coreResult = await auditStructure(url, { headless, page });
        } else {
            logger.warn('Could not access Stagehand page, running core audit separately');
            coreResult = await auditStructure(url, { headless });
        }

        // Run tier 2 — Stagehand AI analysis (re-navigates internally)
        const deepResult = await analyzer.analyze(url);

        return {
            ...coreResult,
            deep: true as const,
            deepAnalysis: deepResult,
        };
    } catch (error) {
        logger.warn(`Deep structure analysis unavailable: ${error instanceof Error ? error.message : String(error)}. Returning tier 1 results only.`);
        return auditStructure(url, { headless });
    } finally {
        if (analyzer) {
            try { await analyzer.close(); } catch { /* ignore cleanup errors */ }
        }
    }
}
