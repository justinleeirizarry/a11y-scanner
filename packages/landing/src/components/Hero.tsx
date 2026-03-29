import { CopyButton } from './CopyButton';

const NPX_COMMAND = 'npx aria51 https://your-site.com';

export function Hero() {
  return (
    <header className="hero">
      <div className="container">
        <h1>Find the accessibility violations your tools miss</h1>
        <p className="hero-sub">
          Keyboard audits, screen reader simulation, and 34 WCAG 2.2 checks
          that go beyond what axe-core and Lighthouse catch. No API key needed.
        </p>
        <div className="hero-cta">
          <div className="hero-command">
            <code>{NPX_COMMAND}</code>
            <CopyButton text={NPX_COMMAND} />
          </div>
          <a
            href="https://github.com/justinirizarry/aria-51"
            className="btn-outline"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
