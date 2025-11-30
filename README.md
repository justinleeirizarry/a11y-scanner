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

A CLI tool that combines React Fiber inspection with accessibility testing to provide component-specific violation reports.

## Features

- **React Fiber Inspection** - Scans the React component tree using Fiber internals
- **Accessibility Testing** - Runs axe-core to find WCAG violations
- **Keyboard Navigation Testing** - Validates tab order, focus management, and shortcuts
- **Component Attribution** - Maps violations to specific React components
- **Beautiful Terminal UI** - Rich, interactive output powered by Ink
- **Multi-Browser Support** - Test with Chromium, Firefox, or WebKit via Playwright
- **JSON Reports** - Export for CI/CD integration
- **MCP Server** - Use with Claude Desktop and other MCP clients

## Installation

```bash
npm install -g react-a11y-scanner
```

## Usage

### Quick Scan

```bash
react-a11y-scanner https://example.com
```

Or scan your local app:

```bash
react-a11y-scanner http://localhost:3000
```

> **Note:** For best results, scan **production builds** (not dev mode with HMR).

### Options

```bash
# Use Firefox
react-a11y-scanner https://example.com --browser firefox

# Export JSON report
react-a11y-scanner https://example.com --output report.json

# CI mode (exit code 1 if violations found)
react-a11y-scanner https://example.com --ci --threshold 0

# Show component hierarchy tree view
react-a11y-scanner https://example.com --tree

# Generate AI prompt for fixes (see examples/sample-ai-prompt-output.md)
react-a11y-scanner https://example.com --ai

# Quiet mode - minimal output
react-a11y-scanner https://example.com --quiet

# Disable keyboard navigation tests
react-a11y-scanner https://example.com --keyboard-nav=false
```

### All Options

| Option           | Short | Description                                                  | Default    |
| ---------------- | ----- | ------------------------------------------------------------ | ---------- |
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

## MCP Server (Claude Desktop)

Use the scanner with Claude Desktop by adding to your config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "react-a11y-scanner": {
      "command": "mcp-server"
    }
  }
}
```

The `scan_url` tool will be available with parameters:

- `url` (required) - The URL to scan
- `browser` - `chromium`, `firefox`, or `webkit` (default: `chromium`)
- `mobile` - Emulate a mobile device (default: `false`)
- `include_tree` - Include full accessibility tree (default: `false`)

## Requirements

- Node.js 18+
- A React application to scan (React 16, 17, 18, or 19)

## Credits

Built with:

- <img src="https://github.com/vadimdemedes/ink/raw/master/media/logo.png" height="16" alt="" /> **[Ink](https://github.com/vadimdemedes/ink)** - Terminal UI framework
- <img src="https://playwright.dev/img/playwright-logo.svg" height="16" alt="" /> **[Playwright](https://playwright.dev/)** - Browser automation
- <img src="assets/axe-core-icon.png" height="16" alt="" /> **[axe-core](https://github.com/dequelabs/axe-core)** - Accessibility testing engine
- <img src="https://github.com/aidenybai/bippy/raw/main/.github/public/bippy.png" height="16" alt="" /> **[Bippy](https://github.com/aidenybai/bippy)** - React Fiber inspection
- <img src="https://www.stagehand.dev/logos/alt-logo.svg" height="16" alt="" /> **[Stagehand](https://github.com/browserbase/stagehand)** - AI browser automation
