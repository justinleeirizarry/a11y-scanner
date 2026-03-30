/**
 * Audit Pipeline Types
 *
 * Types for the full audit pipeline: page discovery, verified findings,
 * confidence scoring, and remediation planning.
 */
import type { ScanResults, BrowserType } from '../index.js';

export type ImpactLevel = 'critical' | 'serious' | 'moderate' | 'minor';
export type ConfidenceLevel = 'confirmed' | 'corroborated' | 'ai-only' | 'contradicted';

export interface AgentWcagCriterionInfo {
    id: string;
    title: string;
    level: 'A' | 'AA' | 'AAA';
    principle: 'Perceivable' | 'Operable' | 'Understandable' | 'Robust';
    w3cUrl: string;
    testability?: 'manual' | 'automated' | 'semi-automated' | 'multi-page';
    successCriterionText?: string;
}

// ── Page Discovery ───────────────────────────────────────────

export interface SitemapEntry {
    url: string;
    lastmod?: string;
    priority?: number;
    changefreq?: string;
}

export interface DiscoveredPage {
    url: string;
    sitemapPriority?: number;
    lastmod?: string;
}

// ── Verified Findings ────────────────────────────────────────

export interface VerifiedFinding {
    id: string;
    url: string;
    criterion: AgentWcagCriterionInfo;
    description: string;
    impact: ImpactLevel;
    selector?: string;
    element?: string;
    confidence: ConfidenceLevel;
    sources: FindingSource[];
    evidence: string;
}

export interface FindingSource {
    type: 'axe-core' | 'wcag22-check' | 'stagehand' | 'agent-observation';
    ruleId?: string;
    detail: string;
}

// ── Remediation ──────────────────────────────────────────────

export interface RemediationPlan {
    summary: string;
    totalIssues: number;
    estimatedEffort: 'low' | 'medium' | 'high';
    phases: RemediationPhase[];
}

export interface RemediationPhase {
    priority: number;
    title: string;
    description: string;
    items: RemediationItem[];
}

export interface RemediationItem {
    finding: VerifiedFinding;
    fix: string;
    affectedPages: string[];
    estimatedEffort: 'low' | 'medium' | 'high';
    wcagCriteria: AgentWcagCriterionInfo[];
}

// ── Internal Session (used by remediation planner) ───────────

export interface AuditSessionConfig {
    wcagLevel: 'A' | 'AA' | 'AAA';
}

export interface AuditSessionMinimal {
    findings: VerifiedFinding[];
    config: AuditSessionConfig;
}
