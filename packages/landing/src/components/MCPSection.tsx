import { SectionHeading } from './SectionHeading';
import { mcpTools } from '../data/mcp-tools';

export function MCPSection() {
  return (
    <section className="section" aria-labelledby="mcp-heading">
      <div className="container">
        <SectionHeading>Works with your AI editor</SectionHeading>
        <p className="hero-sub" style={{ marginBottom: 0 }}>
          MCP server with 9 tools. Your AI coding assistant can scan, interpret
          results, fix code, and re-scan — without leaving the editor.
        </p>
        <div className="mcp-tools">
          {mcpTools.map((tool) => (
            <span key={tool} className="mcp-tool">{tool}</span>
          ))}
        </div>
        <p className="mcp-editors">
          Works with <strong>Claude Code</strong>, <strong>Cursor</strong>,
          and <strong>Windsurf</strong>.
        </p>
        <div className="mcp-placeholder">
          Scan → Fix → Re-scan demo coming soon
        </div>
      </div>
    </section>
  );
}
