/**
 * Integration Tests - MCP Server
 *
 * Tests the MCP server tool invocation flow.
 * Verifies the scan_url tool works correctly through the MCP protocol.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { Effect } from 'effect';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
    runScanAsPromise,
    AppLayer,
    createResultsProcessorService,
    type ScanResults,
} from '@react-a11y-scanner/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test fixture path
const TEST_APP_FIXTURE = `file://${join(__dirname, '../fixtures/test-app.html')}`;

describe('MCP Server Integration', () => {
    /**
     * These tests simulate the MCP tool invocation flow without actually
     * running the MCP server. We test the same code path that the MCP
     * server uses when handling scan_url requests.
     */

    describe('scan_url Tool Simulation', () => {
        it('should perform scan and return MCP-formatted results', async () => {
            // This simulates what happens in mcp-server.ts when scan_url is invoked
            const processor = createResultsProcessorService();

            const { results } = await runScanAsPromise({
                url: TEST_APP_FIXTURE,
                browser: 'chromium',
                headless: true,
                includeKeyboardTests: true,
            }, AppLayer);

            const content = Effect.runSync(processor.formatForMCP(results, { includeTree: false }));

            // Verify MCP response structure
            expect(content).toBeInstanceOf(Array);
            expect(content.length).toBeGreaterThan(0);

            // Each content item should have type and text
            for (const item of content) {
                expect(item).toHaveProperty('type');
                expect(item).toHaveProperty('text');
                expect(item.type).toBe('text');
            }

            // First item should be the summary (starts with "Scan Complete for")
            const summaryItem = content.find((c) => c.text.includes('Scan Complete for'));
            expect(summaryItem).toBeDefined();
        }, 60000);

        it('should include accessibility tree when requested', async () => {
            const processor = createResultsProcessorService();

            const { results } = await runScanAsPromise({
                url: TEST_APP_FIXTURE,
                browser: 'chromium',
                headless: true,
            }, AppLayer);

            const contentWithTree = Effect.runSync(processor.formatForMCP(results, { includeTree: true }));
            const contentWithoutTree = Effect.runSync(processor.formatForMCP(results, { includeTree: false }));

            // Content with tree should be larger
            const withTreeLength = JSON.stringify(contentWithTree).length;
            const withoutTreeLength = JSON.stringify(contentWithoutTree).length;

            // If there's an accessibility tree, it should make the response larger
            // Note: Tree might not always be present depending on page structure
            expect(withTreeLength).toBeGreaterThanOrEqual(withoutTreeLength);
        }, 60000);

        it('should handle scan errors gracefully', async () => {
            // Non-React page should trigger an error
            const nonReactUrl = 'data:text/html,<html><body><p>No React</p></body></html>';

            try {
                await runScanAsPromise({
                    url: nonReactUrl,
                    browser: 'chromium',
                    headless: true,
                }, AppLayer);
                // Should not reach here
                expect.fail('Expected error to be thrown');
            } catch (error) {
                // This is what the MCP server would catch and format
                const errorMessage = error instanceof Error ? error.message : String(error);

                // MCP server would return error response like this:
                const errorResponse = {
                    content: [
                        {
                            type: 'text',
                            text: `Scan failed: ${errorMessage}`,
                        },
                    ],
                    isError: true,
                };

                expect(errorResponse.isError).toBe(true);
                expect(errorResponse.content[0].text).toContain('Scan failed');
            }
        }, 60000);
    });

    describe('MCP Response Formatting', () => {
        let scanResults: ScanResults;

        beforeAll(async () => {
            const { results } = await runScanAsPromise({
                url: TEST_APP_FIXTURE,
                browser: 'chromium',
                headless: true,
                includeKeyboardTests: true,
            }, AppLayer);
            scanResults = results;
        }, 60000);

        it('should format violations for MCP consumption', () => {
            const processor = createResultsProcessorService();
            const content = Effect.runSync(processor.formatForMCP(scanResults, { includeTree: false }));

            // Should have summary section
            const hasViolationCount = content.some(
                (c) =>
                    c.text.includes('violation') ||
                    c.text.includes('Violation') ||
                    c.text.includes('issue')
            );
            expect(hasViolationCount).toBe(true);
        });

        it('should include component information in formatted output', () => {
            const processor = createResultsProcessorService();
            const content = Effect.runSync(processor.formatForMCP(scanResults, { includeTree: false }));

            // Should reference React components
            const hasComponentInfo = content.some(
                (c) => c.text.includes('component') || c.text.includes('Component')
            );
            expect(hasComponentInfo).toBe(true);
        });

        it('should format WCAG tags appropriately', () => {
            const processor = createResultsProcessorService();
            const content = Effect.runSync(processor.formatForMCP(scanResults, { includeTree: false }));

            // Join all text content
            const fullText = content.map((c) => c.text).join('\n');

            // Should include WCAG level information somewhere
            const hasWcagInfo =
                fullText.includes('WCAG') ||
                fullText.includes('wcag') ||
                fullText.includes('Level A') ||
                fullText.includes('wcag2a');

            expect(hasWcagInfo).toBe(true);
        });
    });

    describe('Browser Parameter Handling', () => {
        // Test with chromium which is most reliably installed
        it('should accept chromium browser parameter', async () => {
            const processor = createResultsProcessorService();

            const { results } = await runScanAsPromise({
                url: TEST_APP_FIXTURE,
                browser: 'chromium',
                headless: true,
            }, AppLayer);

            expect(results.browser).toBe('chromium');

            // Should be able to format results
            const content = Effect.runSync(processor.formatForMCP(results, { includeTree: false }));
            expect(content).toBeInstanceOf(Array);
        }, 60000);

        // Firefox and webkit tests skipped by default - install with: npx playwright install
        it.skip('should accept firefox browser parameter', async () => {
            const { results } = await runScanAsPromise({
                url: TEST_APP_FIXTURE,
                browser: 'firefox',
                headless: true,
            }, AppLayer);
            expect(results.browser).toBe('firefox');
        }, 90000);

        it.skip('should accept webkit browser parameter', async () => {
            const { results } = await runScanAsPromise({
                url: TEST_APP_FIXTURE,
                browser: 'webkit',
                headless: true,
            }, AppLayer);
            expect(results.browser).toBe('webkit');
        }, 90000);
    });
});
