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

    // Orchestration Service
    OrchestrationService,
    createOrchestrationService,
    type BaseScanOptions,
    type ScanOperationOptions,
    type ScanOperationResult,
    type TestGenOperationOptions,
    type IOrchestrationService,
} from './services/index.js';

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
