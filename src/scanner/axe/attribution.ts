/**
 * Violation attribution - maps axe violations to React components
 */

import type { AxeViolation } from './runner.js';
import type { ComponentInfo } from '../../types.js';
import { findComponentForElement } from '../fiber/traversal.js';
import { filterUserComponents, isFrameworkComponent } from '../fiber/framework-filter.js';
import { generateCssSelector } from '../utils/css-selector.js';
import { extractHtmlSnippet } from '../utils/html-snippet.js';
import { generateFixSuggestion, type FixSuggestion } from '../suggestions/fix-generator.js';

export interface AttributedViolationNode {
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
}

export interface AttributedViolation {
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    help: string;
    helpUrl: string;
    nodes: AttributedViolationNode[];
    fixSuggestion?: FixSuggestion;
}

/**
 * Attribute violations to React components
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
                    // Find the component for this element
                    component = findComponentForElement(element, domToComponentMap);
                }
            } catch (error) {
                console.warn(`Could not find element for selector: ${selector}`, error);
            }

            const userPath = component?.path ? filterUserComponents(component.path) : [];
            const isFramework = component ? isFrameworkComponent(component.name) : false;
            const cssSelector = element ? generateCssSelector(element) : node.target[0];
            const htmlSnippet = extractHtmlSnippet(node.html);

            attributedNodes.push({
                component: component?.name || null,
                componentPath: component?.path || [],
                userComponentPath: userPath,
                componentType: component ? (component.type as 'host' | 'component') : null,
                html: node.html,
                htmlSnippet,
                cssSelector,
                target: node.target,
                failureSummary: node.failureSummary,
                isFrameworkComponent: isFramework,
            });
        }

        // Generate fix suggestion for this violation
        const fixSuggestion = generateFixSuggestion(violation.id);

        attributed.push({
            id: violation.id,
            impact: violation.impact,
            description: violation.description,
            help: violation.help,
            helpUrl: violation.helpUrl,
            nodes: attributedNodes,
            fixSuggestion,
        });
    }

    return attributed;
}
