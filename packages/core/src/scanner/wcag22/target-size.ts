/**
 * WCAG 2.5.8 Target Size (Minimum) - Level AA
 *
 * The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except where:
 * - Spacing: Undersized targets have at least 24px circular spacing
 * - Equivalent: Another same-function target meets size requirement
 * - Inline: Target is in a sentence or its size is otherwise constrained by line-height
 * - User Agent Control: Size is determined by user agent and not modified
 * - Essential: Particular presentation is essential to information conveyed
 */

import type { TargetSizeViolation, TargetSizeResult, WCAG22ExceptionType } from './types.js';

const MINIMUM_SIZE = 24; // CSS pixels
const MINIMUM_SPACING = 24; // CSS pixels for spacing exception

// Interactive element selectors
const INTERACTIVE_SELECTORS = [
    'button',
    'a[href]',
    'input:not([type="hidden"])',
    'select',
    'textarea',
    '[role="button"]',
    '[role="link"]',
    '[role="checkbox"]',
    '[role="radio"]',
    '[role="switch"]',
    '[role="tab"]',
    '[role="menuitem"]',
    '[role="menuitemcheckbox"]',
    '[role="menuitemradio"]',
    '[role="option"]',
    '[role="slider"]',
    '[role="spinbutton"]',
    '[tabindex]:not([tabindex="-1"])',
    '[onclick]',
    '[onmousedown]',
    '[onmouseup]',
    '[ontouchstart]',
    '[ontouchend]',
].join(', ');

/**
 * Get a unique CSS selector for an element
 */
function getSelector(element: Element): string {
    if (element.id) {
        return `#${CSS.escape(element.id)}`;
    }

    const path: string[] = [];
    let current: Element | null = element;

    while (current && current !== document.body && current !== document.documentElement) {
        let selector = current.tagName.toLowerCase();

        if (current.className && typeof current.className === 'string') {
            const classes = current.className.split(/\s+/).filter(c => c.length > 0);
            if (classes.length > 0) {
                selector += '.' + classes.map(c => CSS.escape(c)).join('.');
            }
        }

        // Add nth-child for uniqueness
        const parent = current.parentElement;
        if (parent) {
            const siblings = Array.from(parent.children).filter(
                el => el.tagName === current!.tagName
            );
            if (siblings.length > 1) {
                const index = siblings.indexOf(current) + 1;
                selector += `:nth-of-type(${index})`;
            }
        }

        path.unshift(selector);
        current = current.parentElement;
    }

    return path.join(' > ');
}

/**
 * Get truncated HTML snippet
 */
function getHtmlSnippet(element: Element, maxLength: number = 150): string {
    const html = element.outerHTML;
    if (html.length <= maxLength) {
        return html;
    }
    // Find the end of the opening tag
    const openingTagEnd = html.indexOf('>') + 1;
    if (openingTagEnd < maxLength) {
        return html.slice(0, maxLength) + '...';
    }
    return html.slice(0, openingTagEnd) + '...';
}

/**
 * Check if element is inline (in a sentence)
 */
function isInlineElement(element: Element): boolean {
    const style = window.getComputedStyle(element);
    const display = style.display;

    // Check if display is inline or inline-block within text
    if (display === 'inline' || display === 'inline-block') {
        const parent = element.parentElement;
        if (parent) {
            const parentText = parent.textContent || '';
            const elementText = element.textContent || '';
            // If there's text before or after the element, it's inline
            const textWithoutElement = parentText.replace(elementText, '').trim();
            if (textWithoutElement.length > 0) {
                return true;
            }
        }
    }

    // Links in paragraphs are typically inline
    if (element.tagName.toLowerCase() === 'a') {
        const parent = element.parentElement;
        if (parent && ['p', 'span', 'li', 'td', 'th', 'label'].includes(parent.tagName.toLowerCase())) {
            // Check if the link is part of flowing text
            const parentStyle = window.getComputedStyle(parent);
            if (parentStyle.display === 'block' || parentStyle.display === 'list-item' || parentStyle.display === 'table-cell') {
                const siblings = Array.from(parent.childNodes);
                const hasTextSiblings = siblings.some(
                    node => node.nodeType === Node.TEXT_NODE && (node.textContent?.trim().length || 0) > 0
                );
                if (hasTextSiblings) {
                    return true;
                }
            }
        }
    }

    return false;
}

/**
 * Check if element has sufficient spacing from neighbors
 */
function hasSufficientSpacing(element: Element, rect: DOMRect): boolean {
    const interactiveElements = document.querySelectorAll(INTERACTIVE_SELECTORS);

    for (const other of interactiveElements) {
        if (other === element) continue;

        const otherRect = other.getBoundingClientRect();

        // Skip elements that aren't near this one
        if (otherRect.bottom < rect.top - MINIMUM_SPACING ||
            otherRect.top > rect.bottom + MINIMUM_SPACING ||
            otherRect.right < rect.left - MINIMUM_SPACING ||
            otherRect.left > rect.right + MINIMUM_SPACING) {
            continue;
        }

        // Calculate distance between centers
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const otherCenterX = otherRect.left + otherRect.width / 2;
        const otherCenterY = otherRect.top + otherRect.height / 2;

        const distance = Math.sqrt(
            Math.pow(centerX - otherCenterX, 2) +
            Math.pow(centerY - otherCenterY, 2)
        );

        // If any interactive element is within 24px, spacing exception doesn't apply
        if (distance < MINIMUM_SPACING + Math.min(rect.width, rect.height) / 2 + Math.min(otherRect.width, otherRect.height) / 2) {
            return false;
        }
    }

    return true;
}

/**
 * Check if element is controlled by user agent (native form controls)
 */
function isUserAgentControlled(element: Element): boolean {
    const tagName = element.tagName.toLowerCase();

    // Native form controls with default styling
    if (['select', 'input'].includes(tagName)) {
        const type = element.getAttribute('type')?.toLowerCase();
        // These inputs have browser-controlled sizing
        if (['checkbox', 'radio', 'color', 'range', 'file'].includes(type || '')) {
            // Check if custom styling has been applied
            const style = window.getComputedStyle(element);
            const appearance = style.getPropertyValue('appearance') ||
                              style.getPropertyValue('-webkit-appearance') ||
                              style.getPropertyValue('-moz-appearance');

            // If appearance is none, it's been customized
            if (appearance === 'none') {
                return false;
            }
            return true;
        }
    }

    return false;
}

/**
 * Check if element is visible and measurable
 */
function isVisibleAndMeasurable(element: Element): boolean {
    const style = window.getComputedStyle(element);

    if (style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.opacity === '0') {
        return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

/**
 * Check a single element for target size compliance
 */
function checkElement(element: Element): TargetSizeResult {
    const rect = element.getBoundingClientRect();
    const selector = getSelector(element);
    const html = getHtmlSnippet(element);

    const size = {
        width: Math.round(rect.width * 100) / 100,
        height: Math.round(rect.height * 100) / 100
    };

    // Check if meets minimum size
    const meetsRequirement = size.width >= MINIMUM_SIZE && size.height >= MINIMUM_SIZE;

    if (meetsRequirement) {
        return {
            element: element.tagName.toLowerCase(),
            selector,
            html,
            size,
            meetsRequirement: true
        };
    }

    // Check for exceptions
    let exception: WCAG22ExceptionType | undefined;

    // Check inline exception
    if (isInlineElement(element)) {
        exception = 'inline';
    }
    // Check user agent control exception
    else if (isUserAgentControlled(element)) {
        exception = 'user-agent';
    }
    // Check spacing exception
    else if (hasSufficientSpacing(element, rect)) {
        exception = 'spacing';
    }

    // Calculate spacing to nearest interactive element
    const spacing = calculateSpacing(element, rect);

    return {
        element: element.tagName.toLowerCase(),
        selector,
        html,
        size,
        meetsRequirement: !!exception,
        exception,
        spacing
    };
}

/**
 * Calculate spacing to nearest interactive elements
 */
function calculateSpacing(element: Element, rect: DOMRect): { top: number; right: number; bottom: number; left: number } {
    const spacing = {
        top: Infinity,
        right: Infinity,
        bottom: Infinity,
        left: Infinity
    };

    const interactiveElements = document.querySelectorAll(INTERACTIVE_SELECTORS);

    for (const other of interactiveElements) {
        if (other === element) continue;

        const otherRect = other.getBoundingClientRect();

        // Top spacing
        if (otherRect.bottom <= rect.top) {
            spacing.top = Math.min(spacing.top, rect.top - otherRect.bottom);
        }
        // Bottom spacing
        if (otherRect.top >= rect.bottom) {
            spacing.bottom = Math.min(spacing.bottom, otherRect.top - rect.bottom);
        }
        // Left spacing
        if (otherRect.right <= rect.left) {
            spacing.left = Math.min(spacing.left, rect.left - otherRect.right);
        }
        // Right spacing
        if (otherRect.left >= rect.right) {
            spacing.right = Math.min(spacing.right, otherRect.left - rect.right);
        }
    }

    // Convert Infinity to a large number for reporting
    return {
        top: spacing.top === Infinity ? 9999 : Math.round(spacing.top),
        right: spacing.right === Infinity ? 9999 : Math.round(spacing.right),
        bottom: spacing.bottom === Infinity ? 9999 : Math.round(spacing.bottom),
        left: spacing.left === Infinity ? 9999 : Math.round(spacing.left)
    };
}

/**
 * Run target size check on all interactive elements
 */
export function checkTargetSize(): TargetSizeViolation[] {
    const violations: TargetSizeViolation[] = [];
    const elements = document.querySelectorAll(INTERACTIVE_SELECTORS);

    for (const element of elements) {
        // Skip hidden elements
        if (!isVisibleAndMeasurable(element)) {
            continue;
        }

        const result = checkElement(element);

        // If doesn't meet requirement and no exception applies
        if (!result.meetsRequirement) {
            const shortfall = {
                width: Math.max(0, MINIMUM_SIZE - result.size.width),
                height: Math.max(0, MINIMUM_SIZE - result.size.height)
            };

            violations.push({
                id: 'target-size',
                criterion: '2.5.8 Target Size (Minimum)',
                level: 'AA',
                element: result.element,
                selector: result.selector,
                html: result.html,
                impact: shortfall.width > 12 || shortfall.height > 12 ? 'serious' : 'moderate',
                description: `Target size is ${result.size.width}×${result.size.height}px, below the minimum 24×24px`,
                details: {
                    actualSize: result.size,
                    requiredSize: { width: MINIMUM_SIZE, height: MINIMUM_SIZE },
                    shortfall
                },
                exception: result.exception
            });
        }
    }

    return violations;
}

/**
 * Get all target size results (including passing)
 */
export function getAllTargetSizeResults(): TargetSizeResult[] {
    const results: TargetSizeResult[] = [];
    const elements = document.querySelectorAll(INTERACTIVE_SELECTORS);

    for (const element of elements) {
        if (!isVisibleAndMeasurable(element)) {
            continue;
        }

        results.push(checkElement(element));
    }

    return results;
}
