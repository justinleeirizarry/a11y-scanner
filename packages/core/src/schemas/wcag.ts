/**
 * WCAG criterion schemas
 *
 * WcagCriterionId is a literal union of all 86 WCAG 2.2 criterion IDs,
 * derived from the WCAG_CRITERIA database. WcagCriterionInfo provides
 * the full criterion metadata struct.
 */
import { Schema } from 'effect';
import { WCAG_CRITERIA } from '../data/wcag-criteria.js';
import { WcagLevel, WcagPrinciple, type Mutable } from './primitives.js';

// All 86 WCAG criterion IDs as a literal union, derived from the WCAG_CRITERIA database
const wcagIds = Object.keys(WCAG_CRITERIA) as [string, ...string[]];
export const WcagCriterionId = Schema.Literal(...wcagIds);
export type WcagCriterionId = typeof WcagCriterionId.Type;

// WCAG criterion information for enriched violation reports
export const WcagCriterionInfo = Schema.Struct({
    id: WcagCriterionId,
    title: Schema.String,
    level: WcagLevel,
    principle: WcagPrinciple,
    w3cUrl: Schema.String,
});
export type WcagCriterionInfo = Mutable<typeof WcagCriterionInfo.Type>;
