import { SectionHeading } from "./SectionHeading";
import { mcpTools } from "../data/mcp-tools";

export function MCPSection() {
  return (
    <section className="section" aria-labelledby="mcp-heading">
      <div className="container">
        <SectionHeading id="mcp-heading">Built for AI</SectionHeading>
        <p className="hero-sub" style={{ marginBottom: 0 }}>
          aria-51 was designed as a tool for AI. Nine tools available over
          MCP or the CLI — scan, interpret, fix, and re-scan without breaking
          the loop.
        </p>
        <div className="mcp-tools">
          {mcpTools.map((tool) => (
            <span key={tool} className="mcp-tool">
              {tool}
            </span>
          ))}
        </div>
        <div className="mcp-placeholder">
          Demo coming soon
        </div>
      </div>
    </section>
  );
}
