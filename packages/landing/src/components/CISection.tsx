import { SectionHeading } from './SectionHeading';
import { TerminalBlock } from './TerminalBlock';

export function CISection() {
  return (
    <section className="section" aria-labelledby="ci-heading">
      <div className="container">
        <SectionHeading id="ci-heading">CI Integration</SectionHeading>
        <TerminalBlock label="CI mode command example">
          <span className="prompt">$ </span>
          npx aria51 https://your-site.com <span className="flag">--ci</span>{' '}
          <span className="flag">--threshold</span> <span className="num">5</span>
        </TerminalBlock>
        <p className="ci-desc">
          Gate deploys on accessibility. Fails your CI build with exit code 1
          when violations exceed the threshold you set.
        </p>
      </div>
    </section>
  );
}
