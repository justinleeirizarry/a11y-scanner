/**
 * Axe-core Rule to WCAG Criteria Mapping
 *
 * Maps all axe-core rule IDs to their corresponding WCAG 2.2 success criteria.
 * Based on axe-core source tags and Deque's official documentation.
 *
 * @see https://dequeuniversity.com/rules/axe/
 * @see https://github.com/dequelabs/axe-core
 */

/**
 * Mapping information for an axe rule
 */
export interface AxeWcagMapping {
    /** Primary WCAG criteria this rule tests (e.g., ["1.4.3"]) */
    criteria: string[];
    /** Optional WCAG techniques (e.g., ["G18", "G145"]) */
    techniques?: string[];
}

/**
 * Complete mapping of axe-core rules to WCAG criteria
 *
 * Rules are organized by category for maintainability.
 * Each rule maps to one or more WCAG success criteria.
 */
export const AXE_WCAG_MAP: Record<string, AxeWcagMapping> = {
    // ============================================================================
    // Color and Contrast Rules
    // ============================================================================
    'color-contrast': {
        criteria: ['1.4.3'],
        techniques: ['G18', 'G145']
    },
    'color-contrast-enhanced': {
        criteria: ['1.4.6'],
        techniques: ['G17']
    },
    'link-in-text-block': {
        criteria: ['1.4.1'],
        techniques: ['G183']
    },

    // ============================================================================
    // Forms and Labels
    // ============================================================================
    'label': {
        criteria: ['1.3.1', '3.3.2', '4.1.2'],
        techniques: ['H44', 'H65', 'H71']
    },
    'label-title-only': {
        criteria: ['3.3.2'],
        techniques: ['H65']
    },
    'label-content-name-mismatch': {
        criteria: ['2.5.3'],
        techniques: ['G208']
    },
    'select-name': {
        criteria: ['1.3.1', '3.3.2', '4.1.2'],
        techniques: ['H44', 'H65']
    },
    'input-button-name': {
        criteria: ['4.1.2'],
        techniques: ['H91']
    },
    'input-image-alt': {
        criteria: ['1.1.1', '4.1.2'],
        techniques: ['H36']
    },
    'autocomplete-valid': {
        criteria: ['1.3.5'],
        techniques: ['H98']
    },
    'form-field-multiple-labels': {
        criteria: ['1.3.1'],
        techniques: ['H44']
    },

    // ============================================================================
    // Images and Alt Text
    // ============================================================================
    'image-alt': {
        criteria: ['1.1.1'],
        techniques: ['H37', 'G94', 'G95']
    },
    'image-redundant-alt': {
        criteria: ['1.1.1'],
        techniques: ['H2']
    },
    'role-img-alt': {
        criteria: ['1.1.1'],
        techniques: ['ARIA6', 'ARIA10']
    },
    'svg-img-alt': {
        criteria: ['1.1.1'],
        techniques: ['ARIA6', 'ARIA10']
    },
    'area-alt': {
        criteria: ['1.1.1', '2.4.4'],
        techniques: ['H24']
    },
    'object-alt': {
        criteria: ['1.1.1'],
        techniques: ['H27', 'H53']
    },

    // ============================================================================
    // Links and Navigation
    // ============================================================================
    'link-name': {
        criteria: ['4.1.2', '2.4.4'],
        techniques: ['H30', 'G91', 'ARIA8']
    },
    'identical-links-same-purpose': {
        criteria: ['2.4.9'],
        techniques: ['H30', 'G91']
    },
    'skip-link': {
        criteria: ['2.4.1'],
        techniques: ['G1', 'G123']
    },

    // ============================================================================
    // Buttons and Interactive Elements
    // ============================================================================
    'button-name': {
        criteria: ['4.1.2'],
        techniques: ['H91', 'G108', 'ARIA14']
    },
    'nested-interactive': {
        criteria: ['4.1.2'],
        techniques: ['F59']
    },
    'scrollable-region-focusable': {
        criteria: ['2.1.1'],
        techniques: ['G202']
    },
    'target-size': {
        criteria: ['2.5.8'],
        techniques: ['C42']
    },

    // ============================================================================
    // Headings and Structure
    // ============================================================================
    'empty-heading': {
        criteria: ['1.3.1', '2.4.6'],
        techniques: ['H42']
    },
    'heading-order': {
        criteria: ['1.3.1'],
        techniques: ['G141']
    },
    'page-has-heading-one': {
        criteria: ['1.3.1', '2.4.6'],
        techniques: ['H42', 'G141']
    },
    'empty-table-header': {
        criteria: ['1.3.1'],
        techniques: ['H51']
    },

    // ============================================================================
    // Tables
    // ============================================================================
    'table-duplicate-name': {
        criteria: ['1.3.1'],
        techniques: ['H39', 'H73']
    },
    'table-fake-caption': {
        criteria: ['1.3.1'],
        techniques: ['H39']
    },
    'td-has-header': {
        criteria: ['1.3.1'],
        techniques: ['H51', 'H63']
    },
    'td-headers-attr': {
        criteria: ['1.3.1'],
        techniques: ['H43']
    },
    'th-has-data-cells': {
        criteria: ['1.3.1'],
        techniques: ['H51', 'H63']
    },
    'scope-attr-valid': {
        criteria: ['1.3.1'],
        techniques: ['H63']
    },

    // ============================================================================
    // Landmarks and Regions
    // ============================================================================
    'bypass': {
        criteria: ['2.4.1'],
        techniques: ['G1', 'G123', 'G124', 'H69', 'ARIA11']
    },
    'region': {
        criteria: ['1.3.1'],
        techniques: ['ARIA11', 'H69']
    },
    'landmark-banner-is-top-level': {
        criteria: ['1.3.1'],
        techniques: ['ARIA11']
    },
    'landmark-complementary-is-top-level': {
        criteria: ['1.3.1'],
        techniques: ['ARIA11']
    },
    'landmark-contentinfo-is-top-level': {
        criteria: ['1.3.1'],
        techniques: ['ARIA11']
    },
    'landmark-main-is-top-level': {
        criteria: ['1.3.1'],
        techniques: ['ARIA11']
    },
    'landmark-no-duplicate-banner': {
        criteria: ['1.3.1'],
        techniques: ['ARIA11']
    },
    'landmark-no-duplicate-contentinfo': {
        criteria: ['1.3.1'],
        techniques: ['ARIA11']
    },
    'landmark-no-duplicate-main': {
        criteria: ['1.3.1'],
        techniques: ['ARIA11']
    },
    'landmark-one-main': {
        criteria: ['1.3.1'],
        techniques: ['ARIA11']
    },
    'landmark-unique': {
        criteria: ['1.3.1'],
        techniques: ['ARIA11']
    },

    // ============================================================================
    // ARIA
    // ============================================================================
    'aria-allowed-attr': {
        criteria: ['4.1.2'],
        techniques: ['ARIA5']
    },
    'aria-allowed-role': {
        criteria: ['4.1.2'],
        techniques: ['ARIA4']
    },
    'aria-braille-equivalent': {
        criteria: ['4.1.2'],
        techniques: ['ARIA24']
    },
    'aria-command-name': {
        criteria: ['4.1.2'],
        techniques: ['ARIA14']
    },
    'aria-conditional-attr': {
        criteria: ['4.1.2'],
        techniques: ['ARIA5']
    },
    'aria-deprecated-role': {
        criteria: ['4.1.2'],
        techniques: ['ARIA4']
    },
    'aria-dialog-name': {
        criteria: ['4.1.2'],
        techniques: ['ARIA16']
    },
    'aria-hidden-body': {
        criteria: ['4.1.2'],
        techniques: ['ARIA4']
    },
    'aria-hidden-focus': {
        criteria: ['4.1.2', '1.3.1'],
        techniques: ['ARIA4']
    },
    'aria-input-field-name': {
        criteria: ['4.1.2'],
        techniques: ['ARIA16']
    },
    'aria-meter-name': {
        criteria: ['1.1.1'],
        techniques: ['ARIA16']
    },
    'aria-progressbar-name': {
        criteria: ['1.1.1'],
        techniques: ['ARIA16']
    },
    'aria-prohibited-attr': {
        criteria: ['4.1.2'],
        techniques: ['ARIA5']
    },
    'aria-required-attr': {
        criteria: ['4.1.2'],
        techniques: ['ARIA5']
    },
    'aria-required-children': {
        criteria: ['1.3.1'],
        techniques: ['ARIA5']
    },
    'aria-required-parent': {
        criteria: ['1.3.1'],
        techniques: ['ARIA5']
    },
    'aria-roledescription': {
        criteria: ['4.1.2'],
        techniques: ['ARIA5']
    },
    'aria-roles': {
        criteria: ['4.1.2'],
        techniques: ['ARIA4']
    },
    'aria-text': {
        criteria: ['4.1.2'],
        techniques: ['ARIA5']
    },
    'aria-toggle-field-name': {
        criteria: ['4.1.2'],
        techniques: ['ARIA16']
    },
    'aria-tooltip-name': {
        criteria: ['4.1.2'],
        techniques: ['ARIA16']
    },
    'aria-treeitem-name': {
        criteria: ['4.1.2'],
        techniques: ['ARIA16']
    },
    'aria-valid-attr': {
        criteria: ['4.1.2'],
        techniques: ['ARIA5']
    },
    'aria-valid-attr-value': {
        criteria: ['4.1.2'],
        techniques: ['ARIA5']
    },

    // ============================================================================
    // Document Structure
    // ============================================================================
    'document-title': {
        criteria: ['2.4.2'],
        techniques: ['H25', 'G88']
    },
    'html-has-lang': {
        criteria: ['3.1.1'],
        techniques: ['H57']
    },
    'html-lang-valid': {
        criteria: ['3.1.1'],
        techniques: ['H57']
    },
    'html-xml-lang-mismatch': {
        criteria: ['3.1.1'],
        techniques: ['H57']
    },
    'valid-lang': {
        criteria: ['3.1.2'],
        techniques: ['H58']
    },
    'meta-refresh': {
        criteria: ['2.2.1', '2.2.4', '3.2.5'],
        techniques: ['H76', 'F41']
    },
    'meta-viewport': {
        criteria: ['1.4.4'],
        techniques: ['G142']
    },

    // ============================================================================
    // Focus and Keyboard
    // ============================================================================
    'accesskeys': {
        criteria: ['4.1.2'],
        techniques: ['H91']
    },
    'focus-order-semantics': {
        criteria: ['2.4.3'],
        techniques: ['G59']
    },
    'tabindex': {
        criteria: ['2.4.3'],
        techniques: ['H4', 'G59']
    },

    // ============================================================================
    // Frames and Iframes
    // ============================================================================
    'frame-focusable-content': {
        criteria: ['2.1.1'],
        techniques: ['G202']
    },
    'frame-tested': {
        criteria: ['4.1.2'],
        techniques: ['H64']
    },
    'frame-title': {
        criteria: ['4.1.2', '2.4.1'],
        techniques: ['H64']
    },
    'frame-title-unique': {
        criteria: ['4.1.2'],
        techniques: ['H64']
    },

    // ============================================================================
    // Media
    // ============================================================================
    'audio-caption': {
        criteria: ['1.2.1'],
        techniques: ['G158']
    },
    'video-caption': {
        criteria: ['1.2.2'],
        techniques: ['G87', 'G93']
    },
    'video-description': {
        criteria: ['1.2.5'],
        techniques: ['G78', 'G173']
    },
    'blink': {
        criteria: ['2.2.2'],
        techniques: ['G4']
    },
    'marquee': {
        criteria: ['2.2.2'],
        techniques: ['G4']
    },
    'no-autoplay-audio': {
        criteria: ['1.4.2'],
        techniques: ['G60', 'G170']
    },

    // ============================================================================
    // Lists
    // ============================================================================
    'definition-list': {
        criteria: ['1.3.1'],
        techniques: ['H40']
    },
    'dlitem': {
        criteria: ['1.3.1'],
        techniques: ['H40']
    },
    'list': {
        criteria: ['1.3.1'],
        techniques: ['H48']
    },
    'listitem': {
        criteria: ['1.3.1'],
        techniques: ['H48']
    },

    // ============================================================================
    // Parsing and Markup
    // ============================================================================
    'duplicate-id': {
        criteria: ['4.1.1'],
        techniques: ['H93']
    },
    'duplicate-id-active': {
        criteria: ['4.1.1'],
        techniques: ['H93']
    },
    'duplicate-id-aria': {
        criteria: ['4.1.1'],
        techniques: ['H93']
    },

    // ============================================================================
    // CSS and Presentation
    // ============================================================================
    'css-orientation-lock': {
        criteria: ['1.3.4'],
        techniques: ['F97']
    },
    'hidden-content': {
        criteria: ['4.1.2'],
        techniques: ['C7']
    },
    'presentation-role-conflict': {
        criteria: ['1.3.1'],
        techniques: ['F92']
    },

    // ============================================================================
    // Server-Side Image Maps
    // ============================================================================
    'server-side-image-map': {
        criteria: ['2.1.1'],
        techniques: ['F54']
    },

    // ============================================================================
    // Summary and Details
    // ============================================================================
    'summary-name': {
        criteria: ['4.1.2'],
        techniques: ['H91']
    },

    // ============================================================================
    // P element
    // ============================================================================
    'p-as-heading': {
        criteria: ['1.3.1'],
        techniques: ['H42']
    },

    // ============================================================================
    // Forms - Additional
    // ============================================================================
    'avoid-inline-spacing': {
        criteria: ['1.4.12'],
        techniques: ['C36']
    },

    // ============================================================================
    // Interactive Controls
    // ============================================================================
    'meta-viewport-large': {
        criteria: ['1.4.4'],
        techniques: ['G142']
    },
    'no-autoplay-audio-refreshed': {
        criteria: ['1.4.2'],
        techniques: ['G170']
    }
};

/**
 * Get the list of all mapped axe rule IDs
 */
export function getMappedRuleIds(): string[] {
    return Object.keys(AXE_WCAG_MAP);
}

/**
 * Check if an axe rule has a WCAG mapping
 */
export function hasWcagMapping(ruleId: string): boolean {
    return ruleId in AXE_WCAG_MAP;
}

/**
 * Get the WCAG mapping for a specific axe rule
 */
export function getAxeMapping(ruleId: string): AxeWcagMapping | undefined {
    return AXE_WCAG_MAP[ruleId];
}
