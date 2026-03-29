import { SectionHeading } from './SectionHeading';
import { scanResults } from '../data/scan-results';

export function RealResults() {
  return (
    <section className="section" aria-labelledby="results-heading">
      <div className="container">
        <SectionHeading>Field reports</SectionHeading>
        <div className="results-grid">
          {scanResults.map((result) => (
            <div key={result.site} className="result-card">
              <div className="result-card-site">{result.site}</div>
              {result.findings.map((finding, i) => (
                <p
                  key={i}
                  className={`result-card-finding ${finding.keyboard ? 'keyboard' : ''}`}
                >
                  <strong>{finding.text.split(' ').slice(0, 1).join(' ')}</strong>{' '}
                  {finding.text.split(' ').slice(1).join(' ')}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
