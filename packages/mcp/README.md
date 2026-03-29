# @aria51/mcp

[Model Context Protocol](https://modelcontextprotocol.io) server for aria-51. Exposes 9 accessibility testing tools for AI assistants like Claude Code and Cursor.

## Install

```bash
npm install -g @aria51/mcp
```

## Configure

### Claude Code

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "aria51": {
      "command": "aria51-mcp",
      "env": {
        "OPENAI_API_KEY": "sk-...",
        "ANTHROPIC_API_KEY": "sk-ant-..."
      }
    }
  }
}
```

### Cursor

Add to your MCP settings with the command `aria51-mcp`.

## Tools

| Tool | Description |
|------|-------------|
| `scan_url` | Scan a URL for accessibility violations |
| `scan_urls` | Batch scan multiple URLs |
| `get_accessibility_tree` | Get page semantic structure (works on CSP-restricted sites) |
| `explain_violation` | Explain an axe-core rule and how to fix it |
| `list_wcag_criteria` | Look up WCAG 2.2 criteria by level, principle, or keyword |
| `test_keyboard` | Test keyboard navigation (tab order, focus traps, indicators) |
| `analyze_structure` | Analyze landmarks, headings, form labels |
| `test_screen_reader` | Simulate screen reader navigation |
| `run_agent` | Run autonomous AI audit with remediation plan |

All tools support optional `deep` mode for AI-enhanced analysis where applicable.

## Environment variables

| Variable | Required for | Description |
|----------|-------------|-------------|
| `OPENAI_API_KEY` | `deep` mode, `run_agent` | Stagehand AI features |
| `ANTHROPIC_API_KEY` | `run_agent` with Claude | Agent mode |

## License

MIT
