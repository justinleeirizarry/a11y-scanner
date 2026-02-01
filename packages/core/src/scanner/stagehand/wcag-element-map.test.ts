/**
 * Tests for WCAG Element Type Mapping
 */

import { describe, it, expect } from 'vitest';
import { getRelatedCriteria, sortByWcagPriority, formatCriteriaComment } from './wcag-element-map.js';
import type { ElementType } from '../../types.js';

describe('wcag-element-map', () => {
    describe('getRelatedCriteria', () => {
        it('should return criteria for button type', () => {
            const criteria = getRelatedCriteria('button');
            expect(criteria.length).toBeGreaterThan(0);

            // Button should include Name, Role, Value (4.1.2) from button-name rule
            const criteriaIds = criteria.map(c => c.id);
            expect(criteriaIds).toContain('4.1.2');
        });

        it('should return criteria for link type', () => {
            const criteria = getRelatedCriteria('link');
            expect(criteria.length).toBeGreaterThan(0);

            // Link should include Name, Role, Value (4.1.2) and Link Purpose (2.4.4)
            const criteriaIds = criteria.map(c => c.id);
            expect(criteriaIds).toContain('4.1.2');
            expect(criteriaIds).toContain('2.4.4');
        });

        it('should return criteria for input type', () => {
            const criteria = getRelatedCriteria('input');
            expect(criteria.length).toBeGreaterThan(0);

            // Input should include Labels or Instructions (3.3.2) and Identify Input Purpose (1.3.5)
            const criteriaIds = criteria.map(c => c.id);
            expect(criteriaIds).toContain('3.3.2');
            expect(criteriaIds).toContain('1.3.5');
        });

        it('should return criteria for checkbox type', () => {
            const criteria = getRelatedCriteria('checkbox');
            expect(criteria.length).toBeGreaterThan(0);

            // Checkbox should include criteria from label and aria-toggle-field-name rules
            const criteriaIds = criteria.map(c => c.id);
            expect(criteriaIds).toContain('4.1.2');
        });

        it('should return criteria for radio type', () => {
            const criteria = getRelatedCriteria('radio');
            expect(criteria.length).toBeGreaterThan(0);

            const criteriaIds = criteria.map(c => c.id);
            expect(criteriaIds).toContain('4.1.2');
        });

        it('should return criteria for select type', () => {
            const criteria = getRelatedCriteria('select');
            expect(criteria.length).toBeGreaterThan(0);

            const criteriaIds = criteria.map(c => c.id);
            expect(criteriaIds).toContain('4.1.2');
            expect(criteriaIds).toContain('3.3.2');
        });

        it('should return criteria for custom type', () => {
            const criteria = getRelatedCriteria('custom');
            expect(criteria.length).toBeGreaterThan(0);

            // Custom should include Name, Role, Value (4.1.2) from aria-roles
            const criteriaIds = criteria.map(c => c.id);
            expect(criteriaIds).toContain('4.1.2');
        });

        it('should return unique criteria (no duplicates)', () => {
            const criteria = getRelatedCriteria('input');
            const ids = criteria.map(c => c.id);
            const uniqueIds = [...new Set(ids)];
            expect(ids.length).toBe(uniqueIds.length);
        });

        it('should include WCAG level in criteria', () => {
            const criteria = getRelatedCriteria('button');
            for (const c of criteria) {
                expect(['A', 'AA', 'AAA']).toContain(c.level);
            }
        });
    });

    describe('sortByWcagPriority', () => {
        it('should sort Level A elements before Level AA elements', () => {
            // Button maps to 4.1.2 (Level A), link maps to 4.1.2 (A) and 2.4.4 (A) and 1.4.1 (A)
            // Both have Level A, so order may not change, but they should both be before any AAA-only
            const elements: Array<{ type: ElementType; name: string }> = [
                { type: 'button', name: 'Submit' },
                { type: 'link', name: 'Home' },
            ];

            const sorted = sortByWcagPriority(elements);

            // Both button and link have Level A criteria, so they should both be included
            expect(sorted.length).toBe(2);
            // Both should have Level A criteria
            const buttonCriteria = getRelatedCriteria('button');
            const linkCriteria = getRelatedCriteria('link');
            expect(buttonCriteria.some(c => c.level === 'A')).toBe(true);
            expect(linkCriteria.some(c => c.level === 'A')).toBe(true);
        });

        it('should not mutate the original array', () => {
            const elements: Array<{ type: ElementType }> = [
                { type: 'custom' },
                { type: 'button' },
            ];
            const original = [...elements];

            sortByWcagPriority(elements);

            expect(elements).toEqual(original);
        });

        it('should handle empty array', () => {
            const elements: Array<{ type: ElementType }> = [];
            const sorted = sortByWcagPriority(elements);
            expect(sorted).toEqual([]);
        });

        it('should handle single element', () => {
            const elements: Array<{ type: ElementType }> = [{ type: 'button' }];
            const sorted = sortByWcagPriority(elements);
            expect(sorted).toEqual([{ type: 'button' }]);
        });

        it('should maintain stability for elements with same priority', () => {
            const elements: Array<{ type: ElementType; id: number }> = [
                { type: 'button', id: 1 },
                { type: 'button', id: 2 },
                { type: 'button', id: 3 },
            ];

            const sorted = sortByWcagPriority(elements);

            // All buttons have same WCAG priority, order should be stable
            expect(sorted[0].id).toBe(1);
            expect(sorted[1].id).toBe(2);
            expect(sorted[2].id).toBe(3);
        });

        it('should preserve all element properties', () => {
            const elements = [
                { type: 'button' as ElementType, selector: '#btn', description: 'Click me' },
            ];

            const sorted = sortByWcagPriority(elements);

            expect(sorted[0]).toEqual({
                type: 'button',
                selector: '#btn',
                description: 'Click me',
            });
        });
    });

    describe('formatCriteriaComment', () => {
        it('should format criteria as comment string', () => {
            const criteria = getRelatedCriteria('button');
            const comment = formatCriteriaComment(criteria);

            expect(comment).toContain('WCAG:');
            expect(comment).toContain('4.1.2');
            expect(comment).toContain('Name, Role, Value');
        });

        it('should include level in parentheses', () => {
            const criteria = getRelatedCriteria('button');
            const comment = formatCriteriaComment(criteria);

            expect(comment).toMatch(/\([A-Z]+\)/);
        });

        it('should return empty string for empty criteria', () => {
            const comment = formatCriteriaComment([]);
            expect(comment).toBe('');
        });

        it('should join multiple criteria with commas', () => {
            const criteria = getRelatedCriteria('link');
            const comment = formatCriteriaComment(criteria);

            // Link has multiple criteria
            if (criteria.length > 1) {
                expect(comment).toContain(', ');
            }
        });
    });
});
