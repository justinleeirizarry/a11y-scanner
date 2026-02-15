/**
 * Input validation utilities
 */

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validate URL - allow http, https, and file protocols
 */
export function validateUrl(url: string): ValidationResult {
    try {
        const parsed = new URL(url);

        // Allow http, https, and file protocols
        if (!['http:', 'https:', 'file:'].includes(parsed.protocol)) {
            return {
                valid: false,
                error: `Unsupported protocol "${parsed.protocol}". Only http://, https://, and file:// are allowed.`,
            };
        }

        return { valid: true };
    } catch {
        return { valid: false, error: 'Invalid URL format' };
    }
}

/**
 * Validate axe-core tags
 */
export function validateTags(tags: string): ValidationResult {
    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);

    // Valid axe-core tags
    const validTags = [
        'wcag2a',
        'wcag2aa',
        'wcag2aaa',
        'wcag21a',
        'wcag21aa',
        'wcag22aa',
        'best-practice',
        'section508',
        'experimental',
        'cat.aria',
        'cat.color',
        'cat.forms',
        'cat.keyboard',
        'cat.language',
        'cat.name-role-value',
        'cat.parsing',
        'cat.semantics',
        'cat.sensory-and-visual-cues',
        'cat.structure',
        'cat.tables',
        'cat.text-alternatives',
        'cat.time-and-media',
    ];

    const invalidTags = tagArray.filter(t => !validTags.includes(t));
    if (invalidTags.length > 0) {
        return {
            valid: false,
            error: `Invalid tags: ${invalidTags.join(', ')}. Valid tags include: ${validTags.slice(0, 8).join(', ')}, etc.`,
        };
    }

    return { valid: true };
}

/**
 * Validate threshold value
 */
export function validateThreshold(threshold: number): ValidationResult {
    if (threshold < 0) {
        return { valid: false, error: 'Threshold must be non-negative' };
    }

    if (!Number.isInteger(threshold)) {
        return { valid: false, error: 'Threshold must be an integer' };
    }

    if (threshold > 10000) {
        return {
            valid: false,
            error: 'Threshold seems unreasonably high (max 10000). Please check your input.',
        };
    }

    return { valid: true };
}

/**
 * Validate browser type
 */
export function validateBrowser(browser: string): ValidationResult {
    const validBrowsers = ['chromium', 'firefox', 'webkit'];

    if (!validBrowsers.includes(browser)) {
        return {
            valid: false,
            error: `Invalid browser "${browser}". Must be one of: ${validBrowsers.join(', ')}`,
        };
    }

    return { valid: true };
}
