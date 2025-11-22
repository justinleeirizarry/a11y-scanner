# React A11y Scanner

A CLI tool that combines React Fiber inspection with accessibility testing to provide component-specific violation reports.

## Features

- 🔍 **React Fiber Inspection** - Scans the React component tree using Fiber internals
- ♿ **Accessibility Testing** - Runs axe-core to find WCAG violations
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
react-a11y-scanner https://example.com
```

### With Options

```bash
# Use Firefox
react-a11y-scanner https://example.com --browser firefox

# Export JSON report
react-a11y-scanner https://example.com --output report.json

# CI mode (exit code 1 if violations found)
react-a11y-scanner https://example.com --ci --threshold 0
```

### Available Options

- `--browser, -b` - Browser to use: `chromium`, `firefox`, or `webkit` (default: `chromium`)
- `--output, -o` - Output file path for JSON report
- `--ci` - CI mode - exits with code 1 if violations exceed threshold
- `--threshold` - Maximum allowed violations in CI mode (default: `0`)
- `--headless` - Run browser in headless mode (default: `true`)

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
    └── results-parser.ts # Results processing
```

## Requirements

- Node.js 18+
- A React application to scan (React 16, 17, 18, or 19)

## Roadmap

- [x] Basic CLI with Ink UI
- [x] Playwright browser automation
- [x] Fiber tree scanning
- [x] Axe-core integration
- [ ] Enhanced violation attribution
- [ ] Component hierarchy view
- [ ] Watch mode
- [ ] Custom rule configuration
- [ ] IDE integration

## License

MIT

## Credits

- [Ink](https://github.com/vadimdemedes/ink) - Terminal UI framework
- [Playwright](https://playwright.dev/) - Browser automation  
- [axe-core](https://github.com/dequelabs/axe-core) - Accessibility testing
- [Bippy](https://github.com/itsjoekent/bippy) - React Fiber inspection
