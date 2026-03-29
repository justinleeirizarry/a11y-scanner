/**
 * Browser Bundle — Component Attribution via element-source
 *
 * This file is compiled by esbuild into an IIFE that gets injected into
 * scanned pages. It exposes window.Aria51ComponentPlugin with methods
 * for detecting frameworks and attributing violations to components.
 *
 * Works with: React, Preact, Vue, Svelte, Solid
 */
import { resolveElementInfo, resolveComponentName } from 'element-source';
import {
    resolveComponent,
    buildAttributedNode,
    type ResolvedComponent,
    type AttributedNode,
    type SourceLocation,
} from './attribution/index.js';
import { extractHtmlSnippet } from './attribution/utils.js';

// =============================================================================
// Framework Detection
// =============================================================================

interface DetectionResult {
    detected: boolean;
    framework: string | null;
}

async function detect(): Promise<DetectionResult> {
    // Sample a few DOM elements and try to resolve them
    const elements = document.querySelectorAll('body *');
    const sampleSize = Math.min(20, elements.length);
    const indices = new Set<number>();
    while (indices.size < sampleSize && indices.size < elements.length) {
        indices.add(Math.floor(Math.random() * elements.length));
    }

    for (const idx of indices) {
        try {
            const info = await resolveElementInfo(elements[idx]);
            if (info && info.componentName) {
                // element-source resolved a component — a framework is present
                // Infer which framework from hints
                const framework = inferFramework();
                return { detected: true, framework };
            }
        } catch {
            // element-source couldn't resolve this element — try next
        }
    }

    return { detected: false, framework: null };
}

function inferFramework(): string {
    // Check for framework-specific globals
    if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) return 'react';
    if ((window as any).__VUE__) return 'vue';
    if ((window as any).__SVELTE_HMR) return 'svelte';
    // Check for Preact
    if ((window as any).__PREACT_DEVTOOLS__) return 'preact';
    // Check for common markers on DOM elements
    const sample = document.querySelector('[data-reactroot], [data-reactid]');
    if (sample) return 'react';
    const vueEl = document.querySelector('[data-v-]');
    if (vueEl) return 'vue';
    return 'unknown';
}

// =============================================================================
// Violation Attribution
// =============================================================================

interface RawViolation {
    id: string;
    impact: string;
    description: string;
    help: string;
    helpUrl: string;
    tags: string[];
    wcagCriteria?: any[];
    fixSuggestion?: any;
    nodes: Array<{
        html: string;
        target: string[];
        failureSummary?: string;
        any?: any[];
        all?: any[];
        none?: any[];
    }>;
}

interface AttributedViolation {
    id: string;
    impact: string;
    description: string;
    help: string;
    helpUrl: string;
    tags: string[];
    wcagCriteria?: any[];
    fixSuggestion?: any;
    nodes: AttributedNode[];
}

interface AttributionResult {
    components: Array<{
        name: string;
        type: string;
        path: string[];
        source?: SourceLocation;
        sourceStack?: SourceLocation[];
    }>;
    violations: AttributedViolation[];
    passes: any[];
    incomplete: any[];
}

async function attributeViolations(
    violations: RawViolation[],
    passes: any[] = [],
    incomplete: any[] = []
): Promise<AttributionResult> {
    const componentSet = new Map<string, ResolvedComponent>();

    // Attribute violations
    const attributedViolations: AttributedViolation[] = [];

    for (const violation of violations) {
        const attributedNodes: AttributedNode[] = [];

        for (const node of violation.nodes) {
            const selector = node.target?.[0];
            let element: Element | null = null;
            let component: ResolvedComponent | null = null;

            if (selector) {
                try {
                    element = document.querySelector(selector);
                } catch {
                    // Invalid selector — skip DOM lookup
                }
            }

            if (element) {
                try {
                    const info = await resolveElementInfo(element);
                    component = resolveComponent(info);

                    if (component) {
                        componentSet.set(component.name, component);
                    }
                } catch {
                    // element-source couldn't resolve — no attribution for this node
                }
            }

            attributedNodes.push(buildAttributedNode(node, element, component));
        }

        attributedViolations.push({
            ...violation,
            nodes: attributedNodes,
        });
    }

    // Attribute passes (lightweight — just component name)
    const attributedPasses = await attributeSimple(passes, componentSet);

    // Attribute incomplete (lightweight)
    const attributedIncomplete = await attributeSimple(incomplete, componentSet);

    // Collect all unique components found
    const components = [...componentSet.values()].map((c) => ({
        name: c.name,
        type: 'component',
        path: c.path,
        source: c.source,
        sourceStack: c.stack,
    }));

    return {
        components,
        violations: attributedViolations,
        passes: attributedPasses,
        incomplete: attributedIncomplete,
    };
}

async function attributeSimple(
    items: any[],
    componentSet: Map<string, ResolvedComponent>
): Promise<any[]> {
    if (!items || items.length === 0) return [];

    return Promise.all(
        items.map(async (item) => {
            const nodes = await Promise.all(
                (item.nodes || []).map(async (node: any) => {
                    let componentName: string | null = null;
                    const selector = node.target?.[0];
                    if (selector) {
                        try {
                            const el = document.querySelector(selector);
                            if (el) {
                                componentName = await resolveComponentName(el);
                            }
                        } catch {
                            // skip
                        }
                    }
                    return {
                        component: componentName,
                        html: node.html || '',
                        htmlSnippet: extractHtmlSnippet(node.html || ''),
                        target: node.target || [],
                    };
                })
            );
            return { ...item, nodes };
        })
    );
}

// =============================================================================
// Expose on window
// =============================================================================

const plugin = { detect, attributeViolations };
(window as any).Aria51ComponentPlugin = plugin;

export { detect, attributeViolations };
