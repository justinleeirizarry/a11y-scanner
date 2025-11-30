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
- **Detailed Reports** - JSON export for CI/CD integration
- **MCP Server** - Use with Claude Desktop and other MCP clients

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

# Quiet mode - minimal output
a11y-scan https://example.com --quiet

# Disable keyboard navigation tests
a11y-scan https://example.com --keyboard-nav=false
```

### Available Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--browser` | `-b` | Browser to use: `chromium`, `firefox`, or `webkit` | `chromium` |
| `--output` | `-o` | Output file path for JSON report | - |
| `--ci` | | CI mode - exits with code 1 if violations exceed threshold | `false` |
| `--threshold` | | Maximum allowed violations in CI mode | `0` |
| `--headless` | | Run browser in headless mode | `true` |
| `--keyboard-nav` | | Run keyboard navigation tests | `true` |
| `--tree` | | Show component hierarchy view | `false` |
| `--ai` | | Generate AI prompt for fixing violations (markdown format) | `false` |
| `--tags` | | Comma-separated list of axe-core tags (e.g., `wcag2a,best-practice`) | - |
| `--quiet` | `-q` | Minimal output - show only summary line | `false` |

### Exit Codes

| Code | Description |
|------|-------------|
| `0` | Success (no violations, or violations within threshold) |
| `1` | Violations found exceeding threshold (CI mode) or runtime error |
| `2` | Input validation error (invalid URL, flags, etc.) |

### Test Generation Mode

Generate Playwright accessibility tests using AI:

```bash
# Generate test with default settings
a11y-scan https://example.com --generate-test

# Specify output file
a11y-scan https://example.com --generate-test --test-file tests/a11y.spec.ts

# Use a different AI model
a11y-scan https://example.com --generate-test --stagehand-model openai/gpt-4o
```

**Test Generation Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--generate-test` | Enable test generation mode (skips accessibility scan) | `false` |
| `--test-file` | Output file for generated test | `generated-tests/<domain>-<timestamp>.spec.ts` |
| `--stagehand-model` | AI model for test generation | `openai/gpt-4o-mini` |
| `--stagehand-verbose` | Enable verbose Stagehand logging | `false` |

> **Note:** Test generation requires `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` environment variable.

## Environment Variables

Configure default behavior using environment variables with the `REACT_A11Y_` prefix:

### Browser Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_A11Y_BROWSER_HEADLESS` | Run browser in headless mode | `true` |
| `REACT_A11Y_BROWSER_TIMEOUT` | Navigation timeout in milliseconds | `30000` |
| `REACT_A11Y_BROWSER_STABILIZATION_DELAY` | Delay after page load before scanning (ms) | `3000` |
| `REACT_A11Y_BROWSER_NETWORK_IDLE_TIMEOUT` | Timeout for network idle state (ms) | `5000` |
| `REACT_A11Y_BROWSER_POST_NAVIGATION_DELAY` | Delay after navigation before stability check (ms) | `2000` |

### Scan Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_A11Y_SCAN_MAX_RETRIES` | Maximum retry attempts for failed scans | `3` |
| `REACT_A11Y_SCAN_RETRY_DELAY_BASE` | Base delay between retries (ms) | `2000` |
| `REACT_A11Y_SCAN_MAX_ELEMENTS_TO_CHECK` | Maximum elements to check for React detection | `100` |

### Stagehand/AI Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_A11Y_STAGEHAND_ENABLED` | Enable Stagehand AI test generation | `false` |
| `REACT_A11Y_STAGEHAND_MODEL` | AI model for test generation | `anthropic/claude-3-5-sonnet-latest` |
| `REACT_A11Y_STAGEHAND_VERBOSE` | Enable verbose Stagehand logging | `false` |

## MCP Server (Claude Desktop Integration)

The scanner includes an MCP (Model Context Protocol) server for use with Claude Desktop and other MCP clients.

### Setup with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "react-a11y-scanner": {
      "command": "npx",
      "args": ["react-a11y-scanner", "mcp-server"]
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "react-a11y-scanner": {
      "command": "mcp-server"
    }
  }
}
```

### Available MCP Tool

**`scan_url`** - Scan a URL for accessibility violations

Parameters:
- `url` (required) - The URL to scan
- `browser` - Browser to use: `chromium`, `firefox`, or `webkit` (default: `chromium`)
- `mobile` - Emulate a mobile device (default: `false`)
- `include_tree` - Include the full accessibility tree in the response (default: `false`)

## How It Works

1. **Launch Browser** - Opens a Playwright-controlled browser
2. **Detect React** - Verifies React is present on the page
3. **Scan Fiber Tree** - Traverses the React Fiber tree to map components
4. **Run Axe** - Executes axe-core accessibility tests
5. **Attribute Violations** - Maps violations to specific React components
6. **Display Results** - Shows beautiful terminal output with violation details

## Architecture

The scanner uses a service-oriented architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      Entry Points                           │
│    CLI (index.tsx)  │  MCP Server  │  Programmatic API     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 OrchestrationService                        │
│  - Coordinates scan/test-gen workflows                      │
│  - Handles file output, CI logic                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐
│BrowserService │  │ScannerService │  │TestGenerationService  │
│- launch()     │  │- scan(page)   │  │- discoverElements()   │
│- navigate()   │  │- injectBundle │  │- generateTest()       │
│- close()      │  │               │  │                       │
└───────────────┘  └───────────────┘  └───────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              ResultsProcessorService                        │
│  - Transform raw data to ScanResults                        │
│  - Format for JSON, MCP, or CI output                       │
└─────────────────────────────────────────────────────────────┘
```

## Programmatic API

You can use the scanner services directly in your own code:

### Using OrchestrationService (Recommended)

```typescript
import { createOrchestrationService } from 'react-a11y-scanner/services';

const orchestration = createOrchestrationService();

// Perform a scan
const result = await orchestration.performScan({
    url: 'http://localhost:3000',
    browser: 'chromium',
    headless: true,
    includeKeyboardTests: true,
    ciMode: true,
    ciThreshold: 0,
});

console.log(`Found ${result.results.summary.totalViolations} violations`);
console.log(`CI Passed: ${result.ciPassed}`);

// Generate accessibility tests
const testResult = await orchestration.performTestGeneration({
    url: 'http://localhost:3000',
    outputFile: './tests/a11y.spec.ts',
    model: 'anthropic/claude-sonnet-4-20250514',
});

console.log(`Generated test with ${testResult.elements?.length} elements`);
```

### Using Individual Services

For more control, you can compose services directly:

```typescript
import {
    createBrowserService,
    createScannerService,
    createResultsProcessorService
} from 'react-a11y-scanner/services';

const browser = createBrowserService();
const scanner = createScannerService();
const processor = createResultsProcessorService();

// Launch and navigate
await browser.launch({ browserType: 'chromium', headless: true });
await browser.navigate('http://localhost:3000');
await browser.waitForStability();

// Scan the page
const page = browser.getPage();
const rawData = await scanner.scan(page, { includeKeyboardTests: true });

// Process results
const results = processor.process(rawData, {
    url: 'http://localhost:3000',
    browser: 'chromium'
});

// Format for different outputs
const json = processor.formatAsJSON(results, true);
const ciResult = processor.formatForCI(results, 0);

await browser.close();
```

### Service Interfaces

| Service | Purpose |
|---------|---------|
| `BrowserService` | Browser lifecycle management (launch, navigate, close) |
| `ScannerService` | In-page scanning with bundle injection |
| `ResultsProcessorService` | Results transformation and formatting |
| `TestGenerationService` | AI-driven interactive element discovery and test generation |
| `OrchestrationService` | High-level workflow coordination |

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
