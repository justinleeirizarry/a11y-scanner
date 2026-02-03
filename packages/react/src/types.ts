/**
 * React Plugin Types
 *
 * Types specific to React component attribution and fiber traversal.
 */

// Re-export core types that are needed
export type {
    ImpactLevel,
    ImpactLevelOrNull,
    WcagLevel,
    AxeViolation,
    AxeResult,
    AxeCheckResult,
    WcagCriterionInfo,
    FixSuggestion,
} from '@accessibility-toolkit/core';

/**
 * Component information from React Fiber traversal
 */
export interface ComponentInfo {
    /** Component name (from displayName, function name, or debug source) */
    name: string;
    /** Component type: 'host' for DOM elements, 'component' for React components */
    type: string;
    /** Display name if different from name */
    displayName?: string;
    /** Component props */
    props?: Record<string, any>;
    /** Reference to the fiber node */
    fiber?: any;
    /** Associated DOM node (for host components) */
    domNode?: Element | null;
    /** Full path from root component */
    path: string[];
}

/**
 * React-specific scan data returned from the plugin
 */
export interface ReactScanData {
    /** All components found in the fiber tree */
    components: ComponentInfo[];
    /** DOM element to component mapping */
    domToComponentMap: Map<Element, ComponentInfo>;
}

/**
 * Attributed check with related node information
 */
export interface AttributedCheck {
    id: string;
    impact: import('@accessibility-toolkit/core').ImpactLevelOrNull;
    message: string;
    relatedNodes?: Array<{
        html: string;
        target: string[];
        htmlSnippet?: string;
    }>;
}

/**
 * A violation node with React component attribution
 */
export interface AttributedViolationNode {
    /** Component name (null if not in a React component) */
    component: string | null;
    /** Full component path from root */
    componentPath: string[];
    /** Filtered path with only user components (no framework components) */
    userComponentPath: string[];
    /** Component type */
    componentType: 'host' | 'component' | null;
    /** Original HTML of the element */
    html: string;
    /** Truncated, readable HTML snippet */
    htmlSnippet: string;
    /** Generated CSS selector for easy location */
    cssSelector: string;
    /** axe-core target selectors */
    target: string[];
    /** Failure summary from axe */
    failureSummary: string;
    /** Whether this is a framework internal component */
    isFrameworkComponent: boolean;
    /** Detailed check results */
    checks?: {
        any?: AttributedCheck[];
        all?: AttributedCheck[];
        none?: AttributedCheck[];
    };
}

/**
 * Violation with React component attribution
 */
export interface AttributedViolation {
    id: string;
    impact: import('@accessibility-toolkit/core').ImpactLevel;
    description: string;
    help: string;
    helpUrl: string;
    tags: string[];
    wcagCriteria?: import('@accessibility-toolkit/core').WcagCriterionInfo[];
    nodes: AttributedViolationNode[];
    fixSuggestion?: import('@accessibility-toolkit/core').FixSuggestion;
}

/**
 * Pass result with component attribution
 */
export interface AttributedPass {
    id: string;
    impact: import('@accessibility-toolkit/core').ImpactLevelOrNull;
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

/**
 * Incomplete result with component attribution (needs manual review)
 */
export interface AttributedIncomplete {
    id: string;
    impact: import('@accessibility-toolkit/core').ImpactLevelOrNull;
    description: string;
    help: string;
    helpUrl: string;
    tags: string[];
    nodes: Array<{
        component: string | null;
        html: string;
        htmlSnippet: string;
        target: string[];
        message?: string;
        checks?: {
            any?: AttributedCheck[];
            all?: AttributedCheck[];
            none?: AttributedCheck[];
        };
    }>;
}
