# Accessibility Toolkit

A monorepo for accessibility testing tools. The core scanner is framework-agnostic; React component attribution, AI-powered auditing, and an MCP server are available as plugins.

## Packages

| Package | Description |
| ------- | ----------- |
| [`core`](packages/core) | Framework-agnostic scanning: axe-core, keyboard tests, WCAG 2.2 checks, fix suggestions |
| [`react`](packages/react) | React plugin: Fiber traversal via Bippy, component attribution for violations |
| [`cli`](packages/cli) | Ink-based terminal UI. Binary: `a11y-toolkit` |
| [`mcp`](packages/mcp) | MCP server exposing `scan_url` tool for Claude Desktop |
| [`ai-auditor`](packages/ai-auditor) | AI-powered auditing via Stagehand/Browserbase |
| [`web`](packages/web) | Next.js webapp with live Browserbase view for AI audits |

## Quick Start

```bash
# Install dependencies
pnpm install

# Build everything
pnpm build

# Scan a URL
pnpm start http://localhost:3000

# Scan with React component attribution
pnpm start http://localhost:3000 -- --react
```

## Development

```bash
# Watch mode (TypeScript, all packages)
pnpm dev

# Run tests
pnpm test

# Run a single test file
pnpm test src/path/to/file.test.ts

# Tests for a specific package
pnpm --filter @accessibility-toolkit/core test

# Build a specific package
pnpm --filter @accessibility-toolkit/core build
```

## Requirements

- Node.js 18+
- pnpm 8+
