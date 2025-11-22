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

// Final scan results
export interface ScanResults {
    url: string;
    timestamp: string;
    browser: string;
    components: ComponentInfo[];
    violations: AttributedViolation[];
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
    };
}

// Browser scan options
export interface ScanOptions {
    url: string;
    browser: 'chromium' | 'firefox' | 'webkit';
    headless: boolean;
}

// Raw scan data from browser context
export interface BrowserScanData {
    components: ComponentInfo[];
    violations: AttributedViolation[];
}
