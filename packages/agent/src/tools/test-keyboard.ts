/**
 * test_keyboard Tool
 *
 * Runs keyboard navigation tests on a page using Playwright directly.
 * Tests: tab order, focus traps, focus indicators, skip links.
 * No Stagehand/Browserbase required — uses the core BrowserService.
 *
 * This gives the agent real keyboard interaction data for manual WCAG checks
 * that axe-core cannot automate (2.1.1, 2.1.2, 2.4.1, 2.4.3, 2.4.7).
 */
import { z } from 'zod';
import { chromium } from 'playwright';
import type { AgentToolDef } from '../agent/provider.js';
import type { AuditSession } from '../types.js';

export const createTestKeyboardTool = (session: AuditSession): AgentToolDef =>
    ({
        name: 'test_keyboard',
        description:
            'Test keyboard navigation on a page by actually pressing Tab and analyzing focus behavior. Returns tab order, focus trap detection, focus indicator presence, and skip link status. Use this for WCAG 2.1.1 (Keyboard), 2.1.2 (No Keyboard Trap), 2.4.1 (Bypass Blocks), 2.4.3 (Focus Order), and 2.4.7 (Focus Visible) manual checks.',
        inputSchema: z.object({
            url: z.string().url().describe('The URL to test keyboard navigation on'),
            maxTabs: z.number().optional().default(50).describe('Maximum Tab presses before stopping (default: 50)'),
        }),
        run: async ({ url, maxTabs }: any) => {
            const browser = await chromium.launch({ headless: session.config.headless });
            try {
                const page = await browser.newPage();
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await new Promise(resolve => setTimeout(resolve, 1000));

                const tabOrder: Array<{ index: number; tag: string; role: string; name: string; selector: string; hasFocusStyle: boolean }> = [];
                const issues: string[] = [];

                // Start from body
                await page.evaluate(() => document.body.focus());

                let previousSelector = '';
                let sameCount = 0;
                let trapped = false;

                for (let i = 0; i < maxTabs; i++) {
                    await page.keyboard.press('Tab');
                    await new Promise(resolve => setTimeout(resolve, 80));

                    const info = await page.evaluate(() => {
                        const el = document.activeElement;
                        if (!el || el === document.body) return null;

                        // Check for focus indicator
                        const styles = window.getComputedStyle(el);
                        const outline = styles.outline;
                        const boxShadow = styles.boxShadow;
                        const borderColor = styles.borderColor;
                        const hasOutline = outline !== 'none' && outline !== '' && !outline.includes('0px');
                        const hasBoxShadow = boxShadow !== 'none' && boxShadow !== '';
                        // Simple heuristic: if outline or box-shadow is present, assume focus style exists
                        const hasFocusStyle = hasOutline || hasBoxShadow;

                        // Build a simple selector
                        const tag = el.tagName.toLowerCase();
                        const id = el.id ? `#${el.id}` : '';
                        const cls = el.className && typeof el.className === 'string'
                            ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
                            : '';
                        const selector = `${tag}${id}${cls}`.slice(0, 80);

                        return {
                            tag,
                            role: el.getAttribute('role') || el.tagName.toLowerCase(),
                            name: el.getAttribute('aria-label')
                                || el.getAttribute('aria-labelledby')
                                || (el as HTMLElement).innerText?.slice(0, 50)
                                || el.getAttribute('title')
                                || '',
                            selector,
                            hasFocusStyle,
                        };
                    });

                    if (!info) continue;

                    // Detect focus trap
                    if (info.selector === previousSelector) {
                        sameCount++;
                        if (sameCount >= 3) {
                            issues.push(`FOCUS TRAP detected at ${info.selector} — focus cannot escape this element (WCAG 2.1.2)`);
                            trapped = true;
                            break;
                        }
                    } else {
                        sameCount = 0;
                    }
                    previousSelector = info.selector;

                    tabOrder.push({ index: i + 1, ...info });

                    // Check if we cycled back to first element
                    if (tabOrder.length > 2 && info.selector === tabOrder[0].selector) {
                        break;
                    }
                }

                // Analyze results
                const noFocusIndicator = tabOrder.filter(e => !e.hasFocusStyle);
                if (noFocusIndicator.length > 0) {
                    issues.push(`${noFocusIndicator.length} element(s) lack visible focus indicators (WCAG 2.4.7): ${noFocusIndicator.slice(0, 5).map(e => e.selector).join(', ')}`);
                }

                // Check skip link
                const firstElement = tabOrder[0];
                const hasSkipLink = firstElement && (
                    firstElement.name.toLowerCase().includes('skip') ||
                    firstElement.name.toLowerCase().includes('main content')
                );
                if (!hasSkipLink) {
                    issues.push('No skip link found as first focusable element (WCAG 2.4.1)');
                }

                // Count interactive elements on page vs reachable by keyboard
                const totalInteractive = await page.evaluate(() => {
                    return document.querySelectorAll('a[href], button, input, select, textarea, [tabindex], [role="button"], [role="link"]').length;
                });
                const reachable = tabOrder.length;
                if (totalInteractive > 0 && reachable < totalInteractive * 0.5) {
                    issues.push(`Only ${reachable} of ${totalInteractive} interactive elements are reachable via Tab (WCAG 2.1.1)`);
                }

                // Format output
                const lines = [
                    `## Keyboard Navigation Test: ${url}`,
                    ``,
                    `- **Tab stops found:** ${tabOrder.length}`,
                    `- **Interactive elements on page:** ${totalInteractive}`,
                    `- **Focus trap detected:** ${trapped ? 'YES' : 'no'}`,
                    `- **Skip link present:** ${hasSkipLink ? 'yes' : 'NO'}`,
                    `- **Elements without focus indicator:** ${noFocusIndicator.length}`,
                    ``,
                ];

                if (issues.length > 0) {
                    lines.push(`### Issues (${issues.length})`);
                    for (const issue of issues) {
                        lines.push(`- ${issue}`);
                    }
                    lines.push('');
                }

                lines.push(`### Tab Order (first ${Math.min(tabOrder.length, 20)} elements)`);
                for (const entry of tabOrder.slice(0, 20)) {
                    const focusIcon = entry.hasFocusStyle ? '✓' : '✗';
                    lines.push(`${entry.index}. [${focusIcon}] ${entry.role} "${entry.name.slice(0, 40)}" — ${entry.selector}`);
                }
                if (tabOrder.length > 20) {
                    lines.push(`... and ${tabOrder.length - 20} more`);
                }

                return lines.join('\n');
            } catch (error) {
                return `Keyboard test failed for ${url}: ${error instanceof Error ? error.message : String(error)}`;
            } finally {
                await browser.close();
            }
        },
    });
