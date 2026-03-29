import { type ReactNode } from 'react';

interface TerminalBlockProps {
  children: ReactNode;
  label?: string;
}

export function TerminalBlock({ children, label }: TerminalBlockProps) {
  return (
    <div className="terminal" role="figure" aria-label={label}>
      <div className="terminal-header">
        <span className="terminal-dot" />
        <span className="terminal-dot" />
        <span className="terminal-dot" />
      </div>
      <pre className="terminal-body"><code>{children}</code></pre>
    </div>
  );
}
