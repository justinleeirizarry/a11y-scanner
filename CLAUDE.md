# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Build everything (TypeScript + browser bundle)
npm run build

# Watch mode for development
npm run dev              # TypeScript watch
npm run dev:scanner      # Browser bundle watch (esbuild)

# Run the CLI
npm start <url>          # e.g., npm start http://localhost:3000

# Run tests
npm test                 # Run all tests once
npm run test:watch       # Watch mode
npm run test:ui          # Vitest UI
npm run test:coverage    # With coverage

# Test with fixture
npm run test:fixture     # Scans test/fixtures/test-app.html
```

## Architecture Overview

This is a CLI tool that scans React applications for accessibility violations by combining React Fiber inspection with axe-core testing.

### Two Build Outputs

1. **Node CLI** (`dist/*.js`) - Main CLI application built with TypeScript
2. **Browser Bundle** (`dist/scanner-bundle.js`) - Injected into pages via Playwright, built with esbuild as an IIFE

### Core Flow

```
src/index.tsx (CLI entry with meow)
    → src/cli/App.tsx (Ink React UI)
    → src/browser/launcher.ts (Playwright browser control)
        → Injects dist/scanner-bundle.js into page
        → src/scanner/browser-bundle.ts executes in browser context
            → fiber/traversal.ts (finds React Fiber root, traverses tree)
            → axe/runner.ts (runs axe-core)
            → axe/attribution.ts (maps violations to React components)
            → keyboard/index.ts (keyboard navigation tests)
    → src/processor/results-parser.ts (processes raw data into ScanResults)
```

### Key Directories

- `src/cli/` - Ink-based terminal UI components
- `src/scanner/` - Browser-context code (bundled separately)
  - `fiber/` - React Fiber tree traversal using Bippy
  - `axe/` - axe-core integration and violation attribution
  - `keyboard/` - Keyboard accessibility testing
  - `stagehand/` - Stagehand AI integration for test generation
- `src/browser/` - Playwright browser launcher
- `src/prompts/` - AI prompt generation templates

### MCP Server

The tool includes an MCP server (`src/mcp-server.ts`) exposing the `scan_url` tool for use with Claude Desktop and other MCP clients.

### Operating Modes

1. **Accessibility Scan** (default) - Scans page for violations, attributes to React components
2. **Test Generation** (`--generate-test`) - Uses Stagehand AI to discover interactive elements and generate Playwright tests

### Important Types

All core types are in `src/types.ts`:
- `ScanResults` - Final output structure
- `AttributedViolation` - Violation with React component attribution
- `KeyboardTestResults` - Keyboard navigation test results
- `ComponentInfo` - React component info from Fiber traversal

### Testing Notes

- Unit tests are co-located with source files (`*.test.ts`)
- Tests use Vitest with jsdom for DOM testing
- Browser bundle (`scanner/browser-bundle.ts`) is excluded from unit tests as it runs in browser context
- Use `test/fixtures/test-app.html` for manual testing
