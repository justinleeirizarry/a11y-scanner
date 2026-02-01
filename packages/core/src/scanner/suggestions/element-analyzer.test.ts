import { describe, it, expect } from 'vitest';
import {
    parseElement,
    inferLabel,
    describeWhatsMissing,
    getElementCategory,
} from './element-analyzer.js';

describe('element-analyzer', () => {
    describe('parseElement', () => {
        it('parses a simple button element', () => {
            const html = '<button class="close-btn">Close</button>';
            const result = parseElement(html);

            expect(result).not.toBeNull();
            expect(result?.tag).toBe('button');
            expect(result?.classes).toContain('close-btn');
            expect(result?.textContent).toBe('Close');
        });

        it('parses an element with multiple attributes', () => {
            const html = '<input type="email" id="email-input" placeholder="Enter email" aria-label="Email address" />';
            const result = parseElement(html);

            expect(result).not.toBeNull();
            expect(result?.tag).toBe('input');
            expect(result?.type).toBe('email');
            expect(result?.id).toBe('email-input');
            expect(result?.placeholder).toBe('Enter email');
            expect(result?.ariaLabel).toBe('Email address');
        });

        it('parses a link element with href', () => {
            const html = '<a href="/profile" class="nav-link">Profile</a>';
            const result = parseElement(html);

            expect(result).not.toBeNull();
            expect(result?.tag).toBe('a');
            expect(result?.href).toBe('/profile');
            expect(result?.textContent).toBe('Profile');
        });

        it('parses an image element', () => {
            const html = '<img src="/images/logo.png" class="logo" />';
            const result = parseElement(html);

            expect(result).not.toBeNull();
            expect(result?.tag).toBe('img');
            expect(result?.src).toBe('/images/logo.png');
            expect(result?.classes).toContain('logo');
        });

        it('parses ARIA attributes', () => {
            const html = '<div role="dialog" aria-labelledby="title" aria-describedby="desc">Content</div>';
            const result = parseElement(html);

            expect(result).not.toBeNull();
            expect(result?.role).toBe('dialog');
            expect(result?.ariaLabelledby).toBe('title');
            expect(result?.ariaDescribedby).toBe('desc');
        });

        it('returns null for invalid HTML', () => {
            expect(parseElement('')).toBeNull();
            expect(parseElement('not html')).toBeNull();
            expect(parseElement(null as any)).toBeNull();
        });

        it('parses multiple classes', () => {
            const html = '<button class="btn btn-primary close-btn">Click</button>';
            const result = parseElement(html);

            expect(result?.classes).toHaveLength(3);
            expect(result?.classes).toContain('btn');
            expect(result?.classes).toContain('btn-primary');
            expect(result?.classes).toContain('close-btn');
        });
    });

    describe('inferLabel', () => {
        it('infers label from class name', () => {
            const element = parseElement('<button class="close-dialog-btn"></button>');
            expect(inferLabel(element!)).toBe('Close');
        });

        it('infers label from multiple hints', () => {
            const searchBtn = parseElement('<button class="search-btn"></button>');
            expect(inferLabel(searchBtn!)).toBe('Search');

            const submitBtn = parseElement('<button class="submit-form"></button>');
            expect(inferLabel(submitBtn!)).toBe('Submit');

            const menuBtn = parseElement('<button class="menu-toggle"></button>');
            expect(inferLabel(menuBtn!)).toBe('Menu');
        });

        it('infers label from id', () => {
            const element = parseElement('<button id="delete-item"></button>');
            expect(inferLabel(element!)).toBe('Delete');
        });

        it('infers label from name attribute', () => {
            // 'user_email' matches the 'user' hint
            const element = parseElement('<input name="user_email" />');
            expect(inferLabel(element!)).toBe('User');
        });

        it('infers label from href path', () => {
            const element = parseElement('<a href="/settings/profile"></a>');
            expect(inferLabel(element!)).toBe('profile');
        });

        it('infers label from image src', () => {
            const element = parseElement('<img src="/icons/user-avatar.png" />');
            expect(inferLabel(element!)).toBe('user avatar');
        });

        it('returns null when no label can be inferred', () => {
            const element = parseElement('<button class="xyz123"></button>');
            expect(inferLabel(element!)).toBeNull();
        });
    });

    describe('describeWhatsMissing', () => {
        it('describes missing button name', () => {
            const element = parseElement('<button class="icon-btn"><svg></svg></button>');
            const missing = describeWhatsMissing(element!, 'button-name');

            expect(missing).toContain('accessible name');
            expect(missing).toContain('aria-label');
        });

        it('describes missing image alt', () => {
            const element = parseElement('<img src="photo.jpg" />');
            const missing = describeWhatsMissing(element!, 'image-alt');

            expect(missing).toContain('alt attribute');
        });

        it('describes missing label', () => {
            const element = parseElement('<input type="text" />');
            const missing = describeWhatsMissing(element!, 'label');

            expect(missing).toContain('label');
        });

        it('describes color contrast issue', () => {
            const element = parseElement('<span style="color: #777">Text</span>');
            const missing = describeWhatsMissing(element!, 'color-contrast');

            expect(missing).toContain('contrast ratio');
        });

        it('describes duplicate id', () => {
            const element = parseElement('<div id="main-content"></div>');
            const missing = describeWhatsMissing(element!, 'duplicate-id');

            expect(missing).toContain('unique id');
            expect(missing).toContain('main-content');
        });
    });

    describe('getElementCategory', () => {
        it('identifies buttons', () => {
            expect(getElementCategory(parseElement('<button>Click</button>')!)).toBe('button');
            expect(getElementCategory(parseElement('<div role="button">Click</div>')!)).toBe('button');
        });

        it('identifies links', () => {
            expect(getElementCategory(parseElement('<a href="/">Home</a>')!)).toBe('link');
            expect(getElementCategory(parseElement('<span role="link">Click</span>')!)).toBe('link');
        });

        it('identifies images', () => {
            expect(getElementCategory(parseElement('<img src="photo.jpg" />')!)).toBe('image');
            expect(getElementCategory(parseElement('<div role="img" aria-label="Photo"></div>')!)).toBe('image');
        });

        it('identifies form inputs', () => {
            expect(getElementCategory(parseElement('<input type="text" />')!)).toBe('form-input');
            expect(getElementCategory(parseElement('<select><option>A</option></select>')!)).toBe('form-input');
            expect(getElementCategory(parseElement('<textarea></textarea>')!)).toBe('form-input');
        });

        it('identifies headings', () => {
            expect(getElementCategory(parseElement('<h1>Title</h1>')!)).toBe('heading');
            expect(getElementCategory(parseElement('<h2>Subtitle</h2>')!)).toBe('heading');
            expect(getElementCategory(parseElement('<div role="heading">Title</div>')!)).toBe('heading');
        });

        it('identifies landmarks', () => {
            expect(getElementCategory(parseElement('<main>Content</main>')!)).toBe('landmark');
            expect(getElementCategory(parseElement('<nav>Links</nav>')!)).toBe('landmark');
            expect(getElementCategory(parseElement('<aside>Sidebar</aside>')!)).toBe('landmark');
            expect(getElementCategory(parseElement('<div role="navigation">Links</div>')!)).toBe('landmark');
        });

        it('identifies interactive elements', () => {
            expect(getElementCategory(parseElement('<div tabindex="0">Focusable</div>')!)).toBe('interactive');
            expect(getElementCategory(parseElement('<span role="checkbox">Check</span>')!)).toBe('interactive');
        });

        it('returns other for unrecognized elements', () => {
            expect(getElementCategory(parseElement('<div>Just a div</div>')!)).toBe('other');
            expect(getElementCategory(parseElement('<span>Just a span</span>')!)).toBe('other');
        });
    });
});
