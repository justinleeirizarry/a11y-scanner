#!/usr/bin/env node
import 'dotenv/config';
import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import App from './cli/App.js';
import { validateUrl, validateTags, validateThreshold, validateBrowser } from './utils/validation.js';
import { runScan } from './browser/launcher.js';

const cli = meow(
    `
  Usage
    $ react-a11y-scanner <url>
    $ a11y-scan <url>

  Options
    --browser, -b      Browser to use (chromium, firefox, webkit) [default: chromium]
    --output, -o       Output file path (JSON format)
    --ci               CI mode - exit with code 1 if violations found
    --threshold        Maximum allowed violations in CI mode [default: 0]
    --headless         Run browser in headless mode [default: true]
    --ai               Generate AI prompt for fixing violations (markdown)
    --tags             Comma-separated list of axe-core tags (e.g. wcag2a,best-practice)
    --keyboard-nav     Run keyboard navigation tests [default: true]
    --tree             Show component hierarchy view
    --stagehand        Enable AI-powered deep accessibility testing
    --stagehand-model  AI model to use (e.g., anthropic/claude-3-5-sonnet-20241022)
    --stagehand-model  AI model to use (e.g., anthropic/claude-3-5-sonnet-20241022)
    --stagehand-verbose Enable verbose Stagehand logging
    --generate-test    Generate a Playwright test script from Stagehand findings
    --help             Show this help message

  Examples
    $ a11y-scan https://example.com
    $ a11y-scan https://example.com --browser firefox
    $ a11y-scan https://example.com --output report.json --ci
    $ a11y-scan https://example.com --ai
    $ a11y-scan https://example.com --tree
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
            stagehand: {
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

// Check if stdout is a TTY (interactive terminal)
const isTTY = process.stdout.isTTY === true;

// If not a TTY (non-interactive), use JSON output mode
if (!isTTY) {
    (async () => {
        try {
            const scanResults = await runScan({
                url,
                browser: cli.flags.browser as 'chromium' | 'firefox' | 'webkit',
                headless: cli.flags.headless,
                tags: cli.flags.tags ? cli.flags.tags.split(',') : undefined,
                includeKeyboardTests: cli.flags.keyboardNav,
                stagehand: {
                    enabled: cli.flags.stagehand,
                    model: cli.flags.stagehandModel,
                    verbose: cli.flags.stagehandVerbose,
                },
            });

            // Output JSON to stdout with circular reference handling
            const seen = new WeakSet();
            const jsonOutput = JSON.stringify(scanResults, (key, value) => {
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
                const totalViolations = scanResults.summary.totalViolations;
                process.exitCode = totalViolations > cli.flags.threshold ? 1 : 0;
            } else {
                process.exitCode = 0;
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
            stagehand={cli.flags.stagehand}
            stagehandModel={cli.flags.stagehandModel}
            stagehandVerbose={cli.flags.stagehandVerbose}
            generateTest={cli.flags.generateTest}
        />
    );

    // Wait for app to finish and handle exit code
    (async () => {
        try {
            await waitUntilExit();
            // Exit code will be set by the App component
            process.exit(process.exitCode || 0);
        } catch (error) {
            console.error('❌ Fatal error during scan:', error instanceof Error ? error.message : String(error));
            if (error instanceof Error && error.stack) {
                console.error('\nStack trace:', error.stack);
            }
            process.exit(1);
        }
    })();
}
