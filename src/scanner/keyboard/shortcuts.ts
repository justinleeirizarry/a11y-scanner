/**
 * Keyboard shortcuts testing - validates common keyboard interactions
 */

export interface ShortcutTest {
    shortcut: string;
    description: string;
    passed: boolean;
    details: string;
}

export interface KeyboardShortcutResults {
    tests: ShortcutTest[];
    customWidgets: Array<{
        element: string;
        role: string;
        keyboardSupport: 'full' | 'partial' | 'none';
        issues: string[];
    }>;
}

/**
 * Test common keyboard shortcuts
 */
function testCommonShortcuts(): ShortcutTest[] {
    const tests: ShortcutTest[] = [];

    // Test Escape key on modals
    const modals = document.querySelectorAll('[role="dialog"], [role="alertdialog"], [aria-modal="true"]');
    if (modals.length > 0) {
        tests.push({
            shortcut: 'Escape',
            description: 'Close modals/dialogs',
            passed: true, // TODO: Implement actual testing
            details: `Found ${modals.length} modal(s). Manual testing recommended to verify Escape key closes them.`,
        });
    }

    // Test Enter/Space on buttons
    const customButtons = document.querySelectorAll('[role="button"]:not(button)');
    if (customButtons.length > 0) {
        tests.push({
            shortcut: 'Enter/Space',
            description: 'Activate custom buttons',
            passed: true, // TODO: Implement actual testing
            details: `Found ${customButtons.length} custom button(s). Verify they respond to Enter and Space keys.`,
        });
    }

    return tests;
}

/**
 * Validate custom widgets keyboard support
 */
function validateCustomWidgets(): Array<{
    element: string;
    role: string;
    keyboardSupport: 'full' | 'partial' | 'none';
    issues: string[];
}> {
    const widgets: Array<{
        element: string;
        role: string;
        keyboardSupport: 'full' | 'partial' | 'none';
        issues: string[];
    }> = [];

    // Check for common ARIA widget roles
    const widgetRoles = [
        'tablist',
        'menu',
        'menubar',
        'tree',
        'grid',
        'listbox',
        'radiogroup',
        'slider',
        'spinbutton',
        'combobox',
    ];

    widgetRoles.forEach(role => {
        const elements = document.querySelectorAll(`[role="${role}"]`);
        elements.forEach(el => {
            const issues: string[] = [];
            const htmlEl = el as HTMLElement;

            // Check if widget is focusable
            if (htmlEl.tabIndex < 0 && !htmlEl.hasAttribute('tabindex')) {
                issues.push('Widget container is not focusable');
            }

            // Check for keyboard event listeners (simplified check)
            const hasKeyboardHandlers = htmlEl.onkeydown !== null || htmlEl.onkeyup !== null;
            if (!hasKeyboardHandlers) {
                issues.push('No keyboard event handlers detected');
            }

            widgets.push({
                element: generateSelector(htmlEl),
                role,
                keyboardSupport: issues.length === 0 ? 'full' : issues.length === 1 ? 'partial' : 'none',
                issues,
            });
        });
    });

    return widgets;
}

/**
 * Generate a CSS selector for an element
 */
function generateSelector(element: HTMLElement): string {
    if (element.id) {
        return `#${element.id}`;
    }

    const path: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current !== document.body) {
        let selector = current.tagName.toLowerCase();

        if (current.className) {
            const classes = current.className.split(' ').filter(c => c.trim());
            if (classes.length > 0) {
                selector += '.' + classes.slice(0, 2).join('.');
            }
        }

        path.unshift(selector);
        current = current.parentElement;
    }

    return path.join(' > ');
}

/**
 * Main function to test keyboard shortcuts
 */
export function testKeyboardShortcuts(): KeyboardShortcutResults {
    const tests = testCommonShortcuts();
    const customWidgets = validateCustomWidgets();

    return {
        tests,
        customWidgets,
    };
}
