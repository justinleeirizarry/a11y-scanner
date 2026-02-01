/**
 * Framework component detection and filtering
 */

import { DEFAULT_CONFIG } from '../../config/index.js';

/**
 * Check if a component name is a framework component
 */
export function isFrameworkComponent(name: string | null): boolean {
    if (!name) return false;

    const patterns = DEFAULT_CONFIG.framework.patterns;

    return patterns.some(pattern =>
        name === pattern ||
        name.startsWith(pattern + '.') ||
        name.includes('ErrorBoundary') ||
        name.includes('Suspense') ||
        name.startsWith('_')
    );
}

/**
 * Filter component path to show only user components
 */
export function filterUserComponents(path: string[]): string[] {
    return path.filter(name => !isFrameworkComponent(name));
}
