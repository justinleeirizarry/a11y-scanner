/**
 * Fix suggestion generator for accessibility violations
 *
 * Note: Code examples removed - axe-core's helpUrl links to comprehensive docs.
 * Future enhancement: generate site-specific examples from actual scanned elements.
 */
import type { FixSuggestion } from '../../types.js';

// Re-export for convenience
export type { FixSuggestion };

const FIX_SUGGESTIONS: Record<string, FixSuggestion> = {
    'landmark-one-main': {
        summary: 'Add a <main> landmark to your page',
        details: 'Wrap your primary page content in a <main> element.',
        wcagCriteria: '1.3.1 Info and Relationships',
        wcagLevel: 'A',
        userImpact: 'Screen reader users rely on landmarks to quickly navigate to the main content.',
        priority: 'high'
    },
    'page-has-heading-one': {
        summary: 'Add an <h1> heading to your page',
        details: 'Every page should have exactly one <h1> element that describes the page\'s main topic.',
        wcagCriteria: '2.4.6 Headings and Labels',
        wcagLevel: 'AA',
        userImpact: 'Screen reader users often navigate by headings to understand page structure.',
        priority: 'high'
    },
    'heading-order': {
        summary: 'Fix heading hierarchy',
        details: 'Headings should follow a logical order (h1 → h2 → h3) without skipping levels.',
        wcagCriteria: '1.3.1 Info and Relationships',
        wcagLevel: 'A',
        userImpact: 'Skipped heading levels create confusion about content hierarchy.',
        priority: 'medium'
    },
    'region': {
        summary: 'Wrap content in semantic landmarks',
        details: 'Use semantic HTML5 elements like <main>, <nav>, <aside>, <header>, <footer>.',
        wcagCriteria: '1.3.1 Info and Relationships',
        wcagLevel: 'A',
        userImpact: 'Screen reader users rely on landmarks to navigate efficiently.',
        priority: 'medium'
    },
    'button-name': {
        summary: 'Add accessible text to the button',
        details: 'Buttons must have text content or an aria-label attribute.',
        wcagCriteria: '4.1.2 Name, Role, Value',
        wcagLevel: 'A',
        userImpact: 'Screen reader users cannot determine what the button does.',
        priority: 'critical'
    },
    'link-name': {
        summary: 'Add accessible text to the link',
        details: 'Links must have text content or an aria-label describing the destination.',
        wcagCriteria: '4.1.2 Name, Role, Value',
        wcagLevel: 'A',
        userImpact: 'Screen reader users cannot determine where the link goes.',
        priority: 'critical'
    },
    'image-alt': {
        summary: 'Add alt text to the image',
        details: 'Use descriptive text for meaningful images, or empty alt="" for decorative images.',
        wcagCriteria: '1.1.1 Non-text Content',
        wcagLevel: 'A',
        userImpact: 'Screen reader users cannot perceive image content.',
        priority: 'critical'
    },
    'color-contrast': {
        summary: 'Increase color contrast',
        details: 'Text must have at least 4.5:1 contrast for normal text, 3:1 for large text.',
        wcagCriteria: '1.4.3 Contrast (Minimum)',
        wcagLevel: 'AA',
        userImpact: 'Users with low vision or color blindness cannot read low-contrast text.',
        priority: 'high'
    },
    'label': {
        summary: 'Add a label to the form input',
        details: 'Form inputs must have associated labels using <label>, aria-label, or aria-labelledby.',
        wcagCriteria: '3.3.2 Labels or Instructions',
        wcagLevel: 'A',
        userImpact: 'Screen reader users cannot identify what information to enter.',
        priority: 'critical'
    },
    'aria-required-attr': {
        summary: 'Add required ARIA attributes',
        details: 'ARIA roles require specific attributes (e.g., role="checkbox" requires aria-checked).',
        wcagCriteria: '4.1.2 Name, Role, Value',
        wcagLevel: 'A',
        userImpact: 'Screen readers cannot properly announce custom control states.',
        priority: 'critical'
    },
    'aria-valid-attr-value': {
        summary: 'Fix ARIA attribute value',
        details: 'ARIA attributes must have valid values.',
        wcagCriteria: '4.1.2 Name, Role, Value',
        wcagLevel: 'A',
        userImpact: 'Invalid ARIA values cause assistive technology to misinterpret the element.',
        priority: 'high'
    },
    'list': {
        summary: 'Use proper list markup',
        details: 'List items (<li>) must be contained in <ul>, <ol>, or <menu> elements.',
        wcagCriteria: '1.3.1 Info and Relationships',
        wcagLevel: 'A',
        userImpact: 'Screen readers cannot announce list structure and navigation.',
        priority: 'medium'
    },
    'html-has-lang': {
        summary: 'Add lang attribute to <html> element',
        details: 'The <html> element must have a lang attribute specifying the page language.',
        wcagCriteria: '3.1.1 Language of Page',
        wcagLevel: 'A',
        userImpact: 'Screen readers use lang to select correct pronunciation rules.',
        priority: 'high'
    },
    'document-title': {
        summary: 'Add a descriptive <title> to the page',
        details: 'Every page must have a unique, descriptive <title> element.',
        wcagCriteria: '2.4.2 Page Titled',
        wcagLevel: 'A',
        userImpact: 'Users rely on the title to identify the page and browser tabs.',
        priority: 'high'
    },
    'meta-viewport': {
        summary: 'Allow users to zoom the page',
        details: 'Avoid user-scalable=no and maximum-scale=1 in viewport meta tag.',
        wcagCriteria: '1.4.4 Resize Text',
        wcagLevel: 'AA',
        userImpact: 'Users with low vision need to zoom content.',
        priority: 'high'
    },
    'duplicate-id': {
        summary: 'Ensure all IDs are unique',
        details: 'ID attributes must be unique within the page.',
        wcagCriteria: '4.1.1 Parsing',
        wcagLevel: 'A',
        userImpact: 'Duplicate IDs break form labels and ARIA references.',
        priority: 'high'
    },
    'landmark-unique': {
        summary: 'Add unique labels to duplicate landmarks',
        details: 'When multiple landmarks of the same type exist, each must have a unique aria-label or aria-labelledby.',
        wcagCriteria: '1.3.1 Info and Relationships',
        wcagLevel: 'A',
        userImpact: 'Screen reader users cannot distinguish between multiple navigation regions.',
        priority: 'medium'
    },
    'nested-interactive': {
        summary: 'Remove nested interactive elements',
        details: 'Interactive elements (buttons, links) cannot be nested inside each other.',
        wcagCriteria: '4.1.2 Name, Role, Value',
        wcagLevel: 'A',
        userImpact: 'Nested interactive elements cause unpredictable behavior with assistive technologies.',
        priority: 'critical'
    },
    'aria-hidden-focus': {
        summary: 'Remove focusable elements from aria-hidden regions',
        details: 'Elements with aria-hidden="true" should not contain focusable elements.',
        wcagCriteria: '4.1.2 Name, Role, Value',
        wcagLevel: 'A',
        userImpact: 'Keyboard users can focus invisible elements causing confusion.',
        priority: 'critical'
    },
    'focus-order-semantics': {
        summary: 'Fix focus order to match visual order',
        details: 'Tab order should follow the visual reading order of the page.',
        wcagCriteria: '2.4.3 Focus Order',
        wcagLevel: 'A',
        userImpact: 'Keyboard users experience confusing navigation order.',
        priority: 'high'
    },
    'scrollable-region-focusable': {
        summary: 'Make scrollable regions keyboard accessible',
        details: 'Scrollable regions need tabindex="0" to be keyboard accessible.',
        wcagCriteria: '2.1.1 Keyboard',
        wcagLevel: 'A',
        userImpact: 'Keyboard users cannot scroll content in these regions.',
        priority: 'high'
    },
    'bypass': {
        summary: 'Add skip navigation link',
        details: 'Provide a skip link to bypass repeated navigation and jump to main content.',
        wcagCriteria: '2.4.1 Bypass Blocks',
        wcagLevel: 'A',
        userImpact: 'Keyboard users must tab through all navigation on every page.',
        priority: 'high'
    },
    'empty-heading': {
        summary: 'Add content to empty headings',
        details: 'Heading elements must have text content.',
        wcagCriteria: '1.3.1 Info and Relationships',
        wcagLevel: 'A',
        userImpact: 'Screen readers announce empty headings causing confusion.',
        priority: 'medium'
    },
    'frame-title': {
        summary: 'Add title to iframe',
        details: 'All iframes must have a descriptive title attribute.',
        wcagCriteria: '4.1.2 Name, Role, Value',
        wcagLevel: 'A',
        userImpact: 'Screen reader users cannot identify iframe content.',
        priority: 'high'
    },
    'input-image-alt': {
        summary: 'Add alt text to image button',
        details: 'Image inputs must have an alt attribute describing their function.',
        wcagCriteria: '1.1.1 Non-text Content',
        wcagLevel: 'A',
        userImpact: 'Screen reader users cannot determine button purpose.',
        priority: 'critical'
    },
    'select-name': {
        summary: 'Add label to select element',
        details: 'Select elements must have an associated label.',
        wcagCriteria: '3.3.2 Labels or Instructions',
        wcagLevel: 'A',
        userImpact: 'Screen reader users cannot identify what to select.',
        priority: 'critical'
    },
    'tabindex': {
        summary: 'Remove positive tabindex values',
        details: 'Avoid tabindex values greater than 0 as they disrupt natural tab order.',
        wcagCriteria: '2.4.3 Focus Order',
        wcagLevel: 'A',
        userImpact: 'Positive tabindex creates unpredictable keyboard navigation.',
        priority: 'medium'
    }
};

/**
 * Generate fix suggestion based on violation type
 */
export function generateFixSuggestion(violationId: string, element?: Element | null): FixSuggestion | undefined {
    return FIX_SUGGESTIONS[violationId];
}
