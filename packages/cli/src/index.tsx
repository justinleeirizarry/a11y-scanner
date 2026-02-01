#!/usr/bin/env node
import { configDotenv } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Load .env from current directory or monorepo root (for pnpm workspace)
const envPaths = ['.env', '../../.env'].map(p => resolve(process.cwd(), p));
const envPath = envPaths.find(p => existsSync(p));
configDotenv({ path: envPath, quiet: true });
import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import { Effect } from 'effect';
import App from './App.js';
import type { BrowserType } from '@react-a11y-scanner/core';
import {
    validateUrl,
    validateTags,
    validateThreshold,
    validateBrowser,
    runScanAsPromise,
    AppLayer,
    createTestGenerationService,
    EXIT_CODES,
    setExitCode,
    exitWithCode,
    updateConfig,
    loadEnvConfig,
    hasEnvConfig,
    logger,
    LogLevel,
    generateAndExport,
} from '@react-a11y-scanner/core';

// Load configuration from environment variables (REACT_A11Y_*)
if (hasEnvConfig()) {
    updateConfig(loadEnvConfig());
}

const cli = meow(
    `
  Usage
    $ react-a11y-scanner <url>

  Accessibility Scan Options
    --browser, -b      Browser to use (chromium, firefox, webkit) [default: chromium]
    --output, -o       Output file path (JSON format)
    --ci               CI mode - exit with code 1 if violations found
    --threshold        Maximum allowed violations in CI mode [default: 0]
    --headless         Run browser in headless mode [default: true]
    --ai               Generate AI prompt for fixing violations (markdown)
    --tags             Comma-separated list of axe-core tags (e.g. wcag2a,best-practice)
    --keyboard-nav     Run keyboard navigation tests [default: true]
    --tree             Show component hierarchy view
    --quiet, -q        Minimal output - show only summary line

  Test Generation (mutually exclusive with scan options)
    --generate-test    Enable test generation mode (skips accessibility scan)
    --test-file        Output file for generated test [default: generated-tests/<domain>-<timestamp>.spec.ts]
    --stagehand-model <model> AI model for test generation [default: openai/gpt-4o-mini]
    --stagehand-verbose       Enable verbose Stagehand logging

  Examples
    # Accessibility Scanning
    $ react-a11y-scanner https://example.com
    $ react-a11y-scanner https://example.com --browser firefox
    $ react-a11y-scanner https://example.com --output report.json --ci
    $ react-a11y-scanner https://example.com --ai --tree

    # Test Generation
    $ react-a11y-scanner https://example.com --generate-test
    $ react-a11y-scanner https://example.com --generate-test --test-file tests/a11y.spec.ts
    $ react-a11y-scanner https://example.com --generate-test --stagehand-model openai/gpt-4o
`,
    {
        importMeta: import.meta,
        flags: {
            browser: {
                type: 'string',
                shortFlag: 'b',
                default: 'chromium',
            },
            output: {
                type: 'string',
                shortFlag: 'o',
            },
            ci: {
                type: 'boolean',
                default: false,
            },
            threshold: {
                type: 'number',
                default: 0,
            },
            headless: {
                type: 'boolean',
                default: true,
            },
            ai: {
                type: 'boolean',
                default: false,
            },
            tags: {
                type: 'string',
                default: '',
            },
            keyboardNav: {
                type: 'boolean',
                default: true,
            },
            tree: {
                type: 'boolean',
                default: false,
            },
            quiet: {
                type: 'boolean',
                shortFlag: 'q',
                default: false,
            },
            stagehandModel: {
                type: 'string',
            },
            stagehandVerbose: {
                type: 'boolean',
                default: false,
            },
            generateTest: {
                type: 'boolean',
                default: false,
            },
            testFile: {
                type: 'string',
            },
        },
    }
);

// Validate URL argument
if (cli.input.length === 0) {
    console.error('Error: URL is required\n');
    cli.showHelp();
    exitWithCode(EXIT_CODES.VALIDATION_ERROR);
}

const url = cli.input[0];

// Validate URL format and protocol
const urlValidation = validateUrl(url);
if (!urlValidation.valid) {
    console.error(`Error: ${urlValidation.error}\n`);
    exitWithCode(EXIT_CODES.VALIDATION_ERROR);
}

// Validate browser type
const browserValidation = validateBrowser(cli.flags.browser);
if (!browserValidation.valid) {
    console.error(`Error: ${browserValidation.error}\n`);
    exitWithCode(EXIT_CODES.VALIDATION_ERROR);
}

// Validate tags if provided
if (cli.flags.tags) {
    const tagsValidation = validateTags(cli.flags.tags);
    if (!tagsValidation.valid) {
        console.error(`Error: ${tagsValidation.error}\n`);
        exitWithCode(EXIT_CODES.VALIDATION_ERROR);
    }
}

// Validate threshold
const thresholdValidation = validateThreshold(cli.flags.threshold);
if (!thresholdValidation.valid) {
    console.error(`Error: ${thresholdValidation.error}\n`);
    exitWithCode(EXIT_CODES.VALIDATION_ERROR);
}

// Determine mode: test generation or accessibility scan
const isTestGenerationMode = cli.flags.generateTest;

// Helper to generate filename from URL with timestamp in generated-tests directory
const getFilenameFromUrl = (urlStr: string): string => {
    try {
        const urlObj = new URL(urlStr);
        const hostname = urlObj.hostname.replace(/^www\./, '');
        const sanitized = hostname.replace(/[^a-z0-9]/gi, '-').toLowerCase();

        // Generate timestamp: YYYY-MM-DD-HHmmss
        const now = new Date();
        const timestamp = now.toISOString()
            .replace(/T/, '-')
            .replace(/:/g, '')
            .replace(/\..+/, '')
            .slice(0, 17); // YYYY-MM-DD-HHmmss

        return `generated-tests/${sanitized}-${timestamp}.spec.ts`;
    } catch {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        return `generated-tests/a11y-test-${timestamp}.spec.ts`;
    }
};

// Determine output file for test generation
const testOutputFile = cli.flags.testFile || getFilenameFromUrl(url);

// Validate mutually exclusive flags
if (isTestGenerationMode) {
    const scanOnlyFlags = [
        { flag: 'ai', name: '--ai' },
        { flag: 'tree', name: '--tree' },
        { flag: 'output', name: '--output' },
        { flag: 'ci', name: '--ci' },
        { flag: 'tags', name: '--tags' },
    ];

    const conflictingFlags = scanOnlyFlags.filter(({ flag }) => {
        const value = cli.flags[flag as keyof typeof cli.flags];
        return flag === 'tags' ? value !== '' : !!value;
    });

    if (conflictingFlags.length > 0) {
        console.error(`Error: Cannot use ${conflictingFlags.map(f => f.name).join(', ')} with --generate-test\n`);
        console.error('Test generation mode is mutually exclusive with accessibility scan options.\n');
        exitWithCode(EXIT_CODES.VALIDATION_ERROR);
    }
}

// Check if stdout is a TTY (interactive terminal)
const isTTY = process.stdout.isTTY === true;

// Set logger to silent in quiet mode
if (cli.flags.quiet) {
    logger.setLevel(LogLevel.SILENT);
}

// If not a TTY (non-interactive), use JSON output mode
if (!isTTY) {
    (async () => {
        try {
            if (isTestGenerationMode) {
                // Test generation mode
                const testGenService = createTestGenerationService();
                try {
                    await Effect.runPromise(testGenService.init({ model: cli.flags.stagehandModel, verbose: cli.flags.stagehandVerbose }));
                    await Effect.runPromise(testGenService.navigateTo(url));
                    const elements = await Effect.runPromise(testGenService.discoverElements());
                    const testContent = await Effect.runPromise(testGenService.generateTest(url, elements));

                    // Write test file
                    const fs = await import('fs/promises');
                    const path = await import('path');
                    const dir = path.dirname(testOutputFile);
                    if (dir !== '.') {
                        await fs.mkdir(dir, { recursive: true }).catch(() => {});
                    }
                    await fs.writeFile(testOutputFile, testContent);

                    const testResults = {
                        url,
                        timestamp: new Date().toISOString(),
                        outputFile: testOutputFile,
                        elementsDiscovered: elements.length,
                        elements,
                        success: true,
                    };

                    // Output JSON to stdout
                    console.log(JSON.stringify(testResults, null, 2));
                    setExitCode(EXIT_CODES.SUCCESS);
                } catch (error) {
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    const testResults = {
                        url,
                        timestamp: new Date().toISOString(),
                        outputFile: testOutputFile,
                        elementsDiscovered: 0,
                        elements: [],
                        success: false,
                        error: errorMsg,
                    };
                    console.log(JSON.stringify(testResults, null, 2));
                    setExitCode(EXIT_CODES.RUNTIME_ERROR);
                } finally {
                    await Effect.runPromise(testGenService.close());
                }
            } else {
                // Accessibility scan mode using Effect-based orchestration
                const { results, ciPassed } = await runScanAsPromise({
                    url,
                    browser: cli.flags.browser as BrowserType,
                    headless: cli.flags.headless,
                    tags: cli.flags.tags ? cli.flags.tags.split(',') : undefined,
                    includeKeyboardTests: cli.flags.keyboardNav,
                    ciMode: cli.flags.ci,
                    ciThreshold: cli.flags.threshold,
                }, AppLayer);

                // In quiet mode, output plain text; otherwise full JSON
                if (cli.flags.quiet) {
                    const { summary, violations } = results;
                    const statusIcon = summary.totalViolations > 0 ? 'x' : 'v';
                    console.log(`${statusIcon} ${url} - ${summary.totalViolations} violations, ${summary.totalPasses} passes`);

                    if (summary.totalViolations > 0) {
                        const { violationsBySeverity } = summary;
                        const severityParts = [];
                        if (violationsBySeverity.critical > 0) severityParts.push(`${violationsBySeverity.critical} critical`);
                        if (violationsBySeverity.serious > 0) severityParts.push(`${violationsBySeverity.serious} serious`);
                        if (violationsBySeverity.moderate > 0) severityParts.push(`${violationsBySeverity.moderate} moderate`);
                        if (violationsBySeverity.minor > 0) severityParts.push(`${violationsBySeverity.minor} minor`);
                        if (severityParts.length > 0) console.log(severityParts.join(' '));
                    }

                    for (const violation of violations) {
                        console.log(`[${violation.impact}] ${violation.id}: ${violation.description}`);
                        for (const node of violation.nodes) {
                            const componentName = node.userComponentPath?.length
                                ? node.userComponentPath[node.userComponentPath.length - 1]
                                : node.component || 'Unknown';
                            console.log(`  - ${componentName}${node.cssSelector ? ` (${node.cssSelector})` : ''}`);
                        }
                        if (violation.helpUrl) console.log(`  Docs: ${violation.helpUrl}`);
                    }
                } else {
                    // Output JSON to stdout with circular reference handling
                    const seen = new WeakSet();
                    const jsonOutput = JSON.stringify(results, (key, value) => {
                        if (typeof value === 'object' && value !== null) {
                            if (seen.has(value)) {
                                return '[Circular]';
                            }
                            seen.add(value);
                        }
                        return value;
                    }, 2);
                    console.log(jsonOutput);
                }

                // Handle AI prompt generation
                if (cli.flags.ai) {
                    const promptPath = generateAndExport(
                        results,
                        {
                            template: 'fix-all',
                            format: 'md',
                            outputPath: undefined,
                        }
                    );
                    console.error(`AI prompt written to: ${promptPath}`);
                }

                // Handle CI mode
                if (cli.flags.ci) {
                    setExitCode(ciPassed ? EXIT_CODES.SUCCESS : EXIT_CODES.VIOLATIONS_FOUND);
                } else {
                    setExitCode(EXIT_CODES.SUCCESS);
                }
            }
        } catch (error) {
            console.error(JSON.stringify({
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            }, null, 2));
            setExitCode(EXIT_CODES.RUNTIME_ERROR);
        }
    })();
} else {
    // TTY mode: render the Ink UI
    const { waitUntilExit } = render(
        <App
            mode={isTestGenerationMode ? 'generate-test' : 'scan'}
            url={url}
            browser={cli.flags.browser as BrowserType}
            output={cli.flags.output}
            ci={cli.flags.ci}
            threshold={cli.flags.threshold}
            headless={cli.flags.headless}
            ai={cli.flags.ai}
            tags={cli.flags.tags ? cli.flags.tags.split(',') : undefined}
            keyboardNav={cli.flags.keyboardNav}
            tree={cli.flags.tree}
            quiet={cli.flags.quiet}
            generateTest={cli.flags.generateTest}
            testFile={testOutputFile}
            stagehandModel={cli.flags.stagehandModel}
            stagehandVerbose={cli.flags.stagehandVerbose}
        />
    );

    // Wait for app to finish and handle exit code
    (async () => {
        try {
            await waitUntilExit();
            // Exit code will be set by the App component
            exitWithCode((process.exitCode ?? EXIT_CODES.SUCCESS) as 0 | 1 | 2);
        } catch (error) {
            console.error('Fatal error:', error instanceof Error ? error.message : String(error));
            if (error instanceof Error && error.stack) {
                console.error('\nStack trace:', error.stack);
            }
            exitWithCode(EXIT_CODES.RUNTIME_ERROR);
        }
    })();
}
