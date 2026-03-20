/**
 * WCAG 3.3.1 Error Identification - Level A
 *
 * If an input error is automatically detected, the item that is in error is
 * identified and the error is described to the user in text.
 */

import type { WCAG22Violation } from './types.js';

type ErrorIdentificationViolation = WCAG22Violation;

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
 * Check if an input has an associated error text element via aria-describedby or aria-errormessage
 */
function hasAssociatedErrorText(input: Element): boolean {
    // Check aria-errormessage
    const errormessageId = input.getAttribute('aria-errormessage');
    if (errormessageId) {
        const errormessageEl = document.getElementById(errormessageId);
        if (errormessageEl && errormessageEl.textContent?.trim()) {
            return true;
        }
    }

    // Check aria-describedby
    const describedbyIds = input.getAttribute('aria-describedby');
    if (describedbyIds) {
        const ids = describedbyIds.split(/\s+/).filter(id => id.length > 0);
        for (const id of ids) {
            const el = document.getElementById(id);
            if (el && el.textContent?.trim()) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Check if a required input has a nearby error mechanism
 * (aria-describedby, aria-errormessage, or nearby .error/[role="alert"] element)
 */
function hasErrorMechanism(input: Element): boolean {
    // First check programmatic associations
    if (hasAssociatedErrorText(input)) {
        return true;
    }

    // Check for nearby error/alert elements within the same parent or form group
    const fieldContainer = input.closest(
        '.form-group, .form-field, .field, fieldset, [role="group"]'
    ) || input.parentElement;

    if (fieldContainer) {
        // Look for elements with error-related classes
        const errorElements = fieldContainer.querySelectorAll(
            '[class*="error"], [class*="invalid"], [role="alert"]'
        );
        if (errorElements.length > 0) {
            return true;
        }
    }

    // Check for a global live region that could announce errors
    const form = input.closest('form');
    if (form) {
        const alertRegions = form.querySelectorAll('[role="alert"], [aria-live="assertive"], [aria-live="polite"]');
        if (alertRegions.length > 0) {
            return true;
        }
    }

    return false;
}

/**
 * Check if an error message element is programmatically associated with any input
 */
function isAssociatedWithInput(errorElement: Element): boolean {
    const errorId = errorElement.id;
    if (!errorId) {
        return false;
    }

    // Check if any input references this element via aria-describedby
    const describedByInputs = document.querySelectorAll(`[aria-describedby~="${CSS.escape(errorId)}"]`);
    if (describedByInputs.length > 0) {
        return true;
    }

    // Check if any input references this element via aria-errormessage
    const errormessageInputs = document.querySelectorAll(`[aria-errormessage="${CSS.escape(errorId)}"]`);
    if (errormessageInputs.length > 0) {
        return true;
    }

    return false;
}

/**
 * Find all visible error message elements on the page
 */
function findErrorMessageElements(): Element[] {
    const errorElements: Element[] = [];
    const seen = new Set<Element>();

    // Elements with role="alert"
    const alertElements = document.querySelectorAll('[role="alert"]');
    for (const el of alertElements) {
        if (!seen.has(el) && isElementVisible(el) && el.textContent?.trim()) {
            seen.add(el);
            errorElements.push(el);
        }
    }

    // Elements with error-related class names
    const allElements = document.querySelectorAll('[class]');
    for (const el of allElements) {
        if (seen.has(el)) continue;

        const className = el.className?.toString().toLowerCase() || '';
        if (/\berror\b/.test(className) || /\binvalid\b/.test(className)) {
            // Exclude generic containers and non-message elements
            const tag = el.tagName.toLowerCase();
            if (tag === 'input' || tag === 'select' || tag === 'textarea' || tag === 'form') {
                continue;
            }
            if (isElementVisible(el) && el.textContent?.trim()) {
                seen.add(el);
                errorElements.push(el);
            }
        }
    }

    return errorElements;
}

/**
 * Run error identification check (WCAG 3.3.1 Level A)
 */
export function checkErrorIdentification(): ErrorIdentificationViolation[] {
    const violations: ErrorIdentificationViolation[] = [];

    // Check 1: Inputs with aria-invalid="true" that lack associated error text
    const invalidInputs = document.querySelectorAll(
        'input[aria-invalid="true"], select[aria-invalid="true"], textarea[aria-invalid="true"]'
    );

    for (const input of invalidInputs) {
        if (!isElementVisible(input)) continue;

        if (!hasAssociatedErrorText(input)) {
            violations.push({
                id: 'error-identification',
                criterion: '3.3.1 Error Identification',
                level: 'A',
                element: input.tagName.toLowerCase(),
                selector: getSelector(input),
                html: getHtmlSnippet(input),
                impact: 'critical',
                description: 'Input is marked as invalid (aria-invalid="true") but has no associated error message via aria-describedby or aria-errormessage',
                details: {
                    checkType: 'invalid-without-error-text',
                    hasAriaDescribedby: input.hasAttribute('aria-describedby'),
                    hasAriaErrormessage: input.hasAttribute('aria-errormessage'),
                    inputType: input.getAttribute('type') || input.tagName.toLowerCase()
                }
            });
        }
    }

    // Check 2: Required inputs that have no associated error mechanism
    const requiredInputs = document.querySelectorAll(
        'input[required], input[aria-required="true"], select[required], select[aria-required="true"], textarea[required], textarea[aria-required="true"]'
    );

    for (const input of requiredInputs) {
        if (!isElementVisible(input)) continue;

        // Only flag required inputs that are also in an invalid state
        // (empty required fields or explicitly marked invalid)
        const isInvalid = input.getAttribute('aria-invalid') === 'true';
        const htmlInput = input as HTMLInputElement;
        const isEmpty = htmlInput.value !== undefined && htmlInput.value === '';

        if ((isInvalid || isEmpty) && !hasErrorMechanism(input)) {
            violations.push({
                id: 'error-identification',
                criterion: '3.3.1 Error Identification',
                level: 'A',
                element: input.tagName.toLowerCase(),
                selector: getSelector(input),
                html: getHtmlSnippet(input),
                impact: 'serious',
                description: 'Required input has no error identification mechanism (no aria-describedby, aria-errormessage, or nearby error/alert element)',
                details: {
                    checkType: 'required-without-error-mechanism',
                    isRequired: true,
                    isInvalid,
                    isEmpty,
                    hasAriaDescribedby: input.hasAttribute('aria-describedby'),
                    hasAriaErrormessage: input.hasAttribute('aria-errormessage'),
                    inputType: input.getAttribute('type') || input.tagName.toLowerCase()
                }
            });
        }
    }

    // Check 3: Visible error messages not programmatically associated with any input
    const errorElements = findErrorMessageElements();

    for (const errorEl of errorElements) {
        if (!isAssociatedWithInput(errorEl)) {
            violations.push({
                id: 'error-identification',
                criterion: '3.3.1 Error Identification',
                level: 'A',
                element: errorEl.tagName.toLowerCase(),
                selector: getSelector(errorEl),
                html: getHtmlSnippet(errorEl),
                impact: 'moderate',
                description: 'Visible error message is not programmatically associated with any input (missing id or not referenced by aria-describedby/aria-errormessage)',
                details: {
                    checkType: 'unassociated-error-message',
                    hasId: !!errorEl.id,
                    role: errorEl.getAttribute('role'),
                    errorText: (errorEl.textContent?.trim() || '').slice(0, 100),
                    className: errorEl.className?.toString() || ''
                }
            });
        }
    }

    return violations;
}

/**
 * Get diagnostic information about error identification on the page
 */
export function getErrorIdentificationInfo(): Array<{
    type: string;
    selector: string;
    hasAssociatedErrorText: boolean;
    hasErrorMechanism: boolean;
    details: Record<string, any>;
}> {
    const results: Array<{
        type: string;
        selector: string;
        hasAssociatedErrorText: boolean;
        hasErrorMechanism: boolean;
        details: Record<string, any>;
    }> = [];

    // Report on invalid inputs
    const invalidInputs = document.querySelectorAll(
        'input[aria-invalid="true"], select[aria-invalid="true"], textarea[aria-invalid="true"]'
    );

    for (const input of invalidInputs) {
        if (!isElementVisible(input)) continue;

        results.push({
            type: 'invalid-input',
            selector: getSelector(input),
            hasAssociatedErrorText: hasAssociatedErrorText(input),
            hasErrorMechanism: hasErrorMechanism(input),
            details: {
                inputType: input.getAttribute('type') || input.tagName.toLowerCase(),
                ariaDescribedby: input.getAttribute('aria-describedby'),
                ariaErrormessage: input.getAttribute('aria-errormessage')
            }
        });
    }

    // Report on required inputs
    const requiredInputs = document.querySelectorAll(
        'input[required], input[aria-required="true"], select[required], select[aria-required="true"], textarea[required], textarea[aria-required="true"]'
    );

    for (const input of requiredInputs) {
        if (!isElementVisible(input)) continue;

        // Skip if already reported as invalid
        if (input.getAttribute('aria-invalid') === 'true') continue;

        results.push({
            type: 'required-input',
            selector: getSelector(input),
            hasAssociatedErrorText: hasAssociatedErrorText(input),
            hasErrorMechanism: hasErrorMechanism(input),
            details: {
                inputType: input.getAttribute('type') || input.tagName.toLowerCase(),
                ariaDescribedby: input.getAttribute('aria-describedby'),
                ariaErrormessage: input.getAttribute('aria-errormessage')
            }
        });
    }

    // Report on error message elements
    const errorElements = findErrorMessageElements();

    for (const errorEl of errorElements) {
        results.push({
            type: 'error-message',
            selector: getSelector(errorEl),
            hasAssociatedErrorText: false, // N/A for error elements
            hasErrorMechanism: false, // N/A for error elements
            details: {
                isAssociatedWithInput: isAssociatedWithInput(errorEl),
                hasId: !!errorEl.id,
                role: errorEl.getAttribute('role'),
                errorText: (errorEl.textContent?.trim() || '').slice(0, 100)
            }
        });
    }

    return results;
}
