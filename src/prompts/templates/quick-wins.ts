import type { PromptTemplate } from '../../types.js';
import { formatTechStack } from '../context-detector.js';
import { getQuickWins, formatViolations } from '../formatters.js';

export const quickWinsTemplate: PromptTemplate = {
    name: 'quick-wins',
    description: 'Focus on easy, high-impact fixes first',
    render: (context) => {
        const { violations, techStack, url } = context;
        const quickWins = getQuickWins(violations);

        if (quickWins.length === 0) {
            return `Great news! There are no quick-win accessibility violations to fix.

The remaining ${violations.length} violation(s) may require more architectural changes.
Consider using the 'fix-all' template for comprehensive fixes.`;
        }

        return `Let's start with the quick wins - easy accessibility fixes that have high impact.

SCANNED URL: ${url}

TECH STACK:
${formatTechStack(techStack)}

QUICK WIN VIOLATIONS (${quickWins.length} out of ${violations.length} total):
${formatViolations(quickWins)}

These are typically the easiest fixes:
- Adding alt text to images
- Adding labels to form inputs
- Adding accessible names to buttons/links
- Setting the page language
- Adding a document title

TASK:
Please provide quick fixes for these violations. Focus on:
1. Simple, straightforward solutions
2. Minimal code changes
3. Maximum accessibility impact

For each fix, provide:
- The updated code
- One-line explanation of what changed

Let's knock these out quickly, then we can tackle the more complex issues!`;
    }
};
