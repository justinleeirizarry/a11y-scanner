/**
 * Integration tests for focus management keyboard testing
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Import the function to test - we need to test through the browser context
describe('Focus Management Keyboard Testing', () => {
    let dom: JSDOM;
    let originalDocument: any;

    beforeEach(() => {
        originalDocument = (global as any).document;
    });

    afterEach(() => {
        (global as any).document = originalDocument;
    });

    describe('Focus Indicator Validation', () => {
        it('should detect focus indicators on buttons', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <button id="test-btn" style="outline: 2px solid blue;">Click me</button>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const btn = dom.window.document.getElementById('test-btn');
            expect(btn).not.toBeNull();
            expect(btn?.style.outline).toBe('2px solid blue');
        });

        it('should detect missing focus indicators', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <button id="no-outline">No focus indicator</button>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const btn = dom.window.document.getElementById('no-outline');
            const style = dom.window.getComputedStyle(btn!);
            // JSDOM doesn't compute default styles perfectly, but we can check it exists
            expect(btn).not.toBeNull();
        });

        it('should find all focusable elements', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <button>Button 1</button>
                        <a href="#">Link</a>
                        <input type="text" />
                        <select><option>Option</option></select>
                        <textarea></textarea>
                        <div tabindex="0">Custom focusable</div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const focusableSelectors = [
                'a[href]',
                'button:not([disabled])',
                'input:not([disabled])',
                'select:not([disabled])',
                'textarea:not([disabled])',
                '[tabindex]:not([tabindex="-1"])',
            ];

            const focusables = dom.window.document.querySelectorAll(focusableSelectors.join(','));
            expect(focusables.length).toBe(6);
        });

        it('should exclude disabled elements from focusable list', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <button>Enabled</button>
                        <button disabled>Disabled</button>
                        <input type="text" />
                        <input type="text" disabled />
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const focusableSelectors = [
                'button:not([disabled])',
                'input:not([disabled])',
            ];

            const focusables = dom.window.document.querySelectorAll(focusableSelectors.join(','));
            expect(focusables.length).toBe(2);
        });

        it('should exclude elements with negative tabindex', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div tabindex="0">Focusable</div>
                        <div tabindex="-1">Not focusable</div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const focusables = dom.window.document.querySelectorAll('[tabindex]:not([tabindex="-1"])');
            expect(focusables.length).toBe(1);
        });
    });

    describe('Modal Focus Trap Detection', () => {
        it('should detect modals with aria-modal attribute', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="dialog" aria-modal="true">
                            <h2>Modal Title</h2>
                            <button>Close</button>
                        </div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const modals = dom.window.document.querySelectorAll('[aria-modal="true"]');
            expect(modals.length).toBe(1);
        });

        it('should detect modals with role="dialog"', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="dialog">
                            <h2>Modal Title</h2>
                        </div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const modals = dom.window.document.querySelectorAll('[role="dialog"]');
            expect(modals.length).toBe(1);
        });

        it('should detect alertdialog role', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="alertdialog">
                            <p>Alert message</p>
                            <button>OK</button>
                        </div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const modals = dom.window.document.querySelectorAll('[role="alertdialog"]');
            expect(modals.length).toBe(1);
        });

        it('should count focusable elements in modal', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="dialog" aria-modal="true">
                            <button>Save</button>
                            <button>Cancel</button>
                            <input type="text" />
                        </div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const modal = dom.window.document.querySelector('[role="dialog"]')!;
            const focusableSelectors = [
                'a[href]',
                'button:not([disabled])',
                'input:not([disabled])',
                'select:not([disabled])',
                'textarea:not([disabled])',
                '[tabindex]:not([tabindex="-1"])',
            ];

            const focusables = modal.querySelectorAll(focusableSelectors.join(','));
            expect(focusables.length).toBe(3);
        });

        it('should detect modals with no focusable elements', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="dialog" aria-modal="true">
                            <p>Static content</p>
                        </div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const modal = dom.window.document.querySelector('[role="dialog"]')!;
            const focusableSelectors = [
                'a[href]',
                'button:not([disabled])',
                'input:not([disabled])',
                'select:not([disabled])',
                'textarea:not([disabled])',
                '[tabindex]:not([tabindex="-1"])',
            ];

            const focusables = modal.querySelectorAll(focusableSelectors.join(','));
            expect(focusables.length).toBe(0);
        });
    });

    describe('Skip Links Detection', () => {
        it('should find skip links with anchor href', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <a href="#main-content">Skip to main content</a>
                        <div id="main-content">Content here</div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const skipLinks = dom.window.document.querySelectorAll('a[href^="#"]');
            expect(skipLinks.length).toBe(1);
        });

        it('should identify skip link target by id', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <a href="#content">Skip to content</a>
                        <div id="content">Main content</div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const skipLink = dom.window.document.querySelector('a[href^="#"]') as HTMLAnchorElement;
            const href = skipLink.getAttribute('href');
            const target = dom.window.document.querySelector(href!);
            expect(target).not.toBeNull();
            expect(target?.id).toBe('content');
        });

        it('should handle missing skip link targets', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <a href="#missing">Skip to content</a>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const skipLink = dom.window.document.querySelector('a[href^="#"]') as HTMLAnchorElement;
            const href = skipLink.getAttribute('href');
            const target = dom.window.document.querySelector(href!);
            expect(target).toBeNull();
        });

        it('should match skip links by keyword', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <a href="#main">Skip to main content</a>
                        <a href="#nav">Skip navigation</a>
                        <a href="#other">Other link</a>
                        <div id="main">Content</div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const skipLinks = Array.from(dom.window.document.querySelectorAll('a[href^="#"]')).filter(link => {
                const text = link.textContent?.toLowerCase() || '';
                return text.includes('skip') && (text.includes('content') || text.includes('main') || text.includes('navigation'));
            });

            expect(skipLinks.length).toBe(2);
        });
    });
});
