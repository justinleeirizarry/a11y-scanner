/**
 * WCAG 1.3.2 Meaningful Sequence - Level A
 *
 * When the sequence in which content is presented affects its meaning,
 * a correct reading sequence can be programmatically determined.
 *
 * This checker detects two common patterns that break meaningful sequence:
 * 1. CSS `order` property on flex/grid items that reorders visual presentation
 * 2. `tabindex` > 0 that overrides natural tab order
 */

import type { WCAG22Violation } from './types.js';

type MeaningfulSequenceViolation = WCAG22Violation;

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
 * Check if element is visible
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
 * Check if an element is a flex or grid item whose parent uses flex/grid layout
 */
function isFlexOrGridItem(element: Element): boolean {
    const parent = element.parentElement;
    if (!parent) return false;

    const parentStyle = window.getComputedStyle(parent);
    const display = parentStyle.display;

    return display === 'flex' || display === 'inline-flex' ||
           display === 'grid' || display === 'inline-grid';
}

/**
 * Find elements using CSS `order` property that changes visual order from DOM order
 */
function findCssOrderViolations(): Array<{
    element: Element;
    orderValue: number;
    parentDisplay: string;
}> {
    const results: Array<{
        element: Element;
        orderValue: number;
        parentDisplay: string;
    }> = [];

    const allElements = document.querySelectorAll('*');

    for (const element of allElements) {
        if (!isElementVisible(element)) continue;
        if (!isFlexOrGridItem(element)) continue;

        const style = window.getComputedStyle(element);
        const order = parseInt(style.order, 10);

        if (order !== 0 && !isNaN(order)) {
            const parentStyle = window.getComputedStyle(element.parentElement!);
            results.push({
                element,
                orderValue: order,
                parentDisplay: parentStyle.display
            });
        }
    }

    return results;
}

/**
 * Find elements with tabindex > 0 that override natural tab order
 */
function findTabindexViolations(): Array<{
    element: Element;
    tabindexValue: number;
}> {
    const results: Array<{
        element: Element;
        tabindexValue: number;
    }> = [];

    const elements = document.querySelectorAll('[tabindex]');

    for (const element of elements) {
        if (!isElementVisible(element)) continue;

        const tabindex = parseInt(element.getAttribute('tabindex') || '0', 10);

        if (tabindex > 0) {
            results.push({
                element,
                tabindexValue: tabindex
            });
        }
    }

    return results;
}

/**
 * Run meaningful sequence check
 */
export function checkMeaningfulSequence(): MeaningfulSequenceViolation[] {
    const violations: MeaningfulSequenceViolation[] = [];

    // Check for CSS order reordering
    const orderViolations = findCssOrderViolations();
    for (const { element, orderValue, parentDisplay } of orderViolations) {
        violations.push({
            id: 'meaningful-sequence',
            criterion: '1.3.2 Meaningful Sequence',
            level: 'A',
            element: element.tagName.toLowerCase(),
            selector: getSelector(element),
            html: getHtmlSnippet(element),
            impact: 'serious',
            description: `Element uses CSS order: ${orderValue} in a ${parentDisplay} container, which may cause visual order to differ from DOM order`,
            details: {
                type: 'css-order',
                orderValue,
                parentDisplay
            }
        });
    }

    // Check for tabindex > 0
    const tabindexViolations = findTabindexViolations();
    for (const { element, tabindexValue } of tabindexViolations) {
        violations.push({
            id: 'meaningful-sequence',
            criterion: '1.3.2 Meaningful Sequence',
            level: 'A',
            element: element.tagName.toLowerCase(),
            selector: getSelector(element),
            html: getHtmlSnippet(element),
            impact: 'moderate',
            description: `Element uses tabindex="${tabindexValue}" which overrides natural tab order and may break meaningful sequence`,
            details: {
                type: 'tabindex',
                tabindexValue
            }
        });
    }

    return violations;
}

/**
 * Get information about meaningful sequence issues on the page
 */
export function getMeaningfulSequenceInfo(): Array<{
    type: 'css-order' | 'tabindex';
    selector: string;
    value: number;
    parentDisplay?: string;
}> {
    const results: Array<{
        type: 'css-order' | 'tabindex';
        selector: string;
        value: number;
        parentDisplay?: string;
    }> = [];

    for (const { element, orderValue, parentDisplay } of findCssOrderViolations()) {
        results.push({
            type: 'css-order',
            selector: getSelector(element),
            value: orderValue,
            parentDisplay
        });
    }

    for (const { element, tabindexValue } of findTabindexViolations()) {
        results.push({
            type: 'tabindex',
            selector: getSelector(element),
            value: tabindexValue
        });
    }

    return results;
}
