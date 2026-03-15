import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import Results from './Results.js';

describe('Results Component', () => {
    it('should render loading state when results are null', () => {
        const { lastFrame } = render(<Results results={null} />);
        expect(lastFrame()).toContain('scanning');
    });

    it('should render success message when no violations found', () => {
        const mockResults = {
            violations: [],
            incomplete: [],
            summary: {
                totalViolations: 0,
                totalPasses: 0,
                totalComponents: 0,
                violationsByImpact: {},
                violationsBySeverity: { critical: 0, serious: 0, moderate: 0, minor: 0 },
            },
            url: 'http://example.com',
        };

        const { lastFrame } = render(<Results results={mockResults as any} />);
        expect(lastFrame()).toContain('No violations found.');
        expect(lastFrame()).toContain('0 violations');
    });

    it('should render violations', () => {
        const mockResults = {
            violations: [{
                id: 'color-contrast',
                impact: 'serious',
                description: 'Elements must have sufficient color contrast',
                help: 'Fix color contrast',
                helpUrl: 'https://dequeuniversity.com/rules/axe/color-contrast',
                nodes: [{
                    html: '<span style="color: #ccc">low contrast</span>',
                    htmlSnippet: '<span style="color: #ccc">low contrast</span>',
                    target: ['span'],
                    component: null,
                    componentPath: [],
                    userComponentPath: [],
                }],
            }],
            incomplete: [],
            summary: {
                totalViolations: 1,
                totalPasses: 5,
                totalComponents: 3,
                violationsByImpact: { serious: 1 },
                violationsBySeverity: { critical: 0, serious: 1, moderate: 0, minor: 0 },
            },
            url: 'http://example.com',
        };

        const { lastFrame } = render(<Results results={mockResults as any} />);
        expect(lastFrame()).toContain('color-contrast');
        expect(lastFrame()).toContain('SERIOUS');
        expect(lastFrame()).toContain('1 instance');
        expect(lastFrame()).not.toContain('No violations found.');
    });

    it('should render file output paths', () => {
        const mockResults = {
            violations: [],
            incomplete: [],
            summary: {
                totalViolations: 0,
                totalPasses: 0,
                totalComponents: 0,
                violationsByImpact: {},
                violationsBySeverity: { critical: 0, serious: 0, moderate: 0, minor: 0 },
            },
            url: 'http://example.com',
        };

        const { lastFrame } = render(
            <Results
                results={mockResults as any}
                outputFile="report.json"
                aiPromptFile="prompt.md"
            />
        );

        expect(lastFrame()).toContain('json: report.json');
        expect(lastFrame()).toContain('prompt: prompt.md');
    });
});
