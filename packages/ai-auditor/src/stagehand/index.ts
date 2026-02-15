/**
 * Stagehand Scanners - Public API
 *
 * This module exports all Stagehand-based accessibility scanner classes.
 */

export { StagehandScanner } from './scanner.js';
export { StagehandKeyboardTester } from './keyboard-tester.js';
export { StagehandTreeAnalyzer } from './a11y-tree-analyzer.js';
export { StagehandWcagAuditAgent } from './wcag-audit-agent.js';
export { TestGenerator } from './test-generator.js';

// Prompt builders
export {
    buildWcagAuditPrompt,
    buildCriteriaList,
    buildFocusedAuditPrompt,
    getKeyboardCriteria,
    getVisualCriteria,
    getFormsCriteria,
    getNavigationCriteria,
    getInitialAnalysisInstruction,
    getFinalSummaryInstruction,
} from './audit-prompts.js';

// Tree rules
export {
    VALID_LANDMARK_ROLES,
    INTERACTIVE_ROLES,
    ROLES_REQUIRING_NAME,
    HEADING_ROLES,
    FORM_CONTROL_ROLES,
    VALID_ARIA_ROLES,
    TREE_ISSUE_WCAG_MAP,
    isValidRole,
    isLandmarkRole,
    isInteractiveRole,
    roleRequiresName,
    isFormControlRole,
    getHeadingLevelFromRole,
} from './a11y-tree-rules.js';

// WCAG element mapping
export {
    getRelatedCriteria,
    sortByWcagPriority,
    formatCriteriaComment,
} from './wcag-element-map.js';
