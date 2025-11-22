import type { PromptTemplate } from '../../types.js';
import { formatViolationSummary, formatViolations } from '../formatters.js';

export const fixAllTemplate: PromptTemplate = {
    name: 'fix-all',
    description: 'Comprehensive prompt to fix all accessibility violations',
    render: (context) => {
        const { violations, url, summary } = context;

        return `You are an expert React developer and accessibility specialist.

I need you to fix ALL accessibility violations in my application.

SCANNED URL: ${url}

SCAN SUMMARY:
- Total Components Scanned: ${summary.totalComponents}
- Components with Issues: ${summary.componentsWithViolations}
- Total Violations: ${summary.totalViolations}

VIOLATIONS BY SEVERITY:
${formatViolationSummary(violations)}

DETAILED VIOLATIONS:
${formatViolations(violations)}

REQUIREMENTS:
1. Fix all violations while maintaining existing functionality
2. Use semantic HTML where possible (prefer <main>, <nav>, <header>, <footer> over <div>)
3. Add ARIA attributes only when semantic HTML is not sufficient
4. Ensure keyboard navigation works correctly
5. Maintain current styling and layout
6. Follow WCAG 2.1 AA guidelines

Please provide:
- Updated code for each affected component
- Brief explanation of each change
- Any additional accessibility improvements you recommend

Focus on making the application accessible to:
- Screen reader users
- Keyboard-only users
- Users with visual impairments
- Users with motor disabilities`;
    }
};
