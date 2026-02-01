import type { AttributedViolation } from '../types.js';

/**
 * Escape HTML tags in text for markdown display
 * Converts <tag> to `<tag>` so they render as code instead of being stripped
 */
function escapeHtmlTags(text: string): string {
    // Match opening tags like <ul>, <li>, <script> (with optional space/attributes before >)
    // and closing tags like </ul>, </li>
    return text
        .replace(/<([a-zA-Z][a-zA-Z0-9-]*)>/g, '`<$1>`')
        .replace(/<([a-zA-Z][a-zA-Z0-9-]*)\s/g, '`<$1>` ')
        .replace(/<\/([a-zA-Z][a-zA-Z0-9-]*)>/g, '`</$1>`');
}

/**
 * DOM element names to filter out from component paths
 */
const DOM_ELEMENTS = new Set([
    'div', 'span', 'p', 'a', 'button', 'input', 'form', 'label',
    'ul', 'ol', 'li', 'nav', 'main', 'header', 'footer', 'section', 'article', 'aside',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'table', 'thead', 'tbody', 'tr', 'td', 'th',
    'img', 'svg', 'path', 'circle', 'ellipse', 'line', 'rect', 'polygon', 'polyline', 'g',
    'video', 'audio', 'source', 'canvas',
    'code', 'pre', 'kbd', 'blockquote', 'strong', 'em', 'b', 'i',
    'select', 'option', 'textarea', 'fieldset', 'legend',
    'dl', 'dt', 'dd', 'figure', 'figcaption', 'hr', 'br',
]);

/**
 * Internal/library component names to filter out
 */
const INTERNAL_COMPONENTS = new Set([
    'Provider', 'Consumer', 'Context', 'Fragment',
    'Suspense', 'Lazy', 'Memo', 'ForwardRef',
    'ContextMenuProvider', 'PopperProvider', 'MenuProvider', 'MenuPortalProvider',
    'Presence', 'Primitive', 'Slot',
]);

/**
 * Filter component path to show only meaningful user components
 */
function filterComponentPath(pathParts: string[]): string[] {
    return pathParts
        .filter(name => {
            // Filter minified single/double letter names
            if (name.length <= 2) return false;

            // Filter DOM elements (lowercase)
            if (DOM_ELEMENTS.has(name.toLowerCase())) return false;

            // Filter internal components
            if (INTERNAL_COMPONENTS.has(name)) return false;

            // Filter names with dots (like Primitive.span)
            if (name.includes('.')) return false;

            // Filter Anonymous and __ prefixed
            if (name.includes('Anonymous') || name.startsWith('__')) return false;

            return true;
        });
}

/**
 * Format WCAG tags for display
 */
function formatWcagTags(tags: string[]): string {
    const wcagTags = tags.filter(t => t.startsWith('wcag') || t === 'best-practice');
    if (wcagTags.length === 0) return '';

    const formatted = wcagTags.map(tag => {
        if (tag === 'best-practice') return 'Best Practice';
        // Convert wcag2aa to WCAG 2.0 AA, wcag21a to WCAG 2.1 A, etc.
        const match = tag.match(/wcag(\d)(\d)?([a-z]+)/);
        if (match) {
            const major = match[1];
            const minor = match[2] || '0';
            const level = match[3].toUpperCase();
            return `WCAG ${major}.${minor} ${level}`;
        }
        return tag;
    });

    return formatted.join(', ');
}

/**
 * Format detailed violations for prompts
 */
export function formatViolations(violations: AttributedViolation[]): string {
    return violations.map((violation, idx) => {
        const firstNode = violation.nodes[0];

        let pathParts = firstNode?.userComponentPath && firstNode.userComponentPath.length > 0
            ? firstNode.userComponentPath
            : firstNode?.componentPath || [];

        pathParts = filterComponentPath(pathParts);
        const userPath = pathParts.length > 0 ? pathParts.join(' > ') : 'Unknown';

        let output = `### ${idx + 1}. ${violation.id} (${violation.impact})\n\n`;
        output += `**Description:** ${escapeHtmlTags(violation.description)}\n`;
        output += `**Help:** [${escapeHtmlTags(violation.help)}](${violation.helpUrl})\n`;

        // Add WCAG tags
        if (violation.tags && violation.tags.length > 0) {
            const wcagFormatted = formatWcagTags(violation.tags);
            if (wcagFormatted) {
                output += `**WCAG:** ${wcagFormatted}\n`;
            }
        }

        output += `\n**Component Path:** \`${userPath}\`\n`;

        if (firstNode?.cssSelector) {
            output += `**Selector:** \`${firstNode.cssSelector}\`\n`;
        }

        if (firstNode?.htmlSnippet) {
            output += `\n**HTML Element:**\n\`\`\`html\n${firstNode.htmlSnippet}\n\`\`\`\n`;
        }

        if (firstNode?.failureSummary) {
            output += `\n**Failure Summary:**\n> ${escapeHtmlTags(firstNode.failureSummary).split('\n').join('\n> ')}\n`;
        }

        // Add check details if available (more specific failure info)
        if (firstNode?.checks) {
            const checkMessages: string[] = [];
            firstNode.checks.any?.forEach(c => c.message && checkMessages.push(c.message));
            firstNode.checks.all?.forEach(c => c.message && checkMessages.push(c.message));
            firstNode.checks.none?.forEach(c => c.message && checkMessages.push(c.message));

            if (checkMessages.length > 0) {
                output += `\n**Specific Issues:**\n`;
                checkMessages.slice(0, 3).forEach(msg => {
                    output += `- ${escapeHtmlTags(msg)}\n`;
                });
            }
        }

        if (violation.fixSuggestion) {
            output += `\n**How to Fix:**\n${violation.fixSuggestion.summary}\n`;
            if (violation.fixSuggestion.userImpact) {
                output += `\n**User Impact:** ${violation.fixSuggestion.userImpact}\n`;
            }
        }

        // Show all instances if multiple
        if (violation.nodes.length > 1) {
            output += `\n**All Instances (${violation.nodes.length}):**\n`;
            violation.nodes.slice(0, 5).forEach((node, i) => {
                const nodePath = filterComponentPath(
                    node.userComponentPath?.length ? node.userComponentPath : node.componentPath || []
                );
                const component = nodePath.length > 0 ? nodePath[nodePath.length - 1] : node.component || 'Unknown';
                output += `${i + 1}. \`${component}\` - ${node.cssSelector || node.target[0]}\n`;
            });
            if (violation.nodes.length > 5) {
                output += `   ... and ${violation.nodes.length - 5} more\n`;
            }
        }

        return output;
    }).join('\n---\n\n');
}

/**
 * Get quick win violations (easy fixes)
 */
export function getQuickWins(violations: AttributedViolation[]): AttributedViolation[] {
    const quickWinIds = [
        'image-alt',
        'button-name',
        'link-name',
        'label',
        'html-has-lang',
        'document-title'
    ];

    return violations.filter(v => quickWinIds.includes(v.id));
}

/**
 * Get critical violations only
 */
export function getCriticalViolations(violations: AttributedViolation[]): AttributedViolation[] {
    return violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
}
