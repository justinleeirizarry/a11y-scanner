import { SectionHeading } from './SectionHeading';
import { CopyButton } from './CopyButton';
import { mcpTools } from '../data/mcp-tools';

const MCP_CONFIG = `"aria51": {
  "command": "npx",
  "args": ["-y", "aria51-mcp"]
}`;

export function MCPSection() {
  return (
    <section className="section" aria-labelledby="mcp-heading">
      <div className="container">
        <SectionHeading id="mcp-heading">Built for AI coding tools</SectionHeading>
        <p className="hero-sub" style={{ marginBottom: '1.5rem' }}>
          aria-51 ships as both an MCP server and a CLI. AI coding agents can
          use either — scan your site, explain violations, fix the code, and
          re-scan to confirm without leaving the editor.
        </p>
        <div className="mcp-workflow">
          <div className="mcp-step">
            <span className="mcp-step-num" aria-hidden="true">1</span>
            <div>
              <strong>scan_url</strong>
              <p>Find violations and keyboard issues</p>
            </div>
          </div>
          <div className="mcp-step">
            <span className="mcp-step-num" aria-hidden="true">2</span>
            <div>
              <strong>explain_violation</strong>
              <p>WCAG criterion, impact, and how to fix</p>
            </div>
          </div>
          <div className="mcp-step">
            <span className="mcp-step-num" aria-hidden="true">3</span>
            <div>
              <strong>Agent edits your code</strong>
              <p>Fix applied to the right component</p>
            </div>
          </div>
          <div className="mcp-step">
            <span className="mcp-step-num" aria-hidden="true">4</span>
            <div>
              <strong>scan_url</strong>
              <p>Re-scan to verify the fix worked</p>
            </div>
          </div>
        </div>
        <div className="mcp-config">
          <div className="mcp-config-header">
            <span className="mcp-config-label">Add to your MCP config</span>
            <CopyButton text={MCP_CONFIG} />
          </div>
          <pre className="mcp-config-body"><code>{MCP_CONFIG}</code></pre>
        </div>
        <div className="mcp-tools" role="list" aria-label="Available MCP tools">
          {mcpTools.map((tool) => (
            <span key={tool} className="mcp-tool" role="listitem">
              {tool}
            </span>
          ))}
        </div>
        <p className="ci-desc">
          Nine tools over MCP, full CLI for agents that prefer shell commands.
          Works with Claude Code, Codex, Gemini CLI, Cursor, Windsurf — any
          AI coding workflow.
        </p>
      </div>
    </section>
  );
}
