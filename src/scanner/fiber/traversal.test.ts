// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { traverseFiberTree, buildDomToComponentMap, findComponentForElement, findReactRoot } from './traversal.js';
import { getComponentName, type FiberNode } from './component-resolver.js';

// Mock component resolver
vi.mock('./component-resolver.js', () => ({
    getComponentName: vi.fn()
}));

describe('Fiber Traversal', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('traverseFiberTree', () => {
        it('should return empty array for null fiber', () => {
            const result = traverseFiberTree(null);
            expect(result).toEqual([]);
        });

        it('should traverse a simple tree', () => {
            // Tree: App -> div -> Button
            const buttonFiber = { type: 'button', stateNode: document.createElement('button') } as unknown as FiberNode;
            const divFiber = { type: 'div', child: buttonFiber, stateNode: document.createElement('div') } as unknown as FiberNode;
            const appFiber = { type: 'App', child: divFiber, stateNode: null } as unknown as FiberNode;

            (getComponentName as any).mockImplementation((fiber: any) => {
                if (fiber === appFiber) return 'App';
                if (fiber === divFiber) return 'div';
                if (fiber === buttonFiber) return 'Button';
                return null;
            });

            const result = traverseFiberTree(appFiber);

            expect(result).toHaveLength(3);
            expect(result[0].name).toBe('App');
            expect(result[0].path).toEqual(['App']);
            expect(result[1].name).toBe('div');
            expect(result[1].path).toEqual(['App', 'div']);
            expect(result[2].name).toBe('Button');
            expect(result[2].path).toEqual(['App', 'div', 'Button']);
        });

        it('should handle siblings', () => {
            // Tree: List -> [Item1, Item2]
            const item2Fiber = { type: 'Item', stateNode: document.createElement('li') } as unknown as FiberNode;
            const item1Fiber = { type: 'Item', sibling: item2Fiber, stateNode: document.createElement('li') } as unknown as FiberNode;
            const listFiber = { type: 'List', child: item1Fiber } as unknown as FiberNode;

            (getComponentName as any).mockImplementation((fiber: any) => {
                if (fiber === listFiber) return 'List';
                if (fiber === item1Fiber) return 'Item';
                if (fiber === item2Fiber) return 'Item';
                return null;
            });

            const result = traverseFiberTree(listFiber);

            expect(result).toHaveLength(3);
            expect(result[1].name).toBe('Item');
            expect(result[2].name).toBe('Item');
        });
    });

    describe('buildDomToComponentMap', () => {
        it('should map DOM nodes to components', () => {
            const div = document.createElement('div');
            const components = [
                { name: 'App', type: 'component', props: {}, domNode: null, path: ['App'] },
                { name: 'div', type: 'host', props: {}, domNode: div, path: ['App', 'div'] }
            ];

            const map = buildDomToComponentMap(components as any);

            expect(map.size).toBe(1);
            expect(map.get(div)).toBe(components[1]);
        });
    });

    describe('findComponentForElement', () => {
        it('should find component for direct match', () => {
            const div = document.createElement('div');
            const component = { name: 'div', domNode: div };
            const map = new Map([[div, component]]);

            const result = findComponentForElement(div, map as any);
            expect(result).toBe(component);
        });

        it('should find component for parent match', () => {
            const parent = document.createElement('div');
            const child = document.createElement('span');
            parent.appendChild(child);

            const component = { name: 'Parent', domNode: parent };
            const map = new Map([[parent, component]]);

            const result = findComponentForElement(child, map as any);
            expect(result).toBe(component);
        });

        it('should return null if no match found', () => {
            const div = document.createElement('div');
            const map = new Map();

            const result = findComponentForElement(div, map);
            expect(result).toBeNull();
        });
    });

    describe('findReactRoot', () => {
        it('should find root via DevTools hook', () => {
            const mockRoot = { current: { type: 'App' } };
            const mockHook = {
                getFiberRoots: vi.fn().mockReturnValue(new Set([mockRoot]))
            };
            (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook;

            const result = findReactRoot();
            expect(result).toBe(mockRoot.current);
        });

        it('should return null if no root found', () => {
            (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = null;
            const result = findReactRoot();
            expect(result).toBeNull();
        });
    });
});
