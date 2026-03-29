# @aria51/agent

Autonomous accessibility auditing agent. Crawls sites, scans pages, cross-references AI findings against axe-core, and generates phased remediation plans.

See the [agent introduction](docs/introduction.md) for architecture details.

## Install

```bash
npm install @aria51/agent
```

## Usage

```typescript
import { runAgent } from '@aria51/agent';

const report = await runAgent({
  targetUrl: 'https://example.com',
  wcagLevel: 'AA',
  maxPages: 10,
  maxSteps: 50,
  onEvent: (event) => console.log(event.type),
});

console.log(`${report.totalFindings} issues across ${report.pagesScanned} pages`);
console.log(report.remediationPlan);
```

### Multi-specialist mode

Runs 4 parallel auditors with different lenses (keyboard/nav, visual/content, forms/interaction, structure/semantics), then merges and deduplicates findings:

```typescript
const report = await runAgent({
  targetUrl: 'https://example.com',
  specialists: true,
  maxPages: 20,
});
```

### Provider selection

Defaults to `gpt-4o-mini`. For best results, use Claude:

```typescript
const report = await runAgent({
  targetUrl: 'https://example.com',
  model: 'claude-sonnet-4-6', // or claude-opus-4-6 for deepest analysis
});
```

The provider is auto-detected from the model name — `gpt-*`/`o1`/`o3`/`o4` use the Vercel AI SDK + OpenAI, `claude-*` uses the Anthropic SDK directly.

### Self-verification

Every finding is cross-referenced against axe-core deterministic results and assigned a confidence level:

- **confirmed** — axe-core found the same violation
- **corroborated** — axe-core found related evidence
- **ai-only** — only AI detected, needs review
- **contradicted** — axe-core passed, likely false positive

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | For Claude models | Recommended for best results |
| `OPENAI_API_KEY` | For OpenAI models | Default provider |

## License

MIT
