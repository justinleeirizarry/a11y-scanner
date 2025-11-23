# Development Guide

## Development Workflow

### Option 1: Watch Mode (Recommended for Development)

Run **two terminal windows**:

**Terminal 1 - TypeScript Watch:**
```bash
npm run dev
```
This watches your TypeScript files and recompiles on changes.

**Terminal 2 - Scanner Bundle Watch:**
```bash
npm run dev:scanner
```
This watches the browser-bundle and rebuilds on changes.

Now you can edit files and they'll automatically rebuild. Just run your tests:
```bash
npm run test:fixture
# or
npm start <url>
```

### Option 2: Manual Build

If you prefer to build manually:
```bash
npm run build
npm run test:fixture
```

### Quick Test Commands

```bash
# Test with fixture (fastest way to verify changes)
npm run test:fixture

# Test with a URL
npm start https://react.dev

# Test different browsers
npm start file://$(pwd)/test/fixtures/test-app.html --browser firefox

# Export JSON
npm start <url> --output results.json

# CI mode
npm start <url> --ci --threshold 10
```

## Typical Development Loop

1. **Start watch modes** (one-time setup):
   ```bash
   # Terminal 1
   npm run dev
   
   # Terminal 2
   npm run dev:scanner
   ```

2. **Edit your code** in `src/` - changes auto-compile

3. **Test your changes**:
   ```bash
   # Terminal 3
   npm run test:fixture
   ```

4. **See results immediately!** No manual rebuild needed.

## Scripts Reference

| Script | What it does |
|--------|--------------|
| `npm run build` | Full production build (TypeScript + Scanner) |
| `npm run dev` | Watch TypeScript files for changes |
| `npm run dev:scanner` | Watch scanner bundle for changes |
| `npm run test:fixture` | Quick test with included fixture |
| `npm start <url>` | Run the scanner on any URL |

## Tips

- **Watch modes are fast**: TypeScript and scanner bundle changes compile in milliseconds
- **Keep terminals open**: Leave watch modes running while you code
- **Use test:fixture**: Fastest way to verify your changes
- **Browser choice**: Use `--browser webkit` to test Safari compatibility
