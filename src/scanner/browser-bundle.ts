/**
 * This file gets bundled and injected into the browser page
 * It runs in the browser context and uses Bippy + axe-core
 */

// @ts-ignore - these will be bundled
import axe from 'axe-core';
// @ts-ignore - Bippy utilities for better fiber handling
import { getDisplayName, isHostFiber, isCompositeFiber } from 'bippy/core';

declare global {
    interface Window {
        ReactA11yScanner: {
            scan: () => Promise<any>;
        };
        __REACT_DEVTOOLS_GLOBAL_HOOK__: {
            getFiberRoots: (id: number) => Set<any>;
        };
    }
}

interface FiberNode {
    type: any;
    stateNode: any;
    child: FiberNode | null;
    sibling: FiberNode | null;
    return: FiberNode | null;
    elementType: any;
    memoizedProps: any;
    _debugSource?: {
        fileName: string;
        lineNumber: number;
    };
    // Add common fiber properties for better type safety
    tag?: number;
    key?: string | null;
    index?: number;
}

interface ComponentInfo {
    name: string;
    type: string;
    displayName?: string;
    props?: Record<string, any>;
    domNode?: Element | null;
    path: string[];
}

interface AxeViolation {
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    help: string;
    helpUrl: string;
    nodes: Array<{
        html: string;
        target: string[];
        failureSummary: string;
    }>;
}

interface FixSuggestion {
    summary: string;
    details: string;
    codeExample?: string;
}

interface AttributedViolationNode {
    component: string | null;
    componentPath: string[];
    userComponentPath: string[];
    componentType: 'host' | 'component' | null;
    html: string;
    htmlSnippet: string;
    cssSelector: string;
    target: string[];
    failureSummary: string;
    isFrameworkComponent: boolean;
}

interface AttributedViolation {
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    help: string;
    helpUrl: string;
    nodes: AttributedViolationNode[];
    fixSuggestion?: FixSuggestion;
}

/**
 * Framework component patterns to filter out
 */
const FRAMEWORK_PATTERNS = [
    // Next.js
    'ServerRoot', 'AppRouter', 'RootErrorBoundary', 'ErrorBoundary', 'ErrorBoundaryHandler',
    'Router', 'RedirectBoundary', 'RedirectErrorBoundary', '__next_root_layout_boundary__',
    'ViewTransitions', 'OuterLayoutRouter', 'RenderFromTemplateContext', 'ScrollAndFocusHandler',
    'InnerScrollAndFocusHandler', 'LoadingBoundary', 'HTTPAccessFallbackBoundary',
    'HTTPAccessFallbackErrorBoundary', 'InnerLayoutRouter', 'ClientPageRoot',
    // React Router
    'RouterProvider', 'DataRouterContext', 'LocationContext', 'RouteContext',
    // Common HOCs
    'Context.Provider', 'Context.Consumer', 'ForwardRef', 'Memo',
    // Generic
    'Root', 'App', 'Fragment'
];

/**
 * Check if a component name is a framework component
 */
function isFrameworkComponent(name: string | null): boolean {
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
 * Filter component path to show only user components
 */
function filterUserComponents(path: string[]): string[] {
    return path.filter(name => !isFrameworkComponent(name));
}

/**
 * Generate a CSS selector for an element
 */
function generateCssSelector(element: Element): string {
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

/**
 * Extract a readable HTML snippet from an element
 */
function extractHtmlSnippet(html: string, maxLength: number = 200): string {
    // Remove excessive whitespace
    let snippet = html.replace(/\s+/g, ' ').trim();

    if (snippet.length > maxLength) {
        snippet = snippet.substring(0, maxLength) + '...';
    }

    return snippet;
}

/**
 * Generate fix suggestions based on violation type
 */
function generateFixSuggestion(violationId: string, element: Element | null): FixSuggestion | undefined {
    const suggestions: Record<string, FixSuggestion> = {
        'landmark-one-main': {
            summary: 'Add a <main> landmark to your page',
            details: 'Wrap your primary page content in a <main> element. This helps screen reader users navigate to the main content quickly.',
            codeExample: '<main>\n  {/* Your page content here */}\n</main>'
        },
        'page-has-heading-one': {
            summary: 'Add an <h1> heading to your page',
            details: 'Every page should have exactly one <h1> element that describes the page\'s main topic.',
            codeExample: '<h1>Page Title</h1>'
        },
        'region': {
            summary: 'Wrap content in semantic landmarks',
            details: 'Use semantic HTML5 elements like <main>, <nav>, <aside>, <header>, <footer> to structure your page content.',
            codeExample: '<main>\n  <section>\n    {/* Content */}\n  </section>\n</main>'
        },
        'button-name': {
            summary: 'Add accessible text to the button',
            details: 'Buttons must have text content or an aria-label attribute.',
            codeExample: '<button aria-label="Close dialog">\n  <CloseIcon />\n</button>'
        },
        'link-name': {
            summary: 'Add accessible text to the link',
            details: 'Links must have text content or an aria-label attribute.',
            codeExample: '<a href="..." aria-label="Read more about topic">\n  <Icon />\n</a>'
        },
        'image-alt': {
            summary: 'Add alt text to the image',
            details: 'All images must have an alt attribute. Use empty alt="" for decorative images.',
            codeExample: '<img src="..." alt="Description of image" />'
        },
        'color-contrast': {
            summary: 'Increase color contrast',
            details: 'Text must have sufficient contrast with its background. Aim for at least 4.5:1 for normal text, 3:1 for large text.',
            codeExample: '// Use darker text or lighter background'
        },
        'label': {
            summary: 'Add a label to the form input',
            details: 'Form inputs must have associated labels.',
            codeExample: '<label htmlFor="email">Email</label>\n<input id="email" type="email" />'
        }
    };

    return suggestions[violationId];
}

/**
 * Find the React root fiber node
 */
function findReactRoot(): FiberNode | null {
    // Try to find root via React DevTools hook
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (hook && hook.getFiberRoots) {
        const roots = hook.getFiberRoots(1);
        if (roots && roots.size > 0) {
            const rootFiber = Array.from(roots)[0];
            return (rootFiber as any).current;
        }
    }

    // Fallback: find via DOM - check all elements for fiber keys
    const allElements = document.querySelectorAll('*');
    for (const element of allElements) {
        const fiberKey = Object.keys(element).find(key =>
            key.startsWith('__reactFiber') ||
            key.startsWith('__reactInternalInstance') ||
            key.startsWith('_reactRootContainer')
        );

        if (fiberKey) {
            const fiber = (element as any)[fiberKey];
            // Try to find the root by going up the tree
            let current = fiber;
            while (current && current.return) {
                current = current.return;
            }
            if (current) return current;
        }
    }

    // Check the root container specifically
    const rootElement = document.getElementById('root') || document.getElementById('app');
    if (rootElement) {
        const containerKeys = Object.keys(rootElement);
        for (const key of containerKeys) {
            if (key.startsWith('__react') || key.startsWith('_react')) {
                const value = (rootElement as any)[key];
                if (value && typeof value === 'object') {
                    if (value.current) return value.current;
                    if (value.return) {
                        let current = value;
                        while (current.return) current = current.return;
                        return current;
                    }
                }
            }
        }
    }

    return null;
}

/**
 * Get component name from fiber node using multiple strategies
 * Mimics React DevTools resolution logic
 */
function getComponentName(fiber: FiberNode): string | null {
    const type = fiber.type;

    // 1. Handle Context Providers explicitly
    // React Context Providers often appear as objects with _context
    if (type && type._context) {
        const contextName = type._context.displayName || 'Context';
        return `${contextName}.Provider`;
    }

    // 2. Handle Context Consumers
    if (type && type.$$typeof === Symbol.for('react.context')) {
        const contextName = type.displayName || 'Context';
        return `${contextName}.Consumer`;
    }

    // 3. Handle Lazy Components
    if (type && type.$$typeof === Symbol.for('react.lazy')) {
        return 'Lazy';
    }

    // 4. Handle Memo and ForwardRef
    // These wrap the actual component
    if (type && typeof type === 'object') {
        // Check if it's a Memo
        if (type.$$typeof === Symbol.for('react.memo')) {
            const innerName = type.type.displayName || type.type.name;
            return innerName ? `Memo(${innerName})` : 'Memo';
        }
        // Check if it's a ForwardRef
        if (type.$$typeof === Symbol.for('react.forward_ref')) {
            const innerName = type.displayName || type.render.displayName || type.render.name;
            return innerName ? `ForwardRef(${innerName})` : 'ForwardRef';
        }
    }

    // 5. Try Bippy's resolution (it handles many standard cases well)
    try {
        const displayName = getDisplayName(fiber as any);
        // Only accept if it's not a single letter (minified)
        if (displayName && displayName.length > 1) return displayName;
    } catch (error) {
        // Ignore bippy errors
    }

    // 6. Fallback: Check _debugSource (Dev builds only)
    if ((fiber as any)._debugSource?.fileName) {
        const match = (fiber as any)._debugSource.fileName.match(/\/([^/]+)\.(tsx?|jsx?)$/);
        if (match && match[1] && match[1].length > 1) {
            return match[1];
        }
    }

    // 7. Manual extraction from type
    if (typeof type === 'function') {
        const name = type.displayName || type.name;
        // If name is single letter, it's likely minified. 
        // Try to add a hint based on what it renders.
        if (name && name.length === 1) {
            let hint = '';
            if (fiber.child) {
                if (typeof fiber.child.type === 'string') {
                    hint = `(${fiber.child.type})`;
                } else if (typeof fiber.child.type === 'function') {
                    const childName = fiber.child.type.displayName || fiber.child.type.name;
                    if (childName && childName.length > 1) {
                        hint = `(${childName})`;
                    }
                }
            }
            return `${name}${hint} [minified]`;
        }
        return name || 'Anonymous';
    }

    if (typeof type === 'object' && type !== null) {
        if (type.displayName) return type.displayName;
    }

    // 8. Handle Host Components (HTML elements)
    if (typeof type === 'string') {
        return type;
    }

    return null;
}

/**
 * Traverse the fiber tree and collect component information
 */
function traverseFiberTree(fiber: FiberNode | null, components: ComponentInfo[] = [], path: string[] = []): ComponentInfo[] {
    if (!fiber) return components;

    const name = getComponentName(fiber);

    if (name && name !== 'Anonymous' && !name.startsWith('_')) {
        const componentInfo: ComponentInfo = {
            name,
            type: typeof fiber.type === 'string' ? 'host' : 'component',
            props: fiber.memoizedProps,
            domNode: fiber.stateNode instanceof Element ? fiber.stateNode : null,
            path: [...path, name],
        };

        components.push(componentInfo);
    }

    // Traverse children
    const newPath = name ? [...path, name] : path;
    if (fiber.child) {
        traverseFiberTree(fiber.child, components, newPath);
    }

    // Traverse siblings
    if (fiber.sibling) {
        traverseFiberTree(fiber.sibling, components, path);
    }

    return components;
}

/**
 * Run axe-core accessibility scan
 */
async function runAxeScan(): Promise<AxeViolation[]> {
    try {
        const results = await axe.run(document);
        return results.violations as AxeViolation[];
    } catch (error) {
        console.error('Axe scan failed:', error);
        return [];
    }
}

/**
 * Build a map of DOM elements to their React components
 */
function buildDomToComponentMap(components: ComponentInfo[]): Map<Element, ComponentInfo> {
    const map = new Map<Element, ComponentInfo>();

    for (const component of components) {
        if (component.domNode) {
            map.set(component.domNode, component);
        }
    }

    return map;
}

/**
 * Find the React component for a given DOM element
 * Walks up the DOM tree if the element itself isn't mapped
 */
function findComponentForElement(
    element: Element | null,
    domToComponentMap: Map<Element, ComponentInfo>
): ComponentInfo | null {
    if (!element) return null;

    // Check if this element is directly mapped
    if (domToComponentMap.has(element)) {
        return domToComponentMap.get(element)!;
    }

    // Walk up the DOM tree to find the nearest parent component
    let current = element.parentElement;
    while (current) {
        if (domToComponentMap.has(current)) {
            return domToComponentMap.get(current)!;
        }
        current = current.parentElement;
    }

    return null;
}

/**
 * Attribute violations to React components
 */
function attributeViolationsToComponents(
    violations: AxeViolation[],
    domToComponentMap: Map<Element, ComponentInfo>
): AttributedViolation[] {
    const attributed: AttributedViolation[] = [];

    for (const violation of violations) {
        const attributedNodes: AttributedViolationNode[] = [];

        for (const node of violation.nodes) {
            // Get the first target selector (axe returns an array, first is most specific)
            const selector = node.target[0];

            let element: Element | null = null;
            let component: ComponentInfo | null = null;

            try {
                // Try to find the element using the selector
                element = document.querySelector(selector);

                if (element) {
                    // Find the component for this element
                    component = findComponentForElement(element, domToComponentMap);
                }
            } catch (error) {
                console.warn(`Could not find element for selector: ${selector}`, error);
            }

            const userPath = component?.path ? filterUserComponents(component.path) : [];
            const isFramework = component ? isFrameworkComponent(component.name) : false;
            const cssSelector = element ? generateCssSelector(element) : node.target[0];
            const htmlSnippet = extractHtmlSnippet(node.html);

            attributedNodes.push({
                component: component?.name || null,
                componentPath: component?.path || [],
                userComponentPath: userPath,
                componentType: component ? (component.type as 'host' | 'component') : null,
                html: node.html,
                htmlSnippet,
                cssSelector,
                target: node.target,
                failureSummary: node.failureSummary,
                isFrameworkComponent: isFramework,
            });
        }

        // Generate fix suggestion for this violation
        const firstElement = attributedNodes[0];
        const fixSuggestion = generateFixSuggestion(violation.id, null);

        attributed.push({
            id: violation.id,
            impact: violation.impact,
            description: violation.description,
            help: violation.help,
            helpUrl: violation.helpUrl,
            nodes: attributedNodes,
            fixSuggestion,
        });
    }

    return attributed;
}

/**
 * Main scan function - called from Node context
 */
export async function scan() {
    console.log('🔍 Starting React A11y scan...');

    // Find React root
    const root = findReactRoot();
    if (!root) {
        throw new Error('Could not find React root fiber node');
    }

    console.log('✓ Found React root');

    // Traverse fiber tree to get components
    const components = traverseFiberTree(root);
    console.log(`✓ Found ${components.length} components`);

    // Run axe accessibility scan
    const violations = await runAxeScan();
    console.log(`✓ Found ${violations.length} violations`);

    // Build DOM-to-component map for attribution
    const domToComponentMap = buildDomToComponentMap(components);

    // Attribute violations to components
    const attributedViolations = attributeViolationsToComponents(violations, domToComponentMap);
    console.log(`✓ Attributed violations to components`);

    // Detect tech stack
    const techStack = detectTechStack();
    console.log(`✓ Detected tech stack`);

    return {
        components,
        violations: attributedViolations,
        techStack,
    };
}

/**
 * Detect the tech stack from the page
 */
function detectTechStack(): {
    framework: 'nextjs' | 'vite' | 'cra' | 'remix' | 'gatsby' | 'unknown';
    hasTypeScript: boolean;
    cssFramework: 'tailwind' | 'css-modules' | 'styled-components' | 'emotion' | 'sass' | 'none';
} {
    let framework: 'nextjs' | 'vite' | 'cra' | 'remix' | 'gatsby' | 'unknown' = 'unknown';
    let hasTypeScript = false;
    let cssFramework: 'tailwind' | 'css-modules' | 'styled-components' | 'emotion' | 'sass' | 'none' = 'none';

    // Detect framework
    if (typeof window !== 'undefined') {
        // Next.js detection - check multiple indicators
        const hasNextData = !!(window as any).__NEXT_DATA__;
        const hasNextRoot = !!document.querySelector('[id^="__next"]');
        const hasNextScript = !!document.querySelector('script[src*="/_next/"]');
        const hasNextMeta = !!document.querySelector('meta[name="next-head-count"]');

        if (hasNextData || hasNextRoot || hasNextScript || hasNextMeta) {
            framework = 'nextjs';
        }
        // Vite detection
        else if ((window as any).__vite__ || document.querySelector('[type="module"][src*="/@vite"]')) {
            framework = 'vite';
        }
        // Create React App detection
        else if (document.querySelector('[id="root"]') && (window as any).webpackHotUpdate) {
            framework = 'cra';
        }
        // Remix detection
        else if ((window as any).__remixContext) {
            framework = 'remix';
        }
        // Gatsby detection
        else if ((window as any).___gatsby) {
            framework = 'gatsby';
        }

        // Detect CSS framework by checking class patterns
        const allElements = document.querySelectorAll('*');

        // Tailwind detection (common utility classes)
        let tailwindScore = 0;
        const tailwindPatterns = ['flex', 'grid', 'w-', 'h-', 'bg-', 'text-', 'p-', 'm-'];
        allElements.forEach(el => {
            const classes = el.className;
            if (typeof classes === 'string') {
                tailwindPatterns.forEach(pattern => {
                    if (classes.includes(pattern)) tailwindScore++;
                });
            }
        });

        if (tailwindScore > 10) {
            cssFramework = 'tailwind';
        }
        // CSS Modules detection (hashed class names)
        else if (document.body.className.match(/[a-zA-Z]+_[a-zA-Z]+__[a-zA-Z0-9]+/)) {
            cssFramework = 'css-modules';
        }
        // Styled Components detection
        else if (document.querySelector('[class^="sc-"]')) {
            cssFramework = 'styled-components';
        }
        // Emotion detection
        else if (document.querySelector('[class^="css-"]')) {
            cssFramework = 'emotion';
        }

        // TypeScript detection (rough heuristic)
        const scripts = Array.from(document.querySelectorAll('script'));
        hasTypeScript = scripts.some(script =>
            script.src.includes('.tsx') ||
            script.src.includes('.ts') ||
            script.textContent?.includes('__esModule')
        );
    }

    return {
        framework,
        hasTypeScript,
        cssFramework,
    };
}

// Expose to global window for evaluation
if (typeof window !== 'undefined') {
    window.ReactA11yScanner = { scan };
}
