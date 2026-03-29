export function Footer() {
  return (
    <footer className="footer">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
        <nav aria-label="External links" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a
            href="https://github.com/justinirizarry/aria-51"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub<span className="sr-only"> (opens in new tab)</span>
          </a>
          <span className="footer-sep" aria-hidden="true">/</span>
          <a
            href="https://www.npmjs.com/package/aria51"
            target="_blank"
            rel="noopener noreferrer"
          >
            npm<span className="sr-only"> (opens in new tab)</span>
          </a>
        </nav>
        <span className="footer-sep" aria-hidden="true">/</span>
        <span>MIT License</span>
      </div>
    </footer>
  );
}
