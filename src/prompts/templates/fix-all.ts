import type { PromptTemplate } from '../../types.js';
import { formatViolations } from '../formatters.js';

export const fixAllTemplate: PromptTemplate = {
    name: 'fix-all',
    description: 'Comprehensive prompt to fix all accessibility violations',
    render: (context) => {
        const { violations, url, summary } = context;

        // Count violations (rules) by severity from the violations array
        const rulesBySeverity = violations.reduce((acc, v) => {
            acc[v.impact] = (acc[v.impact] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Format severity breakdown for rules
        const severityLines: string[] = [];
        if (rulesBySeverity.critical) severityLines.push(`- Critical: ${rulesBySeverity.critical}`);
        if (rulesBySeverity.serious) severityLines.push(`- Serious: ${rulesBySeverity.serious}`);
        if (rulesBySeverity.moderate) severityLines.push(`- Moderate: ${rulesBySeverity.moderate}`);
        if (rulesBySeverity.minor) severityLines.push(`- Minor: ${rulesBySeverity.minor}`);

        // Count total instances across all violations
        const totalInstances = violations.reduce((acc, v) => acc + v.nodes.length, 0);

        // Add passes context if available
        const passesNote = summary.totalPasses > 0
            ? `\n> ${summary.totalPasses} accessibility rules are passing.`
            : '';

        // Add incomplete note if needed
        const incompleteNote = summary.totalIncomplete > 0
            ? `\n> ${summary.totalIncomplete} items need manual review (not included below).`
            : '';

        return `# Accessibility Fix Request

You are an expert React developer and accessibility specialist.
I need you to fix ALL accessibility violations in my application.

## Scan Context
**URL:** ${url}

### Summary
- **Total Components:** ${summary.totalComponents}
- **Components with Issues:** ${summary.componentsWithViolations}
- **Violated Rules:** ${violations.length}
- **Total Instances:** ${totalInstances}

### Rules by Severity
${severityLines.length > 0 ? severityLines.join('\n') : '- None'}
${passesNote}${incompleteNote}

## Detailed Violations
${formatViolations(violations)}

## Requirements
1. **Fix all violations** while maintaining existing functionality
2. Use **semantic HTML** where possible (prefer <main>, <nav>, <header>, <footer> over <div>)
3. Add **ARIA attributes** only when semantic HTML is not sufficient
4. Ensure **keyboard navigation** works correctly
5. Maintain current styling and layout
6. Follow **WCAG 2.1 AA** guidelines

## Deliverables
Please provide:
- Updated code for each affected component
- Brief explanation of each change
- Any additional accessibility improvements you recommend

## Focus Areas
- Screen reader users
- Keyboard-only users
- Users with visual impairments
- Users with motor disabilities`;
    }
};
