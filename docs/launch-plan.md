# aria-51 Launch Plan

## What aria-51 Is

AI-native accessibility testing tool built as a TypeScript monorepo. Three interfaces: CLI (`aria51`), MCP server (`aria51-mcp`), and web dashboard. The tool combines deterministic scanning (axe-core, Playwright, 34 custom WCAG 2.2 checks, keyboard/structure/screen-reader audits) with an AI agent that crawls pages, verifies findings, and generates remediation plans.

**Key selling points:**
- Zero-config scans with no API key — `npx aria51 https://any-site.com` just works
- Focused audits (keyboard, structure, screen reader) that find things axe-core alone misses
- AI agent layer (gpt-4o-mini default, claude-sonnet-4-6 for best results) for full WCAG compliance reports
- MCP server with 9 tools so AI coding assistants can test accessibility directly
- Works as a CLI that any AI coding tool (Claude Code, Cursor, etc.) can call
- Framework component attribution (React, Vue, Svelte, Solid) maps violations to source components
- CI mode with threshold gating

## Positioning

**DO frame as:** "AI that helps developers find accessibility issues they'd miss"
**DO NOT frame as:** "AI that replaces accessibility auditors"

This is augmentation, not automation. The agent exists to fill in the human judgment gaps for WCAG criteria that can't be tested deterministically. The core scans work without AI and deliver value independently.

**Differentiator:** No other a11y tool is built to be used *by* AI coding assistants. The CLI and MCP integration mean Claude Code / Cursor / Windsurf can scan, interpret results, fix code, and re-scan in a loop. That workflow doesn't exist elsewhere.

---

## Content Strategy

### What Content MUST Include

1. **Real output from real websites.** Every piece of content should show aria-51 running against recognizable sites (GitHub, Hacker News, Amazon, Craigslist, Wikipedia, government sites). Never use example.com or toy apps.

2. **Specific findings that matter.** Examples we already have:
   - HN: 275 violations, 268 color-contrast issues (3.54:1 ratio vs required 4.5:1), only 3 of 227 interactive elements reachable via keyboard
   - Craigslist: no `lang` attribute, unlabeled form inputs, no landmarks
   - Wikipedia: 5 empty headings, duplicate unlabeled `contentinfo` landmarks
   - GitHub: successfully scans after CSP bypass fix — 4 violations, 49 passes, 72 tab-order + 104 focus-indicator + 15 widget keyboard issues

3. **What it catches that static tools miss.** The keyboard audit, structure audit, and screen reader audit find issues that axe-core DevTools and Lighthouse don't surface. This is the core value proposition for the non-AI tier.

4. **Stated limitations.** "It won't catch every accessibility issue. Manual testing with real assistive technology is still necessary. Here's what aria-51 is good at and what it's not." This builds trust — developer trust in AI tools is declining (70% to 60% favorable views).

5. **Working tool people can try immediately.** No waitlists, no email gates. Link to GitHub repo or `npm install`.

### What Content MUST NOT Include

1. **No superlatives.** Never say "first," "only," "revolutionary," "game-changing," or "democratize." Devin called itself "the world's first AI software engineer" — independent devs debunked their demos, found 15% success rate. Became a cautionary tale for AI overclaiming.

2. **No polished marketing videos.** Raw terminal recordings beat production quality for dev tools. If it looks too polished, developers assume it's fake.

3. **No "AI-powered" as the headline.** Say what it actually does. "Find accessibility violations axe-core misses" > "AI-powered accessibility testing."

4. **No automation framing.** Never position as replacing human expertise. "Catches what you'd miss" not "replaces your accessibility auditor."

5. **No inaccessible content.** Every video needs captions. The landing page must pass aria-51's own scan. People WILL check this on day one. An inaccessible demo for an a11y tool would be devastating.

6. **No example.com or contrived demos.** Real sites only. The contrast between "this popular site has these issues" vs "here's a fake site I made" is enormous.

---

## Content Pieces to Create

### 1. Screen Recordings (Primary Content)

**Tool:** Screen Studio (Mac, $89) — auto-zooms on cursor clicks, smooth movements, exports GIF and MP4.

**Short clips (30-60 sec, Twitter/X):**
- Record Claude Code running `aria51 https://news.ycombinator.com --quiet` — show results appearing
- Record `aria51 https://github.com --audit-keyboard` — show the keyboard findings
- Record `aria51 https://craigslist.org --audit-screen-reader` — show missing lang, unlabeled inputs
- No narration needed — terminal output speaks for itself

**Long demo (2-4 min, YouTube/landing page):**
- Structure: Problem (5 sec) → Command (10 sec) → Running against real site (30 sec) → Results with explanation (60 sec) → "Here's what it found that axe-core missed" (60 sec)
- Add voiceover, quiet room, decent mic
- Captions mandatory

**What to show:** The command, the output, the specific findings
**What to skip:** Installation, setup, configuration, anything that isn't results

### 2. "We Scanned 50 Popular Sites" Content Piece

Run aria-51 against 50 well-known websites across categories (tech, news, government, e-commerce, social media). Compile results into a data-driven blog post or thread.

**Format:**
- Summary table: site, violations, worst category, keyboard reachability %
- Highlight the most surprising findings
- Individual site results become separate Twitter posts for weeks of content
- This positions aria-51 as an authority without being salesy

**Sites to scan (suggestions):**
- Tech: GitHub, Stack Overflow, npm, MDN, Vercel, Netlify
- News: CNN, BBC, NYT, HN, Reddit
- Government: usa.gov, irs.gov, healthcare.gov
- E-commerce: Amazon, eBay, Etsy, Shopify stores
- Social: Twitter/X, LinkedIn, Discord, Twitch

### 3. Landing Page (Minimum Viable)

**Structure:**
1. Bold headline: what it does, not "AI-powered" (e.g., "Find the accessibility violations your tools miss")
2. Subheadline: one concrete benefit (e.g., "Keyboard audits, screen reader simulation, and WCAG 2.2 checks — no API key needed")
3. Terminal GIF showing real output as hero graphic
4. `npm install -g aria51` as primary CTA, "View on GitHub" as secondary
5. One section with real audit results from a recognizable site
6. Social proof section (tweets, GitHub stars, testimonials — even 2-3 work)
7. Bottom CTA

**Template:** Consider Evil Martians' LaunchKit (https://launchkit.evilmartians.io/) — open source, designed for dev tool landing pages.

**Critical:** Run aria-51 against this landing page before launch. Fix everything.

### 4. GitHub README

The README is often the first thing developers see. It should include:
- One-line description
- Terminal GIF showing a scan
- `npm install` + first command
- Feature list with what each tier does (scan, audit, agent)
- MCP setup instructions (for Claude Code / Cursor users)
- CI integration example
- Link to landing page / docs

### 5. HN "Show HN" Post

**Title format:** `Show HN: Aria-51 – accessibility testing that catches what axe-core misses`
- Link to GitHub repo, NOT marketing site
- Post Tuesday or Wednesday, 8-11am ET

**First comment (you write this, post immediately):**
- Start with "I built..."
- Explain the technical approach (axe-core + Playwright + custom WCAG 2.2 checks + keyboard simulation + AI agent)
- State what it catches that existing tools don't
- State limitations honestly
- Mention the MCP / CLI integration with AI coding assistants
- Keep it technical, humble, specific

**Engagement rules:**
- Answer every single comment
- When criticized, agree with something first, never be defensive
- Rally 3-10 people to upvote + leave thoughtful comments in first 10-30 minutes (velocity matters for HN ranking)
- Earlier in the week = better (newsletters like TLDR skim HN)

### 6. Twitter/X Launch Thread (4-8 tweets)

**Tweet 1 (lead):** GIF of aria-51 scanning a famous site + one-line hook. E.g., "I built an accessibility scanner that found 275 violations on Hacker News. Here's what axe-core missed: [GIF]"

**Tweet 2:** What the focused audits found (keyboard: only 3/227 elements reachable)

**Tweet 3:** The AI agent producing a full compliance report with remediation plan

**Tweet 4:** "It works as a CLI that Claude Code / Cursor can call directly" + GIF of AI assistant using it

**Tweet 5:** "No API key needed for scans. Agent uses gpt-4o-mini by default, Claude for best results"

**Tweet 6:** "Open source. npm install -g aria-51. GitHub link: [link]"

**Post between 9am-1pm ET on a weekday. Native video/GIF, never external links in the lead tweet.**

### 7. LinkedIn Post

- Native video (gets 5x engagement over link posts)
- Target: engineering managers and leads who care about compliance
- Lead with metrics: "We tested 50 popular websites for WCAG 2.2 compliance. X% failed keyboard navigation. Y% had no page language set."
- Mention the CI integration angle (automated a11y gating in pipelines)

### 8. Reddit Posts

- r/webdev, r/accessibility, r/programming
- Frame as value-first: "I tested 50 popular sites for accessibility, here's what I found" or "Lessons learned building an AI accessibility tool"
- Tool mention in first comment, not post body
- Need existing account activity (Reddit 90/10 rule: 90% participation, 10% self-promotion)

---

## Launch Day Sequence

| Time (ET) | Action |
|-----------|--------|
| 8-9am Tue/Wed | Post Show HN + detailed first comment |
| 9-10am | Post Twitter/X thread with best GIF as lead |
| 10-11am | LinkedIn post with native video + metrics |
| All day | Engage on all platforms, respond to every comment |
| Day 2-3 | Post individual site audit results as separate X posts |
| Week 1-2 | Reddit posts (value-first framing), Discord communities |
| Week 2-3 | Technical blog post about the approach |

---

## Reference: Successful AI Dev Tool Launches

| Tool | Launch Approach | Result |
|------|----------------|--------|
| **Bolt.new** | Single tweet, zero marketing spend, users posted demos | $0 → $4M ARR in 30 days, $40M in 5 months |
| **Cursor** | Free tier, pure word-of-mouth, no flashy launch | Fastest SaaS to $100M ARR (12 months) |
| **Claude Code** | "Research preview" blog post, understated | Organic discovery, developer conference later |
| **Devin** | "World's first AI software engineer" hype | Debunked demos, 15% success rate, brand damaged |
| **Stagehand** | Open-source GitHub-first, concrete benchmarks | Community-driven, "44% faster" in v3 announcement |

**Lesson:** Product-led, honest, show-don't-tell launches with working tools beat hype-driven announcements every time. Developers verify claims.

---

## Technical Assets Needed

- [ ] Batch scan script to audit 50+ popular sites and compile results
- [ ] Screen recordings (Screen Studio) of CLI against real sites
- [ ] Screen recording of Claude Code using aria-51 tools in a real workflow (scan → fix → re-scan)
- [ ] Landing page (LaunchKit template or custom)
- [ ] Landing page passes aria-51's own scan
- [ ] GitHub README with GIF demo and clear install instructions
- [ ] MCP setup instructions for Claude Code / Cursor
- [ ] Blog post: "What we found scanning 50 popular sites for accessibility"
- [ ] Captioned versions of all video content
