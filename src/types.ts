// Axe-core types

// Check result from axe-core (detailed test information)
export interface AxeCheckResult {
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor' | null;
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
    impact?: 'critical' | 'serious' | 'moderate' | 'minor' | null;
    any?: AxeCheckResult[];  // Checks where any one passing would pass the node
    all?: AxeCheckResult[];  // Checks that must all pass
    none?: AxeCheckResult[]; // Checks that must all fail (none should pass)
}

// Base axe result structure (used for violations, passes, incomplete)
export interface AxeResult {
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor' | null;
    description: string;
    help: string;
    helpUrl: string;
    tags: string[];  // WCAG criteria tags (wcag2a, wcag2aa, best-practice, etc.)
    nodes: AxeNodeResult[];
}

// Alias for backwards compatibility
export interface AxeViolation extends AxeResult {
    impact: 'critical' | 'serious' | 'moderate' | 'minor'; // Violations always have impact
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
    wcagLevel?: 'A' | 'AA' | 'AAA';
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
    impact: 'critical' | 'serious' | 'moderate' | 'minor' | null;
    message: string;
    relatedNodes?: RelatedNode[];
}

// Violation attributed to a component
export interface AttributedViolation {
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    help: string;
    helpUrl: string;
    tags: string[];  // WCAG criteria (wcag2a, wcag2aa, wcag21aa, best-practice, etc.)
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
    impact: 'critical' | 'serious' | 'moderate' | 'minor' | null;
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
    impact: 'critical' | 'serious' | 'moderate' | 'minor' | null;
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
            severity: 'critical' | 'serious' | 'moderate';
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
            severity: 'critical' | 'serious' | 'moderate';
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
    browser: 'chromium' | 'firefox' | 'webkit';
    headless: boolean;
    tags?: string[];
    includeKeyboardTests?: boolean; // Enable keyboard navigation testing
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
    level: 'A' | 'AA' | 'AAA';
    element: string;
    selector: string;
    html: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    details: Record<string, any>;
}
