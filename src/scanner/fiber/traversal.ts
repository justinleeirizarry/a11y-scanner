/**
 * React Fiber tree traversal using Bippy for reliable fiber access
 */

import { traverseFiber as bippyTraverseFiber, isHostFiber, isCompositeFiber } from 'bippy';
import { getComponentName, type FiberNode } from './component-resolver.js';
import type { ComponentInfo } from '../../types.js';

/**
 * Find the React root fiber node
 */
export function findReactRoot(): FiberNode | null {
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
        bippyTraverseFiber(fiber as any, (currentFiber: any) => {
            const name = getComponentName(currentFiber as FiberNode);

            if (name && name !== 'Anonymous' && !name.startsWith('_')) {
                // Determine component type using Bippy's helpers
                const fiberType = isHostFiber(currentFiber) ? 'host' : 'component';

                const componentInfo: ComponentInfo = {
                    name,
                    type: fiberType,
                    props: currentFiber.memoizedProps,
                    domNode: currentFiber.stateNode instanceof Element ? currentFiber.stateNode : null,
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
