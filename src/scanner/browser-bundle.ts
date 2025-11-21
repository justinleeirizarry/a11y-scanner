/**
 * This file gets bundled and injected into the browser page
 * It runs in the browser context and uses Bippy + axe-core
 */

// @ts-ignore - these will be bundled
import axe from 'axe-core';
// Note: Bippy might need to be included differently - checking approach

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
 * Get component name from fiber node
 */
function getComponentName(fiber: FiberNode): string | null {
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

    return {
        components,
        violations,
    };
}

// Expose to global window for evaluation
if (typeof window !== 'undefined') {
    (window as any).ReactA11yScanner = { scan };
}
