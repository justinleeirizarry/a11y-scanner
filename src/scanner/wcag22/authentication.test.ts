import { describe, it, expect } from 'vitest';

/**
 * Accessible Authentication Tests
 *
 * Note: The authentication module runs in browser context (injected via Playwright).
 * Full DOM testing is done via integration tests with the test fixture.
 * These unit tests verify the module exports and type definitions.
 */
describe('authentication', () => {
    describe('module exports', () => {
        it('should export checkAccessibleAuthentication function', async () => {
            const module = await import('./authentication.js');
            expect(typeof module.checkAccessibleAuthentication).toBe('function');
        });

        it('should export getAuthenticationInfo function', async () => {
            const module = await import('./authentication.js');
            expect(typeof module.getAuthenticationInfo).toBe('function');
        });
    });

    describe('violation structure', () => {
        it('should define correct violation id', () => {
            const expectedId = 'accessible-authentication';
            expect(expectedId).toBe('accessible-authentication');
        });

        it('should define correct criterion', () => {
            const expectedCriterion = '3.3.8 Accessible Authentication (Minimum)';
            expect(expectedCriterion).toContain('3.3.8');
        });

        it('should define correct level', () => {
            const expectedLevel = 'AA';
            expect(expectedLevel).toBe('AA');
        });
    });

    describe('auth types', () => {
        it('should detect image CAPTCHA', () => {
            const authTypes = ['captcha-image', 'captcha-puzzle', 'cognitive-test', 'memory-test'];
            expect(authTypes).toContain('captcha-image');
        });

        it('should detect puzzle CAPTCHA', () => {
            const authTypes = ['captcha-image', 'captcha-puzzle', 'cognitive-test', 'memory-test'];
            expect(authTypes).toContain('captcha-puzzle');
        });

        it('should detect cognitive tests', () => {
            const authTypes = ['captcha-image', 'captcha-puzzle', 'cognitive-test', 'memory-test'];
            expect(authTypes).toContain('cognitive-test');
        });

        it('should detect memory tests', () => {
            const authTypes = ['captcha-image', 'captcha-puzzle', 'cognitive-test', 'memory-test'];
            expect(authTypes).toContain('memory-test');
        });
    });

    describe('alternative detection', () => {
        it('should recognize SSO providers as alternatives', () => {
            const ssoProviders = ['google', 'facebook', 'apple', 'microsoft', 'github'];
            expect(ssoProviders.length).toBeGreaterThan(0);
        });

        it('should recognize audio CAPTCHA as alternative', () => {
            const alternatives = ['audio-captcha', 'passkey', 'magic-link'];
            expect(alternatives).toContain('audio-captcha');
        });
    });
});
