#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import App from './cli/App.js';

const cli = meow(
    `
  Usage
    $ react-a11y-scanner <url>

  Options
    --browser, -b   Browser to use (chromium, firefox, webkit) [default: chromium]
    --output, -o    Output file path (JSON format)
    --ci            CI mode - exit with code 1 if violations found
    --threshold     Maximum allowed violations in CI mode [default: 0]
    --headless      Run browser in headless mode [default: true]
    --ai-prompts    Generate AI prompts for fixing violations
    --ai-template   Template to use (fix-all, explain, quick-wins, critical-only) [default: fix-all]
    --ai-format     Export format (txt, md, json) [default: txt]
    --ai-output     Custom output path for AI prompts
    --help          Show this help message

  Examples
    $ react-a11y-scanner https://example.com
    $ react-a11y-scanner https://example.com --browser firefox
    $ react-a11y-scanner https://example.com --output report.json --ci
    $ react-a11y-scanner https://example.com --ai-prompts
    $ react-a11y-scanner https://example.com --ai-prompts --ai-template explain
    $ react-a11y-scanner https://example.com --ai-prompts --ai-format md
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
            aiPrompts: {
                type: 'boolean',
                default: false,
            },
            aiTemplate: {
                type: 'string',
                default: 'fix-all',
            },
            aiFormat: {
                type: 'string',
                default: 'txt',
            },
            aiOutput: {
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

// Validate URL format
try {
    new URL(url);
} catch (error) {
    console.error(`❌ Error: Invalid URL "${url}"\n`);
    process.exit(1);
}

// Render the Ink app
const { waitUntilExit } = render(
    <App
        url={url}
        browser={cli.flags.browser as 'chromium' | 'firefox' | 'webkit'}
        output={cli.flags.output}
        ci={cli.flags.ci}
        threshold={cli.flags.threshold}
        headless={cli.flags.headless}
        aiPrompts={cli.flags.aiPrompts}
        aiTemplate={cli.flags.aiTemplate}
        aiFormat={cli.flags.aiFormat as 'txt' | 'md' | 'json'}
        aiOutput={cli.flags.aiOutput}
    />
);

// Wait for app to finish and handle exit code
waitUntilExit().then(() => {
    // Exit code will be set by the App component
}).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
