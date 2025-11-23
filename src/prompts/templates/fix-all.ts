import type { PromptTemplate } from '../../types.js';
import { formatViolationSummary, formatViolations } from '../formatters.js';

export const fixAllTemplate: PromptTemplate = {
    name: 'fix-all',
    description: 'Comprehensive prompt to fix all accessibility violations',
    render: (context) => {
        const { violations, url, summary } = context;

        return `# Accessibility Fix Request

You are an expert React developer and accessibility specialist.
I need you to fix ALL accessibility violations in my application.

## Scan Context
**URL:** ${url}

### Summary
- **Total Components:** ${summary.totalComponents}
- **Components with Issues:** ${summary.componentsWithViolations}
- **Total Violations:** ${summary.totalViolations}

### Violations by Severity
${formatViolationSummary(violations)}

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
