# Shadow Studio v5.1

## Open Source Canva for Web Dev — System Architecture

**Version:** 5.1.0
**Author:** Shadow Toolkit Team
**License:** MIT
**Website:** [shadowfactory.vercel.app](https://shadowfactory.vercel.app)

---

## Vision

Membuat **"Canva untuk Agent & Web Dev Pemula"** — platform open-source yang memungkinkan siapa saja membuat beautiful web assets, websites, dan animations tanpa perlu coding knowledge. Platform ini dirancang untuk 3 level user:

1. **Beginner** — Visual editor, templates, wizards (zero knowledge)
2. **Intermediate** — Component builder, animation studio, photo editor (some knowledge)
3. **Pro/Agent** — Plugin API, AI integration, MCP server (full control)

---

## Architecture

### 1. Universal Plugin Architecture

Setiap plugin harus mengikuti kontrak berikut:

```javascript
class ShadowPlugin {
  static get info() { return { id, name, description, version, level, category, icon, tags, hasUI, hasAI }; }
  constructor(orchestrator) { }
  async init() { }
  renderUI() { return '<html>'; }
  async onAction(action, data) { }
  getState() { return {}; }
  setState(data) { }
  async export(format) { }
  async onAIRequest(prompt, context) { }
}
```

### 2. System Orchestrator (shadow-core-v5.js)

File: `shadow-core-v5.js`
- Plugin registry & lifecycle management (`ShadowPluginManager`)
- State orchestration and event system
- Service discovery for AI agents (`ShadowToolRegistry`)
- Cross-tab synchronization
- Event routing & broadcast
- BYOK (Bring Your Own Key) system for optional NVIDIA AI
- IndexedDB persistence: projects, assets, plugins, settings, byok_keys, exports
- ShadowUtils: debounce, throttle, UID, download/copy, color conversions, SVG helpers
- ShadowExport: HTML/CSS/image/JSON/ZIP project export
- ShadowPerfMonitor: timing and memory tracking
- MCP-compatible tool discovery (tools/list, tools/call, tools/discover)

### 3. Visual Editor Engine

File: `visual_editor.html`
- WYSIWYG drag & drop editor
- 14 component types (text, heading, button, image, card, nav, divider, gradient, container, input, textarea, icon, badge)
- 7 templates (Landing Page, Portfolio, Dashboard, E-Commerce, Blog, App UI)
- Layer system with visibility toggle
- Undo/redo stack (30 levels)
- Context menu (duplicate, bring forward, copy/paste styles)
- Export: HTML, CSS, JSON, clipboard
- URL param integration for templates and projects
- IndexedDB + localStorage project persistence

### 4. Photo Editor Engine

File: `photo_editor.html`
- Full-featured browser-based photo editing
- **Drawing tools**: brush, eraser, fill bucket, eyedropper
- **Shape tools**: rectangle, circle, ellipse, line, arrow, star, triangle, heart
- **Text tool**: custom fonts, sizes, colors, background
- **12 photo filters**: B&W, Sepia, Blur, Vivid, High Contrast, Bright, Hue Shift, Invert, Desaturate, Vintage, Vibrant
- **Adjustment panel**: brightness, contrast, saturation, hue rotate, blur, sharpen
- **Transform tools**: rotate, flip horizontal/vertical, crop
- **Undo/Redo**: 30-level history stack
- **Export**: PNG, JPEG, WebP, SVG with one-click copy/download
- Brush size, opacity, color picker

### 5. 2.5D Playground Engine

File: `2.5d_playground.html`
- CSS 3D scene builder with 8 object types: cube, sphere, cylinder, plane, cone, torus, 3D text, light source
- **Physics engine**: toggle physics on/off with real-time simulation
- **Gravity toggle**: objects fall and bounce with realistic physics
- **Material system**: standard, metal, glass, wireframe, glow
- **Animation presets**: spin, bounce, pulse, float
- **6 scene presets**: Empty, Stack, Solar System, Tower, Maze, Ball Pit
- **Camera controls**: angle X/Y rotation, zoom
- **Background options**: solid color, gradient, grid, dark space
- **Export**: CSS 3D code, full HTML, JSON scene data, JavaScript code
- **Undo/Redo**: full history support

### 6. AI Agent Integration (MCP Server)

File: `mcp-server.js`
- JSON-RPC 2.0 compatible MCP server
- Methods: `initialize`, `tools/list`, `tools/call`, `tools/discover`, `ping`
- Cursor-based pagination for tool listing (batch size: 50)
- Input validation against JSON Schema 2020-12
- SSE (Server-Sent Events) endpoint for real-time updates
- WebSocket support (optional)
- Runs as standalone Node server on port 3000
- Browser context via postMessage fallback

### 7. Template System

Built into Visual Editor and Dashboard:
- Landing Page — hero + CTA + feature cards
- Portfolio — personal showcase
- Dashboard — analytics layout
- E-Commerce — product listing
- Blog — article layout
- App UI — mobile app interface mockup

### 8. Dashboard v5.1

File: `index.html`, `v5-dashboard.html`
- Sidebar navigation with sections: Workspace, Visual, Audio, Animation
- **Plugin Manager UI**: install from URL, discover registry, list/uninstall
- **Project Manager UI**: create, list, open, delete projects
- Quick-action cards for all 14 tools
- Categories: All, Visual, Audio, Animation, Productivity, Assets
- Cmd+K search across tools and templates
- NVIDIA AI banner (optional BYOK)
- Template gallery with 6 templates
- Responsive: mobile hamburger menu

---

## Tool Catalog (14 Tools)

### Visual Tools
| Tool | Description | Export Formats |
|------|-------------|---------------|
| Cursor Studio | 8 cursor themes, size/hotspot/shadow controls | CSS, SVG |
| Mesh Gradient Generator | animated mesh gradients, 6 presets | CSS, PNG, Canvas |
| CSS Effect Generator | 10 production CSS effects with live preview | CSS, HTML, PNG |
| Color Palette Generator | 7 harmony methods | CSS, JSON, SVG, GIMP, Tailwind |
| Visual Editor | WYSIWYG page builder, 14 components | HTML, CSS, JSON |
| Photo Editor | filters, adjustments, drawing, shapes, text | PNG, JPEG, WebP, SVG |
| Icon Designer | pixel editor, layer system | PNG, SVG, ICO, CSS |
| Sprite Mapper | flood-fill extraction, grid slicing | PNG, JSON, CSS, sheet |
| Animated Icon Exporter | 32-frame timeline animation | GIF, WebM, sprite sheet, CSS |

### Audio Tools
| Tool | Description | Export Formats |
|------|-------------|---------------|
| Audio Synth Studio | 8 SFX + infinite BGM engine | WAV |
| Text-to-Soundscape | mood-based procedural soundscapes | WAV, JSON params |

### Productivity / Animation
| Tool | Description | Export Formats |
|------|-------------|---------------|
| 2.5D Playground | interactive physics scene builder | CSS, HTML, JSON, JS |

---

## AI Agent Tool Discovery

### JSON Schema 2020-12
All 14 tools defined with complete input/output schemas in `ai-tool-registry.js`.

### Supported Formats
- **MCP (Model Context Protocol)**: JSON-RPC `tools/list`, `tools/call`, `tools/discover`
- **OpenAI Function Calling**: `toOpenAIFormat()` method
- **Anthropic Tool Use**: `toAnthropicFormat()` method
- **HTTP REST**: `POST /api/tools/{tool-id}`
- **postMessage**: Browser cross-frame messaging

---

## Database Schema (IndexedDB)

Database: `ShadowStudio` v3

| Store | Key Path | Indices |
|-------|----------|---------|
| projects | id | — |
| assets | id (auto) | type, projectId |
| plugins | id | — |
| settings | id (st_key) | — |
| byok_keys | id (byok_service) | — |
| exports | id (auto) | date |

---

## UI/UX Design System

### Colors
- Background: `#0a0b14` (dark), `#f1f3f7` (light)
- Surface: `#15172a` (dark), `#ffffff` (light)
- Border: `#2a2d4a` (dark), `#e2e8f0` (light)
- Primary: `#7c4dff` (purple)
- Accent: `#00e5ff` (cyan)
- Text: `#f1f3f7` (dark), `#0a0b14` (light)
- Text Muted: `#94a0b8` (dark), `#64748b` (light)

### Typography
- Font: Inter (Google Fonts), system-ui fallback
- Headings: 800 weight, -0.5px tracking
- Body: 400 weight, 1.6 line-height
- Small labels: 600 weight, uppercase, 0.65rem

### Rounded Corners
- Cards: 12px, Buttons: 8px, Inputs: 8px

### Shadows
- Large: `0 20px 60px rgba(0,0,0,.4)`
- Small: `0 4px 12px rgba(0,0,0,.2)`

---

## Responsive Design

### Desktop (>1200px)
Full layout with sidebar, tool grid 3-4 columns, template grid 4 columns.

### Tablet (768-1200px)
Compressed sidebar (icons only), tool grid 2 columns.

### Mobile (<768px)
Hidden sidebar, hamburger menu, tool grid 1 column, full-width cards.

---

## Deployment

### Vercel (Recommended)
```bash
vercel --prod
```
`vercel.json` configured for clean URLs, security headers, and caching.

### Local Development
Open any `.html` file directly in browser — zero build step required.

### MCP Server (Optional)
```bash
node mcp-server.js --port 3000
```

---

## Build System

```bash
npm run build
```
Produces CJS, ESM, and UMD bundles (40KB each) with source maps.