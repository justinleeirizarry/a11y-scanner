#!/usr/bin/env node
// Suppress dotenv v17+ promotional messages before loading
process.env.DOTENV_CONFIG_QUIET = 'true';
import 'dotenv/config';
import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import App from './cli/App.js';
import { validateUrl, validateTags, validateThreshold, validateBrowser } from './utils/validation.js';
import { createOrchestrationService } from './services/index.js';

const cli = meow(
    `
  Usage
    $ react-a11y-scanner <url>
    $ a11y-scan <url>

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

  Test Generation (mutually exclusive with scan options)
    --generate-test    Enable test generation mode (skips accessibility scan)
    --test-file        Output file for generated test [default: generated-tests/<domain>-<timestamp>.spec.ts]
    --stagehand-model <model> AI model for test generation [default: openai/gpt-4o-mini]
    --stagehand-verbose       Enable verbose Stagehand logging

  Examples
    # Accessibility Scanning
    $ a11y-scan https://example.com
    $ a11y-scan https://example.com --browser firefox
    $ a11y-scan https://example.com --output report.json --ci
    $ a11y-scan https://example.com --ai --tree

    # Test Generation
    $ a11y-scan https://example.com --generate-test
    $ a11y-scan https://example.com --generate-test --test-file tests/a11y.spec.ts
    $ a11y-scan https://example.com --generate-test --stagehand-model openai/gpt-4o
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
    console.error('❌ Error: URL is required\n');
    cli.showHelp();
    process.exit(1);
}

const url = cli.input[0];

// Validate URL format and protocol
const urlValidation = validateUrl(url);
if (!urlValidation.valid) {
    console.error(`❌ Error: ${urlValidation.error}\n`);
    process.exit(1);
}

// Validate browser type
const browserValidation = validateBrowser(cli.flags.browser);
if (!browserValidation.valid) {
    console.error(`❌ Error: ${browserValidation.error}\n`);
    process.exit(1);
}

// Validate tags if provided
if (cli.flags.tags) {
    const tagsValidation = validateTags(cli.flags.tags);
    if (!tagsValidation.valid) {
        console.error(`❌ Error: ${tagsValidation.error}\n`);
        process.exit(1);
    }
}

// Validate threshold
const thresholdValidation = validateThreshold(cli.flags.threshold);
if (!thresholdValidation.valid) {
    console.error(`❌ Error: ${thresholdValidation.error}\n`);
    process.exit(1);
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
        console.error(`❌ Error: Cannot use ${conflictingFlags.map(f => f.name).join(', ')} with --generate-test\n`);
        console.error('Test generation mode is mutually exclusive with accessibility scan options.\n');
        process.exit(1);
    }
}

// Check if stdout is a TTY (interactive terminal)
const isTTY = process.stdout.isTTY === true;

// If not a TTY (non-interactive), use JSON output mode
if (!isTTY) {
    (async () => {
        try {
            const orchestration = createOrchestrationService();

            if (isTestGenerationMode) {
                // Test generation mode
                const testResults = await orchestration.performTestGeneration({
                    url,
                    outputFile: testOutputFile,
                    model: cli.flags.stagehandModel,
                    verbose: cli.flags.stagehandVerbose,
                });

                // Output JSON to stdout
                console.log(JSON.stringify(testResults, null, 2));
                process.exitCode = testResults.success ? 0 : 1;
            } else {
                // Accessibility scan mode
                const { results, ciPassed } = await orchestration.performScan({
                    url,
                    browser: cli.flags.browser as 'chromium' | 'firefox' | 'webkit',
                    headless: cli.flags.headless,
                    tags: cli.flags.tags ? cli.flags.tags.split(',') : undefined,
                    includeKeyboardTests: cli.flags.keyboardNav,
                    ciMode: cli.flags.ci,
                    ciThreshold: cli.flags.threshold,
                });

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

                // Handle CI mode
                if (cli.flags.ci) {
                    process.exitCode = ciPassed ? 0 : 1;
                } else {
                    process.exitCode = 0;
                }
            }
        } catch (error) {
            console.error(JSON.stringify({
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            }, null, 2));
            process.exitCode = 1;
        }
    })();
} else {
    // TTY mode: render the Ink UI
    const { waitUntilExit } = render(
        <App
            mode={isTestGenerationMode ? 'generate-test' : 'scan'}
            url={url}
            browser={cli.flags.browser as 'chromium' | 'firefox' | 'webkit'}
            output={cli.flags.output}
            ci={cli.flags.ci}
            threshold={cli.flags.threshold}
            headless={cli.flags.headless}
            ai={cli.flags.ai}
            tags={cli.flags.tags ? cli.flags.tags.split(',') : undefined}
            keyboardNav={cli.flags.keyboardNav}
            tree={cli.flags.tree}
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
            process.exit(process.exitCode || 0);
        } catch (error) {
            console.error('❌ Fatal error:', error instanceof Error ? error.message : String(error));
            if (error instanceof Error && error.stack) {
                console.error('\nStack trace:', error.stack);
            }
            process.exit(1);
        }
    })();
}
