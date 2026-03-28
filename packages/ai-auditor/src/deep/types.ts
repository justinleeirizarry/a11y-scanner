/**
 * Deep Audit Types
 *
 * Extended result types that combine core (tier 1) audit results
 * with Stagehand AI-enhanced (tier 2) deep analysis.
 */
import type { KeyboardAuditResult, StructureAuditResult, ScreenReaderAuditResult } from '@aria51/core';
import type { StagehandKeyboardResults, TreeAnalysisResult, ScreenReaderNavigationResults } from '../types.js';

export interface DeepKeyboardAuditResult extends KeyboardAuditResult {
    deep: true;
    deepAnalysis: StagehandKeyboardResults;
}

export interface DeepStructureAuditResult extends StructureAuditResult {
    deep: true;
    deepAnalysis: TreeAnalysisResult;
}

export interface DeepScreenReaderAuditResult extends ScreenReaderAuditResult {
    deep: true;
    deepAnalysis: ScreenReaderNavigationResults;
}

export interface DeepAuditOptions {
    /** AI model for Stagehand analysis (default: gpt-4o-mini) */
    model?: string;
    /** Enable verbose Stagehand logging */
    verbose?: boolean;
    /** Run browser in headless mode (default: true) */
    headless?: boolean;
}
