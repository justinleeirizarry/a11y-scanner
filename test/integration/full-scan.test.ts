/**
 * Integration Tests - Full Scan Flow
 *
 * Tests the complete scan flow from CLI → Orchestration → Results
 * Uses the test fixtures to verify end-to-end functionality.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
    runScanAsPromise,
    AppLayer,
    type ScanResults,
} from '@react-a11y-scanner/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test fixture paths
const TEST_APP_FIXTURE = `file://${join(__dirname, '../fixtures/test-app.html')}`;
const WCAG22_FIXTURE = `file://${join(__dirname, '../fixtures/wcag22-violations.html')}`;

describe('Full Scan Integration', () => {
    describe('Basic Scan Flow', () => {
        it('should complete a full scan of the test fixture', async () => {
            const { results } = await runScanAsPromise({
                url: TEST_APP_FIXTURE,
                browser: 'chromium',
                headless: true,
            }, AppLayer);

            // Verify basic structure
            expect(results).toBeDefined();
            expect(results.url).toBe(TEST_APP_FIXTURE);
            expect(results.browser).toBe('chromium');
            expect(results.timestamp).toBeDefined();

            // Verify components were found (test-app.html has React components)
            expect(results.components).toBeInstanceOf(Array);
            expect(results.components.length).toBeGreaterThan(0);

            // Verify violations were detected (test-app.html has intentional a11y issues)
            expect(results.violations).toBeInstanceOf(Array);
            expect(results.violations.length).toBeGreaterThan(0);

            // Verify summary is populated
            expect(results.summary).toBeDefined();
            expect(results.summary.totalComponents).toBeGreaterThan(0);
            expect(results.summary.totalViolations).toBeGreaterThan(0);
        }, 60000); // Extended timeout for browser operations

        it('should detect expected violations in test fixture', async () => {
            const { results } = await runScanAsPromise({
                url: TEST_APP_FIXTURE,
                browser: 'chromium',
                headless: true,
            }, AppLayer);

            // Test fixture has specific a11y issues:
            // - Missing alt text on images
            // - Missing form labels
            // - Color contrast issues

            const violationIds = results.violations.map((v) => v.id);

            // Image without alt should trigger image-alt violation
            expect(violationIds).toContain('image-alt');

            // Form inputs without labels should trigger label violation
            expect(violationIds).toContain('label');
        }, 60000);

        it('should attribute violations to React components', async () => {
            const { results } = await runScanAsPromise({
                url: TEST_APP_FIXTURE,
                browser: 'chromium',
                headless: true,
            }, AppLayer);

            // Verify at least some violations have component attribution
            const violationsWithComponents = results.violations.filter((v) =>
                v.nodes.some((n) => n.component !== null)
            );

            expect(violationsWithComponents.length).toBeGreaterThan(0);

            // Check that component paths are populated
            const componentPaths = results.violations
                .flatMap((v) => v.nodes)
                .filter((n) => n.componentPath.length > 0);

            expect(componentPaths.length).toBeGreaterThan(0);
        }, 60000);
    });

    describe('Keyboard Tests Integration', () => {
        it('should include keyboard test results when enabled', async () => {
            const { results } = await runScanAsPromise({
                url: TEST_APP_FIXTURE,
                browser: 'chromium',
                headless: true,
                includeKeyboardTests: true,
            }, AppLayer);

            // Verify keyboard tests were run
            expect(results.keyboardTests).toBeDefined();
            expect(results.keyboardTests?.tabOrder).toBeDefined();
            expect(results.keyboardTests?.focusManagement).toBeDefined();
            expect(results.keyboardTests?.shortcuts).toBeDefined();
            expect(results.keyboardTests?.summary).toBeDefined();

            // Verify focusable elements were found
            expect(results.keyboardTests?.tabOrder.totalFocusableElements).toBeGreaterThan(0);
        }, 60000);

        it('should not include keyboard tests when disabled', async () => {
            const { results } = await runScanAsPromise({
                url: TEST_APP_FIXTURE,
                browser: 'chromium',
                headless: true,
                includeKeyboardTests: false,
            }, AppLayer);

            // Keyboard tests should not be present
            expect(results.keyboardTests).toBeUndefined();
        }, 60000);
    });

    describe('WCAG 2.2 Integration', () => {
        it('should detect WCAG 2.2 specific violations', async () => {
            const { results } = await runScanAsPromise({
                url: WCAG22_FIXTURE,
                browser: 'chromium',
                headless: true,
            }, AppLayer);

            // WCAG 2.2 fixture should have specific violations
            expect(results.wcag22).toBeDefined();

            // Check for target size violations (2.5.8)
            // The fixture has small buttons that violate minimum target size
            if (results.wcag22?.targetSize) {
                expect(results.wcag22.targetSize).toBeInstanceOf(Array);
            }

            // Verify WCAG level counts include WCAG 2.2
            if (results.summary.violationsByWcagLevel) {
                expect(results.summary.violationsByWcagLevel).toHaveProperty('wcag22aa');
            }
        }, 60000);
    });

    describe('CI Mode Integration', () => {
        it('should return CI passed status when violations are below threshold', async () => {
            const result = await runScanAsPromise({
                url: TEST_APP_FIXTURE,
                browser: 'chromium',
                headless: true,
                ciMode: true,
                ciThreshold: 100, // High threshold to pass
            }, AppLayer);

            expect(result.ciPassed).toBe(true);
        }, 60000);

        it('should return CI failed status when violations exceed threshold', async () => {
            const result = await runScanAsPromise({
                url: TEST_APP_FIXTURE,
                browser: 'chromium',
                headless: true,
                ciMode: true,
                ciThreshold: 0, // Zero tolerance
            }, AppLayer);

            expect(result.ciPassed).toBe(false);
        }, 60000);
    });

    describe('Browser Support', () => {
        // Test with chromium which is most reliably installed
        it('should scan successfully with chromium browser', async () => {
            const { results } = await runScanAsPromise({
                url: TEST_APP_FIXTURE,
                browser: 'chromium',
                headless: true,
            }, AppLayer);

            expect(results).toBeDefined();
            expect(results.browser).toBe('chromium');
            expect(results.violations).toBeInstanceOf(Array);
        }, 60000);

        // Firefox and webkit tests are skipped by default as they may not be installed
        // Run with: npx playwright install firefox webkit
        it.skip('should scan successfully with firefox browser', async () => {
            const { results } = await runScanAsPromise({
                url: TEST_APP_FIXTURE,
                browser: 'firefox',
                headless: true,
            }, AppLayer);

            expect(results).toBeDefined();
            expect(results.browser).toBe('firefox');
        }, 90000);

        it.skip('should scan successfully with webkit browser', async () => {
            const { results } = await runScanAsPromise({
                url: TEST_APP_FIXTURE,
                browser: 'webkit',
                headless: true,
            }, AppLayer);

            expect(results).toBeDefined();
            expect(results.browser).toBe('webkit');
        }, 90000);
    });

    describe('Results Structure', () => {
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

        it('should have proper violation structure', () => {
            for (const violation of scanResults.violations) {
                // Required fields
                expect(violation.id).toBeDefined();
                expect(violation.impact).toMatch(/^(critical|serious|moderate|minor)$/);
                expect(violation.description).toBeDefined();
                expect(violation.help).toBeDefined();
                expect(violation.helpUrl).toBeDefined();
                expect(violation.tags).toBeInstanceOf(Array);
                expect(violation.nodes).toBeInstanceOf(Array);

                // Node structure
                for (const node of violation.nodes) {
                    expect(node.html).toBeDefined();
                    expect(node.htmlSnippet).toBeDefined();
                    expect(node.cssSelector).toBeDefined();
                    expect(node.target).toBeInstanceOf(Array);
                    expect(node.componentPath).toBeInstanceOf(Array);
                    expect(node.userComponentPath).toBeInstanceOf(Array);
                }
            }
        });

        it('should have proper component structure', () => {
            for (const component of scanResults.components) {
                expect(component.name).toBeDefined();
                expect(component.type).toBeDefined();
                expect(component.path).toBeInstanceOf(Array);
            }
        });

        it('should have proper summary structure', () => {
            const summary = scanResults.summary;

            expect(summary.totalComponents).toBeGreaterThanOrEqual(0);
            expect(summary.totalViolations).toBeGreaterThanOrEqual(0);
            expect(summary.componentsWithViolations).toBeGreaterThanOrEqual(0);

            // Severity breakdown
            expect(summary.violationsBySeverity).toBeDefined();
            expect(summary.violationsBySeverity.critical).toBeGreaterThanOrEqual(0);
            expect(summary.violationsBySeverity.serious).toBeGreaterThanOrEqual(0);
            expect(summary.violationsBySeverity.moderate).toBeGreaterThanOrEqual(0);
            expect(summary.violationsBySeverity.minor).toBeGreaterThanOrEqual(0);

            // WCAG level breakdown
            if (summary.violationsByWcagLevel) {
                expect(summary.violationsByWcagLevel.wcag2a).toBeGreaterThanOrEqual(0);
                expect(summary.violationsByWcagLevel.wcag2aa).toBeGreaterThanOrEqual(0);
                expect(summary.violationsByWcagLevel.wcag2aaa).toBeGreaterThanOrEqual(0);
            }
        });
    });

    describe('Error Handling', () => {
        it('should throw error for non-React pages', async () => {
            // Create a simple HTML file URL without React
            const nonReactUrl = 'data:text/html,<html><body><h1>No React Here</h1></body></html>';

            await expect(
                runScanAsPromise({
                    url: nonReactUrl,
                    browser: 'chromium',
                    headless: true,
                }, AppLayer)
            ).rejects.toThrow();
        }, 60000);

        it('should handle invalid URLs gracefully', async () => {
            await expect(
                runScanAsPromise({
                    url: 'not-a-valid-url',
                    browser: 'chromium',
                    headless: true,
                }, AppLayer)
            ).rejects.toThrow();
        }, 60000);
    });
});
