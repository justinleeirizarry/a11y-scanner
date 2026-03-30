/**
 * Non-text Contrast Check
 *
 * WCAG 1.4.11 Non-text Contrast (AA)
 *
 * Checks that UI components and graphical objects have at least 3:1 contrast
 * ratio against adjacent colors. Covers:
 * - Form input borders
 * - Custom controls (checkboxes, toggles, sliders)
 * - Focus indicators
 * - Graphical objects required to understand content (icons)
 */

import type { WCAG22Violation } from './types.js';

function getSelector(element: Element): string {
    if (element.id) return `#${CSS.escape(element.id)}`;
    const path: string[] = [];
    let current: Element | null = element;
    while (current && current !== document.body && current !== document.documentElement) {
        let selector = current.tagName.toLowerCase();
        if (current.className && typeof current.className === 'string') {
            const classes = current.className.split(/\s+/).filter(c => c.length > 0);
            if (classes.length > 0) selector += '.' + classes.map(c => CSS.escape(c)).join('.');
        }
        const parent = current.parentElement;
        if (parent) {
            const siblings = Array.from(parent.children).filter(el => el.tagName === current!.tagName);
            if (siblings.length > 1) selector += `:nth-of-type(${siblings.indexOf(current) + 1})`;
        }
        path.unshift(selector);
        current = current.parentElement;
    }
    return path.join(' > ');
}

function getHtmlSnippet(element: Element, maxLength = 150): string {
    const html = element.outerHTML;
    if (html.length <= maxLength) return html;
    const end = html.indexOf('>') + 1;
    return end < maxLength ? html.slice(0, maxLength) + '...' : html.slice(0, end) + '...';
}

function isElementVisible(element: Element): boolean {
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

/**
 * Parse a CSS color string to RGB values.
 * Handles rgb(), rgba(), hex, and named colors via a canvas fallback.
 */
function parseColor(color: string): { r: number; g: number; b: number; a: number } | null {
    if (!color || color === 'transparent') return null;

    // Match rgb/rgba
    const rgbMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
    if (rgbMatch) {
        return {
            r: parseInt(rgbMatch[1], 10),
            g: parseInt(rgbMatch[2], 10),
            b: parseInt(rgbMatch[3], 10),
            a: rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1,
        };
    }

    // Match hex
    const hexMatch = color.match(/^#([0-9a-f]{3,8})$/i);
    if (hexMatch) {
        let hex = hexMatch[1];
        if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        if (hex.length === 4) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        return {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16),
            a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
        };
    }

    // Fallback: use a canvas to resolve named/other colors
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        return { r, g, b, a: a / 255 };
    } catch {
        return null;
    }
}

/**
 * Calculate relative luminance per WCAG 2.2 definition.
 */
function relativeLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
        const s = c / 255;
        return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors.
 */
function contrastRatio(
    c1: { r: number; g: number; b: number },
    c2: { r: number; g: number; b: number },
): number {
    const l1 = relativeLuminance(c1.r, c1.g, c1.b);
    const l2 = relativeLuminance(c2.r, c2.g, c2.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get the effective background color behind an element by walking up the tree.
 */
function getEffectiveBackground(element: Element): { r: number; g: number; b: number } | null {
    let current: Element | null = element;
    while (current) {
        const bg = window.getComputedStyle(current).backgroundColor;
        const parsed = parseColor(bg);
        if (parsed && parsed.a > 0.1) {
            // Blend with white if semi-transparent
            if (parsed.a < 1) {
                return {
                    r: Math.round(parsed.r * parsed.a + 255 * (1 - parsed.a)),
                    g: Math.round(parsed.g * parsed.a + 255 * (1 - parsed.a)),
                    b: Math.round(parsed.b * parsed.a + 255 * (1 - parsed.a)),
                };
            }
            return { r: parsed.r, g: parsed.g, b: parsed.b };
        }
        current = current.parentElement;
    }
    // Default to white
    return { r: 255, g: 255, b: 255 };
}

const MIN_CONTRAST = 3.0; // WCAG 1.4.11 requires 3:1

/**
 * Check form inputs for border contrast.
 */
function checkFormInputContrast(violations: WCAG22Violation[]): void {
    const inputs = document.querySelectorAll(
        'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]), ' +
        'textarea, select',
    );

    for (const input of inputs) {
        if (!isElementVisible(input)) continue;

        const style = window.getComputedStyle(input);
        const borderColor = parseColor(style.borderColor);
        const bg = getEffectiveBackground(input);

        if (!borderColor || !bg) continue;
        // Skip inputs with no visible border
        const borderWidth = parseFloat(style.borderWidth);
        if (borderWidth < 1 || style.borderStyle === 'none') continue;
        // Skip if border is fully transparent
        if (borderColor.a < 0.1) continue;

        const ratio = contrastRatio(borderColor, bg);
        if (ratio < MIN_CONTRAST) {
            violations.push({
                id: 'non-text-contrast',
                criterion: '1.4.11 Non-text Contrast',
                level: 'AA',
                element: input.tagName.toLowerCase(),
                selector: getSelector(input),
                html: getHtmlSnippet(input),
                impact: 'serious',
                description: `Form input border contrast is ${ratio.toFixed(2)}:1 (requires ${MIN_CONTRAST}:1)`,
                details: {
                    type: 'input-border-contrast',
                    contrastRatio: Math.round(ratio * 100) / 100,
                    required: MIN_CONTRAST,
                    borderColor: style.borderColor,
                    backgroundColor: bg,
                },
            });
        }
    }
}

/**
 * Check custom controls (checkboxes, toggles, sliders) for contrast.
 */
function checkCustomControlContrast(violations: WCAG22Violation[]): void {
    // Check role-based custom controls
    const customControls = document.querySelectorAll(
        '[role="checkbox"], [role="radio"], [role="switch"], [role="slider"], ' +
        '[role="progressbar"], [role="scrollbar"], [role="spinbutton"]',
    );

    for (const control of customControls) {
        if (!isElementVisible(control)) continue;

        const style = window.getComputedStyle(control);
        const bg = getEffectiveBackground(control);
        if (!bg) continue;

        // Check the control's own background/border against its parent background
        const controlBg = parseColor(style.backgroundColor);
        const borderColor = parseColor(style.borderColor);
        const parentBg = control.parentElement ? getEffectiveBackground(control.parentElement) : bg;

        // Check border contrast
        if (borderColor && borderColor.a > 0.1 && parseFloat(style.borderWidth) >= 1 && style.borderStyle !== 'none') {
            const ratio = contrastRatio(borderColor, parentBg || bg);
            if (ratio < MIN_CONTRAST) {
                violations.push({
                    id: 'non-text-contrast',
                    criterion: '1.4.11 Non-text Contrast',
                    level: 'AA',
                    element: control.tagName.toLowerCase(),
                    selector: getSelector(control),
                    html: getHtmlSnippet(control),
                    impact: 'serious',
                    description: `Custom control border contrast is ${ratio.toFixed(2)}:1 (requires ${MIN_CONTRAST}:1)`,
                    details: {
                        type: 'custom-control-contrast',
                        role: control.getAttribute('role'),
                        contrastRatio: Math.round(ratio * 100) / 100,
                        required: MIN_CONTRAST,
                    },
                });
            }
        }

        // Check background contrast against parent
        if (controlBg && controlBg.a > 0.1 && parentBg) {
            const ratio = contrastRatio(controlBg, parentBg);
            if (ratio < MIN_CONTRAST) {
                violations.push({
                    id: 'non-text-contrast',
                    criterion: '1.4.11 Non-text Contrast',
                    level: 'AA',
                    element: control.tagName.toLowerCase(),
                    selector: getSelector(control),
                    html: getHtmlSnippet(control),
                    impact: 'serious',
                    description: `Custom control background contrast is ${ratio.toFixed(2)}:1 (requires ${MIN_CONTRAST}:1)`,
                    details: {
                        type: 'custom-control-bg-contrast',
                        role: control.getAttribute('role'),
                        contrastRatio: Math.round(ratio * 100) / 100,
                        required: MIN_CONTRAST,
                    },
                });
            }
        }
    }
}

/**
 * Check SVG icons that are meaningful (not decorative) for contrast.
 */
function checkGraphicalObjectContrast(violations: WCAG22Violation[]): void {
    // SVGs that are informational (have role="img" or aria-label)
    const meaningfulSvgs = document.querySelectorAll(
        'svg[role="img"], svg[aria-label], svg[aria-labelledby]',
    );

    for (const svg of meaningfulSvgs) {
        if (!isElementVisible(svg)) continue;

        const bg = getEffectiveBackground(svg);
        if (!bg) continue;

        // Check fill/stroke of direct children (paths, circles, rects)
        const shapes = svg.querySelectorAll('path, circle, rect, line, polygon, polyline, ellipse');
        for (const shape of shapes) {
            const style = window.getComputedStyle(shape);

            // Check fill contrast
            const fill = parseColor(style.fill);
            if (fill && fill.a > 0.1 && style.fill !== 'none') {
                const ratio = contrastRatio(fill, bg);
                if (ratio < MIN_CONTRAST) {
                    violations.push({
                        id: 'non-text-contrast',
                        criterion: '1.4.11 Non-text Contrast',
                        level: 'AA',
                        element: 'svg',
                        selector: getSelector(svg),
                        html: getHtmlSnippet(svg),
                        impact: 'serious',
                        description: `Meaningful SVG icon fill contrast is ${ratio.toFixed(2)}:1 (requires ${MIN_CONTRAST}:1)`,
                        details: {
                            type: 'svg-icon-contrast',
                            contrastRatio: Math.round(ratio * 100) / 100,
                            required: MIN_CONTRAST,
                            fill: style.fill,
                        },
                    });
                    break; // One violation per SVG is enough
                }
            }

            // Check stroke contrast
            const stroke = parseColor(style.stroke);
            if (stroke && stroke.a > 0.1 && style.stroke !== 'none' && parseFloat(style.strokeWidth) > 0) {
                const ratio = contrastRatio(stroke, bg);
                if (ratio < MIN_CONTRAST) {
                    violations.push({
                        id: 'non-text-contrast',
                        criterion: '1.4.11 Non-text Contrast',
                        level: 'AA',
                        element: 'svg',
                        selector: getSelector(svg),
                        html: getHtmlSnippet(svg),
                        impact: 'serious',
                        description: `Meaningful SVG icon stroke contrast is ${ratio.toFixed(2)}:1 (requires ${MIN_CONTRAST}:1)`,
                        details: {
                            type: 'svg-icon-stroke-contrast',
                            contrastRatio: Math.round(ratio * 100) / 100,
                            required: MIN_CONTRAST,
                            stroke: style.stroke,
                        },
                    });
                    break;
                }
            }
        }
    }
}

/**
 * Run all non-text contrast checks for WCAG 1.4.11 (AA).
 */
export function checkNonTextContrast(): WCAG22Violation[] {
    const violations: WCAG22Violation[] = [];

    checkFormInputContrast(violations);
    checkCustomControlContrast(violations);
    checkGraphicalObjectContrast(violations);

    return violations;
}

export function getNonTextContrastInfo(): Array<{
    selector: string;
    criterion: string;
    type: string;
    contrastRatio?: number;
}> {
    return checkNonTextContrast().map(v => ({
        selector: v.selector,
        criterion: v.criterion,
        type: v.details.type as string,
        contrastRatio: v.details.contrastRatio as number | undefined,
    }));
}
