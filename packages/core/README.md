# @aria51/core

Core accessibility scanning engine. Combines [axe-core](https://github.com/dequelabs/axe-core) with keyboard navigation testing, 34 WCAG 2.2 checks, screen reader simulation, and page structure analysis.

## Install

```bash
npm install @aria51/core
```

Requires Playwright browsers:

```bash
npx playwright install chromium
```

## Usage

### Scan a URL

```typescript
import { runScanAsPromise, AppLayer } from '@aria51/core';

const { results, duration } = await runScanAsPromise({
  url: 'https://example.com',
  browser: 'chromium',
  headless: true,
}, AppLayer);

console.log(`${results.violations.length} violations in ${duration}ms`);
```

### Scan multiple URLs

```typescript
import { runMultiScanAsPromise, AppLayer } from '@aria51/core';

const results = await runMultiScanAsPromise(
  ['https://example.com', 'https://example.com/about'],
  { browser: 'chromium' },
  AppLayer,
);
```

### Focused audits

```typescript
import { auditKeyboard, auditStructure, auditScreenReader } from '@aria51/core';

// Keyboard navigation: tab order, focus traps, skip links
const keyboard = await auditKeyboard('https://example.com', { maxTabs: 50 });

// Page structure: landmarks, headings, form labels
const structure = await auditStructure('https://example.com');

// Screen reader: alt text, ARIA, lang attributes, labels
const screenReader = await auditScreenReader('https://example.com');
```

### Configuration

Configuration is loaded in order of precedence: CLI flags > environment variables > config file.

```typescript
import { loadConfig, getConfig, updateConfig } from '@aria51/core';

// Load from .aria51rc.json / .aria51rc.yaml / etc.
await loadConfig();

// Override programmatically
updateConfig({ browser: 'firefox', headless: false });
```

Environment variables: `ARIA51_BROWSER`, `ARIA51_HEADLESS`, `ARIA51_MOBILE`, and more. See `getSupportedEnvVars()` for the full list.

## API

**Scanning:** `runScanAsPromise`, `runMultiScanAsPromise`, `performScan`, `performScanWithCleanup`

**Focused audits:** `auditKeyboard`, `auditStructure`, `auditScreenReader`

**Configuration:** `getConfig`, `updateConfig`, `loadConfig`, `loadEnvConfig`, `loadConfigFile`, `DEFAULT_CONFIG`

**WCAG data:** `WCAG_CRITERIA`, `AXE_WCAG_MAP`, `getAllCriteria`, `getCriterionById`, `getWcagCriteriaForViolation`

**Validation:** `validateUrl`, `validateBrowser`, `validateTags`, `validateThreshold`

**Utilities:** `logger`, `EXIT_CODES`, `setExitCode`, `exitWithCode`, `ScanError`

**Effect services:** `BrowserServiceTag`, `ScannerServiceTag`, `ResultsProcessorServiceTag`, `AppLayer`

## License

MIT
