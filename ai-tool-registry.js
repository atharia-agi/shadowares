/**
 * SHADOW STUDIO v5.1 — AI Agent Tool Registry
 * Complete tool definitions for AI-discoverable, AI-executable operations.
 * Compatible with: MCP (Model Context Protocol), OpenAI Function Calling, Anthropic Tool Use
 * @version 5.1.0
 * @author Shadow Toolkit Team
 */

const ShadowAIRegistry = {
  studio: {
    name: "Shadow Studio",
    version: "5.1.0",
    description: "Open source Canva for web dev. AI-ready creative tool platform for assets, animations, and designs.",
    url: "https://shadowfactory.vercel.app",
    license: "MIT",
    author: "Shadow Toolkit Team",
    api: {
      version: "v5.1",
      endpoints: {
        discover: "/ai/discover.json",
        execute: "/api/execute",
        stream: "/api/stream",
        mcp: "/mcp"
      },
      transports: ["http", "websocket", "postMessage", "broadcastChannel"],
      formats: ["json", "svg", "png", "webp", "webm", "css", "html", "zip", "wav", "gpl", "csv"]
    },
    interfaces: {
      mcp: true,
      openai: true,
      anthropic: true,
      openapi: true,
      sse: true
    }
  },

  tools: [
    // === VISUAL TOOLS ===
    {
      id: "visual-editor",
      name: "Visual Editor",
      description: "WYSIWYG drag-and-drop web page builder. Add components, edit content, and export HTML/CSS. No coding knowledge required.",
      category: "visual",
      level: "beginner",
      icon: "🎨",
      version: "5.1.0",
      url: "https://shadowfactory.vercel.app/visual_editor",
      tags: ["wysiwyg", "drag-drop", "html", "css", "no-code", "landing-page", "portfolio"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "action": {
            "type": "string",
            "enum": ["create", "edit", "export"],
            "description": "Action to perform"
          },
          "template": {
            "type": "string",
            "enum": ["landing-page", "portfolio", "dashboard", "ecommerce", "blog", "app-ui"],
            "description": "Template to create"
          },
          "components": {
            "type": "array",
            "items": { "type": "string", "enum": ["header", "hero", "text", "button", "image", "card", "form", "footer", "navbar", "divider", "gradient-box", "container", "input", "textarea", "icon", "badge"] },
            "description": "Components to add"
          },
          "exportFormat": {
            "type": "string",
            "enum": ["html", "css", "zip", "json"],
            "default": "html"
          }
        },
        "required": ["action"]
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "html": { "type": "string", "description": "Generated HTML code" },
          "css": { "type": "string", "description": "Generated CSS code" },
          "json": { "type": "string", "description": "Project JSON data" },
          "previewUrl": { "type": "string", "format": "uri" }
        }
      },
      examples: [
        { input: { action: "create", template: "landing-page", components: ["hero", "text", "button"] }, output: { success: true, html: "<!-- ... -->", previewUrl: "https://shadowfactory.vercel.app/visual_editor" } }
      ],
      handlers: { http: "POST /api/execute", postMessage: "visual-editor", websocket: "wss://host/mcp" },
      meta: { offline: true, progressive: true, streaming: false, retry: true, multiStep: true, requiresUserConfirmation: false }
    },

    {
      id: "cursor-studio",
      name: "Cursor Studio",
      description: "Design and customize mouse cursors with 8 themes (circle, crosshair, diamond, square, arrow, dot, ring, star). Adjustable size, hotspot, shadow, border. Real-time canvas preview with one-click export to CSS or SVG.",
      category: "visual",
      level: "beginner",
      icon: "🖱️",
      version: "5.1.0",
      url: "https://shadowfactory.vercel.app/cursor_generator",
      tags: ["cursor", "customization", "ux", "themes", "css", "svg", "crosshair"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "theme": {
            "type": "string",
            "enum": ["circle", "crosshair", "diamond", "square", "arrow", "dot", "ring", "star"],
            "description": "Cursor theme to apply"
          },
          "size": { "type": "number", "minimum": 8, "maximum": 128, "default": 32, "description": "Cursor size in pixels" },
          "hotspotX": { "type": "number", "minimum": 0, "default": 0, "description": "Hotspot X offset" },
          "hotspotY": { "type": "number", "minimum": 0, "default": 0, "description": "Hotspot Y offset" },
          "shadow": { "type": "boolean", "default": true, "description": "Enable drop shadow" },
          "border": { "type": "boolean", "default": false, "description": "Enable border" },
          "borderColor": { "type": "string", "format": "color", "default": "#000000" },
          "borderWidth": { "type": "number", "minimum": 0, "maximum": 5, "default": 1 },
          "color": { "type": "string", "format": "color", "default": "#000000" },
          "bgColor": { "type": "string", "format": "color", "default": "#ffffff" }
        },
        "required": ["theme"]
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "css": { "type": "string", "description": "Generated cursor CSS" },
          "svg": { "type": "string", "description": "Generated cursor SVG data URL" },
          "previewUrl": { "type": "string", "format": "uri" }
        }
      },
      examples: [
        { input: { "theme": "crosshair", "size": 32, "color": "#ff0000" }, output: { success: true, css: "cursor: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\"><circle cx=\"16\" cy=\"16\" r=\"14\" fill=\"none\" stroke=\"%23ff0000\" stroke-width=\"2\"/><line x1=\"16\" y1=\"0\" x2=\"16\" y2=\"32\" stroke=\"%23ff0000\" stroke-width=\"1\"/><line x1=\"0\" y1=\"16\" x2=\"32\" y2=\"16\" stroke=\"%23ff0000\" stroke-width=\"1\"/></svg>'), 16 16, auto;'", previewUrl: "https://shadowfactory.vercel.app/cursor_generator" } }
      ],
      handlers: { http: "POST /api/execute", postMessage: "cursor-studio", websocket: "wss://host/mcp" },
      meta: { offline: true, progressive: true, streaming: false, retry: true, multiStep: false, requiresUserConfirmation: false }
    },

    {
      id: "css-effect-generator",
      name: "CSS Effect Generator",
      description: "Generate 10 production-ready CSS effects: glassmorphism, neon-glow, 3D tilt, animated-gradient, shimmer, pulse, deep-shadow, frosted glass, gradient-text, neon-border. Real-time parameterized preview with one-click copy and download.",
      category: "visual",
      level: "intermediate",
      icon: "✨",
      version: "5.1.0",
      url: "https://shadowfactory.vercel.app/css_effect_generator",
      tags: ["css", "effect", "glassmorphism", "glow", "generator", "animation", "neon", "shadow"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "enum": ["glassmorphism", "neon-glow", "3d-tilt", "animated-gradient", "shimmer", "pulse", "deep-shadow", "frosted-glass", "gradient-text", "neon-border"],
            "description": "Effect type"
          },
          "color": { "type": "string", "format": "color", "default": "#7c4dff" },
          "intensity": { "type": "number", "minimum": 0, "maximum": 100, "default": 50 },
          "speed": { "type": "number", "minimum": 0.1, "maximum": 5, "default": 1 }
        },
        "required": ["type"]
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "css": { "type": "string", "description": "Generated CSS code" },
          "html": { "type": "string", "description": "Standalone HTML preview" },
          "previewUrl": { "type": "string", "format": "uri" }
        }
      },
      examples: [
        { input: { "type": "glassmorphism", "color": "#7c4dff" }, output: { success: true, css: "backdrop-filter: blur(10px); background: rgba(255,255,255,0.1);", previewUrl: "https://shadowfactory.vercel.app/css_effect_generator" } }
      ],
      handlers: { http: "POST /api/execute", postMessage: "css-effect-generator", websocket: "wss://host/mcp" },
      meta: { offline: true, progressive: true, streaming: false, retry: true, multiStep: false, requiresUserConfirmation: false }
    },

    {
      id: "mesh-gradient-generator",
      name: "Mesh Gradient Generator",
      description: "Real-time animated mesh gradient canvas with speed, noise, mix, and resolution controls. 6 presets (sunset, ocean, forest, fire, cosmic, candy). Export as PNG, CSS, or copy canvas data.",
      category: "visual",
      level: "beginner",
      icon: "🌈",
      version: "5.1.0",
      url: "https://shadowfactory.vercel.app/mesh_gradient_generator",
      tags: ["gradient", "mesh", "animation", "css", "canvas", "background"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "preset": {
            "type": "string",
            "enum": ["sunset", "ocean", "forest", "fire", "cosmic", "candy"],
            "description": "Gradient preset"
          },
          "speed": { "type": "number", "minimum": 0, "maximum": 2, "default": 0.5, "description": "Animation speed" },
          "noise": { "type": "number", "minimum": 0, "maximum": 1, "default": 0.3, "description": "Noise intensity" },
          "mix": { "type": "number", "minimum": 0, "maximum": 1, "default": 0.5, "description": "Color mix ratio" },
          "resolution": { "type": "integer", "minimum": 2, "maximum": 10, "default": 5 },
          "animate": { "type": "boolean", "default": true },
          "freeze": { "type": "boolean", "default": false }
        },
        "required": []
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "png": { "type": "string", "format": "uri", "description": "Base64 PNG data URL" },
          "css": { "type": "string", "description": "CSS gradient code" },
          "canvas": { "type": "string", "description": "Canvas data URL" }
        }
      },
      examples: [
        { input: { "preset": "sunset", "speed": 0.5 }, output: { success: true, css: "background: radial-gradient(ellipse at 20% 50%, #ff6b6b, transparent 50%), radial-gradient(ellipse at 80% 50%, #7c4dff, transparent 50%);", previewUrl: "https://shadowfactory.vercel.app/mesh_gradient_generator" } }
      ],
      handlers: { http: "POST /api/execute", postMessage: "mesh-gradient-generator", websocket: "wss://host/mcp" },
      meta: { offline: true, progressive: true, streaming: false, retry: true, multiStep: false, requiresUserConfirmation: false }
    },

    {
      id: "color-palette-generator",
      name: "Color Palette Generator",
      description: "Generate harmonic color palettes using 7 methods (random, monochromatic, complementary, triadic, analogous, tetradic, split-complement). 8 quick palettes, 20-palette history. Export as CSS variables, HEX array, JSON, SVG swatches, GIMP .gpl, standalone .css, AI-ready JSON, or Tailwind config.",
      category: "utility",
      level: "beginner",
      icon: "🎨",
      version: "5.1.0",
      url: "https://shadowfactory.vercel.app/color_palette_generator",
      tags: ["color", "palette", "generator", "harmony", "css", "tailwind", "gimp"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "method": {
            "type": "string",
            "enum": ["random", "monochromatic", "complementary", "triadic", "analogous", "tetradic", "split-complement"],
            "description": "Color harmony method"
          },
          "baseColor": { "type": "string", "format": "color", "description": "Base color (hex)" },
          "count": { "type": "integer", "minimum": 3, "maximum": 12, "default": 5, "description": "Number of colors" },
          "exportFormat": {
            "type": "string",
            "enum": ["css-variables", "hex-array", "json", "svg-swatches", "gpl", "css-file", "tailwind", "ai-json"],
            "default": "css-variables",
            "description": "Export format"
          }
        },
        "required": ["method"]
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "colors": { "type": "array", "items": { "type": "string", "format": "color" } },
          "css": { "type": "string", "description": "CSS variables or styles" },
          "json": { "type": "string", "description": "JSON formatted palette" },
          "svg": { "type": "string", "description": "SVG swatches" },
          "gpl": { "type": "string", "description": "GIMP palette format" },
          "tailwind": { "type": "string", "description": "Tailwind config snippet" }
        }
      },
      examples: [
        { input: { "method": "complementary", "baseColor": "#7c4dff" }, output: { success: true, colors: ["#7c4dff", "#ff7043"], css: "--color-1: #7c4dff; --color-2: #ff7043;", previewUrl: "https://shadowfactory.vercel.app/color_palette_generator" } }
      ],
      handlers: { http: "POST /api/execute", postMessage: "color-palette-generator", websocket: "wss://host/mcp" },
      meta: { offline: true, progressive: true, streaming: false, retry: true, multiStep: false, requiresUserConfirmation: false }
    },

    // === AUDIO TOOLS ===
    {
      id: "audio-synth",
      name: "Audio Synthesizer",
      description: "WebAudio API synthesizer. 8 procedural SFX (coin, laser, jump, explosion, power-up, hit, pickup, shoot) and infinite BGM engine with 4 scales, 4 instrument types, tempo/BPM/complexity controls, and EQ visualizer. WAV download via MediaRecorder.",
      category: "audio",
      level: "intermediate",
      icon: "🎹",
      version: "5.1.0",
      url: "https://shadowfactory.vercel.app/shadow_audio_synth",
      tags: ["audio", "synthesis", "procedural", "music", "sound", "sfx", "bgm", "webaudio"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "enum": ["sfx", "bgm"],
            "description": "Sound type: SFX preset or BGM loop"
          },
          "preset": {
            "type": "string",
            "enum": ["coin", "laser", "jump", "explosion", "powerup", "hit", "pickup", "shoot"],
            "description": "SFX preset (when type=sfx)"
          },
          "scale": {
            "type": "string",
            "enum": ["C-major", "A-minor", "pentatonic", "blues"],
            "description": "Musical scale for BGM"
          },
          "instrument": {
            "type": "string",
            "enum": ["sine", "square", "sawtooth", "triangle"],
            "description": "Waveform instrument"
          },
          "tempo": { "type": "number", "minimum": 60, "maximum": 240, "default": 120, "description": "BPM tempo" },
          "complexity": { "type": "number", "minimum": 1, "maximum": 10, "default": 5, "description": "Pattern complexity" },
          "duration": { "type": "number", "minimum": 1, "maximum": 30, "default": 5, "description": "Duration in seconds" }
        },
        "required": ["type"]
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "wav": { "type": "string", "format": "uri", "description": "WAV audio data URL" },
          "frequency": { "type": "number", "description": "Dominant frequency in Hz" },
          "duration": { "type": "number", "description": "Audio duration in seconds" }
        }
      },
      examples: [
        { input: { "type": "sfx", "preset": "coin" }, output: { success: true, wav: "data:audio/wav;base64,...", duration: 0.5 } }
      ],
      handlers: { http: "POST /api/execute", postMessage: "audio-synth", websocket: "wss://host/mcp" },
      meta: { offline: true, progressive: true, streaming: false, retry: true, multiStep: false, requiresUserConfirmation: false }
    },

    {
      id: "text-to-soundscape",
      name: "Text-to-Soundscape",
      description: "Keyword-based mood detection (7 moods) from text input. Procedural soundscape generation with adjustable tempo, duration, and intensity. WAV recording & download with AI-ready parameter export.",
      category: "audio",
      level: "beginner",
      icon: "🔊",
      version: "5.1.0",
      url: "https://shadowfactory.vercel.app/shadow_prompt_audio",
      tags: ["audio", "text-to-sound", "ambient", "mood", "procedural", "soundscape"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "text": { "type": "string", "description": "Text description to generate soundscape from" },
          "mood": {
            "type": "string",
            "enum": ["calm", "energetic", "dark", "bright", "mysterious", "peaceful", "tense"],
            "description": "Mood override (auto-detected from text if not specified)"
          },
          "tempo": { "type": "number", "minimum": 40, "maximum": 200, "default": 80 },
          "duration": { "type": "number", "minimum": 10, "maximum": 120, "default": 30 },
          "intensity": { "type": "number", "minimum": 0, "maximum": 100, "default": 50 }
        },
        "required": ["text"]
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "wav": { "type": "string", "format": "uri", "description": "WAV audio data URL" },
          "detectedMood": { "type": "string" },
          "scenes": { "type": "array", "items": { "type": "string" } },
          "parameters": { "type": "object", "description": "AI-ready parameter export (JSON with prompt + detected mood + audio settings)" }
        }
      },
      examples: [
        { input: { "text": "rainy night in a quiet city", "duration": 30 }, output: { success: true, detectedMood: "calm", wav: "data:audio/wav;base64,...", previewUrl: "https://shadowfactory.vercel.app/shadow_prompt_audio" } }
      ],
      handlers: { http: "POST /api/execute", postMessage: "text-to-soundscape", sse: "/api/stream" },
      meta: { offline: false, progressive: false, streaming: true, retry: true, multiStep: true, requiresUserConfirmation: false }
    },

    // === ASSET TOOLS ===
    {
      id: "sprite-mapper",
      name: "Sprite Mapper",
      description: "Extract objects from images to create sprite sheets. 3 modes: flood-fill extraction (threshold/min-size/bg detection), grid slicing (cols/rows/spacing), and select mode. Export as sprite sheet PNG, sprite strip, individual PNGs, CSV, JSON, CSS spritesheet, or AI-ready JSON with data URLs.",
      category: "assets",
      level: "intermediate",
      icon: "🗺️",
      version: "5.1.0",
      url: "https://shadowfactory.vercel.app/icon_mapper",
      tags: ["sprites", "images", "extraction", "sprite-sheet", "batch", "flood-fill", "pixel"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "image": { "type": "string", "format": "data-url", "description": "Base64-encoded image data" },
          "mode": {
            "type": "string",
            "enum": ["flood-fill", "grid-slice", "select"],
            "description": "Extraction mode"
          },
          "threshold": { "type": "number", "minimum": 0, "maximum": 255, "default": 128, "description": "Color threshold for flood-fill" },
          "minSize": { "type": "integer", "minimum": 1, "default": 10, "description": "Minimum sprite size" },
          "cols": { "type": "integer", "minimum": 1, "default": 1, "description": "Columns for grid slicing" },
          "rows": { "type": "integer", "minimum": 1, "default": 1, "description": "Rows for grid slicing" },
          "exportFormat": {
            "type": "string",
            "enum": ["png", "strip", "individual", "csv", "json", "css", "ai-json"],
            "default": "png",
            "description": "Export format"
          }
        },
        "required": ["image", "mode"]
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "spriteSheet": { "type": "string", "format": "data-url" },
          "individualSprites": { "type": "array", "items": { "type": "string", "format": "data-url" } },
          "metadata": { "type": "object" },
          "csv": { "type": "string" },
          "css": { "type": "string" },
          "json": { "type": "string" }
        }
      },
      examples: [
        { input: { "image": "data:image/png;base64,...", "mode": "grid-slice", "cols": 4, "rows": 4 }, output: { success: true, spriteSheet: "data:image/png;base64,...", count: 16, previewUrl: "https://shadowfactory.vercel.app/icon_mapper" } }
      ],
      handlers: { http: "POST /api/execute", postMessage: "sprite-mapper", websocket: "wss://host/mcp" },
      meta: { offline: true, progressive: true, streaming: false, retry: true, multiStep: true, requiresUserConfirmation: true }
    },

    {
      id: "animated-icon-exporter",
      name: "Animated Icon Exporter",
      description: "Pixel art editor with 7 drawing tools (brush, eraser, fill, rect, circle, line, color picker). 6 canvas sizes (16×16 to 128×128). 32-frame animation timeline with FPS control, onion skin, frame management. Export as GIF, WebM, sprite sheet, CSS @keyframes, PNG, or data URL.",
      category: "animation",
      level: "intermediate",
      icon: "🎞️",
      version: "5.1.0",
      url: "https://shadowfactory.vercel.app/icon_exporter_animated",
      tags: ["pixel", "animation", "icon", "gif", "webm", "sprite-sheet", "drawing", "frame"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "action": {
            "type": "string",
            "enum": ["draw", "animate", "export"],
            "description": "Action to perform"
          },
          "canvasSize": {
            "type": "integer",
            "enum": [16, 24, 32, 48, 64, 128],
            "default": 32,
            "description": "Canvas size (pixels)"
          },
          "frames": {
            "type": "integer",
            "minimum": 1,
            "maximum": 32,
            "default": 1,
            "description": "Number of frames"
          },
          "fps": {
            "type": "integer",
            "minimum": 1,
            "maximum": 60,
            "default": 12,
            "description": "Frames per second"
          },
          "exportFormat": {
            "type": "string",
            "enum": ["gif", "webm", "sprite-sheet", "css-keyframes", "png", "data-url"],
            "default": "gif",
            "description": "Export format"
          }
        },
        "required": ["action"]
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "gif": { "type": "string", "format": "uri" },
          "webm": { "type": "string", "format": "uri" },
          "spriteSheet": { "type": "string", "format": "data-url" },
          "cssKeyframes": { "type": "string", "description": "CSS @keyframes code" },
          "png": { "type": "string", "format": "data-url" }
        }
      },
      examples: [
        { input: { "action": "animate", "frames": 8, "fps": 12 }, output: { success: true, gif: "data:image/gif;base64,...", previewUrl: "https://shadowfactory.vercel.app/icon_exporter_animated" } }
      ],
      handlers: { http: "POST /api/execute", postMessage: "animated-icon-exporter", websocket: "wss://host/mcp" },
      meta: { offline: true, progressive: true, streaming: false, retry: true, multiStep: true, requiresUserConfirmation: false }
    },

    {
      id: "icon-designer",
      name: "Icon Designer",
      description: "Vector icon editor with 9 tools (pencil, eraser, line, rect, circle, fill, picker, clear, undo). Bresenham line and flood fill algorithms. Layer system with visibility toggle and merge. Multi-size preview (16/24/32/48/64). Export as PNG, SVG, favicon.ico, CSS background, Data URL, Base64, or AI-ready JSON with per-pixel data.",
      category: "visual",
      level: "beginner",
      icon: "🖌️",
      version: "5.1.0",
      url: "https://shadowfactory.vercel.app/icon_designer",
      tags: ["icon", "design", "vector", "drawing", "layers", "pixel", "svg", "favicon"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "action": {
            "type": "string",
            "enum": ["draw", "fill", "export"],
            "description": "Action to perform"
          },
          "tool": {
            "type": "string",
            "enum": ["pencil", "eraser", "line", "rect", "circle", "fill", "picker"],
            "description": "Drawing tool"
          },
          "size": { "type": "integer", "minimum": 16, "maximum": 64, "default": 32 },
          "color": { "type": "string", "format": "color", "default": "#000000" },
          "exportFormat": {
            "type": "string",
            "enum": ["png", "svg", "ico", "css", "data-url", "base64", "ai-json"],
            "default": "png",
            "description": "Export format"
          }
        },
        "required": ["action"]
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "png": { "type": "string", "format": "data-url" },
          "svg": { "type": "string", "description": "SVG path data" },
          "ico": { "type": "string", "format": "data-url" },
          "css": { "type": "string", "description": "CSS background property" },
          "dataUrl": { "type": "string" },
          "base64": { "type": "string" },
          "aiData": { "type": "object", "description": "Per-pixel data for AI processing" }
        }
      },
      examples: [
        { input: { "action": "draw", "tool": "pencil", "color": "#ff0000" }, output: { success: true, png: "data:image/png;base64,...", previewUrl: "https://shadowfactory.vercel.app/icon_designer" } }
      ],
      handlers: { http: "POST /api/execute", postMessage: "icon-designer", websocket: "wss://host/mcp" },
      meta: { offline: true, progressive: true, streaming: false, retry: true, multiStep: false, requiresUserConfirmation: false }
    },

    {
      id: "photo-editor",
      name: "Photo Editor",
      description: "Full-featured browser-based photo editor. Drawing tools (brush with size/opacity/color, eraser), shape tools (rect, circle, ellipse, line, arrow, star, triangle, heart), text tool with font/size/color selection, 12 filters (grayscale, sepia, blur, saturate, contrast, brightness, hue-rotate, invert, vintage, vibrant), adjustment panel, transform tools, flood fill, eyedropper, 30-level undo/redo. Export as PNG, JPEG, WebP, or SVG.",
      category: "visual",
      level: "beginner",
      icon: "📷",
      version: "5.1.0",
      url: "https://shadowfactory.vercel.app/photo_editor",
      tags: ["photo", "image", "editor", "filters", "drawing", "shapes", "text", "layers", "adjustments", "transform", "flood-fill", "eyedropper"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "action": {
            "type": "string",
            "enum": ["open", "edit", "filter", "adjust", "transform", "draw", "export"],
            "description": "Action to perform"
          },
          "image": {
            "type": "string",
            "format": "data-url",
            "description": "Base64-encoded image data to load"
          },
          "filter": {
            "type": "string",
            "enum": ["grayscale", "sepia", "blur", "saturate", "contrast", "brightness", "hue-rotate", "invert", "vintage", "vibrant"],
            "description": "Filter to apply"
          },
          "adjustments": {
            "type": "object",
            "properties": {
              "brightness": { "type": "integer", "minimum": -100, "maximum": 100, "default": 0 },
              "contrast": { "type": "integer", "minimum": -100, "maximum": 100, "default": 0 },
              "saturation": { "type": "integer", "minimum": -100, "maximum": 100, "default": 0 },
              "hueRotate": { "type": "integer", "minimum": 0, "maximum": 360, "default": 0 },
              "blur": { "type": "number", "minimum": 0, "maximum": 20, "default": 0 },
              "sharpen": { "type": "number", "minimum": 0, "maximum": 10, "default": 0 }
            },
            "description": "Adjustment parameters"
          },
          "transform": {
            "type": "object",
            "properties": {
              "rotate": { "type": "number", "description": "Rotation angle in degrees" },
              "flipH": { "type": "boolean", "description": "Flip horizontal" },
              "flipV": { "type": "boolean", "description": "Flip vertical" }
            }
          },
          "tool": {
            "type": "string",
            "enum": ["brush", "eraser", "shape", "text", "flood-fill", "eyedropper"],
            "description": "Active drawing tool"
          },
          "brushSettings": {
            "type": "object",
            "properties": {
              "size": { "type": "integer", "minimum": 1, "maximum": 500, "default": 10 },
              "opacity": { "type": "number", "minimum": 0, "maximum": 1, "default": 1 },
              "color": { "type": "string", "format": "color", "default": "#000000" }
            }
          },
          "exportFormat": {
            "type": "string",
            "enum": ["png", "jpeg", "webp", "svg"],
            "default": "png",
            "description": "Export format"
          },
          "quality": { "type": "number", "minimum": 0, "maximum": 1, "default": 0.92 }
        },
        "required": ["action"]
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "image": { "type": "string", "format": "data-url", "description": "Edited image as data URL" },
          "previewUrl": { "type": "string", "format": "uri" },
          "format": { "type": "string", "enum": ["png", "jpeg", "webp", "svg"] }
        }
      },
      examples: [
        { input: { "action": "filter", "filter": "vintage" }, output: { success: true, image: "data:image/png;base64,...", format: "png", previewUrl: "https://shadowfactory.vercel.app/photo_editor" } }
      ],
      handlers: { http: "POST /api/execute", postMessage: "photo-editor", websocket: "wss://host/mcp" },
      meta: { offline: true, progressive: true, streaming: false, retry: true, multiStep: false, requiresUserConfirmation: false }
    },

    {
      id: "2.5d-playground",
      name: "2.5D Playground",
      description: "Interactive 2.5D physics playground — build scenes with 3D-like objects, toggle physics/gravity, create art, architecture mockups, and game prototypes using pure CSS 3D transforms. 8 object types (cube, sphere, cylinder, plane, cone, torus, 3D text, light). Material system (standard, metal, glass, wireframe, glow), animation presets (spin, bounce, pulse, float), 6 scene presets, camera controls, background options. Full undo/redo.",
      category: "animation",
      level: "intermediate",
      icon: "🎮",
      version: "5.1.0",
      url: "https://shadowfactory.vercel.app/2.5d_playground",
      tags: ["2.5d", "physics", "3d", "playground", "scene-builder", "css-3d", "interactive"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "action": {
            "type": "string",
            "enum": ["create", "load-preset", "export"],
            "description": "Action to perform"
          },
          "preset": {
            "type": "string",
            "enum": ["empty", "stack", "solar", "tower", "maze", "ballpit"],
            "description": "Scene preset to load"
          },
          "objectType": {
            "type": "string",
            "enum": ["cube", "sphere", "cylinder", "plane", "cone", "torus", "text3d", "light"],
            "description": "Object type to add"
          },
          "material": {
            "type": "string",
            "enum": ["standard", "metal", "glass", "wireframe", "glow"],
            "description": "Material type"
          },
          "animation": {
            "type": "string",
            "enum": ["spin", "bounce", "pulse", "float", "none"],
            "description": "Animation preset"
          },
          "physics": { "type": "boolean", "default": false },
          "gravity": { "type": "boolean", "default": false },
          "cameraAngleX": { "type": "number", "minimum": -180, "maximum": 180, "default": 30 },
          "cameraAngleY": { "type": "number", "minimum": -180, "maximum": 180, "default": 30 },
          "cameraZoom": { "type": "number", "minimum": 0.5, "maximum": 5, "default": 1 },
          "background": {
            "type": "string",
            "enum": ["solid", "gradient", "grid", "dark-space"],
            "default": "solid",
            "description": "Background type"
          },
          "exportFormat": {
            "type": "string",
            "enum": ["css", "html", "json", "code"],
            "default": "css",
            "description": "Export format"
          }
        },
        "required": ["action"]
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "css": { "type": "string", "description": "CSS 3D code" },
          "html": { "type": "string", "description": "HTML structure" },
          "json": { "type": "string", "description": "Scene JSON data" },
          "code": { "type": "string", "description": "Complete JS/CSS/HTML code" }
        }
      },
      examples: [
        { input: { "action": "load-preset", "preset": "solar" }, output: { success: true, css: ".scene { transform-style: preserve-3d; }", previewUrl: "https://shadowfactory.vercel.app/2.5d_playground" } }
      ],
      handlers: { http: "POST /api/execute", postMessage: "2.5d-playground", websocket: "wss://host/mcp" },
      meta: { offline: true, progressive: true, streaming: false, retry: true, multiStep: false, requiresUserConfirmation: false }
    },

    // === AI / UTILITY TOOLS ===
    {
      id: "ai-prompt-builder",
      name: "AI Prompt Builder",
      description: "Build structured prompts for AI models (Claude, GPT-4, etc.) with templates, variables, and context management.",
      category: "ai",
      level: "pro",
      icon: "🤖",
      version: "5.1.0",
      url: "https://shadowfactory.vercel.app",
      tags: ["ai", "prompt", "llm", "generator"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "model": { "type": "string", "enum": ["claude", "gpt-4", "gpt-3.5", "gemini", "custom"], "description": "Target AI model" },
          "task": { "type": "string", "description": "What the AI should do" },
          "context": { "type": "string", "description": "Additional context" },
          "outputFormat": { "type": "string", "enum": ["text", "json", "markdown", "html"], "default": "text" },
          "maxTokens": { "type": "integer", "default": 1000 }
        },
        "required": ["task"]
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "prompt": { "type": "string", "description": "Built prompt" },
          "estimatedTokens": { "type": "integer" }
        }
      },
      examples: [
        { input: { "model": "claude", "task": "Create a landing page for a SaaS product", "outputFormat": "html" }, output: { success: true, prompt: "You are a web developer...", estimatedTokens: 250 } }
      ],
      handlers: { http: "POST /api/execute", postMessage: "ai-prompt-builder", websocket: "wss://host/mcp" },
      meta: { offline: true, progressive: true, streaming: false, retry: true, multiStep: false, requiresUserConfirmation: false }
    },

    {
      id: "plugin-installer",
      name: "Plugin Installer",
      description: "Install custom plugins to extend Shadow Studio. Drag & drop a folder or import from URL/GitHub.",
      category: "utility",
      level: "all",
      icon: "🧩",
      version: "5.1.0",
      url: "https://shadowfactory.vercel.app",
      tags: ["plugin", "extension", "install", "custom"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "method": { "type": "string", "enum": ["drag-drop", "url", "github", "npm"], "description": "Installation method" },
          "source": { "type": "string", "description": "Plugin source (URL, GitHub repo, or npm package name)" },
          "autoEnable": { "type": "boolean", "default": true, "description": "Auto-enable after install" }
        },
        "required": ["method", "source"]
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "pluginId": { "type": "string" },
          "message": { "type": "string" }
        }
      },
      examples: [
        { input: { "method": "url", "source": "https://github.com/example/plugin" }, output: { success: true, pluginId: "plugin-abc", message: "Plugin installed successfully" } }
      ],
      handlers: { http: "POST /api/execute", postMessage: "plugin-installer", websocket: "wss://host/mcp" },
      meta: { offline: false, progressive: true, streaming: false, retry: true, multiStep: true, requiresUserConfirmation: true }
    }
  ],

  // MCP-compatible endpoint
  mcp: {
    "tools/list": function() {
      return {
        jsonrpc: "2.0",
        tools: ShadowAIRegistry.tools.map(t => ({
          name: t.id,
          description: t.description,
          inputSchema: t.inputSchema,
          outputSchema: t.outputSchema,
          meta: t.meta
        }))
      };
    },
    "tools/call": function(toolName, args) {
      const tool = ShadowAIRegistry.tools.find(t => t.id === toolName);
      if (!tool) return { error: `Tool "${toolName}" not found` };
      return { tool, args };
    },
    "tools/discover": function(filter = {}) {
      let tools = ShadowAIRegistry.tools;
      if (filter.category) tools = tools.filter(t => t.category === filter.category);
      if (filter.level) tools = tools.filter(t => t.level === filter.level);
      if (filter.offlineOnly) tools = tools.filter(t => t.meta?.offline);
      return { tools, totalCount: tools.length };
    }
  }
};

// Export for consumption
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShadowAIRegistry;
} else if (typeof window !== 'undefined') {
  window.ShadowAIRegistry = ShadowAIRegistry;
}