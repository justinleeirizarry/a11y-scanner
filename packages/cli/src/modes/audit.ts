/**
 * Audit Mode Handlers
 *
 * Focused audit modes that run individual judgment checks.
 * Tier 1 uses core audit functions directly — no agent, no API keys.
 * Tier 2 (--deep) adds AI-enhanced analysis via Stagehand.
 */
import {
    auditKeyboard,
    auditStructure,
    auditScreenReader,
    EXIT_CODES,
    setExitCode,
} from '@aria51/core';

interface DeepOptions {
    deep?: boolean;
    model?: string;
    verbose?: boolean;
}

function printDeepAnalysis(label: string, deepAnalysis: any): void {
    console.log(`\n--- Deep Analysis (AI-enhanced) ---\n`);
    if (deepAnalysis.issues && deepAnalysis.issues.length > 0) {
        console.log(`AI-detected issues (${deepAnalysis.issues.length}):`);
        for (const issue of deepAnalysis.issues) {
            const severity = issue.severity || issue.impact || '';
            const desc = issue.description || issue.message || issue.element || '';
            console.log(`  [${severity}] ${desc}`);
        }
    }
    if (deepAnalysis.summary) {
        console.log(`\nSummary: ${deepAnalysis.summary}`);
    }
    if (deepAnalysis.coverage) {
        const c = deepAnalysis.coverage;
        if (c.percentage !== undefined) console.log(`Coverage: ${c.percentage}%`);
    }
}

export async function runAuditKeyboard(url: string, opts: { maxTabs?: number; quiet?: boolean } & DeepOptions): Promise<void> {
    try {
        let result: any;

        if (opts.deep) {
            const { deepAuditKeyboard } = await import('@aria51/ai-auditor');
            result = await deepAuditKeyboard(url, { maxTabs: opts.maxTabs, model: opts.model, verbose: opts.verbose });
        } else {
            result = await auditKeyboard(url, { maxTabs: opts.maxTabs });
        }

        if (opts.quiet) {
            const icon = result.issues.length > 0 ? 'x' : 'v';
            const deepLabel = result.deep ? ' [deep]' : '';
            console.log(`${icon} keyboard${deepLabel}: ${result.tabStops} tab stops, ${result.issues.length} issues`);
            for (const i of result.issues) console.log(`  [${i.severity}] ${i.message}`);
        } else {
            console.log(`\nKeyboard Audit${result.deep ? ' (deep)' : ''}: ${url}\n`);
            console.log(`Tab stops: ${result.tabStops} / ${result.totalInteractive} interactive`);
            console.log(`Focus trap: ${result.focusTrapDetected ? 'YES' : 'no'}`);
            console.log(`Skip link: ${result.hasSkipLink ? 'yes' : 'NO'}`);
            console.log(`Missing focus indicators: ${result.elementsWithoutFocusIndicator}\n`);
            if (result.issues.length > 0) {
                console.log('Issues:');
                for (const i of result.issues) console.log(`  [${i.severity}] WCAG ${i.wcag}: ${i.message}`);
                console.log('');
            }
            console.log('Tab Order:');
            for (const e of result.tabOrder.slice(0, 20)) {
                console.log(`  ${e.index}. ${e.hasFocusStyle ? '✓' : '✗'} ${e.role} "${e.name.slice(0, 40)}" — ${e.selector}`);
            }
            if (result.tabOrder.length > 20) console.log(`  ... ${result.tabOrder.length - 20} more`);
            if (result.deep && result.deepAnalysis) {
                printDeepAnalysis('keyboard', result.deepAnalysis);
            }
        }
        setExitCode(EXIT_CODES.SUCCESS);
    } catch (error) {
        console.error(`Keyboard audit failed: ${error instanceof Error ? error.message : String(error)}`);
        setExitCode(EXIT_CODES.RUNTIME_ERROR);
    }
}

export async function runAuditStructure(url: string, opts: { quiet?: boolean } & DeepOptions): Promise<void> {
    try {
        let result: any;

        if (opts.deep) {
            const { deepAuditStructure } = await import('@aria51/ai-auditor');
            result = await deepAuditStructure(url, { model: opts.model, verbose: opts.verbose });
        } else {
            result = await auditStructure(url);
        }

        if (opts.quiet) {
            const icon = result.issues.length > 0 ? 'x' : 'v';
            const deepLabel = result.deep ? ' [deep]' : '';
            console.log(`${icon} structure${deepLabel}: ${result.landmarks.length} landmarks, ${result.headings.length} headings, ${result.issues.length} issues`);
            for (const i of result.issues) console.log(`  [${i.severity}] ${i.message}`);
        } else {
            console.log(`\nStructure Audit${result.deep ? ' (deep)' : ''}: ${url}\n`);
            console.log(`Title: ${result.title || '(empty)'}`);
            console.log(`Landmarks: ${result.landmarks.length}`);
            console.log(`Headings: ${result.headings.length}`);
            console.log(`Form inputs: ${result.formInputs.length} (${result.formInputs.filter((f: any) => !f.hasLabel).length} unlabeled)\n`);
            if (result.issues.length > 0) {
                console.log('Issues:');
                for (const i of result.issues) console.log(`  [${i.severity}] WCAG ${i.wcag}: ${i.message}`);
                console.log('');
            }
            console.log('Headings:');
            for (const h of result.headings.slice(0, 20)) console.log(`${'  '.repeat(h.level)}h${h.level}: ${h.text || '(empty)'}`);
            console.log('\nLandmarks:');
            for (const l of result.landmarks) console.log(`  ${l.role}${l.label ? ` "${l.label}"` : ''} (${l.tag})`);
            if (result.deep && result.deepAnalysis) {
                printDeepAnalysis('structure', result.deepAnalysis);
            }
        }
        setExitCode(EXIT_CODES.SUCCESS);
    } catch (error) {
        console.error(`Structure audit failed: ${error instanceof Error ? error.message : String(error)}`);
        setExitCode(EXIT_CODES.RUNTIME_ERROR);
    }
}

export async function runAuditScreenReader(url: string, opts: { quiet?: boolean } & DeepOptions): Promise<void> {
    try {
        let result: any;

        if (opts.deep) {
            const { deepAuditScreenReader } = await import('@aria51/ai-auditor');
            result = await deepAuditScreenReader(url, { model: opts.model, verbose: opts.verbose });
        } else {
            result = await auditScreenReader(url);
        }

        if (opts.quiet) {
            const icon = result.issues.length > 0 ? 'x' : 'v';
            const deepLabel = result.deep ? ' [deep]' : '';
            console.log(`${icon} screen-reader${deepLabel}: ${result.issues.length} issues`);
            for (const i of result.issues) console.log(`  [${i.severity}] ${i.message}`);
        } else {
            console.log(`\nScreen Reader Audit${result.deep ? ' (deep)' : ''}: ${url}\n`);
            console.log(`Title: ${result.title || '(none)'}`);
            console.log(`Language: ${result.lang || '(not set)'}`);
            console.log(`Images: ${result.images.total} (${result.images.missingAlt} missing alt)`);
            console.log(`Links: ${result.links.total} (${result.links.noName} no name, ${result.links.vague} vague)`);
            console.log(`Buttons: ${result.buttons.total} (${result.buttons.noName} no name)`);
            console.log(`Forms: ${result.formInputs.total} (${result.formInputs.unlabeled} unlabeled)`);
            console.log(`Live regions: ${result.liveRegions}\n`);
            if (result.issues.length > 0) {
                console.log('Issues:');
                for (const i of result.issues) console.log(`  [${i.severity}] WCAG ${i.wcag}: ${i.message}`);
            } else {
                console.log('No critical screen reader issues detected.');
            }
            if (result.deep && result.deepAnalysis) {
                printDeepAnalysis('screen-reader', result.deepAnalysis);
            }
        }
        setExitCode(EXIT_CODES.SUCCESS);
    } catch (error) {
        console.error(`Screen reader audit failed: ${error instanceof Error ? error.message : String(error)}`);
        setExitCode(EXIT_CODES.RUNTIME_ERROR);
    }
}
