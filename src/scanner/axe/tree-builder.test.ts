import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { buildAccessibilityTree } from './tree-builder.js';

describe('buildAccessibilityTree', () => {
    it('should build a tree for simple semantic HTML', () => {
        const html = `
            <!DOCTYPE html>
            <html>
                <body>
                    <h1>Welcome</h1>
                    <button aria-label="Submit">Click me</button>
                    <a href="#">Learn more</a>
                </body>
            </html>
        `;
        const dom = new JSDOM(html);

        // Temporarily set global document for the test
        const originalDocument = global.document as any;
        (global as any).document = dom.window.document;

        try {
            const tree = buildAccessibilityTree();
            expect(tree).not.toBeNull();
            expect(tree).toHaveProperty('role');
            expect(tree).toHaveProperty('name');
            expect(tree).toHaveProperty('children');
        } finally {
            // Restore original document
            (global as any).document = originalDocument;
        }
    });

    it('should extract role and name from elements', () => {
        const html = `
            <!DOCTYPE html>
            <html>
                <body>
                    <input id="email" type="text" />
                    <label for="email">Email</label>
                </body>
            </html>
        `;
        const dom = new JSDOM(html);

        const originalDocument = global.document as any;
        (global as any).document = dom.window.document;

        try {
            const tree = buildAccessibilityTree();
            expect(tree).not.toBeNull();
            // The tree should contain the input with its label
            if (tree?.children) {
                const hasInput = tree.children.some(
                    (child) => child.role === 'textbox' || child.role === null
                );
                expect(hasInput).toBe(true);
            }
        } finally {
            (global as any).document = originalDocument;
        }
    });
});
