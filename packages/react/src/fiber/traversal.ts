/**
 * React Fiber tree traversal using Bippy for reliable fiber access
 */

import { traverseFiber as bippyTraverseFiber, isHostFiber, isCompositeFiber } from 'bippy';
import { getComponentName, type FiberNode } from './component-resolver.js';
import type { ComponentInfo } from '../types.js';

/**
 * React DevTools global hook interface
 * This is the structure React exposes for DevTools integration
 */
interface ReactDevToolsHook {
    getFiberRoots?: (rendererId: number) => Set<FiberRoot>;
    renderers?: Map<number, unknown>;
}

/**
 * React Fiber Root container
 * Contains the current fiber tree root
 */
interface FiberRoot {
    current: FiberNode;
}

/**
 * Element with potential React fiber internal properties
 * React attaches fiber nodes to DOM elements with prefixed keys
 */
interface ElementWithFiber extends Element {
    [key: string]: FiberNode | FiberRoot | unknown;
}

/**
 * Find the React root fiber node
 */
export function findReactRoot(): FiberNode | null {
    // Try to find root via React DevTools hook
    const hook = (window as unknown as { __REACT_DEVTOOLS_GLOBAL_HOOK__?: ReactDevToolsHook }).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (hook && hook.getFiberRoots) {
        const roots = hook.getFiberRoots(1);
        if (roots && roots.size > 0) {
            const rootFiber = Array.from(roots)[0] as FiberRoot;
            return rootFiber.current;
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
            const fiber = (element as ElementWithFiber)[fiberKey] as FiberNode;
            // Try to find the root by going up the tree
            let current: FiberNode | null = fiber;
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
                const value = (rootElement as unknown as ElementWithFiber)[key];
                if (value && typeof value === 'object') {
                    const fiberValue = value as FiberNode | FiberRoot;
                    if ('current' in fiberValue && fiberValue.current) return fiberValue.current;
                    if ('return' in fiberValue && fiberValue.return) {
                        let current: FiberNode | null = fiberValue as FiberNode;
                        while (current && current.return) current = current.return;
                        return current;
                    }
                }
            }
        }
    }

    return null;
}

// Maximum fibers to traverse (prevents infinite loops in corrupted trees)
const MAX_FIBER_COUNT = 50000;

/**
 * Manual fiber tree traversal (fallback for when Bippy fails)
 * Uses a visited set to prevent infinite loops from circular references
 */
function manualTraverseFiber(
    fiber: FiberNode | null,
    components: ComponentInfo[],
    path: string[],
    visited: WeakSet<object> = new WeakSet(),
    count: { value: number } = { value: 0 }
): void {
    if (!fiber) return;

    // Prevent infinite loops
    if (visited.has(fiber)) return;
    visited.add(fiber);

    // Limit total traversal
    count.value++;
    if (count.value > MAX_FIBER_COUNT) {
        console.warn('[react-a11y-scanner] Max fiber count reached, stopping traversal');
        return;
    }

    const name = getComponentName(fiber);

    if (name && name !== 'Anonymous' && !name.startsWith('_')) {
        const fiberType = typeof fiber.type === 'string' ? 'host' : 'component';

        const componentInfo: ComponentInfo = {
            name,
            type: fiberType,
            props: fiber.memoizedProps,
            domNode: fiber.stateNode instanceof Element ? fiber.stateNode : null,
            path: [...path, name],
        };

        components.push(componentInfo);
    }

    // Traverse children
    const newPath = name ? [...path, name] : path;
    if (fiber.child) {
        manualTraverseFiber(fiber.child, components, newPath, visited, count);
    }

    // Traverse siblings
    if (fiber.sibling) {
        manualTraverseFiber(fiber.sibling, components, path, visited, count);
    }
}

/**
 * Traverse the fiber tree and collect component information
 * Uses Bippy's traverseFiber for reliable traversal with fallback to manual
 */
export function traverseFiberTree(fiber: FiberNode | null, components: ComponentInfo[] = [], path: string[] = []): ComponentInfo[] {
    if (!fiber) return components;

    // Track current path during traversal
    const pathStack: string[] = [...path];

    try {
        // Use Bippy's traverseFiber for reliable traversal
        // Note: Bippy's Fiber type is structurally compatible with our FiberNode but not identical
        // The cast is required because Bippy uses its own internal fiber type definition
        bippyTraverseFiber(fiber as Parameters<typeof bippyTraverseFiber>[0], (currentFiber) => {
            // Cast to our FiberNode type for consistent handling
            const fiberNode = currentFiber as unknown as FiberNode;
            const name = getComponentName(fiberNode);

            if (name && name !== 'Anonymous' && !name.startsWith('_')) {
                // Determine component type using Bippy's helpers
                const fiberType = isHostFiber(currentFiber) ? 'host' : 'component';

                const componentInfo: ComponentInfo = {
                    name,
                    type: fiberType,
                    props: fiberNode.memoizedProps,
                    domNode: fiberNode.stateNode instanceof Element ? fiberNode.stateNode : null,
                    path: [...pathStack, name],
                };

                components.push(componentInfo);

                // Update path for children
                pathStack.push(name);
            }
        });
    } catch (error) {
        console.warn('[react-a11y-scanner] Bippy traversal failed, using manual fallback:', error);
        // Fallback to manual traversal
        manualTraverseFiber(fiber, components, path);
    }

    return components;
}

/**
 * Build a map of DOM elements to their React components
 */
export function buildDomToComponentMap(components: ComponentInfo[]): Map<Element, ComponentInfo> {
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
export function findComponentForElement(
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
