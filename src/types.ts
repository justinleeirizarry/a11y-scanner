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

// Violation attributed to a component
export interface AttributedViolation {
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    help: string;
    helpUrl: string;
    component: string | null;
    componentPath: string[];
    target: string[];
    html: string;
    failureSummary: string;
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
    violations: AxeViolation[];
}
