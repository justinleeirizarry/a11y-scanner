/**
 * WCAG 4.1.3 Status Messages - Level AA
 *
 * In content implemented using markup languages, status messages can be
 * programmatically determined through role or properties such that they
 * can be presented to the user by assistive technologies without receiving focus.
 *
 * This checks that dynamic status regions (form errors, loading indicators,
 * toasts/notifications, counters/badges) use appropriate ARIA live region
 * attributes so assistive technologies can announce them.
 */

import type { WCAG22Violation } from './types.js';

type StatusMessageViolation = WCAG22Violation;

type StatusType = 'form-error' | 'loading-indicator' | 'toast-notification' | 'counter-badge';

interface StatusElement {
    element: Element;
    selector: string;
    html: string;
    statusType: StatusType;
    hasLiveRegion: boolean;
    currentRole: string | null;
    currentAriaLive: string | null;
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
 * Check if an element or any ancestor has a live region role or aria-live attribute
 */
function hasLiveRegionAncestor(element: Element): boolean {
    let current: Element | null = element;

    while (current) {
        const role = current.getAttribute('role');
        const ariaLive = current.getAttribute('aria-live');

        if (role === 'status' || role === 'alert' || role === 'log' || role === 'marquee' || role === 'timer') {
            return true;
        }

        if (ariaLive === 'polite' || ariaLive === 'assertive') {
            return true;
        }

        current = current.parentElement;
    }

    return false;
}

/**
 * Get the role and aria-live values for an element
 */
function getLiveRegionInfo(element: Element): { role: string | null; ariaLive: string | null } {
    return {
        role: element.getAttribute('role'),
        ariaLive: element.getAttribute('aria-live')
    };
}

/**
 * Find form error containers that lack live region attributes
 */
function findFormErrorContainers(): StatusElement[] {
    const results: StatusElement[] = [];

    // Selectors for common form error patterns
    const errorSelectors = [
        '[class*="error-message"]',
        '[class*="error_message"]',
        '[class*="errorMessage"]',
        '[class*="form-error"]',
        '[class*="form_error"]',
        '[class*="formError"]',
        '[class*="field-error"]',
        '[class*="field_error"]',
        '[class*="fieldError"]',
        '[class*="validation-error"]',
        '[class*="validation_error"]',
        '[class*="validationError"]',
        '[class*="invalid-feedback"]',
        '[class*="invalid_feedback"]',
        '[class*="invalidFeedback"]',
        '[class*="form-feedback"]',
        '[class*="help-block"][class*="error"]',
        '[role="alert"]',
        '[aria-invalid="true"] ~ [class*="error"]',
        '[aria-invalid="true"] ~ [class*="message"]',
    ];

    const elements = document.querySelectorAll(errorSelectors.join(', '));

    for (const element of elements) {
        // Skip elements that already have proper live region setup
        if (hasLiveRegionAncestor(element)) continue;

        const { role, ariaLive } = getLiveRegionInfo(element);

        results.push({
            element,
            selector: getSelector(element),
            html: getHtmlSnippet(element),
            statusType: 'form-error',
            hasLiveRegion: false,
            currentRole: role,
            currentAriaLive: ariaLive
        });
    }

    // Also check for elements with aria-errormessage references
    const elementsWithAriaErrorMessage = document.querySelectorAll('[aria-errormessage]');
    for (const element of elementsWithAriaErrorMessage) {
        const errorId = element.getAttribute('aria-errormessage');
        if (!errorId) continue;

        const errorElement = document.getElementById(errorId);
        if (!errorElement) continue;
        if (hasLiveRegionAncestor(errorElement)) continue;

        const { role, ariaLive } = getLiveRegionInfo(errorElement);

        // Avoid duplicates
        if (results.some(r => r.element === errorElement)) continue;

        results.push({
            element: errorElement,
            selector: getSelector(errorElement),
            html: getHtmlSnippet(errorElement),
            statusType: 'form-error',
            hasLiveRegion: false,
            currentRole: role,
            currentAriaLive: ariaLive
        });
    }

    return results;
}

/**
 * Find loading/spinner elements that lack live region attributes
 */
function findLoadingIndicators(): StatusElement[] {
    const results: StatusElement[] = [];

    const loadingSelectors = [
        '[class*="loading"]',
        '[class*="spinner"]',
        '[class*="loader"]',
        '[class*="progress"]',
        '[class*="skeleton"]',
        '[class*="shimmer"]',
        '[class*="busy"]',
        '[aria-busy="true"]',
        '[role="progressbar"]',
    ];

    const elements = document.querySelectorAll(loadingSelectors.join(', '));

    for (const element of elements) {
        // Elements with role="progressbar" already have implicit live semantics
        const role = element.getAttribute('role');
        if (role === 'progressbar') continue;

        // Skip elements that already have proper live region setup
        if (hasLiveRegionAncestor(element)) continue;

        const { role: currentRole, ariaLive } = getLiveRegionInfo(element);

        // For aria-busy elements, check that the container has a live region
        if (element.hasAttribute('aria-busy') && hasLiveRegionAncestor(element)) continue;

        results.push({
            element,
            selector: getSelector(element),
            html: getHtmlSnippet(element),
            statusType: 'loading-indicator',
            hasLiveRegion: false,
            currentRole: currentRole,
            currentAriaLive: ariaLive
        });
    }

    return results;
}

/**
 * Find toast/notification containers that lack live region attributes
 */
function findToastNotifications(): StatusElement[] {
    const results: StatusElement[] = [];

    const toastSelectors = [
        '[class*="toast"]',
        '[class*="notification"]',
        '[class*="snackbar"]',
        '[class*="flash-message"]',
        '[class*="flash_message"]',
        '[class*="flashMessage"]',
        '[class*="alert-banner"]',
        '[class*="alert_banner"]',
        '[class*="alertBanner"]',
        '[class*="announce"]',
        '[class*="message-bar"]',
        '[class*="message_bar"]',
        '[class*="messageBar"]',
        '[data-toast]',
        '[data-notification]',
        '[data-snackbar]',
    ];

    const elements = document.querySelectorAll(toastSelectors.join(', '));

    for (const element of elements) {
        // Skip elements that already have proper live region setup
        if (hasLiveRegionAncestor(element)) continue;

        const { role, ariaLive } = getLiveRegionInfo(element);

        results.push({
            element,
            selector: getSelector(element),
            html: getHtmlSnippet(element),
            statusType: 'toast-notification',
            hasLiveRegion: false,
            currentRole: role,
            currentAriaLive: ariaLive
        });
    }

    return results;
}

/**
 * Find counter/badge elements that may update dynamically but lack live region attributes
 */
function findCounterBadges(): StatusElement[] {
    const results: StatusElement[] = [];

    const counterSelectors = [
        '[class*="badge"]',
        '[class*="counter"]',
        '[class*="count"]',
        '[class*="indicator"]',
        '[class*="unread"]',
        '[class*="cart-count"]',
        '[class*="cart_count"]',
        '[class*="cartCount"]',
        '[class*="notification-count"]',
        '[class*="notification_count"]',
        '[class*="notificationCount"]',
        '[data-count]',
        '[data-badge]',
    ];

    const elements = document.querySelectorAll(counterSelectors.join(', '));

    for (const element of elements) {
        // Skip elements that already have proper live region setup
        if (hasLiveRegionAncestor(element)) continue;

        // Only flag elements that look like they contain dynamic numeric content
        const text = element.textContent?.trim() || '';
        const containsNumber = /\d/.test(text);
        const isSmallElement = text.length < 10;

        // Counters/badges are typically small and contain numbers
        if (!containsNumber || !isSmallElement) continue;

        const { role, ariaLive } = getLiveRegionInfo(element);

        results.push({
            element,
            selector: getSelector(element),
            html: getHtmlSnippet(element),
            statusType: 'counter-badge',
            hasLiveRegion: false,
            currentRole: role,
            currentAriaLive: ariaLive
        });
    }

    return results;
}

/**
 * Get a recommended fix description for a given status type
 */
function getRecommendation(statusType: StatusType): string {
    switch (statusType) {
        case 'form-error':
            return 'Add role="alert" or aria-live="assertive" to the error container so screen readers announce validation errors immediately';
        case 'loading-indicator':
            return 'Add role="status" or aria-live="polite" to the loading container so screen readers announce loading state changes';
        case 'toast-notification':
            return 'Add role="status" with aria-live="polite" for informational toasts, or role="alert" with aria-live="assertive" for urgent notifications';
        case 'counter-badge':
            return 'Add aria-live="polite" to the counter element so screen readers announce count changes without interrupting the user';
    }
}

/**
 * Get the impact level for a given status type
 */
function getImpact(statusType: StatusType): 'critical' | 'serious' | 'moderate' | 'minor' {
    switch (statusType) {
        case 'form-error':
            return 'serious';
        case 'loading-indicator':
            return 'moderate';
        case 'toast-notification':
            return 'serious';
        case 'counter-badge':
            return 'minor';
    }
}

/**
 * Run status messages check
 */
export function checkStatusMessages(): StatusMessageViolation[] {
    const violations: StatusMessageViolation[] = [];

    // Check form error containers
    const formErrors = findFormErrorContainers();
    for (const item of formErrors) {
        if (!isElementVisible(item.element)) continue;

        violations.push({
            id: 'status-messages',
            criterion: '4.1.3 Status Messages',
            level: 'AA',
            element: item.element.tagName.toLowerCase(),
            selector: item.selector,
            html: item.html,
            impact: getImpact(item.statusType),
            description: `Form error container lacks live region role: ${getRecommendation(item.statusType)}`,
            details: {
                statusType: item.statusType,
                hasLiveRegion: false,
                currentRole: item.currentRole,
                currentAriaLive: item.currentAriaLive,
                recommendation: getRecommendation(item.statusType)
            }
        });
    }

    // Check loading indicators
    const loadingIndicators = findLoadingIndicators();
    for (const item of loadingIndicators) {
        if (!isElementVisible(item.element)) continue;

        violations.push({
            id: 'status-messages',
            criterion: '4.1.3 Status Messages',
            level: 'AA',
            element: item.element.tagName.toLowerCase(),
            selector: item.selector,
            html: item.html,
            impact: getImpact(item.statusType),
            description: `Loading indicator lacks live region role: ${getRecommendation(item.statusType)}`,
            details: {
                statusType: item.statusType,
                hasLiveRegion: false,
                currentRole: item.currentRole,
                currentAriaLive: item.currentAriaLive,
                recommendation: getRecommendation(item.statusType)
            }
        });
    }

    // Check toast/notification containers
    const toasts = findToastNotifications();
    for (const item of toasts) {
        if (!isElementVisible(item.element)) continue;

        violations.push({
            id: 'status-messages',
            criterion: '4.1.3 Status Messages',
            level: 'AA',
            element: item.element.tagName.toLowerCase(),
            selector: item.selector,
            html: item.html,
            impact: getImpact(item.statusType),
            description: `Toast/notification container lacks live region role: ${getRecommendation(item.statusType)}`,
            details: {
                statusType: item.statusType,
                hasLiveRegion: false,
                currentRole: item.currentRole,
                currentAriaLive: item.currentAriaLive,
                recommendation: getRecommendation(item.statusType)
            }
        });
    }

    // Check counter/badge elements
    const counters = findCounterBadges();
    for (const item of counters) {
        if (!isElementVisible(item.element)) continue;

        violations.push({
            id: 'status-messages',
            criterion: '4.1.3 Status Messages',
            level: 'AA',
            element: item.element.tagName.toLowerCase(),
            selector: item.selector,
            html: item.html,
            impact: getImpact(item.statusType),
            description: `Counter/badge element lacks live region attribute: ${getRecommendation(item.statusType)}`,
            details: {
                statusType: item.statusType,
                hasLiveRegion: false,
                currentRole: item.currentRole,
                currentAriaLive: item.currentAriaLive,
                recommendation: getRecommendation(item.statusType)
            }
        });
    }

    return violations;
}

/**
 * Get information about status message elements on the page
 */
export function getStatusMessageInfo(): Array<{
    statusType: StatusType;
    selector: string;
    hasLiveRegion: boolean;
    currentRole: string | null;
    currentAriaLive: string | null;
    recommendation: string;
}> {
    const results: Array<{
        statusType: StatusType;
        selector: string;
        hasLiveRegion: boolean;
        currentRole: string | null;
        currentAriaLive: string | null;
        recommendation: string;
    }> = [];

    const allItems = [
        ...findFormErrorContainers(),
        ...findLoadingIndicators(),
        ...findToastNotifications(),
        ...findCounterBadges()
    ];

    for (const item of allItems) {
        if (!isElementVisible(item.element)) continue;

        results.push({
            statusType: item.statusType,
            selector: item.selector,
            hasLiveRegion: item.hasLiveRegion,
            currentRole: item.currentRole,
            currentAriaLive: item.currentAriaLive,
            recommendation: getRecommendation(item.statusType)
        });
    }

    // Also find elements that DO have proper live regions (for completeness)
    const liveRegionSelectors = [
        '[role="status"]',
        '[role="alert"]',
        '[role="log"]',
        '[aria-live="polite"]',
        '[aria-live="assertive"]',
    ];

    const properElements = document.querySelectorAll(liveRegionSelectors.join(', '));
    for (const element of properElements) {
        if (!isElementVisible(element)) continue;

        const selector = getSelector(element);
        // Avoid duplicates
        if (results.some(r => r.selector === selector)) continue;

        const role = element.getAttribute('role');
        const ariaLive = element.getAttribute('aria-live');

        let statusType: StatusType = 'toast-notification';
        const className = element.className?.toString().toLowerCase() || '';
        if (/error|invalid|validation/.test(className)) {
            statusType = 'form-error';
        } else if (/loading|spinner|loader|progress/.test(className)) {
            statusType = 'loading-indicator';
        } else if (/badge|counter|count/.test(className)) {
            statusType = 'counter-badge';
        }

        results.push({
            statusType,
            selector,
            hasLiveRegion: true,
            currentRole: role,
            currentAriaLive: ariaLive,
            recommendation: 'Element already has proper live region attributes'
        });
    }

    return results;
}
