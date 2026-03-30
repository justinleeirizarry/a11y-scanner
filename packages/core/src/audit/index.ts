// Types
export type {
    ImpactLevel,
    ConfidenceLevel,
    AgentWcagCriterionInfo,
    SitemapEntry,
    DiscoveredPage,
    VerifiedFinding,
    FindingSource,
    RemediationPlan,
    RemediationPhase,
    RemediationItem,
    AuditSessionMinimal,
} from './types.js';

// Planning
export { parseSitemap } from './planning/sitemap-parser.js';
export { discoverLinks, type LinkDiscoveryOptions } from './planning/link-discoverer.js';
export { deduplicatePages } from './planning/page-prioritizer.js';

// Verification
export { scoreFinding, sortByScore, filterHighConfidence } from './verification/confidence-scorer.js';

// Remediation
export { generateRemediationPlan } from './remediation/prioritizer.js';

// Pipeline
export { runFullAudit, type FullAuditOptions, type FullAuditResult } from './pipeline/full-audit.js';
