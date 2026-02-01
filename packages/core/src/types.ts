// ============================================================================
// Shared Type Definitions
// ============================================================================

/**
 * Impact level for accessibility violations (4-level scale from axe-core)
 */
export type ImpactLevel = 'critical' | 'serious' | 'moderate' | 'minor';

/**
 * Impact level that may be null (for non-violation results)
 */
export type ImpactLevelOrNull = ImpactLevel | null;

/**
 * Severity level for keyboard accessibility issues (3-level scale)
 */
export type SeverityLevel = 'critical' | 'serious' | 'moderate';

/**
 * WCAG conformance level
 */
export type WcagLevel = 'A' | 'AA' | 'AAA';

/**
 * WCAG principle categories
 */
export type WcagPrinciple = 'Perceivable' | 'Operable' | 'Understandable' | 'Robust';

/**
 * WCAG criterion information for enriched violation reports
 */
export interface WcagCriterionInfo {
    /** Criterion ID (e.g., "1.4.3") */
    id: string;
    /** Criterion title (e.g., "Contrast (Minimum)") */
    title: string;
    /** Conformance level */
    level: WcagLevel;
    /** WCAG principle */
    principle: WcagPrinciple;
    /** W3C Understanding document URL */
    w3cUrl: string;
}

/**
 * Browser types supported by Playwright
 */
export type BrowserType = 'chromium' | 'firefox' | 'webkit';

// ============================================================================
// Axe-core types
// ============================================================================

// Check result from axe-core (detailed test information)
export interface AxeCheckResult {
    id: string;
    impact: ImpactLevelOrNull;
    message: string;
    data?: any;
    relatedNodes?: Array<{
        html: string;
        target: string[];
    }>;
}

// Node result from axe-core
export interface AxeNodeResult {
    html: string;
    target: string[];
    failureSummary?: string;
    impact?: ImpactLevelOrNull;
    any?: AxeCheckResult[];  // Checks where any one passing would pass the node
    all?: AxeCheckResult[];  // Checks that must all pass
    none?: AxeCheckResult[]; // Checks that must all fail (none should pass)
}

// Base axe result structure (used for violations, passes, incomplete)
export interface AxeResult {
    id: string;
    impact: ImpactLevelOrNull;
    description: string;
    help: string;
    helpUrl: string;
    tags: string[];  // WCAG criteria tags (wcag2a, wcag2aa, best-practice, etc.)
    nodes: AxeNodeResult[];
}

// Alias for backwards compatibility
export interface AxeViolation extends AxeResult {
    impact: ImpactLevel; // Violations always have impact
}

// Component information from Bippy
export interface ComponentInfo {
    name: string;
    type: string;
    displayName?: string;
    props?: Record<string, any>;
    fiber?: any;
    domNode?: Element | null;
    path: string[];
}

// Fix suggestion for a violation
export interface FixSuggestion {
    summary: string;
    details: string;
    wcagCriteria?: string; // e.g., "1.4.3 Contrast (Minimum)"
    wcagLevel?: WcagLevel;
    userImpact?: string; // Description of who is affected and how
    priority?: 'critical' | 'high' | 'medium' | 'low';
}

// Related node information (elements connected to a violation)
export interface RelatedNode {
    html: string;
    target: string[];
    htmlSnippet?: string;
}

// Check detail for attributed violations
export interface AttributedCheck {
    id: string;
    impact: ImpactLevelOrNull;
    message: string;
    relatedNodes?: RelatedNode[];
}

// Violation attributed to a component
export interface AttributedViolation {
    id: string;
    impact: ImpactLevel;
    description: string;
    help: string;
    helpUrl: string;
    tags: string[];  // WCAG criteria (wcag2a, wcag2aa, wcag21aa, best-practice, etc.)
    wcagCriteria?: WcagCriterionInfo[];  // Full WCAG criterion details for this violation
    nodes: Array<{
        component: string | null;
        componentPath: string[];
        userComponentPath: string[]; // Filtered path with only user components
        componentType: 'host' | 'component' | null;
        html: string;
        htmlSnippet: string; // Truncated, readable version
        cssSelector: string; // Generated CSS selector for easy location
        target: string[];
        failureSummary: string;
        isFrameworkComponent: boolean;
        // Detailed check results
        checks?: {
            any?: AttributedCheck[];  // Any one of these passing would fix the issue
            all?: AttributedCheck[];  // All of these must pass
            none?: AttributedCheck[]; // None of these should pass
        };
    }>;
    fixSuggestion?: FixSuggestion;
}

// Pass result attributed to components (rules that passed)
export interface AttributedPass {
    id: string;
    impact: ImpactLevelOrNull;
    description: string;
    help: string;
    helpUrl: string;
    tags: string[];
    nodes: Array<{
        component: string | null;
        html: string;
        htmlSnippet: string;
        target: string[];
    }>;
}

// Incomplete result (needs manual review)
export interface AttributedIncomplete {
    id: string;
    impact: ImpactLevelOrNull;
    description: string;
    help: string;
    helpUrl: string;
    tags: string[];
    nodes: Array<{
        component: string | null;
        html: string;
        htmlSnippet: string;
        target: string[];
        message?: string; // Why manual review is needed
        checks?: {
            any?: AttributedCheck[];
            all?: AttributedCheck[];
            none?: AttributedCheck[];
        };
    }>;
}

// Keyboard testing types
export interface KeyboardTestResults {
    tabOrder: {
        totalFocusableElements: number;
        tabOrder: Array<{
            selector: string;
            tabIndex: number;
            position: { x: number; y: number };
        }>;
        violations: Array<{
            type: 'tab-trap' | 'illogical-order' | 'tabindex-antipattern' | 'hidden-focusable';
            element: string;
            details: string;
            severity: SeverityLevel;
        }>;
        visualOrderMismatches: Array<{
            domIndex: number;
            visualIndex: number;
            element: string;
        }>;
    };
    focusManagement: {
        focusIndicatorIssues: Array<{
            element: string;
            issue: 'missing' | 'low-contrast' | 'too-small' | 'not-visible';
            details: string;
            severity: SeverityLevel;
        }>;
        skipLinksWorking: boolean;
        skipLinkDetails: string;
        focusRestorationTests: Array<{
            scenario: string;
            passed: boolean;
            details: string;
        }>;
    };
    shortcuts: {
        tests: Array<{
            shortcut: string;
            description: string;
            passed: boolean;
            details: string;
        }>;
        customWidgets: Array<{
            element: string;
            role: string;
            keyboardSupport: 'full' | 'partial' | 'none';
            issues: string[];
        }>;
    };
    summary: {
        totalIssues: number;
        criticalIssues: number;
        seriousIssues: number;
        moderateIssues: number;
    };
}


// Stagehand types (for test generation mode only)
export interface StagehandConfig {
    enabled: boolean;
    model?: string;
    apiKey?: string;
    verbose?: boolean;
}

export type ElementType =
    | 'button'
    | 'link'
    | 'input'
    | 'checkbox'
    | 'radio'
    | 'select'
    | 'custom';

export interface ElementDiscovery {
    selector: string;
    description: string;
    suggestedMethod?: string;
    type: ElementType;
}

export interface StagehandResults {
    elements: ElementDiscovery[];
}

// Test generation types
export interface TestGenerationOptions {
    url: string;
    outputFile: string;
    model?: string;
    verbose?: boolean;
}

export interface TestGenerationResults {
    url: string;
    timestamp: string;
    outputFile: string;
    elementsDiscovered: number;
    elements: ElementDiscovery[];
    success: boolean;
    error?: string;
}

// Final scan results
export interface ScanResults {
    url: string;
    timestamp: string;
    browser: string;
    components: ComponentInfo[];
    violations: AttributedViolation[];
    passes?: AttributedPass[];      // Rules that passed (what's working)
    incomplete?: AttributedIncomplete[]; // Needs manual review
    inapplicable?: Array<{          // Rules that don't apply to this page
        id: string;
        description: string;
        help: string;
        helpUrl: string;
        tags: string[];
    }>;
    accessibilityTree?: any; // Playwright accessibility snapshot
    keyboardTests?: KeyboardTestResults; // Keyboard navigation test results
    wcag22?: WCAG22Results;  // WCAG 2.2 custom check results
    summary: {
        totalComponents: number;
        totalViolations: number;
        totalPasses: number;        // Number of rules that passed
        totalIncomplete: number;    // Number needing manual review
        totalInapplicable: number;  // Number of rules not applicable
        violationsBySeverity: {
            critical: number;
            serious: number;
            moderate: number;
            minor: number;
        };
        // WCAG level breakdown
        violationsByWcagLevel?: {
            wcag2a: number;
            wcag2aa: number;
            wcag2aaa: number;
            wcag21a: number;
            wcag21aa: number;
            wcag22aa: number;
            bestPractice: number;
        };
        componentsWithViolations: number;
        keyboardIssues?: number; // Total keyboard issues found
        wcag22Issues?: number;   // Total WCAG 2.2 issues found
    };
}

// Browser scan options
export interface ScanOptions {
    url: string;
    browser: BrowserType;
    headless: boolean;
    tags?: string[];
    includeKeyboardTests?: boolean; // Enable keyboard navigation testing
}

// Scan error information for debugging
export interface ScanError {
    phase: 'fiber-traversal' | 'axe-scan' | 'keyboard-tests' | 'wcag22-checks' | 'tree-building';
    message: string;
    stack?: string;
    recoverable: boolean;
}

// Raw scan data from browser context
export interface BrowserScanData {
    components: ComponentInfo[];
    violations: AttributedViolation[];
    passes?: AttributedPass[];           // Rules that passed
    incomplete?: AttributedIncomplete[]; // Needs manual review
    inapplicable?: Array<{               // Rules that don't apply
        id: string;
        description: string;
        help: string;
        helpUrl: string;
        tags: string[];
    }>;
    keyboardTests?: KeyboardTestResults; // Keyboard test results from browser
    wcag22?: WCAG22Results;              // WCAG 2.2 custom check results
    accessibilityTree?: any; // Playwright accessibility snapshot
    errors?: ScanError[];    // Non-fatal errors encountered during scan
}

// Prompt template types
export interface PromptTemplate {
    name: string;
    description: string;
    render: (context: PromptContext) => string;
}

export interface PromptContext {
    violations: AttributedViolation[];
    summary: ScanResults['summary'];
    url: string;
    accessibilityTree?: any;
}

export interface PromptExportOptions {
    template: string;
    format: 'txt' | 'md' | 'json';
    outputPath?: string;
}

// WCAG 2.2 Check Results
export interface WCAG22Results {
    targetSize: WCAG22ViolationSummary[];
    focusObscured: WCAG22ViolationSummary[];
    focusAppearance: WCAG22ViolationSummary[];
    dragging: WCAG22ViolationSummary[];
    authentication: WCAG22ViolationSummary[];
    summary: {
        totalViolations: number;
        byLevel: {
            A: number;
            AA: number;
            AAA: number;
        };
        byCriterion: Record<string, number>;
    };
}

export interface WCAG22ViolationSummary {
    id: string;
    criterion: string;
    level: WcagLevel;
    element: string;
    selector: string;
    html: string;
    impact: ImpactLevel;
    description: string;
    details: Record<string, any>;
}

// Browser scanner API options
export interface BrowserScanOptions {
    tags?: string[];
    includeKeyboardTests?: boolean;
}

// ReactA11yScanner API exposed on window in browser context
export interface ReactA11yScannerAPI {
    scan: (options?: BrowserScanOptions) => Promise<BrowserScanData>;
}

// ============================================================================
// Stagehand Keyboard Navigation Testing Types
// ============================================================================

/**
 * Configuration for Stagehand-based keyboard navigation testing
 */
export interface StagehandKeyboardConfig {
    /** Maximum number of Tab key presses to test (default: 100) */
    maxTabPresses?: number;
    /** Test keyboard shortcuts (default: true) */
    testShortcuts?: boolean;
    /** Test skip links functionality (default: true) */
    testSkipLinks?: boolean;
    /** Enable verbose logging */
    verbose?: boolean;
    /** AI model to use (default: "openai/gpt-4o-mini") */
    model?: string;
}

/**
 * Types of keyboard navigation issues that can be detected
 */
export type StagehandKeyboardIssueType =
    | 'focus-trap'
    | 'no-focus-indicator'
    | 'tab-order-violation'
    | 'keyboard-inaccessible'
    | 'skip-link-broken'
    | 'shortcut-conflict';

/**
 * A keyboard navigation issue detected by Stagehand
 */
export interface StagehandKeyboardIssue {
    /** Type of keyboard issue */
    type: StagehandKeyboardIssueType;
    /** Element information */
    element: {
        description: string;
        selector: string;
        role?: string;
    };
    /** Human-readable issue description */
    message: string;
    /** Related WCAG criteria */
    wcagCriteria: WcagCriterionInfo[];
    /** Issue severity */
    severity: 'critical' | 'serious' | 'moderate';
    /** Steps to reproduce the issue */
    reproduction: string[];
}

/**
 * Tab order entry for keyboard navigation results
 */
export interface TabOrderEntry {
    /** Position in tab order */
    index: number;
    /** Element description */
    element: string;
    /** CSS selector */
    selector: string;
    /** ARIA role */
    role: string;
    /** Whether element has visible focus indicator */
    hasFocusIndicator: boolean;
}

/**
 * Results from Stagehand keyboard navigation testing
 */
export interface StagehandKeyboardResults {
    /** URL that was tested */
    url: string;
    /** When the test was performed */
    timestamp: string;
    /** Tab order sequence discovered */
    tabOrder: TabOrderEntry[];
    /** Keyboard navigation issues found */
    issues: StagehandKeyboardIssue[];
    /** Coverage statistics */
    coverage: {
        /** Total interactive elements on page */
        totalInteractive: number;
        /** Number accessible via keyboard */
        keyboardAccessible: number;
        /** Percentage accessible */
        percentAccessible: number;
    };
    /** Summary of issues */
    summary: {
        totalIssues: number;
        focusTraps: number;
        missingIndicators: number;
        inaccessibleElements: number;
    };
}

// ============================================================================
// Stagehand Accessibility Tree Analysis Types
// ============================================================================

/**
 * Node in the accessibility tree
 */
export interface A11yTreeNode {
    /** ARIA role */
    role: string;
    /** Accessible name */
    name?: string;
    /** Accessible description */
    description?: string;
    /** CSS selector to locate this element */
    selector: string;
    /** Child nodes */
    children?: A11yTreeNode[];
    /** State properties */
    checked?: boolean;
    disabled?: boolean;
    expanded?: boolean;
    focused?: boolean;
    required?: boolean;
    selected?: boolean;
    hidden?: boolean;
    /** Additional properties */
    level?: number;
    valueMin?: number;
    valueMax?: number;
    valueNow?: number;
    valueText?: string;
}

/**
 * Types of accessibility tree issues
 */
export type TreeIssueType =
    | 'missing-name'
    | 'missing-role'
    | 'invalid-role'
    | 'missing-landmark'
    | 'heading-skip'
    | 'orphaned-control'
    | 'duplicate-id'
    | 'focusable-hidden';

/**
 * An accessibility tree issue
 */
export interface TreeIssue {
    /** Type of issue */
    type: TreeIssueType;
    /** Affected node */
    node: {
        role: string;
        name?: string;
        selector: string;
    };
    /** Human-readable description */
    message: string;
    /** Related WCAG criteria */
    wcagCriteria: WcagCriterionInfo[];
    /** Issue severity */
    severity: 'critical' | 'serious' | 'moderate' | 'minor';
}

/**
 * Results from accessibility tree analysis
 */
export interface TreeAnalysisResult {
    /** URL that was analyzed */
    url: string;
    /** When the analysis was performed */
    timestamp: string;
    /** The full accessibility tree */
    tree: A11yTreeNode;
    /** Tree statistics */
    stats: {
        landmarks: number;
        headings: number;
        formControls: number;
        interactiveElements: number;
        totalNodes: number;
    };
    /** Issues found in the tree */
    issues: TreeIssue[];
    /** Summary of analysis */
    summary: {
        totalIssues: number;
        bySeverity: Record<string, number>;
    };
}

/**
 * Configuration for accessibility tree analysis
 */
export interface TreeAnalysisConfig {
    /** Enable verbose logging */
    verbose?: boolean;
    /** AI model to use */
    model?: string;
    /** Include full tree in results (can be large) */
    includeFullTree?: boolean;
}

// ============================================================================
// Stagehand WCAG Audit Agent Types
// ============================================================================

/**
 * Configuration for WCAG audit
 */
export interface WcagAuditOptions {
    /** Target WCAG conformance level */
    targetLevel: WcagLevel;
    /** Maximum pages to visit (for multi-page audits) */
    maxPages?: number;
    /** Maximum agent steps before stopping */
    maxSteps?: number;
    /** Specific criteria to test (by ID, e.g., "2.4.7") */
    criteria?: string[];
    /** Enable verbose logging */
    verbose?: boolean;
    /** AI model to use */
    model?: string;
}

/**
 * Status of an audit finding
 */
export type AuditStatus = 'pass' | 'fail' | 'manual-review';

/**
 * A single audit finding for a WCAG criterion
 */
export interface AuditFinding {
    /** The WCAG criterion being tested */
    criterion: WcagCriterionInfo;
    /** Result status */
    status: AuditStatus;
    /** Affected element (if applicable) */
    element?: string;
    /** CSS selector (if applicable) */
    selector?: string;
    /** Description of the finding */
    description: string;
    /** Impact level (for failures) */
    impact?: ImpactLevel;
    /** Evidence or details supporting the finding */
    evidence?: string;
}

/**
 * Results from WCAG audit
 */
export interface WcagAuditResult {
    /** URL that was audited */
    url: string;
    /** When the audit was performed */
    timestamp: string;
    /** Target conformance level */
    targetLevel: WcagLevel;
    /** All audit findings */
    findings: AuditFinding[];
    /** Summary statistics */
    summary: {
        passed: number;
        failed: number;
        manualReview: number;
        /** Number of pages visited */
        pagesVisited: number;
        /** Number of application states checked */
        statesChecked: number;
    };
    /** Final agent summary message */
    agentMessage: string;
}

// Global window augmentation for browser context
declare global {
    interface Window {
        ReactA11yScanner?: ReactA11yScannerAPI;
    }
}
