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
import { runAxeScan } from './axe/runner.js';
import { attributeViolationsToComponents } from './axe/attribution.js';

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
            scan: (options?: { tags?: string[] }) => Promise<any>;
        };
    }
}

/**
 * Main scan function - called from Node context
 */
export async function scan(options: { tags?: string[] } = {}) {
    console.log('🔍 Starting React A11y scan...');

    // Find React root
    const root = findReactRoot();
    if (!root) {
        throw new Error('Could not find React root fiber node');
    }

    console.log('✓ Found React root');

    // Traverse fiber tree to get components
    const components = traverseFiberTree(root);
    console.log(`✓ Found ${components.length} components`);

    // Run axe accessibility scan
    const violations = await runAxeScan(options.tags);
    console.log(`✓ Found ${violations.length} violations`);

    // Build DOM-to-component map for attribution
    const domToComponentMap = buildDomToComponentMap(components);

    // Attribute violations to components
    const attributedViolations = attributeViolationsToComponents(violations, domToComponentMap);
    console.log(`✓ Attributed violations to components`);

    return {
        components,
        violations: attributedViolations,
    };
}

// Expose to global window for evaluation
if (typeof window !== 'undefined') {
    window.ReactA11yScanner = { scan };
}
