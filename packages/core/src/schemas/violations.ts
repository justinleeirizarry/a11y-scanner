/**
 * Violation schemas
 *
 * Schemas for attributed violations, passes, and incomplete results.
 * These represent axe-core results attributed to React components (or not).
 */
import { Schema } from 'effect';
import { ImpactLevel, ImpactLevelOrNull, FixPriority, type Mutable } from './primitives.js';
import { WcagLevel } from './primitives.js';
import { WcagCriterionInfo } from './wcag.js';

// Related node information (elements connected to a violation)
export const RelatedNode = Schema.Struct({
    html: Schema.String,
    target: Schema.Array(Schema.String),
    htmlSnippet: Schema.optional(Schema.String),
});
export type RelatedNode = Mutable<typeof RelatedNode.Type>;

// Check detail for attributed violations
export const AttributedCheck = Schema.Struct({
    id: Schema.String,
    impact: ImpactLevelOrNull,
    message: Schema.String,
    relatedNodes: Schema.optional(Schema.Array(RelatedNode)),
});
export type AttributedCheck = Mutable<typeof AttributedCheck.Type>;

// Fix suggestion for a violation
export const FixSuggestion = Schema.Struct({
    summary: Schema.String,
    details: Schema.String,
    wcagCriteria: Schema.optional(Schema.String),
    wcagLevel: Schema.optional(WcagLevel),
    userImpact: Schema.optional(Schema.String),
    priority: Schema.optional(FixPriority),
});
export type FixSuggestion = Mutable<typeof FixSuggestion.Type>;

// Check results grouped by type (any/all/none)
const CheckResults = Schema.Struct({
    any: Schema.optional(Schema.Array(AttributedCheck)),
    all: Schema.optional(Schema.Array(AttributedCheck)),
    none: Schema.optional(Schema.Array(AttributedCheck)),
});

// Component type discriminator
const ComponentType = Schema.NullOr(Schema.Literal('host', 'component'));

// Violation node with component attribution
const AttributedViolationNode = Schema.Struct({
    component: Schema.NullOr(Schema.String),
    componentPath: Schema.Array(Schema.String),
    userComponentPath: Schema.Array(Schema.String),
    componentType: ComponentType,
    html: Schema.String,
    htmlSnippet: Schema.String,
    cssSelector: Schema.String,
    target: Schema.Array(Schema.String),
    failureSummary: Schema.String,
    isFrameworkComponent: Schema.Boolean,
    checks: Schema.optional(CheckResults),
});

// Violation attributed to a component
export const AttributedViolation = Schema.Struct({
    id: Schema.String,
    impact: ImpactLevel,
    description: Schema.String,
    help: Schema.String,
    helpUrl: Schema.String,
    tags: Schema.Array(Schema.String),
    wcagCriteria: Schema.optional(Schema.Array(WcagCriterionInfo)),
    nodes: Schema.Array(AttributedViolationNode),
    fixSuggestion: Schema.optional(FixSuggestion),
});
export type AttributedViolation = Mutable<typeof AttributedViolation.Type>;

// Pass node (simpler than violation nodes)
const AttributedPassNode = Schema.Struct({
    component: Schema.NullOr(Schema.String),
    html: Schema.String,
    htmlSnippet: Schema.String,
    target: Schema.Array(Schema.String),
});

// Pass result attributed to components (rules that passed)
export const AttributedPass = Schema.Struct({
    id: Schema.String,
    impact: ImpactLevelOrNull,
    description: Schema.String,
    help: Schema.String,
    helpUrl: Schema.String,
    tags: Schema.Array(Schema.String),
    nodes: Schema.Array(AttributedPassNode),
});
export type AttributedPass = Mutable<typeof AttributedPass.Type>;

// Incomplete node (needs manual review)
const AttributedIncompleteNode = Schema.Struct({
    component: Schema.NullOr(Schema.String),
    html: Schema.String,
    htmlSnippet: Schema.String,
    target: Schema.Array(Schema.String),
    message: Schema.optional(Schema.String),
    checks: Schema.optional(CheckResults),
});

// Incomplete result (needs manual review)
export const AttributedIncomplete = Schema.Struct({
    id: Schema.String,
    impact: ImpactLevelOrNull,
    description: Schema.String,
    help: Schema.String,
    helpUrl: Schema.String,
    tags: Schema.Array(Schema.String),
    nodes: Schema.Array(AttributedIncompleteNode),
});
export type AttributedIncomplete = Mutable<typeof AttributedIncomplete.Type>;

// Inapplicable rule (rule that doesn't apply to this page)
export const InapplicableRule = Schema.Struct({
    id: Schema.String,
    description: Schema.String,
    help: Schema.String,
    helpUrl: Schema.String,
    tags: Schema.Array(Schema.String),
});
export type InapplicableRule = Mutable<typeof InapplicableRule.Type>;
