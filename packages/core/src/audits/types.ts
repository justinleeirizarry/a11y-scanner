/**
 * Audit Result Types
 *
 * Typed results for the pure audit functions.
 * These are framework-agnostic — usable from MCP, CLI, web, or agent.
 */

export interface AuditIssue {
    severity: 'critical' | 'serious' | 'moderate' | 'minor';
    wcag: string;
    message: string;
}

// =============================================================================
// Keyboard Audit
// =============================================================================

export interface TabOrderEntry {
    index: number;
    tag: string;
    role: string;
    name: string;
    selector: string;
    hasFocusStyle: boolean;
}

export interface KeyboardAuditResult {
    url: string;
    timestamp: string;
    tabStops: number;
    totalInteractive: number;
    focusTrapDetected: boolean;
    hasSkipLink: boolean;
    elementsWithoutFocusIndicator: number;
    tabOrder: TabOrderEntry[];
    issues: AuditIssue[];
}

export interface KeyboardAuditOptions {
    maxTabs?: number;
    headless?: boolean;
    /** Pre-existing Playwright page — skips browser launch and navigation when provided */
    page?: import('playwright').Page;
}

// =============================================================================
// Structure Audit
// =============================================================================

export interface LandmarkInfo {
    role: string;
    label: string;
    tag: string;
}

export interface HeadingInfo {
    level: number;
    text: string;
    id: string;
}

export interface FormInputInfo {
    type: string;
    name: string;
    hasLabel: boolean;
    labelText: string;
}

export interface StructureAuditResult {
    url: string;
    timestamp: string;
    title: string;
    landmarks: LandmarkInfo[];
    headings: HeadingInfo[];
    formInputs: FormInputInfo[];
    accessibilityTree: any;
    issues: AuditIssue[];
}

export interface StructureAuditOptions {
    headless?: boolean;
    /** Pre-existing Playwright page — skips browser launch and navigation when provided */
    page?: import('playwright').Page;
}

// =============================================================================
// Screen Reader Audit
// =============================================================================

export interface ScreenReaderAuditResult {
    url: string;
    timestamp: string;
    title: string;
    lang: string | null;
    images: { total: number; missingAlt: number };
    links: { total: number; noName: number; vague: number };
    buttons: { total: number; noName: number };
    formInputs: { total: number; unlabeled: number };
    liveRegions: number;
    issues: AuditIssue[];
}

export interface ScreenReaderAuditOptions {
    headless?: boolean;
    /** Pre-existing Playwright page — skips browser launch and navigation when provided */
    page?: import('playwright').Page;
}
