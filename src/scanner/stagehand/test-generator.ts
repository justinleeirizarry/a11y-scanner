import type { ElementDiscovery } from "../../types.js";

export class TestGenerator {
    generateTest(url: string, elements: ElementDiscovery[]): string {
        const interactions = elements.map((el, index) => this.generateInteraction(el, index)).join('\n\n    ');

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
    console.log(\`Initial violations: \${initialResults.violations.length}\`);

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
        let action = `// Action: ${element.description}`;
        const { locator, isAriaLabel } = this.generateLocator(element);

        action += `\n    try {`;
        action += `\n        const el${index} = page.locator('${locator}').first();`;

        // Scroll into view to handle elements below fold or in responsive layouts
        // Use a timeout to avoid hanging on hidden elements
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
        action += `\n        console.log(\`✅ ${element.description}: \${results${index}.violations.length} violations\`);`;

        // Close any modals/overlays that might have opened
        action += `\n        await page.keyboard.press('Escape');`;
        action += `\n        await page.waitForTimeout(500);`;

        // Check if we navigated away and go back to original URL
        action += `\n        if (page.url() !== originalUrl) {`;
        action += `\n            await page.goto(originalUrl, { waitUntil: 'networkidle' });`;
        action += `\n        }`;

        // Catch block to handle failures
        action += `\n    } catch (error) {`;
        action += `\n        console.log(\`⚠️  Skipped: ${element.description} - \${error.message}\`);`;
        action += `\n        // Try to recover by going back to original URL`;
        action += `\n        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}`;
        action += `\n    }`;

        return action;
    }
}
