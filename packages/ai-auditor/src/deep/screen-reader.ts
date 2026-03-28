/**
 * Deep Screen Reader Audit
 *
 * Composes core auditScreenReader (tier 1) with ScreenReaderNavigator (tier 2).
 * Runs both on a shared browser session, then merges results.
 * Falls back to tier 1 only if Stagehand fails.
 */
import { auditScreenReader, logger } from '@aria51/core';
import type { ScreenReaderAuditResult } from '@aria51/core';
import { ScreenReaderNavigator } from '../stagehand/screen-reader-navigator.js';
import type { DeepScreenReaderAuditResult, DeepAuditOptions } from './types.js';

export async function deepAuditScreenReader(
    url: string,
    options: DeepAuditOptions = {}
): Promise<ScreenReaderAuditResult | DeepScreenReaderAuditResult> {
    const { model, verbose, headless } = options;

    let navigator: ScreenReaderNavigator | null = null;

    try {
        // Init Stagehand — this launches a browser
        navigator = new ScreenReaderNavigator({ model, verbose });
        await navigator.init();

        const page = navigator.page;
        let coreResult: ScreenReaderAuditResult;

        if (page) {
            // Navigate once for the core audit
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Run tier 1 on Stagehand's browser — no second browser launch
            coreResult = await auditScreenReader(url, { headless, page });
        } else {
            logger.warn('Could not access Stagehand page, running core audit separately');
            coreResult = await auditScreenReader(url, { headless });
        }

        // Run tier 2 — Stagehand AI analysis (re-navigates internally)
        const deepResult = await navigator.navigate(url);

        return {
            ...coreResult,
            deep: true as const,
            deepAnalysis: deepResult,
        };
    } catch (error) {
        logger.warn(`Deep screen reader analysis unavailable: ${error instanceof Error ? error.message : String(error)}. Returning tier 1 results only.`);
        return auditScreenReader(url, { headless });
    } finally {
        if (navigator) {
            try { await navigator.close(); } catch { /* ignore cleanup errors */ }
        }
    }
}
