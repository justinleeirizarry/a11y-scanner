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
              axe-core engine plus 34 custom WCAG 2.2 checks. Framework
              component attribution for React, Vue, Svelte, and Solid.
              No API key required.
            </p>
          </div>
          <div className="mode-card">
            <div className="mode-card-label">Focused Audits</div>
            <code>--audit-keyboard</code><br />
            <code>--audit-structure</code><br />
            <code>--audit-screen-reader</code>
            <p className="mode-card-desc">
              Tab order, focus traps, skip links. Landmarks, headings, form
              labels. Alt text, ARIA roles, live regions. The things rule
              engines can't test.
            </p>
          </div>
          <div className="mode-card">
            <div className="mode-card-label">AI Agent</div>
            <code>--agent</code>
            <p className="mode-card-desc">
              Autonomous multi-page audit. Crawls your site, runs every check,
              and generates a phased remediation plan. Uses gpt-4o-mini by
              default, Claude for best results.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
