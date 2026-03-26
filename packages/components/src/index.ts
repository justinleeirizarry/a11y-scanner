/**
 * @aria51/components
 *
 * Framework-agnostic component attribution for accessibility violations.
 * Maps axe-core violations to your UI components with source file locations.
 *
 * Works with React, Preact, Vue, Svelte, and Solid via element-source.
 *
 * @example
 * ```typescript
 * import { ComponentPlugin, getComponentBundlePath } from '@aria51/components';
 *
 * // Use with @aria51/core
 * const result = await runScanAsPromise({
 *     url: 'https://your-app.com',
 *     browser: 'chromium',
 *     headless: true,
 *     componentBundlePath: getComponentBundlePath(),
 * }, AppLayer);
 * ```
 */

export { ComponentPlugin, getComponentBundlePath } from './plugin.js';
export { getDetectionScript } from './detection.js';

export {
    resolveComponent,
    buildAttributedNode,
    type SourceLocation,
    type ResolvedComponent,
    type AttributedNode,
} from './attribution/index.js';

export {
    generateCssSelector,
    extractHtmlSnippet,
    cleanFilePath,
    isFrameworkComponent,
    filterUserComponents,
} from './attribution/utils.js';
