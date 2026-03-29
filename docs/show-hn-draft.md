# Show HN Draft

## Title

Show HN: Aria-51 - Open-source accessibility testing that catches what axe-core misses

## Link

https://github.com/justinirizarry/aria-51

## First Comment (post immediately after submitting)

---

I built this because I kept running into the same problem: axe-core and Lighthouse catch the obvious stuff (missing alt text, color contrast), but miss entire categories of WCAG 2.2 issues — keyboard navigation, heading structure, screen reader compatibility, focus management. And the manual testing to cover those gaps takes hours.

aria-51 is an open-source CLI that combines axe-core with three focused audits that use Playwright to actually test the page:

- **Keyboard audit** — presses Tab through the page, counts reachable elements, detects focus traps, checks for skip links and focus indicators. When I ran this on HN, only 3 of 227 interactive elements were reachable via keyboard.

- **Structure audit** — checks heading hierarchy, landmark regions, form labels, and duplicate/unlabeled landmarks. Wikipedia has 5 empty headings and duplicate unlabeled contentinfo landmarks.

- **Screen reader audit** — checks everything a screen reader user would encounter: page language, alt text, link/button names, form labels, ARIA live regions. Craigslist has no `lang` attribute on `<html>` and unlabeled form inputs.

None of these require an API key. It's all Playwright + axe-core + 34 custom WCAG 2.2 checks running locally.

There's also an optional AI agent mode (gpt-4o-mini by default, Claude for better results) that crawls multiple pages, cross-references its findings against axe-core to assign confidence levels, and generates a prioritized remediation plan. This is for when you want a full compliance audit rather than a quick check.

**What it's NOT:** A replacement for manual accessibility testing with real assistive technology. Screen reader simulation is not the same as actual VoiceOver/NVDA testing. The AI agent will have false positives. I'm upfront about this because I think the worst thing you can do with accessibility tooling is give people false confidence.

**What I think is interesting about this technically:**

- The scanner bundle is injected as an IIFE into the page via Playwright, so it runs the same way a browser extension would. We recently added `bypassCSP: true` so it works on sites with strict Content Security Policy (GitHub, Stripe, etc.).

- It works as both a CLI and an MCP server, which means AI coding assistants (Claude Code, Cursor, etc.) can use it directly. The workflow becomes: scan a URL, see violations, fix the code, re-scan to verify — all within the assistant's loop.

- The audit functions are framework-agnostic but optionally detect React/Vue/Svelte/Solid components and map violations back to source components using source maps.

Stack: TypeScript monorepo (pnpm), Playwright, axe-core, Effect for error handling, Zod for schemas. ~37K lines, 632 tests.

Install: `npm install -g aria-51` then `aria51 https://your-site.com`

Happy to answer questions about the approach or take feedback on what's missing.

---

## Notes for Justin

**Tone:** Technical, specific, humble. No marketing language. Leads with concrete findings on real sites. States limitations before anyone asks. Ends with an invitation for feedback.

**Things to customize before posting:**
- Update the HN/Wikipedia/Craigslist findings with whatever the latest scan numbers are (they may change)
- Add any npm download count or GitHub stars if available by launch day
- If you've added features since this draft, mention them
- Consider adding one sentence about your background/motivation if it's relevant

**What to do when comments come in:**
- Answer every comment, especially critical ones
- If someone says "axe-core already does X" — agree, explain what aria-51 adds on top
- If someone questions the AI angle — emphasize the no-API-key tier works standalone, AI is optional
- If someone finds a bug or false positive — thank them, file an issue, don't be defensive
- If someone asks about pricing — it's open source, MIT license, free forever for the CLI
