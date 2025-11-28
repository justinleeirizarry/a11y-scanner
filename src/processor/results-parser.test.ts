/**
 * Unit tests for results parser
 */

import { describe, it, expect } from 'vitest';
import { processResults } from './results-parser.js';
import type { BrowserScanData, AttributedViolation, ComponentInfo } from '../types.js';

describe('processResults', () => {
    const mockComponents: ComponentInfo[] = [
        { name: 'App', type: 'component', path: ['App'] },
        { name: 'Header', type: 'component', path: ['App', 'Header'] },
        { name: 'Button', type: 'component', path: ['App', 'Button'] },
    ];

    const createMockViolation = (
        id: string,
        impact: 'critical' | 'serious' | 'moderate' | 'minor',
        componentName: string,
        nodeCount: number = 1
    ): AttributedViolation => ({
        id,
        impact,
        description: `Test violation ${id}`,
        help: 'Help text',
        helpUrl: 'https://example.com',
        tags: ['wcag2aa'],
        nodes: Array(nodeCount).fill(null).map(() => ({
            component: componentName,
            componentPath: ['App', componentName],
            userComponentPath: [componentName],
            componentType: 'component' as const,
            html: '<div>test</div>',
            htmlSnippet: '<div>test</div>',
            cssSelector: 'div',
            target: ['div'],
            failureSummary: 'Test failure',
            isFrameworkComponent: false,
        })),
    });

    describe('Basic processing', () => {
        it('should process scan results correctly', () => {
            const violations = [
                createMockViolation('color-contrast', 'serious', 'Button'),
            ];

            const rawData: BrowserScanData = {
                components: mockComponents,
                violations,
            };

            const result = processResults({
                rawData,
                url: 'http://example.com',
                browser: 'chromium',
            });

            expect(result.url).toBe('http://example.com');
            expect(result.browser).toBe('chromium');
            expect(result.timestamp).toBeDefined();
            expect(result.components).toEqual(mockComponents);
            expect(result.violations).toEqual(violations);
        });

        it('should generate timestamp in ISO format', () => {
            const rawData: BrowserScanData = {
                components: [],
                violations: [],
            };

            const result = processResults({
                rawData,
                url: 'http://example.com',
                browser: 'chromium',
            });

            expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        });
    });

    describe('Summary calculations', () => {
        it('should count total components', () => {
            const rawData: BrowserScanData = {
                components: mockComponents,
                violations: [],
            };

            const result = processResults({
                rawData,
                url: 'http://example.com',
                browser: 'chromium',
            });

            expect(result.summary.totalComponents).toBe(3);
        });

        it('should count total violations (instances)', () => {
            const violations = [
                createMockViolation('color-contrast', 'serious', 'Button', 3),
                createMockViolation('missing-label', 'critical', 'Input', 2),
            ];

            const rawData: BrowserScanData = {
                components: mockComponents,
                violations,
            };

            const result = processResults({
                rawData,
                url: 'http://example.com',
                browser: 'chromium',
            });

            expect(result.summary.totalViolations).toBe(5); // 3 + 2 instances
        });

        it('should calculate severity breakdown', () => {
            const violations = [
                createMockViolation('critical-1', 'critical', 'Button', 2),
                createMockViolation('serious-1', 'serious', 'Input', 3),
                createMockViolation('moderate-1', 'moderate', 'Header', 1),
                createMockViolation('minor-1', 'minor', 'Footer', 4),
            ];

            const rawData: BrowserScanData = {
                components: mockComponents,
                violations,
            };

            const result = processResults({
                rawData,
                url: 'http://example.com',
                browser: 'chromium',
            });

            expect(result.summary.violationsBySeverity).toEqual({
                critical: 2,
                serious: 3,
                moderate: 1,
                minor: 4,
            });
        });

        it('should count unique components with violations', () => {
            const violations = [
                createMockViolation('violation-1', 'serious', 'Button', 2),
                createMockViolation('violation-2', 'serious', 'Button', 1), // Same component
                createMockViolation('violation-3', 'critical', 'Input', 1),
            ];

            const rawData: BrowserScanData = {
                components: mockComponents,
                violations,
            };

            const result = processResults({
                rawData,
                url: 'http://example.com',
                browser: 'chromium',
            });

            expect(result.summary.componentsWithViolations).toBe(2); // Button and Input
        });

        it('should handle components without names', () => {
            const violations = [
                createMockViolation('violation-1', 'serious', 'Button', 1),
                {
                    ...createMockViolation('violation-2', 'serious', '', 1),
                    nodes: [{
                        component: null,
                        componentPath: [],
                        userComponentPath: [],
                        componentType: 'host' as const,
                        html: '<div>test</div>',
                        htmlSnippet: '<div>test</div>',
                        cssSelector: 'div',
                        target: ['div'],
                        failureSummary: 'Test failure',
                        isFrameworkComponent: false,
                    }],
                },
            ];

            const rawData: BrowserScanData = {
                components: mockComponents,
                violations,
            };

            const result = processResults({
                rawData,
                url: 'http://example.com',
                browser: 'chromium',
            });

            expect(result.summary.componentsWithViolations).toBe(1); // Only Button
        });
    });

    describe('Keyboard test results', () => {
        it('should include keyboard test results when present', () => {
            const keyboardTests = {
                tabOrder: {
                    totalFocusableElements: 5,
                    tabOrder: [],
                    violations: [],
                    visualOrderMismatches: [],
                },
                focusManagement: {
                    focusIndicatorIssues: [],
                    skipLinksWorking: true,
                    skipLinkDetails: 'Working',
                    focusRestorationTests: [],
                },
                shortcuts: {
                    tests: [],
                    customWidgets: [],
                },
                summary: {
                    totalIssues: 3,
                    criticalIssues: 1,
                    seriousIssues: 2,
                    moderateIssues: 0,
                },
            };

            const rawData: BrowserScanData = {
                components: mockComponents,
                violations: [],
                keyboardTests,
            };

            const result = processResults({
                rawData,
                url: 'http://example.com',
                browser: 'chromium',
            });

            expect(result.keyboardTests).toEqual(keyboardTests);
            expect(result.summary.keyboardIssues).toBe(3);
        });

        it('should handle missing keyboard tests', () => {
            const rawData: BrowserScanData = {
                components: mockComponents,
                violations: [],
            };

            const result = processResults({
                rawData,
                url: 'http://example.com',
                browser: 'chromium',
            });

            expect(result.keyboardTests).toBeUndefined();
            expect(result.summary.keyboardIssues).toBeUndefined();
        });
    });

    describe('Edge cases', () => {
        it('should handle empty results', () => {
            const rawData: BrowserScanData = {
                components: [],
                violations: [],
            };

            const result = processResults({
                rawData,
                url: 'http://example.com',
                browser: 'chromium',
            });

            expect(result.summary.totalComponents).toBe(0);
            expect(result.summary.totalViolations).toBe(0);
            expect(result.summary.componentsWithViolations).toBe(0);
            expect(result.summary.violationsBySeverity).toEqual({
                critical: 0,
                serious: 0,
                moderate: 0,
                minor: 0,
            });
        });

        it('should handle violations with no nodes', () => {
            const violations: AttributedViolation[] = [{
                id: 'test',
                impact: 'serious',
                description: 'Test',
                help: 'Help',
                helpUrl: 'https://example.com',
                tags: ['wcag2aa'],
                nodes: [],
            }];

            const rawData: BrowserScanData = {
                components: mockComponents,
                violations,
            };

            const result = processResults({
                rawData,
                url: 'http://example.com',
                browser: 'chromium',
            });

            expect(result.summary.totalViolations).toBe(0);
        });
    });
});
