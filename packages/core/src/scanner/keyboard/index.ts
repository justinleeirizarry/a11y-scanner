/**
 * Main keyboard testing module - orchestrates all keyboard accessibility tests
 */

import { validateTabOrder, type TabOrderResults } from './tab-order.js';
import { validateFocusManagement, type FocusManagementResults } from './focus-management.js';
import { testKeyboardShortcuts, type KeyboardShortcutResults } from './shortcuts.js';

export interface KeyboardTestResults {
    tabOrder: TabOrderResults;
    focusManagement: FocusManagementResults;
    shortcuts: KeyboardShortcutResults;
    summary: {
        totalIssues: number;
        criticalIssues: number;
        seriousIssues: number;
        moderateIssues: number;
    };
}

/**
 * Run all keyboard accessibility tests
 */
export function runKeyboardTests(): KeyboardTestResults {
    // Run all tests

    // Run all tests
    const tabOrder = validateTabOrder();
    const focusManagement = validateFocusManagement();
    const shortcuts = testKeyboardShortcuts();

    // Calculate summary
    const allViolations = [
        ...tabOrder.violations,
        ...focusManagement.focusIndicatorIssues,
        // Map custom widget issues to violation structure
        ...shortcuts.customWidgets
            .filter(w => w.keyboardSupport !== 'full')
            .map(w => ({
                type: 'custom-widget',
                element: w.element,
                details: `Custom widget with role "${w.role}" has incomplete keyboard support: ${w.issues.join(', ')}`,
                severity: w.keyboardSupport === 'none' ? 'critical' : 'serious' as 'critical' | 'serious' | 'moderate'
            }))
    ];

    const summary = {
        totalIssues: allViolations.length,
        criticalIssues: allViolations.filter(v => v.severity === 'critical').length,
        seriousIssues: allViolations.filter(v => v.severity === 'serious').length,
        moderateIssues: allViolations.filter(v => v.severity === 'moderate').length,
    };

    return {
        tabOrder,
        focusManagement,
        shortcuts,
        summary,
    };
}

// Export types
export type { TabOrderResults, FocusManagementResults, KeyboardShortcutResults };
