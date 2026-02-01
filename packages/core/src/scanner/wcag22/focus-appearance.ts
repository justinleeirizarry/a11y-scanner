/**
 * WCAG 2.4.13 Focus Appearance - Level AAA
 *
 * When the keyboard focus indicator is visible, an area of the focus indicator meets all the following:
 * - is at least as large as the area of a 2 CSS pixel thick perimeter of the unfocused component or sub-component, and
 * - has a contrast ratio of at least 3:1 between the same pixels in the focused and unfocused states.
 *
 * Note: This extends the existing focus management checks with WCAG 2.2 requirements.
 */

import type { FocusAppearanceViolation } from './types.js';

type IndicatorType = 'outline' | 'border' | 'box-shadow' | 'background' | 'none';

interface FocusStyles {
    outline: string;
    outlineWidth: string;
    outlineColor: string;
    outlineStyle: string;
    outlineOffset: string;
    border: string;
    borderWidth: string;
    borderColor: string;
    borderStyle: string;
    boxShadow: string;
    backgroundColor: string;
}

// Focusable element selectors
const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
].join(', ');

/**
 * Get a unique CSS selector for an element
 */
function getSelector(element: Element): string {
    if (element.id) {
        return `#${CSS.escape(element.id)}`;
    }

    const path: string[] = [];
    let current: Element | null = element;

    while (current && current !== document.body && current !== document.documentElement) {
        let selector = current.tagName.toLowerCase();

        if (current.className && typeof current.className === 'string') {
            const classes = current.className.split(/\s+/).filter(c => c.length > 0);
            if (classes.length > 0) {
                selector += '.' + classes.map(c => CSS.escape(c)).join('.');
            }
        }

        const parent = current.parentElement;
        if (parent) {
            const siblings = Array.from(parent.children).filter(
                el => el.tagName === current!.tagName
            );
            if (siblings.length > 1) {
                const index = siblings.indexOf(current) + 1;
                selector += `:nth-of-type(${index})`;
            }
        }

        path.unshift(selector);
        current = current.parentElement;
    }

    return path.join(' > ');
}

/**
 * Get truncated HTML snippet
 */
function getHtmlSnippet(element: Element, maxLength: number = 150): string {
    const html = element.outerHTML;
    if (html.length <= maxLength) {
        return html;
    }
    const openingTagEnd = html.indexOf('>') + 1;
    if (openingTagEnd < maxLength) {
        return html.slice(0, maxLength) + '...';
    }
    return html.slice(0, openingTagEnd) + '...';
}

/**
 * Parse CSS color to RGB values
 */
function parseColor(color: string): { r: number; g: number; b: number } | null {
    // Handle rgb/rgba format
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
        return {
            r: parseInt(rgbMatch[1], 10),
            g: parseInt(rgbMatch[2], 10),
            b: parseInt(rgbMatch[3], 10)
        };
    }

    // Handle hex format
    const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (hexMatch) {
        return {
            r: parseInt(hexMatch[1], 16),
            g: parseInt(hexMatch[2], 16),
            b: parseInt(hexMatch[3], 16)
        };
    }

    // Handle short hex format
    const shortHexMatch = color.match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i);
    if (shortHexMatch) {
        return {
            r: parseInt(shortHexMatch[1] + shortHexMatch[1], 16),
            g: parseInt(shortHexMatch[2] + shortHexMatch[2], 16),
            b: parseInt(shortHexMatch[3] + shortHexMatch[3], 16)
        };
    }

    return null;
}

/**
 * Calculate relative luminance of a color
 */
function getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
    const rgb1 = parseColor(color1);
    const rgb2 = parseColor(color2);

    if (!rgb1 || !rgb2) {
        return 0;
    }

    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get focus-relevant styles from computed style
 */
function getFocusStyles(element: Element): FocusStyles {
    const style = window.getComputedStyle(element);
    return {
        outline: style.outline,
        outlineWidth: style.outlineWidth,
        outlineColor: style.outlineColor,
        outlineStyle: style.outlineStyle,
        outlineOffset: style.outlineOffset,
        border: style.border,
        borderWidth: style.borderWidth,
        borderColor: style.borderColor,
        borderStyle: style.borderStyle,
        boxShadow: style.boxShadow,
        backgroundColor: style.backgroundColor
    };
}

/**
 * Parse width value to pixels
 */
function parseWidth(width: string): number {
    const match = width.match(/^([\d.]+)px$/);
    return match ? parseFloat(match[1]) : 0;
}

/**
 * Detect the type of focus indicator
 */
function detectIndicatorType(unfocusedStyles: FocusStyles, focusedStyles: FocusStyles): IndicatorType {
    // Check for outline change
    if (focusedStyles.outlineStyle !== 'none' &&
        focusedStyles.outlineStyle !== unfocusedStyles.outlineStyle) {
        return 'outline';
    }

    // Check for outline width change
    if (parseWidth(focusedStyles.outlineWidth) > parseWidth(unfocusedStyles.outlineWidth)) {
        return 'outline';
    }

    // Check for border change
    if (focusedStyles.borderStyle !== unfocusedStyles.borderStyle ||
        parseWidth(focusedStyles.borderWidth) > parseWidth(unfocusedStyles.borderWidth)) {
        return 'border';
    }

    // Check for box-shadow change
    if (focusedStyles.boxShadow !== 'none' &&
        focusedStyles.boxShadow !== unfocusedStyles.boxShadow) {
        return 'box-shadow';
    }

    // Check for background change
    if (focusedStyles.backgroundColor !== unfocusedStyles.backgroundColor) {
        return 'background';
    }

    return 'none';
}

/**
 * Get the thickness of the focus indicator
 */
function getIndicatorThickness(indicatorType: IndicatorType, styles: FocusStyles): number {
    switch (indicatorType) {
        case 'outline':
            return parseWidth(styles.outlineWidth);
        case 'border':
            return parseWidth(styles.borderWidth);
        case 'box-shadow':
            // Parse box-shadow spread
            const shadowMatch = styles.boxShadow.match(/(\d+)px\s*(\d+)px\s*(\d+)px\s*(\d+)?px?/);
            if (shadowMatch) {
                // Return blur + spread as approximate thickness
                return parseFloat(shadowMatch[3] || '0') + parseFloat(shadowMatch[4] || '0');
            }
            return 0;
        default:
            return 0;
    }
}

/**
 * Get the color of the focus indicator
 */
function getIndicatorColor(indicatorType: IndicatorType, styles: FocusStyles): string {
    switch (indicatorType) {
        case 'outline':
            return styles.outlineColor;
        case 'border':
            return styles.borderColor;
        case 'box-shadow':
            // Extract color from box-shadow
            const colorMatch = styles.boxShadow.match(/rgba?\([^)]+\)|#[a-f\d]+/i);
            return colorMatch ? colorMatch[0] : 'rgb(0, 0, 0)';
        case 'background':
            return styles.backgroundColor;
        default:
            return 'transparent';
    }
}

/**
 * Calculate focus indicator area
 * WCAG requires: at least as large as a 2px thick perimeter
 */
function calculateIndicatorArea(element: Element, thickness: number): number {
    const rect = element.getBoundingClientRect();
    // Perimeter = 2 * (width + height)
    // Area with thickness = perimeter * thickness
    const perimeter = 2 * (rect.width + rect.height);
    return perimeter * thickness;
}

/**
 * Calculate minimum required indicator area (2px perimeter)
 */
function calculateMinimumArea(element: Element): number {
    const rect = element.getBoundingClientRect();
    const perimeter = 2 * (rect.width + rect.height);
    return perimeter * 2; // 2px minimum thickness
}

/**
 * Check if element is visible
 */
function isElementVisible(element: Element): boolean {
    const style = window.getComputedStyle(element);

    if (style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.opacity === '0') {
        return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

/**
 * Check focus appearance for a single element
 */
function checkElementFocus(element: HTMLElement): FocusAppearanceViolation | null {
    // Get unfocused styles
    const unfocusedStyles = getFocusStyles(element);

    // Focus the element temporarily
    const previouslyFocused = document.activeElement;
    element.focus();

    // Get focused styles
    const focusedStyles = getFocusStyles(element);

    // Restore previous focus
    if (previouslyFocused && previouslyFocused !== element && previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
    } else {
        element.blur();
    }

    // Detect indicator type
    const indicatorType = detectIndicatorType(unfocusedStyles, focusedStyles);

    if (indicatorType === 'none') {
        return {
            id: 'focus-appearance',
            criterion: '2.4.13 Focus Appearance',
            level: 'AAA',
            element: element.tagName.toLowerCase(),
            selector: getSelector(element),
            html: getHtmlSnippet(element),
            impact: 'serious',
            description: 'Element has no visible focus indicator',
            details: {
                indicatorType: 'none',
                indicatorThickness: 0,
                indicatorArea: 0,
                meetsMinimumArea: false,
                contrastWithAdjacent: 0,
                contrastWithUnfocused: 0,
                meetsContrastRequirement: false
            }
        };
    }

    // Get indicator measurements
    const thickness = getIndicatorThickness(indicatorType, focusedStyles);
    const indicatorArea = calculateIndicatorArea(element, thickness);
    const minimumArea = calculateMinimumArea(element);
    const meetsMinimumArea = indicatorArea >= minimumArea;

    // Get indicator colors
    const focusColor = getIndicatorColor(indicatorType, focusedStyles);
    const unfocusedColor = getIndicatorColor(indicatorType, unfocusedStyles);

    // Calculate contrast with unfocused state
    let contrastWithUnfocused = 0;
    if (indicatorType === 'background') {
        contrastWithUnfocused = getContrastRatio(focusColor, unfocusedColor);
    } else {
        // For outline/border, compare with background
        contrastWithUnfocused = getContrastRatio(focusColor, focusedStyles.backgroundColor);
    }

    // Calculate contrast with adjacent colors (using background)
    const parentBg = element.parentElement ?
        window.getComputedStyle(element.parentElement).backgroundColor :
        'rgb(255, 255, 255)';
    const contrastWithAdjacent = getContrastRatio(focusColor, parentBg);

    const meetsContrastRequirement = contrastWithAdjacent >= 3;

    // Determine if there's a violation
    const hasViolation = !meetsMinimumArea || !meetsContrastRequirement || thickness < 2;

    if (hasViolation) {
        const issues: string[] = [];
        if (thickness < 2) {
            issues.push(`indicator thickness (${thickness}px) is less than 2px minimum`);
        }
        if (!meetsMinimumArea) {
            issues.push(`indicator area is below minimum requirement`);
        }
        if (!meetsContrastRequirement) {
            issues.push(`contrast ratio (${contrastWithAdjacent.toFixed(2)}:1) is below 3:1`);
        }

        return {
            id: 'focus-appearance',
            criterion: '2.4.13 Focus Appearance',
            level: 'AAA',
            element: element.tagName.toLowerCase(),
            selector: getSelector(element),
            html: getHtmlSnippet(element),
            impact: thickness < 1 ? 'critical' : !meetsContrastRequirement ? 'serious' : 'moderate',
            description: `Focus indicator issues: ${issues.join('; ')}`,
            details: {
                indicatorType,
                indicatorThickness: Math.round(thickness * 100) / 100,
                indicatorArea: Math.round(indicatorArea),
                meetsMinimumArea,
                contrastWithAdjacent: Math.round(contrastWithAdjacent * 100) / 100,
                contrastWithUnfocused: Math.round(contrastWithUnfocused * 100) / 100,
                meetsContrastRequirement
            }
        };
    }

    return null;
}

/**
 * Run focus appearance check on all focusable elements
 */
export function checkFocusAppearance(): FocusAppearanceViolation[] {
    const violations: FocusAppearanceViolation[] = [];
    const focusableElements = document.querySelectorAll(FOCUSABLE_SELECTORS);

    for (const element of focusableElements) {
        if (!isElementVisible(element)) {
            continue;
        }

        // Skip elements that explicitly suppress focus via tabindex=-1
        if (element.getAttribute('tabindex') === '-1') {
            continue;
        }

        const violation = checkElementFocus(element as HTMLElement);
        if (violation) {
            violations.push(violation);
        }
    }

    return violations;
}

/**
 * Get detailed focus indicator info for all focusable elements
 */
export function getFocusIndicatorDetails(): Array<{
    selector: string;
    indicatorType: IndicatorType;
    thickness: number;
    area: number;
    contrastRatio: number;
    meetsRequirements: boolean;
}> {
    const results: Array<{
        selector: string;
        indicatorType: IndicatorType;
        thickness: number;
        area: number;
        contrastRatio: number;
        meetsRequirements: boolean;
    }> = [];

    const focusableElements = document.querySelectorAll(FOCUSABLE_SELECTORS);

    for (const element of focusableElements) {
        if (!isElementVisible(element)) {
            continue;
        }

        const htmlElement = element as HTMLElement;
        const unfocusedStyles = getFocusStyles(element);

        htmlElement.focus();
        const focusedStyles = getFocusStyles(element);
        htmlElement.blur();

        const indicatorType = detectIndicatorType(unfocusedStyles, focusedStyles);
        const thickness = getIndicatorThickness(indicatorType, focusedStyles);
        const area = calculateIndicatorArea(element, thickness);
        const minimumArea = calculateMinimumArea(element);

        const focusColor = getIndicatorColor(indicatorType, focusedStyles);
        const parentBg = element.parentElement ?
            window.getComputedStyle(element.parentElement).backgroundColor :
            'rgb(255, 255, 255)';
        const contrastRatio = getContrastRatio(focusColor, parentBg);

        results.push({
            selector: getSelector(element),
            indicatorType,
            thickness,
            area: Math.round(area),
            contrastRatio: Math.round(contrastRatio * 100) / 100,
            meetsRequirements: thickness >= 2 && area >= minimumArea && contrastRatio >= 3
        });
    }

    return results;
}
