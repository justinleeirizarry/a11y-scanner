import { SectionHeading } from './SectionHeading';

export function ThreeModes() {
  return (
    <section className="section" aria-labelledby="modes-heading">
      <div className="container">
        <SectionHeading id="modes-heading">No keys required</SectionHeading>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          The core scanner and every focused audit run locally with Playwright.
          Add an API key when you want AI.
        </p>
        <div className="tiers">
          <div className="tier-card">
            <div className="tier-heading">Scan</div>
            <code>npx aria51 https://site.com</code>
            <p className="tier-desc">
              axe-core + 34 WCAG 2.2 checks + keyboard navigation testing.
              Traces violations back to your React, Vue, Svelte, or Solid
              components.
            </p>
          </div>
          <div className="tier-card">
            <div className="tier-heading">Focused Audits</div>
            <code>--audit-keyboard</code><br />
            <code>--audit-structure</code><br />
            <code>--audit-screen-reader</code>
            <p className="tier-desc">
              Tab order, focus traps, skip links. Landmarks, headings, form
              labels. Alt text, ARIA roles, live regions.
            </p>
          </div>
          <div className="tier-card tier-ai">
            <div className="tier-heading">Deep + Agent</div>
            <code>--deep</code>{' / '}<code>--agent</code>
            <p className="tier-desc">
              <code>--deep</code> adds AI interaction testing to any
              audit. <code>--agent</code> crawls your site, cross-verifies
              findings, and builds a remediation plan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
