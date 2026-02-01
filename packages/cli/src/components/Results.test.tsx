import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from 'ink-testing-library';
import Results from './Results.js';
import { Text } from 'ink';

// Mock child components to simplify testing
vi.mock('./Banner.js', () => ({
    Banner: () => <Text>MockBanner</Text>
}));
vi.mock('./Dashboard.js', () => ({
    Dashboard: () => <Text>MockDashboard</Text>
}));
vi.mock('./ViolationCard.js', () => ({
    ViolationCard: () => <Text>MockViolationCard</Text>
}));
vi.mock('./TreeViewer.js', () => ({
    TreeViewer: () => <Text>MockTreeViewer</Text>
}));
vi.mock('./KeyboardResults.js', () => ({
    KeyboardResults: () => <Text>MockKeyboardResults</Text>
}));

describe('Results Component', () => {
    it('should render loading state when results are null', () => {
        const { lastFrame } = render(<Results results={null} />);
        expect(lastFrame()).toContain('Loading scan results...');
    });

    it('should render success message when no violations found', () => {
        const mockResults = {
            violations: [],
            summary: { totalViolations: 0, violationsByImpact: {} },
            url: 'http://example.com'
        };

        const { lastFrame } = render(<Results results={mockResults as any} />);
        expect(lastFrame()).toContain('No accessibility violations found!');
        expect(lastFrame()).toContain('MockDashboard');
    });

    it('should render violations', () => {
        const mockResults = {
            violations: [{ id: 'test-violation' }],
            summary: { totalViolations: 1, violationsByImpact: {} },
            url: 'http://example.com'
        };

        const { lastFrame } = render(<Results results={mockResults as any} />);
        expect(lastFrame()).toContain('MockViolationCard');
        expect(lastFrame()).not.toContain('No accessibility violations found!');
    });

    it('should render file output paths', () => {
        const mockResults = {
            violations: [],
            summary: { totalViolations: 0, violationsByImpact: {} },
            url: 'http://example.com'
        };

        const { lastFrame } = render(
            <Results
                results={mockResults as any}
                outputFile="report.json"
                aiPromptFile="prompt.md"
            />
        );

        expect(lastFrame()).toContain('JSON Report:');
        expect(lastFrame()).toContain('report.json');
        expect(lastFrame()).toContain('AI Prompt:');
        expect(lastFrame()).toContain('prompt.md');
    });
});
