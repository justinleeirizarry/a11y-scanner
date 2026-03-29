import { SectionHeading } from './SectionHeading';

export function ThreeModes() {
  return (
    <section className="section" aria-labelledby="modes-heading">
      <div className="container">
        <SectionHeading>Three ways to test</SectionHeading>
        <div className="modes-grid">
          <div className="mode-card">
            <div className="mode-card-label">Scan</div>
            <code>npx aria51 https://site.com</code>
            <p className="mode-card-desc">
              axe-core plus WCAG 2.2 supplemental checks and keyboard
              navigation — all in one pass. Traces each violation back to the
              React, Vue, Svelte, or Solid component that owns it.
            </p>
          </div>
          <div className="mode-card">
            <div className="mode-card-label">Focused Audits</div>
            <code>--audit-keyboard</code><br />
            <code>--audit-structure</code><br />
            <code>--audit-screen-reader</code>
            <p className="mode-card-desc">
              Tab order, focus traps, skip links. Landmarks, headings, form
              labels. Alt text, ARIA roles, live regions. Add{' '}
              <code>--deep</code> for AI-enhanced analysis on any audit.
            </p>
          </div>
          <div className="mode-card">
            <div className="mode-card-label">AI Agent</div>
            <code>--agent</code>
            <p className="mode-card-desc">
              Autonomous multi-page audit. Crawls your site, runs every check,
              and generates a phased remediation plan.{' '}
              <code>--specialists</code> runs four parallel auditors.
              Requires an API key.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
