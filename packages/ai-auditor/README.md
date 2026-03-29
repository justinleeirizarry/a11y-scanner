# @aria51/ai-auditor

AI-powered accessibility testing via [Stagehand](https://github.com/browserbase/stagehand). Adds intelligent keyboard navigation testing, accessibility tree analysis, WCAG compliance auditing, and test generation on top of `@aria51/core`.

## Install

```bash
npm install @aria51/ai-auditor
```

Requires an OpenAI API key for Stagehand:

```bash
export OPENAI_API_KEY=sk-...
```

## Usage

### Deep audits

These combine the deterministic checks from `@aria51/core` with AI-powered analysis:

```typescript
import { deepAuditKeyboard, deepAuditStructure, deepAuditScreenReader } from '@aria51/ai-auditor';

const keyboard = await deepAuditKeyboard('https://example.com', { maxTabs: 100 });
const structure = await deepAuditStructure('https://example.com');
const screenReader = await deepAuditScreenReader('https://example.com');
```

### Stagehand services

For lower-level control:

```typescript
import { StagehandKeyboardTester, StagehandTreeAnalyzer, StagehandWcagAuditAgent } from '@aria51/ai-auditor';
```

### Browserbase live viewing

Watch audits run in real time with a cloud browser:

```typescript
import { createLiveAuditSession, BrowserbaseClient } from '@aria51/ai-auditor';

const client = new BrowserbaseClient({
  apiKey: process.env.BROWSERBASE_API_KEY,
  projectId: process.env.BROWSERBASE_PROJECT_ID,
});

const session = await createLiveAuditSession(client);
console.log(`Watch live: ${session.liveViewUrl}`);
await session.audit('https://example.com');
await session.close();
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Stagehand AI features |
| `BROWSERBASE_API_KEY` | No | Cloud browser / live viewing |
| `BROWSERBASE_PROJECT_ID` | No | Cloud browser / live viewing |

## License

MIT
