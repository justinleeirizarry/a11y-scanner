#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import App from './cli/App.js';

const cli = meow(
    `
  Usage
    $ react-a11y-scanner <url>
    $ a11y-scan <url>

  Options
    --browser, -b   Browser to use (chromium, firefox, webkit) [default: chromium]
    --output, -o    Output file path (JSON format)
    --tree          Show accessibility issues summary (element types with issues)
    --ci            CI mode - exit with code 1 if violations found
    --threshold     Maximum allowed violations in CI mode [default: 0]
    --headless      Run browser in headless mode [default: true]
    --ai            Generate AI prompt for fixing violations (markdown)
    --tags          Comma-separated list of axe-core tags (e.g. wcag2a,best-practice)
    --help          Show this help message

  Examples
    $ a11y-scan https://example.com
    $ a11y-scan https://example.com --browser firefox
    $ a11y-scan https://example.com --output report.json --ci
    $ a11y-scan https://example.com --ai
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
            tree: {
                type: 'boolean',
                default: false,
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
        ai={cli.flags.ai}
        tags={cli.flags.tags ? cli.flags.tags.split(',') : undefined}
        showTree={cli.flags.tree}
    />
);

// Wait for app to finish and handle exit code
waitUntilExit().then(() => {
    // Exit code will be set by the App component
}).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
