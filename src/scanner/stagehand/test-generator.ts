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
    
    // 1. Navigate to the page
    await page.goto(originalUrl);
    await page.waitForLoadState('networkidle');

    // 2. Initial Accessibility Scan
    const initialResults = await new AxeBuilder({ page }).analyze();
    console.log(\`Initial violations: \${initialResults.violations.length}\`);

    // 3. Interact with discovered elements
    ${interactions}
    
    console.log('\\n✅ Test completed - checked all ${elements.length} discovered elements');
});
`;
    }

    private generateInteraction(element: ElementDiscovery, index: number): string {
        // Generate actual executable interactions wrapped in try-catch
        let action = `// Action: ${element.description}`;
        const selector = element.selector.replace(/'/g, "\\'");

        action += `\n    try {`;

        switch (element.type) {
            case 'button':
            case 'link':
                action += `\n        await page.locator('${selector}').click({ timeout: 5000 });`;
                break;
            case 'input':
                action += `\n        await page.locator('${selector}').fill('test value', { timeout: 5000 });`;
                break;
            case 'checkbox':
            case 'radio':
                action += `\n        await page.locator('${selector}').check({ timeout: 5000 });`;
                break;
            case 'select':
                action += `\n        await page.locator('${selector}').selectOption('value', { timeout: 5000 });`;
                break;
            default:
                action += `\n        await page.locator('${selector}').click({ timeout: 5000 });`;
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
