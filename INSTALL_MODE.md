# Advanced Usage: Install Mode

React A11y Scanner supports two modes of operation:

## 1. External Scanning (Default) ✅

This is what you've been using - scan any website externally:

```bash
npm start http://localhost:3000
npm start https://example.com
```

**Pros:**
- ✅ No code changes needed
- ✅ Works on any React site
- ✅ Perfect for production builds

**Cons:**
- ⚠️ Doesn't work well with HMR in dev mode
- ⚠️ Need to build for production first

---

## 2. Install Mode (For Dev Environments)

Add the scanner **inside your app** for seamless dev mode scanning:

### Next.js Setup

Create `instrumentation-client.ts` in your project root:

```typescript
// instrumentation-client.ts
import 'bippy'; // Must be first!
import axe from 'axe-core';
import { instrument, secure, traverseFiber } from 'bippy';

// Only run in development
if (process.env.NODE_ENV === 'development') {
  instrument(
    secure({
      onCommitFiberRoot(rendererID, root) {
        // Your custom scanning logic here
        // Or expose an API endpoint
      },
    })
  );
}
```

### Vite/CRA Setup

Import at the top of your `main.tsx` or `index.tsx`:

```typescript
// main.tsx
import 'bippy'; // Must be BEFORE React imports!
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// ... rest of your app
```

---

## Choosing the Right Mode

| Scenario | Recommended Mode |
|----------|------------------|
| Scanning production sites | External (default) |
| Scanning local dev builds | External (build first) |
| Active development with HMR | Install mode |
| CI/CD pipelines | External |
| Quick audits | External |

---

## Why Two Modes?

**External mode** works like a browser automation tool - it navigates to your site and scans from the outside.

**Install mode** runs **inside** your app, similar to how React DevTools works. This makes it immune to HMR issues but requires adding code to your app.

---

## Best Practice

For most users, **external mode is recommended**. Simply:

1. Build your app for production
2. Start the production server
3. Scan with `npm start http://localhost:3000`

Only use install mode if you need to scan while actively developing with HMR enabled.
