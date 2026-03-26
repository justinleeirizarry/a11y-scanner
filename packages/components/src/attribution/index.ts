/**
 * Component Attribution
 *
 * Maps axe-core violation nodes to framework components using element-source.
 * Works with React, Preact, Vue, Svelte, and Solid — no framework-specific
 * tree traversal needed.
 */
import type { ElementInfo } from 'element-source';
import {
    generateCssSelector,
    extractHtmlSnippet,
    cleanFilePath,
    isFrameworkComponent,
    filterUserComponents,
} from './utils.js';

/**
 * Source location from element-source.
 */
export interface SourceLocation {
    filePath: string;
    lineNumber: number | null;
    columnNumber: number | null;
    componentName?: string | null;
}

/**
 * Component info resolved from a DOM element.
 */
export interface ResolvedComponent {
    name: string;
    source?: SourceLocation;
    stack: SourceLocation[];
    path: string[];
}

/**
 * Attributed violation node — a violation element with component info attached.
 */
export interface AttributedNode {
    component: string | null;
    componentPath: string[];
    userComponentPath: string[];
    componentType: 'host' | 'component' | null;
    html: string;
    htmlSnippet: string;
    cssSelector: string;
    target: string[];
    failureSummary: string;
    isFrameworkComponent: boolean;
    source?: SourceLocation;
    sourceStack?: SourceLocation[];
}

/**
 * Resolve a DOM element to its component info using element-source.
 * This is the core function — called for each violation node.
 */
export function resolveComponent(
    elementInfo: ElementInfo | null
): ResolvedComponent | null {
    if (!elementInfo || !elementInfo.componentName) return null;

    const stack: SourceLocation[] = (elementInfo.stack || []).map((frame) => ({
        filePath: cleanFilePath(frame.filePath),
        lineNumber: frame.lineNumber ?? null,
        columnNumber: frame.columnNumber ?? null,
        componentName: frame.componentName ?? null,
    }));

    const source = elementInfo.source
        ? {
              filePath: cleanFilePath(elementInfo.source.filePath),
              lineNumber: elementInfo.source.lineNumber ?? null,
              columnNumber: elementInfo.source.columnNumber ?? null,
              componentName: elementInfo.source.componentName ?? null,
          }
        : stack[0] || undefined;

    const path = stack
        .map((f) => f.componentName)
        .filter((n): n is string => n !== null && n !== undefined);

    return {
        name: elementInfo.componentName,
        source,
        stack,
        path,
    };
}

/**
 * Build an AttributedNode from a violation node and its resolved component.
 */
export function buildAttributedNode(
    node: {
        html: string;
        target: string[];
        failureSummary?: string;
    },
    element: Element | null,
    component: ResolvedComponent | null
): AttributedNode {
    const htmlSnippet = extractHtmlSnippet(node.html);
    const cssSelector = element ? generateCssSelector(element) : node.target?.[0] || '';
    const componentPath = component?.path || [];
    const userPath = filterUserComponents(componentPath);
    const isFramework = component ? isFrameworkComponent(component.name) : false;

    return {
        component: component?.name || null,
        componentPath,
        userComponentPath: userPath,
        componentType: component ? 'component' : null,
        html: node.html,
        htmlSnippet,
        cssSelector,
        target: node.target || [],
        failureSummary: node.failureSummary || '',
        isFrameworkComponent: isFramework,
        source: component?.source,
        sourceStack: component?.stack,
    };
}
