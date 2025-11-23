// Axe-core types
export interface AxeViolation {
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    help: string;
    helpUrl: string;
    nodes: Array<{
        html: string;
        target: string[];
        failureSummary: string;
    }>;
}

// Component information from Bippy
export interface ComponentInfo {
    name: string;
    type: string;
    displayName?: string;
    props?: Record<string, any>;
    fiber?: any;
    domNode?: Element;
}

// Fix suggestion for a violation
export interface FixSuggestion {
    summary: string;
    details: string;
    codeExample?: string;
    wcagCriteria?: string; // e.g., "1.4.3 Contrast (Minimum)"
    wcagLevel?: 'A' | 'AA' | 'AAA';
    userImpact?: string; // Description of who is affected and how
    priority?: 'critical' | 'high' | 'medium' | 'low';
}

// Violation attributed to a component
export interface AttributedViolation {
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    help: string;
    helpUrl: string;
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
    }>;
    fixSuggestion?: FixSuggestion;
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

// Final scan results
export interface ScanResults {
    url: string;
    timestamp: string;
    browser: string;
    components: ComponentInfo[];
    violations: AttributedViolation[];
    accessibilityTree?: any; // Playwright accessibility snapshot
    keyboardTests?: KeyboardTestResults; // Keyboard navigation test results
    summary: {
        totalComponents: number;
        totalViolations: number;
        violationsBySeverity: {
            critical: number;
            serious: number;
            moderate: number;
            minor: number;
        };
        componentsWithViolations: number;
        keyboardIssues?: number; // Total keyboard issues found
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
    keyboardTests?: KeyboardTestResults; // Keyboard test results from browser
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


