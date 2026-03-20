/**
 * Integration Tests - Screen Reader Navigation
 *
 * Tests simulated screen reader navigation using Playwright's accessibility
 * snapshot API and DOM queries. Validates landmark detection, heading structure,
 * skip links, and keyboard navigation patterns.
 *
 * Uses a local Playwright browser (no Stagehand/Browserbase required)
 * to verify the navigation logic against the screen-reader-test.html fixture.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIXTURE_URL = `file://${join(__dirname, '../fixtures/screen-reader-test.html')}`;

/** Snapshot node from Playwright accessibility API */
interface SnapshotNode {
    role: string;
    name: string;
    children?: SnapshotNode[];
    level?: number;
}

/**
 * Extract landmarks from the DOM (Playwright snapshots flatten landmark structure)
 */
async function extractLandmarks(page: Page) {
    return page.evaluate(() => {
        const landmarks: Array<{ role: string; name?: string }> = [];
        const semanticMap: Record<string, string> = {
            'HEADER': 'banner', 'NAV': 'navigation', 'MAIN': 'main',
            'ASIDE': 'complementary', 'FOOTER': 'contentinfo',
        };
        const landmarkRoles = ['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'search', 'form', 'region'];

        // All landmark elements in DOM order
        const selector = landmarkRoles.map(r => `[role="${r}"]`).join(', ') +
            ', header:not([role]), nav:not([role]), main:not([role]), aside:not([role]), footer:not([role])';
        const elements = document.querySelectorAll(selector);

        const seen = new Set<Element>();
        for (const el of elements) {
            if (seen.has(el)) continue;
            seen.add(el);
            const role = el.getAttribute('role') || semanticMap[el.tagName] || '';
            if (!role) continue;
            landmarks.push({
                role,
                name: el.getAttribute('aria-label') || undefined,
            });
        }
        return landmarks;
    });
}

/**
 * Extract headings from an accessibility snapshot
 */
function extractHeadings(node: SnapshotNode, headings: Array<{ level: number; text: string }> = []) {
    if (node.role === 'heading' && node.level) {
        headings.push({ level: node.level, text: node.name || '' });
    }
    if (node.children) {
        for (const child of node.children) {
            extractHeadings(child, headings);
        }
    }
    return headings;
}

/**
 * Find elements with missing accessible names in snapshot
 */
function findMissingNames(node: SnapshotNode, issues: Array<{ role: string }> = []) {
    const needsName = ['button', 'link'];
    if (needsName.includes(node.role) && (!node.name || node.name.trim() === '')) {
        issues.push({ role: node.role });
    }
    if (node.children) {
        for (const child of node.children) {
            findMissingNames(child, issues);
        }
    }
    return issues;
}

/**
 * Find links with generic text
 */
function findGenericLinks(node: SnapshotNode, links: string[] = []) {
    const genericTexts = ['click here', 'here', 'read more', 'more', 'learn more', 'link', 'details'];
    if (node.role === 'link' && node.name && genericTexts.includes(node.name.toLowerCase().trim())) {
        links.push(node.name);
    }
    if (node.children) {
        for (const child of node.children) {
            findGenericLinks(child, links);
        }
    }
    return links;
}

describe('Screen Reader Navigation', () => {
    let browser: Browser;
    let page: Page;
    let snapshot: SnapshotNode;

    beforeAll(async () => {
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        page = await context.newPage();
        await page.goto(FIXTURE_URL, { waitUntil: 'networkidle' });
        await new Promise(resolve => setTimeout(resolve, 500));
        snapshot = (await page.accessibility.snapshot()) as SnapshotNode;
    }, 30000);

    afterAll(async () => {
        await browser?.close();
    });

    describe('Page Title', () => {
        it('should have a descriptive page title', async () => {
            const title = await page.title();
            expect(title).toBeTruthy();
            expect(title).toBe('Screen Reader Navigation Test Page');
        });
    });

    describe('Landmark Navigation', () => {
        let landmarks: Array<{ role: string; name?: string }>;

        beforeAll(async () => {
            landmarks = await extractLandmarks(page);
        });

        it('should find all expected landmarks', () => {
            const roles = landmarks.map(l => l.role);
            expect(roles).toContain('banner');
            expect(roles).toContain('navigation');
            expect(roles).toContain('main');
            expect(roles).toContain('complementary');
            expect(roles).toContain('contentinfo');
            expect(roles).toContain('search');
        });

        it('should have exactly one main landmark', () => {
            const mainLandmarks = landmarks.filter(l => l.role === 'main');
            expect(mainLandmarks).toHaveLength(1);
        });

        it('should have labeled navigation landmarks', () => {
            const navLandmarks = landmarks.filter(l => l.role === 'navigation');
            expect(navLandmarks.length).toBeGreaterThan(0);
            for (const nav of navLandmarks) {
                expect(nav.name).toBeTruthy();
            }
        });

        it('should have a labeled region landmark', () => {
            const regions = landmarks.filter(l => l.role === 'region');
            expect(regions.length).toBeGreaterThan(0);
            for (const region of regions) {
                expect(region.name).toBeTruthy();
            }
        });

        it('should provide proper navigation order: banner → navigation → main → complementary → contentinfo', () => {
            const order = landmarks.map(l => l.role);
            const bannerIdx = order.indexOf('banner');
            const navIdx = order.indexOf('navigation');
            const mainIdx = order.indexOf('main');
            const complementaryIdx = order.indexOf('complementary');
            const contentinfoIdx = order.indexOf('contentinfo');

            expect(bannerIdx).toBeGreaterThanOrEqual(0);
            expect(navIdx).toBeGreaterThanOrEqual(0);
            expect(mainIdx).toBeGreaterThanOrEqual(0);
            expect(complementaryIdx).toBeGreaterThanOrEqual(0);
            expect(contentinfoIdx).toBeGreaterThanOrEqual(0);

            expect(bannerIdx).toBeLessThan(navIdx);
            expect(navIdx).toBeLessThan(mainIdx);
            expect(mainIdx).toBeLessThan(complementaryIdx);
            expect(complementaryIdx).toBeLessThan(contentinfoIdx);
        });
    });

    describe('Heading Navigation', () => {
        let headings: Array<{ level: number; text: string }>;

        beforeAll(() => {
            headings = extractHeadings(snapshot);
        });

        it('should have headings', () => {
            expect(headings.length).toBeGreaterThan(0);
        });

        it('should have exactly one h1', () => {
            const h1s = headings.filter(h => h.level === 1);
            expect(h1s).toHaveLength(1);
            expect(h1s[0].text).toBe('Accessibility Testing Dashboard');
        });

        it('should have a valid heading hierarchy (no skipped levels except intentional test)', () => {
            // The fixture intentionally includes a heading skip in the "issues" section (h3 → h5)
            const mainHeadings = headings.filter(h =>
                h.text !== 'Skipped Heading Level'
            );

            let previousLevel = 0;
            let skipCount = 0;
            for (const heading of mainHeadings) {
                if (previousLevel > 0 && heading.level > previousLevel + 1) {
                    skipCount++;
                }
                previousLevel = heading.level;
            }

            // Allow at most the intentional skip
            expect(skipCount).toBeLessThanOrEqual(1);
        });

        it('should include headings from main and sidebar', () => {
            const headingTexts = headings.map(h => h.text);
            expect(headingTexts).toContain('Overview');
            expect(headingTexts).toContain('Run New Scan');
            expect(headingTexts).toContain('Quick Links');
            expect(headingTexts).toContain('Recent Scans');
        });
    });

    describe('Skip Link', () => {
        it('should have a skip link as the first focusable element', async () => {
            await page.evaluate(() => document.body.focus());
            await page.keyboard.press('Tab');
            await new Promise(resolve => setTimeout(resolve, 200));

            const focused = await page.evaluate(() => {
                const el = document.activeElement;
                return {
                    tag: el?.tagName.toLowerCase(),
                    text: el?.textContent?.trim(),
                    href: el?.getAttribute('href'),
                };
            });

            expect(focused.tag).toBe('a');
            expect(focused.text?.toLowerCase()).toContain('skip');
            expect(focused.href).toBe('#main-content');
        });

        it('should have a valid skip link target', async () => {
            const targetExists = await page.evaluate(() => {
                return document.getElementById('main-content') !== null;
            });
            expect(targetExists).toBe(true);
        });

        it('skip link target should be the main landmark', async () => {
            const targetRole = await page.evaluate(() => {
                const el = document.getElementById('main-content');
                return el?.getAttribute('role') || el?.tagName.toLowerCase();
            });
            expect(targetRole).toBe('main');
        });
    });

    describe('Interactive Elements', () => {
        it('should detect images without alt text via DOM', async () => {
            const missingAlt = await page.evaluate(() => {
                const imgs = document.querySelectorAll('img');
                return Array.from(imgs).filter(img => !img.hasAttribute('alt')).length;
            });
            expect(missingAlt).toBeGreaterThan(0);
        });

        it('should detect buttons without accessible names in snapshot', () => {
            const missing = findMissingNames(snapshot);
            const missingButtons = missing.filter(m => m.role === 'button');
            expect(missingButtons.length).toBeGreaterThan(0);
        });

        it('should detect generic link text', () => {
            const genericLinks = findGenericLinks(snapshot);
            expect(genericLinks).toContain('click here');
        });

        it('should detect form controls without labels via DOM', async () => {
            const unlabeled = await page.evaluate(() => {
                const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"])');
                let count = 0;
                for (const input of inputs) {
                    const id = input.getAttribute('id');
                    const hasLabel = id && document.querySelector(`label[for="${id}"]`);
                    const hasAriaLabel = input.getAttribute('aria-label');
                    const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
                    const parentLabel = input.closest('label');
                    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !parentLabel) count++;
                }
                return count;
            });
            expect(unlabeled).toBeGreaterThan(0);
        });
    });

    describe('Keyboard Navigation', () => {
        it('should be able to tab through all interactive elements', async () => {
            await page.evaluate(() => document.body.focus());

            const focusedElements: string[] = [];
            const maxTabs = 40;

            for (let i = 0; i < maxTabs; i++) {
                await page.keyboard.press('Tab');
                await new Promise(resolve => setTimeout(resolve, 50));

                const tag = await page.evaluate(() => {
                    const el = document.activeElement;
                    return el?.tagName.toLowerCase() || 'body';
                });

                focusedElements.push(tag);
                if (tag === 'body') break;
            }

            expect(focusedElements.length).toBeGreaterThan(5);
            expect(focusedElements).toContain('a');
            expect(focusedElements).toContain('button');
            expect(focusedElements).toContain('input');
        }, 15000);

        it('should have all focusable elements within landmarks (except skip link)', async () => {
            await page.evaluate(() => document.body.focus());

            let outsideLandmarks = 0;
            let totalTabbed = 0;
            const maxTabs = 40;

            for (let i = 0; i < maxTabs; i++) {
                await page.keyboard.press('Tab');
                await new Promise(resolve => setTimeout(resolve, 50));

                const result = await page.evaluate(() => {
                    const el = document.activeElement;
                    if (!el || el === document.body) return { inLandmark: true, isBody: true };

                    let current: Element | null = el;
                    while (current) {
                        const role = current.getAttribute('role');
                        if (role && ['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'search', 'form', 'region'].includes(role)) {
                            return { inLandmark: true, isBody: false };
                        }
                        const tag = current.tagName.toLowerCase();
                        if (['header', 'nav', 'main', 'aside', 'footer'].includes(tag)) {
                            return { inLandmark: true, isBody: false };
                        }
                        current = current.parentElement;
                    }
                    return { inLandmark: false, isBody: false };
                });

                if (result.isBody) break;
                totalTabbed++;
                if (!result.inLandmark) outsideLandmarks++;
            }

            // Skip link is outside landmarks by design
            expect(outsideLandmarks).toBeLessThanOrEqual(1);
            expect(totalTabbed).toBeGreaterThan(5);
        }, 15000);
    });

    describe('ARIA Live Regions', () => {
        it('should have a status live region', async () => {
            const hasLiveRegion = await page.evaluate(() => {
                return document.querySelector('[role="status"][aria-live="polite"]') !== null;
            });
            expect(hasLiveRegion).toBe(true);
        });

        it('should have an alert role element', async () => {
            const hasAlert = await page.evaluate(() => {
                return document.querySelector('[role="alert"]') !== null;
            });
            expect(hasAlert).toBe(true);
        });
    });

    describe('Intentional Issues Detection', () => {
        it('should detect the heading level skip (h3 → h5)', () => {
            const headings = extractHeadings(snapshot);
            let hasSkip = false;
            let prev = 0;
            for (const h of headings) {
                if (prev > 0 && h.level > prev + 1) {
                    hasSkip = true;
                    break;
                }
                prev = h.level;
            }
            expect(hasSkip).toBe(true);
        });

        it('should detect the image without alt text', async () => {
            const count = await page.evaluate(() => {
                return document.querySelectorAll('img:not([alt])').length;
            });
            expect(count).toBeGreaterThan(0);
        });

        it('should detect the button without accessible name', () => {
            const missing = findMissingNames(snapshot);
            expect(missing.some(m => m.role === 'button')).toBe(true);
        });

        it('should detect the "click here" generic link', () => {
            const genericLinks = findGenericLinks(snapshot);
            expect(genericLinks.length).toBeGreaterThan(0);
        });
    });
});
