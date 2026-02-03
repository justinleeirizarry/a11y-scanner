/**
 * @accessibility-toolkit/react
 *
 * React plugin for the Accessibility Toolkit. Provides component attribution
 * for accessibility violations by traversing the React Fiber tree.
 *
 * @example
 * ```typescript
 * import { scan } from '@accessibility-toolkit/core';
 * import { ReactPlugin } from '@accessibility-toolkit/react';
 *
 * const results = await scan({
 *   url: 'https://my-react-app.com',
 *   plugins: [ReactPlugin]
 * });
 * ```
 */

// =============================================================================
// Plugin Export
// =============================================================================

export { ReactPlugin, default } from './plugin.js';

// =============================================================================
// Types
// =============================================================================

export type {
    ComponentInfo,
    ReactScanData,
    AttributedCheck,
    AttributedViolationNode,
    AttributedViolation,
    AttributedPass,
    AttributedIncomplete,
} from './types.js';

// =============================================================================
// Fiber Utilities (for advanced use cases)
// =============================================================================

export {
    findReactRoot,
    traverseFiberTree,
    buildDomToComponentMap,
    findComponentForElement,
} from './fiber/traversal.js';

export {
    getComponentName,
    type FiberNode,
} from './fiber/component-resolver.js';

export {
    isFrameworkComponent,
    filterUserComponents,
} from './fiber/framework-filter.js';

// =============================================================================
// Attribution Utilities (for advanced use cases)
// =============================================================================

export {
    attributeViolationsToComponents,
    attributePassesToComponents,
    attributeIncompleteToComponents,
} from './attribution/index.js';

export {
    generateCssSelector,
    extractHtmlSnippet,
} from './attribution/utils.js';
