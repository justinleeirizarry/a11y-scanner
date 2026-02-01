/**
 * Tests for WCAG data module
 */

import { describe, it, expect } from 'vitest';
import {
    WCAG_CRITERIA,
    AXE_WCAG_MAP,
    getAllCriteria,
    getCriteriaCount,
    getMappedRuleIds,
    hasWcagMapping,
    getAxeMapping,
    getWcagCriteriaForViolation,
    getCriterionById,
    getAllCriteriaByLevel,
    getPrimaryCriterion,
    getHighestLevelForViolation,
    formatCriterionDisplay,
    extractCriteriaFromTags,
    getUniquePrinciples
} from './index.js';

describe('WCAG Criteria Database', () => {
    it('should contain all WCAG 2.2 criteria plus obsolete 4.1.1', () => {
        // WCAG 2.2 has 86 success criteria (we include obsolete 4.1.1 for axe-core compatibility)
        expect(getCriteriaCount()).toBe(87);
    });

    it('should have valid structure for all criteria', () => {
        const criteria = getAllCriteria();
        for (const criterion of criteria) {
            expect(criterion.id).toMatch(/^\d+\.\d+\.\d+$/);
            expect(criterion.title).toBeTruthy();
            expect(['A', 'AA', 'AAA']).toContain(criterion.level);
            expect(['Perceivable', 'Operable', 'Understandable', 'Robust']).toContain(criterion.principle);
            expect(criterion.guideline).toBeTruthy();
            expect(criterion.description).toBeTruthy();
            expect(criterion.w3cUrl).toMatch(/^https:\/\/www\.w3\.org\/WAI\/WCAG22\/Understanding\//);
        }
    });

    it('should return correct counts by level', () => {
        const levelA = getAllCriteriaByLevel('A');
        const levelAA = getAllCriteriaByLevel('AA');
        const levelAAA = getAllCriteriaByLevel('AAA');

        // WCAG 2.2 has 32 A (including obsolete 4.1.1), 24 AA, 31 AAA criteria
        expect(levelA.length).toBe(32);
        expect(levelAA.length).toBe(24);
        expect(levelAAA.length).toBe(31);

        // Total should be 87 (including obsolete 4.1.1)
        expect(levelA.length + levelAA.length + levelAAA.length).toBe(87);
    });

    it('should retrieve specific criterion by ID', () => {
        const contrast = getCriterionById('1.4.3');
        expect(contrast).toBeDefined();
        expect(contrast?.title).toBe('Contrast (Minimum)');
        expect(contrast?.level).toBe('AA');
        expect(contrast?.principle).toBe('Perceivable');
    });

    it('should return undefined for invalid criterion ID', () => {
        expect(getCriterionById('99.99.99')).toBeUndefined();
    });
});

describe('Axe-WCAG Mapping', () => {
    it('should have mappings for common rules', () => {
        const commonRules = [
            'color-contrast',
            'image-alt',
            'button-name',
            'link-name',
            'label',
            'html-has-lang',
            'document-title'
        ];

        for (const ruleId of commonRules) {
            expect(hasWcagMapping(ruleId)).toBe(true);
            const mapping = getAxeMapping(ruleId);
            expect(mapping).toBeDefined();
            expect(mapping?.criteria.length).toBeGreaterThan(0);
        }
    });

    it('should return correct mapping for color-contrast', () => {
        const mapping = getAxeMapping('color-contrast');
        expect(mapping).toBeDefined();
        expect(mapping?.criteria).toContain('1.4.3');
        expect(mapping?.techniques).toContain('G18');
    });

    it('should return correct mapping for multi-criteria rules', () => {
        const mapping = getAxeMapping('label');
        expect(mapping).toBeDefined();
        expect(mapping?.criteria).toContain('1.3.1');
        expect(mapping?.criteria).toContain('3.3.2');
        expect(mapping?.criteria).toContain('4.1.2');
    });

    it('should return false for unmapped rules', () => {
        expect(hasWcagMapping('nonexistent-rule')).toBe(false);
    });

    it('should list all mapped rule IDs', () => {
        const ruleIds = getMappedRuleIds();
        expect(ruleIds.length).toBeGreaterThan(50); // We have 90+ rules mapped
        expect(ruleIds).toContain('color-contrast');
        expect(ruleIds).toContain('image-alt');
    });
});

describe('Helper Functions', () => {
    describe('getWcagCriteriaForViolation', () => {
        it('should return full criteria for color-contrast', () => {
            const criteria = getWcagCriteriaForViolation('color-contrast');
            expect(criteria.length).toBe(1);
            expect(criteria[0].id).toBe('1.4.3');
            expect(criteria[0].title).toBe('Contrast (Minimum)');
            expect(criteria[0].level).toBe('AA');
        });

        it('should return multiple criteria for label rule', () => {
            const criteria = getWcagCriteriaForViolation('label');
            expect(criteria.length).toBe(3);
            const ids = criteria.map(c => c.id);
            expect(ids).toContain('1.3.1');
            expect(ids).toContain('3.3.2');
            expect(ids).toContain('4.1.2');
        });

        it('should return empty array for unmapped rule', () => {
            const criteria = getWcagCriteriaForViolation('nonexistent');
            expect(criteria).toEqual([]);
        });
    });

    describe('getPrimaryCriterion', () => {
        it('should return first criterion for a rule', () => {
            const primary = getPrimaryCriterion('color-contrast');
            expect(primary?.id).toBe('1.4.3');
        });

        it('should return undefined for unmapped rule', () => {
            expect(getPrimaryCriterion('nonexistent')).toBeUndefined();
        });
    });

    describe('getHighestLevelForViolation', () => {
        it('should return AA for color-contrast', () => {
            expect(getHighestLevelForViolation('color-contrast')).toBe('AA');
        });

        it('should return highest level for multi-criteria rules', () => {
            // label maps to 1.3.1 (A), 3.3.2 (A), 4.1.2 (A) - all level A
            expect(getHighestLevelForViolation('label')).toBe('A');
        });

        it('should return undefined for unmapped rule', () => {
            expect(getHighestLevelForViolation('nonexistent')).toBeUndefined();
        });
    });

    describe('formatCriterionDisplay', () => {
        it('should format criterion for display', () => {
            const criterion = getCriterionById('1.4.3')!;
            expect(formatCriterionDisplay(criterion)).toBe('1.4.3 Contrast (Minimum)');
        });
    });

    describe('extractCriteriaFromTags', () => {
        it('should extract criterion IDs from axe tags', () => {
            const tags = ['wcag143', 'wcag2aa', 'cat.color'];
            const ids = extractCriteriaFromTags(tags);
            expect(ids).toContain('1.4.3');
            expect(ids).not.toContain('wcag2aa'); // Level tag, not criterion
        });

        it('should handle multiple criterion tags', () => {
            const tags = ['wcag131', 'wcag412', 'wcag2a'];
            const ids = extractCriteriaFromTags(tags);
            expect(ids).toContain('1.3.1');
            expect(ids).toContain('4.1.2');
        });

        it('should return empty array for no matches', () => {
            const tags = ['best-practice', 'cat.forms'];
            const ids = extractCriteriaFromTags(tags);
            expect(ids).toEqual([]);
        });
    });

    describe('getUniquePrinciples', () => {
        it('should return unique principles from criteria list', () => {
            const criteria = getWcagCriteriaForViolation('label');
            const principles = getUniquePrinciples(criteria);
            // label maps to Perceivable (1.3.1), Understandable (3.3.2), Robust (4.1.2)
            expect(principles).toContain('Perceivable');
            expect(principles).toContain('Understandable');
            expect(principles).toContain('Robust');
        });

        it('should return single principle for single-criterion rule', () => {
            const criteria = getWcagCriteriaForViolation('color-contrast');
            const principles = getUniquePrinciples(criteria);
            expect(principles.length).toBe(1);
            expect(principles[0]).toBe('Perceivable');
        });
    });
});

describe('Data Consistency', () => {
    it('should have all mapped criteria exist in WCAG_CRITERIA', () => {
        for (const [ruleId, mapping] of Object.entries(AXE_WCAG_MAP)) {
            for (const criterionId of mapping.criteria) {
                expect(
                    WCAG_CRITERIA[criterionId],
                    `Rule ${ruleId} references missing criterion ${criterionId}`
                ).toBeDefined();
            }
        }
    });

    it('should have criteria from each principle', () => {
        const principles = new Set(getAllCriteria().map(c => c.principle));
        expect(principles.size).toBe(4);
        expect(principles.has('Perceivable')).toBe(true);
        expect(principles.has('Operable')).toBe(true);
        expect(principles.has('Understandable')).toBe(true);
        expect(principles.has('Robust')).toBe(true);
    });
});
