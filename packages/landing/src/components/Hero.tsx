import { CopyButton } from './CopyButton';

const NPX_COMMAND = 'npx aria51 https://your-site.com';

export function Hero() {
  return (
    <header className="hero">
      <div className="container">
        <p className="hero-eyebrow">aria-51</p>
        <h1>Uncover the accessibility violations hiding in your site</h1>
        <p className="hero-sub">
          Keyboard traps, broken focus order, missing screen reader
          support — the stuff axe-core and Lighthouse weren't built to find.
          One command to start.
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
            View on GitHub<span className="sr-only"> (opens in new tab)</span>
          </a>
        </div>
      </div>
    </header>
  );
}
