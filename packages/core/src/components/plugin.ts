/**
 * Component Attribution Plugin
 *
 * Implements the FrameworkPlugin interface.
 * Uses element-source for on-demand component resolution —
 * no framework-specific tree traversal needed.
 */
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Page } from 'playwright';
import type {
    FrameworkPlugin,
    FrameworkScanData,
    AttributedViolation,
    AttributedPass,
    AttributedIncomplete,
} from '../plugin.js';
import type { AxeViolation, AxeResult } from '../schemas/axe.js';
import { getDetectionScript } from './detection.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Get the path to the compiled browser bundle.
 */
export function getComponentBundlePath(): string {
    return resolve(__dirname, '../component-bundle.js');
}

/**
 * The component attribution plugin.
 * Drop-in replacement for the React-specific plugin — works with
 * React, Preact, Vue, Svelte, and Solid.
 */
export const ComponentPlugin: FrameworkPlugin = {
    name: 'components',

    async detect(page: Page): Promise<boolean> {
        const script = getDetectionScript();
        const framework = await page.evaluate(script);
        return framework !== null;
    },

    async scan(page: Page): Promise<FrameworkScanData> {
        // Inject the component attribution bundle
        const bundlePath = getComponentBundlePath();
        await page.addScriptTag({ path: bundlePath });

        // Verify it loaded
        const loaded = await page.evaluate(
            () => typeof (window as any).Aria51ComponentPlugin !== 'undefined'
        );
        if (!loaded) {
            return { components: [], domToComponentMap: new Map() };
        }

        // Detect framework
        const detection = await page.evaluate(
            () => (window as any).Aria51ComponentPlugin.detect()
        );

        return {
            components: [],
            domToComponentMap: new Map(),
            metadata: {
                framework: detection?.framework || 'unknown',
                detected: detection?.detected || false,
            },
        };
    },

    attributeViolations(
        violations: AxeViolation[],
        _data: FrameworkScanData
    ): AttributedViolation[] {
        // Attribution happens in browser context via the bundle's attributeViolations().
        // This Node.js method is a passthrough — the real attribution is done
        // in orchestration.ts which calls window.Aria51ComponentPlugin.attributeViolations().
        return violations as unknown as AttributedViolation[];
    },
};
