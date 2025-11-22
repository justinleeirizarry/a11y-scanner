/**
 * This file gets bundled and injected into the browser page
 * It runs in the browser context and uses Bippy + axe-core
 */

// @ts-ignore - these will be bundled
import axe from 'axe-core';
// @ts-ignore - Bippy utilities for better fiber handling
import { getDisplayName, isHostFiber, isCompositeFiber, instrument } from 'bippy';

// Initialize Bippy instrumentation immediately
try {
    instrument({
        onCommitFiberRoot: () => { }, // We just need instrumentation active
    });
} catch (e) {
    console.warn('Failed to initialize Bippy instrumentation:', e);
}

declare global {
    interface Window {
        ReactA11yScanner: {
            scan: (options?: { tags?: string[] }) => Promise<any>;
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
    wcagCriteria?: string;
    wcagLevel?: 'A' | 'AA' | 'AAA';
    userImpact?: string;
    priority?: 'critical' | 'high' | 'medium' | 'low';
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
            details: 'Wrap your primary page content in a <main> element. This helps screen reader users navigate to the main content quickly using landmark navigation.',
            codeExample: '<main>\n  {/* Your page content here */}\n</main>',
            wcagCriteria: '1.3.1 Info and Relationships',
            wcagLevel: 'A',
            userImpact: 'Screen reader users rely on landmarks to quickly navigate to the main content. Without a <main> landmark, they must manually search through the entire page.',
            priority: 'high'
        },
        'page-has-heading-one': {
            summary: 'Add an <h1> heading to your page',
            details: 'Every page should have exactly one <h1> element that describes the page\'s main topic. This is typically the page title and helps users understand what the page is about.',
            codeExample: '<h1>Page Title</h1>',
            wcagCriteria: '2.4.6 Headings and Labels',
            wcagLevel: 'AA',
            userImpact: 'Screen reader users often navigate by headings. Missing <h1> makes it difficult to understand the page structure and main purpose.',
            priority: 'high'
        },
        'heading-order': {
            summary: 'Fix heading hierarchy',
            details: 'Headings should follow a logical order (h1 → h2 → h3) without skipping levels. This creates a clear document outline.',
            codeExample: '// ❌ Bad: Skips from h1 to h4\n<h1>Title</h1>\n<h4>Subtitle</h4>\n\n// ✅ Good: Proper hierarchy\n<h1>Title</h1>\n<h2>Subtitle</h2>',
            wcagCriteria: '1.3.1 Info and Relationships',
            wcagLevel: 'A',
            userImpact: 'Screen reader users navigate by heading levels. Skipped levels create confusion about content hierarchy and make navigation difficult.',
            priority: 'medium'
        },
        'region': {
            summary: 'Wrap content in semantic landmarks',
            details: 'Use semantic HTML5 elements like <main>, <nav>, <aside>, <header>, <footer> to structure your page content. This creates clear regions that assistive technology can identify.',
            codeExample: '<main>\n  <section>\n    {/* Content */}\n  </section>\n</main>',
            wcagCriteria: '1.3.1 Info and Relationships',
            wcagLevel: 'A',
            userImpact: 'Screen reader users rely on landmarks to understand page structure and navigate efficiently. Missing landmarks force them to read through all content linearly.',
            priority: 'medium'
        },
        'button-name': {
            summary: 'Add accessible text to the button',
            details: 'Buttons must have text content or an aria-label attribute so screen readers can announce what the button does.',
            codeExample: '// ❌ Bad: Icon-only button\n<button><CloseIcon /></button>\n\n// ✅ Good: With aria-label\n<button aria-label="Close dialog">\n  <CloseIcon />\n</button>\n\n// ✅ Better: With visible text\n<button>\n  <CloseIcon /> Close\n</button>',
            wcagCriteria: '4.1.2 Name, Role, Value',
            wcagLevel: 'A',
            userImpact: 'Screen reader users hear nothing or "button" without context, making it impossible to know what the button does. Keyboard users also benefit from clear button labels.',
            priority: 'critical'
        },
        'link-name': {
            summary: 'Add accessible text to the link',
            details: 'Links must have text content or an aria-label attribute that describes where the link goes or what it does.',
            codeExample: '// ❌ Bad: Icon-only link\n<a href="/profile"><Icon /></a>\n\n// ✅ Good: With aria-label\n<a href="/profile" aria-label="View profile">\n  <Icon />\n</a>\n\n// ✅ Better: With visible text\n<a href="/profile">\n  <Icon /> Profile\n</a>',
            wcagCriteria: '4.1.2 Name, Role, Value',
            wcagLevel: 'A',
            userImpact: 'Screen reader users cannot determine the link\'s purpose. They may hear just "link" or the URL, which is not helpful for navigation.',
            priority: 'critical'
        },
        'image-alt': {
            summary: 'Add alt text to the image',
            details: 'All images must have an alt attribute. Use descriptive text for meaningful images, or empty alt="" for decorative images.',
            codeExample: '// ❌ Bad: Missing alt\n<img src="logo.png" />\n\n// ✅ Good: Descriptive alt for meaningful image\n<img src="logo.png" alt="Company Name Logo" />\n\n// ✅ Good: Empty alt for decorative image\n<img src="decoration.png" alt="" />',
            wcagCriteria: '1.1.1 Non-text Content',
            wcagLevel: 'A',
            userImpact: 'Screen reader users cannot perceive images. Without alt text, they miss important visual information. Blind users are completely excluded from image content.',
            priority: 'critical'
        },
        'color-contrast': {
            summary: 'Increase color contrast',
            details: 'Text must have sufficient contrast with its background. Aim for at least 4.5:1 for normal text (14pt or smaller), 3:1 for large text (18pt+ or 14pt+ bold).',
            codeExample: '// ❌ Bad: Low contrast (e.g., #999 on #fff = 2.8:1)\ncolor: #999999;\nbackground: #ffffff;\n\n// ✅ Good: High contrast (e.g., #595959 on #fff = 7:1)\ncolor: #595959;\nbackground: #ffffff;',
            wcagCriteria: '1.4.3 Contrast (Minimum)',
            wcagLevel: 'AA',
            userImpact: 'Users with low vision, color blindness, or viewing in bright sunlight cannot read low-contrast text. This affects about 1 in 12 people.',
            priority: 'high'
        },
        'label': {
            summary: 'Add a label to the form input',
            details: 'Form inputs must have associated labels using <label> with htmlFor, or aria-label/aria-labelledby.',
            codeExample: '// ❌ Bad: No label\n<input type="email" />\n\n// ✅ Good: With label element\n<label htmlFor="email">Email</label>\n<input id="email" type="email" />\n\n// ✅ Good: With aria-label\n<input type="email" aria-label="Email address" />',
            wcagCriteria: '3.3.2 Labels or Instructions',
            wcagLevel: 'A',
            userImpact: 'Screen reader users cannot identify what information to enter. Sighted users also benefit from labels that increase the clickable area.',
            priority: 'critical'
        },
        'aria-required-attr': {
            summary: 'Add required ARIA attributes',
            details: 'ARIA roles require specific attributes. For example, role="checkbox" requires aria-checked.',
            codeExample: '// ❌ Bad: Missing aria-checked\n<div role="checkbox">Accept terms</div>\n\n// ✅ Good: With required attribute\n<div role="checkbox" aria-checked="false">Accept terms</div>',
            wcagCriteria: '4.1.2 Name, Role, Value',
            wcagLevel: 'A',
            userImpact: 'Screen readers cannot properly announce the state or properties of custom controls, making them unusable.',
            priority: 'critical'
        },
        'aria-valid-attr-value': {
            summary: 'Fix ARIA attribute value',
            details: 'ARIA attributes must have valid values. For example, aria-checked accepts "true", "false", or "mixed".',
            codeExample: '// ❌ Bad: Invalid value\n<div role="checkbox" aria-checked="yes">Item</div>\n\n// ✅ Good: Valid value\n<div role="checkbox" aria-checked="true">Item</div>',
            wcagCriteria: '4.1.2 Name, Role, Value',
            wcagLevel: 'A',
            userImpact: 'Invalid ARIA values cause assistive technology to ignore or misinterpret the attribute, breaking functionality.',
            priority: 'high'
        },
        'list': {
            summary: 'Use proper list markup',
            details: 'List items (<li>) must be contained in <ul>, <ol>, or <menu> elements.',
            codeExample: '// ❌ Bad: Orphaned list items\n<div>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</div>\n\n// ✅ Good: Proper list structure\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>',
            wcagCriteria: '1.3.1 Info and Relationships',
            wcagLevel: 'A',
            userImpact: 'Screen readers announce list length and position (e.g., "list 3 items, item 1 of 3"), helping users understand content structure.',
            priority: 'medium'
        },
        'html-has-lang': {
            summary: 'Add lang attribute to <html> element',
            details: 'The <html> element must have a lang attribute to specify the page language.',
            codeExample: '// ❌ Bad: Missing lang\n<html>\n\n// ✅ Good: With lang attribute\n<html lang="en">',
            wcagCriteria: '3.1.1 Language of Page',
            wcagLevel: 'A',
            userImpact: 'Screen readers use the lang attribute to select the correct pronunciation rules. Wrong language causes garbled speech output.',
            priority: 'high'
        },
        'document-title': {
            summary: 'Add a descriptive <title> to the page',
            details: 'Every page must have a unique, descriptive <title> element that describes the page content.',
            codeExample: '// ❌ Bad: Generic or missing title\n<title>Page</title>\n\n// ✅ Good: Descriptive title\n<title>Contact Us - Company Name</title>',
            wcagCriteria: '2.4.2 Page Titled',
            wcagLevel: 'A',
            userImpact: 'Screen readers announce the page title first. Users rely on it to confirm they\'re on the right page and to identify browser tabs.',
            priority: 'high'
        },
        'meta-viewport': {
            summary: 'Add or fix viewport meta tag',
            details: 'Include a viewport meta tag and avoid user-scalable=no to allow users to zoom.',
            codeExample: '// ❌ Bad: Prevents zooming\n<meta name="viewport" content="width=device-width, user-scalable=no">\n\n// ✅ Good: Allows zooming\n<meta name="viewport" content="width=device-width, initial-scale=1">',
            wcagCriteria: '1.4.4 Resize Text',
            wcagLevel: 'AA',
            userImpact: 'Users with low vision need to zoom content. Preventing zoom excludes them from accessing your content.',
            priority: 'high'
        },
        'duplicate-id': {
            summary: 'Ensure all IDs are unique',
            details: 'ID attributes must be unique within the page. Duplicate IDs break ARIA references and form labels.',
            codeExample: '// ❌ Bad: Duplicate IDs\n<input id="email" />\n<input id="email" />\n\n// ✅ Good: Unique IDs\n<input id="email-1" />\n<input id="email-2" />',
            wcagCriteria: '4.1.1 Parsing',
            wcagLevel: 'A',
            userImpact: 'Duplicate IDs break form label associations and ARIA references, making controls unusable for screen reader users.',
            priority: 'high'
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

    // 1. Try Bippy's resolution first (it handles most cases including HOCs)
    try {
        const displayName = getDisplayName(fiber as any);
        // Only accept if it's not a single letter (minified) unless we have no other choice
        if (displayName && displayName.length > 1) return displayName;

        // If it is minified (length 1), keep it but try to find a better name below
        if (displayName) {
            // If we have a minified name, check if we can get a better one from type
            if (typeof type === 'function' && (type.displayName || type.name)) {
                const manualName = type.displayName || type.name;
                if (manualName.length > 1) return manualName;
            }
            return displayName;
        }
    } catch (error) {
        // Ignore bippy errors
    }

    // 2. Handle Context Providers explicitly (Bippy might miss some internal ones)
    if (type && type._context) {
        const contextName = type._context.displayName || 'Context';
        return `${contextName}.Provider`;
    }

    // 3. Fallback: Check _debugSource (Dev builds only)
    if ((fiber as any)._debugSource?.fileName) {
        const match = (fiber as any)._debugSource.fileName.match(/\/([^/]+)\.(tsx?|jsx?)$/);
        if (match && match[1] && match[1].length > 1) {
            return match[1];
        }
    }

    // 4. Manual extraction from type (last resort)
    if (typeof type === 'function') {
        const name = type.displayName || type.name;
        return name || 'Anonymous';
    }

    if (typeof type === 'object' && type !== null) {
        if (type.displayName) return type.displayName;
    }

    // 5. Handle Host Components (HTML elements)
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
async function runAxeScan(tags?: string[]): Promise<AxeViolation[]> {
    try {
        const options: any = {};

        if (tags && tags.length > 0) {
            options.runOnly = {
                type: 'tag',
                values: tags
            };
        } else {
            // Default to full scan if no tags provided
            options.runOnly = {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
            };
        }

        const results = await (axe as any).run(document, options);
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
export async function scan(options: { tags?: string[] } = {}) {
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
    const violations = await runAxeScan(options.tags);
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
