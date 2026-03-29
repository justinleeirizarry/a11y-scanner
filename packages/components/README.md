# @aria51/components

Framework-agnostic component attribution for accessibility violations. When a violation is found in the DOM, this package traces it back to the source component — React, Vue, Svelte, Solid, or Preact.

## Install

```bash
npm install @aria51/components
```

## Usage

Component attribution is automatic when used with `@aria51/core`:

```typescript
import { runScanAsPromise, AppLayer } from '@aria51/core';
import { getComponentBundlePath } from '@aria51/components';

const { results } = await runScanAsPromise({
  url: 'https://your-app.com',
  componentBundlePath: getComponentBundlePath(),
}, AppLayer);

// Violations now include component source info
for (const violation of results.violations) {
  for (const node of violation.nodes) {
    if (node.componentInfo) {
      console.log(`${violation.id} in <${node.componentInfo.name}> at ${node.componentInfo.sourceFile}:${node.componentInfo.line}`);
    }
  }
}
```

The CLI enables component attribution by default — disable with `--no-components`.

## How it works

A browser bundle is injected into the page via Playwright. It uses [element-source](https://github.com/nicolo-ribaudo/element-source) to detect which framework is running and map DOM elements back to their source components. Framework detection is automatic.

## API

- `ComponentPlugin` — Plugin instance
- `getComponentBundlePath()` — Path to the browser bundle for injection
- `getDetectionScript()` — JavaScript for browser-side detection
- `resolveComponent()` — Map an element to its source component
- `generateCssSelector()` — CSS selector for an element
- `isFrameworkComponent()` — Check if element is a framework component

## Supported frameworks

React, Preact, Vue, Svelte, Solid

## License

MIT
