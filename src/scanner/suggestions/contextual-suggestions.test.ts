import { describe, it, expect } from 'vitest';
import {
    generateContextualFix,
    hasContextualSupport,
} from './contextual-suggestions.js';

describe('contextual-suggestions', () => {
    describe('hasContextualSupport', () => {
        it('returns true for supported violations', () => {
            expect(hasContextualSupport('button-name')).toBe(true);
            expect(hasContextualSupport('link-name')).toBe(true);
            expect(hasContextualSupport('image-alt')).toBe(true);
            expect(hasContextualSupport('label')).toBe(true);
            expect(hasContextualSupport('color-contrast')).toBe(true);
            expect(hasContextualSupport('aria-required-attr')).toBe(true);
        });

        it('returns false for unsupported violations', () => {
            expect(hasContextualSupport('unknown-rule')).toBe(false);
            expect(hasContextualSupport('some-new-rule')).toBe(false);
        });
    });

    describe('generateContextualFix', () => {
        describe('button-name', () => {
            it('generates fix for icon button', () => {
                const node = {
                    html: '<button class="close-btn"><svg></svg></button>',
                    htmlSnippet: '<button class="close-btn"><svg>...</svg></button>',
                };

                const fix = generateContextualFix('button-name', node);

                expect(fix).not.toBeNull();
                expect(fix?.current).toContain('close-btn');
                expect(fix?.issue).toContain('accessible name');
                expect(fix?.suggestion).toContain('aria-label');
                expect(fix?.inferredLabel).toBe('Close');
                expect(fix?.fixed).toContain('aria-label="Close"');
            });

            it('generates fix for menu button', () => {
                const node = {
                    html: '<button class="menu-toggle"><svg></svg></button>',
                    htmlSnippet: '<button class="menu-toggle"><svg>...</svg></button>',
                };

                const fix = generateContextualFix('button-name', node);

                expect(fix?.inferredLabel).toBe('Menu');
                expect(fix?.fixed).toContain('aria-label="Menu"');
            });
        });

        describe('link-name', () => {
            it('generates fix for icon link', () => {
                const node = {
                    html: '<a href="/profile" class="profile-link"><svg></svg></a>',
                    htmlSnippet: '<a href="/profile" class="profile-link"><svg>...</svg></a>',
                };

                const fix = generateContextualFix('link-name', node);

                expect(fix).not.toBeNull();
                expect(fix?.issue).toContain('accessible name');
                expect(fix?.suggestion).toContain('aria-label');
                expect(fix?.inferredLabel).toBe('Profile');
            });

            it('infers label from href path', () => {
                const node = {
                    html: '<a href="/settings"><svg></svg></a>',
                    htmlSnippet: '<a href="/settings"><svg>...</svg></a>',
                };

                const fix = generateContextualFix('link-name', node);

                // inferLabel extracts from path, returns lowercase
                expect(fix?.inferredLabel).toBe('settings');
            });
        });

        describe('image-alt', () => {
            it('generates fix for content image', () => {
                const node = {
                    html: '<img src="/images/team-photo.jpg" />',
                    htmlSnippet: '<img src="/images/team-photo.jpg" />',
                };

                const fix = generateContextualFix('image-alt', node);

                expect(fix).not.toBeNull();
                expect(fix?.issue).toContain('alt attribute');
                expect(fix?.suggestion).toContain('alt=');
                expect(fix?.inferredLabel).toContain('team');
            });

            it('suggests empty alt for decorative images', () => {
                const node = {
                    html: '<img src="/images/bg.jpg" class="decoration" />',
                    htmlSnippet: '<img src="/images/bg.jpg" class="decoration" />',
                };

                const fix = generateContextualFix('image-alt', node);

                expect(fix?.suggestion).toContain('alt=""');
                expect(fix?.fixed).toContain('alt=""');
                expect(fix?.inferredLabel).toBeUndefined();
            });
        });

        describe('label', () => {
            it('generates fix for text input', () => {
                const node = {
                    html: '<input type="text" id="username" />',
                    htmlSnippet: '<input type="text" id="username" />',
                };

                const fix = generateContextualFix('label', node);

                expect(fix).not.toBeNull();
                expect(fix?.issue).toContain('label');
                expect(fix?.suggestion).toContain('aria-label');
                expect(fix?.reactSuggestion).toContain('<label');
            });

            it('uses placeholder as hint', () => {
                const node = {
                    html: '<input type="email" placeholder="Enter your email" />',
                    htmlSnippet: '<input type="email" placeholder="Enter your email" />',
                };

                const fix = generateContextualFix('label', node);

                expect(fix?.inferredLabel).toBe('Enter your email');
            });

            it('uses input type for default label', () => {
                const node = {
                    html: '<input type="password" />',
                    htmlSnippet: '<input type="password" />',
                };

                const fix = generateContextualFix('label', node);

                expect(fix?.inferredLabel).toBe('Password');
            });
        });

        describe('color-contrast', () => {
            it('extracts contrast ratio from failure summary', () => {
                const node = {
                    html: '<span style="color: #777">Low contrast text</span>',
                    htmlSnippet: '<span style="color: #777">Low contrast text</span>',
                    failureSummary: 'Element has insufficient color contrast of 2.5:1',
                };

                const fix = generateContextualFix('color-contrast', node);

                expect(fix).not.toBeNull();
                expect(fix?.issue).toContain('2.5:1');
                expect(fix?.issue).toContain('4.5:1');
            });
        });

        describe('aria-required-attr', () => {
            it('identifies missing aria attributes', () => {
                const node = {
                    html: '<div role="checkbox"></div>',
                    htmlSnippet: '<div role="checkbox"></div>',
                    checks: {
                        all: [
                            { id: 'aria-required-attr', message: 'Required aria-checked attribute not present' },
                        ],
                    },
                };

                const fix = generateContextualFix('aria-required-attr', node);

                expect(fix).not.toBeNull();
                expect(fix?.issue).toContain('checkbox');
                expect(fix?.issue).toContain('aria-checked');
            });
        });

        describe('duplicate-id', () => {
            it('identifies duplicate id', () => {
                const node = {
                    html: '<div id="main-content">Content</div>',
                    htmlSnippet: '<div id="main-content">Content</div>',
                };

                const fix = generateContextualFix('duplicate-id', node);

                expect(fix).not.toBeNull();
                expect(fix?.issue).toContain('main-content');
                expect(fix?.suggestion).toContain('unique');
            });
        });

        describe('landmark violations', () => {
            it('generates fix for landmark-one-main', () => {
                const node = {
                    html: '<body><div>Content</div></body>',
                    htmlSnippet: '<body><div>Content</div></body>',
                };

                const fix = generateContextualFix('landmark-one-main', node);

                expect(fix).not.toBeNull();
                expect(fix?.suggestion).toContain('<main>');
            });

            it('generates fix for region', () => {
                const node = {
                    html: '<div>Orphan content</div>',
                    htmlSnippet: '<div>Orphan content</div>',
                };

                const fix = generateContextualFix('region', node);

                expect(fix).not.toBeNull();
                expect(fix?.suggestion).toContain('semantic');
            });
        });

        describe('fallback behavior', () => {
            it('returns generic fix for unknown violations', () => {
                const node = {
                    html: '<div>Some element</div>',
                    htmlSnippet: '<div>Some element</div>',
                    failureSummary: 'Some specific failure',
                };

                const fix = generateContextualFix('unknown-rule', node);

                expect(fix).not.toBeNull();
                expect(fix?.current).toBe('<div>Some element</div>');
                expect(fix?.issue).toBe('Some specific failure');
                expect(fix?.suggestion).toContain('axe-core documentation');
            });

            it('returns null for unparseable HTML', () => {
                const node = {
                    html: 'not valid html at all',
                    htmlSnippet: 'not valid html at all',
                };

                const fix = generateContextualFix('button-name', node);

                expect(fix).toBeNull();
            });
        });
    });
});
