# Plan: Advanced Stagehand Accessibility Features

## Overview

This plan outlines three advanced accessibility testing features that leverage Stagehand's AI-powered browser automation APIs. These features build on the existing WCAG infrastructure and Stagehand integration.

**References:**
- [Stagehand Documentation](https://docs.stagehand.dev)
- [Act API](https://docs.stagehand.dev/v3/basics/act)
- [Extract API](https://docs.stagehand.dev/v3/basics/extract)
- [Observe API](https://docs.stagehand.dev/v3/basics/observe)
- [Agent API](https://docs.stagehand.dev/v3/basics/agent)

---

## Feature 1: WCAG Audit Agent

**Goal:** Create an autonomous AI agent that performs comprehensive WCAG audits by navigating pages, discovering content, and testing accessibility across multiple page states.

### Stagehand API: `agent()`

The agent API enables multi-step autonomous workflows:

```typescript
const agent = stagehand.agent({
  modelName: "anthropic/claude-sonnet-4",
  systemPrompt: "You are an accessibility auditor..."
});

const result = await agent.execute("audit this page for WCAG 2.2 compliance");
```

### Implementation

#### New Files

| File | Purpose |
|------|---------|
| `packages/core/src/scanner/stagehand/wcag-audit-agent.ts` | Main audit agent implementation |
| `packages/core/src/scanner/stagehand/wcag-audit-agent.test.ts` | Tests for audit agent |
| `packages/core/src/scanner/stagehand/audit-prompts.ts` | System prompts for WCAG auditing |

#### `wcag-audit-agent.ts`

```typescript
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import { WCAG_CRITERIA, type WcagCriterion } from "../../data/index.js";
import type { AttributedViolation, WcagLevel } from "../../types.js";

// Schema for audit findings
const AuditFindingSchema = z.object({
    criterionId: z.string(),
    status: z.enum(["pass", "fail", "manual-review"]),
    element: z.string().optional(),
    selector: z.string().optional(),
    description: z.string(),
    impact: z.enum(["critical", "serious", "moderate", "minor"]).optional(),
});

const AuditResultSchema = z.object({
    findings: z.array(AuditFindingSchema),
    pagesVisited: z.number(),
    statesChecked: z.number(),
    summary: z.string(),
});

export interface WcagAuditOptions {
    /** Target WCAG level (A, AA, or AAA) */
    targetLevel: WcagLevel;
    /** Maximum pages to visit */
    maxPages?: number;
    /** Maximum actions per page */
    maxSteps?: number;
    /** Specific criteria to test (defaults to all for level) */
    criteria?: string[];
    /** Enable verbose logging */
    verbose?: boolean;
}

export interface WcagAuditResult {
    url: string;
    timestamp: string;
    targetLevel: WcagLevel;
    findings: Array<{
        criterion: WcagCriterion;
        status: "pass" | "fail" | "manual-review";
        element?: string;
        selector?: string;
        description: string;
        impact?: "critical" | "serious" | "moderate" | "minor";
    }>;
    summary: {
        passed: number;
        failed: number;
        manualReview: number;
        pagesVisited: number;
        statesChecked: number;
    };
    agentMessage: string;
}

export class WcagAuditAgent {
    private stagehand: Stagehand | null = null;

    constructor(private options: WcagAuditOptions) {}

    async init(): Promise<void> {
        this.stagehand = new Stagehand({
            env: "LOCAL",
            verbose: this.options.verbose ? 2 : 0,
        });
        await this.stagehand.init();
    }

    async audit(url: string): Promise<WcagAuditResult> {
        if (!this.stagehand) {
            throw new Error("Agent not initialized");
        }

        // Get criteria for target level
        const targetCriteria = this.getCriteriaForLevel(this.options.targetLevel);
        const criteriaList = targetCriteria
            .map(c => `${c.id} ${c.title}`)
            .join("\n");

        // Create agent with WCAG-focused system prompt
        const agent = this.stagehand.agent({
            modelName: "anthropic/claude-sonnet-4",
            systemPrompt: this.buildSystemPrompt(criteriaList),
        });

        // Navigate to page first (best practice)
        const page = this.stagehand.page;
        await page.goto(url, { waitUntil: "networkidle" });

        // Execute the audit
        const result = await agent.execute(
            `Audit this page for WCAG ${this.options.targetLevel} compliance.
             Check interactive elements, form controls, images, headings, and landmarks.
             Navigate to different states (modals, dropdowns, tabs) to test dynamic content.
             Report findings for each criterion.`,
            {
                maxSteps: this.options.maxSteps || 30,
            }
        );

        // Extract structured findings
        const findings = await this.stagehand.extract({
            instruction: "Extract all accessibility findings from the audit",
            schema: AuditResultSchema,
        });

        return this.formatResults(url, findings, result.message);
    }

    private getCriteriaForLevel(level: WcagLevel): WcagCriterion[] {
        const levels: WcagLevel[] = level === "A" ? ["A"]
            : level === "AA" ? ["A", "AA"]
            : ["A", "AA", "AAA"];

        return Object.values(WCAG_CRITERIA).filter(c => levels.includes(c.level));
    }

    private buildSystemPrompt(criteriaList: string): string {
        return `You are an expert WCAG accessibility auditor. Your task is to systematically
test web pages for accessibility compliance.

## Testing Process
1. First, observe all interactive elements on the page
2. Test keyboard navigation (Tab, Shift+Tab, Enter, Space, Arrow keys)
3. Check focus visibility and focus order
4. Verify form labels and error messages
5. Test color contrast and text alternatives
6. Navigate to different page states (open modals, expand menus, etc.)
7. Verify dynamic content is accessible

## WCAG Criteria to Test
${criteriaList}

## Reporting
For each criterion, report:
- Status: pass, fail, or manual-review
- Affected element (if applicable)
- Selector for the element
- Description of the issue or confirmation of compliance
- Impact level for failures

Be thorough but efficient. Focus on the most impactful issues first.`;
    }

    private formatResults(
        url: string,
        extracted: z.infer<typeof AuditResultSchema>,
        agentMessage: string
    ): WcagAuditResult {
        const findings = extracted.findings.map(f => ({
            criterion: WCAG_CRITERIA[f.criterionId] || {
                id: f.criterionId,
                title: "Unknown Criterion",
                level: "A" as WcagLevel,
                principle: "Robust" as const,
                guideline: "",
                description: "",
                w3cUrl: "",
            },
            status: f.status,
            element: f.element,
            selector: f.selector,
            description: f.description,
            impact: f.impact,
        }));

        return {
            url,
            timestamp: new Date().toISOString(),
            targetLevel: this.options.targetLevel,
            findings,
            summary: {
                passed: findings.filter(f => f.status === "pass").length,
                failed: findings.filter(f => f.status === "fail").length,
                manualReview: findings.filter(f => f.status === "manual-review").length,
                pagesVisited: extracted.pagesVisited,
                statesChecked: extracted.statesChecked,
            },
            agentMessage,
        };
    }

    async close(): Promise<void> {
        if (this.stagehand) {
            await this.stagehand.close();
            this.stagehand = null;
        }
    }
}
```

### CLI Integration

Add new CLI flag `--wcag-audit`:

```bash
pnpm start https://example.com --wcag-audit --level AA
```

### Test Cases

1. Agent initializes and navigates to URL
2. Agent tests keyboard navigation on interactive elements
3. Agent opens modals/dropdowns and tests accessibility
4. Agent returns structured findings with WCAG criterion references
5. Findings are mapped to correct WCAG criteria
6. Summary counts are accurate

---

## Feature 2: Accessibility Tree Analysis

**Goal:** Extract and analyze the browser's accessibility tree to identify missing or incorrect ARIA attributes, roles, and relationships.

### Stagehand API: `extract()`

The extract API retrieves structured data using Zod schemas:

```typescript
const data = await stagehand.extract({
    instruction: "Extract the accessibility tree structure",
    schema: AccessibilityTreeSchema,
});
```

### Implementation

#### New Files

| File | Purpose |
|------|---------|
| `packages/core/src/scanner/stagehand/a11y-tree-analyzer.ts` | Tree extraction and analysis |
| `packages/core/src/scanner/stagehand/a11y-tree-analyzer.test.ts` | Tests |
| `packages/core/src/scanner/stagehand/a11y-tree-rules.ts` | Validation rules for tree nodes |

#### `a11y-tree-analyzer.ts`

```typescript
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import { getWcagCriteriaForViolation, type WcagCriterion } from "../../data/index.js";

// Schema for accessibility tree nodes
const A11yNodeSchema = z.object({
    role: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    value: z.string().optional(),
    checked: z.boolean().optional(),
    disabled: z.boolean().optional(),
    expanded: z.boolean().optional(),
    focused: z.boolean().optional(),
    required: z.boolean().optional(),
    selector: z.string(),
    children: z.array(z.lazy(() => A11yNodeSchema)).optional(),
});

type A11yNode = z.infer<typeof A11yNodeSchema>;

const A11yTreeSchema = z.object({
    root: A11yNodeSchema,
    landmarkCount: z.number(),
    headingCount: z.number(),
    formControlCount: z.number(),
    interactiveCount: z.number(),
});

// Tree analysis issue
export interface TreeIssue {
    type:
        | "missing-name"
        | "missing-role"
        | "invalid-role"
        | "missing-landmark"
        | "heading-skip"
        | "orphaned-control"
        | "duplicate-id"
        | "focusable-hidden";
    node: {
        role: string;
        name?: string;
        selector: string;
    };
    message: string;
    wcagCriteria: WcagCriterion[];
    severity: "critical" | "serious" | "moderate" | "minor";
}

export interface TreeAnalysisResult {
    url: string;
    timestamp: string;
    tree: A11yNode;
    stats: {
        landmarks: number;
        headings: number;
        formControls: number;
        interactiveElements: number;
        totalNodes: number;
    };
    issues: TreeIssue[];
    summary: {
        totalIssues: number;
        bySeverity: Record<string, number>;
    };
}

// Role validation rules
const VALID_LANDMARK_ROLES = [
    "banner", "main", "navigation", "complementary",
    "contentinfo", "region", "search", "form"
];

const INTERACTIVE_ROLES = [
    "button", "link", "textbox", "checkbox", "radio",
    "combobox", "listbox", "menuitem", "tab", "slider"
];

const ROLES_REQUIRING_NAME = [
    ...INTERACTIVE_ROLES,
    "img", "figure", "table", "dialog", "alertdialog"
];

export class A11yTreeAnalyzer {
    private stagehand: Stagehand | null = null;

    async init(): Promise<void> {
        this.stagehand = new Stagehand({
            env: "LOCAL",
            verbose: 0,
        });
        await this.stagehand.init();
    }

    async analyze(url: string): Promise<TreeAnalysisResult> {
        if (!this.stagehand) {
            throw new Error("Analyzer not initialized");
        }

        const page = this.stagehand.page;
        await page.goto(url, { waitUntil: "networkidle" });

        // Extract accessibility tree using Stagehand
        const treeData = await this.stagehand.extract({
            instruction: `Extract the complete accessibility tree of this page.
                For each node, include:
                - role (ARIA role or implicit role)
                - name (accessible name)
                - description (accessible description if any)
                - state properties (checked, disabled, expanded, focused, required)
                - a CSS selector to locate the element
                - children nodes
                Focus on landmarks, headings, form controls, and interactive elements.`,
            schema: A11yTreeSchema,
        });

        // Analyze tree for issues
        const issues = this.analyzeTree(treeData.root);

        // Calculate stats
        const stats = this.calculateStats(treeData.root);

        return {
            url,
            timestamp: new Date().toISOString(),
            tree: treeData.root,
            stats,
            issues,
            summary: {
                totalIssues: issues.length,
                bySeverity: {
                    critical: issues.filter(i => i.severity === "critical").length,
                    serious: issues.filter(i => i.severity === "serious").length,
                    moderate: issues.filter(i => i.severity === "moderate").length,
                    minor: issues.filter(i => i.severity === "minor").length,
                },
            },
        };
    }

    private analyzeTree(node: A11yNode, issues: TreeIssue[] = [], context: {
        lastHeadingLevel?: number;
        hasMain?: boolean;
        hasBanner?: boolean;
        hasContentinfo?: boolean;
    } = {}): TreeIssue[] {
        // Check for missing accessible name on interactive elements
        if (ROLES_REQUIRING_NAME.includes(node.role) && !node.name) {
            issues.push({
                type: "missing-name",
                node: { role: node.role, name: node.name, selector: node.selector },
                message: `${node.role} element has no accessible name`,
                wcagCriteria: getWcagCriteriaForViolation("button-name"),
                severity: "serious",
            });
        }

        // Check heading order
        if (node.role === "heading" && node.name) {
            const match = node.name.match(/^h(\d)/i);
            if (match) {
                const level = parseInt(match[1]);
                if (context.lastHeadingLevel && level > context.lastHeadingLevel + 1) {
                    issues.push({
                        type: "heading-skip",
                        node: { role: node.role, name: node.name, selector: node.selector },
                        message: `Heading level skipped from h${context.lastHeadingLevel} to h${level}`,
                        wcagCriteria: getWcagCriteriaForViolation("heading-order"),
                        severity: "moderate",
                    });
                }
                context.lastHeadingLevel = level;
            }
        }

        // Track landmarks
        if (node.role === "main") context.hasMain = true;
        if (node.role === "banner") context.hasBanner = true;
        if (node.role === "contentinfo") context.hasContentinfo = true;

        // Check for focusable hidden elements
        if (node.focused && node.role === "none") {
            issues.push({
                type: "focusable-hidden",
                node: { role: node.role, name: node.name, selector: node.selector },
                message: "Element is focusable but hidden from accessibility tree",
                wcagCriteria: getWcagCriteriaForViolation("aria-hidden-focus"),
                severity: "critical",
            });
        }

        // Recursively analyze children
        if (node.children) {
            for (const child of node.children) {
                this.analyzeTree(child, issues, context);
            }
        }

        return issues;
    }

    private calculateStats(node: A11yNode): TreeAnalysisResult["stats"] {
        let landmarks = 0;
        let headings = 0;
        let formControls = 0;
        let interactiveElements = 0;
        let totalNodes = 0;

        const traverse = (n: A11yNode) => {
            totalNodes++;

            if (VALID_LANDMARK_ROLES.includes(n.role)) landmarks++;
            if (n.role === "heading") headings++;
            if (["textbox", "checkbox", "radio", "combobox", "listbox", "slider"].includes(n.role)) {
                formControls++;
            }
            if (INTERACTIVE_ROLES.includes(n.role)) interactiveElements++;

            if (n.children) {
                n.children.forEach(traverse);
            }
        };

        traverse(node);

        return { landmarks, headings, formControls, interactiveElements, totalNodes };
    }

    async close(): Promise<void> {
        if (this.stagehand) {
            await this.stagehand.close();
            this.stagehand = null;
        }
    }
}
```

### CLI Integration

Add new CLI flag `--analyze-tree`:

```bash
pnpm start https://example.com --analyze-tree
```

### Test Cases

1. Extracts accessibility tree from page
2. Identifies missing accessible names
3. Detects heading level skips
4. Counts landmarks correctly
5. Identifies focusable hidden elements
6. Maps issues to WCAG criteria

---

## Feature 3: Keyboard Navigation Tester

**Goal:** Use AI-powered actions to perform comprehensive keyboard navigation testing, including focus traps, tab order, and keyboard shortcuts.

### Stagehand API: `act()`

The act API executes actions via natural language:

```typescript
await stagehand.act("press Tab to move to the next element");
await stagehand.act("press Enter to activate the button");
```

### Implementation

#### New Files

| File | Purpose |
|------|---------|
| `packages/core/src/scanner/stagehand/keyboard-tester.ts` | Keyboard navigation testing |
| `packages/core/src/scanner/stagehand/keyboard-tester.test.ts` | Tests |

#### `keyboard-tester.ts`

```typescript
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import { getWcagCriteriaForViolation, type WcagCriterion } from "../../data/index.js";

// Schema for observed focus state
const FocusStateSchema = z.object({
    element: z.string(),
    selector: z.string(),
    role: z.string(),
    isVisible: z.boolean(),
    hasFocusIndicator: z.boolean(),
    tabIndex: z.number().optional(),
});

export interface KeyboardIssue {
    type:
        | "focus-trap"
        | "no-focus-indicator"
        | "tab-order-violation"
        | "keyboard-inaccessible"
        | "skip-link-broken"
        | "shortcut-conflict";
    element: {
        description: string;
        selector: string;
        role?: string;
    };
    message: string;
    wcagCriteria: WcagCriterion[];
    severity: "critical" | "serious" | "moderate";
    reproduction: string[];  // Steps to reproduce
}

export interface KeyboardTestResult {
    url: string;
    timestamp: string;
    tabOrder: Array<{
        index: number;
        element: string;
        selector: string;
        role: string;
        hasFocusIndicator: boolean;
    }>;
    issues: KeyboardIssue[];
    coverage: {
        totalInteractive: number;
        keyboardAccessible: number;
        percentAccessible: number;
    };
    summary: {
        totalIssues: number;
        focusTraps: number;
        missingIndicators: number;
        inaccessibleElements: number;
    };
}

export interface KeyboardTestOptions {
    /** Maximum Tab presses before detecting potential trap */
    maxTabPresses?: number;
    /** Test common keyboard shortcuts */
    testShortcuts?: boolean;
    /** Test skip links */
    testSkipLinks?: boolean;
    /** Enable verbose logging */
    verbose?: boolean;
}

export class KeyboardTester {
    private stagehand: Stagehand | null = null;
    private options: KeyboardTestOptions;

    constructor(options: KeyboardTestOptions = {}) {
        this.options = {
            maxTabPresses: options.maxTabPresses || 100,
            testShortcuts: options.testShortcuts ?? true,
            testSkipLinks: options.testSkipLinks ?? true,
            verbose: options.verbose ?? false,
        };
    }

    async init(): Promise<void> {
        this.stagehand = new Stagehand({
            env: "LOCAL",
            verbose: this.options.verbose ? 2 : 0,
        });
        await this.stagehand.init();
    }

    async test(url: string): Promise<KeyboardTestResult> {
        if (!this.stagehand) {
            throw new Error("Tester not initialized");
        }

        const page = this.stagehand.page;
        await page.goto(url, { waitUntil: "networkidle" });

        const issues: KeyboardIssue[] = [];
        const tabOrder: KeyboardTestResult["tabOrder"] = [];

        // First, discover all interactive elements
        const interactiveElements = await this.stagehand.observe(
            "find all interactive elements that should be keyboard accessible"
        );

        // Test skip links if enabled
        if (this.options.testSkipLinks) {
            const skipLinkIssues = await this.testSkipLinks();
            issues.push(...skipLinkIssues);
        }

        // Test tab navigation
        const tabResults = await this.testTabNavigation(interactiveElements.length);
        tabOrder.push(...tabResults.tabOrder);
        issues.push(...tabResults.issues);

        // Test keyboard shortcuts if enabled
        if (this.options.testShortcuts) {
            const shortcutIssues = await this.testKeyboardShortcuts();
            issues.push(...shortcutIssues);
        }

        // Test focus traps in modals/dialogs
        const trapIssues = await this.testFocusTraps();
        issues.push(...trapIssues);

        // Calculate coverage
        const keyboardAccessible = tabOrder.length;
        const totalInteractive = interactiveElements.length;

        return {
            url,
            timestamp: new Date().toISOString(),
            tabOrder,
            issues,
            coverage: {
                totalInteractive,
                keyboardAccessible,
                percentAccessible: totalInteractive > 0
                    ? Math.round((keyboardAccessible / totalInteractive) * 100)
                    : 100,
            },
            summary: {
                totalIssues: issues.length,
                focusTraps: issues.filter(i => i.type === "focus-trap").length,
                missingIndicators: issues.filter(i => i.type === "no-focus-indicator").length,
                inaccessibleElements: issues.filter(i => i.type === "keyboard-inaccessible").length,
            },
        };
    }

    private async testSkipLinks(): Promise<KeyboardIssue[]> {
        const issues: KeyboardIssue[] = [];

        // Focus the page body first
        await this.stagehand!.act("click on the page body to reset focus");

        // Press Tab to find skip link
        const result = await this.stagehand!.act("press Tab once");

        // Check if first focusable element is a skip link
        const focusState = await this.stagehand!.extract({
            instruction: "What element is currently focused? Is it a skip link?",
            schema: z.object({
                element: z.string(),
                isSkipLink: z.boolean(),
                targetExists: z.boolean().optional(),
            }),
        });

        if (!focusState.isSkipLink) {
            issues.push({
                type: "skip-link-broken",
                element: {
                    description: "Missing skip link",
                    selector: "body",
                },
                message: "Page does not have a skip link as the first focusable element",
                wcagCriteria: getWcagCriteriaForViolation("skip-link"),
                severity: "moderate",
                reproduction: ["Press Tab from page start"],
            });
        } else if (focusState.isSkipLink && focusState.targetExists === false) {
            issues.push({
                type: "skip-link-broken",
                element: {
                    description: "Skip link with invalid target",
                    selector: "a[href^='#']",
                },
                message: "Skip link target does not exist",
                wcagCriteria: getWcagCriteriaForViolation("skip-link"),
                severity: "serious",
                reproduction: ["Press Tab", "Activate skip link", "Verify focus moves to main content"],
            });
        }

        return issues;
    }

    private async testTabNavigation(expectedCount: number): Promise<{
        tabOrder: KeyboardTestResult["tabOrder"];
        issues: KeyboardIssue[];
    }> {
        const tabOrder: KeyboardTestResult["tabOrder"] = [];
        const issues: KeyboardIssue[] = [];
        const visitedSelectors = new Set<string>();
        let tabCount = 0;

        // Reset focus
        await this.stagehand!.act("click on the page body");

        while (tabCount < this.options.maxTabPresses!) {
            // Press Tab
            await this.stagehand!.act("press Tab to move focus to the next element");
            tabCount++;

            // Get current focus state
            const focusState = await this.stagehand!.extract({
                instruction: "Describe the currently focused element",
                schema: FocusStateSchema,
            });

            // Check for focus trap (visiting same element repeatedly)
            if (visitedSelectors.has(focusState.selector)) {
                // Check if we've cycled through all elements (normal behavior)
                if (tabOrder.length >= expectedCount) {
                    break; // Completed full cycle
                }

                // Potential focus trap
                issues.push({
                    type: "focus-trap",
                    element: {
                        description: focusState.element,
                        selector: focusState.selector,
                        role: focusState.role,
                    },
                    message: `Focus is trapped at ${focusState.element}`,
                    wcagCriteria: getWcagCriteriaForViolation("focus-order-semantics"),
                    severity: "critical",
                    reproduction: [`Tab ${tabCount} times to reach element`, "Continue pressing Tab"],
                });
                break;
            }

            visitedSelectors.add(focusState.selector);

            // Check for missing focus indicator
            if (!focusState.hasFocusIndicator) {
                issues.push({
                    type: "no-focus-indicator",
                    element: {
                        description: focusState.element,
                        selector: focusState.selector,
                        role: focusState.role,
                    },
                    message: `No visible focus indicator on ${focusState.element}`,
                    wcagCriteria: getWcagCriteriaForViolation("focus-visible"),
                    severity: "serious",
                    reproduction: [`Tab to ${focusState.element}`],
                });
            }

            tabOrder.push({
                index: tabOrder.length,
                element: focusState.element,
                selector: focusState.selector,
                role: focusState.role,
                hasFocusIndicator: focusState.hasFocusIndicator,
            });
        }

        return { tabOrder, issues };
    }

    private async testKeyboardShortcuts(): Promise<KeyboardIssue[]> {
        const issues: KeyboardIssue[] = [];

        // Test common problematic shortcuts
        const shortcutsToTest = [
            { keys: "s", description: "Single letter 's'" },
            { keys: "n", description: "Single letter 'n'" },
            { keys: "p", description: "Single letter 'p'" },
        ];

        for (const shortcut of shortcutsToTest) {
            // Check if pressing the key triggers any action
            const beforeState = await this.stagehand!.extract({
                instruction: "Describe the current page state",
                schema: z.object({ state: z.string() }),
            });

            await this.stagehand!.act(`press the ${shortcut.keys} key`);

            const afterState = await this.stagehand!.extract({
                instruction: "Describe the current page state, did anything change?",
                schema: z.object({
                    state: z.string(),
                    changed: z.boolean(),
                }),
            });

            if (afterState.changed) {
                issues.push({
                    type: "shortcut-conflict",
                    element: {
                        description: `Keyboard shortcut: ${shortcut.keys}`,
                        selector: "document",
                    },
                    message: `Single-character keyboard shortcut '${shortcut.keys}' is active`,
                    wcagCriteria: getWcagCriteriaForViolation("accesskeys"),
                    severity: "moderate",
                    reproduction: [`Press '${shortcut.keys}' key anywhere on the page`],
                });
            }

            // Reset page state if changed
            if (afterState.changed) {
                await this.stagehand!.act("press Escape to close any opened elements");
            }
        }

        return issues;
    }

    private async testFocusTraps(): Promise<KeyboardIssue[]> {
        const issues: KeyboardIssue[] = [];

        // Discover dialogs/modals
        const dialogs = await this.stagehand!.observe("find any dialog or modal trigger buttons");

        for (const dialog of dialogs) {
            // Open the dialog
            await this.stagehand!.act(dialog);

            // Test if focus is trapped properly within dialog
            const trapTest = await this.testDialogFocusTrap();
            if (trapTest.issue) {
                issues.push(trapTest.issue);
            }

            // Close dialog
            await this.stagehand!.act("press Escape to close the dialog");
        }

        return issues;
    }

    private async testDialogFocusTrap(): Promise<{ issue: KeyboardIssue | null }> {
        // Tab through dialog elements
        let tabCount = 0;
        const maxTabs = 20;
        let escapedDialog = false;

        while (tabCount < maxTabs) {
            await this.stagehand!.act("press Tab");
            tabCount++;

            const focusState = await this.stagehand!.extract({
                instruction: "Is focus still within a dialog/modal? What element is focused?",
                schema: z.object({
                    inDialog: z.boolean(),
                    element: z.string(),
                    selector: z.string(),
                }),
            });

            if (!focusState.inDialog) {
                escapedDialog = true;
                break;
            }
        }

        if (escapedDialog) {
            return {
                issue: {
                    type: "focus-trap",
                    element: {
                        description: "Dialog/Modal",
                        selector: "[role='dialog']",
                    },
                    message: "Focus escapes dialog without closing it",
                    wcagCriteria: getWcagCriteriaForViolation("focus-order-semantics"),
                    severity: "serious",
                    reproduction: ["Open dialog", "Press Tab repeatedly"],
                },
            };
        }

        return { issue: null };
    }

    async close(): Promise<void> {
        if (this.stagehand) {
            await this.stagehand.close();
            this.stagehand = null;
        }
    }
}
```

### CLI Integration

Add new CLI flag `--keyboard-test`:

```bash
pnpm start https://example.com --keyboard-test
```

### Test Cases

1. Discovers all interactive elements
2. Tests tab navigation through all elements
3. Detects missing focus indicators
4. Identifies focus traps
5. Tests skip links
6. Detects single-character shortcuts
7. Tests focus trap within dialogs/modals

---

## Implementation Order

### Phase 1: Keyboard Navigation Tester (Recommended First)
- Most practical immediate value
- Builds on existing keyboard testing infrastructure
- Uses simpler `act()` API
- Estimated effort: Medium

### Phase 2: Accessibility Tree Analysis
- Complements existing axe-core scanning
- Provides deeper ARIA analysis
- Uses `extract()` API with schemas
- Estimated effort: Medium

### Phase 3: WCAG Audit Agent
- Most complex feature
- Requires agent orchestration
- Provides comprehensive autonomous auditing
- Estimated effort: High

---

## Shared Infrastructure

### New Types (`packages/core/src/types.ts`)

```typescript
// Add to existing types
export interface StagehandAuditConfig extends StagehandConfig {
    /** Enable WCAG audit agent */
    enableAuditAgent?: boolean;
    /** Enable accessibility tree analysis */
    enableTreeAnalysis?: boolean;
    /** Enable keyboard testing */
    enableKeyboardTest?: boolean;
    /** WCAG conformance level for audit */
    wcagLevel?: WcagLevel;
}
```

### CLI Flags

| Flag | Description |
|------|-------------|
| `--wcag-audit` | Run autonomous WCAG audit agent |
| `--audit-level <level>` | Target WCAG level (A, AA, AAA) |
| `--analyze-tree` | Extract and analyze accessibility tree |
| `--keyboard-test` | Run comprehensive keyboard navigation tests |
| `--max-steps <n>` | Maximum agent steps (for audit) |

---

## Dependencies

All features use the existing Stagehand dependency:
- `@browserbasehq/stagehand` (already installed)
- `zod` (already installed for schema validation)

No new dependencies required.

---

## Testing Strategy

1. **Unit Tests**: Mock Stagehand APIs to test logic
2. **Integration Tests**: Use test fixtures with known issues
3. **Manual Testing**: Test against real-world sites

---

## Output Format

All features output results compatible with the existing `ScanResults` structure, allowing integration with:
- CLI dashboard display
- JSON export
- CI mode checks
- MCP server responses
