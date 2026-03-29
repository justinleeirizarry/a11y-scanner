import { SectionHeading } from './SectionHeading';
import { TerminalBlock } from './TerminalBlock';

export function ComponentSection() {
  return (
    <section className="section" aria-labelledby="components-heading">
      <div className="container">
        <SectionHeading id="components-heading">Violations mapped to your components</SectionHeading>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          Other tools point to a DOM node. aria-51 traces violations back to the
          framework component that rendered it — with the source file and
          hierarchy path.
        </p>
        <TerminalBlock label="Component attribution example output">
          <span className="label">SERIOUS</span>  color-contrast  <span className="num">3</span> instances{'\n'}
{'\n'}
{'  '}<span className="flag">Header</span> {'>'} <span className="flag">NavBar</span> {'>'} <span className="flag">NavLink</span>{'\n'}
{'  '}src/components/NavLink.tsx{'\n'}
{'\n'}
{'  '}<span className="flag">Footer</span> {'>'} <span className="flag">SocialLinks</span>{'\n'}
{'  '}src/components/SocialLinks.tsx
        </TerminalBlock>
        <p className="ci-desc">
          Works with React, Vue, Svelte, Solid, and Preact. No plugins or
          configuration — component detection is automatic.
        </p>
      </div>
    </section>
  );
}
