/**
 * React Fiber component name resolution
 */

// @ts-ignore - Bippy utilities
import { getDisplayName } from 'bippy';

export interface FiberNode {
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
    tag?: number;
    key?: string | null;
    index?: number;
}

/**
 * Get component name from fiber node using multiple strategies
 * Mimics React DevTools resolution logic
 */
export function getComponentName(fiber: FiberNode): string | null {
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
