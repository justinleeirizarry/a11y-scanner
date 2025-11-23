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
 * Check if an element has keyboard event listeners
 */
function hasKeyboardListener(element: HTMLElement, eventType: string): boolean {
    // Check for inline handlers
    if (eventType === 'keydown' && element.onkeydown !== null) return true;
    if (eventType === 'keyup' && element.onkeyup !== null) return true;
    if (eventType === 'keypress' && element.onkeypress !== null) return true;

    // Check for React-style event handlers by looking at the fiber or event properties
    const keys = Object.keys(element) as Array<keyof HTMLElement>;
    const hasReactProps = keys.some(key => {
        const keyStr = String(key);
        return keyStr.includes('__react') || keyStr.includes('__reactFiber');
    });

    // For React components, we'd need to traverse the fiber tree
    // This is a basic check - real check would happen in parent traversal
    return element.onkeydown !== null || element.onkeyup !== null || element.onkeypress !== null || hasReactProps;
}

/**
 * Check if a modal is likely to handle Escape key
 */
function testModalEscapeHandling(modal: Element): { supportsEscape: boolean; details: string } {
    const htmlModal = modal as HTMLElement;

    // Check for Escape key listeners
    const hasEscapeListener = htmlModal.onkeydown !== null ||
                              htmlModal.onkeyup !== null ||
                              htmlModal.onkeypress !== null;

    // Check for data attributes that suggest escape handling
    const hasEscapeAttribute = htmlModal.hasAttribute('data-escape') ||
                               htmlModal.hasAttribute('closeOnEscape') ||
                               htmlModal.className.includes('close-on-escape');

    if (hasEscapeListener || hasEscapeAttribute) {
        return {
            supportsEscape: true,
            details: 'Modal appears to have Escape key handling configured.',
        };
    }

    // Check if modal has close button or dismiss button (suggests escape should work)
    const hasCloseButton = modal.querySelector(
        '[aria-label*="close" i], [aria-label*="dismiss" i], [title*="close" i], .close-button'
    );

    if (hasCloseButton) {
        return {
            supportsEscape: true,
            details: 'Modal has visible close button. Should handle Escape key similarly.',
        };
    }

    return {
        supportsEscape: false,
        details: 'Modal does not appear to handle Escape key. No close handlers or close button detected.',
    };
}

/**
 * Test common keyboard shortcuts
 */
function testCommonShortcuts(): ShortcutTest[] {
    const tests: ShortcutTest[] = [];

    // Test Escape key on modals
    const modals = document.querySelectorAll('[role="dialog"], [role="alertdialog"], [aria-modal="true"]');
    if (modals.length > 0) {
        modals.forEach((modal, index) => {
            const { supportsEscape, details } = testModalEscapeHandling(modal);
            tests.push({
                shortcut: 'Escape',
                description: `Close modal (${index + 1}/${modals.length})`,
                passed: supportsEscape,
                details,
            });
        });
    }

    // Test Enter/Space on buttons
    const customButtons = document.querySelectorAll('[role="button"]:not(button)');
    if (customButtons.length > 0) {
        let fullySupported = 0;
        let partiallySupported = 0;

        customButtons.forEach(btn => {
            const htmlBtn = btn as HTMLElement;
            const hasClickHandler = htmlBtn.onclick !== null;
            const hasKeyboardHandler = hasKeyboardListener(htmlBtn, 'keydown');

            if (hasClickHandler && hasKeyboardHandler) {
                fullySupported++;
            } else if (hasClickHandler) {
                partiallySupported++;
            }
        });

        const totalSupported = fullySupported + partiallySupported;
        const allSupported = totalSupported === customButtons.length;

        tests.push({
            shortcut: 'Enter/Space',
            description: 'Activate custom buttons',
            passed: allSupported,
            details: `Found ${customButtons.length} custom button(s): ${fullySupported} with full keyboard support, ${partiallySupported} with click handler only, ${customButtons.length - totalSupported} with no handler.`,
        });
    }

    return tests;
}

/**
 * Get expected keyboard interactions for a role
 */
function getExpectedKeyboardInteractions(role: string): string[] {
    const roleKeyboardMap: Record<string, string[]> = {
        'button': ['Enter', 'Space'],
        'tab': ['Arrow Left', 'Arrow Right', 'Home', 'End'],
        'menu': ['Arrow Down', 'Arrow Up', 'Enter', 'Escape'],
        'menubar': ['Arrow Down', 'Arrow Up', 'Arrow Left', 'Arrow Right', 'Home', 'End'],
        'listbox': ['Arrow Down', 'Arrow Up', 'Home', 'End', 'Enter'],
        'radiogroup': ['Arrow Down', 'Arrow Right'],
        'slider': ['Arrow Left', 'Arrow Right', 'Home', 'End'],
        'spinbutton': ['Arrow Up', 'Arrow Down'],
        'combobox': ['Arrow Down', 'Arrow Up', 'Enter', 'Escape'],
        'tree': ['Arrow Down', 'Arrow Up', 'Arrow Left', 'Arrow Right', 'Enter'],
        'grid': ['Arrow Down', 'Arrow Up', 'Arrow Left', 'Arrow Right'],
    };

    return roleKeyboardMap[role] || ['Enter', 'Space'];
}

/**
 * Check widget for required ARIA attributes
 */
function checkAriaAttributes(element: HTMLElement, role: string): string[] {
    const issues: string[] = [];

    // All interactive widgets should have aria-disabled or similar state
    if (role === 'button' && !element.hasAttribute('aria-pressed') &&
        !element.hasAttribute('aria-expanded') &&
        !element.hasAttribute('disabled')) {
        // Button roles should indicate state if toggleable
        if (element.getAttribute('aria-pressed') === undefined && element.hasAttribute('data-toggle')) {
            issues.push('Toggleable button should have aria-pressed attribute');
        }
    }

    // Check for aria-expanded on expandable widgets
    if (['menu', 'menubar', 'combobox'].includes(role)) {
        if (!element.hasAttribute('aria-expanded') && element.querySelector('[role="menu"]')) {
            issues.push(`Widget with role "${role}" should have aria-expanded attribute`);
        }
    }

    return issues;
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
        'button',
        'tab',
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

            // Check if widget is focusable (critical for custom widgets)
            const tabIndex = htmlEl.getAttribute('tabindex');
            if (tabIndex === null || (tabIndex !== '0' && tabIndex !== '-1')) {
                if (!htmlEl.hasAttribute('tabindex') || parseInt(tabIndex || '-1', 10) < -1) {
                    issues.push('Widget is not focusable (missing or invalid tabindex)');
                }
            }

            // Check for keyboard event listeners
            const hasInlineKeyboardHandlers = htmlEl.onkeydown !== null || htmlEl.onkeyup !== null || htmlEl.onkeypress !== null;

            // Check for React event handlers
            const hasReactHandlers = Object.keys(htmlEl).some(key => {
                return key.includes('__react') || key.includes('__reactFiber');
            });

            // For custom buttons and widgets without inline handlers,
            // we should have a click handler at minimum
            const hasClickHandler = htmlEl.onclick !== null;

            if (!hasInlineKeyboardHandlers && !hasReactHandlers && !hasClickHandler) {
                issues.push('No keyboard or click handlers detected');
            } else if (!hasInlineKeyboardHandlers && !hasReactHandlers && hasClickHandler) {
                // Has click handler but no keyboard handler
                issues.push(`Keyboard handlers not detected (has click handler). Requires Enter/Space key support for role="${role}"`);
            }

            // Check ARIA attributes
            const ariaIssues = checkAriaAttributes(htmlEl, role);
            issues.push(...ariaIssues);

            // Expected keyboard support for this role
            const expectedKeys = getExpectedKeyboardInteractions(role);

            widgets.push({
                element: generateSelector(htmlEl),
                role,
                keyboardSupport: issues.length === 0 ? 'full' : issues.length <= 2 ? 'partial' : 'none',
                issues: issues.length > 0 ? issues : [`Supports expected keyboard interactions: ${expectedKeys.join(', ')}`],
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
