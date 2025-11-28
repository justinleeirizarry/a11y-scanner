/**
 * Types for contextual fix suggestions
 */

/**
 * Parsed representation of an HTML element
 */
export interface ParsedElement {
    tag: string;
    attributes: Record<string, string>;
    classes: string[];
    id?: string;
    textContent?: string;
    innerHTML?: string;
    // Common accessibility-related attributes
    ariaLabel?: string;
    ariaLabelledby?: string;
    ariaDescribedby?: string;
    role?: string;
    tabindex?: string;
    // Form-specific
    type?: string;
    name?: string;
    placeholder?: string;
    // Link/image specific
    href?: string;
    src?: string;
    alt?: string;
    title?: string;
}

/**
 * Element category for contextual suggestions
 */
export type ElementCategory = 'button' | 'link' | 'image' | 'form-input' | 'heading' | 'landmark' | 'interactive' | 'other';

/**
 * Contextual fix suggestion for a violation
 */
export interface ContextualFix {
    current: string;           // The actual failing HTML
    issue: string;             // What's specifically wrong
    suggestion: string;        // What to add/change
    fixed?: string;            // Generated fixed version
    reactSuggestion?: string;  // React/JSX version if applicable
    inferredLabel?: string;    // Label inferred from context
}

/**
 * Violation node data needed for generating contextual fixes
 */
export interface ViolationNode {
    html: string;
    htmlSnippet: string;
    component?: string | null;
    componentPath?: string[];
    failureSummary?: string;
    checks?: {
        any?: Array<{ id: string; message: string }>;
        all?: Array<{ id: string; message: string }>;
        none?: Array<{ id: string; message: string }>;
    };
}

/**
 * Rendered fix for display in UI
 */
export interface RenderedFix {
    // Plain text view
    beforeAfterText: string;
    // Structured data for UI rendering
    before: string;
    after: string;
    issue: string;
    suggestion: string;
    // React-specific
    reactVersion?: string;
    // Component context
    componentName?: string;
    componentPath?: string;
}

/**
 * Function signature for violation-specific suggestion generators
 */
export type SuggestionGenerator = (element: ParsedElement, node: ViolationNode) => ContextualFix;
