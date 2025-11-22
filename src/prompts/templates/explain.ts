import type { PromptTemplate } from '../../types.js';
import { formatTechStack } from '../context-detector.js';
import { formatViolations } from '../formatters.js';

export const explainTemplate: PromptTemplate = {
    name: 'explain',
    description: 'Educational prompt to learn about accessibility violations',
    render: (context) => {
        const { violations, techStack, url, accessibilityTree } = context;

        const treeSummary = accessibilityTree
            ? JSON.stringify(accessibilityTree, null, 2).slice(0, 1000) + '...'
            : 'Not available';

        return `I'm learning about web accessibility and would like to understand these violations found in my application.

SCANNED URL: ${url}

TECH STACK:
${formatTechStack(techStack)}

ACCESSIBILITY TREE SNAPSHOT (Partial):
\`\`\`json
${treeSummary}
\`\`\`

VIOLATIONS FOUND:
${formatViolations(violations)}

For each violation, please explain:

1. **Why is this a problem?**
   - What accessibility barrier does this create?
   - Which users are most affected?

2. **WCAG Guidelines**
   - Which WCAG guideline(s) does this violate?
   - What level (A, AA, AAA)?

3. **User Impact**
   - How would a screen reader user experience this issue?
   - How would a keyboard-only user be affected?
   - What about users with visual impairments?

4. **Best Practice Solution**
   - What's the recommended fix?
   - Why is this the best approach?
   - Are there alternative solutions?

5. **Code Example**
   - Show the problematic code
   - Show the corrected code
   - Explain the difference

Please use simple, clear language and provide real-world examples where helpful.
Focus on helping me understand the "why" behind each fix, not just the "what".`;
    }
};
