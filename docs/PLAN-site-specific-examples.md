# Plan: Site-Specific Code Examples

## Overview

Generate code examples based on the actual scanned elements rather than generic hardcoded examples. This makes fix suggestions immediately actionable since they reference the user's actual code.

## Current State

- Fix suggestions show generic guidance (summary, details, user impact)
- `helpUrl` links to axe-core docs for comprehensive examples
- We capture the actual HTML of failing elements in `node.html` and `node.htmlSnippet`
- We have React component context via Fiber traversal (`componentPath`, `component`)

## Data Already Available

For each violation node we have:
- `html` - Full HTML of the failing element
- `htmlSnippet` - Truncated version for display
- `target` - CSS selector array
- `component` - React component name
- `componentPath` - Full React component hierarchy
- `failureSummary` - axe-core's specific failure reason
- `checks.any/all/none` - Detailed check results with messages

## Proposed Enhancement

### Phase 1: Show Actual Failing Elements

Display the actual HTML that needs fixing alongside what's missing:

```
button-name violation in <IconButton>

Current:
  <button class="close-btn"><svg>...</svg></button>

Missing: accessible name (aria-label, aria-labelledby, or text content)
```

**Implementation:**
1. Update `ViolationCard.tsx` to show `htmlSnippet` more prominently
2. Parse `failureSummary` to extract what's specifically missing
3. Format as "Current" vs "Missing" view

### Phase 2: Generate Fix Suggestions from Element Context

For common violations, generate specific suggestions based on the element:

| Violation | Element Context | Generated Suggestion |
|-----------|-----------------|---------------------|
| `button-name` | `<button class="close-btn">` | Add `aria-label="Close"` |
| `image-alt` | `<img src="logo.png">` | Add `alt="..."` describing the image |
| `link-name` | `<a href="/profile">` | Add text content or `aria-label` |
| `label` | `<input type="email">` | Add `<label>` or `aria-label="Email"` |
| `color-contrast` | Has computed colors | Show current ratio, suggest minimum colors |

**Implementation:**
1. Create `src/scanner/suggestions/element-analyzer.ts`
2. Parse element HTML to extract tag, attributes, classes
3. Generate contextual suggestions based on element type and violation
4. Add `generateContextualFix(violationId, element)` function

### Phase 3: Show Before/After with Actual Element

Generate a before/after diff using the actual element:

```
button-name in <IconButton>

Before:
  <button class="close-btn">
    <svg>...</svg>
  </button>

After (suggested):
  <button class="close-btn" aria-label="Close dialog">
    <svg>...</svg>
  </button>
```

**Implementation:**
1. Create `src/scanner/suggestions/fix-renderer.ts`
2. Parse HTML, inject the fix, re-render
3. Show side-by-side or diff view
4. Handle JSX vs HTML output format

### Phase 4: React Component Context

Leverage Fiber data for React-specific suggestions:

```
button-name in IconButton (src/components/IconButton.tsx)

The IconButton component renders a button without accessible text.

Suggested fix in your component:
  <button aria-label={props.label || "Icon button"}>
    {props.icon}
  </button>
```

**Implementation:**
1. Use `componentPath` to identify the source component
2. Generate React/JSX suggestions instead of raw HTML
3. Consider props that might already exist (like `label`, `title`, `name`)

## File Structure

```
src/scanner/suggestions/
├── fix-generator.ts          # Existing - static suggestions
├── element-analyzer.ts       # NEW - parse element context
├── fix-renderer.ts           # NEW - generate before/after
└── contextual-suggestions.ts # NEW - violation-specific generators
```

## API Design

```typescript
interface ContextualFix {
  current: string;           // The actual failing HTML
  issue: string;             // What's specifically wrong
  suggestion: string;        // What to add/change
  fixed?: string;            // Generated fixed version
  reactSuggestion?: string;  // React/JSX version if applicable
}

function generateContextualFix(
  violationId: string,
  node: AttributedViolationNode
): ContextualFix | undefined;
```

## Priority Order

1. **Phase 1** - Quick win, just reformats existing data better
2. **Phase 2** - High value, makes suggestions actionable
3. **Phase 3** - Nice to have, visual improvement
4. **Phase 4** - Advanced, requires more Fiber integration

## Violations to Support First

Start with the most common violations that have clear fixes:

1. `button-name` - Add aria-label with contextual text
2. `image-alt` - Add alt attribute
3. `link-name` - Add aria-label or text
4. `label` - Add label element or aria-label
5. `color-contrast` - Show current/required contrast values
6. `aria-required-attr` - Show which attributes are missing

## Testing Strategy

1. Unit tests with sample HTML elements for each violation type
2. Integration tests scanning test fixtures
3. Snapshot tests for generated suggestions

## Dependencies

- HTML parser (could use browser's DOMParser in browser bundle)
- Possibly a simple diff library for before/after view

## Estimated Effort

- Phase 1: 2-4 hours
- Phase 2: 4-8 hours
- Phase 3: 4-6 hours
- Phase 4: 8-12 hours

## Phase 5: AI Agent Integration (Future Goal)

Generate component-specific prompts that AI agents can use to fix violations with full context.

### Vision

Each violation becomes an actionable prompt with:
- The exact component and file path
- The failing element HTML
- The React component hierarchy
- What's wrong and what's needed
- Surrounding code context (if source maps available)

### Output Format

```markdown
## Fix: button-name in IconButton

**File:** src/components/IconButton.tsx
**Component Path:** App > Header > IconButton
**Severity:** Critical

### Current Code
The IconButton component renders a button without accessible text:

```jsx
<button className="close-btn" onClick={onClose}>
  <CloseIcon />
</button>
```

### Issue
Screen readers announce this as "button" with no context. Users cannot determine the button's purpose.

### Required Fix
Add an accessible name using one of:
- `aria-label` attribute
- Visible text content
- `aria-labelledby` referencing visible text

### Suggested Implementation
```jsx
<button
  className="close-btn"
  onClick={onClose}
  aria-label="Close dialog"
>
  <CloseIcon />
</button>
```

### WCAG Reference
- Success Criterion 4.1.2 Name, Role, Value (Level A)
- [Deque Documentation](https://dequeuniversity.com/rules/axe/4.8/button-name)
```

### Implementation Path

1. **Source Map Integration** - Map component paths to actual source files
2. **Code Context Extraction** - Pull surrounding code from source files
3. **Prompt Templates** - Per-violation-type templates optimized for AI agents
4. **Export Formats:**
   - Individual `.md` files per violation
   - Single prompt file for batch fixing
   - GitHub Issues format
   - Linear/Jira ticket format
5. **Claude Code Integration** - Generate prompts that work with `/fix` commands

### CLI Flags

```bash
# Generate AI prompts for all violations
a11y-scan https://example.com --ai-prompts

# Generate prompts for specific severity
a11y-scan https://example.com --ai-prompts --severity critical,serious

# Output as individual files
a11y-scan https://example.com --ai-prompts --output-dir ./a11y-fixes/

# Include source context (requires source maps)
a11y-scan https://example.com --ai-prompts --include-source
```

### Data Flow

```
Scan Results
    ↓
Component Attribution (Fiber)
    ↓
Source File Mapping (optional)
    ↓
Prompt Template Selection
    ↓
Context Assembly
    ↓
AI-Ready Prompt Output
```

### Integration Points

- **Claude Code** - User runs scan, gets prompts, pastes into Claude Code
- **GitHub Actions** - CI generates issues/PRs with fix prompts
- **VS Code Extension** - Inline fix suggestions with AI prompts
- **MCP Server** - AI agents call scan, get structured fix data

---

## Open Questions

1. Should we try to infer aria-label text from context (class names, nearby text)?
2. How to handle complex nested elements?
3. Should fixed suggestions be copyable to clipboard?
4. HTML report with interactive examples?
5. How to handle source map loading for production builds?
6. Should prompts include test code to verify the fix?
