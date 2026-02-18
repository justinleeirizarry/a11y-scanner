/**
 * Keyboard test result schemas
 *
 * Validates the structure of keyboard navigation test results
 * including tab order, focus management, and shortcut testing.
 */
import { Schema } from 'effect';
import { SeverityLevel, type Mutable } from './primitives.js';

// Tab order violation types
const TabOrderViolationType = Schema.Literal(
    'tab-trap', 'illogical-order', 'tabindex-antipattern', 'hidden-focusable',
);

// Focus indicator issue types
const FocusIssueType = Schema.Literal('missing', 'low-contrast', 'too-small', 'not-visible');

// Keyboard support levels for custom widgets
const KeyboardSupportLevel = Schema.Literal('full', 'partial', 'none');

// Tab order entry
const TabOrderEntry = Schema.Struct({
    selector: Schema.String,
    tabIndex: Schema.Number,
    position: Schema.Struct({
        x: Schema.Number,
        y: Schema.Number,
    }),
});

// Tab order violation
const TabOrderViolation = Schema.Struct({
    type: TabOrderViolationType,
    element: Schema.String,
    details: Schema.String,
    severity: SeverityLevel,
});

// Visual order mismatch
const VisualOrderMismatch = Schema.Struct({
    domIndex: Schema.Number,
    visualIndex: Schema.Number,
    element: Schema.String,
});

// Focus indicator issue
const FocusIndicatorIssue = Schema.Struct({
    element: Schema.String,
    issue: FocusIssueType,
    details: Schema.String,
    severity: SeverityLevel,
});

// Focus restoration test result
const FocusRestorationTest = Schema.Struct({
    scenario: Schema.String,
    passed: Schema.Boolean,
    details: Schema.String,
});

// Keyboard shortcut test result
const ShortcutTest = Schema.Struct({
    shortcut: Schema.String,
    description: Schema.String,
    passed: Schema.Boolean,
    details: Schema.String,
});

// Custom widget keyboard support
const CustomWidget = Schema.Struct({
    element: Schema.String,
    role: Schema.String,
    keyboardSupport: KeyboardSupportLevel,
    issues: Schema.Array(Schema.String),
});

// Complete keyboard test results
export const KeyboardTestResults = Schema.Struct({
    tabOrder: Schema.Struct({
        totalFocusableElements: Schema.Number,
        tabOrder: Schema.Array(TabOrderEntry),
        violations: Schema.Array(TabOrderViolation),
        visualOrderMismatches: Schema.Array(VisualOrderMismatch),
    }),
    focusManagement: Schema.Struct({
        focusIndicatorIssues: Schema.Array(FocusIndicatorIssue),
        skipLinksWorking: Schema.Boolean,
        skipLinkDetails: Schema.String,
        focusRestorationTests: Schema.Array(FocusRestorationTest),
    }),
    shortcuts: Schema.Struct({
        tests: Schema.Array(ShortcutTest),
        customWidgets: Schema.Array(CustomWidget),
    }),
    summary: Schema.Struct({
        totalIssues: Schema.Number,
        criticalIssues: Schema.Number,
        seriousIssues: Schema.Number,
        moderateIssues: Schema.Number,
    }),
});
export type KeyboardTestResults = Mutable<typeof KeyboardTestResults.Type>;
