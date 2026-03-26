/**
 * Agent Loop
 *
 * The core agent harness. Supports two providers:
 * - 'anthropic': Native SDK (betaZodTool + toolRunner + adaptive thinking + resilient fallback)
 * - 'ai-sdk': Vercel AI SDK (any provider — OpenAI, Google, Ollama, etc.)
 *
 * And three execution modes:
 * - Single pass: one generalist agent
 * - Voting: multiple specialized voters, consensus merge
 * - Lead agent (default for voting): orchestrator plans → voters execute
 */
import type {
    AgentConfig,
    AgentEvent,
    AuditReport,
    AuditSession,
    ConfidenceLevel,
    ImpactLevel,
} from '../types.js';
import { DEFAULT_AGENT_CONFIG } from '../types.js';
import { createAuditSession } from '../state/audit-session.js';
import { createToolRegistry } from './tool-registry.js';
import { createProvider } from './provider.js';
import {
    buildSystemPrompt,
    buildInitialMessage,
    buildVoterSystemPrompt,
    buildVoterInitialMessage,
} from './system-prompt.js';
import { VOTER_LENSES, type VoterLens } from './voter-lenses.js';
import { mergeVoterReports, type VotingResult } from './voting-merger.js';
import { runLeadAgentWithVoting } from './lead-agent.js';

// =============================================================================
// Public API
// =============================================================================

export interface RunAgentOptions extends Partial<AgentConfig> {
    /** Required: the URL to audit */
    targetUrl: string;
}

/**
 * Run the autonomous accessibility auditing agent.
 *
 * @example
 * // Anthropic (default)
 * await runAgent({ targetUrl: 'https://example.com' });
 *
 * // OpenAI via AI SDK
 * import { openai } from '@ai-sdk/openai';
 * await runAgent({ targetUrl: 'https://example.com', provider: { type: 'ai-sdk', model: openai('gpt-4o') } });
 *
 * // Voting mode
 * await runAgent({ targetUrl: 'https://example.com', voting: true });
 */
export async function runAgent(options: RunAgentOptions): Promise<AuditReport> {
    const config: AgentConfig = {
        ...DEFAULT_AGENT_CONFIG,
        ...options,
    };

    if (config.voting) {
        const result = await runAgentWithVoting(config);
        return result.report;
    }

    return runSingleAgent(config);
}

/**
 * Run the voting variant and return the full VotingResult.
 */
export async function runAgentWithVoting(
    options: RunAgentOptions & { useLeadAgent?: boolean }
): Promise<VotingResult> {
    const config: AgentConfig = {
        ...DEFAULT_AGENT_CONFIG,
        ...options,
        voting: true,
    };

    // Lead agent only supported with Anthropic provider (needs adaptive thinking + delegate tool)
    const useLeadAgent = options.useLeadAgent !== false && config.provider === 'anthropic';
    if (useLeadAgent) {
        return runLeadAgentWithVoting(config);
    }

    // Flat voting — works with any provider
    const emit = (event: AgentEvent) => config.onEvent?.(event);
    const startTime = Date.now();
    const provider = createProvider(config.provider);

    const voterCount = Math.min(config.voterCount || VOTER_LENSES.length, VOTER_LENSES.length);
    const lenses = VOTER_LENSES.slice(0, voterCount);

    emit({
        type: 'thinking',
        message: `Starting voting audit with ${lenses.length} voters (provider: ${typeof config.provider === 'string' ? config.provider : config.provider.type})`,
    });

    const voterPromises = lenses.map((lens) =>
        runVoter(config, provider, lens, emit).catch((error) => {
            emit({ type: 'thinking', message: `Voter ${lens.id} failed: ${error instanceof Error ? error.message : String(error)}` });
            return null;
        })
    );

    const voterResults = await Promise.all(voterPromises);

    const successfulReports: AuditReport[] = [];
    const successfulIds: string[] = [];
    for (let i = 0; i < voterResults.length; i++) {
        if (voterResults[i]) {
            successfulReports.push(voterResults[i]!);
            successfulIds.push(lenses[i].id);
        }
    }

    if (successfulReports.length === 0) throw new Error('All voters failed.');

    const votingResult = mergeVoterReports(successfulReports, successfulIds);
    votingResult.report.scanDurationMs = Date.now() - startTime;
    emit({ type: 'complete', report: votingResult.report });
    return votingResult;
}

// =============================================================================
// Single Agent Pass
// =============================================================================

async function runSingleAgent(config: AgentConfig): Promise<AuditReport> {
    const startTime = Date.now();
    const provider = createProvider(config.provider);
    const session = createAuditSession(config);
    const tools = Object.values(createToolRegistry(session));

    const emit = (event: AgentEvent) => config.onEvent?.(event);
    emit({ type: 'thinking', message: `Starting audit of ${config.targetUrl}` });

    const result = await provider.runWithTools({
        model: config.model,
        system: buildSystemPrompt(config),
        prompt: buildInitialMessage(config),
        tools,
        maxSteps: config.maxSteps,
        onEvent: emit as any,
    });

    session.status = 'complete';
    const report = buildReport(session, result.text, startTime);
    emit({ type: 'complete', report });
    return report;
}

// =============================================================================
// Flat Voter Runner
// =============================================================================

async function runVoter(
    config: AgentConfig,
    provider: ReturnType<typeof createProvider>,
    lens: VoterLens,
    emit: (event: AgentEvent) => void
): Promise<AuditReport> {
    const startTime = Date.now();
    emit({ type: 'thinking', message: `Voter "${lens.name}" starting...` });

    const voterConfig: AgentConfig = { ...config, maxSteps: Math.max(10, Math.floor(config.maxSteps / 2)) };
    const session = createAuditSession(voterConfig);
    const tools = Object.values(createToolRegistry(session));

    const result = await provider.runWithTools({
        model: config.model,
        system: buildVoterSystemPrompt(voterConfig, lens),
        prompt: buildVoterInitialMessage(voterConfig, lens),
        tools,
        maxSteps: voterConfig.maxSteps,
        onEvent: emit as any,
    });

    session.status = 'complete';
    const report = buildReport(session, result.text, startTime);
    emit({ type: 'voter_complete', voterId: lens.id, findings: report.totalFindings });
    return report;
}

// =============================================================================
// Helpers
// =============================================================================

function buildReport(
    session: AuditSession,
    agentSummary: string,
    startTime: number
): AuditReport {
    const findingsByConfidence: Record<ConfidenceLevel, number> = { confirmed: 0, corroborated: 0, 'ai-only': 0, contradicted: 0 };
    const findingsBySeverity: Record<ImpactLevel, number> = { critical: 0, serious: 0, moderate: 0, minor: 0 };

    for (const finding of session.findings) {
        findingsByConfidence[finding.confidence]++;
        findingsBySeverity[finding.impact]++;
    }

    return {
        sessionId: session.id,
        url: session.config.targetUrl,
        timestamp: new Date().toISOString(),
        wcagLevel: session.config.wcagLevel,
        pagesScanned: session.scannedUrls.length,
        totalFindings: session.findings.length,
        findingsByConfidence,
        findingsBySeverity,
        findings: session.findings,
        remediationPlan: session.remediationPlan,
        agentSummary,
        scanDurationMs: Date.now() - startTime,
    };
}
