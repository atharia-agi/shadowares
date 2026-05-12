/**
 * SHADOW STUDIO v3.1 — AI Agent Tool Registry
 * Complete tool definitions for AI-discoverable, AI-executable operations.
 * Compatible with: MCP (Model Context Protocol), OpenAI Function Calling, Anthropic Tool Use
 * @version 3.1.0
 * @author Shadow Toolkit Team
 */

const ShadowAIRegistry = {
  studio: {
    name: "Shadow Studio",
    version: "5.1.0",
    description: "Open source Canva for web dev. AI-ready creative tool platform for assets, animations, and designs.",
    url: "https://shadow-studio-xi.vercel.app",
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
      formats: ["json", "svg", "png", "webp", "webm", "css", "html", "zip"]
    },
    interfaces: {
      mcp: true,
      openai: true,
      anthropic: true
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
      version: "3.0.0",
      tags: ["wysiwyg", "drag-drop", "html", "css", "no-code"],
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
            "items": { "type": "string", "enum": ["header", "hero", "text", "button", "image", "card", "form", "footer"] },
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
          "previewUrl": { "type": "string", "format": "uri" }
        }
      },
      examples: [
        { input: { action: "create", template: "landing-page", components: ["hero", "text", "button"] }, output: { success: true, html: "<!-- ... -->", previewUrl: "https://..." } }
      ],
      handlers: { http: "POST /api/tools/visual-editor", postMessage: "visual-editor" },
      meta: { offline: true, progressive: true, streaming: false, retry: true, multiStep: true, requiresUserConfirmation: false }
    },

    {
      id: "cursor-studio",
      name: "Cursor Studio",
      description: "Design and customize mouse cursors with 12+ themes including UMKM themes (warteg, warkop, bengkel, salon, pasar) and gaming themes (minecraft, fps, rpg, retro, racing).",
      category: "visual",
      level: "beginner",
      icon: "🖱️",
      version: "3.0.0",
      tags: ["cursor", "customization", "ux", "themes"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "theme": {
            "type": "string",
            "enum": ["warteg", "warkop", "bengkel", "salon", "pasar", "tech", "default", "minecraft", "fps", "rpg", "retro", "racing"],
            "description": "Cursor theme to apply"
          },
          "speed": { "type": "number", "minimum": 0, "maximum": 1, "description": "Cursor follow speed (0-1)" },
          "particles": { "type": "boolean", "description": "Enable particle trail" },
          "clickEffect": { "type": "boolean", "description": "Enable click ripple effect" }
        },
        "required": ["theme"]
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "css": { "type": "string", "description": "Generated cursor CSS" },
          "preview": { "type": "string", "description": "Preview data URL" }
        }
      },
      handlers: { http: "POST /api/tools/cursor-studio", postMessage: "cursor-studio" },
      meta: { offline: true, progressive: true, streaming: false, retry: true, multiStep: false, requiresUserConfirmation: false }
    },

    {
      id: "sprite-mapper",
      name: "Sprite Mapper",
      description: "Extract objects from images/videos to create sprite sheets. Supports static and animated sprites, bulk processing, and pixel disintegration effects.",
      category: "assets",
      level: "intermediate",
      icon: "🗺️",
      version: "3.0.0",
      tags: ["sprites", "images", "extraction", "sprite-sheet", "batch"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "source": { "type": "string", "description": "Image/Video URL or base64 data" },
          "algorithm": { "type": "string", "enum": ["BFS", "flood-fill"], "default": "BFS" },
          "format": { "type": "string", "enum": ["sprite-sheet", "individuals", "animated-webm", "zip"], "default": "sprite-sheet" },
          "padding": { "type": "number", "default": 2, "description": "Padding between sprites" },
          "scale": { "type": "number", "default": 1, "description": "Output scale" }
        },
        "required": ["source"]
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "spriteSheet": { "type": "string", "format": "uri", "description": "Generated sprite sheet URL" },
          "count": { "type": "integer", "description": "Number of sprites extracted" },
          "metadata": { "type": "object", "properties": { "width": { "type": "integer" }, "height": { "type": "integer" }, "sprites": { "type": "array" } } }
        }
      },
      handlers: { http: "POST /api/tools/sprite-mapper", postMessage: "sprite-mapper" },
      meta: { offline: true, progressive: false, streaming: false, retry: true, multiStep: true, requiresUserConfirmation: true }
    },

    {
      id: "animated-exporter",
      name: "Animated Exporter",
      description: "Export sprites as animated GIF, WebM, or ZIP. Configure frame rate, duration, and effects.",
      category: "assets",
      level: "intermediate",
      icon: "🎞️",
      version: "3.0.0",
      tags: ["export", "animation", "gif", "webm", "zip"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "format": { "type": "string", "enum": ["gif", "webm", "zip"], "description": "Export format" },
          "fps": { "type": "integer", "minimum": 1, "maximum": 60, "default": 30, "description": "Frames per second" },
          "duration": { "type": "integer", "minimum": 1, "maximum": 60, "default": 3, "description": "Duration in seconds" },
          "loop": { "type": "boolean", "default": true, "description": "Loop animation" }
        },
        "required": ["format"]
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "downloadUrl": { "type": "string", "format": "uri" },
          "fileSize": { "type": "integer", "description": "File size in bytes" }
        }
      },
      handlers: { http: "POST /api/tools/animated-exporter" },
      meta: { offline: false, progressive: true, streaming: true, retry: false, multiStep: true, requiresUserConfirmation: false }
    },

    {
      id: "mesh-gradient",
      name: "Mesh Gradient Generator",
      description: "Create beautiful animated mesh gradients. Control noise, colors, animation speed, and export as CSS or video.",
      category: "visual",
      level: "beginner",
      icon: "🌈",
      version: "3.0.0",
      tags: ["gradient", "mesh", "animation", "css", "background"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "colors": { "type": "array", "items": { "type": "string", "format": "color" }, "description": "Color palette (hex values)" },
          "speed": { "type": "number", "minimum": 0, "maximum": 2, "default": 0.5, "description": "Animation speed" },
          "noise": { "type": "number", "minimum": 0, "maximum": 1, "default": 0.3, "description": "Noise intensity" },
          "export": { "type": "string", "enum": ["css", "png", "webm"], "default": "css" }
        }
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "css": { "type": "string", "description": "CSS background code" },
          "gradient": { "type": "string", "description": "CSS gradient value" }
        }
      },
      handlers: { http: "POST /api/tools/mesh-gradient", postMessage: "mesh-gradient" },
      meta: { offline: true, progressive: true, streaming: false, retry: true, multiStep: false, requiresUserConfirmation: false }
    },

    {
      id: "css-effect",
      name: "CSS Effect Generator",
      description: "Generate CSS visual effects: glassmorphism, glow, 3D transforms, and animated gradients.",
      category: "visual",
      level: "intermediate",
      icon: "✨",
      version: "3.0.0",
      tags: ["css", "effect", "glassmorphism", "glow", "generator"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "type": { "type": "string", "enum": ["glassmorphism", "glow", "3d-transform", "animated-gradient", "all"], "description": "Effect type" },
          "color": { "type": "string", "format": "color", "default": "#7c4dff", "description": "Primary color" },
          "intensity": { "type": "number", "minimum": 0, "maximum": 1, "default": 0.5 }
        },
        "required": ["type"]
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "css": { "type": "string", "description": "Generated CSS code" },
          "preview": { "type": "string", "description": "HTML preview code" }
        }
      },
      handlers: { http: "POST /api/tools/css-effect", postMessage: "css-effect" },
      meta: { offline: true, progressive: true, streaming: false, retry: true, multiStep: false, requiresUserConfirmation: false }
    },

    {
      id: "color-palette",
      name: "Color Palette Generator",
      description: "Generate harmonic color palettes: random, from image, monochromatic, complementary, triadic. Export as CSS, JSON, or image.",
      category: "utility",
      level: "beginner",
      icon: "🎨",
      version: "3.0.0",
      tags: ["color", "palette", "generator", "harmony"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "method": { "type": "string", "enum": ["random", "from-image", "monochromatic", "complementary", "triadic", "analogous"], "description": "Generation method" },
          "baseColor": { "type": "string", "format": "color", "description": "Base color (hex)" },
          "count": { "type": "integer", "minimum": 3, "maximum": 10, "default": 5, "description": "Number of colors" },
          "export": { "type": "string", "enum": ["css", "json", "png"], "default": "json" }
        },
        "required": ["method"]
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "colors": { "type": "array", "items": { "type": "string", "format": "color" } },
          "css": { "type": "string" },
          "json": { "type": "string" }
        }
      },
      handlers: { http: "POST /api/tools/color-palette", postMessage: "color-palette" },
      meta: { offline: true, progressive: true, streaming: false, retry: true, multiStep: false, requiresUserConfirmation: false }
    },

    // === AUDIO TOOLS ===
    {
      id: "audio-synth",
      name: "Audio Synthesizer",
      description: "Create procedural sounds and music. Choose waveform (sine, square, sawtooth, triangle), apply filters, and export as WAV or WebM.",
      category: "audio",
      level: "intermediate",
      icon: "🎹",
      version: "3.0.0",
      tags: ["audio", "synthesis", "procedural", "music", "sound"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "waveform": { "type": "string", "enum": ["sine", "square", "sawtooth", "triangle"], "default": "sine" },
          "frequency": { "type": "number", "minimum": 20, "maximum": 20000, "default": 440, "description": "Frequency in Hz" },
          "duration": { "type": "number", "minimum": 0.1, "maximum": 60, "default": 1, "description": "Duration in seconds" },
          "volume": { "type": "number", "minimum": 0, "maximum": 1, "default": 0.5 },
          "filter": { "type": "string", "enum": ["lowpass", "highpass", "bandpass", "none"], "default": "none" }
        }
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "audioData": { "type": "string", "format": "uri", "description": "Generated audio data URL" },
          "format": { "type": "string", "enum": ["wav", "webm", "mp3"] }
        }
      },
      handlers: { http: "POST /api/tools/audio-synth", postMessage: "audio-synth" },
      meta: { offline: true, progressive: false, streaming: false, retry: true, multiStep: false, requiresUserConfirmation: false }
    },

    {
      id: "text-to-soundscape",
      name: "Text to Soundscape",
      description: "Generate ambient soundscapes from text descriptions. Describe a scene (e.g., 'rainy night city') and get matching audio background.",
      category: "audio",
      level: "beginner",
      icon: "🔊",
      version: "3.0.0",
      tags: ["audio", "text-to-sound", "ambient", "music"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "description": { "type": "string", "description": "Text description of the desired sound" },
          "duration": { "type": "integer", "minimum": 10, "maximum": 300, "default": 60, "description": "Duration in seconds" },
          "mood": { "type": "string", "enum": ["calm", "energetic", "dark", "bright", "mysterious"], "default": "calm" }
        },
        "required": ["description"]
      },
      outputSchema: {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "audioData": { "type": "string", "format": "uri" },
          "mood": { "type": "string" },
          "scenes": { "type": "array", "items": { "type": "string" }, "description": "Detected scenes in audio" }
        }
      },
      handlers: { http: "POST /api/tools/text-to-soundscape" },
      meta: { offline: false, progressive: false, streaming: true, retry: true, multiStep: true, requiresUserConfirmation: false }
    },

    // === ADVANCED / AI TOOLS ===
    {
      id: "ai-prompt-builder",
      name: "AI Prompt Builder",
      description: "Build structured prompts for AI models (Claude, GPT-4, etc.) with templates, variables, and context management.",
      category: "ai",
      level: "pro",
      icon: "🤖",
      version: "3.1.0",
      tags: ["ai", "prompt", "llm", "generator"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "model": { "type": "string", "enum": ["claude", "gpt-4", "gpt-3.5", "custom"], "description": "Target AI model" },
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
          "success": {"type": "boolean"},
          "prompt": { "type": "string", "description": "Built prompt" },
          "estimatedTokens": { "type": "integer" }
        }
      },
      handlers: { http: "POST /api/tools/ai-prompt-builder", postMessage: "ai-prompt-builder" },
      meta: { offline: true, progressive: true, streaming: false, retry: true, multiStep: false, requiresUserConfirmation: false }
    },

{
      id: "plugin-installer",
      name: "Plugin Installer",
      description: "Install custom plugins to extend Shadow Studio. Drag & drop a folder or import from URL/GitHub.",
      category: "utility",
      level: "all",
      icon: "🧩",
      version: "3.1.0",
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
      handlers: { http: "POST /api/tools/plugin-installer", postMessage: "plugin-installer" },
      meta: { offline: false, progressive: true, streaming: false, retry: true, multiStep: true, requiresUserConfirmation: true }
    },

    {
      id: "photo-editor",
      name: "Photo Editor",
      description: "Full-featured browser-based photo editor with layers, filters, adjustments, drawing tools, shapes, text, and flood fill. Export as PNG, JPEG, WebP, or SVG.",
      category: "visual",
      level: "beginner",
      icon: "📷",
      version: "5.1.0",
      tags: ["photo", "image", "editor", "filters", "drawing", "crop", "layers"],
      inputSchema: {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "action": {
            "type": "string",
            "enum": ["open", "edit", "filter", "adjust", "export"],
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
          "exportFormat": {
            "type": "string",
            "enum": ["png", "jpeg", "webp", "svg"],
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
          "image": { "type": "string", "format": "data-url", "description": "Edited image as data URL" },
          "previewUrl": { "type": "string", "format": "uri" }
        }
      },
      handlers: { http: "POST /api/tools/photo-editor", postMessage: "photo-editor" },
      meta: { offline: true, progressive: true, streaming: false, retry: true, multiStep: false, requiresUserConfirmation: false }
    },

    {
      id: "2.5d-playground",
      name: "2.5D Playground",
      description: "Interactive 2.5D physics playground — build scenes with 3D-like objects, toggle physics/gravity, create art, architecture mockups, and game prototypes.",
      category: "animation",
      level: "intermediate",
      icon: "🎮",
      version: "5.1.0",
      tags: ["2.5d", "physics", "3d", "playground", "scene-builder", "interactive"],
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
          "css": { "type": "string" },
          "html": { "type": "string" },
          "json": { "type": "string" },
          "code": { "type": "string" }
        }
      },
      handlers: { http: "POST /api/tools/2.5d-playground", postMessage: "2.5d-playground" },
      meta: { offline: true, progressive: true, streaming: false, retry: true, multiStep: false, requiresUserConfirmation: false }
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
          inputSchema: t.inputSchema
        }))
      };
    }
  }
};

// Export for consumption
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShadowAIRegistry;
} else if (typeof window !== 'undefined') {
  window.ShadowAIRegistry = ShadowAIRegistry;
}
