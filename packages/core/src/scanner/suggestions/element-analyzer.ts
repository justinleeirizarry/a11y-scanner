/**
 * Element Analyzer - Parses HTML elements to extract context for fix suggestions
 */

import type { ParsedElement, ElementCategory } from './types.js';

// Re-export types for convenience
export type { ParsedElement, ElementCategory };

/**
 * Parse an HTML string into a structured element representation
 */
export function parseElement(html: string): ParsedElement | null {
    if (!html || typeof html !== 'string') {
        return null;
    }

    // Extract the tag name
    const tagMatch = html.match(/^<(\w+)/);
    if (!tagMatch) {
        return null;
    }
    const tag = tagMatch[1].toLowerCase();

    // Extract all attributes
    const attributes: Record<string, string> = {};
    const attrRegex = /(\w[\w-]*)=["']([^"']*)["']/g;
    let match;
    while ((match = attrRegex.exec(html)) !== null) {
        attributes[match[1].toLowerCase()] = match[2];
    }

    // Also match attributes without quotes (e.g., disabled, checked)
    const boolAttrRegex = /\s(\w[\w-]*)(?=\s|>|\/)/g;
    while ((match = boolAttrRegex.exec(html)) !== null) {
        const attr = match[1].toLowerCase();
        if (!attributes[attr] && !['class', 'id', 'style'].includes(attr)) {
            attributes[attr] = 'true';
        }
    }

    // Extract classes
    const classes = attributes['class']?.split(/\s+/).filter(Boolean) || [];

    // Extract text content (simplified - just get text between tags)
    const textMatch = html.match(/>([^<]*)</);
    const textContent = textMatch?.[1]?.trim() || undefined;

    // Extract innerHTML (everything between opening and closing tags)
    const innerMatch = html.match(/>(.+)</s);
    const innerHTML = innerMatch?.[1]?.trim() || undefined;

    return {
        tag,
        attributes,
        classes,
        id: attributes['id'],
        textContent,
        innerHTML,
        ariaLabel: attributes['aria-label'],
        ariaLabelledby: attributes['aria-labelledby'],
        ariaDescribedby: attributes['aria-describedby'],
        role: attributes['role'],
        tabindex: attributes['tabindex'],
        type: attributes['type'],
        name: attributes['name'],
        placeholder: attributes['placeholder'],
        href: attributes['href'],
        src: attributes['src'],
        alt: attributes['alt'],
        title: attributes['title'],
    };
}

/** Label hints for inferring accessible names from class names, IDs, etc. */
const LABEL_HINTS = [
    'close', 'menu', 'search', 'submit', 'cancel', 'delete', 'edit', 'save',
    'add', 'remove', 'next', 'prev', 'previous', 'back', 'forward', 'home',
    'settings', 'profile', 'user', 'login', 'logout', 'signup', 'register',
    'help', 'info', 'warning', 'error', 'success', 'download', 'upload',
    'share', 'copy', 'paste', 'print', 'refresh', 'reload', 'expand', 'collapse',
    'open', 'toggle', 'play', 'pause', 'stop', 'mute', 'unmute', 'volume',
    'fullscreen', 'exit', 'minimize', 'maximize', 'like', 'favorite', 'bookmark',
    'cart', 'checkout', 'buy', 'shop', 'filter', 'sort', 'view', 'grid', 'list',
];

/**
 * Infer a meaningful label from element context (class names, nearby text, etc.)
 */
export function inferLabel(element: ParsedElement): string | null {
    // Try to infer from class names
    for (const className of element.classes) {
        const lowerClass = className.toLowerCase();
        for (const hint of LABEL_HINTS) {
            if (lowerClass.includes(hint)) {
                // Capitalize first letter
                return hint.charAt(0).toUpperCase() + hint.slice(1);
            }
        }
    }

    // Try to infer from ID
    if (element.id) {
        const lowerId = element.id.toLowerCase();
        for (const hint of LABEL_HINTS) {
            if (lowerId.includes(hint)) {
                return hint.charAt(0).toUpperCase() + hint.slice(1);
            }
        }
    }

    // Try to infer from name attribute
    if (element.name) {
        const lowerName = element.name.toLowerCase();
        for (const hint of LABEL_HINTS) {
            if (lowerName.includes(hint)) {
                return hint.charAt(0).toUpperCase() + hint.slice(1);
            }
        }
        // Use the name itself if it looks reasonable
        if (element.name.length > 2 && element.name.length < 30) {
            return element.name.replace(/[-_]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
        }
    }

    // Try to extract from href for links
    if (element.href) {
        const path = element.href.split('/').pop()?.split('?')[0]?.split('#')[0];
        if (path && path.length > 2) {
            return path.replace(/[-_]/g, ' ').replace(/\.\w+$/, '');
        }
    }

    // Try to extract from src for images
    if (element.src) {
        const filename = element.src.split('/').pop()?.split('?')[0];
        if (filename) {
            return filename.replace(/[-_]/g, ' ').replace(/\.\w+$/, '');
        }
    }

    return null;
}

/**
 * Get a human-readable description of what's missing from the element
 */
export function describeWhatsMissing(element: ParsedElement, violationId: string): string {
    switch (violationId) {
        case 'button-name':
            if (!element.textContent && !element.ariaLabel && !element.ariaLabelledby && !element.title) {
                return 'accessible name (aria-label, aria-labelledby, title, or text content)';
            }
            return 'accessible name';

        case 'link-name':
            if (!element.textContent && !element.ariaLabel && !element.ariaLabelledby) {
                return 'accessible name (aria-label, aria-labelledby, or text content)';
            }
            return 'accessible name';

        case 'image-alt':
            if (!element.alt) {
                return 'alt attribute (use descriptive text for meaningful images, or alt="" for decorative)';
            }
            return 'valid alt attribute value';

        case 'label':
            return 'associated label (<label>, aria-label, or aria-labelledby)';

        case 'color-contrast':
            return 'sufficient color contrast ratio (4.5:1 for normal text, 3:1 for large text)';

        case 'aria-required-attr':
            return 'required ARIA attribute(s) for this role';

        case 'aria-valid-attr-value':
            return 'valid value for ARIA attribute';

        case 'duplicate-id':
            return `unique id (current id="${element.id}" is duplicated elsewhere)`;

        default:
            return 'required accessibility attribute(s)';
    }
}

/**
 * Get the element type category for better contextual suggestions
 */
export function getElementCategory(element: ParsedElement): ElementCategory {
    const tag = element.tag;
    const role = element.role;

    if (tag === 'button' || role === 'button') return 'button';
    if (tag === 'a' || role === 'link') return 'link';
    if (tag === 'img' || role === 'img') return 'image';
    if (['input', 'select', 'textarea'].includes(tag)) return 'form-input';
    if (/^h[1-6]$/.test(tag) || role === 'heading') return 'heading';
    if (['main', 'nav', 'aside', 'header', 'footer', 'section', 'article'].includes(tag) ||
        ['main', 'navigation', 'complementary', 'banner', 'contentinfo', 'region'].includes(role || '')) {
        return 'landmark';
    }
    if (element.tabindex || (['div', 'span'].includes(tag) && element.role)) return 'interactive';

    return 'other';
}
