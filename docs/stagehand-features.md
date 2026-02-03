# Stagehand Advanced Accessibility Testing Features

This document describes the three AI-powered accessibility testing features built on [Stagehand](https://github.com/browserbasehq/stagehand).

## Overview

| Feature | CLI Flag | Stagehand API | Purpose |
|---------|----------|---------------|---------|
| Keyboard Navigation Tester | `--stagehand-keyboard` | `extract()` | Tests keyboard accessibility patterns |
| Accessibility Tree Analysis | `--stagehand-tree` | `extract()` | Analyzes page accessibility tree structure |
| WCAG Audit Agent | `--wcag-audit` | `agent()` | Autonomous WCAG compliance auditing |

## Prerequisites

These features require an AI API key:

```bash
# For OpenAI models (default)
export OPENAI_API_KEY=your-key

# For Anthropic models
export ANTHROPIC_API_KEY=your-key
```

---

## 1. Keyboard Navigation Tester

Tests keyboard accessibility by simulating Tab navigation, checking focus indicators, and detecting focus traps.

### Usage

```bash
# Basic keyboard test
pnpm start https://example.com --stagehand-keyboard

# With custom tab limit
pnpm start https://example.com --stagehand-keyboard --max-tab-presses 50

# Save results to JSON
pnpm start https://example.com --stagehand-keyboard --output keyboard-results.json
```

### CLI Options

| Option | Default | Description |
|--------|---------|-------------|
| `--stagehand-keyboard` | `false` | Enable keyboard navigation testing |
| `--max-tab-presses` | `100` | Maximum Tab key presses before stopping |

### What It Tests

1. **Tab Navigation Order** - Records the sequence of focused elements
2. **Focus Indicators** - Checks if each element has visible focus styling
3. **Focus Traps** - Detects when focus gets stuck on an element
4. **Skip Links** - Verifies skip-to-content link presence and functionality
5. **Keyboard Accessibility Coverage** - Calculates percentage of interactive elements reachable by keyboard

### WCAG Criteria Checked

| Criterion | Title | Level |
|-----------|-------|-------|
| 2.1.1 | Keyboard | A |
| 2.1.2 | No Keyboard Trap | A |
| 2.4.1 | Bypass Blocks | A |
| 2.4.3 | Focus Order | A |
| 2.4.7 | Focus Visible | AA |
| 2.4.11 | Focus Not Obscured (Minimum) | AA |
| 2.1.4 | Character Key Shortcuts | A |

### Output Structure

```typescript
interface StagehandKeyboardResults {
  url: string;
  timestamp: string;
  tabOrder: Array<{
    index: number;
    element: string;
    selector: string;
    role: string;
    hasFocusIndicator: boolean;
  }>;
  issues: Array<{
    type: 'focus-trap' | 'no-focus-indicator' | 'tab-order-violation' |
          'keyboard-inaccessible' | 'skip-link-broken' | 'shortcut-conflict';
    element: { description: string; selector: string; role?: string };
    message: string;
    wcagCriteria: WcagCriterionInfo[];
    severity: 'critical' | 'serious' | 'moderate';
    reproduction: string[];
  }>;
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
```

---

## 2. Accessibility Tree Analysis

Extracts and analyzes the page's accessibility tree structure to identify semantic and structural issues.

### Usage

```bash
# Basic tree analysis
pnpm start https://example.com --stagehand-tree

# Include full tree in output
pnpm start https://example.com --stagehand-tree --include-full-tree

# Save results to JSON
pnpm start https://example.com --stagehand-tree --output tree-results.json
```

### CLI Options

| Option | Default | Description |
|--------|---------|-------------|
| `--stagehand-tree` | `false` | Enable accessibility tree analysis |
| `--include-full-tree` | `false` | Include complete tree structure in output |

### What It Analyzes

1. **Landmarks** - Checks for required landmarks (main, navigation, etc.)
2. **Heading Structure** - Validates heading hierarchy (no skipped levels)
3. **Interactive Element Names** - Ensures buttons, links have accessible names
4. **Form Control Labels** - Verifies form inputs have associated labels
5. **ARIA Roles** - Validates that ARIA roles are valid
6. **Hidden Focusable Elements** - Detects focusable elements that are hidden
7. **Duplicate IDs** - Finds duplicate ID attributes

### Issue Types

| Issue Type | Description | Severity |
|------------|-------------|----------|
| `missing-landmark` | Page missing required landmark (e.g., main) | Serious |
| `missing-name` | Interactive element without accessible name | Critical |
| `missing-role` | Element missing required ARIA role | Serious |
| `invalid-role` | Element has invalid ARIA role value | Serious |
| `heading-skip` | Heading levels are skipped (e.g., h1 to h3) | Moderate |
| `orphaned-control` | Form control without label | Critical |
| `duplicate-id` | Multiple elements share same ID | Moderate |
| `focusable-hidden` | Hidden element is still focusable | Serious |

### WCAG Criteria Mapping

| Issue Type | WCAG Criteria |
|------------|---------------|
| `missing-landmark` | 1.3.1 Info and Relationships, 2.4.1 Bypass Blocks |
| `missing-name` | 4.1.2 Name, Role, Value |
| `invalid-role` | 4.1.2 Name, Role, Value |
| `heading-skip` | 1.3.1 Info and Relationships, 2.4.6 Headings and Labels |
| `orphaned-control` | 1.3.1 Info and Relationships, 3.3.2 Labels or Instructions |
| `duplicate-id` | 4.1.1 Parsing |
| `focusable-hidden` | 4.1.2 Name, Role, Value |

### Output Structure

```typescript
interface TreeAnalysisResult {
  url: string;
  timestamp: string;
  tree: A11yTreeNode;  // Full tree if --include-full-tree
  stats: {
    landmarks: number;
    headings: number;
    formControls: number;
    interactiveElements: number;
    totalNodes: number;
  };
  issues: Array<{
    type: TreeIssueType;
    node: { role: string; name?: string; selector: string };
    message: string;
    wcagCriteria: WcagCriterionInfo[];
    severity: 'critical' | 'serious' | 'moderate' | 'minor';
  }>;
  summary: {
    totalIssues: number;
    bySeverity: Record<string, number>;
  };
}
```

---

## 3. WCAG Audit Agent

An autonomous AI agent that performs comprehensive WCAG compliance auditing by interacting with the page.

### Usage

```bash
# Basic WCAG AA audit
pnpm start https://example.com --wcag-audit

# Target specific WCAG level
pnpm start https://example.com --wcag-audit --audit-level A
pnpm start https://example.com --wcag-audit --audit-level AAA

# Limit agent steps
pnpm start https://example.com --wcag-audit --max-steps 50

# Save results to JSON
pnpm start https://example.com --wcag-audit --output wcag-results.json
```

### CLI Options

| Option | Default | Description |
|--------|---------|-------------|
| `--wcag-audit` | `false` | Enable WCAG compliance audit |
| `--audit-level` | `AA` | Target WCAG level (A, AA, or AAA) |
| `--max-steps` | `30` | Maximum agent actions before stopping |

### What It Tests

The agent autonomously:

1. **Navigates** the page using keyboard
2. **Checks** focus visibility on each element
3. **Examines** color contrast of text
4. **Tests** form controls and their labels
5. **Verifies** heading structure
6. **Checks** for skip links and landmarks
7. **Documents** findings with WCAG criterion IDs

### WCAG Levels

| Level | Criteria Count | Description |
|-------|----------------|-------------|
| A | 30 | Minimum accessibility requirements |
| AA | 20 additional | Standard compliance target (recommended) |
| AAA | 28 additional | Highest level of accessibility |

### Finding Statuses

| Status | Description |
|--------|-------------|
| `pass` | Criterion met successfully |
| `fail` | Criterion violated |
| `manual-review` | Requires human verification |

### Impact Levels

| Impact | Description |
|--------|-------------|
| `critical` | Blocks access for users with disabilities |
| `serious` | Causes significant difficulty |
| `moderate` | Causes some difficulty |
| `minor` | Minor inconvenience |

### Output Structure

```typescript
interface WcagAuditResult {
  url: string;
  timestamp: string;
  targetLevel: 'A' | 'AA' | 'AAA';
  findings: Array<{
    criterion: {
      id: string;        // e.g., "2.4.7"
      title: string;     // e.g., "Focus Visible"
      level: WcagLevel;
      principle: string; // Perceivable, Operable, Understandable, Robust
      w3cUrl: string;
    };
    status: 'pass' | 'fail' | 'manual-review';
    element?: string;
    selector?: string;
    description: string;
    impact?: 'critical' | 'serious' | 'moderate' | 'minor';
    evidence?: string;
  }>;
  summary: {
    passed: number;
    failed: number;
    manualReview: number;
    pagesVisited: number;
    statesChecked: number;
  };
  agentMessage: string;  // AI-generated summary
}
```

---

## Programmatic Usage

All features are available programmatically via Effect services:

```typescript
import {
  KeyboardTestService,
  TreeAnalysisService,
  WcagAuditService,
  createKeyboardTestService,
  createTreeAnalysisService,
  createWcagAuditService,
} from '@react-a11y-scanner/core';
import { Effect } from 'effect';

// Keyboard Testing
const keyboardTest = Effect.gen(function* () {
  const service = yield* KeyboardTestService;
  yield* service.init({ maxTabPresses: 100, verbose: true });
  const results = yield* service.test('https://example.com');
  yield* service.close();
  return results;
});

// Tree Analysis
const treeAnalysis = Effect.gen(function* () {
  const service = yield* TreeAnalysisService;
  yield* service.init({ includeFullTree: true });
  const results = yield* service.analyze('https://example.com');
  yield* service.close();
  return results;
});

// WCAG Audit
const wcagAudit = Effect.gen(function* () {
  const service = yield* WcagAuditService;
  yield* service.init({ targetLevel: 'AA', maxSteps: 30 });
  const results = yield* service.audit('https://example.com');
  yield* service.close();
  return results;
});
```

---

## Architecture

```
packages/core/src/
├── scanner/stagehand/
│   ├── keyboard-tester.ts      # Keyboard navigation testing
│   ├── a11y-tree-analyzer.ts   # Tree analysis
│   ├── a11y-tree-rules.ts      # Validation rules & WCAG mapping
│   ├── wcag-audit-agent.ts     # WCAG audit agent
│   └── audit-prompts.ts        # System prompts for audit
├── services/stagehand/
│   ├── types.ts                # Service interfaces
│   ├── KeyboardTestService.ts  # Effect wrapper
│   ├── TreeAnalysisService.ts  # Effect wrapper
│   ├── WcagAuditService.ts     # Effect wrapper
│   └── index.ts                # Exports
└── types.ts                    # Type definitions

packages/cli/src/
├── components/
│   ├── StagehandProgress.tsx   # Progress indicator
│   └── StagehandResults.tsx    # Results display
├── App.tsx                     # Mode handling
└── index.tsx                   # CLI flags
```

---

## Comparison with Standard Scan

| Feature | Standard Scan | Stagehand Features |
|---------|---------------|-------------------|
| Speed | Fast (~5s) | Slower (~30-60s) |
| AI Required | No | Yes |
| Interactivity | Static analysis | Dynamic interaction |
| Coverage | axe-core rules | WCAG criteria + AI insights |
| Cost | Free | API usage costs |

### When to Use Each

**Use Standard Scan (`pnpm start <url>`) when:**
- You need fast CI/CD integration
- You want deterministic, reproducible results
- You're checking known axe-core rules

**Use Stagehand Features when:**
- You need comprehensive WCAG compliance checking
- You want AI-powered insights and recommendations
- You need to test keyboard navigation thoroughly
- You want to analyze accessibility tree structure
