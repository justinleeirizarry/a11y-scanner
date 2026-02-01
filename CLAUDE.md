# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Build everything (TypeScript + browser bundle)
pnpm build

# Watch mode for development
pnpm dev              # TypeScript watch
pnpm dev:scanner      # Browser bundle watch (esbuild)

# Run the CLI
pnpm start <url>          # e.g., pnpm start http://localhost:3000

# Run tests
pnpm test                 # Run all tests once
pnpm test src/path/to/file.test.ts  # Run single test file
pnpm test:watch       # Watch mode
pnpm test:ui          # Vitest UI
pnpm test:coverage    # With coverage

# Test with fixture
pnpm test:fixture     # Scans test/fixtures/test-app.html
```

## Architecture Overview

This is a monorepo CLI tool that scans React applications for accessibility violations by combining React Fiber inspection with axe-core testing.

### Monorepo Structure

- `packages/core` - Core scanning logic, services, and types
- `packages/cli` - Ink-based terminal UI
- `packages/mcp` - MCP server for Claude Desktop integration

### Two Build Outputs

1. **Node CLI** (`packages/cli/dist/*.js`) - Main CLI application built with TypeScript
2. **Browser Bundle** (`packages/core/dist/scanner-bundle.js`) - Injected into pages via Playwright, built with esbuild as an IIFE

### Core Flow

```
packages/cli/src/index.tsx (CLI entry with meow)
    → packages/cli/src/App.tsx (Ink React UI)
    → packages/core/src/services/effect/orchestration.ts (Effect-based scan orchestration)
        → BrowserService (Playwright browser control)
        → ScannerService (injects scanner-bundle.js)
            → packages/core/src/scanner/browser-bundle.ts executes in browser context
                → fiber/traversal.ts (finds React Fiber root, traverses tree)
                → axe/runner.ts (runs axe-core)
                → axe/attribution.ts (maps violations to React components)
                → keyboard/index.ts (keyboard navigation tests)
        → ResultsProcessorService (processes results, CI checks)
```

### Key Directories

- `packages/cli/src/` - Ink-based terminal UI components
- `packages/core/src/scanner/` - Browser-context code (bundled separately)
  - `fiber/` - React Fiber tree traversal using Bippy
  - `axe/` - axe-core integration and violation attribution
  - `keyboard/` - Keyboard accessibility testing
  - `stagehand/` - Stagehand AI integration for test generation
- `packages/core/src/services/` - Service layer
  - `effect/` - Effect-based service implementations (primary)
  - `browser/` - BrowserService (Playwright wrapper)
  - `scanner/` - ScannerService (bundle injection)
  - `processor/` - ResultsProcessorService
  - `testgen/` - TestGenerationService
- `packages/core/src/prompts/` - AI prompt generation templates
- `packages/mcp/src/` - MCP server implementation

### MCP Server

The tool includes an MCP server (`packages/mcp/src/server.ts`) exposing the `scan_url` tool for use with Claude Desktop and other MCP clients.

### Operating Modes

1. **Accessibility Scan** (default) - Scans page for violations, attributes to React components
2. **Test Generation** (`--generate-test`) - Uses Stagehand AI to discover interactive elements and generate Playwright tests (requires `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` env var)

### Important Types

All core types are in `packages/core/src/types.ts`:
- `ScanResults` - Final output structure
- `AttributedViolation` - Violation with React component attribution
- `KeyboardTestResults` - Keyboard navigation test results
- `ComponentInfo` - React component info from Fiber traversal

### Testing Notes

- Unit tests are co-located with source files (`*.test.ts`)
- Tests use Vitest with jsdom for DOM testing
- Browser bundle (`scanner/browser-bundle.ts`) is excluded from unit tests as it runs in browser context
- Use `test/fixtures/test-app.html` for manual testing
