/**
 * WCAG 2.2 Custom Checks
 *
 * These checks supplement axe-core's limited WCAG 2.2 coverage with custom implementations
 * for criteria not covered by axe-core.
 */

export * from './types.js';
export { checkTargetSize, getAllTargetSizeResults } from './target-size.js';
export { checkFocusNotObscured, getOverlayInfo } from './focus-obscured.js';
export { checkFocusAppearance, getFocusIndicatorDetails } from './focus-appearance.js';
export { checkDraggingMovements, getDraggableElements } from './dragging.js';
export { checkAccessibleAuthentication, getAuthenticationInfo } from './authentication.js';

import type { WCAG22CheckResults, WCAG22Violation } from './types.js';
import { checkTargetSize } from './target-size.js';
import { checkFocusNotObscured } from './focus-obscured.js';
import { checkFocusAppearance } from './focus-appearance.js';
import { checkDraggingMovements } from './dragging.js';
import { checkAccessibleAuthentication } from './authentication.js';

/**
 * Run all WCAG 2.2 checks
 */
export function runWCAG22Checks(): WCAG22CheckResults {
    console.log('🔍 Running WCAG 2.2 checks...');

    // Run all checks
    const targetSizeViolations = checkTargetSize();
    console.log(`  ✓ Target Size (2.5.8): ${targetSizeViolations.length} violations`);

    const focusObscuredViolations = checkFocusNotObscured();
    console.log(`  ✓ Focus Not Obscured (2.4.11): ${focusObscuredViolations.length} violations`);

    const focusAppearanceViolations = checkFocusAppearance();
    console.log(`  ✓ Focus Appearance (2.4.13): ${focusAppearanceViolations.length} violations`);

    const draggingViolations = checkDraggingMovements();
    console.log(`  ✓ Dragging Movements (2.5.7): ${draggingViolations.length} violations`);

    const authenticationViolations = checkAccessibleAuthentication();
    console.log(`  ✓ Accessible Authentication (3.3.8): ${authenticationViolations.length} violations`);

    // Calculate summary
    const allViolations: WCAG22Violation[] = [
        ...targetSizeViolations,
        ...focusObscuredViolations,
        ...focusAppearanceViolations,
        ...draggingViolations,
        ...authenticationViolations
    ];

    const byLevel = {
        A: 0,
        AA: allViolations.filter(v => v.level === 'AA').length,
        AAA: allViolations.filter(v => v.level === 'AAA').length
    };

    const byCriterion: Record<string, number> = {};
    for (const violation of allViolations) {
        const key = violation.criterion;
        byCriterion[key] = (byCriterion[key] || 0) + 1;
    }

    console.log(`✓ WCAG 2.2 checks complete: ${allViolations.length} total violations`);

    return {
        targetSize: targetSizeViolations,
        focusObscured: focusObscuredViolations,
        focusAppearance: focusAppearanceViolations,
        dragging: draggingViolations,
        authentication: authenticationViolations,
        summary: {
            totalViolations: allViolations.length,
            byLevel,
            byCriterion
        }
    };
}
