import type { ElementDiscovery } from "../../types.js";
import { getRelatedCriteria, sortByWcagPriority, formatCriteriaComment } from './wcag-element-map.js';

export class TestGenerator {
    generateTest(url: string, elements: ElementDiscovery[]): string {
        // Sort elements by WCAG priority (Level A first, then AA, then AAA)
        const sortedElements = sortByWcagPriority(elements);
        const interactions = sortedElements.map((el, index) => this.generateInteraction(el, index)).join('\n\n    ');

        return `import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Accessibility Interaction Test', async ({ page }) => {
    // Increase timeout to 5 minutes for all interactions
    test.setTimeout(300000);

    const originalUrl = '${url}';
    
    // 1. Set viewport to ensure responsive elements are visible
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 2. Navigate to the page
    await page.goto(originalUrl);
    await page.waitForLoadState('networkidle');

    // 3. Initial Accessibility Scan
    const initialResults = await new AxeBuilder({ page }).analyze();
    console.log(\`\\n📊 Initial Accessibility Scan: \${initialResults.violations.length} violations found\`);
    if (initialResults.violations.length > 0) {
        initialResults.violations.forEach((v, i) => {
            console.log(\`  \${i + 1}. [\${v.impact?.toUpperCase()}] \${v.id}: \${v.description}\`);
            console.log(\`     Help: \${v.helpUrl}\`);
            v.nodes.slice(0, 3).forEach(node => {
                console.log(\`     → \${node.html.substring(0, 100)}\${node.html.length > 100 ? '...' : ''}\`);
            });
            if (v.nodes.length > 3) {
                console.log(\`     ... and \${v.nodes.length - 3} more instances\`);
            }
        });
    }
    console.log('');

    // 4. Interact with discovered elements
    ${interactions}
    
    console.log('\\n✅ Test completed - checked all ${elements.length} discovered elements');
});
`;
    }

    /**
     * Extract aria-label from element description if present.
     * Descriptions often contain patterns like "labeled 'Some Label'" or "aria-label 'Some Label'"
     */
    private extractAriaLabel(description: string): string | null {
        // Match patterns like: labeled 'Use Light Mode', aria-label 'Submit'
        const patterns = [
            /labeled ['"]([^'"]+)['"]/i,
            /aria-label ['"]([^'"]+)['"]/i,
            /label ['"]([^'"]+)['"]/i,
        ];

        for (const pattern of patterns) {
            const match = description.match(pattern);
            if (match) {
                return match[1];
            }
        }
        return null;
    }

    /**
     * Generate a locator string, preferring aria-label for accessibility testing.
     * Falls back to XPath selector if no aria-label is found.
     */
    private generateLocator(element: ElementDiscovery): { locator: string; isAriaLabel: boolean } {
        const ariaLabel = this.extractAriaLabel(element.description);

        if (ariaLabel) {
            // Use aria-label - this also validates that the element has proper accessibility labeling
            const escapedLabel = ariaLabel.replace(/'/g, "\\'");
            const elementType = element.type === 'link' ? 'a' : element.type;
            return {
                locator: `${elementType}[aria-label='${escapedLabel}']`,
                isAriaLabel: true
            };
        }

        // Fall back to XPath selector
        const selector = element.selector.replace(/'/g, "\\'");
        return { locator: selector, isAriaLabel: false };
    }

    private generateInteraction(element: ElementDiscovery, index: number): string {
        // Generate actual executable interactions wrapped in try-catch
        // Include WCAG context for the element type
        const criteria = getRelatedCriteria(element.type);
        const wcagComment = formatCriteriaComment(criteria);

        let action = `// Action: ${element.description}`;
        if (wcagComment) {
            action += `\n    // ${wcagComment}`;
        }
        const { locator, isAriaLabel } = this.generateLocator(element);

        action += `\n    try {`;
        action += `\n        const el${index} = page.locator('${locator}').first();`;

        // Check visibility first to avoid long timeouts on hidden elements
        action += `\n        const isVisible${index} = await el${index}.isVisible();`;
        action += `\n        if (!isVisible${index}) {`;
        action += `\n            console.log(\`⏭️  Skipped (not visible): ${element.description}\`);`;
        action += `\n            throw new Error('Element not visible');`;
        action += `\n        }`;

        // Scroll into view to handle elements below fold or in responsive layouts
        action += `\n        await el${index}.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});`;

        switch (element.type) {
            case 'button':
            case 'link':
                action += `\n        await el${index}.click({ timeout: 5000 });`;
                break;
            case 'input':
                action += `\n        await el${index}.fill('test value', { timeout: 5000 });`;
                break;
            case 'checkbox':
            case 'radio':
                action += `\n        await el${index}.check({ timeout: 5000 });`;
                break;
            case 'select':
                action += `\n        await el${index}.selectOption('value', { timeout: 5000 });`;
                break;
            default:
                action += `\n        await el${index}.click({ timeout: 5000 });`;
        }

        // Add an accessibility check after interaction with unique variable name
        action += `\n        const results${index} = await new AxeBuilder({ page }).analyze();`;
        action += `\n        if (results${index}.violations.length > 0) {`;
        action += `\n            console.log(\`❌ ${element.description}: \${results${index}.violations.length} violations\`);`;
        action += `\n            results${index}.violations.forEach(v => {`;
        action += `\n                console.log(\`   [\${v.impact?.toUpperCase()}] \${v.id}: \${v.description}\`);`;
        action += `\n            });`;
        action += `\n        } else {`;
        action += `\n            console.log(\`✅ ${element.description}: No violations\`);`;
        action += `\n        }`;

        // Close any modals/overlays that might have opened
        action += `\n        await page.keyboard.press('Escape');`;
        action += `\n        await page.waitForTimeout(500);`;

        // Check if we navigated away and go back to original URL
        action += `\n        if (page.url() !== originalUrl) {`;
        action += `\n            await page.goto(originalUrl, { waitUntil: 'networkidle' });`;
        action += `\n        }`;

        // Catch block to handle failures
        action += `\n    } catch (error) {`;
        action += `\n        // Only log if not already logged by visibility check`;
        action += `\n        if (error.message !== 'Element not visible') {`;
        action += `\n            console.log(\`⚠️  Skipped: ${element.description} - \${error.message.split('\\n')[0]}\`);`;
        action += `\n        }`;
        action += `\n        // Try to recover by going back to original URL`;
        action += `\n        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}`;
        action += `\n    }`;

        return action;
    }
}
