/**
 * AI Auditor Services - Public API
 *
 * This module exports all Stagehand-based accessibility testing services.
 */

// Keyboard Test Service
export {
    KeyboardTestService,
    createKeyboardTestService,
} from './KeyboardTestService.js';

// Tree Analysis Service
export {
    TreeAnalysisService,
    createTreeAnalysisService,
} from './TreeAnalysisService.js';

// WCAG Audit Service
export {
    WcagAuditService,
    createWcagAuditService,
} from './WcagAuditService.js';

// Test Generation Service
export {
    TestGenerationService,
    createTestGenerationService,
} from './TestGenerationService.js';

// Types
export type {
    IKeyboardTestService,
    ITreeAnalysisService,
    IWcagAuditService,
} from './types.js';

export type {
    TestGenerationConfig,
    ITestGenerationService,
} from './testgen-types.js';
