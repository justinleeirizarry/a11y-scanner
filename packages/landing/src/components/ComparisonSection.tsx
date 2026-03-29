import { SectionHeading } from './SectionHeading';

export function ComparisonSection() {
  return (
    <section className="section" aria-labelledby="comparison-heading">
      <div className="container">
        <SectionHeading>What others miss</SectionHeading>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          Same site. Same scan. Different results. Here's what happened when we
          tested GitHub.com.
        </p>
        <div className="comparison">
          <div className="comparison-card">
            <div className="comparison-label">axe-core</div>
            <div className="comparison-stat muted">
              <span className="num">4</span>
              <span className="desc">violations</span>
            </div>
            <div className="comparison-stat muted">
              <span className="num">49</span>
              <span className="desc">checks passed</span>
            </div>
          </div>
          <div className="comparison-card">
            <div className="comparison-label">aria-51</div>
            <div className="comparison-stat critical">
              <span className="num">4</span>
              <span className="desc">violations</span>
            </div>
            <div className="comparison-stat serious">
              <span className="num">72</span>
              <span className="desc">tab-order issues</span>
            </div>
            <div className="comparison-stat serious">
              <span className="num">104</span>
              <span className="desc">focus-indicator issues</span>
            </div>
            <div className="comparison-stat moderate">
              <span className="num">15</span>
              <span className="desc">keyboard interaction failures</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
