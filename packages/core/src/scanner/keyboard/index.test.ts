/**
 * Tests for keyboard testing orchestration - runKeyboardTests()
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock the sub-modules
vi.mock('./tab-order.js', () => ({
    validateTabOrder: vi.fn()
}));

vi.mock('./focus-management.js', () => ({
    validateFocusManagement: vi.fn()
}));

vi.mock('./shortcuts.js', () => ({
    testKeyboardShortcuts: vi.fn()
}));

import { runKeyboardTests } from './index.js';
import { validateTabOrder } from './tab-order.js';
import { validateFocusManagement } from './focus-management.js';
import { testKeyboardShortcuts } from './shortcuts.js';

describe('runKeyboardTests', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('Orchestration', () => {
        it('should call all three sub-modules', () => {
            // Setup mocks with minimal valid return values
            (validateTabOrder as any).mockReturnValue({
                totalFocusableElements: 0,
                tabOrder: [],
                violations: [],
                visualOrderMismatches: []
            });

            (validateFocusManagement as any).mockReturnValue({
                focusIndicatorIssues: [],
                skipLinksWorking: true,
                skipLinkDetails: '',
                focusRestorationTests: []
            });

            (testKeyboardShortcuts as any).mockReturnValue({
                tests: [],
                customWidgets: []
            });

            runKeyboardTests();

            expect(validateTabOrder).toHaveBeenCalledTimes(1);
            expect(validateFocusManagement).toHaveBeenCalledTimes(1);
            expect(testKeyboardShortcuts).toHaveBeenCalledTimes(1);
        });

        it('should return combined results from all sub-modules', () => {
            const mockTabOrder = {
                totalFocusableElements: 5,
                tabOrder: [{ selector: '#btn', tabIndex: 0, position: { x: 0, y: 0 } }],
                violations: [],
                visualOrderMismatches: []
            };

            const mockFocusManagement = {
                focusIndicatorIssues: [],
                skipLinksWorking: false,
                skipLinkDetails: 'No skip link found',
                focusRestorationTests: []
            };

            const mockShortcuts = {
                tests: [{ shortcut: 'Escape', description: 'Close modal', passed: true, details: 'OK' }],
                customWidgets: []
            };

            (validateTabOrder as any).mockReturnValue(mockTabOrder);
            (validateFocusManagement as any).mockReturnValue(mockFocusManagement);
            (testKeyboardShortcuts as any).mockReturnValue(mockShortcuts);

            const results = runKeyboardTests();

            expect(results.tabOrder).toEqual(mockTabOrder);
            expect(results.focusManagement).toEqual(mockFocusManagement);
            expect(results.shortcuts).toEqual(mockShortcuts);
        });
    });

    describe('Summary Calculation', () => {
        it('should count issues from tab order violations', () => {
            (validateTabOrder as any).mockReturnValue({
                totalFocusableElements: 3,
                tabOrder: [],
                violations: [
                    { type: 'tab-trap', element: '#modal', details: 'Trapped', severity: 'critical' },
                    { type: 'tabindex-antipattern', element: '#btn', details: 'Bad', severity: 'serious' }
                ],
                visualOrderMismatches: []
            });

            (validateFocusManagement as any).mockReturnValue({
                focusIndicatorIssues: [],
                skipLinksWorking: true,
                skipLinkDetails: '',
                focusRestorationTests: []
            });

            (testKeyboardShortcuts as any).mockReturnValue({
                tests: [],
                customWidgets: []
            });

            const results = runKeyboardTests();

            expect(results.summary.totalIssues).toBe(2);
            expect(results.summary.criticalIssues).toBe(1);
            expect(results.summary.seriousIssues).toBe(1);
        });

        it('should count issues from focus indicator problems', () => {
            (validateTabOrder as any).mockReturnValue({
                totalFocusableElements: 0,
                tabOrder: [],
                violations: [],
                visualOrderMismatches: []
            });

            (validateFocusManagement as any).mockReturnValue({
                focusIndicatorIssues: [
                    { element: '#btn1', issue: 'missing', details: 'No outline', severity: 'critical' },
                    { element: '#btn2', issue: 'low-contrast', details: 'Low', severity: 'serious' },
                    { element: '#btn3', issue: 'too-small', details: 'Small', severity: 'moderate' }
                ],
                skipLinksWorking: true,
                skipLinkDetails: '',
                focusRestorationTests: []
            });

            (testKeyboardShortcuts as any).mockReturnValue({
                tests: [],
                customWidgets: []
            });

            const results = runKeyboardTests();

            expect(results.summary.totalIssues).toBe(3);
            expect(results.summary.criticalIssues).toBe(1);
            expect(results.summary.seriousIssues).toBe(1);
            expect(results.summary.moderateIssues).toBe(1);
        });

        it('should count issues from custom widgets without full keyboard support', () => {
            (validateTabOrder as any).mockReturnValue({
                totalFocusableElements: 0,
                tabOrder: [],
                violations: [],
                visualOrderMismatches: []
            });

            (validateFocusManagement as any).mockReturnValue({
                focusIndicatorIssues: [],
                skipLinksWorking: true,
                skipLinkDetails: '',
                focusRestorationTests: []
            });

            (testKeyboardShortcuts as any).mockReturnValue({
                tests: [],
                customWidgets: [
                    { element: '#widget1', role: 'button', keyboardSupport: 'none', issues: ['No handlers'] },
                    { element: '#widget2', role: 'menu', keyboardSupport: 'partial', issues: ['Missing arrows'] },
                    { element: '#widget3', role: 'tab', keyboardSupport: 'full', issues: [] } // Should not count
                ]
            });

            const results = runKeyboardTests();

            // Only widgets with 'none' or 'partial' support are counted as issues
            expect(results.summary.totalIssues).toBe(2);
            expect(results.summary.criticalIssues).toBe(1); // 'none' = critical
            expect(results.summary.seriousIssues).toBe(1);  // 'partial' = serious
        });

        it('should aggregate all issue types into total', () => {
            (validateTabOrder as any).mockReturnValue({
                totalFocusableElements: 0,
                tabOrder: [],
                violations: [
                    { type: 'tab-trap', element: '#trap', details: '', severity: 'critical' }
                ],
                visualOrderMismatches: []
            });

            (validateFocusManagement as any).mockReturnValue({
                focusIndicatorIssues: [
                    { element: '#btn', issue: 'missing', details: '', severity: 'critical' }
                ],
                skipLinksWorking: true,
                skipLinkDetails: '',
                focusRestorationTests: []
            });

            (testKeyboardShortcuts as any).mockReturnValue({
                tests: [],
                customWidgets: [
                    { element: '#widget', role: 'button', keyboardSupport: 'none', issues: ['No handlers'] }
                ]
            });

            const results = runKeyboardTests();

            // 1 tab violation + 1 focus issue + 1 widget issue = 3 total
            expect(results.summary.totalIssues).toBe(3);
            expect(results.summary.criticalIssues).toBe(3);
        });

        it('should return zero counts when no issues found', () => {
            (validateTabOrder as any).mockReturnValue({
                totalFocusableElements: 5,
                tabOrder: [],
                violations: [],
                visualOrderMismatches: []
            });

            (validateFocusManagement as any).mockReturnValue({
                focusIndicatorIssues: [],
                skipLinksWorking: true,
                skipLinkDetails: 'Working',
                focusRestorationTests: []
            });

            (testKeyboardShortcuts as any).mockReturnValue({
                tests: [],
                customWidgets: [
                    { element: '#btn', role: 'button', keyboardSupport: 'full', issues: [] }
                ]
            });

            const results = runKeyboardTests();

            expect(results.summary.totalIssues).toBe(0);
            expect(results.summary.criticalIssues).toBe(0);
            expect(results.summary.seriousIssues).toBe(0);
            expect(results.summary.moderateIssues).toBe(0);
        });
    });

    describe('Return Type Structure', () => {
        it('should return valid KeyboardTestResults structure', () => {
            (validateTabOrder as any).mockReturnValue({
                totalFocusableElements: 0,
                tabOrder: [],
                violations: [],
                visualOrderMismatches: []
            });

            (validateFocusManagement as any).mockReturnValue({
                focusIndicatorIssues: [],
                skipLinksWorking: true,
                skipLinkDetails: '',
                focusRestorationTests: []
            });

            (testKeyboardShortcuts as any).mockReturnValue({
                tests: [],
                customWidgets: []
            });

            const results = runKeyboardTests();

            // Verify structure matches KeyboardTestResults type
            expect(results).toHaveProperty('tabOrder');
            expect(results).toHaveProperty('focusManagement');
            expect(results).toHaveProperty('shortcuts');
            expect(results).toHaveProperty('summary');

            expect(results.summary).toHaveProperty('totalIssues');
            expect(results.summary).toHaveProperty('criticalIssues');
            expect(results.summary).toHaveProperty('seriousIssues');
            expect(results.summary).toHaveProperty('moderateIssues');
        });

        it('should be serializable to JSON', () => {
            (validateTabOrder as any).mockReturnValue({
                totalFocusableElements: 2,
                tabOrder: [{ selector: '#a', tabIndex: 0, position: { x: 10, y: 20 } }],
                violations: [{ type: 'tab-trap', element: '#x', details: 'Trap', severity: 'critical' }],
                visualOrderMismatches: []
            });

            (validateFocusManagement as any).mockReturnValue({
                focusIndicatorIssues: [{ element: '#b', issue: 'missing', details: 'No focus', severity: 'critical' }],
                skipLinksWorking: false,
                skipLinkDetails: 'None found',
                focusRestorationTests: [{ scenario: 'Modal', passed: true, details: 'OK' }]
            });

            (testKeyboardShortcuts as any).mockReturnValue({
                tests: [{ shortcut: 'Escape', description: 'Close', passed: true, details: 'OK' }],
                customWidgets: [{ element: '#c', role: 'button', keyboardSupport: 'full', issues: [] }]
            });

            const results = runKeyboardTests();

            // Should not throw when serializing
            const json = JSON.stringify(results);
            const parsed = JSON.parse(json);

            expect(parsed.tabOrder.totalFocusableElements).toBe(2);
            expect(parsed.focusManagement.skipLinksWorking).toBe(false);
            expect(parsed.shortcuts.tests).toHaveLength(1);
            expect(parsed.summary.totalIssues).toBe(2);
        });
    });
});
