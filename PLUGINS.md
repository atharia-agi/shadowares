# Shadow Toolkit Plugin System

Extend Shadow Studio ("Open Source Canva for Web Dev") with self-contained HTML plugins. No build step, no framework lock-in.

## Plugin Architecture

Plugins are standalone HTML files that load into the app via an `<iframe>` or direct DOM injection. They communicate with the host through `window.ShadowStudioCore` (exposed by `shadow-core-v5.js`).

Every plugin calls `window.ShadowStudioCore.registerPlugin()` (aliased via the global `shadowStudio` instance) to announce itself. The core handles lifecycle, cleanup, and persistence.

```js
// Inside your plugin HTML
class MyPlugin {
  // Required interface
}
window.ShadowStudioCore.registerPlugin('my-plugin', new MyPlugin());
```

An alternative lower-level API also exists:

```js
window.shadowPlugins.register('my-plugin', {
  install(system) { /* called on init */ },
  uninstall()      { /* called on removal */ },
  hooks: [{ name: 'export:before', callback: (data) => { /* ... */ } }]
});
```

## Plugin Interface

Every plugin **must** provide these properties and methods:

| Member     | Type     | Description                             |
|------------|----------|-----------------------------------------|
| `name`     | `string` | Human-readable plugin name              |
| `version`  | `string` | SemVer string (e.g. `"1.0.0"`)          |
| `icon`     | `string` | Emoji character or URL to icon          |
| `init()`   | `method` | Called once on load. Return a promise if async. |
| `destroy()`| `method` | Called on unload. Clean up event listeners, timers, DOM. |

Minimal example:

```js
(function () {
  const plugin = {
    name: 'My Filter',
    version: '1.0.0',
    icon: '🔍',
    init() {
      console.log('[MyPlugin] ready');
      this._el = document.createElement('div');
      this._el.textContent = 'Plugin loaded';
      document.body.appendChild(this._el);
    },
    destroy() {
      if (this._el) this._el.remove();
    }
  };
  window.ShadowStudioCore.registerPlugin('my-filter', plugin);
})();
```

## Plugin Manifest

Plugins installed from a URL (via the Plugin Installer) require a `plugin.json` manifest at the source root:

```json
{
  "id": "my-filter",
  "name": "My Filter",
  "version": "1.0.0",
  "description": "Applies CSS filters to selected elements",
  "author": "You",
  "main": "plugin.html",
  "permissions": ["storage", "nvidia"],
  "icon": "🔍"
}
```

Inline manifest block is also supported at the top of the HTML file:

```js
/* plugin: { "name": "My Filter", "version": "1.0.0", "author": "You", "description": "..." } */
```

## NVIDIA BYOK Integration

Plugins can call NVIDIA AI APIs using the user's own API key (BYOK - Bring Your Own Key). Retrieve the key, then call any NVIDIA NIM or Edify endpoint:

```js
const nvidiaKey = window.shadowStudio.get('byok').getKey('nvidia');
// or: window.ShadowStudioCore.prototype // instance via shadowStudio global

if (nvidiaKey) {
  const response = await fetch('https://ai.api.nvidia.com/v1/genai/edify/image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${nvidiaKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: 'a futuristic city at sunset',
      negative_prompt: 'blurry, low quality',
      cfg_scale: 7
    })
  });
  const data = await response.json();
  // data.images[0] contains the generated asset
}
```

Users set their key in **Settings > BYOK > NVIDIA**. The `getKey('nvidia')` call returns `undefined` if no key is configured -- handle gracefully.

## Storage API

Plugins can persist data using the core's IndexedDB-backed storage. The available object stores are: `projects`, `assets`, `plugins`, `settings`, `history`, `exports`.

```js
// Save a record (auto-generates id if missing)
await window.shadowStudio.save('plugins', {
  id: 'my-plugin-data',
  value: { /* anything JSON-serializable */ }
});

// Load all records from a store (no id = getAll)
const allData = await window.shadowStudio.load('plugins');

// Load a single record by id
const myData = await window.shadowStudio.load('plugins', 'my-plugin-data');

// Delete a record
await window.shadowStudio.delete('plugins', 'my-plugin-data');
```

The dashboard also mirrors plugin metadata in `localStorage` under `shadow-studio-plugins` for quick UI state.

## AI Tool Registration

Plugins that expose AI-callable operations should register a tool definition with the AI Tool Registry. Tool definitions follow **JSON Schema 2020-12**:

```js
window.AIToolRegistry.register({
  id: 'my-filter-apply',
  name: 'Apply CSS Filter',
  description: 'Applies a CSS filter to a given HTML element or image',
  category: 'visual',
  icon: '🔍',
  inputSchema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
      filter: {
        type: 'string',
        enum: ['blur', 'brightness', 'contrast', 'grayscale', 'sepia'],
        description: 'Filter type to apply'
      },
      value: {
        type: 'number',
        minimum: 0,
        maximum: 100,
        default: 50,
        description: 'Filter intensity'
      },
      target: {
        type: 'string',
        description: 'CSS selector for the target element'
      }
    },
    required: ['filter']
  },
  outputSchema: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      css: { type: 'string', description: 'Generated filter CSS' }
    }
  }
});
```

Registered tools appear in `ShadowToolRegistry` and are discoverable via MCP (`tools/list`), OpenAI function calling, and Anthropic tool use formats.

## Plugin Installer

The built-in Plugin Installer UI lives in the dashboard sidebar under **Plugins**. It supports two installation methods:

**URL Install** -- Paste the URL to a folder that hosts a `plugin.json` manifest. The core fetches the manifest, validates permissions, and loads the main HTML file into an isolated context.

```text
https://your-plugin.com/my-filter/
  ├── plugin.json      # Required manifest
  └── plugin.html      # Main entry point
```

**Drag & Drop** -- Drag an HTML file or folder onto the install box. The file is read locally and registered.

The UI also has a **Discover** button that fetches the community plugin registry from `https://shadow-toolkit.github.io/plugins/registry.json`.

Installed plugins appear in the dashboard list with **Open** and **Remove** controls. The core calls `destroy()` on removal and cleans up persisted data.

## Publishing

Publishing a plugin is as simple as hosting a folder anywhere with a `plugin.json` and your HTML file.

- **Hosting options**: GitHub Pages, Vercel, Netlify, any static server
- **No build step**: Write vanilla HTML/CSS/JS. No bundler required.
- **Service worker**: The app's service worker (`service-worker.js`) pre-caches registered plugin assets for offline use
- **Share the URL**: Users paste your plugin folder URL into the Plugin Installer

Example folder structure for publishing:

```
my-cool-plugin/
  plugin.json       # { id, name, version, main, permissions }
  plugin.html       # Self-contained, registers via ShadowStudioCore
  assets/           # Optional: images, fonts, workers
  README.md         # Optional: usage docs
```

**Tips:**
- Keep plugins self-contained -- one HTML file is ideal
- Use `init()` for setup and `destroy()` for cleanup to avoid leaks
- Gate NVIDIA features behind `getKey('nvidia')` checks so the plugin works without AI
- Test offline: the service worker caches plugin assets after first load
