import type { PromptTemplate } from '../../types.js';
import { formatViolationSummary, formatViolations } from '../formatters.js';

export const fixAllTemplate: PromptTemplate = {
    name: 'fix-all',
    description: 'Comprehensive prompt to fix all accessibility violations',
    render: (context) => {
        const { violations, url, summary } = context;

        // Format WCAG level breakdown if available
        let wcagBreakdown = '';
        if (summary.violationsByWcagLevel) {
            const levels = summary.violationsByWcagLevel;
            const parts: string[] = [];
            const levelA = (levels.wcag2a || 0) + (levels.wcag21a || 0);
            const levelAA = (levels.wcag2aa || 0) + (levels.wcag21aa || 0) + (levels.wcag22aa || 0);
            if (levelA > 0) parts.push(`Level A: ${levelA}`);
            if (levelAA > 0) parts.push(`Level AA: ${levelAA}`);
            if (levels.wcag2aaa && levels.wcag2aaa > 0) parts.push(`Level AAA: ${levels.wcag2aaa}`);
            if (levels.bestPractice && levels.bestPractice > 0) parts.push(`Best Practice: ${levels.bestPractice}`);
            if (parts.length > 0) {
                wcagBreakdown = `\n### By WCAG Level\n${parts.map(p => `- ${p}`).join('\n')}\n`;
            }
        }

        // Add passes context if available
        const passesNote = summary.totalPasses > 0
            ? `\n> Note: ${summary.totalPasses} accessibility rules are already passing.\n`
            : '';

        // Add incomplete note if needed
        const incompleteNote = summary.totalIncomplete > 0
            ? `\n> ${summary.totalIncomplete} items need manual review (not included below).\n`
            : '';

        return `# Accessibility Fix Request

You are an expert React developer and accessibility specialist.
I need you to fix ALL accessibility violations in my application.

## Scan Context
**URL:** ${url}

### Summary
- **Total Components:** ${summary.totalComponents}
- **Components with Issues:** ${summary.componentsWithViolations}
- **Total Violations:** ${summary.totalViolations}
- **Rules Passing:** ${summary.totalPasses || 0}

### Violations by Severity
${formatViolationSummary(violations)}
${wcagBreakdown}${passesNote}${incompleteNote}
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
