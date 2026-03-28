/**
 * Deep Audits — Tiered audit composition layer
 *
 * Each deep function runs core (tier 1) + Stagehand AI (tier 2)
 * on a shared browser, returning an extended result type.
 * Falls back to tier 1 if Stagehand/API keys are unavailable.
 */
export { deepAuditKeyboard } from './keyboard.js';
export { deepAuditStructure } from './structure.js';
export { deepAuditScreenReader } from './screen-reader.js';
export type {
    DeepKeyboardAuditResult,
    DeepStructureAuditResult,
    DeepScreenReaderAuditResult,
    DeepAuditOptions,
} from './types.js';
