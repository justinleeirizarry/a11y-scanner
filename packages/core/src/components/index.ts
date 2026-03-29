/**
 * Component Attribution
 *
 * Framework-agnostic component attribution for accessibility violations.
 * Maps axe-core violations to UI components with source file locations.
 *
 * Works with React, Preact, Vue, Svelte, and Solid via element-source.
 */

export { ComponentPlugin, getComponentBundlePath } from './plugin.js';
export { getDetectionScript } from './detection.js';

export {
    resolveComponent,
    buildAttributedNode,
    type SourceLocation,
    type ResolvedComponent,
} from './attribution/index.js';

export {
    generateCssSelector,
    extractHtmlSnippet,
    cleanFilePath,
    isFrameworkComponent,
    filterUserComponents,
} from './attribution/utils.js';
