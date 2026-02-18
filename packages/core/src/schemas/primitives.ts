/**
 * Primitive schemas for accessibility types
 *
 * These are the atomic building blocks used throughout the schema system.
 * Each schema provides both a TypeScript type and runtime validation.
 */
import { Schema } from 'effect';

/**
 * Deep mutable utility type.
 *
 * Effect Schema produces readonly types by default. The existing codebase
 * expects mutable types, so we use this to convert schema types to mutable
 * versions for export while keeping schemas readonly for validation.
 */
export type Mutable<T> =
    T extends ReadonlyArray<infer U> ? Array<Mutable<U>> :
    T extends ReadonlyMap<infer K, infer V> ? Map<Mutable<K>, Mutable<V>> :
    T extends ReadonlySet<infer U> ? Set<Mutable<U>> :
    T extends object ? { -readonly [P in keyof T]: Mutable<T[P]> } :
    T;

// Impact level for accessibility violations (4-level scale from axe-core)
export const ImpactLevel = Schema.Literal('critical', 'serious', 'moderate', 'minor');
export type ImpactLevel = typeof ImpactLevel.Type;

// Impact level that may be null (for non-violation results)
export const ImpactLevelOrNull = Schema.NullOr(ImpactLevel);
export type ImpactLevelOrNull = typeof ImpactLevelOrNull.Type;

// Severity level for keyboard accessibility issues (3-level scale)
export const SeverityLevel = Schema.Literal('critical', 'serious', 'moderate');
export type SeverityLevel = typeof SeverityLevel.Type;

// WCAG conformance level
export const WcagLevel = Schema.Literal('A', 'AA', 'AAA');
export type WcagLevel = typeof WcagLevel.Type;

// WCAG principle categories
export const WcagPrinciple = Schema.Literal('Perceivable', 'Operable', 'Understandable', 'Robust');
export type WcagPrinciple = typeof WcagPrinciple.Type;

// Browser types supported by Playwright
export const BrowserType = Schema.Literal('chromium', 'firefox', 'webkit');
export type BrowserType = typeof BrowserType.Type;

// Fix suggestion priority
export const FixPriority = Schema.Literal('critical', 'high', 'medium', 'low');
export type FixPriority = typeof FixPriority.Type;
