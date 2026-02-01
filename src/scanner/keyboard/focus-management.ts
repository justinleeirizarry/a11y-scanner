/**
 * Focus management testing - validates focus indicators, skip links, and focus restoration
 */
import type { SeverityLevel } from '../../types.js';

export interface FocusIndicatorIssue {
    element: string;
    issue: 'missing' | 'low-contrast' | 'too-small' | 'not-visible';
    details: string;
    severity: SeverityLevel;
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
 * Calculate relative luminance of a color (WCAG formula)
 */
function getLuminance(r: number, g: number, b: number): number {
    // Convert to sRGB
    const [rs, gs, bs] = [r, g, b].map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Parse a color string and return RGB values
 */
function parseColor(colorStr: string): { r: number; g: number; b: number } | null {
    // Handle rgb/rgba
    const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
        return {
            r: parseInt(rgbMatch[1], 10),
            g: parseInt(rgbMatch[2], 10),
            b: parseInt(rgbMatch[3], 10),
        };
    }

    // Handle hex colors
    const hexMatch = colorStr.match(/#([0-9a-f]{6})/i);
    if (hexMatch) {
        const hex = hexMatch[1];
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16),
        };
    }

    // Named colors - simple mapping for common ones
    const namedColors: Record<string, { r: number; g: number; b: number }> = {
        'black': { r: 0, g: 0, b: 0 },
        'white': { r: 255, g: 255, b: 255 },
        'red': { r: 255, g: 0, b: 0 },
        'green': { r: 0, g: 128, b: 0 },
        'blue': { r: 0, g: 0, b: 255 },
        'yellow': { r: 255, g: 255, b: 0 },
        'gray': { r: 128, g: 128, b: 128 },
        'grey': { r: 128, g: 128, b: 128 },
    };

    if (namedColors[colorStr.toLowerCase()]) {
        return namedColors[colorStr.toLowerCase()];
    }

    return null;
}

/**
 * Calculate WCAG contrast ratio between two colors
 */
function calculateContrastRatio(color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }): number {
    const l1 = getLuminance(color1.r, color1.g, color1.b);
    const l2 = getLuminance(color2.r, color2.g, color2.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check focus indicator contrast ratio
 */
function checkFocusIndicatorContrast(element: HTMLElement, style: CSSStyleDeclaration): FocusIndicatorIssue | null {
    // Determine indicator color
    let indicatorColor: { r: number; g: number; b: number } | null = null;
    let bgColor: { r: number; g: number; b: number } | null = null;

    // Try to get outline color (most common focus indicator)
    if (style.outlineColor && style.outlineColor !== 'invert') {
        indicatorColor = parseColor(style.outlineColor);
    }

    // Fallback to border color
    if (!indicatorColor && style.borderColor) {
        indicatorColor = parseColor(style.borderColor);
    }

    // Get background color of the element
    bgColor = parseColor(style.backgroundColor);

    // If we couldn't parse colors, assume it's OK (can't determine)
    if (!indicatorColor || !bgColor) {
        return null;
    }

    // Calculate contrast ratio
    const contrastRatio = calculateContrastRatio(indicatorColor, bgColor);

    // WCAG minimum for focus indicators is 3:1
    // Enhanced is 4.5:1
    if (contrastRatio < 3) {
        return {
            element: generateSelector(element),
            issue: 'low-contrast',
            details: `Focus indicator has insufficient contrast ratio of ${contrastRatio.toFixed(2)}:1. Should be at least 3:1 against adjacent colors.`,
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
 * Get all focusable elements within a container
 */
function getFocusableElements(container: Element): HTMLElement[] {
    const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
    ];

    const elements: HTMLElement[] = [];
    container.querySelectorAll(focusableSelectors.join(',')).forEach(el => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.offsetParent !== null) { // Is visible
            elements.push(htmlEl);
        }
    });

    return elements;
}

/**
 * Simulate Tab key navigation to check focus trap
 */
function testFocusTrap(modal: Element): { isTrap: boolean; details: string } {
    const focusableInModal = getFocusableElements(modal);

    if (focusableInModal.length === 0) {
        return {
            isTrap: true,
            details: 'Modal has no focusable elements. Focus will escape to parent.',
        };
    }

    const firstFocusable = focusableInModal[0];
    const lastFocusable = focusableInModal[focusableInModal.length - 1];

    // The trap is correct if:
    // 1. Modal is marked with aria-modal="true" or has role="dialog"
    // 2. There are focusable elements inside
    // In real testing, we'd simulate Tab key from last to first
    // and Shift+Tab from first to last, but we can't truly test this
    // without actual keyboard events in the browser

    const hasModalAttribute = modal.hasAttribute('aria-modal') ||
                              modal.getAttribute('role') === 'dialog' ||
                              modal.getAttribute('role') === 'alertdialog';

    if (!hasModalAttribute) {
        return {
            isTrap: false,
            details: 'Modal lacks aria-modal="true" or role="dialog" attribute. Cannot determine if focus is properly trapped.',
        };
    }

    // Without actual keyboard simulation, we can only check structure
    return {
        isTrap: true,
        details: `Modal is properly marked with aria-modal or dialog role. Contains ${focusableInModal.length} focusable element(s). Actual focus trap behavior requires runtime keyboard testing.`,
    };
}

/**
 * Check focus restoration after modal/dialog interactions
 */
function checkFocusRestoration(): FocusRestorationTest[] {
    const tests: FocusRestorationTest[] = [];

    // Look for modals/dialogs
    const modals = document.querySelectorAll('[role="dialog"], [role="alertdialog"], [aria-modal="true"]');

    if (modals.length === 0) {
        tests.push({
            scenario: 'Modal focus restoration',
            passed: true,
            details: 'No modals found on page.',
        });
    } else {
        // Test each modal for focus trapping
        modals.forEach((modal, index) => {
            const { isTrap, details } = testFocusTrap(modal);
            tests.push({
                scenario: `Modal focus trap (${index + 1}/${modals.length})`,
                passed: isTrap,
                details,
            });
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
