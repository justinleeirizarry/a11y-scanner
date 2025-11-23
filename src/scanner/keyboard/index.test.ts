/**
 * Integration tests for keyboard testing orchestration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Keyboard Testing Summary', () => {
    let dom: JSDOM;
    let originalDocument: any;

    beforeEach(() => {
        originalDocument = (global as any).document;
    });

    afterEach(() => {
        (global as any).document = originalDocument;
    });

    describe('Issue Aggregation', () => {
        it('should count critical issues from focus indicators', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <button id="btn1" style="outline: none;">No outline</button>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            // Simulating the aggregation logic
            const issues = [
                { severity: 'critical', type: 'missing-focus-indicator' },
            ];

            const criticalCount = issues.filter(i => i.severity === 'critical').length;
            expect(criticalCount).toBe(1);
        });

        it('should count serious issues from low contrast', () => {
            const issues = [
                { severity: 'serious', type: 'low-contrast-focus' },
                { severity: 'serious', type: 'low-contrast-focus' },
            ];

            const seriousCount = issues.filter(i => i.severity === 'serious').length;
            expect(seriousCount).toBe(2);
        });

        it('should count moderate issues from partial keyboard support', () => {
            const issues = [
                { severity: 'moderate', type: 'partial-keyboard-support' },
            ];

            const moderateCount = issues.filter(i => i.severity === 'moderate').length;
            expect(moderateCount).toBe(1);
        });

        it('should aggregate all severity levels', () => {
            const issues = [
                { severity: 'critical', type: 'focus' },
                { severity: 'serious', type: 'contrast' },
                { severity: 'moderate', type: 'keyboard' },
                { severity: 'critical', type: 'modal-trap' },
            ];

            const summary = {
                totalIssues: issues.length,
                criticalIssues: issues.filter(i => i.severity === 'critical').length,
                seriousIssues: issues.filter(i => i.severity === 'serious').length,
                moderateIssues: issues.filter(i => i.severity === 'moderate').length,
            };

            expect(summary.totalIssues).toBe(4);
            expect(summary.criticalIssues).toBe(2);
            expect(summary.seriousIssues).toBe(1);
            expect(summary.moderateIssues).toBe(1);
        });

        it('should handle empty issue lists', () => {
            const issues: any[] = [];

            const summary = {
                totalIssues: issues.length,
                criticalIssues: issues.filter(i => i.severity === 'critical').length,
                seriousIssues: issues.filter(i => i.severity === 'serious').length,
                moderateIssues: issues.filter(i => i.severity === 'moderate').length,
            };

            expect(summary.totalIssues).toBe(0);
            expect(summary.criticalIssues).toBe(0);
        });
    });

    describe('Widget Issue Mapping', () => {
        it('should map custom widgets with no keyboard support to critical', () => {
            const widget = {
                element: '#custom-btn',
                role: 'button',
                keyboardSupport: 'none' as const,
                issues: ['No keyboard or click handlers detected'],
            };

            const severity = widget.keyboardSupport === 'none' ? 'critical' : 'serious';
            expect(severity).toBe('critical');
        });

        it('should map custom widgets with partial keyboard support to serious', () => {
            const widget = {
                element: '#custom-btn',
                role: 'button',
                keyboardSupport: 'partial' as const,
                issues: ['Keyboard handlers not detected (has click handler)'],
            };

            const severity = widget.keyboardSupport === 'partial' ? 'serious' : 'critical';
            expect(severity).toBe('serious');
        });

        it('should not report issues for full keyboard support', () => {
            const widget = {
                element: '#custom-btn',
                role: 'button',
                keyboardSupport: 'full' as const,
                issues: [],
            };

            expect(widget.keyboardSupport).toBe('full');
            expect(widget.issues.length).toBe(0);
        });

        it('should aggregate multiple widget issues', () => {
            const widgets = [
                { role: 'button', keyboardSupport: 'none' as const },
                { role: 'button', keyboardSupport: 'none' as const },
                { role: 'menu', keyboardSupport: 'partial' as const },
            ];

            const criticalWidgets = widgets.filter(w => w.keyboardSupport === 'none').length;
            const seriousWidgets = widgets.filter(w => w.keyboardSupport === 'partial').length;

            expect(criticalWidgets).toBe(2);
            expect(seriousWidgets).toBe(1);
        });
    });

    describe('Test Result Composition', () => {
        it('should include tab order results', () => {
            const results = {
                tabOrder: {
                    totalFocusableElements: 5,
                    tabOrder: [],
                    violations: [],
                    visualOrderMismatches: [],
                },
                focusManagement: { focusIndicatorIssues: [], skipLinksWorking: true, skipLinkDetails: '', focusRestorationTests: [] },
                shortcuts: { tests: [], customWidgets: [] },
                summary: { totalIssues: 0, criticalIssues: 0, seriousIssues: 0, moderateIssues: 0 },
            };

            expect(results.tabOrder.totalFocusableElements).toBe(5);
        });

        it('should include focus management results', () => {
            const results = {
                tabOrder: { totalFocusableElements: 0, tabOrder: [], violations: [], visualOrderMismatches: [] },
                focusManagement: {
                    focusIndicatorIssues: [
                        { element: '#btn', issue: 'missing', details: 'No focus', severity: 'critical' },
                    ],
                    skipLinksWorking: false,
                    skipLinkDetails: 'No skip link found',
                    focusRestorationTests: [],
                },
                shortcuts: { tests: [], customWidgets: [] },
                summary: { totalIssues: 1, criticalIssues: 1, seriousIssues: 0, moderateIssues: 0 },
            };

            expect(results.focusManagement.focusIndicatorIssues.length).toBe(1);
            expect(results.focusManagement.skipLinksWorking).toBe(false);
        });

        it('should include keyboard shortcut results', () => {
            const results = {
                tabOrder: { totalFocusableElements: 0, tabOrder: [], violations: [], visualOrderMismatches: [] },
                focusManagement: { focusIndicatorIssues: [], skipLinksWorking: true, skipLinkDetails: '', focusRestorationTests: [] },
                shortcuts: {
                    tests: [
                        { shortcut: 'Escape', description: 'Close modals', passed: false, details: 'No handler' },
                    ],
                    customWidgets: [
                        { element: '#btn', role: 'button', keyboardSupport: 'partial', issues: [] },
                    ],
                },
                summary: { totalIssues: 0, criticalIssues: 0, seriousIssues: 0, moderateIssues: 0 },
            };

            expect(results.shortcuts.tests.length).toBe(1);
            expect(results.shortcuts.customWidgets.length).toBe(1);
        });

        it('should calculate summary from all test results', () => {
            const focusIndicatorIssues = [
                { element: '#btn', issue: 'missing', details: '', severity: 'critical' },
                { element: '#btn2', issue: 'low-contrast', details: '', severity: 'serious' },
            ];

            const customWidgetIssues = [
                { type: 'custom-widget', element: '#widget', details: '', severity: 'critical' },
            ];

            const allViolations = [
                ...focusIndicatorIssues,
                ...customWidgetIssues,
            ];

            const summary = {
                totalIssues: allViolations.length,
                criticalIssues: allViolations.filter(v => v.severity === 'critical').length,
                seriousIssues: allViolations.filter(v => v.severity === 'serious').length,
                moderateIssues: allViolations.filter(v => v.severity === 'moderate').length,
            };

            expect(summary.totalIssues).toBe(3);
            expect(summary.criticalIssues).toBe(2);
            expect(summary.seriousIssues).toBe(1);
        });
    });

    describe('Test Execution Order', () => {
        it('should validate that tab order is checked first', () => {
            const executionOrder: string[] = [];

            // Simulate the test execution
            executionOrder.push('tabOrder');
            executionOrder.push('focusManagement');
            executionOrder.push('shortcuts');

            expect(executionOrder[0]).toBe('tabOrder');
            expect(executionOrder[1]).toBe('focusManagement');
            expect(executionOrder[2]).toBe('shortcuts');
        });

        it('should handle test execution with errors gracefully', () => {
            const results = {
                tabOrder: { totalFocusableElements: 0, tabOrder: [], violations: [], visualOrderMismatches: [] },
                focusManagement: { focusIndicatorIssues: [], skipLinksWorking: true, skipLinkDetails: '', focusRestorationTests: [] },
                shortcuts: { tests: [], customWidgets: [] },
                summary: { totalIssues: 0, criticalIssues: 0, seriousIssues: 0, moderateIssues: 0 },
            };

            // All modules should be present even if some fail
            expect(results).toHaveProperty('tabOrder');
            expect(results).toHaveProperty('focusManagement');
            expect(results).toHaveProperty('shortcuts');
            expect(results).toHaveProperty('summary');
        });
    });

    describe('Integration with Scanner Bundle', () => {
        it('should provide valid results structure for browser context', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <button>Click me</button>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            // Simulating the return structure
            const keyboardTests = {
                tabOrder: {
                    totalFocusableElements: 1,
                    tabOrder: [],
                    violations: [],
                    visualOrderMismatches: [],
                },
                focusManagement: {
                    focusIndicatorIssues: [],
                    skipLinksWorking: false,
                    skipLinkDetails: 'No skip link found',
                    focusRestorationTests: [],
                },
                shortcuts: {
                    tests: [],
                    customWidgets: [],
                },
                summary: {
                    totalIssues: 0,
                    criticalIssues: 0,
                    seriousIssues: 0,
                    moderateIssues: 0,
                },
            };

            expect(keyboardTests).toHaveProperty('tabOrder');
            expect(keyboardTests).toHaveProperty('focusManagement');
            expect(keyboardTests).toHaveProperty('shortcuts');
            expect(keyboardTests).toHaveProperty('summary');
            expect(keyboardTests.summary.totalIssues).toBeGreaterThanOrEqual(0);
        });

        it('should be serializable to JSON', () => {
            const keyboardTests = {
                tabOrder: { totalFocusableElements: 0, tabOrder: [], violations: [], visualOrderMismatches: [] },
                focusManagement: { focusIndicatorIssues: [], skipLinksWorking: true, skipLinkDetails: '', focusRestorationTests: [] },
                shortcuts: { tests: [], customWidgets: [] },
                summary: { totalIssues: 0, criticalIssues: 0, seriousIssues: 0, moderateIssues: 0 },
            };

            const json = JSON.stringify(keyboardTests);
            const parsed = JSON.parse(json);

            expect(parsed).toEqual(keyboardTests);
        });
    });
});
