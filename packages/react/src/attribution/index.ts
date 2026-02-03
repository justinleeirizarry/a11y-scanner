/**
 * Violation attribution - maps axe violations to React components
 * Uses Bippy for direct DOM→fiber lookup when possible
 */

import { getFiberFromHostInstance, getFiberStack, getDisplayName } from 'bippy';
import type {
    AxeResult,
    AxeViolation,
    AxeCheckResult,
} from '@accessibility-toolkit/core';
import type {
    ComponentInfo,
    AttributedViolation,
    AttributedPass,
    AttributedIncomplete,
    AttributedCheck,
    AttributedViolationNode,
} from '../types.js';
import { findComponentForElement } from '../fiber/traversal.js';
import { filterUserComponents, isFrameworkComponent } from '../fiber/framework-filter.js';
import { generateCssSelector, extractHtmlSnippet } from './utils.js';

/**
 * Try to get component info directly from DOM element using Bippy
 */
function getComponentFromElement(element: Element): ComponentInfo | null {
    try {
        const fiber = getFiberFromHostInstance(element);
        if (!fiber) return null;

        const name = getDisplayName(fiber);
        if (!name) return null;

        // Get the fiber stack for the full component path
        const stack = getFiberStack(fiber);
        const path = stack
            .map((f: any) => getDisplayName(f))
            .filter((name: any): name is string => typeof name === 'string' && name.length > 0)
            .reverse();

        return {
            name,
            type: typeof fiber.type === 'string' ? 'host' : 'component',
            props: fiber.memoizedProps,
            domNode: element,
            path,
        };
    } catch {
        return null;
    }
}

/**
 * Convert axe check results to attributed checks with snippets
 */
function convertChecks(checks: AxeCheckResult[] | undefined): AttributedCheck[] | undefined {
    if (!checks || checks.length === 0) return undefined;

    return checks.map(check => ({
        id: check.id,
        impact: check.impact,
        message: check.message,
        relatedNodes: check.relatedNodes?.map(rn => ({
            html: rn.html,
            target: rn.target,
            htmlSnippet: extractHtmlSnippet(rn.html)
        }))
    }));
}

/**
 * Attribute violations to React components
 * Uses Bippy for direct DOM→fiber lookup when possible
 */
export function attributeViolationsToComponents(
    violations: AxeViolation[],
    domToComponentMap: Map<Element, ComponentInfo>
): AttributedViolation[] {
    const attributed: AttributedViolation[] = [];

    for (const violation of violations) {
        const attributedNodes: AttributedViolationNode[] = [];

        for (const node of violation.nodes) {
            // Get the first target selector (axe returns an array, first is most specific)
            const selector = node.target[0];

            let element: Element | null = null;
            let component: ComponentInfo | null = null;

            try {
                // Try to find the element using the selector
                element = document.querySelector(selector);

                if (element) {
                    // Try Bippy's direct lookup first (more accurate)
                    component = getComponentFromElement(element);

                    // Fallback to pre-built map if Bippy lookup fails
                    if (!component) {
                        component = findComponentForElement(element, domToComponentMap);
                    }
                }
            } catch (error) {
                console.warn(`Could not find element for selector: ${selector}`, error);
            }

            const userPath = component?.path ? filterUserComponents(component.path) : [];
            const isFramework = component ? isFrameworkComponent(component.name) : false;
            const cssSelector = element ? generateCssSelector(element) : node.target[0];
            const htmlSnippet = extractHtmlSnippet(node.html);

            // Build checks object if any check data exists
            const hasChecks = node.any?.length || node.all?.length || node.none?.length;
            const checks = hasChecks ? {
                any: convertChecks(node.any),
                all: convertChecks(node.all),
                none: convertChecks(node.none)
            } : undefined;

            attributedNodes.push({
                component: component?.name || null,
                componentPath: component?.path || [],
                userComponentPath: userPath,
                componentType: component ? (component.type as 'host' | 'component') : null,
                html: node.html,
                htmlSnippet,
                cssSelector,
                target: node.target,
                failureSummary: node.failureSummary || '',
                isFrameworkComponent: isFramework,
                checks,
            });
        }

        attributed.push({
            id: violation.id,
            impact: violation.impact,
            description: violation.description,
            help: violation.help,
            helpUrl: violation.helpUrl,
            tags: violation.tags || [],
            nodes: attributedNodes,
        });
    }

    return attributed;
}

/**
 * Attribute passes to React components (lighter attribution - just component name)
 */
export function attributePassesToComponents(
    passes: AxeResult[],
    domToComponentMap: Map<Element, ComponentInfo>
): AttributedPass[] {
    return passes.map(pass => ({
        id: pass.id,
        impact: pass.impact,
        description: pass.description,
        help: pass.help,
        helpUrl: pass.helpUrl,
        tags: pass.tags || [],
        nodes: pass.nodes.map(node => {
            const selector = node.target[0];
            let component: ComponentInfo | null = null;

            try {
                const element = document.querySelector(selector);
                if (element) {
                    component = getComponentFromElement(element) ||
                        findComponentForElement(element, domToComponentMap);
                }
            } catch {
                // Ignore selector errors
            }

            return {
                component: component?.name || null,
                html: node.html,
                htmlSnippet: extractHtmlSnippet(node.html),
                target: node.target
            };
        })
    }));
}

/**
 * Attribute incomplete results to React components
 */
export function attributeIncompleteToComponents(
    incomplete: AxeResult[],
    domToComponentMap: Map<Element, ComponentInfo>
): AttributedIncomplete[] {
    return incomplete.map(item => ({
        id: item.id,
        impact: item.impact,
        description: item.description,
        help: item.help,
        helpUrl: item.helpUrl,
        tags: item.tags || [],
        nodes: item.nodes.map(node => {
            const selector = node.target[0];
            let component: ComponentInfo | null = null;

            try {
                const element = document.querySelector(selector);
                if (element) {
                    component = getComponentFromElement(element) ||
                        findComponentForElement(element, domToComponentMap);
                }
            } catch {
                // Ignore selector errors
            }

            // Build checks object if any check data exists
            const hasChecks = node.any?.length || node.all?.length || node.none?.length;
            const checks = hasChecks ? {
                any: convertChecks(node.any),
                all: convertChecks(node.all),
                none: convertChecks(node.none)
            } : undefined;

            // Get reason for manual review from checks
            const message = node.any?.[0]?.message || node.all?.[0]?.message || undefined;

            return {
                component: component?.name || null,
                html: node.html,
                htmlSnippet: extractHtmlSnippet(node.html),
                target: node.target,
                message,
                checks
            };
        })
    }));
}
