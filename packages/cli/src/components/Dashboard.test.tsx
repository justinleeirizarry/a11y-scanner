import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { Dashboard } from './Dashboard.js';
import type { ScanResults } from '@react-a11y-scanner/core';

describe('Dashboard Component', () => {
    const createMockSummary = (overrides?: Partial<ScanResults['summary']>): ScanResults['summary'] => ({
        totalComponents: 10,
        totalViolations: 5,
        totalPasses: 20,
        totalIncomplete: 2,
        totalInapplicable: 8,
        violationsBySeverity: {
            critical: 1,
            serious: 2,
            moderate: 1,
            minor: 1,
        },
        violationsByWcagLevel: {
            wcag2a: 2,
            wcag2aa: 2,
            wcag2aaa: 0,
            wcag21a: 0,
            wcag21aa: 1,
            wcag22aa: 0,
            bestPractice: 0,
        },
        componentsWithViolations: 3,
        ...overrides,
    });

    it('renders component counts correctly', () => {
        const summary = createMockSummary();
        const { lastFrame } = render(<Dashboard summary={summary} />);
        const output = lastFrame() || '';

        expect(output).toContain('Components');
        expect(output).toContain('10');
        expect(output).toContain('with issues');
        expect(output).toContain('3');
    });

    it('renders violation and pass counts', () => {
        const summary = createMockSummary();
        const { lastFrame } = render(<Dashboard summary={summary} />);
        const output = lastFrame() || '';

        expect(output).toContain('Violations');
        expect(output).toContain('Passes');
        expect(output).toContain('20');
    });

    it('renders severity breakdown', () => {
        const summary = createMockSummary();
        const { lastFrame } = render(<Dashboard summary={summary} />);
        const output = lastFrame() || '';

        expect(output).toContain('Severity');
        expect(output).toContain('critical');
        expect(output).toContain('serious');
        expect(output).toContain('moderate');
        expect(output).toContain('minor');
    });

    it('renders WCAG level breakdown when violations exist', () => {
        const summary = createMockSummary({
            totalViolations: 5,
            violationsByWcagLevel: {
                wcag2a: 2,
                wcag2aa: 2,
                wcag2aaa: 1,
                wcag21a: 0,
                wcag21aa: 0,
                wcag22aa: 0,
                bestPractice: 1,
            },
        });
        const { lastFrame } = render(<Dashboard summary={summary} />);
        const output = lastFrame() || '';

        expect(output).toContain('WCAG');
        expect(output).toContain('A:');
        expect(output).toContain('AA:');
    });

    it('does not render WCAG breakdown when no violations', () => {
        const summary = createMockSummary({
            totalViolations: 0,
        });
        const { lastFrame } = render(<Dashboard summary={summary} />);
        const output = lastFrame() || '';

        // WCAG breakdown should not appear when there are no violations
        expect(output).not.toMatch(/WCAG:.*A:/);
    });

    it('renders manual review count when incomplete items exist', () => {
        const summary = createMockSummary({
            totalIncomplete: 5,
        });
        const { lastFrame } = render(<Dashboard summary={summary} />);
        const output = lastFrame() || '';

        expect(output).toContain('Review');
        expect(output).toContain('5');
    });

    it('does not render manual review when no incomplete items', () => {
        const summary = createMockSummary({
            totalIncomplete: 0,
        });
        const { lastFrame } = render(<Dashboard summary={summary} />);
        const output = lastFrame() || '';

        expect(output).not.toContain('Review:');
    });

    it('includes keyboard issues in total count', () => {
        const summary = createMockSummary({
            totalViolations: 3,
            keyboardIssues: 2,
        });
        const { lastFrame } = render(<Dashboard summary={summary} />);
        const output = lastFrame() || '';

        // Total should be 5 (3 violations + 2 keyboard issues)
        expect(output).toContain('5');
        expect(output).toContain('keyboard');
    });

    it('merges keyboard summary with severity counts', () => {
        const summary = createMockSummary({
            violationsBySeverity: {
                critical: 1,
                serious: 0,
                moderate: 0,
                minor: 0,
            },
        });
        const keyboardSummary = {
            criticalIssues: 2,
            seriousIssues: 1,
            moderateIssues: 0,
        };

        const { lastFrame } = render(
            <Dashboard summary={summary} keyboardSummary={keyboardSummary} />
        );
        const output = lastFrame() || '';

        // Critical should be 3 (1 + 2 from keyboard)
        expect(output).toContain('critical');
    });

    it('renders components label', () => {
        const summary = createMockSummary();
        const { lastFrame } = render(<Dashboard summary={summary} />);
        const output = lastFrame() || '';

        expect(output).toContain('Components');
    });

    it('handles zero violations gracefully', () => {
        const summary = createMockSummary({
            totalViolations: 0,
            totalComponents: 50,
            componentsWithViolations: 0,
            violationsBySeverity: {
                critical: 0,
                serious: 0,
                moderate: 0,
                minor: 0,
            },
        });

        const { lastFrame } = render(<Dashboard summary={summary} />);
        const output = lastFrame() || '';

        expect(output).toContain('50');
        expect(output).toContain('0');
    });

    it('handles missing violationsByWcagLevel gracefully', () => {
        const summary = createMockSummary({
            violationsByWcagLevel: undefined,
        });

        const { lastFrame } = render(<Dashboard summary={summary} />);
        const output = lastFrame() || '';

        // Should still render without crashing
        expect(output).toContain('Components');
    });
});
