# Effect Migration: Service-by-Service Breakdown

This document analyzes each service in the codebase and recommends the best Effect patterns for migration.

---

## Service Overview

| Service | Complexity | Has Resources | Has Errors | Recommended Pattern |
|---------|------------|---------------|------------|---------------------|
| **ResultsProcessorService** | Low | No | No | `Layer.succeed` (simple) |
| **ScannerService** | Medium | No | Yes | `Effect.gen` + retry |
| **BrowserService** | High | Yes (browser) | Yes | `Layer.scoped` + `Scope` |
| **TestGenerationService** | High | Yes (Stagehand) | Yes | `Layer.scoped` + `Scope` |
| **OrchestrationService** | High | Coordinates | Yes | `Effect.gen` with services |

---

## 1. ResultsProcessorService

**File**: `src/services/processor/ResultsProcessorService.ts`

### Current Implementation
```typescript
class ResultsProcessorService {
  process(data: BrowserScanData, metadata: ScanMetadata): ScanResults { ... }
  formatAsJSON(results: ScanResults, pretty?: boolean): string { ... }
  formatForMCP(results: ScanResults, options?: MCPFormatOptions): MCPToolContent[] { ... }
  formatForCI(results: ScanResults, threshold: number): CIResult { ... }
}
```

### Analysis
- **Pure functions**: All methods are synchronous data transformations
- **No resources**: No external connections or lifecycle
- **No errors**: Methods don't throw (validation is implicit)
- **No dependencies**: Doesn't need other services

### Effect Pattern: `Layer.succeed`

This is the simplest case - just wrap pure functions in a Layer.

```typescript
import { Context, Layer } from "effect";

// Service interface (unchanged)
export interface ResultsProcessorService {
  readonly process: (data: BrowserScanData, metadata: ScanMetadata) => ScanResults;
  readonly formatAsJSON: (results: ScanResults, pretty?: boolean) => string;
  readonly formatForMCP: (results: ScanResults, options?: MCPFormatOptions) => MCPToolContent[];
  readonly formatForCI: (results: ScanResults, threshold: number) => CIResult;
}

// Tag
export const ResultsProcessorService = Context.GenericTag<ResultsProcessorService>(
  "ResultsProcessorService"
);

// Layer - simple since no effects needed
export const ResultsProcessorServiceLive = Layer.succeed(
  ResultsProcessorService,
  {
    process: (data, metadata) => { /* existing logic */ },
    formatAsJSON: (results, pretty) => { /* existing logic */ },
    formatForMCP: (results, options) => { /* existing logic */ },
    formatForCI: (results, threshold) => { /* existing logic */ },
  }
);
```

### Migration Effort: LOW
- Can migrate first as proof of concept
- No async/await to handle
- No error handling changes needed

---

## 2. ScannerService

**File**: `src/services/scanner/ScannerService.ts`

### Current Implementation
```typescript
class ScannerService {
  private bundlePath: string;

  async isBundleInjected(page: Page): Promise<boolean> { ... }
  async injectBundle(page: Page): Promise<void> { ... }  // throws BrowserLaunchError
  async scan(page: Page, options?: ScanOptions): Promise<BrowserScanData> { ... }  // uses withRetry
}
```

### Analysis
- **Async operations**: Interacts with Playwright Page
- **Has errors**: `injectBundle` can throw `BrowserLaunchError`
- **Uses retry**: `scan` uses `withRetry` utility
- **No resources**: Doesn't own the Page (receives it as parameter)
- **Has config dependency**: Reads from `getConfig()`

### Effect Pattern: `Effect.gen` + `Effect.retry`

Use generator syntax for clean async flow and built-in retry.

```typescript
import { Effect, Schedule, Duration, pipe, Context, Layer } from "effect";

// Error types
export class BundleInjectionError extends Data.TaggedError("BundleInjectionError")<{
  readonly reason: string;
}> {}

export class ScanExecutionError extends Data.TaggedError("ScanExecutionError")<{
  readonly reason: string;
}> {}

// Service interface
export interface ScannerService {
  readonly isBundleInjected: (page: Page) => Effect.Effect<boolean>;
  readonly injectBundle: (page: Page) => Effect.Effect<void, BundleInjectionError>;
  readonly scan: (page: Page, options?: ScanOptions) => Effect.Effect<BrowserScanData, ScanExecutionError>;
}

export const ScannerService = Context.GenericTag<ScannerService>("ScannerService");

// Layer implementation
export const ScannerServiceLive = Layer.effect(
  ScannerService,
  Effect.gen(function* () {
    const config = yield* ConfigService;  // Inject config dependency
    const scanConfig = yield* config.get();
    const bundlePath = scanConfig.scan.bundlePath;

    return {
      isBundleInjected: (page) =>
        Effect.promise(() =>
          page.evaluate(() => typeof window.ReactA11yScanner !== "undefined")
        ),

      injectBundle: (page) =>
        Effect.gen(function* () {
          const alreadyInjected = yield* Effect.promise(() =>
            page.evaluate(() => typeof window.ReactA11yScanner !== "undefined")
          );
          if (alreadyInjected) return;

          yield* Effect.tryPromise({
            try: () => page.addScriptTag({ path: bundlePath }),
            catch: (e) => new BundleInjectionError({ reason: String(e) }),
          });

          // Verify
          const isInjected = yield* Effect.promise(() =>
            page.evaluate(() => typeof window.ReactA11yScanner !== "undefined")
          );
          if (!isInjected) {
            return yield* Effect.fail(new BundleInjectionError({
              reason: "Bundle failed to load in page context",
            }));
          }
        }),

      scan: (page, options) =>
        pipe(
          Effect.gen(function* () {
            // Inject bundle first
            yield* ScannerService.injectBundle(page);

            // Execute scan
            return yield* Effect.tryPromise({
              try: () => page.evaluate(/* scan logic */),
              catch: (e) => new ScanExecutionError({ reason: String(e) }),
            });
          }),
          // Built-in retry replaces withRetry utility
          Effect.retry(
            pipe(
              Schedule.recurs(scanConfig.scan.maxRetries - 1),
              Schedule.intersect(Schedule.linear(Duration.millis(scanConfig.scan.retryDelayBase)))
            )
          )
        ),
    };
  })
);
```

### Migration Effort: MEDIUM
- Async → Effect.promise/tryPromise
- withRetry → Effect.retry + Schedule
- Error handling → typed failures
- Config access → ConfigService dependency

---

## 3. BrowserService

**File**: `src/services/browser/BrowserService.ts`

### Current Implementation
```typescript
class BrowserService {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private config: BrowserServiceConfig | null = null;

  async launch(config: BrowserServiceConfig): Promise<void> { ... }  // throws BrowserLaunchError
  getPage(): Page | null { ... }
  getBrowser(): Browser | null { ... }
  isLaunched(): boolean { ... }
  async navigate(url: string, options?: NavigateOptions): Promise<void> { ... }
  async waitForStability(): Promise<StabilityCheckResult> { ... }
  async detectReact(): Promise<boolean> { ... }
  async close(): Promise<void> { ... }  // MUST be called to avoid leaks
}
```

### Analysis
- **Has resources**: Owns Browser and Page instances
- **Lifecycle management**: `launch()` → operations → `close()` pattern
- **Critical cleanup**: `close()` must be called to avoid browser leaks
- **Multiple errors**: `BrowserLaunchError`, implicit navigation errors
- **Stateful**: Tracks `browser`, `page`, `config` state

### Effect Pattern: `Layer.scoped` + `Effect.acquireRelease`

This is the ideal use case for Effect's resource management.

```typescript
import { Effect, Layer, Scope, Context, Data, pipe } from "effect";

// Error types
export class BrowserLaunchError extends Data.TaggedError("BrowserLaunchError")<{
  readonly browserType: string;
  readonly reason?: string;
}> {}

export class BrowserNotLaunchedError extends Data.TaggedError("BrowserNotLaunchedError")<{}> {}

export class NavigationError extends Data.TaggedError("NavigationError")<{
  readonly url: string;
  readonly reason?: string;
}> {}

// Service interface
export interface BrowserService {
  readonly getPage: () => Effect.Effect<Page, BrowserNotLaunchedError>;
  readonly getBrowser: () => Effect.Effect<Browser, BrowserNotLaunchedError>;
  readonly navigate: (url: string, options?: NavigateOptions) => Effect.Effect<void, NavigationError>;
  readonly waitForStability: () => Effect.Effect<StabilityCheckResult>;
  readonly detectReact: () => Effect.Effect<boolean>;
}

export const BrowserService = Context.GenericTag<BrowserService>("BrowserService");

// Scoped resource - browser is automatically closed when scope ends
export const makeBrowserResource = (config: BrowserServiceConfig) =>
  Effect.acquireRelease(
    // ACQUIRE: Launch browser
    Effect.tryPromise({
      try: async () => {
        const launchOptions = { headless: config.headless };
        let browser: Browser;

        switch (config.browserType) {
          case "chromium":
            browser = await chromium.launch(launchOptions);
            break;
          case "firefox":
            browser = await firefox.launch(launchOptions);
            break;
          case "webkit":
            browser = await webkit.launch(launchOptions);
            break;
          default:
            throw new Error(`Unsupported browser: ${config.browserType}`);
        }

        const page = await browser.newPage();
        return { browser, page };
      },
      catch: (error) =>
        new BrowserLaunchError({
          browserType: config.browserType,
          reason: error instanceof Error ? error.message : String(error),
        }),
    }),
    // RELEASE: Close browser (ALWAYS runs, even on error/interrupt)
    ({ browser, page }) =>
      Effect.promise(async () => {
        await page.close().catch(() => {});
        await browser.close().catch(() => {});
      })
  );

// Layer that provides BrowserService with automatic cleanup
export const BrowserServiceLive = (config: BrowserServiceConfig) =>
  Layer.scoped(
    BrowserService,
    Effect.gen(function* () {
      const { browser, page } = yield* makeBrowserResource(config);

      return {
        getPage: () => Effect.succeed(page),
        getBrowser: () => Effect.succeed(browser),
        navigate: (url, options) =>
          Effect.tryPromise({
            try: () => page.goto(url, { waitUntil: options?.waitUntil ?? "networkidle" }),
            catch: (e) => new NavigationError({ url, reason: String(e) }),
          }),
        waitForStability: () =>
          Effect.promise(async () => {
            // ... stability check logic
            return { isStable: true, navigationCount: 0 };
          }),
        detectReact: () =>
          Effect.promise(() =>
            page.evaluate(() => {
              // ... React detection logic
              return true;
            })
          ),
      };
    })
  );
```

### Usage Pattern
```typescript
// Old way (manual cleanup)
const browser = createBrowserService();
try {
  await browser.launch(config);
  await browser.navigate(url);
  // ...
} finally {
  await browser.close();  // Easy to forget!
}

// Effect way (automatic cleanup)
const program = Effect.gen(function* () {
  const browser = yield* BrowserService;
  yield* browser.navigate(url);
  // ...
});  // Browser automatically closes when scope ends

Effect.runPromise(
  Effect.scoped(
    Effect.provide(program, BrowserServiceLive({ browserType: "chromium", headless: true }))
  )
);
```

### Migration Effort: HIGH
- Major architectural change
- Removes mutable state in favor of scoped resources
- Eliminates need for manual close() calls
- Guarantees no browser leaks

---

## 4. TestGenerationService

**File**: `src/services/testgen/TestGenerationService.ts`

### Current Implementation
```typescript
class TestGenerationService {
  private scanner: StagehandScanner | null = null;
  private generator: TestGenerator;
  private config: TestGenerationConfig = {};

  async init(config?: TestGenerationConfig): Promise<void> { ... }
  isInitialized(): boolean { ... }
  getPage(): Page | null { ... }
  async navigateTo(url: string): Promise<void> { ... }  // throws if not initialized
  async discoverElements(): Promise<ElementDiscovery[]> { ... }
  generateTest(url: string, elements: ElementDiscovery[]): string { ... }  // pure
  async close(): Promise<void> { ... }  // MUST be called
}
```

### Analysis
- **Very similar to BrowserService**: Has `init()` → operations → `close()` lifecycle
- **Has resources**: Owns StagehandScanner instance
- **Stateful**: Tracks scanner, config
- **Mixed methods**: Some pure (`generateTest`), some async with lifecycle

### Effect Pattern: `Layer.scoped` + `Effect.acquireRelease`

Same pattern as BrowserService.

```typescript
import { Effect, Layer, Context, Data } from "effect";

// Error types
export class TestGenNotInitializedError extends Data.TaggedError("TestGenNotInitializedError")<{}> {}
export class ElementDiscoveryError extends Data.TaggedError("ElementDiscoveryError")<{
  readonly reason: string;
}> {}

// Service interface
export interface TestGenerationService {
  readonly getPage: () => Effect.Effect<Page | null>;
  readonly navigateTo: (url: string) => Effect.Effect<void, NavigationError>;
  readonly discoverElements: () => Effect.Effect<ElementDiscovery[], ElementDiscoveryError>;
  readonly generateTest: (url: string, elements: ElementDiscovery[]) => string;  // Pure, no Effect
}

export const TestGenerationService = Context.GenericTag<TestGenerationService>(
  "TestGenerationService"
);

// Scoped resource
export const makeStagehandResource = (config: TestGenerationConfig) =>
  Effect.acquireRelease(
    // ACQUIRE: Initialize Stagehand
    Effect.tryPromise({
      try: async () => {
        const scanner = new StagehandScanner({
          enabled: true,
          model: config.model,
          verbose: config.verbose,
        });
        const generator = new TestGenerator();
        return { scanner, generator };
      },
      catch: (e) => new TestGenNotInitializedError({}),
    }),
    // RELEASE: Close Stagehand
    ({ scanner }) => Effect.promise(() => scanner.close())
  );

export const TestGenerationServiceLive = (config: TestGenerationConfig) =>
  Layer.scoped(
    TestGenerationService,
    Effect.gen(function* () {
      const { scanner, generator } = yield* makeStagehandResource(config);

      return {
        getPage: () => Effect.succeed(scanner.page ?? null),
        navigateTo: (url) =>
          Effect.tryPromise({
            try: async () => {
              await scanner.init(url);
              const page = scanner.page;
              if (page) await page.goto(url, { waitUntil: "networkidle" });
            },
            catch: (e) => new NavigationError({ url, reason: String(e) }),
          }),
        discoverElements: () =>
          Effect.tryPromise({
            try: () => scanner.discoverElements(),
            catch: (e) => new ElementDiscoveryError({ reason: String(e) }),
          }),
        generateTest: (url, elements) => generator.generateTest(url, elements),  // Pure
      };
    })
  );
```

### Migration Effort: HIGH
- Similar to BrowserService
- Manages Stagehand lifecycle automatically

---

## 5. OrchestrationService

**File**: `src/services/orchestration/OrchestrationService.ts`

### Current Implementation
```typescript
class OrchestrationService {
  private browserService: BrowserService;
  private scannerService: ScannerService;
  private processorService: ResultsProcessorService;
  private testGenService: TestGenerationService;

  constructor() {
    // Creates all service instances
  }

  async performScan(options: ScanOperationOptions): Promise<ScanOperationResult> {
    try {
      // Launch browser, navigate, scan, process...
    } finally {
      await this.browserService.close();  // Manual cleanup
    }
  }

  async performTestGeneration(options: TestGenOperationOptions): Promise<TestGenerationResults> {
    try {
      // Initialize, navigate, discover, generate...
    } finally {
      await this.testGenService.close();  // Manual cleanup
    }
  }
}
```

### Analysis
- **Coordinates services**: Composes BrowserService, ScannerService, etc.
- **Manages lifecycle**: Responsible for calling close() in finally blocks
- **Entry point**: Main API for CLI and MCP
- **Error handling**: Try/finally for cleanup

### Effect Pattern: `Effect.gen` with service composition

With scoped services, OrchestrationService becomes much simpler - no manual cleanup needed.

```typescript
import { Effect, Layer, Context, pipe } from "effect";

// No longer needs to track service instances - they're injected
export const performScan = (options: ScanOperationOptions) =>
  Effect.gen(function* () {
    // Services are automatically injected
    const browser = yield* BrowserService;
    const scanner = yield* ScannerService;
    const processor = yield* ResultsProcessorService;

    // Navigate
    yield* browser.navigate(options.url);
    yield* browser.waitForStability();

    // Check React
    const hasReact = yield* browser.detectReact();
    if (!hasReact) {
      return yield* Effect.fail(new ReactNotDetectedError({ url: options.url }));
    }

    // Scan
    const page = yield* browser.getPage();
    const rawData = yield* scanner.scan(page, {
      tags: options.tags,
      includeKeyboardTests: options.includeKeyboardTests,
    });

    // Process (pure)
    const results = processor.process(rawData, {
      url: options.url,
      browser: options.browser,
    });

    return { results };
  });
  // NO FINALLY BLOCK NEEDED - browser closes automatically!

// Create the full application layer
export const AppLayer = (config: { browserType: string; headless: boolean }) =>
  Layer.mergeAll(
    BrowserServiceLive(config),
    ScannerServiceLive,
    ResultsProcessorServiceLive
  );

// Run the scan
export const runScan = (options: ScanOperationOptions) =>
  Effect.runPromise(
    Effect.scoped(
      Effect.provide(
        performScan(options),
        AppLayer({ browserType: options.browser, headless: options.headless })
      )
    )
  );
```

### Migration Effort: MEDIUM
- Simplifies significantly once other services are migrated
- Removes manual cleanup code
- Becomes pure composition of Effects

---

## Summary: Recommended Migration Order

1. **ResultsProcessorService** (LOW) - Pure functions, no async, great starting point
2. **ScannerService** (MEDIUM) - Learn Effect.gen + retry patterns
3. **BrowserService** (HIGH) - Learn resource management with Scope
4. **TestGenerationService** (HIGH) - Similar to BrowserService
5. **OrchestrationService** (MEDIUM) - Becomes simpler after others migrate

---

## Effect Patterns Quick Reference

| Pattern | Use When | Example |
|---------|----------|---------|
| `Layer.succeed` | Pure functions, no effects | ResultsProcessorService |
| `Effect.gen` | Async operations, sequencing | Scan workflow |
| `Effect.tryPromise` | Wrapping Promise-based APIs | Playwright operations |
| `Effect.retry + Schedule` | Retry with backoff | Scanner retries |
| `Layer.scoped` | Service with lifecycle | BrowserService |
| `Effect.acquireRelease` | Resource management | Browser launch/close |
| `Data.TaggedError` | Typed errors | All error types |
