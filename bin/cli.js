#!/usr/bin/env node
// Must set before any imports to suppress dotenv v17+ promotional messages
// (langsmith dependency auto-loads dotenv)
process.env.DOTENV_CONFIG_QUIET = 'true';
await import('@react-a11y-scanner/cli/dist/index.js');
