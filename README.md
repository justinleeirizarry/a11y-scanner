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

- 🔍 **React Fiber Inspection** - Scans the React component tree using Fiber internals
- ♿ **Accessibility Testing** - Runs axe-core to find WCAG violations
- 🎹 **Keyboard Navigation Testing** - Validates tab order, focus management, and shortcuts
- 🎯 **Component Attribution** - Maps violations to specific React components
- 🎨 **Beautiful Terminal UI** - Rich, interactive output powered by Ink
- 🌐 **Multi-Browser Support** - Test with Chromium, Firefox, or WebKit via Playwright
- 📊 **Detailed Reports** - JSON export for CI/CD integration

## Installation

```bash
npm install -g react-a11y-scanner
```

## Usage

### Quick Scan (Recommended)

```bash
npm start <url>
```

**Examples:**
```bash
# Scan your local app (production build)
npm start http://localhost:3000

# Scan any website
npm start https://example.com
```

> **Note:** For best results, scan **production builds** (not dev mode with HMR).
> See [INSTALL_MODE.md](INSTALL_MODE.md) for dev mode scanning options.

### Command Line Options

```bash
# Using the full command name
react-a11y-scanner https://example.com

# Or use the shorter alias
a11y-scan https://example.com
```

### With Options

```bash
# Use Firefox
a11y-scan https://example.com --browser firefox

# Export JSON report
a11y-scan https://example.com --output report.json

# CI mode (exit code 1 if violations found)
a11y-scan https://example.com --ci --threshold 0

# Show component hierarchy tree view
a11y-scan https://example.com --tree

# Generate AI prompt for fixes
a11y-scan https://example.com --ai

# Disable keyboard navigation tests
a11y-scan https://example.com --keyboard-nav=false
```

### Available Options


- `--browser, -b` - Browser to use: `chromium`, `firefox`, or `webkit` (default: `chromium`)
- `--output, -o` - Output file path for JSON report
- `--ci` - CI mode - exits with code 1 if violations exceed threshold
- `--threshold` - Maximum allowed violations in CI mode (default: `0`)
- `--headless` - Run browser in headless mode (default: `true`)
- `--keyboard-nav` - Run keyboard navigation tests (default: `true`)
- `--tree` - Show component hierarchy view (default: `false`)
- `--ai` - Generate AI prompt for fixing violations (markdown format)
- `--tags` - Comma-separated list of axe-core tags (e.g., `wcag2a,best-practice`)


## How It Works

1. **Launch Browser** - Opens a Playwright-controlled browser
2. **Detect React** - Verifies React is present on the page
3. **Scan Fiber Tree** - Traverses the React Fiber tree to map components
4. **Run Axe** - Executes axe-core accessibility tests
5. **Attribute Violations** - Maps violations to specific React components
6. **Display Results** - Shows beautiful terminal output with violation details

## Development

### Setup

```bash
npm install
npm run build
```

### Test with Fixture

```bash
npm start test/fixtures/test-app.html
```

### Project Structure

```
src/
├── index.tsx              # CLI entry point
├── types.ts               # TypeScript definitions
├── cli/
│   ├── App.tsx           # Main Ink app
│   └── components/       # UI components
├── browser/
│   └── launcher.ts       # Playwright automation
├── scanner/
│   └── browser-bundle.ts # Browser-side scanner
└── processor/
│   └── results-parser.ts # Results processing
```

## Requirements

- Node.js 18+
- A React application to scan (React 16, 17, 18, or 19)

## License

MIT

## Credits

- [Ink](https://github.com/vadimdemedes/ink) - Terminal UI framework
- [Playwright](https://playwright.dev/) - Browser automation  
- [axe-core](https://github.com/dequelabs/axe-core) - Accessibility testing
- [Bippy](https://github.com/itsjoekent/bippy) - React Fiber inspection
