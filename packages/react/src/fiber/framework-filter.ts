/**
 * Framework component detection and filtering
 */

// Default React framework component patterns
const DEFAULT_FRAMEWORK_PATTERNS = [
    'React',
    'ReactDOM',
    'Router',
    'Link',
    'Route',
    'Switch',
    'Redirect',
    'Provider',
    'Consumer',
    'Context',
    'Fragment',
    'StrictMode',
    'Suspense',
    'ErrorBoundary',
    'Profiler',
    'Portal',
    // Next.js patterns
    'NextJS',
    'Next',
    'Head',
    'Script',
    'Image',
    'Layout',
    'Loading',
    'Error',
    'NotFound',
    'Template',
    // Common UI frameworks
    'Chakra',
    'MUI',
    'Ant',
    'Radix',
    'HeadlessUI',
];

/**
 * Check if a component name is a framework component
 */
export function isFrameworkComponent(name: string | null): boolean {
    if (!name) return false;

    return DEFAULT_FRAMEWORK_PATTERNS.some(pattern =>
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
