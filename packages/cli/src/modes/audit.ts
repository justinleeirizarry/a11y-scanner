/**
 * Audit Mode Handlers
 *
 * Focused audit modes that run individual judgment checks.
 * These use the core audit functions directly — no agent, no API keys.
 */
import {
    auditKeyboard,
    auditStructure,
    auditScreenReader,
    EXIT_CODES,
    setExitCode,
} from '@aria51/core';

export async function runAuditKeyboard(url: string, opts: { maxTabs?: number; quiet?: boolean }): Promise<void> {
    try {
        const result = await auditKeyboard(url, { maxTabs: opts.maxTabs });

        if (opts.quiet) {
            const icon = result.issues.length > 0 ? 'x' : 'v';
            console.log(`${icon} keyboard: ${result.tabStops} tab stops, ${result.issues.length} issues`);
            for (const i of result.issues) console.log(`  [${i.severity}] ${i.message}`);
        } else {
            console.log(`\nKeyboard Audit: ${url}\n`);
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
        }
        setExitCode(EXIT_CODES.SUCCESS);
    } catch (error) {
        console.error(`Keyboard audit failed: ${error instanceof Error ? error.message : String(error)}`);
        setExitCode(EXIT_CODES.RUNTIME_ERROR);
    }
}

export async function runAuditStructure(url: string, opts: { quiet?: boolean }): Promise<void> {
    try {
        const result = await auditStructure(url);

        if (opts.quiet) {
            const icon = result.issues.length > 0 ? 'x' : 'v';
            console.log(`${icon} structure: ${result.landmarks.length} landmarks, ${result.headings.length} headings, ${result.issues.length} issues`);
            for (const i of result.issues) console.log(`  [${i.severity}] ${i.message}`);
        } else {
            console.log(`\nStructure Audit: ${url}\n`);
            console.log(`Title: ${result.title || '(empty)'}`);
            console.log(`Landmarks: ${result.landmarks.length}`);
            console.log(`Headings: ${result.headings.length}`);
            console.log(`Form inputs: ${result.formInputs.length} (${result.formInputs.filter(f => !f.hasLabel).length} unlabeled)\n`);
            if (result.issues.length > 0) {
                console.log('Issues:');
                for (const i of result.issues) console.log(`  [${i.severity}] WCAG ${i.wcag}: ${i.message}`);
                console.log('');
            }
            console.log('Headings:');
            for (const h of result.headings.slice(0, 20)) console.log(`${'  '.repeat(h.level)}h${h.level}: ${h.text || '(empty)'}`);
            console.log('\nLandmarks:');
            for (const l of result.landmarks) console.log(`  ${l.role}${l.label ? ` "${l.label}"` : ''} (${l.tag})`);
        }
        setExitCode(EXIT_CODES.SUCCESS);
    } catch (error) {
        console.error(`Structure audit failed: ${error instanceof Error ? error.message : String(error)}`);
        setExitCode(EXIT_CODES.RUNTIME_ERROR);
    }
}

export async function runAuditScreenReader(url: string, opts: { quiet?: boolean }): Promise<void> {
    try {
        const result = await auditScreenReader(url);

        if (opts.quiet) {
            const icon = result.issues.length > 0 ? 'x' : 'v';
            console.log(`${icon} screen-reader: ${result.issues.length} issues`);
            for (const i of result.issues) console.log(`  [${i.severity}] ${i.message}`);
        } else {
            console.log(`\nScreen Reader Audit: ${url}\n`);
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
        }
        setExitCode(EXIT_CODES.SUCCESS);
    } catch (error) {
        console.error(`Screen reader audit failed: ${error instanceof Error ? error.message : String(error)}`);
        setExitCode(EXIT_CODES.RUNTIME_ERROR);
    }
}
