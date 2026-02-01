/**
 * WCAG 2.4.11 Focus Not Obscured (Minimum) - Level AA
 *
 * When a user interface component receives keyboard focus, the component is not
 * entirely hidden due to author-created content.
 *
 * WCAG 2.4.12 Focus Not Obscured (Enhanced) - Level AAA
 * No part of the focus indicator is hidden by author-created content.
 */

import type { FocusObscuredViolation } from './types.js';

type ObscuringType = 'sticky-header' | 'sticky-footer' | 'fixed' | 'modal' | 'overlay' | 'cookie-banner';

interface OverlayElement {
    element: Element;
    rect: DOMRect;
    type: ObscuringType;
    zIndex: number;
}

// Focusable element selectors
const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
    'details summary',
    'audio[controls]',
    'video[controls]',
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
    const openingTagEnd = html.indexOf('>') + 1;
    if (openingTagEnd < maxLength) {
        return html.slice(0, maxLength) + '...';
    }
    return html.slice(0, openingTagEnd) + '...';
}

/**
 * Detect the type of overlay/fixed element
 */
function detectOverlayType(element: Element, rect: DOMRect): ObscuringType {
    const viewportHeight = window.innerHeight;
    const style = window.getComputedStyle(element);

    // Check class names and attributes for common patterns
    const classNames = element.className?.toString().toLowerCase() || '';
    const id = element.id?.toLowerCase() || '';
    const role = element.getAttribute('role')?.toLowerCase() || '';

    // Cookie banner detection
    if (classNames.includes('cookie') || classNames.includes('consent') ||
        classNames.includes('gdpr') || id.includes('cookie') ||
        id.includes('consent') || id.includes('gdpr')) {
        return 'cookie-banner';
    }

    // Modal detection
    if (role === 'dialog' || role === 'alertdialog' ||
        classNames.includes('modal') || classNames.includes('dialog') ||
        element.hasAttribute('aria-modal')) {
        return 'modal';
    }

    // Overlay detection
    if (classNames.includes('overlay') || classNames.includes('backdrop') ||
        classNames.includes('lightbox')) {
        return 'overlay';
    }

    // Position-based detection
    const position = style.position;

    if (position === 'sticky') {
        // Sticky header vs footer based on position
        if (rect.top < viewportHeight / 2) {
            return 'sticky-header';
        }
        return 'sticky-footer';
    }

    if (position === 'fixed') {
        // Check if it's at the top or bottom
        const top = parseInt(style.top, 10);
        const bottom = parseInt(style.bottom, 10);

        if (!isNaN(top) && top < 100) {
            return 'sticky-header';
        }
        if (!isNaN(bottom) && bottom < 100) {
            return 'sticky-footer';
        }

        // Large fixed elements are likely modals/overlays
        if (rect.width > window.innerWidth * 0.5 && rect.height > viewportHeight * 0.5) {
            return 'modal';
        }

        return 'fixed';
    }

    return 'overlay';
}

/**
 * Find all elements that could obscure focused content
 */
function findOverlayElements(): OverlayElement[] {
    const overlays: OverlayElement[] = [];
    const allElements = document.querySelectorAll('*');

    for (const element of allElements) {
        const style = window.getComputedStyle(element);
        const position = style.position;

        // Check for fixed or sticky positioning
        if (position !== 'fixed' && position !== 'sticky') {
            continue;
        }

        // Skip hidden elements
        if (style.display === 'none' || style.visibility === 'hidden') {
            continue;
        }

        const rect = element.getBoundingClientRect();

        // Skip very small elements
        if (rect.width < 10 || rect.height < 10) {
            continue;
        }

        const zIndex = parseInt(style.zIndex, 10) || 0;
        const type = detectOverlayType(element, rect);

        overlays.push({
            element,
            rect,
            type,
            zIndex
        });
    }

    // Sort by z-index (highest first)
    return overlays.sort((a, b) => b.zIndex - a.zIndex);
}

/**
 * Calculate the percentage of element A that is obscured by element B
 */
function calculateObscuredPercentage(focusedRect: DOMRect, overlayRect: DOMRect): number {
    // Calculate intersection
    const intersectLeft = Math.max(focusedRect.left, overlayRect.left);
    const intersectRight = Math.min(focusedRect.right, overlayRect.right);
    const intersectTop = Math.max(focusedRect.top, overlayRect.top);
    const intersectBottom = Math.min(focusedRect.bottom, overlayRect.bottom);

    // Check if there's an intersection
    if (intersectLeft >= intersectRight || intersectTop >= intersectBottom) {
        return 0;
    }

    const intersectArea = (intersectRight - intersectLeft) * (intersectBottom - intersectTop);
    const focusedArea = focusedRect.width * focusedRect.height;

    if (focusedArea === 0) return 0;

    return (intersectArea / focusedArea) * 100;
}

/**
 * Check if element is visible (not display:none, visibility:hidden, etc)
 */
function isElementVisible(element: Element): boolean {
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
 * Check a single focusable element for obscuration
 */
function checkElementObscuration(
    element: Element,
    overlays: OverlayElement[],
    checkEnhanced: boolean = false
): FocusObscuredViolation | null {
    const rect = element.getBoundingClientRect();

    // Skip elements not in viewport
    if (rect.bottom < 0 || rect.top > window.innerHeight ||
        rect.right < 0 || rect.left > window.innerWidth) {
        return null;
    }

    for (const overlay of overlays) {
        // Skip if the focused element is inside the overlay
        if (overlay.element.contains(element)) {
            continue;
        }

        const percentage = calculateObscuredPercentage(rect, overlay.rect);

        // WCAG 2.4.11 (AA): Fail if 100% obscured (entirely hidden)
        // WCAG 2.4.12 (AAA): Fail if any part is obscured
        const threshold = checkEnhanced ? 0 : 100;

        if (percentage > threshold) {
            return {
                id: 'focus-obscured',
                criterion: checkEnhanced ? '2.4.12 Focus Not Obscured (Enhanced)' : '2.4.11 Focus Not Obscured (Minimum)',
                level: checkEnhanced ? 'AAA' : 'AA',
                element: element.tagName.toLowerCase(),
                selector: getSelector(element),
                html: getHtmlSnippet(element),
                impact: percentage >= 100 ? 'critical' : percentage > 50 ? 'serious' : 'moderate',
                description: `Element is ${Math.round(percentage)}% obscured by ${overlay.type} when focused`,
                details: {
                    focusedElementRect: {
                        top: rect.top,
                        left: rect.left,
                        bottom: rect.bottom,
                        right: rect.right,
                        width: rect.width,
                        height: rect.height
                    },
                    obscuringElement: getSelector(overlay.element),
                    obscuringType: overlay.type,
                    obscuringRect: {
                        top: overlay.rect.top,
                        left: overlay.rect.left,
                        bottom: overlay.rect.bottom,
                        right: overlay.rect.right,
                        width: overlay.rect.width,
                        height: overlay.rect.height
                    },
                    percentageObscured: Math.round(percentage * 100) / 100
                }
            };
        }
    }

    return null;
}

/**
 * Run focus not obscured check on all focusable elements
 * @param checkEnhanced If true, check for WCAG 2.4.12 (AAA) - any obscuration fails
 */
export function checkFocusNotObscured(checkEnhanced: boolean = false): FocusObscuredViolation[] {
    const violations: FocusObscuredViolation[] = [];

    // Find all overlay elements
    const overlays = findOverlayElements();

    // If no overlays, no violations possible
    if (overlays.length === 0) {
        return violations;
    }

    // Check all focusable elements
    const focusableElements = document.querySelectorAll(FOCUSABLE_SELECTORS);

    for (const element of focusableElements) {
        // Skip hidden elements
        if (!isElementVisible(element)) {
            continue;
        }

        const violation = checkElementObscuration(element, overlays, checkEnhanced);
        if (violation) {
            violations.push(violation);
        }
    }

    return violations;
}

/**
 * Get information about all overlay elements on the page
 */
export function getOverlayInfo(): Array<{
    selector: string;
    type: ObscuringType;
    rect: { top: number; left: number; width: number; height: number };
    zIndex: number;
}> {
    return findOverlayElements().map(overlay => ({
        selector: getSelector(overlay.element),
        type: overlay.type,
        rect: {
            top: overlay.rect.top,
            left: overlay.rect.left,
            width: overlay.rect.width,
            height: overlay.rect.height
        },
        zIndex: overlay.zIndex
    }));
}
