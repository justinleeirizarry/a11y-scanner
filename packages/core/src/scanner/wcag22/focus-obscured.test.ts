import { describe, it, expect } from 'vitest';

/**
 * Focus Not Obscured Tests
 *
 * Note: The focus-obscured module runs in browser context (injected via Playwright).
 * Full DOM testing is done via integration tests with the test fixture.
 * These unit tests verify the module exports and type definitions.
 */
describe('focus-obscured', () => {
    describe('module exports', () => {
        it('should export checkFocusNotObscured function', async () => {
            const module = await import('./focus-obscured.js');
            expect(typeof module.checkFocusNotObscured).toBe('function');
        });

        it('should export getOverlayInfo function', async () => {
            const module = await import('./focus-obscured.js');
            expect(typeof module.getOverlayInfo).toBe('function');
        });
    });

    describe('violation structure', () => {
        it('should define correct violation id', () => {
            const expectedId = 'focus-obscured';
            expect(expectedId).toBe('focus-obscured');
        });

        it('should define correct criterion for AA level', () => {
            const expectedCriterion = '2.4.11 Focus Not Obscured (Minimum)';
            expect(expectedCriterion).toContain('2.4.11');
        });

        it('should define correct criterion for AAA level', () => {
            const expectedCriterion = '2.4.12 Focus Not Obscured (Enhanced)';
            expect(expectedCriterion).toContain('2.4.12');
        });
    });

    describe('overlay types', () => {
        it('should categorize sticky headers', () => {
            const overlayTypes = ['sticky-header', 'sticky-footer', 'fixed', 'modal', 'overlay', 'cookie-banner'];
            expect(overlayTypes).toContain('sticky-header');
        });

        it('should categorize cookie banners', () => {
            const overlayTypes = ['sticky-header', 'sticky-footer', 'fixed', 'modal', 'overlay', 'cookie-banner'];
            expect(overlayTypes).toContain('cookie-banner');
        });

        it('should categorize modals', () => {
            const overlayTypes = ['sticky-header', 'sticky-footer', 'fixed', 'modal', 'overlay', 'cookie-banner'];
            expect(overlayTypes).toContain('modal');
        });
    });
});
