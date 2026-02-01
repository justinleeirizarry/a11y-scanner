import { describe, it, expect } from 'vitest';
import {
    renderFix,
    renderViolationSummary,
    generateAIPrompt,
} from './fix-renderer.js';

describe('fix-renderer', () => {
    describe('renderFix', () => {
        it('renders a complete fix for button-name', () => {
            const node = {
                html: '<button class="close-btn"><svg></svg></button>',
                htmlSnippet: '<button class="close-btn"><svg>...</svg></button>',
                component: 'CloseButton',
                componentPath: ['App', 'Header', 'CloseButton'],
            };

            const rendered = renderFix('button-name', node);

            expect(rendered).not.toBeNull();
            expect(rendered?.componentName).toBe('CloseButton');
            expect(rendered?.before).toContain('close-btn');
            expect(rendered?.after).toContain('aria-label');
            expect(rendered?.issue).toContain('accessible name');
            expect(rendered?.beforeAfterText).toContain('Current:');
            expect(rendered?.beforeAfterText).toContain('Missing:');
        });

        it('includes React suggestion when enabled', () => {
            const node = {
                html: '<button class="submit-btn"></button>',
                htmlSnippet: '<button class="submit-btn"></button>',
            };

            const withReact = renderFix('button-name', node, { includeReact: true });
            const withoutReact = renderFix('button-name', node, { includeReact: false });

            expect(withReact?.reactVersion).toBeDefined();
            expect(withoutReact?.reactVersion).toBeUndefined();
        });

        it('extracts component name from path', () => {
            const node = {
                html: '<img src="photo.jpg" />',
                htmlSnippet: '<img src="photo.jpg" />',
                componentPath: ['App', 'Gallery', 'PhotoCard'],
            };

            const rendered = renderFix('image-alt', node);

            expect(rendered?.componentName).toBe('PhotoCard');
            expect(rendered?.componentPath).toBe('App > Gallery > PhotoCard');
        });

        it('truncates long lines', () => {
            const longHtml = '<button class="' + 'x'.repeat(100) + '"></button>';
            const node = {
                html: longHtml,
                htmlSnippet: longHtml,
            };

            const rendered = renderFix('button-name', node, { maxLineWidth: 50 });

            expect(rendered?.beforeAfterText).toContain('...');
        });

        it('returns null for unsupported elements', () => {
            const node = {
                html: 'not valid',
                htmlSnippet: 'not valid',
            };

            const rendered = renderFix('button-name', node);

            expect(rendered).toBeNull();
        });
    });

    describe('renderViolationSummary', () => {
        it('renders summary for multiple nodes', () => {
            const nodes = [
                {
                    html: '<button class="btn-1"></button>',
                    htmlSnippet: '<button class="btn-1"></button>',
                    component: 'Button1',
                },
                {
                    html: '<button class="btn-2"></button>',
                    htmlSnippet: '<button class="btn-2"></button>',
                    component: 'Button2',
                },
                {
                    html: '<button class="btn-3"></button>',
                    htmlSnippet: '<button class="btn-3"></button>',
                    component: 'Button3',
                },
            ];

            const summary = renderViolationSummary('button-name', nodes);

            expect(summary).toContain('Instance 1');
            expect(summary).toContain('Instance 2');
            expect(summary).toContain('Instance 3');
            expect(summary).toContain('Button1');
            expect(summary).toContain('Button2');
            expect(summary).toContain('Button3');
        });

        it('limits number of rendered nodes', () => {
            const nodes = Array(10).fill(null).map((_, i) => ({
                html: `<button class="btn-${i}"></button>`,
                htmlSnippet: `<button class="btn-${i}"></button>`,
                component: `Button${i}`,
            }));

            const summary = renderViolationSummary('button-name', nodes, { maxNodes: 2 });

            expect(summary).toContain('Instance 1');
            expect(summary).toContain('Instance 2');
            expect(summary).not.toContain('Instance 3');
            expect(summary).toContain('... and 8 more instance(s)');
        });

        it('handles empty nodes array', () => {
            const summary = renderViolationSummary('button-name', []);

            expect(summary).toBe('');
        });
    });

    describe('generateAIPrompt', () => {
        it('generates AI-ready prompt', () => {
            const node = {
                html: '<button class="close-btn"><svg></svg></button>',
                htmlSnippet: '<button class="close-btn"><svg>...</svg></button>',
                component: 'CloseButton',
                componentPath: ['App', 'Modal', 'CloseButton'],
            };

            const prompt = generateAIPrompt(
                'button-name',
                'Ensures buttons have discernible text',
                node
            );

            expect(prompt).toContain('## Fix: button-name in <CloseButton>');
            expect(prompt).toContain('**Component Path:** App > Modal > CloseButton');
            expect(prompt).toContain('### Current Code');
            expect(prompt).toContain('```html');
            expect(prompt).toContain('### Issue');
            expect(prompt).toContain('### Required Fix');
            expect(prompt).toContain('### Suggested Implementation');
            expect(prompt).toContain('### React/JSX Version');
        });

        it('includes WCAG reference when requested', () => {
            const node = {
                html: '<img src="photo.jpg" />',
                htmlSnippet: '<img src="photo.jpg" />',
            };

            const withRef = generateAIPrompt(
                'image-alt',
                'Images must have alternate text',
                node,
                { includeWcagRef: true }
            );

            const withoutRef = generateAIPrompt(
                'image-alt',
                'Images must have alternate text',
                node,
                { includeWcagRef: false }
            );

            expect(withRef).toContain('### WCAG Reference');
            expect(withRef).toContain('Images must have alternate text');
            expect(withoutRef).not.toContain('### WCAG Reference');
        });

        it('handles nodes without component info', () => {
            const node = {
                html: '<button></button>',
                htmlSnippet: '<button></button>',
            };

            const prompt = generateAIPrompt('button-name', 'Help text', node);

            expect(prompt).toContain('## Fix: button-name');
            expect(prompt).not.toContain('**Component Path:**');
        });

        it('returns empty string for unparseable HTML', () => {
            const node = {
                html: 'not valid',
                htmlSnippet: 'not valid',
            };

            const prompt = generateAIPrompt('button-name', 'Help text', node);

            expect(prompt).toBe('');
        });
    });
});
