/**
 * Build an accessibility tree from the DOM
 * This provides cross-browser accessibility tree data without using deprecated APIs
 * Uses standard accessible name computation algorithm per ARIA spec
 */

export interface AccessibilityNode {
    role: string | null;
    name: string | null;
    description?: string | null;
    value?: string | null;
    children?: AccessibilityNode[];
    element?: string; // CSS selector or tag name
}

/**
 * Build accessibility tree from DOM
 * Extracts semantic roles and accessible names from elements
 */
export function buildAccessibilityTree(): AccessibilityNode | null {
    try {
        const root = document.body;
        if (!root) return null;

        return buildNodeTree(root);
    } catch (error) {
        console.warn('Failed to build accessibility tree:', error);
        return null;
    }
}

/**
 * Recursively build accessibility tree for a DOM node
 */
function buildNodeTree(element: Element): AccessibilityNode | null {
    // Get role from explicit ARIA role or implicit role
    const role = getElementRole(element);

    // Get accessible name following ARIA name computation algorithm
    const name = getAccessibleName(element);

    // Skip nodes without semantic meaning (no role and no name)
    if (!role && !name) {
        // But still process children
        const children = getAccessibleChildren(element);
        if (children.length === 1) {
            return children[0]; // Flatten single child
        }
        if (children.length > 1) {
            return {
                role: null,
                name: null,
                children
            };
        }
        return null;
    }

    const node: AccessibilityNode = {
        role: role || null,
        name: name || null,
        element: element.tagName.toLowerCase()
    };

    // Add description if present
    const description = element.getAttribute('aria-describedby');
    if (description) {
        const descElement = document.getElementById(description);
        if (descElement) {
            node.description = descElement.textContent?.trim() || null;
        }
    }

    // Add value for form elements
    const value = getElementValue(element);
    if (value !== null) {
        node.value = value;
    }

    // Process children
    const children = getAccessibleChildren(element);
    if (children.length > 0) {
        node.children = children;
    }

    return node;
}

/**
 * Get the role of an element (explicit ARIA role or implicit semantic role)
 * Based on HTML specification and ARIA role mappings
 */
function getElementRole(element: Element): string | null {
    // Check explicit ARIA role first
    const ariaRole = element.getAttribute('role');
    if (ariaRole) return ariaRole;

    const tagName = element.tagName.toLowerCase();

    // Implicit roles for semantic HTML elements
    const implicitRoles: Record<string, string> = {
        button: 'button',
        a: 'link',
        img: 'img',
        nav: 'navigation',
        main: 'main',
        header: 'banner',
        footer: 'contentinfo',
        aside: 'complementary',
        section: 'region',
        article: 'article',
        form: 'form',
        table: 'table',
        ul: 'list',
        ol: 'list',
        li: 'listitem',
        h1: 'heading',
        h2: 'heading',
        h3: 'heading',
        h4: 'heading',
        h5: 'heading',
        h6: 'heading',
        fieldset: 'group',
        legend: 'none',
        label: 'none',
    };

    if (tagName === 'input') {
        return getInputRole(element as HTMLInputElement);
    }

    if (tagName === 'textarea') {
        return 'textbox';
    }

    if (tagName === 'select') {
        return 'listbox';
    }

    return implicitRoles[tagName] || null;
}

/**
 * Get role for input elements based on type attribute
 */
function getInputRole(element: HTMLInputElement): string {
    const type = element.type?.toLowerCase() || 'text';

    const typeRoles: Record<string, string> = {
        button: 'button',
        checkbox: 'checkbox',
        radio: 'radio',
        range: 'slider',
        search: 'searchbox',
        submit: 'button',
        reset: 'button',
        image: 'button',
    };

    return typeRoles[type] || 'textbox';
}

/**
 * Get accessible name for an element following accessible name computation algorithm
 * https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/
 */
function getAccessibleName(element: Element): string | null {
    // 1. aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel?.trim()) return ariaLabel.trim();

    // 2. aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
        const labelElement = document.getElementById(labelledBy);
        if (labelElement) {
            const text = labelElement.textContent?.trim();
            if (text) return text;
        }
    }

    // 3. For form inputs, check associated label element
    const tag = element.tagName.toLowerCase();
    const id = (element as HTMLElement).id;
    if ((tag === 'input' || tag === 'textarea' || tag === 'select') && id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) {
            const text = label.textContent?.trim();
            if (text) return text;
        }
    }

    // 4. alt text for images
    if (tag === 'img') {
        const alt = (element as HTMLImageElement).alt;
        if (alt?.trim()) return alt.trim();
    }

    // 5. Text content (for buttons, links, headings, etc.)
    const text = element.textContent?.trim();
    if (text && text.length > 0) {
        return text.length > 100 ? text.substring(0, 100) + '...' : text;
    }

    return null;
}

/**
 * Get value for form elements
 */
function getElementValue(element: Element): string | null {
    const tagName = element.tagName.toLowerCase();

    if (tagName === 'input' || tagName === 'textarea') {
        const value = (element as HTMLInputElement | HTMLTextAreaElement).value;
        return value || null;
    }

    if (tagName === 'select') {
        const select = element as HTMLSelectElement;
        const selectedOption = select.options[select.selectedIndex];
        return selectedOption?.textContent?.trim() || null;
    }

    return null;
}

/**
 * Get accessible children of an element
 */
function getAccessibleChildren(element: Element): AccessibilityNode[] {
    const children: AccessibilityNode[] = [];

    for (let i = 0; i < element.children.length; i++) {
        const child = element.children[i];

        // Skip hidden elements
        if (child.getAttribute('aria-hidden') === 'true') {
            continue;
        }

        const node = buildNodeTree(child);
        if (node) {
            children.push(node);
        }
    }

    return children;
}
