/**
 * Tool Registry
 *
 * Creates all agent tools in a provider-agnostic format.
 * Each tool is a plain { name, description, inputSchema, run } object.
 * The provider adapter converts these to native format (betaZodTool, tool(), etc.).
 */
import type { AgentToolDef } from './provider.js';
import type { AuditSession } from '../types.js';
import { createScanPageTool } from '../tools/scan-page.js';
import { createScanBatchTool } from '../tools/scan-batch.js';
import { createReadStateTool } from '../tools/read-state.js';
import { createCrawlPlannerTool } from '../tools/crawl-planner.js';
import { createVerifyFindingsTool } from '../tools/verify-findings.js';
import { createDiffReportTool } from '../tools/diff-report.js';
import { createGenerateRemediationTool } from '../tools/generate-remediation.js';

/**
 * Create all agent tools bound to the given session.
 * Returns a keyed object for named access + easy conversion to array.
 */
export function createToolRegistry(session: AuditSession): Record<string, AgentToolDef> {
    return {
        plan_crawl: createCrawlPlannerTool(session),
        scan_page: createScanPageTool(session),
        scan_batch: createScanBatchTool(session),
        read_state: createReadStateTool(session),
        verify_findings: createVerifyFindingsTool(session),
        diff_report: createDiffReportTool(session),
        generate_remediation: createGenerateRemediationTool(session),
    };
}
