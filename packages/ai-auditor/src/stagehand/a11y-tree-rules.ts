/**
 * Accessibility Tree Validation Rules
 *
 * Constants and helper functions for validating accessibility tree structures.
 */

/**
 * Valid ARIA landmark roles
 */
export const VALID_LANDMARK_ROLES = [
    'banner',
    'main',
    'navigation',
    'complementary',
    'contentinfo',
    'region',
    'search',
    'form',
] as const;

/**
 * Interactive roles that typically require keyboard access
 */
export const INTERACTIVE_ROLES = [
    'button',
    'link',
    'textbox',
    'checkbox',
    'radio',
    'combobox',
    'listbox',
    'menuitem',
    'menuitemcheckbox',
    'menuitemradio',
    'tab',
    'slider',
    'spinbutton',
    'switch',
    'searchbox',
    'option',
    'treeitem',
    'gridcell',
] as const;

/**
 * Roles that require an accessible name
 */
export const ROLES_REQUIRING_NAME = [
    ...INTERACTIVE_ROLES,
    'img',
    'figure',
    'table',
    'dialog',
    'alertdialog',
    'alert',
    'status',
    'region',
    'form',
    'article',
    'math',
] as const;

/**
 * Heading roles (h1-h6 map to heading role)
 */
export const HEADING_ROLES = ['heading'] as const;

/**
 * Form control roles
 */
export const FORM_CONTROL_ROLES = [
    'textbox',
    'checkbox',
    'radio',
    'combobox',
    'listbox',
    'slider',
    'spinbutton',
    'switch',
    'searchbox',
    'option',
] as const;

/**
 * Valid ARIA roles (subset of most common)
 */
export const VALID_ARIA_ROLES = [
    // Document structure
    'document',
    'article',
    'section',
    'heading',
    'group',
    'separator',
    'toolbar',
    'tooltip',
    'feed',
    'figure',
    'img',
    'list',
    'listitem',
    'math',
    'note',
    'definition',
    'term',
    'directory',
    // Landmarks
    ...VALID_LANDMARK_ROLES,
    // Interactive
    ...INTERACTIVE_ROLES,
    // Live regions
    'alert',
    'log',
    'marquee',
    'status',
    'timer',
    // Windows
    'dialog',
    'alertdialog',
    // Composite widgets
    'grid',
    'menu',
    'menubar',
    'tablist',
    'tabpanel',
    'tree',
    'treegrid',
    'radiogroup',
    // Table
    'table',
    'row',
    'rowgroup',
    'columnheader',
    'rowheader',
    'cell',
    // Abstract (shouldn't be used)
    'command',
    'composite',
    'input',
    'landmark',
    'range',
    'roletype',
    'sectionhead',
    'select',
    'structure',
    'widget',
    'window',
    // Generic
    'generic',
    'none',
    'presentation',
] as const;

/**
 * WCAG criteria mappings for tree issues
 */
export const TREE_ISSUE_WCAG_MAP: Record<string, string[]> = {
    'missing-name': ['4.1.2', '1.1.1'], // Name, Role, Value + Non-text Content
    'missing-role': ['4.1.2'], // Name, Role, Value
    'invalid-role': ['4.1.2'], // Name, Role, Value
    'missing-landmark': ['1.3.1', '2.4.1'], // Info and Relationships + Bypass Blocks
    'heading-skip': ['1.3.1', '2.4.6'], // Info and Relationships + Headings and Labels
    'orphaned-control': ['1.3.1', '3.3.2'], // Info and Relationships + Labels or Instructions
    'duplicate-id': ['4.1.1'], // Parsing (obsolete but still checked)
    'focusable-hidden': ['4.1.2', '2.4.3'], // Name, Role, Value + Focus Order
};

/**
 * Check if a role is a valid ARIA role
 */
export function isValidRole(role: string): boolean {
    return VALID_ARIA_ROLES.includes(role as any) ||
        role.startsWith('doc-') || // DPUB-ARIA roles
        role.startsWith('graphics-'); // Graphics-ARIA roles
}

/**
 * Check if a role is a landmark role
 */
export function isLandmarkRole(role: string): boolean {
    return VALID_LANDMARK_ROLES.includes(role as any);
}

/**
 * Check if a role is interactive
 */
export function isInteractiveRole(role: string): boolean {
    return INTERACTIVE_ROLES.includes(role as any);
}

/**
 * Check if a role requires an accessible name
 */
export function roleRequiresName(role: string): boolean {
    return ROLES_REQUIRING_NAME.includes(role as any);
}

/**
 * Check if a role is a form control
 */
export function isFormControlRole(role: string): boolean {
    return FORM_CONTROL_ROLES.includes(role as any);
}

/**
 * Get the expected heading level for a given position
 */
export function getHeadingLevelFromRole(role: string, level?: number): number | null {
    if (role === 'heading' && level !== undefined) {
        return level;
    }
    return null;
}
