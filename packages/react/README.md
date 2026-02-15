# React A11y Scanner

```
  ██████╗ ███████╗ █████╗  ██████╗████████╗     █████╗  ██╗ ██╗██╗   ██╗
  ██╔══██╗██╔════╝██╔══██╗██╔════╝╚══██╔══╝    ██╔══██╗███║███║╚██╗ ██╔╝
  ██████╔╝█████╗  ███████║██║        ██║       ███████║╚██║╚██║ ╚████╔╝
  ██╔══██╗██╔══╝  ██╔══██║██║        ██║       ██╔══██║ ██║ ██║  ╚██╔╝
  ██║  ██║███████╗██║  ██║╚██████╗   ██║       ██║  ██║ ██║ ██║   ██║
  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝   ╚═╝       ╚═╝  ╚═╝ ╚═╝ ╚═╝   ╚═╝
  ███████╗ ██████╗ █████╗ ███╗   ██╗███╗   ██╗███████╗██████╗
  ██╔════╝██╔════╝██╔══██╗████╗  ██║████╗  ██║██╔════╝██╔══██╗
  ███████╗██║     ███████║██╔██╗ ██║██╔██╗ ██║█████╗  ██████╔╝
  ╚════██║██║     ██╔══██║██║╚██╗██║██║╚██╗██║██╔══╝  ██╔══██╗
  ███████║╚██████╗██║  ██║██║ ╚████║██║ ╚████║███████╗██║  ██║
  ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝
```

An accessibility scanner that uses React Fiber inspection to map WCAG violations directly to the React components that caused them.

## Features

- **React Component Attribution** - Traverses the React Fiber tree to map each violation to the responsible component, giving you a stack trace instead of just a CSS selector
- **axe-core + WCAG 2.2** - Runs axe-core for WCAG violation detection with additional WCAG 2.2 checks
- **Keyboard Navigation Testing** - Validates tab order, focus management, and keyboard shortcuts
- **Component Hierarchy View** - `--tree` flag shows violations organized by React component tree
- **AI Fix Suggestions** - `--ai` flag generates a markdown prompt with component-specific fix instructions
- **Multi-Browser** - Test with Chromium, Firefox, or WebKit via Playwright
- **CI/CD Ready** - JSON output, configurable violation thresholds, and exit codes for pipelines
- **MCP Server** - Expose scanning as a tool for Claude Desktop and other MCP clients

## Installation

```bash
npm install -g react-a11y-scanner
```

## Quick Start

```bash
# Scan a React app with component attribution
a11y-toolkit http://localhost:3000 --react

# Scan any website (without React attribution)
a11y-toolkit https://example.com
```

> **Note:** For best results, scan **production builds** (not dev mode with HMR). The `--react` flag enables Fiber tree traversal for component attribution.
>
> **Tip:** To get readable component names in violation reports, disable name mangling in your bundler:
>
> - **Next.js:** `next build --no-mangling`
> - **Vite:** Set `esbuild: { keepNames: true }` in vite.config.js
> - **Webpack/Terser:** Set `terserOptions: { keep_classnames: true, keep_fnames: true }` in TerserPlugin config

## Usage

```bash
# React app with component hierarchy tree
a11y-toolkit http://localhost:3000 --react --tree

# Generate AI fix prompt with component context
a11y-toolkit http://localhost:3000 --react --ai

# Export JSON report
a11y-toolkit https://example.com --output report.json

# CI mode (exit code 1 if violations exceed threshold)
a11y-toolkit https://example.com --ci --threshold 0

# Use Firefox
a11y-toolkit https://example.com --browser firefox

# Filter by axe-core tags
a11y-toolkit https://example.com --tags wcag2a,best-practice

# Quiet mode - summary only
a11y-toolkit https://example.com --quiet

# Disable keyboard navigation tests
a11y-toolkit https://example.com --keyboard-nav=false
```

### Options

| Option           | Short | Description                                                  | Default    |
| ---------------- | ----- | ------------------------------------------------------------ | ---------- |
| `--react`        |       | Enable React Fiber inspection and component attribution      | `false`    |
| `--browser`      | `-b`  | Browser: `chromium`, `firefox`, or `webkit`                  | `chromium` |
| `--output`       | `-o`  | Output file path for JSON report                             | -          |
| `--ci`           |       | CI mode - exit with code 1 if violations exceed threshold    | `false`    |
| `--threshold`    |       | Maximum allowed violations in CI mode                        | `0`        |
| `--headless`     |       | Run browser in headless mode                                 | `true`     |
| `--keyboard-nav` |       | Run keyboard navigation tests                                | `true`     |
| `--tree`         |       | Show component hierarchy view                                | `false`    |
| `--ai`           |       | Generate AI prompt for fixing violations                     | `false`    |
| `--tags`         |       | Comma-separated axe-core tags (e.g., `wcag2a,best-practice`) | -          |
| `--quiet`        | `-q`  | Minimal output - show only summary line                      | `false`    |

### Exit Codes

| Code | Description                                                     |
| ---- | --------------------------------------------------------------- |
| `0`  | Success (no violations, or within threshold)                    |
| `1`  | Violations found exceeding threshold (CI mode) or runtime error |
| `2`  | Validation error (invalid URL, flags, etc.)                     |

## MCP Server

Use the scanner as a tool in Claude Desktop or any MCP client. Add to your config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "react-a11y-scanner": {
      "command": "mcp-server"
    }
  }
}
```

The `scan_url` tool accepts:

- `url` (required) - The URL to scan
- `browser` - `chromium`, `firefox`, or `webkit` (default: `chromium`)
- `mobile` - Emulate a mobile device (default: `false`)
- `include_tree` - Include full accessibility tree (default: `false`)

## How It Works

The scanner launches a real browser via Playwright, navigates to your URL, and runs two passes:

1. **axe-core scan** - Detects WCAG violations in the rendered DOM
2. **React Fiber traversal** (with `--react`) - Walks the Fiber tree using [Bippy](https://github.com/aidenybai/bippy) to build a map of DOM nodes to React components

Violations are then attributed to the React component that rendered the offending element, giving you output like:

```
[serious] image-alt: Images must have alternate text
  - ProductCard > img (div.product-grid > div:nth-child(2) > img)
```

Instead of just a CSS selector, you get the component name and its position in the React tree.

## Requirements

- Node.js 18+
- React 16, 17, 18, or 19 (for component attribution via `--react`)

## Built With

- **[Playwright](https://playwright.dev/)** - Browser automation
- **[axe-core](https://github.com/dequelabs/axe-core)** - Accessibility testing engine
- **[Bippy](https://github.com/aidenybai/bippy)** - React Fiber inspection
- **[Ink](https://github.com/vadimdemedes/ink)** - Terminal UI framework
