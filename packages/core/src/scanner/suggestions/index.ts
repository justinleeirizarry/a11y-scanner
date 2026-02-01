/**
 * Suggestions module - generates contextual fix suggestions for accessibility violations
 */

// Core functions
export { generateFixSuggestion } from './fix-generator.js';
export { generateContextualFix, hasContextualSupport } from './contextual-suggestions.js';
export { parseElement, inferLabel, describeWhatsMissing, getElementCategory } from './element-analyzer.js';
export { renderFix, renderViolationSummary, generateAIPrompt } from './fix-renderer.js';

// Types
export type { FixSuggestion } from './fix-generator.js';
export type {
    ParsedElement,
    ElementCategory,
    ContextualFix,
    ViolationNode,
    RenderedFix,
    SuggestionGenerator,
} from './types.js';
