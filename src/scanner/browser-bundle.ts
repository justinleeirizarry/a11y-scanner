/**
 * This file gets bundled and injected into the browser page
 * It runs in the browser context and uses Bippy + axe-core
 */

// @ts-ignore - these will be bundled
import axe from 'axe-core';
// @ts-ignore - Bippy utilities for better fiber handling
import { instrument } from 'bippy';

// Import modular scanner components
import { findReactRoot, traverseFiberTree, buildDomToComponentMap } from './fiber/traversal.js';
import { runAxeFullScan } from './axe/runner.js';
import {
    attributeViolationsToComponents,
    attributePassesToComponents,
    attributeIncompleteToComponents
} from './axe/attribution.js';
import { runKeyboardTests } from './keyboard/index.js';
import { buildAccessibilityTree } from './axe/tree-builder.js';
import { runWCAG22Checks } from './wcag22/index.js';

// Initialize Bippy instrumentation immediately
try {
    instrument({
        onCommitFiberRoot: () => { }, // We just need instrumentation active
    });
} catch (e) {
    console.warn('Failed to initialize Bippy instrumentation:', e);
}

declare global {
    interface Window {
        ReactA11yScanner: {
            scan: (options?: { tags?: string[]; includeKeyboardTests?: boolean }) => Promise<any>;
        };
    }
}

/**
 * Main scan function - called from Node context
 */
export async function scan(options: { tags?: string[]; includeKeyboardTests?: boolean } = {}) {
    // Note: console.log is intentional here as this runs in browser context
    // and needs to be visible in browser console for debugging

    // Find React root
    const root = findReactRoot();
    if (!root) {
        throw new Error('Could not find React root fiber node');
    }

    console.log('✓ Found React root');

    // Traverse fiber tree to get components with timeout protection
    let components: any[] = [];
    try {
        // Add a safeguard - limit traversal to prevent infinite loops
        const MAX_COMPONENTS = 10000;
        components = traverseFiberTree(root);
        if (components.length > MAX_COMPONENTS) {
            console.warn(`[react-a11y-scanner] Component limit reached (${MAX_COMPONENTS}), truncating`);
            components = components.slice(0, MAX_COMPONENTS);
        }
    } catch (error) {
        console.error('[react-a11y-scanner] Fiber traversal failed:', error);
        components = [];
    }
    console.log(`✓ Found ${components.length} components`);

    // Run axe accessibility scan (full results)
    const axeResults = await runAxeFullScan(options.tags);
    console.log(`✓ Found ${axeResults.violations.length} violations, ${axeResults.passes.length} passes, ${axeResults.incomplete.length} incomplete`);

    // Build DOM-to-component map for attribution
    const domToComponentMap = buildDomToComponentMap(components);

    // Attribute violations to components
    const attributedViolations = attributeViolationsToComponents(axeResults.violations, domToComponentMap);
    console.log(`✓ Attributed violations to components`);

    // Attribute passes to components (lighter attribution)
    const attributedPasses = attributePassesToComponents(axeResults.passes, domToComponentMap);
    console.log(`✓ Attributed ${attributedPasses.length} passing rules`);

    // Attribute incomplete results (needs manual review)
    const attributedIncomplete = attributeIncompleteToComponents(axeResults.incomplete, domToComponentMap);
    if (attributedIncomplete.length > 0) {
        console.log(`⚠️  ${attributedIncomplete.length} rules need manual review`);
    }

    // Run keyboard tests if requested
    let keyboardTests = null;
    if (options.includeKeyboardTests) {
        console.log('🎹 Starting keyboard tests...');
        console.warn('⚠️  Keyboard testing is experimental and may not detect all issues');
        try {
            keyboardTests = runKeyboardTests();
            console.log(`✓ Keyboard tests complete: ${keyboardTests.summary.totalIssues} issues found`);
        } catch (error) {
            console.error('❌ Failed to run keyboard tests:', error);
            if (error instanceof Error) {
                console.error('Error stack:', error.stack);
            }
        }
    }

    // Run WCAG 2.2 custom checks
    let wcag22Results = null;
    try {
        wcag22Results = runWCAG22Checks();
    } catch (error) {
        console.error('❌ Failed to run WCAG 2.2 checks:', error);
        if (error instanceof Error) {
            console.error('Error stack:', error.stack);
        }
    }

    // Build accessibility tree
    console.log('🌳 Building accessibility tree...');
    const accessibilityTree = buildAccessibilityTree();
    console.log('✓ Accessibility tree built');

    return {
        components,
        violations: attributedViolations,
        passes: attributedPasses,
        incomplete: attributedIncomplete,
        inapplicable: axeResults.inapplicable,
        keyboardTests,
        wcag22: wcag22Results,
        accessibilityTree,
    };
}

// Expose to global window for evaluation
if (typeof window !== 'undefined') {
    window.ReactA11yScanner = { scan };
}
