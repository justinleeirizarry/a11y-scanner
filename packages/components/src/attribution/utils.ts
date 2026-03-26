/**
 * Utility functions for CSS selectors, HTML snippets, and component filtering.
 * Framework-agnostic — works with any UI framework.
 */

/**
 * Generate a CSS selector for an element.
 * Tries ID first, then builds a path with classes and nth-of-type.
 */
export function generateCssSelector(element: Element): string {
    if (element.id) {
        return `#${CSS.escape(element.id)}`;
    }

    const path: string[] = [];
    let current: Element | null = element;

    while (current && current !== document.documentElement) {
        let selector = current.tagName.toLowerCase();

        if (current.id) {
            selector = `#${CSS.escape(current.id)}`;
            path.unshift(selector);
            break;
        }

        if (current.classList.length > 0) {
            const classes = Array.from(current.classList)
                .slice(0, 2)
                .map(c => `.${CSS.escape(c)}`)
                .join('');
            selector += classes;
        }

        const parent = current.parentElement;
        if (parent) {
            const siblings = Array.from(parent.children).filter(
                child => child.tagName === current!.tagName
            );
            if (siblings.length > 1) {
                const index = siblings.indexOf(current) + 1;
                selector += `:nth-of-type(${index})`;
            }
        }

        path.unshift(selector);
        current = current.parentElement;

        if (path.length >= 4) break;
    }

    return path.join(' > ');
}

/**
 * Extract a readable HTML snippet, truncated for display.
 */
export function extractHtmlSnippet(html: string, maxLength: number = 100): string {
    if (!html) return '';
    let snippet = html.replace(/\s+/g, ' ').trim();
    if (snippet.length > maxLength) {
        const firstTagEnd = snippet.indexOf('>');
        if (firstTagEnd !== -1 && firstTagEnd < maxLength - 3) {
            const afterTag = snippet.substring(firstTagEnd + 1);
            if (afterTag.trim().length > maxLength - firstTagEnd - 10) {
                snippet = snippet.substring(0, firstTagEnd + 1) + '...';
            } else {
                snippet = snippet.substring(0, maxLength - 3) + '...';
            }
        } else {
            snippet = snippet.substring(0, maxLength - 3) + '...';
        }
    }
    return snippet;
}

/**
 * Clean webpack/bundler prefixes from file paths.
 */
export function cleanFilePath(filePath: string): string {
    let p = filePath;
    p = p.replace(/^_N_E\//, '');
    p = p.replace(/^\.\//, '');
    const parts = p.split('/');
    const firstReal = parts.findIndex(s => s !== '..' && s !== '.');
    if (firstReal > 0) {
        p = parts.slice(firstReal).join('/');
    }
    return p;
}

/**
 * Known framework/library component patterns that should be filtered
 * from user component paths.
 */
const FRAMEWORK_PATTERNS = [
    // React
    'React', 'ReactDOM', 'Fragment', 'StrictMode', 'Suspense', 'ErrorBoundary', 'Profiler', 'Portal',
    'Provider', 'Consumer', 'Context',
    // React Router
    'Router', 'Link', 'Route', 'Switch', 'Redirect',
    // Next.js
    'NextJS', 'Next', 'Head', 'Script', 'Image', 'Layout', 'Loading', 'Error', 'NotFound', 'Template',
    // Vue
    'Transition', 'TransitionGroup', 'KeepAlive', 'Teleport',
    // Common UI frameworks
    'Chakra', 'MUI', 'Ant', 'Radix', 'HeadlessUI',
];

/**
 * Check if a component name belongs to a framework/library (not user code).
 */
export function isFrameworkComponent(name: string | null): boolean {
    if (!name) return false;
    return FRAMEWORK_PATTERNS.some(pattern =>
        name === pattern ||
        name.startsWith(pattern + '.') ||
        name.includes('ErrorBoundary') ||
        name.includes('Suspense') ||
        name.startsWith('_')
    );
}

/**
 * Filter a component path to only user-defined components.
 */
export function filterUserComponents(path: string[]): string[] {
    return path.filter(name => !isFrameworkComponent(name));
}
