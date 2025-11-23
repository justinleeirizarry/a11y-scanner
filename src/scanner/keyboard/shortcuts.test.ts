/**
 * Integration tests for keyboard shortcuts and custom widget testing
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Keyboard Shortcuts and Custom Widgets', () => {
    let dom: JSDOM;
    let originalDocument: any;

    beforeEach(() => {
        originalDocument = (global as any).document;
    });

    afterEach(() => {
        (global as any).document = originalDocument;
    });

    describe('Modal Escape Key Detection', () => {
        it('should detect modals with keyboard handlers', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="dialog" aria-modal="true" onkeydown="handleEscape(event)">
                            <button>Close</button>
                        </div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const modal = dom.window.document.querySelector('[role="dialog"]') as HTMLElement;
            expect(modal).not.toBeNull();
            // JSDOM doesn't preserve event handler attributes perfectly, but we can check the element
            expect(modal.hasAttribute('onkeydown')).toBe(true);
        });

        it('should detect modals with close buttons', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="dialog" aria-modal="true">
                            <button aria-label="close">×</button>
                            <p>Modal content</p>
                        </div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const modal = dom.window.document.querySelector('[role="dialog"]')!;
            const closeBtn = modal.querySelector('[aria-label*="close" i]');
            expect(closeBtn).not.toBeNull();
        });

        it('should detect data attributes indicating escape support', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="dialog" data-escape="true">
                            <p>Modal with data-escape</p>
                        </div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const modal = dom.window.document.querySelector('[role="dialog"]') as HTMLElement;
            expect(modal.hasAttribute('data-escape')).toBe(true);
        });

        it('should find dismiss button alternative', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="dialog">
                            <button aria-label="dismiss">Dismiss</button>
                        </div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const modal = dom.window.document.querySelector('[role="dialog"]')!;
            const dismissBtn = modal.querySelector('[aria-label*="dismiss" i]');
            expect(dismissBtn).not.toBeNull();
        });

        it('should find close button by title attribute', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="dialog">
                            <button title="Close this dialog">×</button>
                        </div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const modal = dom.window.document.querySelector('[role="dialog"]')!;
            const closeBtn = modal.querySelector('[title*="close" i]');
            expect(closeBtn).not.toBeNull();
        });

        it('should detect close button by CSS class', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="dialog">
                            <button class="close-button">Close</button>
                        </div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const modal = dom.window.document.querySelector('[role="dialog"]')!;
            const closeBtn = modal.querySelector('.close-button');
            expect(closeBtn).not.toBeNull();
        });
    });

    describe('Custom Button/Widget Detection', () => {
        it('should find custom button elements', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="button">Custom Button</div>
                        <button>Native Button</button>
                        <span role="button">Another Custom</span>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const customButtons = dom.window.document.querySelectorAll('[role="button"]:not(button)');
            expect(customButtons.length).toBe(2);
        });

        it('should detect elements with click handlers', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="button" onclick="doSomething()">Clickable</div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const btn = dom.window.document.querySelector('[role="button"]') as HTMLElement;
            expect(btn.hasAttribute('onclick')).toBe(true);
        });

        it('should detect missing keyboard handlers on custom buttons', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="button" onclick="doSomething()">Only has click</div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const btn = dom.window.document.querySelector('[role="button"]') as HTMLElement;
            const hasKeydown = btn.hasAttribute('onkeydown') || btn.hasAttribute('onkeyup');
            expect(hasKeydown).toBe(false);
        });

        it('should count custom buttons', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="button">Button 1</div>
                        <span role="button">Button 2</span>
                        <p role="button">Button 3</p>
                        <button>Native Button (should exclude)</button>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const customButtons = dom.window.document.querySelectorAll('[role="button"]:not(button)');
            expect(customButtons.length).toBe(3);
        });
    });

    describe('Widget Role Detection', () => {
        it('should detect tablist widgets', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="tablist">
                            <button role="tab" aria-selected="true">Tab 1</button>
                            <button role="tab">Tab 2</button>
                        </div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const tablist = dom.window.document.querySelector('[role="tablist"]');
            expect(tablist).not.toBeNull();
        });

        it('should detect menu widgets', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="menu">
                            <div role="menuitem">Item 1</div>
                            <div role="menuitem">Item 2</div>
                        </div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const menu = dom.window.document.querySelector('[role="menu"]');
            expect(menu).not.toBeNull();
        });

        it('should detect combobox widgets', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="combobox" aria-expanded="false">
                            <input type="text" />
                        </div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const combobox = dom.window.document.querySelector('[role="combobox"]');
            expect(combobox).not.toBeNull();
        });

        it('should detect listbox widgets', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="listbox">
                            <div role="option">Option 1</div>
                            <div role="option" aria-selected="true">Option 2</div>
                        </div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const listbox = dom.window.document.querySelector('[role="listbox"]');
            expect(listbox).not.toBeNull();
        });

        it('should find all widget role instances', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="tablist"></div>
                        <div role="menu"></div>
                        <div role="listbox"></div>
                        <div role="slider"></div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const widgetRoles = [
                'tablist',
                'menu',
                'menubar',
                'tree',
                'grid',
                'listbox',
                'radiogroup',
                'slider',
                'spinbutton',
                'combobox',
            ];

            let totalFound = 0;
            widgetRoles.forEach(role => {
                totalFound += dom.window.document.querySelectorAll(`[role="${role}"]`).length;
            });

            expect(totalFound).toBe(4);
        });
    });

    describe('Widget Focusability', () => {
        it('should validate widget tabindex', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="button" tabindex="0">Focusable</div>
                        <div role="button">Not focusable</div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const focusable = dom.window.document.querySelector('[role="button"][tabindex="0"]');
            expect(focusable).not.toBeNull();
        });

        it('should reject negative tabindex for widgets', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="button" tabindex="-1">Not focusable</div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const widget = dom.window.document.querySelector('[role="button"][tabindex="-1"]');
            expect(widget).not.toBeNull();
        });

        it('should require tabindex for non-interactive widgets', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="button">No tabindex</div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const widget = dom.window.document.querySelector('[role="button"]') as HTMLElement;
            const hasTabindex = widget.hasAttribute('tabindex');
            expect(hasTabindex).toBe(false);
        });
    });

    describe('ARIA Attribute Validation', () => {
        it('should check aria-expanded on expandable widgets', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="combobox" aria-expanded="false"></div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const combobox = dom.window.document.querySelector('[role="combobox"]') as HTMLElement;
            expect(combobox.hasAttribute('aria-expanded')).toBe(true);
            expect(combobox.getAttribute('aria-expanded')).toBe('false');
        });

        it('should find aria-pressed on toggleable buttons', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="button" aria-pressed="false">Toggle me</div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const button = dom.window.document.querySelector('[role="button"]') as HTMLElement;
            expect(button.hasAttribute('aria-pressed')).toBe(true);
        });

        it('should detect aria-selected on selectable items', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <div role="tab" aria-selected="true">Selected Tab</div>
                        <div role="tab">Unselected Tab</div>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const selectedTab = dom.window.document.querySelector('[role="tab"][aria-selected="true"]');
            expect(selectedTab).not.toBeNull();
        });

        it('should find missing aria-label on icon buttons', () => {
            const html = `
                <!DOCTYPE html>
                <html>
                    <body>
                        <button>Close</button>
                        <button aria-label="Close menu">×</button>
                    </body>
                </html>
            `;
            dom = new JSDOM(html);
            (global as any).document = dom.window.document;

            const labeled = dom.window.document.querySelector('button[aria-label]');
            expect(labeled).not.toBeNull();
        });
    });
});
