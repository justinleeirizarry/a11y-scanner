import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getComponentName, type FiberNode } from './component-resolver.js';
import { getDisplayName } from 'bippy';

// Mock bippy
vi.mock('bippy', () => ({
    getDisplayName: vi.fn()
}));

describe('Component Resolver', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should return name from bippy if available and valid', () => {
        (getDisplayName as any).mockReturnValue('MyComponent');
        const fiber = { type: 'div' } as FiberNode;
        expect(getComponentName(fiber)).toBe('MyComponent');
    });

    it('should ignore single-letter names from bippy unless no other option', () => {
        (getDisplayName as any).mockReturnValue('C'); // Minified
        function ComplexComponent() { }
        const fiber = {
            type: ComplexComponent
        } as unknown as FiberNode;

        expect(getComponentName(fiber)).toBe('ComplexComponent');
    });

    it('should use single-letter name from bippy if type name is also missing', () => {
        (getDisplayName as any).mockReturnValue('C');
        const fiber = { type: {} } as FiberNode;
        expect(getComponentName(fiber)).toBe('C');
    });

    it('should handle Context Providers', () => {
        (getDisplayName as any).mockReturnValue(null);
        const fiber = {
            type: {
                _context: {
                    displayName: 'ThemeContext'
                }
            }
        } as unknown as FiberNode;
        expect(getComponentName(fiber)).toBe('ThemeContext.Provider');
    });

    it('should fallback to type.displayName', () => {
        (getDisplayName as any).mockReturnValue(null);
        const fiber = {
            type: {
                displayName: 'StyledButton'
            }
        } as unknown as FiberNode;
        expect(getComponentName(fiber)).toBe('StyledButton');
    });

    it('should fallback to type.name for functions', () => {
        (getDisplayName as any).mockReturnValue(null);
        function MyFunc() { }
        const fiber = {
            type: MyFunc
        } as unknown as FiberNode;
        expect(getComponentName(fiber)).toBe('MyFunc');
    });

    it('should return host component tag', () => {
        (getDisplayName as any).mockReturnValue(null);
        const fiber = {
            type: 'div'
        } as unknown as FiberNode;
        expect(getComponentName(fiber)).toBe('div');
    });

    it('should return null if no name found', () => {
        (getDisplayName as any).mockReturnValue(null);
        const fiber = {
            type: {}
        } as FiberNode;
        expect(getComponentName(fiber)).toBe(null);
    });
});
