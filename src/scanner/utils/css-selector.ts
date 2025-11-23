/**
 * Utility functions for CSS selector generation
 */

/**
 * Generate a CSS selector for an element
 */
export function generateCssSelector(element: Element): string {
    if (element.id) {
        return `#${element.id}`;
    }

    const path: string[] = [];
    let current: Element | null = element;

    while (current && current !== document.body) {
        let selector = current.tagName.toLowerCase();

        if (current.className && typeof current.className === 'string') {
            const classes = current.className.trim().split(/\s+/).filter(c => c);
            if (classes.length > 0) {
                selector += '.' + classes.slice(0, 2).join('.');
            }
        }

        path.unshift(selector);

        if (path.length >= 3) break; // Keep selector reasonably short
        current = current.parentElement;
    }

    return path.join(' > ');
}
