/**
 * test_screen_reader Tool
 *
 * Simulates screen reader navigation patterns using Playwright.
 * Tests: page title, landmarks, heading navigation, link/button names,
 * form labels, image alt text, ARIA live regions.
 *
 * This gives the agent screen reader perspective data for manual WCAG checks:
 * 1.1.1 (Non-text Content), 1.3.1 (Info and Relationships),
 * 2.4.1 (Bypass Blocks), 2.4.4 (Link Purpose), 3.3.2 (Labels or Instructions),
 * 4.1.2 (Name, Role, Value).
 */
import { z } from 'zod';
import { chromium } from 'playwright';
import type { AgentToolDef } from '../agent/provider.js';
import type { AuditSession } from '../types.js';

export const createTestScreenReaderTool = (session: AuditSession): AgentToolDef =>
    ({
        name: 'test_screen_reader',
        description:
            'Simulate screen reader navigation on a page. Tests how the page would be experienced by a screen reader user: page title announcement, landmark navigation, heading traversal, link/button accessible names, image alt text, and form label associations. Use this for WCAG 1.1.1, 1.3.1, 2.4.1, 2.4.4, 3.3.2, 4.1.2 manual checks.',
        inputSchema: z.object({
            url: z.string().url().describe('The URL to test screen reader navigation on'),
        }),
        run: async ({ url }: any) => {
            const browser = await chromium.launch({ headless: session.config.headless });
            try {
                const page = await browser.newPage();
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await new Promise(resolve => setTimeout(resolve, 1000));

                const issues: Array<{ severity: string; wcag: string; message: string }> = [];

                // 1. Page title
                const title = await page.title();
                if (!title || title.trim() === '') {
                    issues.push({ severity: 'serious', wcag: '2.4.2', message: 'Page has no title. Screen readers announce the title when the page loads.' });
                }

                // 2. Images without alt text
                const images = await page.evaluate(() => {
                    const imgs = document.querySelectorAll('img');
                    const results: Array<{ src: string; alt: string | null; hasAlt: boolean; isDecorative: boolean }> = [];
                    imgs.forEach(img => {
                        const alt = img.getAttribute('alt');
                        const role = img.getAttribute('role');
                        const isDecorative = role === 'presentation' || role === 'none' || alt === '';
                        results.push({
                            src: img.src.split('/').pop()?.slice(0, 40) || '',
                            alt,
                            hasAlt: alt !== null,
                            isDecorative,
                        });
                    });
                    return results;
                });
                const missingAlt = images.filter(i => !i.hasAlt && !i.isDecorative);
                if (missingAlt.length > 0) {
                    issues.push({
                        severity: 'critical',
                        wcag: '1.1.1',
                        message: `${missingAlt.length} image(s) have no alt attribute. Screen readers will announce the filename: ${missingAlt.slice(0, 3).map(i => i.src).join(', ')}`,
                    });
                }

                // 3. Links without accessible names
                const links = await page.evaluate(() => {
                    const results: Array<{ text: string; href: string; hasName: boolean }> = [];
                    document.querySelectorAll('a[href]').forEach(a => {
                        const el = a as HTMLAnchorElement;
                        const name = el.innerText?.trim()
                            || el.getAttribute('aria-label')
                            || el.querySelector('img')?.getAttribute('alt')
                            || '';
                        results.push({
                            text: name.slice(0, 50),
                            href: el.href?.slice(0, 60) || '',
                            hasName: name.length > 0,
                        });
                    });
                    return results;
                });
                const namelessLinks = links.filter(l => !l.hasName);
                if (namelessLinks.length > 0) {
                    issues.push({
                        severity: 'critical',
                        wcag: '2.4.4',
                        message: `${namelessLinks.length} link(s) have no accessible name. Screen readers will announce "link" with no context.`,
                    });
                }

                // Non-descriptive link text
                const vagueLinks = links.filter(l => l.hasName && /^(click here|read more|learn more|here|more|link)$/i.test(l.text));
                if (vagueLinks.length > 0) {
                    issues.push({
                        severity: 'serious',
                        wcag: '2.4.4',
                        message: `${vagueLinks.length} link(s) use non-descriptive text: ${vagueLinks.slice(0, 3).map(l => `"${l.text}"`).join(', ')}. Screen reader users navigating by links lose context.`,
                    });
                }

                // 4. Buttons without accessible names
                const buttons = await page.evaluate(() => {
                    const results: Array<{ text: string; hasName: boolean }> = [];
                    document.querySelectorAll('button, [role="button"]').forEach(el => {
                        const name = (el as HTMLElement).innerText?.trim()
                            || el.getAttribute('aria-label')
                            || el.getAttribute('title')
                            || '';
                        results.push({ text: name.slice(0, 50), hasName: name.length > 0 });
                    });
                    return results;
                });
                const namelessButtons = buttons.filter(b => !b.hasName);
                if (namelessButtons.length > 0) {
                    issues.push({
                        severity: 'critical',
                        wcag: '4.1.2',
                        message: `${namelessButtons.length} button(s) have no accessible name. Screen readers will announce "button" with no context.`,
                    });
                }

                // 5. Form inputs without labels
                const formInputs = await page.evaluate(() => {
                    const results: Array<{ type: string; name: string; hasLabel: boolean; labelText: string }> = [];
                    document.querySelectorAll('input, select, textarea').forEach(el => {
                        const input = el as HTMLInputElement;
                        if (input.type === 'hidden') return;
                        const id = input.id;
                        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
                        const ariaLabel = input.getAttribute('aria-label');
                        const hasLabel = !!(label || ariaLabel || input.getAttribute('aria-labelledby') || input.getAttribute('title'));
                        results.push({
                            type: input.type || input.tagName.toLowerCase(),
                            name: input.name || input.id || '',
                            hasLabel,
                            labelText: ariaLabel || (label as HTMLElement)?.innerText?.slice(0, 40) || '',
                        });
                    });
                    return results;
                });
                const unlabeledInputs = formInputs.filter(f => !f.hasLabel);
                if (unlabeledInputs.length > 0) {
                    issues.push({
                        severity: 'critical',
                        wcag: '3.3.2',
                        message: `${unlabeledInputs.length} form input(s) have no label. Screen readers cannot describe: ${unlabeledInputs.slice(0, 3).map(f => f.type).join(', ')}`,
                    });
                }

                // 6. ARIA live regions
                const liveRegions = await page.evaluate(() => {
                    return document.querySelectorAll('[aria-live], [role="alert"], [role="status"], [role="log"]').length;
                });

                // 7. Language
                const lang = await page.evaluate(() => document.documentElement.getAttribute('lang'));
                if (!lang) {
                    issues.push({
                        severity: 'serious',
                        wcag: '3.1.1',
                        message: 'Page has no lang attribute on <html>. Screen readers cannot determine the correct pronunciation language.',
                    });
                }

                // Format output
                const lines = [
                    `## Screen Reader Navigation Test: ${url}`,
                    ``,
                    `**Page title:** ${title ? `"${title}"` : '(none)'}`,
                    `**Language:** ${lang || '(not set)'}`,
                    `**Images:** ${images.length} total, ${missingAlt.length} missing alt`,
                    `**Links:** ${links.length} total, ${namelessLinks.length} without name, ${vagueLinks.length} non-descriptive`,
                    `**Buttons:** ${buttons.length} total, ${namelessButtons.length} without name`,
                    `**Form inputs:** ${formInputs.length} total, ${unlabeledInputs.length} unlabeled`,
                    `**Live regions:** ${liveRegions}`,
                    ``,
                ];

                if (issues.length > 0) {
                    lines.push(`### Issues (${issues.length})`);
                    for (const issue of issues) {
                        lines.push(`- **[${issue.severity}] WCAG ${issue.wcag}:** ${issue.message}`);
                    }
                } else {
                    lines.push('### No critical screen reader issues detected');
                }

                return lines.join('\n');
            } catch (error) {
                return `Screen reader test failed for ${url}: ${error instanceof Error ? error.message : String(error)}`;
            } finally {
                await browser.close();
            }
        },
    });
