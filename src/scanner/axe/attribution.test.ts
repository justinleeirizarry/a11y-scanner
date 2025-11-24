// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { attributeViolationsToComponents } from './attribution.js';
import { findComponentForElement } from '../fiber/traversal.js';
import { generateFixSuggestion } from '../suggestions/fix-generator.js';
import type { AxeViolation } from './runner.js';

// Mock dependencies
vi.mock('../fiber/traversal.js', () => ({
    findComponentForElement: vi.fn()
}));

vi.mock('../suggestions/fix-generator.js', () => ({
    generateFixSuggestion: vi.fn()
}));

describe('Attribution', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should attribute violations to components', () => {
        const div = document.createElement('div');
        document.body.appendChild(div);

        const mockViolation: AxeViolation = {
            id: 'color-contrast',
            impact: 'serious',
            description: 'Contrast is low',
            help: 'Fix contrast',
            helpUrl: 'http://example.com',
            nodes: [{
                html: '<div></div>',
                target: ['div'],
                failureSummary: 'Fix it'
            }]
        };

        const mockComponent = {
            name: 'Button',
            path: ['App', 'Button'],
            type: 'component',
            props: {},
            domNode: div
        };

        (findComponentForElement as any).mockReturnValue(mockComponent);
        (generateFixSuggestion as any).mockReturnValue({ title: 'Fix', description: 'Do this' });

        // Mock document.querySelector to return our div
        const querySelectorSpy = vi.spyOn(document, 'querySelector').mockReturnValue(div);

        const result = attributeViolationsToComponents([mockViolation], new Map());

        expect(result).toHaveLength(1);
        expect(result[0].nodes[0].component).toBe('Button');
        expect(result[0].nodes[0].componentPath).toEqual(['App', 'Button']);
        expect(result[0].fixSuggestion).toBeDefined();

        querySelectorSpy.mockRestore();
        document.body.removeChild(div);
    });

    it('should handle elements without components', () => {
        const div = document.createElement('div');
        document.body.appendChild(div);

        const mockViolation: AxeViolation = {
            id: 'color-contrast',
            impact: 'serious',
            description: 'Contrast is low',
            help: 'Fix contrast',
            helpUrl: 'http://example.com',
            nodes: [{
                html: '<div></div>',
                target: ['div'],
                failureSummary: 'Fix it'
            }]
        };

        (findComponentForElement as any).mockReturnValue(null);
        vi.spyOn(document, 'querySelector').mockReturnValue(div);

        const result = attributeViolationsToComponents([mockViolation], new Map());

        expect(result[0].nodes[0].component).toBeNull();
        expect(result[0].nodes[0].componentPath).toEqual([]);
    });

    it('should handle missing elements', () => {
        const mockViolation: AxeViolation = {
            id: 'color-contrast',
            impact: 'serious',
            description: 'Contrast is low',
            help: 'Fix contrast',
            helpUrl: 'http://example.com',
            nodes: [{
                html: '<div></div>',
                target: ['#missing'],
                failureSummary: 'Fix it'
            }]
        };

        vi.spyOn(document, 'querySelector').mockReturnValue(null);

        const result = attributeViolationsToComponents([mockViolation], new Map());

        expect(result[0].nodes[0].component).toBeNull();
    });
});
