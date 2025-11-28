/**
 * WCAG 3.3.8 Accessible Authentication (Minimum) - Level AA
 *
 * A cognitive function test (such as remembering a password or solving a puzzle)
 * is not required for any step in an authentication process unless that step provides at least one of:
 * - Alternative: Another authentication method that does not rely on a cognitive function test
 * - Mechanism: A mechanism is available to assist the user in completing the cognitive function test
 * - Object Recognition: The cognitive function test is to recognize objects
 * - Personal Content: The cognitive function test is to identify non-text content the user provided
 */

import type { AccessibleAuthViolation } from './types.js';

type AuthType = 'captcha-image' | 'captcha-puzzle' | 'cognitive-test' | 'memory-test';

interface AuthElement {
    element: Element;
    selector: string;
    html: string;
    authType: AuthType;
    hasAlternative: boolean;
    allowsCopyPaste: boolean;
    supportsPasswordManager: boolean;
}

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
 * Check if element is in a login/authentication form
 */
function isInAuthForm(element: Element): boolean {
    // Check if element is in a form
    const form = element.closest('form');
    if (!form) return false;

    // Check form attributes
    const formAction = form.getAttribute('action')?.toLowerCase() || '';
    const formId = form.id?.toLowerCase() || '';
    const formClass = form.className?.toString().toLowerCase() || '';
    const formName = form.getAttribute('name')?.toLowerCase() || '';

    const authPatterns = [
        /login/i,
        /signin/i,
        /sign-in/i,
        /sign_in/i,
        /auth/i,
        /authenticate/i,
        /verification/i,
        /2fa/i,
        /two-factor/i,
        /mfa/i,
        /password/i,
        /register/i,
        /signup/i,
        /sign-up/i,
    ];

    const formText = `${formAction} ${formId} ${formClass} ${formName}`;
    if (authPatterns.some(pattern => pattern.test(formText))) {
        return true;
    }

    // Check for password inputs which indicate auth context
    const hasPasswordInput = form.querySelector('input[type="password"]') !== null;
    if (hasPasswordInput) {
        return true;
    }

    return false;
}

/**
 * Detect CAPTCHA images
 */
function findCaptchaImages(): Element[] {
    const captchas: Element[] = [];

    // Look for common CAPTCHA patterns
    const captchaSelectors = [
        'img[src*="captcha"]',
        'img[src*="recaptcha"]',
        'img[alt*="captcha"]',
        'img[alt*="security"]',
        '.captcha img',
        '#captcha img',
        '[class*="captcha"] img',
        '[id*="captcha"] img',
    ];

    const images = document.querySelectorAll(captchaSelectors.join(', '));
    for (const img of images) {
        if (isInAuthForm(img) || img.closest('[class*="captcha"], [id*="captcha"]')) {
            captchas.push(img);
        }
    }

    // Also check for canvas-based CAPTCHAs
    const canvases = document.querySelectorAll('canvas');
    for (const canvas of canvases) {
        const parent = canvas.parentElement;
        if (parent) {
            const parentClass = parent.className?.toString().toLowerCase() || '';
            const parentId = parent.id?.toLowerCase() || '';
            if (/captcha|security|puzzle/.test(`${parentClass} ${parentId}`)) {
                captchas.push(canvas);
            }
        }
    }

    return captchas;
}

/**
 * Detect puzzle-based CAPTCHAs
 */
function findPuzzleCaptchas(): Element[] {
    const puzzles: Element[] = [];

    // Look for common puzzle CAPTCHA patterns
    const puzzlePatterns = [
        '[class*="puzzle"]',
        '[class*="slider"]',
        '[class*="drag-to"]',
        '[class*="slide-to"]',
        '[data-puzzle]',
        '[data-slider]',
    ];

    const elements = document.querySelectorAll(puzzlePatterns.join(', '));
    for (const element of elements) {
        // Check if it's in an auth context
        if (isInAuthForm(element) || element.closest('[class*="captcha"], [class*="verify"]')) {
            puzzles.push(element);
        }
    }

    // Also look for specific text patterns
    const allElements = document.querySelectorAll('*');
    for (const element of allElements) {
        const text = element.textContent?.toLowerCase() || '';
        if (/slide.*(puzzle|verify|unlock)|drag.*(complete|verify|unlock)|solve.*puzzle/.test(text)) {
            if (isInAuthForm(element)) {
                puzzles.push(element);
            }
        }
    }

    return puzzles;
}

/**
 * Detect cognitive tests in forms
 */
function findCognitiveTests(): Element[] {
    const tests: Element[] = [];

    // Look for elements with cognitive test indicators
    const allElements = document.querySelectorAll('*');

    for (const element of allElements) {
        const text = element.textContent?.toLowerCase() || '';

        // Check for math problems
        if (/what is \d+\s*[+\-*/]\s*\d+|solve|calculate|answer.*math/.test(text)) {
            if (isInAuthForm(element)) {
                tests.push(element);
            }
        }

        // Check for memory tests
        if (/remember.*image|select.*image.*you.*chose|which.*image/.test(text)) {
            if (isInAuthForm(element)) {
                tests.push(element);
            }
        }
    }

    return tests;
}

/**
 * Check if a password input allows copy/paste
 */
function checkCopyPasteAllowed(passwordInput: HTMLInputElement): boolean {
    // Check for explicit prevention
    const onpaste = passwordInput.getAttribute('onpaste');
    const oncopy = passwordInput.getAttribute('oncopy');

    if (onpaste?.includes('return false') || onpaste?.includes('preventDefault')) {
        return false;
    }

    if (oncopy?.includes('return false') || oncopy?.includes('preventDefault')) {
        return false;
    }

    // Check for autocomplete disabled (blocks password managers)
    const autocomplete = passwordInput.getAttribute('autocomplete');
    if (autocomplete === 'off' || autocomplete === 'new-password') {
        // new-password is actually OK (for registration)
        // off is problematic
        if (autocomplete === 'off') {
            return false;
        }
    }

    return true;
}

/**
 * Check if form supports password managers
 */
function checkPasswordManagerSupport(form: HTMLFormElement): boolean {
    const passwordInputs = form.querySelectorAll('input[type="password"]');
    const usernameInputs = form.querySelectorAll('input[type="email"], input[type="text"][name*="user"], input[type="text"][name*="email"], input[autocomplete="username"]');

    // Forms need proper autocomplete attributes
    let hasProperAutocomplete = true;

    for (const input of passwordInputs) {
        const autocomplete = input.getAttribute('autocomplete');
        if (autocomplete === 'off') {
            hasProperAutocomplete = false;
            break;
        }
    }

    // Check for username/email field with proper autocomplete
    let hasProperUsernameField = usernameInputs.length > 0;

    // Check form doesn't prevent paste
    for (const input of passwordInputs) {
        const htmlInput = input as HTMLInputElement;
        if (!checkCopyPasteAllowed(htmlInput)) {
            return false;
        }
    }

    return hasProperAutocomplete && hasProperUsernameField;
}

/**
 * Find alternative authentication methods
 */
function findAuthAlternatives(form: HTMLFormElement): Element[] {
    const alternatives: Element[] = [];

    // Look for SSO/OAuth buttons
    const ssoPatterns = [
        '[class*="google"]',
        '[class*="facebook"]',
        '[class*="apple"]',
        '[class*="microsoft"]',
        '[class*="github"]',
        '[class*="sso"]',
        '[class*="oauth"]',
        '[class*="social"]',
        'a[href*="oauth"]',
        'a[href*="sso"]',
    ];

    const buttons = form.querySelectorAll(ssoPatterns.join(', '));
    for (const button of buttons) {
        alternatives.push(button);
    }

    // Also check siblings of the form
    const formParent = form.parentElement;
    if (formParent) {
        const siblingButtons = formParent.querySelectorAll(ssoPatterns.join(', '));
        for (const button of siblingButtons) {
            if (!form.contains(button)) {
                alternatives.push(button);
            }
        }
    }

    // Check for "use passkey" or "use magic link" options
    const allLinks = document.querySelectorAll('a, button');
    for (const link of allLinks) {
        const text = link.textContent?.toLowerCase() || '';
        if (/passkey|magic.?link|passwordless|send.*code|email.*link/.test(text)) {
            alternatives.push(link);
        }
    }

    // Check for audio CAPTCHA alternative
    const audioButtons = document.querySelectorAll('[class*="audio"], [aria-label*="audio"], button[title*="audio"]');
    for (const button of audioButtons) {
        if (form.contains(button) || button.closest('[class*="captcha"]')) {
            alternatives.push(button);
        }
    }

    return alternatives;
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
 * Analyze an authentication element for accessibility
 */
function analyzeAuthElement(element: Element, authType: AuthType): AuthElement {
    const selector = getSelector(element);
    const html = getHtmlSnippet(element);

    // Find the containing form
    const form = element.closest('form') as HTMLFormElement | null;
    const alternatives = form ? findAuthAlternatives(form) : [];

    // Check copy/paste for password fields
    let allowsCopyPaste = true;
    let supportsPasswordManager = true;

    if (form) {
        supportsPasswordManager = checkPasswordManagerSupport(form);
        const passwordInputs = form.querySelectorAll('input[type="password"]');
        for (const input of passwordInputs) {
            if (!checkCopyPasteAllowed(input as HTMLInputElement)) {
                allowsCopyPaste = false;
                break;
            }
        }
    }

    return {
        element,
        selector,
        html,
        authType,
        hasAlternative: alternatives.length > 0,
        allowsCopyPaste,
        supportsPasswordManager
    };
}

/**
 * Run accessible authentication check
 */
export function checkAccessibleAuthentication(): AccessibleAuthViolation[] {
    const violations: AccessibleAuthViolation[] = [];

    // Find CAPTCHA images
    const captchaImages = findCaptchaImages();
    for (const captcha of captchaImages) {
        if (!isElementVisible(captcha)) continue;

        const analysis = analyzeAuthElement(captcha, 'captcha-image');

        // Check if there's an audio alternative
        const hasAudioAlt = captcha.closest('[class*="captcha"], [id*="captcha"]')
            ?.querySelector('[class*="audio"], [aria-label*="audio"]') !== null;

        if (!analysis.hasAlternative && !hasAudioAlt) {
            violations.push({
                id: 'accessible-authentication',
                criterion: '3.3.8 Accessible Authentication (Minimum)',
                level: 'AA',
                element: captcha.tagName.toLowerCase(),
                selector: analysis.selector,
                html: analysis.html,
                impact: 'critical',
                description: 'Image CAPTCHA requires cognitive function test without accessible alternative',
                details: {
                    authType: 'captcha-image',
                    hasAlternative: false,
                    allowsCopyPaste: analysis.allowsCopyPaste,
                    supportsPasswordManager: analysis.supportsPasswordManager
                }
            });
        }
    }

    // Find puzzle CAPTCHAs
    const puzzleCaptchas = findPuzzleCaptchas();
    for (const puzzle of puzzleCaptchas) {
        if (!isElementVisible(puzzle)) continue;

        const analysis = analyzeAuthElement(puzzle, 'captcha-puzzle');

        if (!analysis.hasAlternative) {
            violations.push({
                id: 'accessible-authentication',
                criterion: '3.3.8 Accessible Authentication (Minimum)',
                level: 'AA',
                element: puzzle.tagName.toLowerCase(),
                selector: analysis.selector,
                html: analysis.html,
                impact: 'critical',
                description: 'Puzzle CAPTCHA requires cognitive/motor function without accessible alternative',
                details: {
                    authType: 'captcha-puzzle',
                    hasAlternative: false,
                    allowsCopyPaste: analysis.allowsCopyPaste,
                    supportsPasswordManager: analysis.supportsPasswordManager
                }
            });
        }
    }

    // Find cognitive tests
    const cognitiveTests = findCognitiveTests();
    for (const test of cognitiveTests) {
        if (!isElementVisible(test)) continue;

        const analysis = analyzeAuthElement(test, 'cognitive-test');

        if (!analysis.hasAlternative) {
            violations.push({
                id: 'accessible-authentication',
                criterion: '3.3.8 Accessible Authentication (Minimum)',
                level: 'AA',
                element: test.tagName.toLowerCase(),
                selector: analysis.selector,
                html: analysis.html,
                impact: 'serious',
                description: 'Cognitive function test in authentication without accessible alternative',
                details: {
                    authType: 'cognitive-test',
                    hasAlternative: false,
                    allowsCopyPaste: analysis.allowsCopyPaste,
                    supportsPasswordManager: analysis.supportsPasswordManager
                }
            });
        }
    }

    // Check password fields for copy/paste prevention
    const passwordFields = document.querySelectorAll('input[type="password"]');
    for (const field of passwordFields) {
        if (!isElementVisible(field)) continue;

        const htmlField = field as HTMLInputElement;
        if (!checkCopyPasteAllowed(htmlField)) {
            violations.push({
                id: 'accessible-authentication',
                criterion: '3.3.8 Accessible Authentication (Minimum)',
                level: 'AA',
                element: 'input',
                selector: getSelector(field),
                html: getHtmlSnippet(field),
                impact: 'serious',
                description: 'Password field prevents copy/paste, blocking password manager use',
                details: {
                    authType: 'cognitive-test', // Remembering password is a cognitive test
                    hasAlternative: false,
                    allowsCopyPaste: false,
                    supportsPasswordManager: false
                }
            });
        }
    }

    return violations;
}

/**
 * Get information about authentication elements on the page
 */
export function getAuthenticationInfo(): Array<{
    type: string;
    selector: string;
    hasAlternative: boolean;
    allowsCopyPaste: boolean;
    supportsPasswordManager: boolean;
}> {
    const results: Array<{
        type: string;
        selector: string;
        hasAlternative: boolean;
        allowsCopyPaste: boolean;
        supportsPasswordManager: boolean;
    }> = [];

    // Check CAPTCHAs
    for (const captcha of findCaptchaImages()) {
        const analysis = analyzeAuthElement(captcha, 'captcha-image');
        results.push({
            type: 'captcha-image',
            selector: analysis.selector,
            hasAlternative: analysis.hasAlternative,
            allowsCopyPaste: analysis.allowsCopyPaste,
            supportsPasswordManager: analysis.supportsPasswordManager
        });
    }

    // Check puzzles
    for (const puzzle of findPuzzleCaptchas()) {
        const analysis = analyzeAuthElement(puzzle, 'captcha-puzzle');
        results.push({
            type: 'captcha-puzzle',
            selector: analysis.selector,
            hasAlternative: analysis.hasAlternative,
            allowsCopyPaste: analysis.allowsCopyPaste,
            supportsPasswordManager: analysis.supportsPasswordManager
        });
    }

    // Check auth forms
    const forms = document.querySelectorAll('form');
    for (const form of forms) {
        if (isInAuthForm(form)) {
            const htmlForm = form as HTMLFormElement;
            results.push({
                type: 'auth-form',
                selector: getSelector(form),
                hasAlternative: findAuthAlternatives(htmlForm).length > 0,
                allowsCopyPaste: true, // Will be overridden if issues found
                supportsPasswordManager: checkPasswordManagerSupport(htmlForm)
            });
        }
    }

    return results;
}
