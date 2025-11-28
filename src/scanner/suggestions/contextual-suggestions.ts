/**
 * Contextual Suggestions - Generate fix suggestions based on actual element context
 */

import type { ContextualFix, ViolationNode, SuggestionGenerator, ParsedElement } from './types.js';
import { parseElement, inferLabel, describeWhatsMissing } from './element-analyzer.js';

// Re-export types for convenience
export type { ContextualFix, ViolationNode };

/** Input type to label mapping for form inputs */
const INPUT_TYPE_LABELS: Record<string, string> = {
    'text': 'Text input',
    'email': 'Email address',
    'password': 'Password',
    'tel': 'Phone number',
    'url': 'Website URL',
    'search': 'Search',
    'number': 'Number',
    'date': 'Date',
    'time': 'Time',
    'datetime-local': 'Date and time',
    'month': 'Month',
    'week': 'Week',
    'color': 'Color',
    'file': 'File upload',
    'checkbox': 'Checkbox',
    'radio': 'Radio button',
    'range': 'Range slider',
};

/**
 * Get a default label based on input type
 */
function getInputTypeLabel(type: string): string {
    return INPUT_TYPE_LABELS[type] || 'Input field';
}

/**
 * Insert an attribute into an HTML string after the tag name
 */
function insertAttribute(html: string, attr: string): string {
    return html.replace(/^(<\w+)(\s|>)/, `$1 ${attr}$2`);
}

/**
 * Violation-specific suggestion generators
 */
const SUGGESTION_GENERATORS: Record<string, SuggestionGenerator> = {
    'button-name': (element, node) => {
        const inferredLabel = inferLabel(element) || 'Describe action';
        const hasIcon = element.innerHTML?.includes('svg') || element.innerHTML?.includes('Icon');

        let suggestion: string;
        let fixed: string;
        let reactSuggestion: string;

        if (hasIcon) {
            suggestion = `Add aria-label="${inferredLabel}" to describe the button's action`;
            fixed = insertAttribute(node.htmlSnippet, `aria-label="${inferredLabel}"`);
            reactSuggestion = `<button aria-label="${inferredLabel}">\n  {/* icon */}\n</button>`;
        } else {
            suggestion = `Add visible text content or aria-label="${inferredLabel}"`;
            fixed = insertAttribute(node.htmlSnippet, `aria-label="${inferredLabel}"`);
            reactSuggestion = `<button aria-label="${inferredLabel}">{children}</button>`;
        }

        return {
            current: node.htmlSnippet,
            issue: describeWhatsMissing(element, 'button-name'),
            suggestion,
            fixed,
            reactSuggestion,
            inferredLabel,
        };
    },

    'link-name': (element, node) => {
        const inferredLabel = inferLabel(element) || 'Describe destination';
        const hasIcon = element.innerHTML?.includes('svg') || element.innerHTML?.includes('Icon');
        const href = element.href || '#';

        let suggestion: string;
        let fixed: string;
        let reactSuggestion: string;

        if (hasIcon) {
            suggestion = `Add aria-label="${inferredLabel}" to describe where the link goes`;
            fixed = insertAttribute(node.htmlSnippet, `aria-label="${inferredLabel}"`);
            reactSuggestion = `<a href="${href}" aria-label="${inferredLabel}">\n  {/* icon */}\n</a>`;
        } else {
            suggestion = `Add visible text content or aria-label="${inferredLabel}"`;
            fixed = insertAttribute(node.htmlSnippet, `aria-label="${inferredLabel}"`);
            reactSuggestion = `<a href="${href}" aria-label="${inferredLabel}">{children}</a>`;
        }

        return {
            current: node.htmlSnippet,
            issue: describeWhatsMissing(element, 'link-name'),
            suggestion,
            fixed,
            reactSuggestion,
            inferredLabel,
        };
    },

    'image-alt': (element, node) => {
        const inferredLabel = inferLabel(element) || 'Describe the image';
        const src = element.src || 'image.png';

        // Check if likely decorative
        const likelyDecorative = element.classes.some(c =>
            ['icon', 'decoration', 'decorative', 'bg', 'background', 'spacer'].some(hint => c.toLowerCase().includes(hint))
        );

        let suggestion: string;
        let fixed: string;
        let reactSuggestion: string;

        if (likelyDecorative) {
            suggestion = 'Add alt="" for decorative images, or descriptive alt text if meaningful';
            fixed = insertAttribute(node.htmlSnippet, 'alt=""');
            reactSuggestion = `<img src="${src}" alt="" /> {/* decorative */}`;
        } else {
            suggestion = `Add alt="${inferredLabel}" describing the image content`;
            fixed = insertAttribute(node.htmlSnippet, `alt="${inferredLabel}"`);
            reactSuggestion = `<img src="${src}" alt="${inferredLabel}" />`;
        }

        return {
            current: node.htmlSnippet,
            issue: describeWhatsMissing(element, 'image-alt'),
            suggestion,
            fixed,
            reactSuggestion,
            inferredLabel: likelyDecorative ? undefined : inferredLabel,
        };
    },

    'label': (element, node) => {
        const inputType = element.type || 'text';
        const inferredLabel = inferLabel(element) || element.placeholder || getInputTypeLabel(inputType);
        const inputId = element.id || 'input-id';

        return {
            current: node.htmlSnippet,
            issue: describeWhatsMissing(element, 'label'),
            suggestion: `Add a <label> element or aria-label="${inferredLabel}"`,
            fixed: insertAttribute(node.htmlSnippet, `aria-label="${inferredLabel}"`),
            reactSuggestion: `<label htmlFor="${inputId}">${inferredLabel}</label>\n<input id="${inputId}" type="${inputType}" />`,
            inferredLabel,
        };
    },

    'color-contrast': (element, node) => {
        // Extract contrast info from failure summary if available
        const contrastMatch = node.failureSummary?.match(/(\d+\.?\d*):1/);
        const currentRatio = contrastMatch ? contrastMatch[1] : 'insufficient';

        return {
            current: node.htmlSnippet,
            issue: `Current contrast ratio is ${currentRatio}:1 (required: 4.5:1 for normal text, 3:1 for large text)`,
            suggestion: 'Increase the contrast between text and background colors',
            reactSuggestion: '// Use darker text on light backgrounds, or lighter text on dark backgrounds\n// Tools: https://webaim.org/resources/contrastchecker/',
        };
    },

    'aria-required-attr': (element, node) => {
        // Extract which attributes are missing from check messages
        const missingAttrs: string[] = [];
        node.checks?.all?.forEach(check => {
            const attrMatch = check.message.match(/aria-(\w+)/g);
            if (attrMatch) {
                missingAttrs.push(...attrMatch);
            }
        });

        const role = element.role || 'unknown';
        const attrsList = missingAttrs.length > 0 ? missingAttrs.join(', ') : 'required ARIA attributes';

        return {
            current: node.htmlSnippet,
            issue: `Role "${role}" requires: ${attrsList}`,
            suggestion: `Add the missing ARIA attributes for role="${role}"`,
            fixed: insertAttribute(node.htmlSnippet, missingAttrs.map(a => `${a}="..."`).join(' ')),
            reactSuggestion: `<div role="${role}" ${missingAttrs.map(a => `${a}="value"`).join(' ')}>\n  {children}\n</div>`,
        };
    },

    'aria-valid-attr-value': (element, node) => {
        // Extract which attribute has invalid value
        const invalidAttr = node.checks?.all?.[0]?.id || node.checks?.any?.[0]?.id || 'aria-*';

        return {
            current: node.htmlSnippet,
            issue: `Invalid value for ${invalidAttr}`,
            suggestion: `Provide a valid value for ${invalidAttr}`,
        };
    },

    'duplicate-id': (element, node) => {
        const duplicateId = element.id || 'unknown';

        return {
            current: node.htmlSnippet,
            issue: `id="${duplicateId}" appears multiple times on this page`,
            suggestion: `Make the id unique (e.g., id="${duplicateId}-1", id="${duplicateId}-2", etc.)`,
        };
    },

    'html-has-lang': (_element: ParsedElement, node: ViolationNode) => {
        return {
            current: node.htmlSnippet,
            issue: 'Missing lang attribute on <html> element',
            suggestion: 'Add lang="en" (or appropriate language code) to the <html> tag',
            fixed: '<html lang="en">',
            reactSuggestion: '// In your index.html or _document.tsx:\n<html lang="en">',
        };
    },

    'document-title': (_element: ParsedElement, _node: ViolationNode) => {
        return {
            current: '<title></title>',
            issue: 'Page is missing a descriptive <title>',
            suggestion: 'Add a descriptive <title> that identifies the page',
            fixed: '<title>Page Title - Site Name</title>',
            reactSuggestion: '// Use React Helmet, next/head, or similar:\n<title>Page Title - Site Name</title>',
        };
    },

    'landmark-one-main': (_element: ParsedElement, node: ViolationNode) => {
        return {
            current: node.htmlSnippet || '<body>...</body>',
            issue: 'Page has no <main> landmark',
            suggestion: 'Wrap the primary page content in a <main> element',
            fixed: '<main>\n  {/* primary page content */}\n</main>',
            reactSuggestion: '<main>\n  {children}\n</main>',
        };
    },

    'region': (_element: ParsedElement, node: ViolationNode) => {
        return {
            current: node.htmlSnippet,
            issue: 'Content is not within a landmark region',
            suggestion: 'Wrap content in semantic elements: <main>, <nav>, <aside>, <header>, or <footer>',
            reactSuggestion: '<main>\n  <header>{/* page header */}</header>\n  <nav>{/* navigation */}</nav>\n  {/* main content */}\n  <aside>{/* sidebar */}</aside>\n  <footer>{/* footer */}</footer>\n</main>',
        };
    },
};

/**
 * Generate a contextual fix for a violation node
 */
export function generateContextualFix(violationId: string, node: ViolationNode): ContextualFix | null {
    const element = parseElement(node.html);
    if (!element) {
        return null;
    }

    const generator = SUGGESTION_GENERATORS[violationId];
    if (!generator) {
        // Fallback for unsupported violation types
        return {
            current: node.htmlSnippet,
            issue: node.failureSummary || 'Accessibility violation detected',
            suggestion: 'See the axe-core documentation for fix guidance',
        };
    }

    return generator(element, node);
}

/**
 * Check if we have a specialized generator for this violation type
 */
export function hasContextualSupport(violationId: string): boolean {
    return violationId in SUGGESTION_GENERATORS;
}
