/**
 * WCAG 2.5.7 Dragging Movements - Level AA
 *
 * All functionality that uses a dragging movement for operation can be achieved
 * by a single pointer without dragging, unless dragging is essential or the
 * functionality is determined by the user agent and not modified by the author.
 */

import type { DraggingViolation } from './types.js';

type DragType = 'native' | 'react-beautiful-dnd' | 'dnd-kit' | 'sortablejs' | 'custom';

interface DraggableElement {
    element: Element;
    selector: string;
    html: string;
    dragType: DragType;
    hasAlternative: boolean;
    alternativeElements: Element[];
}

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
 * Detect the type of drag implementation
 */
function detectDragType(element: Element): DragType | null {
    // Check for native HTML5 draggable attribute
    if (element.hasAttribute('draggable') && element.getAttribute('draggable') === 'true') {
        return 'native';
    }

    // Check for event handlers
    if (element.hasAttribute('ondragstart') ||
        element.hasAttribute('ondrag') ||
        element.hasAttribute('ondragend')) {
        return 'native';
    }

    // Check for react-beautiful-dnd
    if (element.hasAttribute('data-rbd-draggable-id') ||
        element.hasAttribute('data-rbd-draggable-context-id') ||
        element.hasAttribute('data-rbd-drag-handle-draggable-id')) {
        return 'react-beautiful-dnd';
    }

    // Check for dnd-kit
    if (element.hasAttribute('data-dnd-sortable') ||
        element.hasAttribute('data-dnd-draggable') ||
        element.className?.toString().includes('dnd-kit')) {
        return 'dnd-kit';
    }

    // Check for SortableJS
    if (element.className?.toString().includes('sortable') ||
        element.hasAttribute('data-sortable') ||
        element.closest('[data-sortable]')) {
        return 'sortablejs';
    }

    // Check for custom drag implementations via CSS cursor
    const style = window.getComputedStyle(element);
    if (style.cursor === 'grab' || style.cursor === 'grabbing' || style.cursor === 'move') {
        return 'custom';
    }

    // Check for drag-related class names
    const className = element.className?.toString().toLowerCase() || '';
    if (className.includes('draggable') ||
        className.includes('drag-handle') ||
        className.includes('sortable-item') ||
        className.includes('reorder')) {
        return 'custom';
    }

    // Check for aria-grabbed (deprecated but still used)
    if (element.hasAttribute('aria-grabbed')) {
        return 'custom';
    }

    return null;
}

/**
 * Find all draggable elements on the page
 */
function findDraggableElements(): Element[] {
    const draggables: Element[] = [];

    // Query for common drag-related attributes and patterns
    const selectors = [
        '[draggable="true"]',
        '[ondragstart]',
        '[ondrag]',
        '[ondragend]',
        '[data-rbd-draggable-id]',
        '[data-rbd-drag-handle-draggable-id]',
        '[data-dnd-sortable]',
        '[data-dnd-draggable]',
        '[data-sortable]',
        '[aria-grabbed]',
        '.draggable',
        '.drag-handle',
        '.sortable-item',
    ];

    const elements = document.querySelectorAll(selectors.join(', '));

    for (const element of elements) {
        // Verify it's actually draggable
        if (detectDragType(element)) {
            draggables.push(element);
        }
    }

    // Also check all elements for cursor: grab/move
    const allElements = document.querySelectorAll('*');
    for (const element of allElements) {
        if (draggables.includes(element)) continue;

        const style = window.getComputedStyle(element);
        if (style.cursor === 'grab' || style.cursor === 'grabbing' || style.cursor === 'move') {
            // Make sure it's visible and interactive
            if (style.display !== 'none' && style.visibility !== 'hidden') {
                const rect = element.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    draggables.push(element);
                }
            }
        }
    }

    return draggables;
}

/**
 * Check if an element has adjacent alternative controls
 */
function findAlternativeControls(element: Element): Element[] {
    const alternatives: Element[] = [];

    // Check within the same parent
    const parent = element.parentElement;
    if (!parent) return alternatives;

    // Look for buttons with move/reorder functionality
    const movePatterns = [
        /move[-_]?up/i,
        /move[-_]?down/i,
        /move[-_]?left/i,
        /move[-_]?right/i,
        /reorder/i,
        /sort/i,
        /↑|↓|←|→|▲|▼|◀|▶/,
        /arrow[-_]?up/i,
        /arrow[-_]?down/i,
    ];

    // Check siblings and descendants of parent
    const searchArea = parent.parentElement || parent;
    const buttons = searchArea.querySelectorAll('button, [role="button"], a[href]');

    for (const button of buttons) {
        const text = button.textContent?.toLowerCase() || '';
        const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
        const className = button.className?.toString().toLowerCase() || '';
        const title = button.getAttribute('title')?.toLowerCase() || '';

        const allText = `${text} ${ariaLabel} ${className} ${title}`;

        if (movePatterns.some(pattern => pattern.test(allText))) {
            alternatives.push(button);
        }
    }

    // Check for input fields that might control position
    const inputs = searchArea.querySelectorAll('input[type="number"], select');
    for (const input of inputs) {
        const name = input.getAttribute('name')?.toLowerCase() || '';
        const ariaLabel = input.getAttribute('aria-label')?.toLowerCase() || '';
        const placeholder = input.getAttribute('placeholder')?.toLowerCase() || '';

        if (/position|order|rank|index|priority/.test(`${name} ${ariaLabel} ${placeholder}`)) {
            alternatives.push(input);
        }
    }

    return alternatives;
}

/**
 * Check if element is part of a sortable list with keyboard support
 */
function hasKeyboardSupport(element: Element): boolean {
    // Check for aria-keyshortcuts
    if (element.hasAttribute('aria-keyshortcuts')) {
        return true;
    }

    // Check for role with expected keyboard interaction
    const role = element.getAttribute('role');
    if (role === 'listbox' || role === 'tree' || role === 'grid') {
        return true; // These roles have expected keyboard patterns
    }

    // Check parent for keyboard support indicators
    const parent = element.closest('[role="listbox"], [role="tree"], [role="grid"], [aria-keyshortcuts]');
    if (parent) {
        return true;
    }

    // Check for tabindex that would enable keyboard focus
    const tabindex = element.getAttribute('tabindex');
    if (tabindex && tabindex !== '-1') {
        // Element is focusable, check for keyboard event handlers
        // Note: We can't reliably detect JS event listeners, but we can check attributes
        if (element.hasAttribute('onkeydown') || element.hasAttribute('onkeyup')) {
            return true;
        }
    }

    return false;
}

/**
 * Get suggested alternatives for a draggable element
 */
function getSuggestedAlternatives(dragType: DragType): string[] {
    const common = [
        'Add up/down arrow buttons for reordering',
        'Provide a numeric input field for position',
        'Add a "move to position" dropdown'
    ];

    switch (dragType) {
        case 'react-beautiful-dnd':
            return [
                ...common,
                'Enable keyboard mode (Space to pick up, arrow keys to move, Space to drop)',
                'Use @hello-pangea/dnd which has better accessibility'
            ];
        case 'dnd-kit':
            return [
                ...common,
                'Enable dnd-kit\'s built-in keyboard support with KeyboardSensor',
                'Add announcements for screen readers using useDndMonitor'
            ];
        case 'sortablejs':
            return [
                ...common,
                'Consider a library with better keyboard support'
            ];
        default:
            return common;
    }
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
 * Analyze a draggable element for alternatives
 */
function analyzeDraggable(element: Element): DraggableElement | null {
    const dragType = detectDragType(element);
    if (!dragType) return null;

    const selector = getSelector(element);
    const html = getHtmlSnippet(element);
    const alternativeElements = findAlternativeControls(element);
    const hasKeyboard = hasKeyboardSupport(element);

    return {
        element,
        selector,
        html,
        dragType,
        hasAlternative: alternativeElements.length > 0 || hasKeyboard,
        alternativeElements
    };
}

/**
 * Run dragging movements check
 */
export function checkDraggingMovements(): DraggingViolation[] {
    const violations: DraggingViolation[] = [];
    const draggableElements = findDraggableElements();

    for (const element of draggableElements) {
        if (!isElementVisible(element)) {
            continue;
        }

        const analysis = analyzeDraggable(element);
        if (!analysis) continue;

        // If no alternative exists, it's a violation
        if (!analysis.hasAlternative) {
            violations.push({
                id: 'dragging-movement',
                criterion: '2.5.7 Dragging Movements',
                level: 'AA',
                element: element.tagName.toLowerCase(),
                selector: analysis.selector,
                html: analysis.html,
                impact: 'serious',
                description: `Draggable element (${analysis.dragType}) has no single-pointer alternative`,
                details: {
                    dragType: analysis.dragType,
                    hasAlternative: false,
                    suggestedAlternatives: getSuggestedAlternatives(analysis.dragType)
                }
            });
        }
    }

    return violations;
}

/**
 * Get information about all draggable elements
 */
export function getDraggableElements(): Array<{
    selector: string;
    dragType: DragType;
    hasAlternative: boolean;
    alternatives: string[];
}> {
    const results: Array<{
        selector: string;
        dragType: DragType;
        hasAlternative: boolean;
        alternatives: string[];
    }> = [];

    const draggableElements = findDraggableElements();

    for (const element of draggableElements) {
        if (!isElementVisible(element)) {
            continue;
        }

        const analysis = analyzeDraggable(element);
        if (!analysis) continue;

        results.push({
            selector: analysis.selector,
            dragType: analysis.dragType,
            hasAlternative: analysis.hasAlternative,
            alternatives: analysis.alternativeElements.map(el => getSelector(el))
        });
    }

    return results;
}
