# Contributing to Shadow Toolkit

## Project Overview

Shadow Toolkit is an open-source browser-native creative tool platform -- "Canva for Web Dev." It ships 14+ single-file HTML applications (tools) that run entirely in the browser with zero dependencies, no build step, and full offline support. Each tool is self-contained and deployable to Vercel as a static site.

## Architecture

All tools are standalone `.html` files in the project root. The runtime is vanilla JavaScript using standard Web APIs:

- Canvas 2D / WebGL for graphics and rendering
- WebAudio API for audio synthesis
- CSS 3D Transforms and CSS animations for effects
- IndexedDB for offline state persistence
- Service Worker for PWA caching

Shared utilities are provided in:

- `shadow-core-v5.js` -- core library with utility functions, download/copy helpers, and the optional NVIDIA AI bridge
- `shadow-studio-core.js` -- plugin-based orchestrator with service registry (`shadowStudio.get('utils')`, `shadowStudio.save()`, etc.)
- `index.html` -- main dashboard that lists all tools in a grid and manages navigation

There is no bundler, no framework, no JSX, no TypeScript compilation in the tool files. The `rollup.config.js` and `build.js` are only for the NPM package (`@shadow-toolkit/core`), not for the HTML tools.

## Creating a New Tool

1. **Pick a grid slot.** Open `index.html` and find the `.tool-grid` section with `.tool-card` entries. Add a new card for your tool with a unique ID, name, description, and icon (text or SVG).

2. **Create the HTML file.** Write a single self-contained `.html` file in the project root. Follow the pattern in existing tools:

   - Inline all CSS in `<style>` (no external stylesheets)
   - Inline all JS in `<script>` (no external modules)
   - Use CSS variables from `:root` for theming (dark background, purple accent, cyan highlight)
   - Keep the file under 2000 lines for maintainability

3. **Use the shared API if needed.** Load `shadow-core-v5.js` via a `<script>` tag and use the global `shadowStudio` object where applicable:

   ```js
   // Download or copy exports
   shadowStudio.get('utils').download('output.css', cssContent, 'text/css');
   shadowStudio.get('utils').copy(textToCopy);

   // Save to workspace state
   shadowStudio.save('projects', { /* ... */ });
   ```

   If the core library is not loaded, provide a graceful fallback:

   ```js
   const utils = (typeof shadowStudio !== 'undefined' && shadowStudio.get)
     ? shadowStudio.get('utils')
     : { download: (name, content, type) => { /* fallback */ }, copy: (t) => { /* fallback */ } };
   ```

4. **Register in `ai-tool-registry.js`.** Add an entry to the `tools` array in `ShadowAIRegistry`. Each entry must include:

   - `id`, `name`, `description`, `category`, `version`
   - `url` pointing to the tool's deployed path
   - `inputSchema` using JSON Schema draft 2020-12
   - `outputSchema` for expected return values
   - `handlers` for the MCP server routing
   - `meta` flags (`offline`, `progressive`, etc.)

5. **Add a `.well-known/ai-tools.json` entry.** Add an OpenAPI 3.0 path entry for your tool so AI agents can discover it via the discovery endpoint.

6. **Test as a local file.** Open the `.html` directly in a browser using `file://` protocol. It must work with no server.

## Code Conventions

- No frameworks, no bundlers, no build step for tool files
- No TypeScript in tool files (plain JS only; the NPM package uses TS separately)
- ES6+ syntax: `class`, `async/await`, arrow functions, template literals
- `camelCase` for variables, functions, and methods
- `PascalCase` for classes
- 2-space indentation, no tabs
- Single quotes for strings, semicolons required
- All tool files in the project root (no nested directories for tool HTML)
- Inline styles in `<style>` at the top of `<head>`
- `<script>` at the end of `<body>`

## Tool Requirements

- **Offline-first.** Use `localStorage` or IndexedDB for saving state. Must function without a network connection after initial load.
- **Export support.** Every tool must provide a way to copy or download its output (clipboard API or Blob download).
- **Graceful degradation.** Check for `shadowStudio` existence before calling it. If unavailable, fall back to basic DOM or direct fetch/download APIs. Do not crash.
- **No external CDN links.** Zero dependencies means no `<script src="https://cdn...">`. Everything must be vendored inline.

## AI Agent Compatibility

Tools are discovered and invoked by AI agents through three layers:

1. **`ai-tool-registry.js`** -- defines tool metadata, input/output JSON Schemas, and handler routes. The MCP server (`mcp-server.js`) calls `getAllTools()` from the registry when a client sends `tools/list`.

2. **`mcp-server.js`** -- runs as a standalone Node process (`node mcp-server.js --port 3000`). Supports `initialize`, `tools/list`, `tools/call`, `tools/discover`, `ping`. It routes tool execution through `api/execute.js`. Tool registration here is automatic -- it reads from `ai-tool-registry.js`.

3. **`.well-known/ai-tools.json`** -- OpenAPI 3.0.3 spec for HTTP-based tool discovery and invocation. Used by OpenAI GPTs, custom GPT actions, and generic AI agents that use OpenAPI.

When adding a new tool, ensure entries in all three locations are consistent: matching tool `id`, `url`, and input schema.

## Deployment

The project deploys to Vercel as a static site:

- Files in the project root map directly to URLs (e.g., `cursor_generator.html` serves at `/cursor_generator`)
- `vercel.json` provides `cleanUrls: true` so `.html` extensions are omitted (use a relative path like `href="cursor_generator"` in your tool cards)
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`) are set for all routes
- JS files are cached with `max-age=31536000, immutable`
- The service worker at `service-worker.js` enables PWA offline support

To deploy your own fork:

```bash
npm i -g vercel
vercel --prod
```

## Pull Request Process

1. Test your tool by opening the `.html` file directly in a browser with `file://` protocol (no web server needed).
2. Verify no errors appear in the browser developer console.
3. Open at least 2-3 existing tools (cursor generator, color palette, icon designer) and confirm they still work.
4. Run `node mcp-server.js --port 3000` and verify `tools/list` returns the expected output including your new tool.
5. Use conventional commits for your PR title: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
6. Keep each PR focused on a single tool or concern. Avoid bundling unrelated changes.
7. Mention the tool ID from `ai-tool-registry.js` in the PR description for cross-reference.

## Getting Help

Open a GitHub issue at `atharia-agi/shadowares` with:

- The tool or component you are working on
- What you have tried
- What is not working or unclear

For architecture questions, refer to `V3_ARCHITECTURE.md` and `AI_Tool_Discovery_Research.md` in the repository.
