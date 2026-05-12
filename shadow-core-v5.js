/**
 * SHADOW STUDIO v5.0 — UNIVERSAL ASSET GENERATOR
 * Zero-dependency, blazing fast, 100% working without AI
 * Optional AI boost via NVIDIA API (BYOK)
 * Optimized for: Performance, Usability, Modularity
 * Architecture: Micro-module, lazy-loaded, offline-first
 * @version 5.1.0
 * @author Shadow Toolkit Team
 * @license MIT
 */

// ==========================================
// PART 0: NVIDIA AI BRIDGE (Updated v5.2 — Free NIM Endpoints)
// ==========================================

class NVIDIAAPIBridge {
  constructor() {
    this.baseURL = 'https://integrate.api.nvidia.com/v1';
    this.models = {
      // Chat/Reasoning (Chat Completions API — newest first)
      chat: {
        'minimax-m2.7': { endpoint: '/chat/completions', model: 'minimaxai/minimax-m2.7', free: true, desc: '230B reasoning + coding, 1mo old' },
        'glm-4.7': { endpoint: '/chat/completions', model: 'z-ai/glm-4.7', free: true, desc: 'Agentic coding + tool use, 3wk old' },
        'step-3.5-flash': { endpoint: '/chat/completions', model: 'stepfun-ai/step-3.5-flash', free: true, desc: '200B reasoning MoE, 3mo old — your fav' },
        'mistral-large-3-675b': { endpoint: '/chat/completions', model: 'mistralai/mistral-large-3-675b-instruct-2512', free: true, desc: 'General VLM, 5mo old' },
        'seed-oss-36b': { endpoint: '/chat/completions', model: 'bytedance/seed-oss-36b-instruct', free: true, desc: 'Reasoning + agentic, 8mo old' },
        'qwen3-coder-480b': { endpoint: '/chat/completions', model: 'qwen/qwen3-coder-480b-a35b-instruct', free: true, desc: 'Agentic coding 480B, 8mo old' },
        'nemotron-3-super-120b': { endpoint: '/chat/completions', model: 'nvidia/nemotron-3-super-120b-a12b', free: false, desc: '1M context MoE, 2mo old' },
        'mistral-small-4-119b': { endpoint: '/chat/completions', model: 'mistralai/mistral-small-4-119b-2603', free: false, desc: 'Hybrid MoE, 1mo old' },
      },
      // TTS
      tts: {
        'magpie-tts': { endpoint: 'https://ai.api.nvidia.com/v1/nim/nvidia/magpie-tts-zeroshot/invoke', model: null, free: true, desc: 'Expressive TTS from short sample' },
      },
      // Multimodal Vision
      vision: {
        'phi-4-multimodal': { endpoint: '/chat/completions', model: 'microsoft/phi-4-multimodal-instruct', free: true, desc: 'Image + audio understanding' },
        'synthetic-video-detector': { endpoint: 'https://ai.api.nvidia.com/v1/nim/nvidia/synthetic-video-detector/invoke', model: null, free: true, desc: 'Detect AI-generated video, 3wk old' },
        'cosmos-transfer2.5-2b': { endpoint: 'https://ai.api.nvidia.com/v1/nim/nvidia/cosmos-transfer2.5-2b/invoke', model: null, free: true, desc: 'Text-to-video world states, 2mo old' },
      },
      // Embeddings
      embed: {
        'nv-embedcode-7b': { endpoint: 'https://ai.api.nvidia.com/v1/retrieval/nvidia/nv-embedcode-7b-v1/invoke', model: null, free: true, desc: 'Code embedding/retrieval' },
      },
      // Translation
      translate: {
        'riva-translate-4b': { endpoint: '/chat/completions', model: 'nvidia/riva-translate-4b-instruct-v1_1', free: true, desc: '12-language translation, 5mo old' },
      },
      // Safety / PII
      safety: {
        'content-safety': { endpoint: '/chat/completions', model: 'nvidia/llama-3.1-nemotron-safety-guard-8b-v3', free: true, desc: 'Content safety' },
        'gliner-pii': { endpoint: 'https://ai.api.nvidia.com/v1/nim/nvidia/gliner-pii/invoke', model: null, free: true, desc: 'PII detection, 2mo old' },
      },
    };
    this.apiKey = null;
    this.currentModel = 'step-3.5-flash';
    this.rateLimit = { remaining: 50, resetTime: Date.now() + 3600000 };
  }

  setKey(key) { this.apiKey = key; }
  get isAvailable() { return !!this.apiKey && this.rateLimit.remaining > 0; }
  get modelList() {
    const list = [];
    Object.entries(this.models).forEach(([cat, models]) => {
      Object.entries(models).forEach(([id, cfg]) => {
        list.push({ id, category: cat, ...cfg });
      });
    });
    return list;
  }
  get freeModelList() { return this.modelList.filter(m => m.free); }

  setModel(id) {
    for (const cat of Object.values(this.models)) {
      if (cat[id]) { this.currentModel = id; return true; }
    }
    return false;
  }

  async _chatRequest(modelId, messages, opts = {}) {
    if (!this.isAvailable) throw new Error('NVIDIA API not configured. Set API key in Settings > BYOK > NVIDIA.');
    const cfg = this._findModel(modelId);
    if (!cfg) throw new Error(`Unknown model: ${modelId}`);
    
    const url = cfg.endpoint.startsWith('http') ? cfg.endpoint : `${this.baseURL}${cfg.endpoint}`;
    const payload = {
      model: cfg.model,
      messages,
      max_tokens: opts.maxTokens || 2048,
      temperature: opts.temperature ?? 0.7,
      top_p: opts.topP ?? 0.95,
    };
    if (opts.stream) payload.stream = true;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error?.message || err.error || `NVIDIA API error: ${res.status}`);
    }

    this.rateLimit.remaining--;
    if (opts.stream) return res.body;
    return res.json();
  }

  async _nimRequest(url, payload) {
    if (!this.isAvailable) throw new Error('NVIDIA API not configured.');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`NVIDIA API error: ${res.status}`);
    this.rateLimit.remaining--;
    return res.json();
  }

  _findModel(id) {
    for (const cat of Object.values(this.models)) {
      if (cat[id]) return cat[id];
    }
    return null;
  }

  // === HIGH-LEVEL METHODS ===

  // Chat / Reasoning (uses current model)
  async chat(messages, opts = {}) {
    const modelId = opts.model || this.currentModel;
    return this._chatRequest(modelId, messages, opts);
  }

  // Stream chat — returns ReadableStream of tokens
  async chatStream(messages, opts = {}) {
    const modelId = opts.model || 'step-3.5-flash';
    return this._chatRequest(modelId, messages, { ...opts, stream: true });
  }

  // Prompt: ask AI about anything
  async prompt(systemPrompt, userMessage, opts = {}) {
    const modelId = opts.model || this.currentModel;
    return this._chatRequest(modelId, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ], opts);
  },
      {
        id: 'mesh_gradient',
        name: 'Mesh Gradient Generator',
        description: 'Real-time animated mesh gradients',
        category: 'visual',
        inputSchema: { type: 'object', properties: { colors: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 5 }, speed: { type: 'integer', min: 1, max: 100} } },
        outputSchema: { type: 'object', properties: { png: { type: 'string' }, css: { type: 'string' }, canvas: { type: 'string' } } },
        url: 'mesh_gradient_generator.html'
      },
      {
        id: 'color_palette',
        name: 'Color Palette Generator',
        description: '7 harmony methods for perfect palettes',
        category: 'visual',
        inputSchema: { type: 'object', properties: { method: { type: 'string', enum: ['random','monochromatic','complementary','triadic','analogous','tetradic','split-complement'] }, baseColor: { type: 'string', format: 'color' }, count: { type: 'integer', min: 3, max: 12} } },
        outputSchema: { type: 'object', properties: { palette: { type: 'array', items: { type: 'string' } }, css: { type: 'string'}, json: { type: 'string'} } },
        url: 'color_palette_generator.html'
      },
      {
        id: 'css_effects',
        name: 'CSS Effect Generator',
        description: '10 production-ready CSS effects',
        category: 'visual',
        inputSchema: { type: 'object', properties: { effect: { type: 'string', enum: ['glassmorphism','neon-glow','3d-tilt','animated-gradient','shimmer','pulse','deep-shadow','frosted','gradient-text','neon-border'] } } },
        outputSchema: { type: 'object', properties: { css: { type: 'string' }, html: { type: 'string'} } },
        url: 'css_effect_generator.html'
      },
      {
        id: 'audio_synth',
        name: 'Audio Synth Studio',
        description: '8 SFX + infinite BGM engine',
        category: 'audio',
        inputSchema: { type: 'object', properties: { sfx: { type: 'string', enum: ['coin','laser','jump','explosion','powerup','hit','pickup','shoot']} } },
        outputSchema: { type: 'object', properties: { wav: { type: 'string' }, webm: { type: 'string'} } },
        url: 'shadow_audio_synth.html'
      },
      {
        id: 'text_to_sound',
        name: 'Text-to-Soundscape',
        description: 'Mood-based procedural soundscapes',
        category: 'audio',
        inputSchema: { type: 'object', properties: { text: { type: 'string', minLength: 1 }, mood: { type: 'string', enum: ['calm','energetic','dark','dreamy','tense','happy','epic']} } },
        outputSchema: { type: 'object', properties: { wav: { type: 'string' }, params: { type: 'object'} } },
        url: 'shadow_prompt_audio.html'
      },
      {
        id: 'sprite_mapper',
        name: 'Sprite Mapper',
        description: 'Extract sprites from sheets via flood fill',
        category: 'assets',
        inputSchema: { type: 'object', properties: { image: { type: 'string', format: 'data-url'}, method: { type: 'string', enum: ['extract','grid-slice','select']} } },
        outputSchema: { type: 'object', properties: { sprites: { type: 'array' }, sheet: { type: 'string' }, json: { type: 'string'} } },
        url: 'icon_mapper.html'
      },
      {
        id: 'icon_designer',
        name: 'Icon Designer',
        description: 'Pixel-perfect icon editor with layers',
        category: 'visual',
        inputSchema: { type: 'object', properties: { size: { type: 'integer', min: 16, max: 128}, format: { type: 'string', enum: ['png','svg','ico']} } },
        outputSchema: { type: 'object', properties: { png: { type: 'string' }, dataUrl: { type: 'string'} } },
        url: 'icon_designer.html'
      },
      {
        id: 'animated_icon',
        name: 'Animated Icon Exporter',
        description: 'Create & export animated icons',
        category: 'animation',
        inputSchema: { type: 'object', properties: { frames: { type: 'integer', min: 2, max: 32}, fps: { type: 'integer', min: 1, max: 30} } },
        outputSchema: { type: 'object', properties: { gif: { type: 'string' }, webm: { type: 'string' }, sheet: { type: 'string'} } },
        url: 'icon_exporter_animated.html'
      },
      {
        id: 'visual_editor',
        name: 'Visual Editor',
        description: 'WYSIWYG page builder with components',
        category: 'productivity',
        inputSchema: { type: 'object', properties: { template: { type: 'string', enum: ['blank','landing','portfolio','dashboard','blog']} } },
        outputSchema: { type: 'object', properties: { html: { type: 'string'}, css: { type: 'string'}, js: { type: 'string'} } },
        url: 'visual_editor.html'
      },
    ];

    tools.forEach(t => this.tools.set(t.id, t));
  }

  getAll() { return Array.from(this.tools.values()); }

  get(id) { return this.tools.get(id); }

  getByCategory(cat) { return Array.from(this.tools.values()).filter(t => t.category === cat); }

  // MCP-compatible discovery format
  toMCPFormat() {
    return {
      meta: { name: 'Shadow Studio', version: '5.1.0', tools: this.tools.size },
      tools: Array.from(this.tools.values()).map(t => ({
        name: t.id,
        description: t.description,
        inputSchema: t.inputSchema,
        outputSchema: t.outputSchema
      }))
    };
  }

  // OpenAI function calling format
  toOpenAIFormat() {
    return Array.from(this.tools.values()).map(t => ({
      name: t.id,
      description: t.description,
      parameters: t.inputSchema
    }));
  }

  // Anthropic tool use format
  toAnthropicFormat() {
    return Array.from(this.tools.values()).map(t => ({
      name: t.id,
      description: t.description,
      input_schema: t.inputSchema
    }));
  }

  async executeTool(toolId, input, callback) {
    const tool = this.tools.get(toolId);
    if (!tool) throw new Error(`Tool ${toolId} not found`);
    // Open the tool URL and send input via postMessage or storage
    const win = window.open(tool.url, '_blank');
    if (win) {
      win.addEventListener('load', () => {
        win.postMessage({ type: 'shadow-tool-input', toolId, input }, '*');
        if (callback) {
          window.addEventListener('message', (e) => {
            if (e.data.type === 'shadow-tool-output' && e.data.toolId === toolId) {
              callback(e.data.output);
            }
          });
        }
      });
    }
    return { status: 'opened', url: tool.url };
  }
}

// ==========================================
// PART 8: PROJECT MANAGER
// ==========================================

class ShadowProjectManager {
  constructor(core) { this.core = core; }

  async create(name, template = 'blank') {
    const id = this.core._uid('proj');
    const project = {
      id, name, template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tools: [],
      assets: [],
      settings: { theme: 'dark', language: 'en' }
    };
    await this.core.save('projects', project);
    this.core.setState('currentProject', id);
    return project;
  }

  async list() { return await this.core.load('projects') || []; }

  async get(id) { return await this.core.load('projects', id); }

  async save(project) {
    project.updatedAt = new Date().toISOString();
    await this.core.save('projects', project);
    this.core._emit('project:saved', project);
  }

  async delete(id) {
    await this.core.delete('projects', id);
    await this.core.delete('assets'); // Delete project assets
    if (this.core.getState('currentProject') === id) {
      this.core.setState('currentProject', null);
    }
  }

  async addAsset(projectId, asset) {
    asset.projectId = projectId;
    await this.core.save('assets', asset);
    const project = await this.get(projectId);
    if (project && !project.assets) project.assets = [];
    if (project) { project.assets.push(asset.id || asset.name); await this.save(project); }
    return asset;
  }

  async getAssets(projectId) {
    return await this.core.query('assets', 'projectId', IDBKeyRange.only(projectId));
  }

  async exportProject(projectId) {
    const project = await this.get(projectId);
    const assets = await this.getAssets(projectId);
    const exportData = { project, assets, exportedAt: new Date().toISOString() };
    return exportData;
  }
}

// ==========================================
// GLOBAL EXPORTS
// ==========================================

const shadowStudio = new ShadowStudioCore();
window.ShadowStudioCore = ShadowStudioCore;
window.ShadowUtils = ShadowUtils;
window.ShadowExport = ShadowExport;
window.ShadowPluginManager = ShadowPluginManager;
window.ShadowBYOK = ShadowBYOK;
window.ShadowPerfMonitor = ShadowPerfMonitor;
window.ShadowToolRegistry = ShadowToolRegistry;
window.ShadowProjectManager = ShadowProjectManager;
window.shadowStudio = shadowStudio;

// Auto-register tool registry
shadowStudio.register('tools', new ShadowToolRegistry(shadowStudio));
shadowStudio.register('projects', new ShadowProjectManager(shadowStudio));

document.addEventListener('DOMContentLoaded', () => {
  shadowStudio._emit('ready', shadowStudio);
});

console.log(`%c Shadow Studio v5.1.0 %c Ready `, 'background:#7c4dff;color:#fff;padding:4px 8px;border-radius:4px;', 'background:#00e5ff;color:#000;padding:4px 8px;border-radius:4px;');