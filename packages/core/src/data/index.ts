/**
 * WCAG Data Module
 *
 * Exports WCAG criteria database, axe-core mappings, and helper functions
 * for enriching accessibility violation reports.
 */

export {
    WCAG_CRITERIA,
    getAllCriteria,
    getCriteriaCount,
    type WcagCriterion,
    type WcagPrinciple
} from './wcag-criteria.js';

export {
    AXE_WCAG_MAP,
    getMappedRuleIds,
    hasWcagMapping,
    getAxeMapping,
    type AxeWcagMapping
} from './axe-wcag-map.js';

import { WCAG_CRITERIA, type WcagCriterion } from './wcag-criteria.js';
import { AXE_WCAG_MAP } from './axe-wcag-map.js';
import type { WcagLevel } from '../types.js';

/**
 * Get full WCAG criterion information for a violation's axe rule ID
 *
 * @param ruleId - The axe-core rule ID (e.g., "color-contrast")
 * @returns Array of WcagCriterion objects for all criteria the rule tests
 *
 * @example
 * const criteria = getWcagCriteriaForViolation('color-contrast');
 * // Returns: [{ id: '1.4.3', title: 'Contrast (Minimum)', level: 'AA', ... }]
 */
export function getWcagCriteriaForViolation(ruleId: string): WcagCriterion[] {
    const mapping = AXE_WCAG_MAP[ruleId];
    if (!mapping) {
        return [];
    }

    return mapping.criteria
        .map(criterionId => WCAG_CRITERIA[criterionId])
        .filter((criterion): criterion is WcagCriterion => criterion !== undefined);
}

/**
 * Get a WCAG criterion by its ID
 *
 * @param id - The WCAG criterion ID (e.g., "1.4.3")
 * @returns The WcagCriterion object or undefined if not found
 *
 * @example
 * const criterion = getCriterionById('1.4.3');
 * // Returns: { id: '1.4.3', title: 'Contrast (Minimum)', level: 'AA', ... }
 */
export function getCriterionById(id: string): WcagCriterion | undefined {
    return WCAG_CRITERIA[id];
}

/**
 * Get all WCAG criteria at a specific conformance level
 *
 * @param level - The WCAG level ('A', 'AA', or 'AAA')
 * @returns Array of WcagCriterion objects at that level
 *
 * @example
 * const aaCriteria = getAllCriteriaByLevel('AA');
 * // Returns all Level AA criteria
 */
export function getAllCriteriaByLevel(level: WcagLevel): WcagCriterion[] {
    return Object.values(WCAG_CRITERIA).filter(criterion => criterion.level === level);
}

/**
 * Get the primary (first) WCAG criterion for a violation
 *
 * @param ruleId - The axe-core rule ID
 * @returns The primary WcagCriterion or undefined
 *
 * @example
 * const primary = getPrimaryCriterion('button-name');
 * // Returns: { id: '4.1.2', title: 'Name, Role, Value', level: 'A', ... }
 */
export function getPrimaryCriterion(ruleId: string): WcagCriterion | undefined {
    const criteria = getWcagCriteriaForViolation(ruleId);
    return criteria[0];
}

/**
 * Get the most restrictive (highest) WCAG level for a violation
 *
 * @param ruleId - The axe-core rule ID
 * @returns The highest level ('A', 'AA', or 'AAA') or undefined
 *
 * @example
 * const level = getHighestLevelForViolation('color-contrast');
 * // Returns: 'AA'
 */
export function getHighestLevelForViolation(ruleId: string): WcagLevel | undefined {
    const criteria = getWcagCriteriaForViolation(ruleId);
    if (criteria.length === 0) return undefined;

    // Level priority: AAA > AA > A
    const levelPriority: Record<WcagLevel, number> = {
        'A': 1,
        'AA': 2,
        'AAA': 3
    };

    let highestLevel: WcagLevel = 'A';
    for (const criterion of criteria) {
        if (levelPriority[criterion.level] > levelPriority[highestLevel]) {
            highestLevel = criterion.level;
        }
    }

    return highestLevel;
}

/**
 * Format WCAG criterion for display
 *
 * @param criterion - The WcagCriterion object
 * @returns Formatted string like "1.4.3 Contrast (Minimum)"
 */
export function formatCriterionDisplay(criterion: WcagCriterion): string {
    return `${criterion.id} ${criterion.title}`;
}

/**
 * Get WCAG criteria IDs from axe tags
 *
 * Parses axe-core violation tags to extract referenced WCAG criterion IDs.
 * Handles tags like "wcag143" (1.4.3) and "wcag2aa" (level indicator).
 *
 * @param tags - Array of axe-core violation tags
 * @returns Array of WCAG criterion IDs found in the tags
 *
 * @example
 * const ids = extractCriteriaFromTags(['wcag143', 'wcag2aa', 'cat.color']);
 * // Returns: ['1.4.3']
 */
export function extractCriteriaFromTags(tags: string[]): string[] {
    const criterionIds: string[] = [];
    const criterionPattern = /^wcag(\d)(\d)(\d+)$/;

    for (const tag of tags) {
        const match = tag.match(criterionPattern);
        if (match) {
            const [, principle, guideline, criterion] = match;
            const id = `${principle}.${guideline}.${criterion}`;
            if (WCAG_CRITERIA[id]) {
                criterionIds.push(id);
            }
        }
    }

    return criterionIds;
}

/**
 * Get all unique WCAG principles from a list of criteria
 *
 * @param criteria - Array of WcagCriterion objects
 * @returns Array of unique principle names
 */
export function getUniquePrinciples(criteria: WcagCriterion[]): string[] {
    const principles = new Set(criteria.map(c => c.principle));
    return Array.from(principles);
}
