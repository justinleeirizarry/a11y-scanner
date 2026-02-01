/**
 * @react-a11y-scanner/core
 *
 * Core library for React accessibility scanning. Combines React Fiber
 * inspection with axe-core testing to provide component-specific violation reports.
 */

// =============================================================================
// Services - Main API
// =============================================================================

export {
    // Browser Service
    BrowserService,
    createBrowserService,
    type BrowserServiceConfig,
    type NavigateOptions,
    type StabilityCheckResult,
    type IBrowserService,

    // Scanner Service
    ScannerService,
    createScannerService,
    type ScanExecutionOptions,
    type IScannerService,

    // Results Processor Service
    ResultsProcessorService,
    createResultsProcessorService,
    type ScanMetadata,
    type MCPToolContent,
    type MCPFormatOptions,
    type CIResult,
    type IResultsProcessorService,

    // Test Generation Service
    TestGenerationService,
    createTestGenerationService,
    type TestGenerationConfig,
    type ITestGenerationService,

    // Orchestration Types (service migrated to Effect-based implementation)
    type BaseScanOptions,
    type ScanOperationResult,
} from './services/index.js';

// =============================================================================
// Effect-based Services
// =============================================================================

export {
    // Effect orchestration
    runScanAsPromise,
    performScan,
    performScanWithCleanup,
    type EffectScanOptions,
    type EffectScanResult,
    type PerformScanError,

    // Effect service tags (for dependency injection)
    BrowserService as BrowserServiceTag,
    ScannerService as ScannerServiceTag,
    ResultsProcessorService as ResultsProcessorServiceTag,
    TestGenerationService as TestGenerationServiceTag,
    type EffectBrowserService,
    type EffectScannerService,
    type EffectResultsProcessorService,
    type EffectTestGenerationService,
    type ScanWorkflowServices,

    // Effect layers
    AppLayer,
    AppLayerManual,
    CoreServicesLayer,
    BrowserServiceLive,
    ScannerServiceLive,
    ResultsProcessorServiceLive,
    TestGenerationServiceLive,
} from './services/effect/index.js';

// =============================================================================
// Types
// =============================================================================

export type {
    // Core types
    ImpactLevel,
    ImpactLevelOrNull,
    SeverityLevel,
    WcagLevel,
    BrowserType,

    // Axe-core types
    AxeCheckResult,
    AxeNodeResult,
    AxeResult,
    AxeViolation,

    // Component types
    ComponentInfo,

    // Violation types
    FixSuggestion,
    RelatedNode,
    AttributedCheck,
    AttributedViolation,
    AttributedPass,
    AttributedIncomplete,

    // Keyboard testing types
    KeyboardTestResults,

    // Stagehand/test generation types
    StagehandConfig,
    ElementType,
    ElementDiscovery,
    StagehandResults,
    TestGenerationOptions,
    TestGenerationResults,

    // Scan types
    ScanResults,
    ScanOptions,
    ScanError as ScanErrorInfo,
    BrowserScanData,
    BrowserScanOptions,

    // Prompt types
    PromptTemplate,
    PromptContext,
    PromptExportOptions,

    // WCAG 2.2 types
    WCAG22Results,
    WCAG22ViolationSummary,

    // API types
    ReactA11yScannerAPI,
} from './types.js';

// =============================================================================
// Errors
// =============================================================================

// Legacy class-based errors (for Promise-based code)
export {
    ScanError,
    ReactNotDetectedError,
    NavigationTimeoutError,
    ContextDestroyedError,
    ScannerInjectionError,
    MaxRetriesExceededError,
    ConfigurationError,
    InvalidUrlError,
    FileSystemError,
    BrowserLaunchError,
    ServiceStateError,
    ScanDataError,
} from './errors/index.js';

// Effect-compatible errors (Data.TaggedError) - preferred for Effect workflows
export {
    // Effect error types (prefixed)
    EffectReactNotDetectedError,
    EffectBrowserLaunchError,
    EffectBrowserNotLaunchedError,
    EffectBrowserAlreadyLaunchedError,
    EffectNavigationTimeoutError,
    EffectNavigationError,
    EffectContextDestroyedError,
    EffectScannerInjectionError,
    EffectMaxRetriesExceededError,
    EffectConfigurationError,
    EffectInvalidUrlError,
    EffectFileSystemError,
    EffectServiceStateError,
    EffectScanDataError,
    EffectTestGenNotInitializedError,
    EffectTestGenInitError,
    EffectTestGenNavigationError,
    EffectTestGenDiscoveryError,

    // Effect error aliases (cleaner names)
    ReactNotDetected,
    BrowserLaunchFailed,
    BrowserNotLaunched,
    BrowserAlreadyLaunched,
    NavigationTimeout,
    NavigationFailed,
    ContextDestroyed,
    ScannerInjectionFailed,
    MaxRetriesExceeded,
    InvalidConfiguration,
    InvalidUrl,
    FileSystemFailed,
    InvalidServiceState,
    InvalidScanData,
    TestGenNotInitialized,
    TestGenInitFailed,
    TestGenNavigationFailed,
    TestGenDiscoveryFailed,

    // Error type unions
    type BrowserErrors,
    type ScanErrors,
    type ValidationErrors,
    type TestGenErrors,
    type ScanWorkflowErrors,
} from './errors/effect-errors.js';

// =============================================================================
// Configuration
// =============================================================================

export {
    getConfig,
    updateConfig,
    loadConfig,
    validateConfiguration,
    resetConfig,
    DEFAULT_CONFIG,
    type ScannerConfig,
    loadEnvConfig,
    hasEnvConfig,
    getSupportedEnvVars,
    getEnvVarDocs,
} from './config/index.js';

// =============================================================================
// Utilities
// =============================================================================

export { logger, LogLevel } from './utils/logger.js';
export { EXIT_CODES, setExitCode, exitWithCode, type ExitCode } from './utils/exit-codes.js';
export { validateUrl, validateBrowser, validateTags, validateThreshold } from './utils/validation.js';
export { serializeError, type SerializedError } from './utils/error-serializer.js';

// =============================================================================
// Prompts
// =============================================================================

export {
    generatePrompt,
    generateAndExport,
    exportPrompt,
} from './prompts/prompt-generator.js';

export {
    getTemplate,
    listTemplates,
    templates,
} from './prompts/templates/index.js';

// =============================================================================
// Suggestions - Contextual fix generation
// =============================================================================

export {
    generateFixSuggestion,
    generateContextualFix,
    hasContextualSupport,
    parseElement,
    inferLabel,
    describeWhatsMissing,
    getElementCategory,
    renderFix,
    renderViolationSummary,
    generateAIPrompt,
} from './scanner/suggestions/index.js';

export type {
    ParsedElement,
    ElementCategory,
    ContextualFix,
    ViolationNode,
    RenderedFix,
    SuggestionGenerator,
} from './scanner/suggestions/index.js';
