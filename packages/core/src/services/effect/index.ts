/**
 * Effect Service Layer Exports
 *
 * This module provides Effect-based service interfaces and implementations
 * for type-safe dependency injection and error handling.
 */

// Service Tags (interfaces)
export {
    BrowserService,
    ScannerService,
    ResultsProcessorService,
    type EffectBrowserService,
    type EffectScannerService,
    type EffectResultsProcessorService,
    type ScanWorkflowServices,
} from './tags.js';

// Service Layers (implementations)
export {
    BrowserServiceLive,
    BrowserServiceManual,
    ScannerServiceLive,
    ResultsProcessorServiceLive,
} from './layers.js';

// Composed Application Layers
export {
    AppLayer,
    AppLayerManual,
    CoreServicesLayer,
} from './app-layer.js';

// Browser Resource Management
export {
    type BrowserResource,
    makeBrowserResource,
    navigateTo,
    waitForPageStability,
    detectReact,
    withBrowser,
} from './browser-resource.js';

// Effect-based Orchestration
export {
    type EffectScanOptions,
    type EffectScanResult,
    type PerformScanError,
    performScan,
    performScanWithCleanup,
    runScanAsPromise,
} from './orchestration.js';
