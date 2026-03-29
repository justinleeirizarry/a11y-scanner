#!/usr/bin/env npx tsx
/**
 * Batch Website Scanner
 *
 * Scans a curated list of popular websites and compiles results
 * into a JSON report and markdown summary for launch content.
 *
 * Usage:
 *   npx tsx scripts/batch-scan.ts
 *   npx tsx scripts/batch-scan.ts --category tech
 *   npx tsx scripts/batch-scan.ts --limit 10
 *   npx tsx scripts/batch-scan.ts --output results/scan-report
 */
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, mkdirSync, unlinkSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(__dirname, '../packages/cli/bin/cli.js');

// ─────────────────────────────────────────────────────────────
// Sites to scan, organized by category
// ─────────────────────────────────────────────────────────────

interface SiteEntry {
    url: string;
    name: string;
    category: string;
}

const SITES: SiteEntry[] = [
    // Tech
    { url: 'https://news.ycombinator.com', name: 'Hacker News', category: 'tech' },
    { url: 'https://stackoverflow.com', name: 'Stack Overflow', category: 'tech' },
    { url: 'https://github.com', name: 'GitHub', category: 'tech' },
    { url: 'https://npmjs.com', name: 'npm', category: 'tech' },
    { url: 'https://developer.mozilla.org', name: 'MDN', category: 'tech' },
    { url: 'https://vercel.com', name: 'Vercel', category: 'tech' },
    { url: 'https://netlify.com', name: 'Netlify', category: 'tech' },
    { url: 'https://docs.python.org', name: 'Python Docs', category: 'tech' },
    { url: 'https://rust-lang.org', name: 'Rust', category: 'tech' },
    { url: 'https://go.dev', name: 'Go', category: 'tech' },

    // News
    { url: 'https://www.bbc.com', name: 'BBC', category: 'news' },
    { url: 'https://www.cnn.com', name: 'CNN', category: 'news' },
    { url: 'https://www.nytimes.com', name: 'NY Times', category: 'news' },
    { url: 'https://www.theguardian.com', name: 'The Guardian', category: 'news' },
    { url: 'https://www.reuters.com', name: 'Reuters', category: 'news' },
    { url: 'https://www.washingtonpost.com', name: 'Washington Post', category: 'news' },
    { url: 'https://arstechnica.com', name: 'Ars Technica', category: 'news' },
    { url: 'https://techcrunch.com', name: 'TechCrunch', category: 'news' },

    // Government
    { url: 'https://www.usa.gov', name: 'USA.gov', category: 'government' },
    { url: 'https://www.irs.gov', name: 'IRS', category: 'government' },
    { url: 'https://www.healthcare.gov', name: 'Healthcare.gov', category: 'government' },
    { url: 'https://www.whitehouse.gov', name: 'White House', category: 'government' },
    { url: 'https://www.nasa.gov', name: 'NASA', category: 'government' },
    { url: 'https://www.gov.uk', name: 'GOV.UK', category: 'government' },

    // E-commerce
    { url: 'https://www.amazon.com', name: 'Amazon', category: 'ecommerce' },
    { url: 'https://www.ebay.com', name: 'eBay', category: 'ecommerce' },
    { url: 'https://www.etsy.com', name: 'Etsy', category: 'ecommerce' },
    { url: 'https://www.target.com', name: 'Target', category: 'ecommerce' },
    { url: 'https://www.walmart.com', name: 'Walmart', category: 'ecommerce' },
    { url: 'https://www.bestbuy.com', name: 'Best Buy', category: 'ecommerce' },

    // Social / Community
    { url: 'https://www.reddit.com', name: 'Reddit', category: 'social' },
    { url: 'https://www.linkedin.com', name: 'LinkedIn', category: 'social' },
    { url: 'https://discord.com', name: 'Discord', category: 'social' },
    { url: 'https://www.twitch.tv', name: 'Twitch', category: 'social' },
    { url: 'https://www.wikipedia.org', name: 'Wikipedia', category: 'social' },
    { url: 'https://medium.com', name: 'Medium', category: 'social' },

    // Productivity / SaaS
    { url: 'https://www.notion.so', name: 'Notion', category: 'saas' },
    { url: 'https://www.figma.com', name: 'Figma', category: 'saas' },
    { url: 'https://linear.app', name: 'Linear', category: 'saas' },
    { url: 'https://stripe.com', name: 'Stripe', category: 'saas' },
    { url: 'https://www.shopify.com', name: 'Shopify', category: 'saas' },

    // Education
    { url: 'https://www.khanacademy.org', name: 'Khan Academy', category: 'education' },
    { url: 'https://www.coursera.org', name: 'Coursera', category: 'education' },
    { url: 'https://www.w3.org', name: 'W3C', category: 'education' },

    // Entertainment
    { url: 'https://www.spotify.com', name: 'Spotify', category: 'entertainment' },
    { url: 'https://www.netflix.com', name: 'Netflix', category: 'entertainment' },
    { url: 'https://www.youtube.com', name: 'YouTube', category: 'entertainment' },

    // Other
    { url: 'https://craigslist.org', name: 'Craigslist', category: 'other' },
    { url: 'https://www.booking.com', name: 'Booking.com', category: 'other' },
    { url: 'https://www.airbnb.com', name: 'Airbnb', category: 'other' },
];

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface ScanResult {
    site: SiteEntry;
    timestamp: string;
    success: boolean;
    error?: string;
    violations: number;
    passes: number;
    severity: { critical: number; serious: number; moderate: number; minor: number };
    topViolations: Array<{ id: string; impact: string; count: number; description: string }>;
    wcag22Violations?: number;
    keyboardBreakdown?: { tabOrder: number; focusIndicator: number; widget: number };
    supplemental?: { total: number; passed: number; failed: number };
}

// ─────────────────────────────────────────────────────────────
// Scanner
// ─────────────────────────────────────────────────────────────

function scanSite(site: SiteEntry): ScanResult {
    const timestamp = new Date().toISOString();
    console.log(`  Scanning ${site.name} (${site.url})...`);

    const tmpFile = join(tmpdir(), `aria51-batch-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);

    try {
        execSync(
            `node ${CLI} ${site.url} --headless --quiet --output ${tmpFile} 2>/dev/null`,
            { timeout: 180_000, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] }
        );

        const output = readFileSync(tmpFile, 'utf-8');
        const data = JSON.parse(output);
        const violations = data.violations || [];
        const summary = data.summary || {};

        const topViolations = violations
            .map((v: any) => ({
                id: v.id,
                impact: v.impact,
                count: v.nodes?.length || 0,
                description: v.description,
            }))
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 5);

        let keyboardBreakdown: ScanResult['keyboardBreakdown'];
        if (data.keyboardTests) {
            const kb = data.keyboardTests;
            keyboardBreakdown = {
                tabOrder: kb.tabOrder?.violations?.length || 0,
                focusIndicator: kb.focusManagement?.focusIndicatorIssues?.length || 0,
                widget: kb.shortcuts?.customWidgets?.filter((w: any) => w.keyboardSupport !== 'full').length || 0,
            };
        }

        let supplemental: ScanResult['supplemental'];
        if (data.supplementalResults?.length) {
            const passed = data.supplementalResults.filter((r: any) => r.status === 'pass').length;
            const failed = data.supplementalResults.filter((r: any) => r.status === 'fail').length;
            supplemental = { total: data.supplementalResults.length, passed, failed };
        }

        const result: ScanResult = {
            site,
            timestamp,
            success: true,
            violations: summary.totalViolations || 0,
            passes: summary.totalPasses || 0,
            severity: summary.violationsBySeverity || { critical: 0, serious: 0, moderate: 0, minor: 0 },
            topViolations,
            wcag22Violations: data.wcag22?.summary?.totalViolations,
            keyboardBreakdown,
            supplemental,
        };

        const icon = result.violations > 0 ? 'x' : 'v';
        console.log(`  ${icon} ${site.name}: ${result.violations} violations, ${result.passes} passes`);
        return result;
    } catch (err: any) {
        // The JSON file might still have been written even if exit code was non-zero
        let data: any = null;
        try {
            const fileContent = readFileSync(tmpFile, 'utf-8');
            data = JSON.parse(fileContent);
        } catch { /* no valid JSON output */ }

        if (data?.summary) {
            // Scan succeeded but CLI exited non-zero (e.g., CI mode)
            const violations = data.violations || [];
            const summary = data.summary;
            const topViolations = violations
                .map((v: any) => ({ id: v.id, impact: v.impact, count: v.nodes?.length || 0, description: v.description }))
                .sort((a: any, b: any) => b.count - a.count)
                .slice(0, 5);

            let keyboardBreakdown: ScanResult['keyboardBreakdown'];
            if (data.keyboardTests) {
                const kb = data.keyboardTests;
                keyboardBreakdown = {
                    tabOrder: kb.tabOrder?.violations?.length || 0,
                    focusIndicator: kb.focusManagement?.focusIndicatorIssues?.length || 0,
                    widget: kb.shortcuts?.customWidgets?.filter((w: any) => w.keyboardSupport !== 'full').length || 0,
                };
            }

            const result: ScanResult = {
                site, timestamp, success: true,
                violations: summary.totalViolations || 0,
                passes: summary.totalPasses || 0,
                severity: summary.violationsBySeverity || { critical: 0, serious: 0, moderate: 0, minor: 0 },
                topViolations,
                wcag22Violations: data.wcag22?.summary?.totalViolations,
                keyboardBreakdown,
            };
            console.log(`  x ${site.name}: ${result.violations} violations, ${result.passes} passes`);
            return result;
        }

        const errorMsg = err.stderr?.toString() || err.message || 'Unknown error';
        let cleanError = errorMsg;
        try {
            const parsed = JSON.parse(err.stdout?.toString() || errorMsg);
            cleanError = parsed.error || errorMsg;
        } catch { /* not JSON */ }

        console.log(`  ! ${site.name}: FAILED — ${cleanError.slice(0, 100)}`);
        return {
            site,
            timestamp,
            success: false,
            error: cleanError.slice(0, 200),
            violations: 0,
            passes: 0,
            severity: { critical: 0, serious: 0, moderate: 0, minor: 0 },
            topViolations: [],
        };
    } finally {
        try { unlinkSync(tmpFile); } catch { /* already cleaned up */ }
    }
}

// ─────────────────────────────────────────────────────────────
// Report generators
// ─────────────────────────────────────────────────────────────

function generateMarkdown(results: ScanResult[]): string {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const totalViolations = successful.reduce((sum, r) => sum + r.violations, 0);
    const totalPasses = successful.reduce((sum, r) => sum + r.passes, 0);
    const sitesWithCritical = successful.filter(r => r.severity.critical > 0);

    // Most common violations across all sites
    const violationCounts: Record<string, { count: number; sites: number; impact: string; description: string }> = {};
    for (const r of successful) {
        for (const v of r.topViolations) {
            if (!violationCounts[v.id]) {
                violationCounts[v.id] = { count: 0, sites: 0, impact: v.impact, description: v.description };
            }
            violationCounts[v.id].count += v.count;
            violationCounts[v.id].sites += 1;
        }
    }
    const topViolations = Object.entries(violationCounts)
        .sort(([, a], [, b]) => b.sites - a.sites)
        .slice(0, 10);

    const lines: string[] = [
        `# Accessibility Audit: ${successful.length} Popular Websites`,
        ``,
        `*Scanned ${new Date().toISOString().split('T')[0]} with [aria-51](https://github.com/justinirizarry/aria-51) — axe-core + WCAG 2.2 checks + keyboard/structure/screen-reader audits*`,
        ``,
        `## Summary`,
        ``,
        `| Metric | Value |`,
        `|--------|-------|`,
        `| Sites scanned | ${successful.length} |`,
        `| Sites with failures | ${failed.length} |`,
        `| Total violations | ${totalViolations.toLocaleString()} |`,
        `| Total passes | ${totalPasses.toLocaleString()} |`,
        `| Sites with critical issues | ${sitesWithCritical.length} (${Math.round(sitesWithCritical.length / successful.length * 100)}%) |`,
        ``,
        `## Most Common Violations`,
        ``,
        `| Rule | Impact | Sites Affected | Total Instances | Description |`,
        `|------|--------|---------------|-----------------|-------------|`,
    ];

    for (const [id, data] of topViolations) {
        lines.push(`| \`${id}\` | ${data.impact} | ${data.sites}/${successful.length} | ${data.count.toLocaleString()} | ${data.description} |`);
    }

    // Results by category
    const categories = [...new Set(results.map(r => r.site.category))];
    for (const category of categories) {
        const catResults = successful.filter(r => r.site.category === category);
        if (catResults.length === 0) continue;

        lines.push(``, `## ${category.charAt(0).toUpperCase() + category.slice(1)}`, ``);
        lines.push(`| Site | Violations | Passes | Critical | Serious | Top Issue |`);
        lines.push(`|------|-----------|--------|----------|---------|-----------|`);

        for (const r of catResults.sort((a, b) => b.violations - a.violations)) {
            const topIssue = r.topViolations[0]
                ? `\`${r.topViolations[0].id}\` (${r.topViolations[0].count})`
                : '—';
            lines.push(`| ${r.site.name} | ${r.violations} | ${r.passes} | ${r.severity.critical} | ${r.severity.serious} | ${topIssue} |`);
        }
    }

    // Keyboard findings
    const withKeyboard = successful.filter(r => r.keyboardBreakdown);
    if (withKeyboard.length > 0) {
        lines.push(``, `## Keyboard Navigation Issues`, ``);
        lines.push(`| Site | Tab Order | Focus Indicator | Widget | Total |`);
        lines.push(`|------|-----------|-----------------|--------|-------|`);
        for (const r of withKeyboard.sort((a, b) => {
            const totalA = (a.keyboardBreakdown!.tabOrder + a.keyboardBreakdown!.focusIndicator + a.keyboardBreakdown!.widget);
            const totalB = (b.keyboardBreakdown!.tabOrder + b.keyboardBreakdown!.focusIndicator + b.keyboardBreakdown!.widget);
            return totalB - totalA;
        }).slice(0, 20)) {
            const kb = r.keyboardBreakdown!;
            lines.push(`| ${r.site.name} | ${kb.tabOrder} | ${kb.focusIndicator} | ${kb.widget} | ${kb.tabOrder + kb.focusIndicator + kb.widget} |`);
        }
    }

    // Failed sites
    if (failed.length > 0) {
        lines.push(``, `## Sites That Failed to Scan`, ``);
        for (const r of failed) {
            lines.push(`- **${r.site.name}** (${r.site.url}): ${r.error?.slice(0, 100)}`);
        }
    }

    lines.push(``, `---`, ``, `*Generated by aria-51 batch scanner. No API keys used — all results from deterministic scans.*`);
    return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const categoryFilter = args.find(a => a.startsWith('--category='))?.split('=')[1]
    || (args.indexOf('--category') !== -1 ? args[args.indexOf('--category') + 1] : undefined);
const limitArg = args.find(a => a.startsWith('--limit='))?.split('=')[1]
    || (args.indexOf('--limit') !== -1 ? args[args.indexOf('--limit') + 1] : undefined);
const limit = limitArg ? parseInt(limitArg, 10) : undefined;
const outputBase = args.find(a => a.startsWith('--output='))?.split('=')[1]
    || (args.indexOf('--output') !== -1 ? args[args.indexOf('--output') + 1] : undefined)
    || 'results/batch-scan';

let sites = SITES;
if (categoryFilter) {
    sites = sites.filter(s => s.category === categoryFilter);
    console.log(`Filtering to category: ${categoryFilter} (${sites.length} sites)\n`);
}
if (limit) {
    sites = sites.slice(0, limit);
}

console.log(`aria-51 batch scanner`);
console.log(`Scanning ${sites.length} sites...\n`);

const results: ScanResult[] = [];
for (const site of sites) {
    results.push(scanSite(site));
}

// Write outputs
const outputDir = resolve(__dirname, '..', dirname(outputBase));
mkdirSync(outputDir, { recursive: true });

const jsonPath = resolve(__dirname, '..', outputBase + '.json');
const mdPath = resolve(__dirname, '..', outputBase + '.md');

writeFileSync(jsonPath, JSON.stringify(results, null, 2));
writeFileSync(mdPath, generateMarkdown(results));

const successful = results.filter(r => r.success);
const totalViolations = successful.reduce((sum, r) => sum + r.violations, 0);

console.log(`\n${'─'.repeat(60)}`);
console.log(`Done. ${successful.length}/${results.length} sites scanned successfully.`);
console.log(`Total: ${totalViolations.toLocaleString()} violations across ${successful.length} sites.`);
console.log(`\nJSON: ${jsonPath}`);
console.log(`Markdown: ${mdPath}`);
