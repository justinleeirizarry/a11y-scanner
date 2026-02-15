# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Build everything (TypeScript + browser bundles)
pnpm build

# Watch mode for development
pnpm dev              # TypeScript watch (all packages)

# Run the CLI
pnpm start <url>      # e.g., pnpm start http://localhost:3000

# Run tests
pnpm test             # Run all tests once (root vitest config)
pnpm test src/path/to/file.test.ts  # Run single test file
pnpm test:watch       # Watch mode
pnpm test:coverage    # With coverage

# Run tests for a specific package
pnpm --filter @accessibility-toolkit/core test
pnpm --filter @accessibility-toolkit/cli test

# Build individual packages
pnpm --filter @accessibility-toolkit/core build
pnpm --filter @accessibility-toolkit/web dev   # Next.js dev server
```

## Architecture Overview

This is a monorepo accessibility toolkit that scans websites for WCAG violations. Core scanning is framework-agnostic; React support and AI-powered auditing are optional plugins.

### Monorepo Structure (`packages/`)

- **`core`** (`@accessibility-toolkit/core`) - Framework-agnostic scanning: axe-core, keyboard tests, WCAG 2.2 checks, fix suggestions, Effect services, Playwright browser control
- **`react`** (`@accessibility-toolkit/react`) - React plugin: Fiber traversal via Bippy, component attribution. Implements `FrameworkPlugin` interface from core. Has its own esbuild browser bundle (`react-bundle.js`)
- **`ai-auditor`** (`@accessibility-toolkit/ai-auditor`) - AI-powered auditing via Stagehand/Browserbase. Requires `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`
- **`cli`** (`@accessibility-toolkit/cli`) - Ink-based terminal UI, meow for arg parsing. Binary: `a11y-toolkit`
- **`web`** (`@accessibility-toolkit/web`) - Next.js webapp with live Browserbase view for AI audits
- **`mcp`** (`@accessibility-toolkit/mcp`) - MCP server exposing `scan_url` tool for Claude Desktop

### Two Build Outputs per Scanner Package

1. **Node modules** (`dist/*.js`) - TypeScript compiled with `tsc`
2. **Browser bundles** - Injected into target pages via Playwright's `page.evaluate()`, built with esbuild as IIFEs:
   - `packages/core/dist/scanner-bundle.js` (global: `A11yScanner`) - Generic axe-core + keyboard + WCAG checks
   - `packages/react/dist/react-bundle.js` (global: `ReactA11yPlugin`) - Fiber traversal + component mapping

Browser bundles run in a different execution context (the scanned page's browser), not in Node. They are excluded from unit tests.

### Core Scan Flow

```
CLI (packages/cli/src/index.tsx → App.tsx)
  → Effect orchestration (packages/core/src/services/effect/orchestration.ts)
    → BrowserService: launch Playwright, navigate, wait for stability
    → ScannerService: inject scanner-bundle.js into page
      → In browser context: axe/runner.ts, keyboard/index.ts, wcag22/index.ts
    → (Optional) ReactPlugin: inject react-bundle.js, traverse Fiber tree
    → ResultsProcessorService: process results, format output
```

### Effect Service Architecture

Services use the [Effect](https://effect.website) library for dependency injection, typed errors, and resource management.

- **Tags** (`services/effect/tags.ts`) - Service interfaces as `Context.Tag` definitions: `BrowserService`, `ScannerService`, `ResultsProcessorService`, `TestGenerationService`
- **Layers** (`services/effect/layers.ts`) - Implementations. `BrowserServiceLive` is scoped (auto-closes browser); `BrowserServiceManual` is not
- **App Layer** (`services/effect/app-layer.ts`) - Pre-composed layers: `AppLayer` (scoped), `AppLayerManual`, `CoreServicesLayer` (for tests, no browser)
- **Orchestration** (`services/effect/orchestration.ts`) - Main scan workflow using `Effect.gen`

### Key Types

All in `packages/core/src/types.ts`:
- `ScanResults` - Complete scan output
- `AttributedViolation` - Violation mapped to React component (when using React plugin)
- `KeyboardTestResults` - Tab order, focus management, shortcuts
- `ComponentInfo` - React component from Fiber traversal
- `FrameworkPlugin` - Interface for framework-specific plugins (detect, scan, attribute)

### Testing Notes

- Tests are co-located (`*.test.ts` / `*.test.tsx`)
- Root `vitest.config.ts` runs all package tests with `node` environment
- `packages/core/vitest.config.ts` uses `jsdom` environment for DOM testing
- Browser bundle files are excluded from test runs
- Use `test/fixtures/test-app.html` for manual testing
