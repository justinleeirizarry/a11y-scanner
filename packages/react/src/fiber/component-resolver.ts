/**
 * React Fiber component name resolution
 */

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

    // 1. Try type.displayName or type.name (functions/classes)
    if (typeof type === 'function') {
        const name = type.displayName || type.name;
        if (name && name.length > 1) return name;
        // If minified (single letter), try other strategies before accepting
        if (name) {
            // Check _debugSource for a better name
            if ((fiber as any)._debugSource?.fileName) {
                const match = (fiber as any)._debugSource.fileName.match(/\/([^/]+)\.(tsx?|jsx?)$/);
                if (match && match[1] && match[1].length > 1) {
                    return match[1];
                }
            }
            return name;
        }
    }

    // 2. Handle Context Providers explicitly
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

    // 4. Object types with displayName
    if (typeof type === 'object' && type !== null) {
        if (type.displayName) return type.displayName;
    }

    // 5. Handle Host Components (HTML elements)
    if (typeof type === 'string') {
        return type;
    }

    return null;
}
