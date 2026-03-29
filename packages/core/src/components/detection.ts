/**
 * Framework Detection
 *
 * Detects which UI framework is present on a page.
 * Used by the plugin's detect() method via Playwright page.evaluate().
 */

/**
 * Detection script to run in the browser context.
 * Returns the detected framework name or null.
 */
export function getDetectionScript(): string {
    return `
        (() => {
            // React / Preact
            if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
                if (window.__PREACT_DEVTOOLS__) return 'preact';
                return 'react';
            }
            // Check DOM for React fiber markers
            const sample = document.querySelectorAll('body *');
            for (let i = 0; i < Math.min(sample.length, 30); i++) {
                const keys = Object.keys(sample[i]);
                if (keys.some(k => k.startsWith('__reactFiber') || k.startsWith('__reactProps'))) return 'react';
                if (keys.some(k => k.startsWith('__r'))) return 'preact';
            }
            // Vue
            if (window.__VUE__) return 'vue';
            if (document.querySelector('[data-v-]')) return 'vue';
            for (let i = 0; i < Math.min(sample.length, 30); i++) {
                if (sample[i].__vue__ || sample[i].__vue_app__) return 'vue';
            }
            // Svelte
            if (window.__SVELTE_HMR) return 'svelte';
            if (document.querySelector('[class*="svelte-"]')) return 'svelte';
            // Solid
            for (let i = 0; i < Math.min(sample.length, 30); i++) {
                const keys = Object.keys(sample[i]);
                if (keys.some(k => k.startsWith('__r$'))) return 'solid';
            }
            return null;
        })()
    `;
}
