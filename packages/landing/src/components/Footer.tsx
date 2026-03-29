export function Footer() {
  return (
    <footer className="footer">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
        <a
          href="https://github.com/justinirizarry/aria-51"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <span className="footer-sep">/</span>
        <a
          href="https://www.npmjs.com/package/aria51"
          target="_blank"
          rel="noopener noreferrer"
        >
          npm
        </a>
        <span className="footer-sep">/</span>
        <span>MIT License</span>
      </div>
    </footer>
  );
}
