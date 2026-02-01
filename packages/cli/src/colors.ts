/**
 * Material Design accessible color palette for CLI output
 * All colors meet WCAG AA contrast ratio (4.5:1+) on dark backgrounds
 *
 * Based on Material Design color system
 * https://material.io/design/color
 *
 * #EF5350 (red 400) - ~5.6:1 contrast - critical/errors
 * #FFA726 (orange 400) - ~8.5:1 contrast - serious/warnings
 * #FFCA28 (amber 400) - ~11:1 contrast - moderate
 * #66BB6A (green 400) - ~6.5:1 contrast - success
 * #42A5F5 (blue 400) - ~5.5:1 contrast - info/accent
 * #BDBDBD (gray 400) - ~8:1 contrast - minor/muted
 */

export const colors = {
    // Material Design palette
    red: '#EF5350',         // Red 400
    orange: '#FFA726',      // Orange 400
    yellow: '#FFCA28',      // Amber 400
    green: '#66BB6A',       // Green 400
    blue: '#42A5F5',        // Blue 400
    gray: '#BDBDBD',        // Gray 400

    // Severity mapping
    critical: '#EF5350',    // Red - critical issues
    serious: '#FFA726',     // Orange - serious/warnings
    moderate: '#42A5F5',    // Blue - moderate issues
    minor: '#BDBDBD',       // Gray - minor issues

    // UI colors
    accent: '#42A5F5',      // Blue - links, accents
    emphasis: '#FFFFFF',    // White - headers, emphasis
    info: '#42A5F5',        // Blue - informational
    success: '#66BB6A',     // Green - success states

    // Text colors
    muted: 'gray',          // Gray - secondary text
    highlight: '#FFCA28',   // Amber - highlighted text
};

// Impact level to color mapping
export const impactColors: Record<string, string> = {
    critical: colors.critical,
    serious: colors.serious,
    moderate: colors.moderate,
    minor: colors.minor,
};
