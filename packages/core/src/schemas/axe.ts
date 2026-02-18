/**
 * Axe-core result schemas
 *
 * Mirrors the axe-core result structures (violations, passes, incomplete)
 * with Effect Schema validation.
 */
import { Schema } from 'effect';
import { ImpactLevel, ImpactLevelOrNull, type Mutable } from './primitives.js';

// Related node in axe check results
const AxeRelatedNode = Schema.Struct({
    html: Schema.String,
    target: Schema.Array(Schema.String),
});

// Check result from axe-core (detailed test information)
export const AxeCheckResult = Schema.Struct({
    id: Schema.String,
    impact: ImpactLevelOrNull,
    message: Schema.String,
    data: Schema.optional(Schema.Unknown),
    relatedNodes: Schema.optional(Schema.Array(AxeRelatedNode)),
});
export type AxeCheckResult = Mutable<typeof AxeCheckResult.Type>;

// Node result from axe-core
export const AxeNodeResult = Schema.Struct({
    html: Schema.String,
    target: Schema.Array(Schema.String),
    failureSummary: Schema.optional(Schema.String),
    impact: Schema.optional(ImpactLevelOrNull),
    any: Schema.optional(Schema.Array(AxeCheckResult)),
    all: Schema.optional(Schema.Array(AxeCheckResult)),
    none: Schema.optional(Schema.Array(AxeCheckResult)),
});
export type AxeNodeResult = Mutable<typeof AxeNodeResult.Type>;

// Base axe result structure (used for violations, passes, incomplete)
export const AxeResult = Schema.Struct({
    id: Schema.String,
    impact: ImpactLevelOrNull,
    description: Schema.String,
    help: Schema.String,
    helpUrl: Schema.String,
    tags: Schema.Array(Schema.String),
    nodes: Schema.Array(AxeNodeResult),
});
export type AxeResult = Mutable<typeof AxeResult.Type>;

// Violations always have a non-null impact
export const AxeViolation = Schema.Struct({
    id: Schema.String,
    impact: ImpactLevel,
    description: Schema.String,
    help: Schema.String,
    helpUrl: Schema.String,
    tags: Schema.Array(Schema.String),
    nodes: Schema.Array(AxeNodeResult),
});
export type AxeViolation = Mutable<typeof AxeViolation.Type>;
