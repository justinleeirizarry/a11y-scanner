import { SectionHeading } from './SectionHeading';

const confidenceLevels = [
  {
    level: 'Confirmed',
    desc: 'AI finding matched by exact axe-core violation',
    className: 'pass',
  },
  {
    level: 'Corroborated',
    desc: 'AI finding supported by WCAG supplemental check',
    className: 'moderate',
  },
  {
    level: 'AI-only',
    desc: 'Found by agent, no automated corroboration',
    className: 'serious',
  },
  {
    level: 'Contradicted',
    desc: 'AI flagged it, but axe-core passed the related rule',
    className: 'critical',
  },
];

export function VerificationSection() {
  return (
    <section className="section" aria-labelledby="verification-heading">
      <div className="container">
        <SectionHeading id="verification-heading">Don't trust AI blindly</SectionHeading>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          When you use <code>--agent</code>, every AI finding is cross-referenced
          against axe-core and WCAG 2.2 supplemental checks. Each issue gets a
          confidence score so you know what to fix first and what to verify manually.
        </p>
        <div className="confidence-grid" role="list" aria-label="Confidence levels">
          {confidenceLevels.map((item) => (
            <div key={item.level} className="confidence-item" role="listitem">
              <span className={`confidence-badge ${item.className}`}>
                {item.level}
              </span>
              <span className="confidence-desc">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
