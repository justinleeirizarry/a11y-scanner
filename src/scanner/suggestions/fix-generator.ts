/**
 * Fix suggestion generator for accessibility violations
 */

export interface FixSuggestion {
    summary: string;
    details: string;
    codeExample?: string;
    wcagCriteria?: string;
    wcagLevel?: 'A' | 'AA' | 'AAA';
    userImpact?: string;
    priority?: 'critical' | 'high' | 'medium' | 'low';
}

const FIX_SUGGESTIONS: Record<string, FixSuggestion> = {
    'landmark-one-main': {
        summary: 'Add a <main> landmark to your page',
        details: 'Wrap your primary page content in a <main> element. This helps screen reader users navigate to the main content quickly using landmark navigation.',
        codeExample: '<main>\n  {/* Your page content here */}\n</main>',
        wcagCriteria: '1.3.1 Info and Relationships',
        wcagLevel: 'A',
        userImpact: 'Screen reader users rely on landmarks to quickly navigate to the main content. Without a <main> landmark, they must manually search through the entire page.',
        priority: 'high'
    },
    'page-has-heading-one': {
        summary: 'Add an <h1> heading to your page',
        details: 'Every page should have exactly one <h1> element that describes the page\'s main topic. This is typically the page title and helps users understand what the page is about.',
        codeExample: '<h1>Page Title</h1>',
        wcagCriteria: '2.4.6 Headings and Labels',
        wcagLevel: 'AA',
        userImpact: 'Screen reader users often navigate by headings. Missing <h1> makes it difficult to understand the page structure and main purpose.',
        priority: 'high'
    },
    'heading-order': {
        summary: 'Fix heading hierarchy',
        details: 'Headings should follow a logical order (h1 → h2 → h3) without skipping levels. This creates a clear document outline.',
        codeExample: '// ❌ Bad: Skips from h1 to h4\n<h1>Title</h1>\n<h4>Subtitle</h4>\n\n// ✅ Good: Proper hierarchy\n<h1>Title</h1>\n<h2>Subtitle</h2>',
        wcagCriteria: '1.3.1 Info and Relationships',
        wcagLevel: 'A',
        userImpact: 'Screen reader users navigate by heading levels. Skipped levels create confusion about content hierarchy and make navigation difficult.',
        priority: 'medium'
    },
    'region': {
        summary: 'Wrap content in semantic landmarks',
        details: 'Use semantic HTML5 elements like <main>, <nav>, <aside>, <header>, <footer> to structure your page content. This creates clear regions that assistive technology can identify.',
        codeExample: '<main>\n  <section>\n    {/* Content */}\n  </section>\n</main>',
        wcagCriteria: '1.3.1 Info and Relationships',
        wcagLevel: 'A',
        userImpact: 'Screen reader users rely on landmarks to understand page structure and navigate efficiently. Missing landmarks force them to read through all content linearly.',
        priority: 'medium'
    },
    'button-name': {
        summary: 'Add accessible text to the button',
        details: 'Buttons must have text content or an aria-label attribute so screen readers can announce what the button does.',
        codeExample: '// ❌ Bad: Icon-only button\n<button><CloseIcon /></button>\n\n// ✅ Good: With aria-label\n<button aria-label="Close dialog">\n  <CloseIcon />\n</button>\n\n// ✅ Better: With visible text\n<button>\n  <CloseIcon /> Close\n</button>',
        wcagCriteria: '4.1.2 Name, Role, Value',
        wcagLevel: 'A',
        userImpact: 'Screen reader users hear nothing or "button" without context, making it impossible to know what the button does. Keyboard users also benefit from clear button labels.',
        priority: 'critical'
    },
    'link-name': {
        summary: 'Add accessible text to the link',
        details: 'Links must have text content or an aria-label attribute that describes where the link goes or what it does.',
        codeExample: '// ❌ Bad: Icon-only link\n<a href="/profile"><Icon /></a>\n\n// ✅ Good: With aria-label\n<a href="/profile" aria-label="View profile">\n  <Icon />\n</a>\n\n// ✅ Better: With visible text\n<a href="/profile">\n  <Icon /> Profile\n</a>',
        wcagCriteria: '4.1.2 Name, Role, Value',
        wcagLevel: 'A',
        userImpact: 'Screen reader users cannot determine the link\'s purpose. They may hear just "link" or the URL, which is not helpful for navigation.',
        priority: 'critical'
    },
    'image-alt': {
        summary: 'Add alt text to the image',
        details: 'All images must have an alt attribute. Use descriptive text for meaningful images, or empty alt="" for decorative images.',
        codeExample: '// ❌ Bad: Missing alt\n<img src="logo.png" />\n\n// ✅ Good: Descriptive alt for meaningful image\n<img src="logo.png" alt="Company Name Logo" />\n\n// ✅ Good: Empty alt for decorative image\n<img src="decoration.png" alt="" />',
        wcagCriteria: '1.1.1 Non-text Content',
        wcagLevel: 'A',
        userImpact: 'Screen reader users cannot perceive images. Without alt text, they miss important visual information. Blind users are completely excluded from image content.',
        priority: 'critical'
    },
    'color-contrast': {
        summary: 'Increase color contrast',
        details: 'Text must have sufficient contrast with its background. Aim for at least 4.5:1 for normal text (14pt or smaller), 3:1 for large text (18pt+ or 14pt+ bold).',
        codeExample: '// ❌ Bad: Low contrast (e.g., #999 on #fff = 2.8:1)\ncolor: #999999;\nbackground: #ffffff;\n\n// ✅ Good: High contrast (e.g., #595959 on #fff = 7:1)\ncolor: #595959;\nbackground: #ffffff;',
        wcagCriteria: '1.4.3 Contrast (Minimum)',
        wcagLevel: 'AA',
        userImpact: 'Users with low vision, color blindness, or viewing in bright sunlight cannot read low-contrast text. This affects about 1 in 12 people.',
        priority: 'high'
    },
    'label': {
        summary: 'Add a label to the form input',
        details: 'Form inputs must have associated labels using <label> with htmlFor, or aria-label/aria-labelledby.',
        codeExample: '// ❌ Bad: No label\n<input type="email" />\n\n// ✅ Good: With label element\n<label htmlFor="email">Email</label>\n<input id="email" type="email" />\n\n// ✅ Good: With aria-label\n<input type="email" aria-label="Email address" />',
        wcagCriteria: '3.3.2 Labels or Instructions',
        wcagLevel: 'A',
        userImpact: 'Screen reader users cannot identify what information to enter. Sighted users also benefit from labels that increase the clickable area.',
        priority: 'critical'
    },
    'aria-required-attr': {
        summary: 'Add required ARIA attributes',
        details: 'ARIA roles require specific attributes. For example, role="checkbox" requires aria-checked.',
        codeExample: '// ❌ Bad: Missing aria-checked\n<div role="checkbox">Accept terms</div>\n\n// ✅ Good: With required attribute\n<div role="checkbox" aria-checked="false">Accept terms</div>',
        wcagCriteria: '4.1.2 Name, Role, Value',
        wcagLevel: 'A',
        userImpact: 'Screen readers cannot properly announce the state or properties of custom controls, making them unusable.',
        priority: 'critical'
    },
    'aria-valid-attr-value': {
        summary: 'Fix ARIA attribute value',
        details: 'ARIA attributes must have valid values. For example, aria-checked accepts "true", "false", or "mixed".',
        codeExample: '// ❌ Bad: Invalid value\n<div role="checkbox" aria-checked="yes">Item</div>\n\n// ✅ Good: Valid value\n<div role="checkbox" aria-checked="true">Item</div>',
        wcagCriteria: '4.1.2 Name, Role, Value',
        wcagLevel: 'A',
        userImpact: 'Invalid ARIA values cause assistive technology to ignore or misinterpret the attribute, breaking functionality.',
        priority: 'high'
    },
    'list': {
        summary: 'Use proper list markup',
        details: 'List items (<li>) must be contained in <ul>, <ol>, or <menu> elements.',
        codeExample: '// ❌ Bad: Orphaned list items\n<div>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</div>\n\n// ✅ Good: Proper list structure\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>',
        wcagCriteria: '1.3.1 Info and Relationships',
        wcagLevel: 'A',
        userImpact: 'Screen readers announce list length and position (e.g., "list 3 items, item 1 of 3"), helping users understand content structure.',
        priority: 'medium'
    },
    'html-has-lang': {
        summary: 'Add lang attribute to <html> element',
        details: 'The <html> element must have a lang attribute to specify the page language.',
        codeExample: '// ❌ Bad: Missing lang\n<html>\n\n// ✅ Good: With lang attribute\n<html lang="en">',
        wcagCriteria: '3.1.1 Language of Page',
        wcagLevel: 'A',
        userImpact: 'Screen readers use the lang attribute to select the correct pronunciation rules. Wrong language causes garbled speech output.',
        priority: 'high'
    },
    'document-title': {
        summary: 'Add a descriptive <title> to the page',
        details: 'Every page must have a unique, descriptive <title> element that describes the page content.',
        codeExample: '// ❌ Bad: Generic or missing title\n<title>Page</title>\n\n// ✅ Good: Descriptive title\n<title>Contact Us - Company Name</title>',
        wcagCriteria: '2.4.2 Page Titled',
        wcagLevel: 'A',
        userImpact: 'Screen readers announce the page title first. Users rely on it to confirm they\'re on the right page and to identify browser tabs.',
        priority: 'high'
    },
    'meta-viewport': {
        summary: 'Add or fix viewport meta tag',
        details: 'Include a viewport meta tag and avoid user-scalable=no to allow users to zoom.',
        codeExample: '// ❌ Bad: Prevents zooming\n<meta name="viewport" content="width=device-width, user-scalable=no">\n\n// ✅ Good: Allows zooming\n<meta name="viewport" content="width=device-width, initial-scale=1">',
        wcagCriteria: '1.4.4 Resize Text',
        wcagLevel: 'AA',
        userImpact: 'Users with low vision need to zoom content. Preventing zoom excludes them from accessing your content.',
        priority: 'high'
    },
    'duplicate-id': {
        summary: 'Ensure all IDs are unique',
        details: 'ID attributes must be unique within the page. Duplicate IDs break ARIA references and form labels.',
        codeExample: '// ❌ Bad: Duplicate IDs\n<input id="email" />\n<input id="email" />\n\n// ✅ Good: Unique IDs\n<input id="email-1" />\n<input id="email-2" />',
        wcagCriteria: '4.1.1 Parsing',
        wcagLevel: 'A',
        userImpact: 'Duplicate IDs break form label associations and ARIA references, making controls unusable for screen reader users.',
        priority: 'high'
    }
};

/**
 * Generate fix suggestion based on violation type
 */
export function generateFixSuggestion(violationId: string, element?: Element | null): FixSuggestion | undefined {
    return FIX_SUGGESTIONS[violationId];
}
