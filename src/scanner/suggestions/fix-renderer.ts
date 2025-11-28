/**
 * Fix Renderer - Generate before/after views and formatted output for contextual fixes
 */

import type { ContextualFix, ViolationNode, RenderedFix } from './types.js';
import { generateContextualFix } from './contextual-suggestions.js';

// Re-export types for convenience
export type { RenderedFix };

/**
 * Render a contextual fix into displayable format
 */
export function renderFix(
    violationId: string,
    node: ViolationNode,
    options: { includeReact?: boolean; maxLineWidth?: number } = {}
): RenderedFix | null {
    const fix = generateContextualFix(violationId, node);
    if (!fix) {
        return null;
    }

    const { includeReact = true, maxLineWidth = 80 } = options;

    // Build component context
    const componentName = getComponentName(node);
    const componentPath = node.componentPath?.join(' > ');

    // Build plain text before/after
    const beforeAfterText = buildBeforeAfterText(fix, componentName, maxLineWidth);

    return {
        beforeAfterText,
        before: fix.current,
        after: fix.fixed || fix.suggestion,
        issue: fix.issue,
        suggestion: fix.suggestion,
        reactVersion: includeReact ? fix.reactSuggestion : undefined,
        componentName,
        componentPath,
    };
}

/**
 * Build a plain-text before/after view
 */
function buildBeforeAfterText(fix: ContextualFix, componentName?: string, maxWidth = 80): string {
    const lines: string[] = [];

    if (componentName) {
        lines.push(`Component: ${componentName}`);
        lines.push('');
    }

    lines.push('Current:');
    lines.push(indent(truncateLines(fix.current, maxWidth), 2));
    lines.push('');
    lines.push(`Missing: ${fix.issue}`);
    lines.push('');

    if (fix.fixed) {
        lines.push('Suggested fix:');
        lines.push(indent(truncateLines(fix.fixed, maxWidth), 2));
    } else {
        lines.push('Fix:');
        lines.push(indent(fix.suggestion, 2));
    }

    if (fix.reactSuggestion) {
        lines.push('');
        lines.push('React/JSX:');
        lines.push(indent(truncateLines(fix.reactSuggestion, maxWidth), 2));
    }

    return lines.join('\n');
}

/**
 * Render multiple nodes for a violation into a summary
 */
export function renderViolationSummary(
    violationId: string,
    nodes: ViolationNode[],
    options: { maxNodes?: number } = {}
): string {
    const { maxNodes = 3 } = options;
    const lines: string[] = [];

    const nodesToRender = nodes.slice(0, maxNodes);

    nodesToRender.forEach((node, index) => {
        const fix = generateContextualFix(violationId, node);
        if (!fix) return;

        const componentName = getComponentName(node);

        if (index > 0) {
            lines.push('');
            lines.push('─'.repeat(40));
            lines.push('');
        }

        lines.push(`Instance ${index + 1}${componentName ? ` in <${componentName}>` : ''}:`);
        lines.push('');
        lines.push('  Current:');
        lines.push(indent(truncateLines(fix.current, 70), 4));
        lines.push('');
        lines.push(`  Issue: ${fix.issue}`);
        lines.push('');
        lines.push(`  Fix: ${fix.suggestion}`);
    });

    if (nodes.length > maxNodes) {
        lines.push('');
        lines.push(`... and ${nodes.length - maxNodes} more instance(s)`);
    }

    return lines.join('\n');
}

/**
 * Generate an AI-ready prompt for fixing a violation
 */
export function generateAIPrompt(
    violationId: string,
    violationHelp: string,
    node: ViolationNode,
    options: { includeWcagRef?: boolean } = {}
): string {
    const fix = generateContextualFix(violationId, node);
    if (!fix) {
        return '';
    }

    const componentName = getComponentName(node);
    const componentPath = node.componentPath?.join(' > ') || 'Unknown';

    const lines: string[] = [];

    lines.push(`## Fix: ${violationId}${componentName ? ` in <${componentName}>` : ''}`);
    lines.push('');

    if (node.componentPath && node.componentPath.length > 0) {
        lines.push(`**Component Path:** ${componentPath}`);
        lines.push('');
    }

    lines.push('### Current Code');
    lines.push('```html');
    lines.push(fix.current);
    lines.push('```');
    lines.push('');

    lines.push('### Issue');
    lines.push(fix.issue);
    lines.push('');

    lines.push('### Required Fix');
    lines.push(fix.suggestion);
    lines.push('');

    if (fix.fixed) {
        lines.push('### Suggested Implementation');
        lines.push('```html');
        lines.push(fix.fixed);
        lines.push('```');
        lines.push('');
    }

    if (fix.reactSuggestion) {
        lines.push('### React/JSX Version');
        lines.push('```jsx');
        lines.push(fix.reactSuggestion);
        lines.push('```');
        lines.push('');
    }

    if (options.includeWcagRef) {
        lines.push('### WCAG Reference');
        lines.push(violationHelp);
        lines.push('');
    }

    return lines.join('\n');
}

// Helper functions

/**
 * Extract component name from node data
 */
function getComponentName(node: ViolationNode): string | undefined {
    if (node.component && node.component.length > 2) {
        return node.component;
    }

    // Try to extract from componentPath
    if (node.componentPath && node.componentPath.length > 0) {
        const filtered = node.componentPath.filter(name =>
            name.length > 2 &&
            !name.includes('Anonymous') &&
            !name.startsWith('__')
        );
        return filtered[filtered.length - 1];
    }

    return undefined;
}

/**
 * Indent each line of text by a number of spaces
 */
function indent(text: string, spaces: number): string {
    const prefix = ' '.repeat(spaces);
    return text.split('\n').map(line => prefix + line).join('\n');
}

/**
 * Truncate lines that exceed maxWidth
 */
function truncateLines(text: string, maxWidth: number): string {
    return text.split('\n').map(line => {
        if (line.length > maxWidth) {
            return line.substring(0, maxWidth - 3) + '...';
        }
        return line;
    }).join('\n');
}
