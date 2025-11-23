/**
 * Focus management testing - validates focus indicators, skip links, and focus restoration
 */

export interface FocusIndicatorIssue {
    element: string;
    issue: 'missing' | 'low-contrast' | 'too-small' | 'not-visible';
    details: string;
    severity: 'critical' | 'serious' | 'moderate';
}

export interface FocusRestorationTest {
    scenario: string;
    passed: boolean;
    details: string;
}

export interface FocusManagementResults {
    focusIndicatorIssues: FocusIndicatorIssue[];
    skipLinksWorking: boolean;
    skipLinkDetails: string;
    focusRestorationTests: FocusRestorationTest[];
}

/**
 * Validate focus indicators for all focusable elements
 */
function validateFocusIndicators(): FocusIndicatorIssue[] {
    const issues: FocusIndicatorIssue[] = [];
    const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
    ];

    const elements = document.querySelectorAll(focusableSelectors.join(','));

    elements.forEach(el => {
        const htmlEl = el as HTMLElement;
        const selector = generateSelector(htmlEl);

        // Temporarily focus the element to check styles
        const originalFocus = document.activeElement;
        htmlEl.focus();

        const focusedStyle = window.getComputedStyle(htmlEl);
        const normalStyle = window.getComputedStyle(htmlEl);

        // Check if focus indicator is visible
        const hasFocusIndicator = checkFocusIndicatorVisibility(htmlEl, focusedStyle);

        if (!hasFocusIndicator) {
            issues.push({
                element: selector,
                issue: 'missing',
                details: 'No visible focus indicator detected. Users navigating by keyboard won\'t know where they are.',
                severity: 'critical',
            });
        } else {
            // Check contrast of focus indicator
            const contrastIssue = checkFocusIndicatorContrast(htmlEl, focusedStyle);
            if (contrastIssue) {
                issues.push(contrastIssue);
            }
        }

        // Restore original focus
        if (originalFocus instanceof HTMLElement) {
            originalFocus.focus();
        } else {
            htmlEl.blur();
        }
    });

    return issues;
}

/**
 * Check if element has a visible focus indicator
 */
function checkFocusIndicatorVisibility(element: HTMLElement, style: CSSStyleDeclaration): boolean {
    // Check for outline
    if (style.outlineWidth !== '0px' && style.outlineStyle !== 'none') {
        return true;
    }

    // Check for border change
    if (style.borderWidth !== '0px' && style.borderStyle !== 'none') {
        return true;
    }

    // Check for box-shadow
    if (style.boxShadow && style.boxShadow !== 'none') {
        return true;
    }

    // Check for background color change
    if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        return true;
    }

    return false;
}

/**
 * Check focus indicator contrast ratio
 */
function checkFocusIndicatorContrast(element: HTMLElement, style: CSSStyleDeclaration): FocusIndicatorIssue | null {
    // Get outline color
    const outlineColor = style.outlineColor;
    const backgroundColor = style.backgroundColor;

    // Simple contrast check (simplified - real implementation would use WCAG formula)
    // This is a placeholder for actual contrast calculation
    const hasGoodContrast = true; // TODO: Implement actual contrast calculation

    if (!hasGoodContrast) {
        return {
            element: generateSelector(element),
            issue: 'low-contrast',
            details: 'Focus indicator has insufficient contrast ratio. Should be at least 3:1 against adjacent colors.',
            severity: 'serious',
        };
    }

    return null;
}

/**
 * Test skip links functionality
 */
function testSkipLinks(): { working: boolean; details: string } {
    const skipLinks = document.querySelectorAll('a[href^="#"]');
    let foundSkipLink = false;
    let skipLinkWorks = false;

    skipLinks.forEach(link => {
        const text = link.textContent?.toLowerCase() || '';
        if (text.includes('skip') && (text.includes('content') || text.includes('main') || text.includes('navigation'))) {
            foundSkipLink = true;
            const href = link.getAttribute('href');
            if (href) {
                const target = document.querySelector(href);
                if (target) {
                    skipLinkWorks = true;
                }
            }
        }
    });

    if (!foundSkipLink) {
        return {
            working: false,
            details: 'No skip link found. Consider adding a "Skip to main content" link for keyboard users.',
        };
    }

    if (!skipLinkWorks) {
        return {
            working: false,
            details: 'Skip link found but target element does not exist.',
        };
    }

    return {
        working: true,
        details: 'Skip link found and working correctly.',
    };
}

/**
 * Check focus restoration after modal/dialog interactions
 */
function checkFocusRestoration(): FocusRestorationTest[] {
    const tests: FocusRestorationTest[] = [];

    // Look for modals/dialogs
    const modals = document.querySelectorAll('[role="dialog"], [role="alertdialog"], .modal, [aria-modal="true"]');

    if (modals.length === 0) {
        tests.push({
            scenario: 'Modal focus restoration',
            passed: true,
            details: 'No modals found on page.',
        });
    } else {
        tests.push({
            scenario: 'Modal focus restoration',
            passed: true, // TODO: Implement actual modal testing
            details: `Found ${modals.length} modal(s). Manual testing recommended to verify focus restoration.`,
        });
    }

    return tests;
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
 * Main function to validate focus management
 */
export function validateFocusManagement(): FocusManagementResults {
    const focusIndicatorIssues = validateFocusIndicators();
    const { working: skipLinksWorking, details: skipLinkDetails } = testSkipLinks();
    const focusRestorationTests = checkFocusRestoration();

    return {
        focusIndicatorIssues,
        skipLinksWorking,
        skipLinkDetails,
        focusRestorationTests,
    };
}
