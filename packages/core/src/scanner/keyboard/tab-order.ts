/**
 * Tab order validation - tests keyboard navigation flow
 */
import type { SeverityLevel } from '../../types.js';

export interface TabOrderViolation {
    type: 'tab-trap' | 'illogical-order' | 'tabindex-antipattern' | 'hidden-focusable';
    element: string;
    details: string;
    severity: SeverityLevel;
}

export interface FocusableElement {
    element: HTMLElement;
    selector: string;
    tabIndex: number;
    domIndex: number;
    visualPosition: { x: number; y: number };
    isVisible: boolean;
}

export interface TabOrderResults {
    totalFocusableElements: number;
    tabOrder: Array<{
        selector: string;
        tabIndex: number;
        position: { x: number; y: number };
    }>;
    violations: TabOrderViolation[];
    visualOrderMismatches: Array<{
        domIndex: number;
        visualIndex: number;
        element: string;
    }>;
}

/**
 * Get all focusable elements in the document
 */
function getFocusableElements(): FocusableElement[] {
    const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        'audio[controls]',
        'video[controls]',
        '[contenteditable]:not([contenteditable="false"])',
    ];

    const elements = document.querySelectorAll(focusableSelectors.join(','));
    const focusableElements: FocusableElement[] = [];

    elements.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        const rect = htmlEl.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0 &&
            window.getComputedStyle(htmlEl).visibility !== 'hidden';

        focusableElements.push({
            element: htmlEl,
            selector: generateSelector(htmlEl),
            tabIndex: htmlEl.tabIndex,
            domIndex: index,
            visualPosition: {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            },
            isVisible,
        });
    });

    return focusableElements;
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
 * Check for tab index anti-patterns
 */
function checkTabIndexAntiPatterns(elements: FocusableElement[]): TabOrderViolation[] {
    const violations: TabOrderViolation[] = [];

    elements.forEach(({ element, selector, tabIndex }) => {
        // tabindex > 0 is an anti-pattern
        if (tabIndex > 0) {
            violations.push({
                type: 'tabindex-antipattern',
                element: selector,
                details: `Element has tabindex="${tabIndex}". Positive tabindex values create unpredictable tab order and should be avoided. Use tabindex="0" or rely on DOM order.`,
                severity: 'serious',
            });
        }

        // Hidden elements that are focusable
        const style = window.getComputedStyle(element);
        if ((style.display === 'none' || style.visibility === 'hidden') && tabIndex >= 0) {
            violations.push({
                type: 'hidden-focusable',
                element: selector,
                details: 'Element is hidden but still focusable. This can confuse keyboard users.',
                severity: 'moderate',
            });
        }
    });

    return violations;
}

/**
 * Detect tab traps by simulating tab navigation
 */
function detectTabTraps(elements: FocusableElement[]): TabOrderViolation[] {
    const violations: TabOrderViolation[] = [];
    const visitedElements = new Set<HTMLElement>();
    let currentIndex = 0;
    const maxIterations = elements.length * 2; // Safety limit

    for (let i = 0; i < maxIterations && currentIndex < elements.length; i++) {
        const current = elements[currentIndex];

        if (visitedElements.has(current.element)) {
            // We've looped back - potential tab trap
            violations.push({
                type: 'tab-trap',
                element: current.selector,
                details: 'Potential tab trap detected. Users may not be able to navigate past this element using Tab key.',
                severity: 'critical',
            });
            break;
        }

        visitedElements.add(current.element);
        currentIndex++;
    }

    return violations;
}

/**
 * Verify logical tab order by comparing DOM order with visual order
 */
function verifyLogicalOrder(elements: FocusableElement[]): {
    violations: TabOrderViolation[];
    mismatches: Array<{ domIndex: number; visualIndex: number; element: string }>;
} {
    const violations: TabOrderViolation[] = [];
    const mismatches: Array<{ domIndex: number; visualIndex: number; element: string }> = [];

    // Filter to visible elements only
    const visibleElements = elements.filter(el => el.isVisible);

    // Sort by visual position (top to bottom, left to right)
    const visuallySorted = [...visibleElements].sort((a, b) => {
        const yDiff = a.visualPosition.y - b.visualPosition.y;
        if (Math.abs(yDiff) > 10) { // 10px threshold for same row
            return yDiff;
        }
        return a.visualPosition.x - b.visualPosition.x;
    });

    // Compare DOM order with visual order
    visibleElements.forEach((element, domIndex) => {
        const visualIndex = visuallySorted.indexOf(element);
        const orderDifference = Math.abs(domIndex - visualIndex);

        // If the difference is significant (more than 2 positions)
        if (orderDifference > 2) {
            mismatches.push({
                domIndex,
                visualIndex,
                element: element.selector,
            });
        }
    });

    // If we have significant mismatches, create a violation
    if (mismatches.length > 3) {
        violations.push({
            type: 'illogical-order',
            element: 'document',
            details: `Tab order doesn't follow visual layout. ${mismatches.length} elements are out of logical order. This can confuse keyboard users.`,
            severity: 'serious',
        });
    }

    return { violations, mismatches };
}

/**
 * Main function to validate tab order
 */
export function validateTabOrder(): TabOrderResults {
    const focusableElements = getFocusableElements();
    const violations: TabOrderViolation[] = [];

    // Check for anti-patterns
    violations.push(...checkTabIndexAntiPatterns(focusableElements));

    // Detect tab traps
    violations.push(...detectTabTraps(focusableElements));

    // Verify logical order
    const { violations: orderViolations, mismatches } = verifyLogicalOrder(focusableElements);
    violations.push(...orderViolations);

    // Build tab order array
    const tabOrder = focusableElements
        .filter(el => el.isVisible)
        .map(el => ({
            selector: el.selector,
            tabIndex: el.tabIndex,
            position: el.visualPosition,
        }));

    return {
        totalFocusableElements: focusableElements.length,
        tabOrder,
        violations,
        visualOrderMismatches: mismatches,
    };
}
