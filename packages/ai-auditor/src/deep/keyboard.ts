/**
 * Deep Keyboard Audit
 *
 * Composes core auditKeyboard (tier 1) with StagehandKeyboardTester (tier 2).
 * Runs both on a shared browser session, then merges results.
 * Falls back to tier 1 only if Stagehand fails.
 */
import { auditKeyboard, logger } from '@aria51/core';
import type { KeyboardAuditResult } from '@aria51/core';
import { StagehandKeyboardTester } from '../stagehand/keyboard-tester.js';
import type { DeepKeyboardAuditResult, DeepAuditOptions } from './types.js';

export async function deepAuditKeyboard(
    url: string,
    options: DeepAuditOptions & { maxTabs?: number } = {}
): Promise<KeyboardAuditResult | DeepKeyboardAuditResult> {
    const { model, verbose, headless, maxTabs } = options;

    let tester: StagehandKeyboardTester | null = null;

    try {
        // Init Stagehand — this launches a browser
        tester = new StagehandKeyboardTester({ model, verbose });
        await tester.init();

        const page = tester.page;
        let coreResult: KeyboardAuditResult;

        if (page) {
            // Navigate once for the core audit
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Run tier 1 on Stagehand's browser — no second browser launch
            coreResult = await auditKeyboard(url, { maxTabs, headless, page });
        } else {
            // Couldn't get Stagehand page — run core standalone
            logger.warn('Could not access Stagehand page, running core audit separately');
            coreResult = await auditKeyboard(url, { maxTabs, headless });
        }

        // Run tier 2 — Stagehand AI analysis (re-navigates internally)
        const deepResult = await tester.test(url);

        return {
            ...coreResult,
            deep: true as const,
            deepAnalysis: deepResult,
        };
    } catch (error) {
        logger.warn(`Deep keyboard analysis unavailable: ${error instanceof Error ? error.message : String(error)}. Returning tier 1 results only.`);
        // Fall back to tier 1
        return auditKeyboard(url, { maxTabs, headless });
    } finally {
        if (tester) {
            try { await tester.close(); } catch { /* ignore cleanup errors */ }
        }
    }
}
