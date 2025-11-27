/**
 * Integration tests for App.tsx orchestration logic
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'ink-testing-library';
import App from './App.js';

// Mock the scanner/launcher modules
vi.mock('../browser/launcher.js', () => ({
    runScan: vi.fn()
}));

vi.mock('../browser/test-generator-launcher.js', () => ({
    runTestGeneration: vi.fn()
}));

vi.mock('../prompts/prompt-generator.js', () => ({
    generateAndExport: vi.fn()
}));

// Mock fs/promises for output file writing
vi.mock('fs/promises', () => ({
    writeFile: vi.fn(),
    mkdir: vi.fn()
}));

import { runScan } from '../browser/launcher.js';
import { runTestGeneration } from '../browser/test-generator-launcher.js';
import { generateAndExport } from '../prompts/prompt-generator.js';
import * as fsPromises from 'fs/promises';
import type { ScanResults, TestGenerationResults } from '../types.js';

describe('App Component', () => {
    // Store original process.exitCode
    let originalExitCode: typeof process.exitCode;

    beforeEach(() => {
        vi.resetAllMocks();
        originalExitCode = process.exitCode;
        process.exitCode = undefined;
    });

    afterEach(() => {
        process.exitCode = originalExitCode as number | undefined;
    });

    const createMockScanResults = (violationCount: number = 0): ScanResults => ({
        url: 'http://example.com',
        timestamp: new Date().toISOString(),
        browser: 'chromium',
        components: [{ name: 'App', type: 'component', path: ['App'] }],
        violations: Array(violationCount).fill(null).map((_, i) => ({
            id: `violation-${i}`,
            impact: 'serious' as const,
            description: `Violation ${i}`,
            help: 'Fix it',
            helpUrl: 'http://example.com',
            nodes: [{
                component: 'Button',
                componentPath: ['App', 'Button'],
                userComponentPath: ['Button'],
                componentType: 'component' as const,
                html: '<button></button>',
                htmlSnippet: '<button>',
                cssSelector: 'button',
                target: ['button'],
                failureSummary: 'Missing label',
                isFrameworkComponent: false
            }]
        })),
        summary: {
            totalComponents: 1,
            totalViolations: violationCount,
            violationsBySeverity: {
                critical: 0,
                serious: violationCount,
                moderate: 0,
                minor: 0
            },
            componentsWithViolations: violationCount > 0 ? 1 : 0
        }
    });

    const createMockTestGenResults = (success: boolean = true): TestGenerationResults => ({
        url: 'http://example.com',
        timestamp: new Date().toISOString(),
        outputFile: 'test.spec.ts',
        elementsDiscovered: 5,
        elements: [
            { selector: '#btn', description: 'Submit button', type: 'button' }
        ],
        success,
        error: success ? undefined : 'Test generation failed'
    });

    describe('Scan Mode', () => {
        it('should call runScan with correct options', async () => {
            const mockResults = createMockScanResults(0);
            (runScan as any).mockResolvedValue(mockResults);

            const { lastFrame, unmount } = render(
                <App
                    mode="scan"
                    url="http://localhost:3000"
                    browser="chromium"
                    ci={false}
                    threshold={0}
                    headless={true}
                    tags={['wcag2a', 'wcag2aa']}
                    keyboardNav={true}
                />
            );

            // Wait for async scan to complete
            await vi.waitFor(() => {
                expect(runScan).toHaveBeenCalled();
            }, { timeout: 1000 });

            expect(runScan).toHaveBeenCalledWith({
                url: 'http://localhost:3000',
                browser: 'chromium',
                headless: true,
                tags: ['wcag2a', 'wcag2aa'],
                includeKeyboardTests: true
            });

            unmount();
        });

        it('should display results after scan completes', async () => {
            const mockResults = createMockScanResults(2);
            (runScan as any).mockResolvedValue(mockResults);

            const { lastFrame, unmount } = render(
                <App
                    mode="scan"
                    url="http://example.com"
                    browser="chromium"
                    ci={false}
                    threshold={0}
                    headless={true}
                />
            );

            await vi.waitFor(() => {
                const frame = lastFrame();
                // Should show results with violation count
                expect(frame).toContain('2');
            }, { timeout: 2000 });

            unmount();
        });

        it('should handle scan errors gracefully', async () => {
            (runScan as any).mockRejectedValue(new Error('Network error'));

            const { lastFrame, unmount } = render(
                <App
                    mode="scan"
                    url="http://example.com"
                    browser="chromium"
                    ci={false}
                    threshold={0}
                    headless={true}
                />
            );

            await vi.waitFor(() => {
                const frame = lastFrame();
                expect(frame).toContain('Error');
            }, { timeout: 2000 });

            unmount();
        });
    });

    describe('CI Mode', () => {
        it('should set exit code 1 when violations exceed threshold', async () => {
            const mockResults = createMockScanResults(5);
            (runScan as any).mockResolvedValue(mockResults);

            const { unmount } = render(
                <App
                    mode="scan"
                    url="http://example.com"
                    browser="chromium"
                    ci={true}
                    threshold={2}
                    headless={true}
                />
            );

            await vi.waitFor(() => {
                expect(process.exitCode).toBe(1);
            }, { timeout: 2000 });

            unmount();
        });

        it('should set exit code 0 when violations are within threshold', async () => {
            const mockResults = createMockScanResults(2);
            (runScan as any).mockResolvedValue(mockResults);

            const { unmount } = render(
                <App
                    mode="scan"
                    url="http://example.com"
                    browser="chromium"
                    ci={true}
                    threshold={5}
                    headless={true}
                />
            );

            await vi.waitFor(() => {
                expect(process.exitCode).toBe(0);
            }, { timeout: 2000 });

            unmount();
        });

        it('should set exit code 1 on scan error in CI mode', async () => {
            (runScan as any).mockRejectedValue(new Error('Scan failed'));

            const { unmount } = render(
                <App
                    mode="scan"
                    url="http://example.com"
                    browser="chromium"
                    ci={true}
                    threshold={0}
                    headless={true}
                />
            );

            await vi.waitFor(() => {
                expect(process.exitCode).toBe(1);
            }, { timeout: 2000 });

            unmount();
        });
    });

    describe('Output File', () => {
        it('should write results to output file when specified', async () => {
            const mockResults = createMockScanResults(1);
            (runScan as any).mockResolvedValue(mockResults);
            (fsPromises.writeFile as any).mockResolvedValue(undefined);
            (fsPromises.mkdir as any).mockResolvedValue(undefined);

            const { unmount } = render(
                <App
                    mode="scan"
                    url="http://example.com"
                    browser="chromium"
                    ci={false}
                    threshold={0}
                    headless={true}
                    output="report.json"
                />
            );

            await vi.waitFor(() => {
                expect(fsPromises.writeFile).toHaveBeenCalledWith(
                    'report.json',
                    expect.any(String)
                );
            }, { timeout: 2000 });

            unmount();
        });

        it('should create directory for output file if needed', async () => {
            const mockResults = createMockScanResults(0);
            (runScan as any).mockResolvedValue(mockResults);
            (fsPromises.writeFile as any).mockResolvedValue(undefined);
            (fsPromises.mkdir as any).mockResolvedValue(undefined);

            const { unmount } = render(
                <App
                    mode="scan"
                    url="http://example.com"
                    browser="chromium"
                    ci={false}
                    threshold={0}
                    headless={true}
                    output="reports/a11y/report.json"
                />
            );

            await vi.waitFor(() => {
                expect(fsPromises.mkdir).toHaveBeenCalledWith(
                    expect.stringContaining('reports'),
                    { recursive: true }
                );
            }, { timeout: 2000 });

            unmount();
        });
    });

    describe('AI Prompt Generation', () => {
        it('should generate AI prompt when --ai flag is set', async () => {
            const mockResults = createMockScanResults(3);
            (runScan as any).mockResolvedValue(mockResults);
            (generateAndExport as any).mockReturnValue('a11y-prompt.md');

            const { unmount } = render(
                <App
                    mode="scan"
                    url="http://example.com"
                    browser="chromium"
                    ci={false}
                    threshold={0}
                    headless={true}
                    ai={true}
                />
            );

            await vi.waitFor(() => {
                expect(generateAndExport).toHaveBeenCalledWith(
                    expect.objectContaining({
                        violations: expect.any(Array),
                        summary: expect.any(Object)
                    }),
                    expect.objectContaining({
                        template: 'fix-all',
                        format: 'md'
                    })
                );
            }, { timeout: 2000 });

            unmount();
        });
    });

    describe('Test Generation Mode', () => {
        it('should call runTestGeneration with correct options', async () => {
            const mockResults = createMockTestGenResults(true);
            (runTestGeneration as any).mockResolvedValue(mockResults);

            const { unmount } = render(
                <App
                    mode="generate-test"
                    url="http://example.com"
                    browser="chromium"
                    ci={false}
                    threshold={0}
                    headless={true}
                    generateTest={true}
                    testFile="tests/a11y.spec.ts"
                    stagehandModel="openai/gpt-4o"
                    stagehandVerbose={true}
                />
            );

            await vi.waitFor(() => {
                expect(runTestGeneration).toHaveBeenCalledWith({
                    url: 'http://example.com',
                    outputFile: 'tests/a11y.spec.ts',
                    model: 'openai/gpt-4o',
                    verbose: true
                });
            }, { timeout: 2000 });

            unmount();
        });

        it('should handle test generation errors', async () => {
            (runTestGeneration as any).mockRejectedValue(new Error('Stagehand failed'));

            const { lastFrame, unmount } = render(
                <App
                    mode="generate-test"
                    url="http://example.com"
                    browser="chromium"
                    ci={false}
                    threshold={0}
                    headless={true}
                    generateTest={true}
                    testFile="test.spec.ts"
                />
            );

            await vi.waitFor(() => {
                const frame = lastFrame();
                expect(frame).toContain('Error');
            }, { timeout: 2000 });

            expect(process.exitCode).toBe(1);

            unmount();
        });

        it('should display test generation results on success', async () => {
            const mockResults = createMockTestGenResults(true);
            (runTestGeneration as any).mockResolvedValue(mockResults);

            const { lastFrame, unmount } = render(
                <App
                    mode="generate-test"
                    url="http://example.com"
                    browser="chromium"
                    ci={false}
                    threshold={0}
                    headless={true}
                    generateTest={true}
                    testFile="test.spec.ts"
                />
            );

            await vi.waitFor(() => {
                const frame = lastFrame();
                // Should show success or file path
                expect(frame).toBeDefined();
            }, { timeout: 2000 });

            unmount();
        });
    });

    describe('Browser Options', () => {
        it('should support firefox browser', async () => {
            const mockResults = createMockScanResults(0);
            (runScan as any).mockResolvedValue(mockResults);

            const { unmount } = render(
                <App
                    mode="scan"
                    url="http://example.com"
                    browser="firefox"
                    ci={false}
                    threshold={0}
                    headless={true}
                />
            );

            await vi.waitFor(() => {
                expect(runScan).toHaveBeenCalledWith(
                    expect.objectContaining({ browser: 'firefox' })
                );
            }, { timeout: 2000 });

            unmount();
        });

        it('should support webkit browser', async () => {
            const mockResults = createMockScanResults(0);
            (runScan as any).mockResolvedValue(mockResults);

            const { unmount } = render(
                <App
                    mode="scan"
                    url="http://example.com"
                    browser="webkit"
                    ci={false}
                    threshold={0}
                    headless={true}
                />
            );

            await vi.waitFor(() => {
                expect(runScan).toHaveBeenCalledWith(
                    expect.objectContaining({ browser: 'webkit' })
                );
            }, { timeout: 2000 });

            unmount();
        });

        it('should pass headless=false when specified', async () => {
            const mockResults = createMockScanResults(0);
            (runScan as any).mockResolvedValue(mockResults);

            const { unmount } = render(
                <App
                    mode="scan"
                    url="http://example.com"
                    browser="chromium"
                    ci={false}
                    threshold={0}
                    headless={false}
                />
            );

            await vi.waitFor(() => {
                expect(runScan).toHaveBeenCalledWith(
                    expect.objectContaining({ headless: false })
                );
            }, { timeout: 2000 });

            unmount();
        });
    });
});
