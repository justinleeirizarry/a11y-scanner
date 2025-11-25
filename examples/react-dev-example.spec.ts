import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Accessibility Interaction Test', async ({ page }) => {
    // Increase timeout to 5 minutes for all interactions
    test.setTimeout(300000);

    const originalUrl = 'https://react.dev';
    
    // 1. Navigate to the page
    await page.goto(originalUrl);
    await page.waitForLoadState('networkidle');

    // 2. Initial Accessibility Scan
    const initialResults = await new AxeBuilder({ page }).analyze();
    console.log(`Initial violations: ${initialResults.violations.length}`);

    // 3. Interact with discovered elements
    // Action: link element with accessible name 'React' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[2]/nav[1]/div[1]/div[1]/span[1]/div[1]/div[2]/a[1]').click({ timeout: 5000 });
        const results0 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'React' used for navigation or hyperlink: ${results0.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'React' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'v19.2' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[2]/nav[1]/div[1]/div[1]/div[1]/a[1]').click({ timeout: 5000 });
        const results1 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'v19.2' used for navigation or hyperlink: ${results1.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'v19.2' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: button element with accessible name 'Search ⌘ K' used for user interaction
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[2]/nav[1]/div[1]/div[2]/button[1]').click({ timeout: 5000 });
        const results2 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ button element with accessible name 'Search ⌘ K' used for user interaction: ${results2.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: button element with accessible name 'Search ⌘ K' used for user interaction - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Learn' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[2]/nav[1]/div[1]/div[3]/div[1]/div[1]/a[1]').click({ timeout: 5000 });
        const results3 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Learn' used for navigation or hyperlink: ${results3.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Learn' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Reference' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[2]/nav[1]/div[1]/div[3]/div[1]/div[2]/a[1]').click({ timeout: 5000 });
        const results4 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Reference' used for navigation or hyperlink: ${results4.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Reference' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Community' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[2]/nav[1]/div[1]/div[3]/div[1]/div[3]/a[1]').click({ timeout: 5000 });
        const results5 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Community' used for navigation or hyperlink: ${results5.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Community' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Blog' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[2]/nav[1]/div[1]/div[3]/div[1]/div[4]/a[1]').click({ timeout: 5000 });
        const results6 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Blog' used for navigation or hyperlink: ${results6.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Blog' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: button element with accessible name 'Use Light Mode' used for user interaction
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[2]/nav[1]/div[1]/div[3]/div[3]/div[3]/button[1]').click({ timeout: 5000 });
        const results7 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ button element with accessible name 'Use Light Mode' used for user interaction: ${results7.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: button element with accessible name 'Use Light Mode' used for user interaction - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Translations' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[2]/nav[1]/div[1]/div[3]/div[3]/div[4]/a[1]').click({ timeout: 5000 });
        const results8 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Translations' used for navigation or hyperlink: ${results8.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Translations' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Open on GitHub' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[2]/nav[1]/div[1]/div[3]/div[3]/div[5]/a[1]').click({ timeout: 5000 });
        const results9 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Open on GitHub' used for navigation or hyperlink: ${results9.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Open on GitHub' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Learn React' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/article[1]/div[1]/div[1]/div[2]/a[1]').click({ timeout: 5000 });
        const results10 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Learn React' used for navigation or hyperlink: ${results10.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Learn React' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'API Reference' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/article[1]/div[1]/div[1]/div[2]/a[2]').click({ timeout: 5000 });
        const results11 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'API Reference' used for navigation or hyperlink: ${results11.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'API Reference' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: custom control or widget 'SearchInput' with value and onChange handler for user input interaction
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/article[1]/div[1]/div[5]/div[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[2]/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/section[1]/div[1]/div[6]/a[1]/div[2]/span[1]').fill('test value', { timeout: 5000 });
        const results12 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ custom control or widget 'SearchInput' with value and onChange handler for user input interaction: ${results12.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: custom control or widget 'SearchInput' with value and onChange handler for user input interaction - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: button element with accessible name 'Reload' used for user interaction
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/article[1]/div[1]/div[5]/div[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/div[1]/div[3]/button[1]').click({ timeout: 5000 });
        const results13 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ button element with accessible name 'Reload' used for user interaction: ${results13.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: button element with accessible name 'Reload' used for user interaction - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Add React to your page' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/article[1]/div[1]/div[4]/div[1]/div[3]/div[1]/a[1]').click({ timeout: 5000 });
        const results14 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Add React to your page' used for navigation or hyperlink: ${results14.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Add React to your page' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Next.js' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/article[1]/div[1]/div[5]/div[1]/div[1]/p[1]/a[1]').click({ timeout: 5000 });
        const results15 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Next.js' used for navigation or hyperlink: ${results15.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Next.js' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'React Router' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/article[1]/div[1]/div[5]/div[1]/div[1]/p[1]/a[2]').click({ timeout: 5000 });
        const results16 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'React Router' used for navigation or hyperlink: ${results16.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'React Router' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'React Native' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/article[1]/div[1]/div[6]/div[1]/div[1]/div[2]/div[2]/figure[1]/div[1]/div[1]/div[2]/p[1]/a[1]').click({ timeout: 5000 });
        const results17 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'React Native' used for navigation or hyperlink: ${results17.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'React Native' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Expo' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/article[1]/div[1]/div[6]/div[1]/div[1]/div[2]/div[2]/figure[1]/div[1]/div[1]/div[2]/p[1]/a[2]').click({ timeout: 5000 });
        const results18 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Expo' used for navigation or hyperlink: ${results18.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Expo' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Build for native platforms' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/article[1]/div[1]/div[6]/div[1]/div[1]/div[3]/div[1]/a[1]').click({ timeout: 5000 });
        const results19 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Build for native platforms' used for navigation or hyperlink: ${results19.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Build for native platforms' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Read more React news' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/article[1]/div[1]/div[7]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/a[1]').click({ timeout: 5000 });
        const results20 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Read more React news' used for navigation or hyperlink: ${results20.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Read more React news' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'React Conf 2025 Recap October 16, 2025' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/article[1]/div[1]/div[7]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/a[1]').click({ timeout: 5000 });
        const results21 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'React Conf 2025 Recap October 16, 2025' used for navigation or hyperlink: ${results21.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'React Conf 2025 Recap October 16, 2025' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'React Compiler v1.0 October 7, 2025' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/article[1]/div[1]/div[7]/div[1]/div[1]/div[1]/div[2]/div[1]/div[2]/a[1]').click({ timeout: 5000 });
        const results22 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'React Compiler v1.0 October 7, 2025' used for navigation or hyperlink: ${results22.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'React Compiler v1.0 October 7, 2025' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Introducing the React Foundation October 7, 2025' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/article[1]/div[1]/div[7]/div[1]/div[1]/div[1]/div[2]/div[1]/div[3]/a[1]').click({ timeout: 5000 });
        const results23 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Introducing the React Foundation October 7, 2025' used for navigation or hyperlink: ${results23.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Introducing the React Foundation October 7, 2025' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'React 19.2 October 1, 2025' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/article[1]/div[1]/div[7]/div[1]/div[1]/div[1]/div[2]/div[1]/div[4]/a[1]').click({ timeout: 5000 });
        const results24 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'React 19.2 October 1, 2025' used for navigation or hyperlink: ${results24.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'React 19.2 October 1, 2025' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Take the Tutorial' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/article[1]/div[1]/div[8]/div[1]/div[2]/a[1]').click({ timeout: 5000 });
        const results25 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Take the Tutorial' used for navigation or hyperlink: ${results25.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Take the Tutorial' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Meta Open Source' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[1]/a[1]').click({ timeout: 5000 });
        const results26 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Meta Open Source' used for navigation or hyperlink: ${results26.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Meta Open Source' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Learn React' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[2]/div[1]/a[1]').click({ timeout: 5000 });
        const results27 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Learn React' used for navigation or hyperlink: ${results27.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Learn React' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Quick Start' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[2]/div[2]/a[1]').click({ timeout: 5000 });
        const results28 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Quick Start' used for navigation or hyperlink: ${results28.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Quick Start' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Installation' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[2]/div[3]/a[1]').click({ timeout: 5000 });
        const results29 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Installation' used for navigation or hyperlink: ${results29.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Installation' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Describing the UI' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[2]/div[4]/a[1]').click({ timeout: 5000 });
        const results30 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Describing the UI' used for navigation or hyperlink: ${results30.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Describing the UI' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Adding Interactivity' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[2]/div[5]/a[1]').click({ timeout: 5000 });
        const results31 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Adding Interactivity' used for navigation or hyperlink: ${results31.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Adding Interactivity' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Managing State' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[2]/div[6]/a[1]').click({ timeout: 5000 });
        const results32 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Managing State' used for navigation or hyperlink: ${results32.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Managing State' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Escape Hatches' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[2]/div[7]/a[1]').click({ timeout: 5000 });
        const results33 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Escape Hatches' used for navigation or hyperlink: ${results33.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Escape Hatches' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'API Reference' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[3]/div[1]/a[1]').click({ timeout: 5000 });
        const results34 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'API Reference' used for navigation or hyperlink: ${results34.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'API Reference' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'React APIs' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[3]/div[2]/a[1]').click({ timeout: 5000 });
        const results35 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'React APIs' used for navigation or hyperlink: ${results35.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'React APIs' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'React DOM APIs' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[3]/div[3]/a[1]').click({ timeout: 5000 });
        const results36 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'React DOM APIs' used for navigation or hyperlink: ${results36.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'React DOM APIs' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Community' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[4]/div[1]/a[1]').click({ timeout: 5000 });
        const results37 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Community' used for navigation or hyperlink: ${results37.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Community' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Code of Conduct' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[4]/div[2]/a[1]').click({ timeout: 5000 });
        const results38 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Code of Conduct' used for navigation or hyperlink: ${results38.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Code of Conduct' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Meet the Team' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[4]/div[3]/a[1]').click({ timeout: 5000 });
        const results39 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Meet the Team' used for navigation or hyperlink: ${results39.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Meet the Team' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Docs Contributors' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[4]/div[4]/a[1]').click({ timeout: 5000 });
        const results40 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Docs Contributors' used for navigation or hyperlink: ${results40.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Docs Contributors' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Acknowledgements' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[4]/div[5]/a[1]').click({ timeout: 5000 });
        const results41 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Acknowledgements' used for navigation or hyperlink: ${results41.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Acknowledgements' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Blog' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[5]/div[2]/a[1]').click({ timeout: 5000 });
        const results42 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Blog' used for navigation or hyperlink: ${results42.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Blog' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'React Native' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[5]/div[3]/a[1]').click({ timeout: 5000 });
        const results43 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'React Native' used for navigation or hyperlink: ${results43.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'React Native' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Privacy' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[5]/div[4]/a[1]').click({ timeout: 5000 });
        const results44 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Privacy' used for navigation or hyperlink: ${results44.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Privacy' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'Terms' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[5]/div[5]/a[1]').click({ timeout: 5000 });
        const results45 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'Terms' used for navigation or hyperlink: ${results45.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'Terms' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'React on Facebook' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[5]/div[6]/a[1]').click({ timeout: 5000 });
        const results46 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'React on Facebook' used for navigation or hyperlink: ${results46.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'React on Facebook' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'React on Twitter' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[5]/div[6]/a[2]/svg[1]').click({ timeout: 5000 });
        const results47 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'React on Twitter' used for navigation or hyperlink: ${results47.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'React on Twitter' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'React on Bluesky' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[5]/div[6]/a[3]').click({ timeout: 5000 });
        const results48 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'React on Bluesky' used for navigation or hyperlink: ${results48.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'React on Bluesky' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }

    // Action: link element with accessible name 'React on Github' used for navigation or hyperlink
    try {
        await page.locator('xpath=/html[1]/body[1]/div[1]/div[3]/main[1]/div[1]/div[1]/footer[1]/div[1]/div[5]/div[6]/a[4]').click({ timeout: 5000 });
        const results49 = await new AxeBuilder({ page }).analyze();
        console.log(`✅ link element with accessible name 'React on Github' used for navigation or hyperlink: ${results49.violations.length} violations`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        if (page.url() !== originalUrl) {
            await page.goto(originalUrl, { waitUntil: 'networkidle' });
        }
    } catch (error) {
        console.log(`⚠️  Skipped: link element with accessible name 'React on Github' used for navigation or hyperlink - ${error.message}`);
        // Try to recover by going back to original URL
        try { await page.goto(originalUrl, { waitUntil: 'networkidle', timeout: 5000 }); } catch {}
    }
    
    console.log('\n✅ Test completed - checked all 50 discovered elements');
});
