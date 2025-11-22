/**
 * This file gets bundled and injected into the browser page
 * It runs in the browser context and uses Bippy + axe-core
 */

// @ts-ignore - these will be bundled
import axe from 'axe-core';
// @ts-ignore - Bippy utilities for better fiber handling
import { getDisplayName, isHostFiber, isCompositeFiber } from 'bippy/core';

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

interface AttributedViolationNode {
    component: string | null;
    componentPath: string[];
    componentType: 'host' | 'component' | null;
    html: string;
    target: string[];
    failureSummary: string;
}

interface AttributedViolation {
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    help: string;
    helpUrl: string;
    nodes: AttributedViolationNode[];
}

/**
 * Find the React root fiber node
 */
function findReactRoot(): FiberNode | null {
    // Try to find root via React DevTools hook
    const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
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
 * Get component name from fiber node using Bippy
 */
function getComponentName(fiber: FiberNode): string | null {
    try {
        // Use Bippy's getDisplayName for better handling of memo, forwardRef, etc.
        const displayName = getDisplayName(fiber as any);
        if (displayName) return displayName;
    } catch (error) {
        // Fallback to manual extraction if Bippy fails
    }

    // Fallback: Manual extraction
    if (!fiber.type) return null;

    if (typeof fiber.type === 'string') {
        return fiber.type; // HTML element like 'div', 'button'
    }

    if (typeof fiber.type === 'function') {
        return fiber.type.displayName || fiber.type.name || 'Anonymous';
    }

    if (typeof fiber.type === 'object' && fiber.type !== null) {
        if (fiber.type.displayName) return fiber.type.displayName;
        if (fiber.type.render && fiber.type.render.name) return fiber.type.render.name;
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

            attributedNodes.push({
                component: component?.name || null,
                componentPath: component?.path || [],
                componentType: component ? (component.type as 'host' | 'component') : null,
                html: node.html,
                target: node.target,
                failureSummary: node.failureSummary,
            });
        }

        attributed.push({
            id: violation.id,
            impact: violation.impact,
            description: violation.description,
            help: violation.help,
            helpUrl: violation.helpUrl,
            nodes: attributedNodes,
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

    return {
        components,
        violations: attributedViolations,
    };
}

// Expose to global window for evaluation
if (typeof window !== 'undefined') {
    (window as any).ReactA11yScanner = { scan };
}
