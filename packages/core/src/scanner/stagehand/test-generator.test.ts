/**
 * Tests for TestGenerator class
 */

import { describe, it, expect } from 'vitest';
import { TestGenerator } from './test-generator.js';
import type { ElementDiscovery } from '../../types.js';

describe('TestGenerator', () => {
    const generator = new TestGenerator();

    describe('generateTest', () => {
        it('should generate valid Playwright test structure', () => {
            const elements: ElementDiscovery[] = [];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain("import { test, expect } from '@playwright/test'");
            expect(test).toContain("import AxeBuilder from '@axe-core/playwright'");
            expect(test).toContain("test('Accessibility Interaction Test'");
            expect(test).toContain("http://example.com");
        });

        it('should set 5 minute timeout', () => {
            const elements: ElementDiscovery[] = [];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain('test.setTimeout(300000)');
        });

        it('should set viewport size', () => {
            const elements: ElementDiscovery[] = [];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain('setViewportSize({ width: 1920, height: 1080 })');
        });

        it('should include initial accessibility scan with detailed output', () => {
            const elements: ElementDiscovery[] = [];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain('new AxeBuilder({ page }).analyze()');
            expect(test).toContain('Initial Accessibility Scan');
            expect(test).toContain('violations.forEach');
            expect(test).toContain('v.impact');
            expect(test).toContain('v.helpUrl');
        });

        it('should include element count in completion message', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#btn1', description: 'Button 1', type: 'button' },
                { selector: '#btn2', description: 'Button 2', type: 'button' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain('checked all 2 discovered elements');
        });
    });

    describe('generateInteraction', () => {
        it('should generate click for button type', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#submit', description: 'Submit button', type: 'button' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain('.click(');
        });

        it('should generate click for link type', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#home', description: 'Home link', type: 'link' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain('.click(');
        });

        it('should generate fill for input type', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#email', description: 'Email input field', type: 'input' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain(".fill('test value'");
        });

        it('should generate check for checkbox type', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#agree', description: 'Agree checkbox', type: 'checkbox' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain('.check(');
        });

        it('should generate check for radio type', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#option1', description: 'Option 1 radio', type: 'radio' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain('.check(');
        });

        it('should generate selectOption for select type', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#country', description: 'Country select dropdown', type: 'select' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain(".selectOption('value'");
        });

        it('should generate click for custom type', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#widget', description: 'Custom widget', type: 'custom' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain('.click(');
        });
    });

    describe('aria-label extraction', () => {
        it('should extract aria-label from description', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#btn', description: "Submit button labeled 'Submit Form'", type: 'button' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            // Should use aria-label locator instead of XPath
            expect(test).toContain("aria-label='Submit Form'");
        });

        it('should handle aria-label pattern in description', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#btn', description: "Button with aria-label 'Close Modal'", type: 'button' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain("aria-label='Close Modal'");
        });

        it('should fall back to selector when no aria-label found', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#submit-btn', description: 'Submit button', type: 'button' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            // Should use the original selector
            expect(test).toContain('#submit-btn');
        });

        it('should handle quotes in aria-label', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#btn', description: "Button labeled 'Click Me'", type: 'button' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            // Should use the aria-label in the locator
            expect(test).toContain("aria-label='Click Me'");
        });
    });

    describe('error handling and recovery', () => {
        it('should wrap interactions in try-catch', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#btn', description: 'Button', type: 'button' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain('try {');
            expect(test).toContain('} catch (error) {');
        });

        it('should include timeout on interactions', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#btn', description: 'Button', type: 'button' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain('timeout: 5000');
        });

        it('should scroll element into view', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#btn', description: 'Button', type: 'button' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain('scrollIntoViewIfNeeded');
        });

        it('should check visibility before interaction', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#btn', description: 'Button', type: 'button' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain('isVisible()');
            expect(test).toContain('Skipped (not visible)');
        });

        it('should press Escape after interaction', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#btn', description: 'Button', type: 'button' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain("page.keyboard.press('Escape')");
        });

        it('should check for navigation and return to original URL', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#link', description: 'Link', type: 'link' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain('page.url() !== originalUrl');
            expect(test).toContain('page.goto(originalUrl');
        });

        it('should include skip message in catch block', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#btn', description: 'Test Button', type: 'button' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain('Skipped:');
        });
    });

    describe('WCAG context in generated tests', () => {
        it('should include WCAG comment for button type', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#btn', description: 'Submit button', type: 'button' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            // Should include WCAG comment with criterion info
            expect(test).toContain('// WCAG:');
            expect(test).toContain('4.1.2');
            expect(test).toContain('Name, Role, Value');
        });

        it('should include WCAG comment for link type', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#link', description: 'Home link', type: 'link' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain('// WCAG:');
            expect(test).toContain('2.4.4');
        });

        it('should include WCAG comment for input type', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#email', description: 'Email input', type: 'input' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain('// WCAG:');
            expect(test).toContain('3.3.2');
        });

        it('should sort elements by WCAG priority', () => {
            // All these types have Level A criteria, but we verify the sorting is applied
            const elements: ElementDiscovery[] = [
                { selector: '#custom', description: 'Custom widget', type: 'custom' },
                { selector: '#btn', description: 'Button', type: 'button' },
                { selector: '#link', description: 'Link', type: 'link' },
            ];
            const test = generator.generateTest('http://example.com', elements);

            // All should be present with WCAG comments
            expect(test).toContain('// Action: Custom widget');
            expect(test).toContain('// Action: Button');
            expect(test).toContain('// Action: Link');
            // Each should have a WCAG comment
            expect((test.match(/\/\/ WCAG:/g) || []).length).toBe(3);
        });
    });

    describe('accessibility scanning after interactions', () => {
        it('should run axe scan after each interaction', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#btn1', description: 'Button 1', type: 'button' },
                { selector: '#btn2', description: 'Button 2', type: 'button' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            // Should have an axe scan for each element
            expect(test.match(/new AxeBuilder/g)?.length).toBeGreaterThanOrEqual(3); // initial + 2 elements
        });

        it('should log detailed violations after each interaction', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#btn', description: 'Test button', type: 'button' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain('violations.length > 0');
            expect(test).toContain('No violations');
            expect(test).toContain('v.impact');
        });
    });

    describe('element locator generation', () => {
        it('should use .first() to handle multiple matches', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#btn', description: 'Button', type: 'button' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain('.first()');
        });

        it('should generate unique variable names for each element', () => {
            const elements: ElementDiscovery[] = [
                { selector: '#btn1', description: 'Button 1', type: 'button' },
                { selector: '#btn2', description: 'Button 2', type: 'button' },
                { selector: '#btn3', description: 'Button 3', type: 'button' }
            ];
            const test = generator.generateTest('http://example.com', elements);

            expect(test).toContain('el0');
            expect(test).toContain('el1');
            expect(test).toContain('el2');
            expect(test).toContain('results0');
            expect(test).toContain('results1');
            expect(test).toContain('results2');
        });
    });
});
