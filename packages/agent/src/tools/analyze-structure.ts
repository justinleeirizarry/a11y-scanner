/**
 * analyze_structure Tool
 *
 * Gets the accessibility tree and analyzes document structure.
 * Uses Playwright's page.accessibility.snapshot() — no Stagehand required.
 *
 * This gives the agent structural data for manual WCAG checks:
 * 1.3.1 (Info and Relationships), 2.4.2 (Page Titled), 2.4.6 (Headings and Labels),
 * 4.1.1 (Parsing), 4.1.2 (Name, Role, Value).
 */
import { z } from 'zod';
import { chromium } from 'playwright';
import type { AgentToolDef } from '../agent/provider.js';
import type { AuditSession } from '../types.js';

export const createAnalyzeStructureTool = (session: AuditSession): AgentToolDef =>
    ({
        name: 'analyze_structure',
        description:
            'Analyze a page\'s accessibility structure: landmarks, heading hierarchy, ARIA roles, form labels, and interactive elements. Returns the accessibility tree with structural validation. Use this for WCAG 1.3.1 (Info and Relationships), 2.4.2 (Page Titled), 2.4.6 (Headings and Labels), 4.1.2 (Name, Role, Value) manual checks.',
        inputSchema: z.object({
            url: z.string().url().describe('The URL to analyze'),
        }),
        run: async ({ url }: any) => {
            const browser = await chromium.launch({ headless: session.config.headless });
            try {
                const page = await browser.newPage();
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Get accessibility tree
                const tree = await page.accessibility.snapshot();
                const title = await page.title();

                // Analyze landmarks
                const landmarks = await page.evaluate(() => {
                    const landmarkRoles = ['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'search', 'region', 'form'];
                    const results: Array<{ role: string; label: string; tag: string }> = [];

                    // Check ARIA roles
                    for (const role of landmarkRoles) {
                        const elements = document.querySelectorAll(`[role="${role}"]`);
                        elements.forEach(el => {
                            results.push({
                                role,
                                label: el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || '',
                                tag: el.tagName.toLowerCase(),
                            });
                        });
                    }

                    // Check semantic HTML
                    const semanticMap: Record<string, string> = {
                        header: 'banner', nav: 'navigation', main: 'main',
                        aside: 'complementary', footer: 'contentinfo', form: 'form', search: 'search',
                    };
                    for (const [tag, role] of Object.entries(semanticMap)) {
                        document.querySelectorAll(tag).forEach(el => {
                            if (!el.getAttribute('role')) { // Don't double-count
                                results.push({
                                    role,
                                    label: el.getAttribute('aria-label') || '',
                                    tag,
                                });
                            }
                        });
                    }

                    return results;
                });

                // Analyze headings
                const headings = await page.evaluate(() => {
                    const results: Array<{ level: number; text: string; id: string }> = [];
                    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
                        results.push({
                            level: parseInt(el.tagName[1]),
                            text: (el as HTMLElement).innerText?.slice(0, 80) || '',
                            id: el.id || '',
                        });
                    });
                    return results;
                });

                // Analyze forms
                const forms = await page.evaluate(() => {
                    const inputs = document.querySelectorAll('input, select, textarea');
                    const results: Array<{ type: string; name: string; hasLabel: boolean; labelText: string }> = [];
                    inputs.forEach(el => {
                        const input = el as HTMLInputElement;
                        const id = input.id;
                        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
                        const ariaLabel = input.getAttribute('aria-label');
                        const ariaLabelledby = input.getAttribute('aria-labelledby');
                        const hasLabel = !!(label || ariaLabel || ariaLabelledby || input.getAttribute('title'));

                        results.push({
                            type: input.type || input.tagName.toLowerCase(),
                            name: input.name || input.id || '',
                            hasLabel,
                            labelText: ariaLabel || (label as HTMLElement)?.innerText?.slice(0, 50) || '',
                        });
                    });
                    return results;
                });

                // Build issues list
                const issues: string[] = [];

                // Title check
                if (!title || title.trim() === '') {
                    issues.push('Page has no title (WCAG 2.4.2)');
                }

                // Landmark checks
                const hasMain = landmarks.some(l => l.role === 'main');
                if (!hasMain) issues.push('No main landmark found (WCAG 1.3.1)');

                const landmarkCounts: Record<string, number> = {};
                for (const l of landmarks) {
                    landmarkCounts[l.role] = (landmarkCounts[l.role] || 0) + 1;
                }
                for (const [role, count] of Object.entries(landmarkCounts)) {
                    if (count > 1) {
                        const labeled = landmarks.filter(l => l.role === role && l.label).length;
                        if (labeled < count) {
                            issues.push(`${count} "${role}" landmarks found but ${count - labeled} are unlabeled — screen readers can't distinguish them (WCAG 1.3.1)`);
                        }
                    }
                }

                // Heading checks
                const h1Count = headings.filter(h => h.level === 1).length;
                if (h1Count === 0) issues.push('No h1 heading found (WCAG 2.4.6)');
                if (h1Count > 1) issues.push(`${h1Count} h1 headings found — pages should typically have one (WCAG 2.4.6)`);

                for (let i = 1; i < headings.length; i++) {
                    const prev = headings[i - 1].level;
                    const curr = headings[i].level;
                    if (curr > prev + 1) {
                        issues.push(`Heading level skipped: h${prev} → h${curr} ("${headings[i].text.slice(0, 30)}") (WCAG 1.3.1)`);
                    }
                }

                const emptyHeadings = headings.filter(h => !h.text.trim());
                if (emptyHeadings.length > 0) {
                    issues.push(`${emptyHeadings.length} empty heading(s) found (WCAG 2.4.6)`);
                }

                // Form label checks
                const unlabeled = forms.filter(f => !f.hasLabel && f.type !== 'hidden');
                if (unlabeled.length > 0) {
                    issues.push(`${unlabeled.length} form input(s) without labels: ${unlabeled.slice(0, 3).map(f => f.type + (f.name ? `[${f.name}]` : '')).join(', ')} (WCAG 4.1.2)`);
                }

                // Format output
                const lines = [
                    `## Structure Analysis: ${url}`,
                    ``,
                    `**Title:** ${title || '(empty)'}`,
                    `**Landmarks:** ${landmarks.length} (${Object.entries(landmarkCounts).map(([r, c]) => `${c} ${r}`).join(', ') || 'none'})`,
                    `**Headings:** ${headings.length} (h1: ${h1Count})`,
                    `**Form inputs:** ${forms.length} (${unlabeled.length} unlabeled)`,
                    ``,
                ];

                if (issues.length > 0) {
                    lines.push(`### Issues (${issues.length})`);
                    for (const issue of issues) lines.push(`- ${issue}`);
                    lines.push('');
                }

                lines.push('### Heading Hierarchy');
                for (const h of headings.slice(0, 20)) {
                    lines.push(`${'  '.repeat(h.level - 1)}h${h.level}: ${h.text || '(empty)'}`);
                }

                lines.push('', '### Landmarks');
                for (const l of landmarks) {
                    lines.push(`- ${l.role}${l.label ? ` "${l.label}"` : ''} (${l.tag})`);
                }

                if (forms.length > 0) {
                    lines.push('', '### Form Inputs');
                    for (const f of forms.slice(0, 15)) {
                        const labelIcon = f.hasLabel ? '✓' : '✗';
                        lines.push(`- [${labelIcon}] ${f.type}${f.name ? ` "${f.name}"` : ''} — ${f.hasLabel ? `label: "${f.labelText}"` : 'NO LABEL'}`);
                    }
                }

                // Include condensed a11y tree
                if (tree) {
                    lines.push('', '### Accessibility Tree (top level)');
                    const topChildren = (tree as any).children?.slice(0, 15) || [];
                    for (const child of topChildren) {
                        const name = child.name ? ` "${child.name.slice(0, 40)}"` : '';
                        lines.push(`- ${child.role}${name}`);
                        if (child.children) {
                            for (const grandchild of child.children.slice(0, 3)) {
                                const gcName = grandchild.name ? ` "${grandchild.name.slice(0, 30)}"` : '';
                                lines.push(`  - ${grandchild.role}${gcName}`);
                            }
                            if (child.children.length > 3) {
                                lines.push(`  ... ${child.children.length - 3} more children`);
                            }
                        }
                    }
                }

                return lines.join('\n');
            } catch (error) {
                return `Structure analysis failed for ${url}: ${error instanceof Error ? error.message : String(error)}`;
            } finally {
                await browser.close();
            }
        },
    });
