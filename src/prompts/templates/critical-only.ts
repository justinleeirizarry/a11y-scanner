import type { PromptTemplate } from '../../types.js';
import { formatTechStack } from '../context-detector.js';
import { getCriticalViolations, formatViolations } from '../formatters.js';

export const criticalOnlyTemplate: PromptTemplate = {
    name: 'critical-only',
    description: 'Focus on critical and serious violations only',
    render: (context) => {
        const { violations, techStack, url, summary } = context;
        const criticalViolations = getCriticalViolations(violations);

        if (criticalViolations.length === 0) {
            return `Excellent! There are no critical or serious accessibility violations.

You have ${violations.length} moderate/minor violation(s) remaining.
These are important but not blocking. Consider using the 'fix-all' template to address them.`;
        }

        return `URGENT: Critical accessibility violations need immediate attention.

SCANNED URL: ${url}

TECH STACK:
${formatTechStack(techStack)}

CRITICAL/SERIOUS VIOLATIONS (${criticalViolations.length} out of ${summary.totalViolations} total):
${formatViolations(criticalViolations)}

⚠️  These violations are blocking users from accessing your application.
They must be fixed before deployment.

PRIORITY FIXES NEEDED:
Critical violations prevent users from:
- Navigating the page
- Understanding content
- Completing essential tasks
- Using assistive technologies

TASK:
Fix these critical violations immediately. For each:
1. Provide the corrected code
2. Explain why this was critical
3. Verify the fix doesn't break existing functionality

After fixing these, run the scanner again to check for remaining issues.`;
    }
};
