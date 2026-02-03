/**
 * @accessibility-toolkit/ai-auditor
 *
 * AI-powered accessibility auditing using Stagehand and Browserbase.
 * Provides intelligent WCAG auditing, keyboard navigation testing,
 * and accessibility tree analysis.
 *
 * @example
 * ```typescript
 * import {
 *   BrowserbaseClient,
 *   createLiveAuditSession,
 * } from '@accessibility-toolkit/ai-auditor';
 *
 * // Create a live audit session with Browserbase
 * const client = new BrowserbaseClient({
 *   apiKey: process.env.BROWSERBASE_API_KEY!,
 *   projectId: process.env.BROWSERBASE_PROJECT_ID!,
 * });
 *
 * const session = await createLiveAuditSession(client);
 * console.log(`Watch live: ${session.liveViewUrl}`);
 *
 * const results = await session.audit('https://example.com', {
 *   onProgress: (step) => console.log(step),
 *   onFinding: (finding) => console.log(finding),
 * });
 *
 * await session.close();
 * ```
 */

// =============================================================================
// Browserbase Integration
// =============================================================================

export {
    BrowserbaseClient,
    createBrowserbaseClient,
    type BrowserbaseConfig,
    type BrowserbaseSession,
} from './browserbase/client.js';

export {
    createLiveAuditSession,
    type AuditStreamCallbacks,
    type LiveAuditSession,
} from './browserbase/session.js';

// =============================================================================
// Types
// =============================================================================

export type {
    // Keyboard testing types
    StagehandKeyboardConfig,
    StagehandKeyboardIssue,
    StagehandKeyboardIssueType,
    StagehandKeyboardResults,
    TabOrderEntry,

    // Tree analysis types
    TreeAnalysisConfig,
    TreeAnalysisResult,
    TreeIssue,
    TreeIssueType,
    A11yTreeNode,

    // WCAG audit types
    WcagAuditOptions,
    WcagAuditResult,
    AuditFinding,
    AuditStatus,

    // Test generation types
    ElementType,
    ElementDiscovery,
    TestGenerationOptions,
    TestGenerationResults,
} from './types.js';

// NOTE: Stagehand scanners and services are currently provided by @accessibility-toolkit/core
// They will be migrated to this package in a future release.
// For now, use imports from @accessibility-toolkit/core for:
// - StagehandKeyboardTester
// - AccessibilityTreeAnalyzer
// - WcagAuditAgent
// - StagehandTestGenerator
// - KeyboardTestService
// - TreeAnalysisService
// - WcagAuditService
// - TestGenerationService
