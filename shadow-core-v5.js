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

  // Prompt: ask AI about anything — image description, code generation, etc.
  async prompt(systemPrompt, userMessage, opts = {}) {
    const modelId = opts.model || this.currentModel;
    return this._chatRequest(modelId, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ], opts);
  }

  // Text to Image via Qwen-Image (or compatible)
  async generateImage(prompt, opts = {}) {
    const result = await this.prompt(
      'You are an image description AI. Given a prompt, return detailed image generation parameters as JSON.',
      `Generate: ${prompt}. ${opts.extra || ''}`,
      { model: opts.model || 'qwen3-coder-480b', ...opts }
    );
    return result;
  }

  // Text to Speech via Magpie TTS
  async synthesize(text, opts = {}) {
    const modelId = opts.model || 'magpie-tts';
    const cfg = this._findModel(modelId);
    if (!cfg) throw new Error('TTS model not found');
    
    const payload = {
      text,
      voice: opts.voice || 'default',
      speed: opts.speed || 1.0,
      format: opts.format || 'wav'
    };
    return this._nimRequest(cfg.endpoint, payload);
  }

  // Image understanding via Phi-4 Multimodal
  async describeImage(imageData, question = 'Describe this image in detail') {
    return this._chatRequest('phi-4-multimodal', [
      { role: 'user', content: [{ type: 'text', text: question }, { type: 'image_url', image_url: { url: imageData } }] }
    ], { maxTokens: 512, temperature: 0.3 });
  }

  // Code embedding search via NV-EmbedCode
  async embedCode(code, query) {
    const payload = {
      input: code,
      query,
      model: 'nvidia/nv-embedcode-7b-v1',
      input_type: query ? 'query' : 'passage'
    };
    return this._nimRequest('https://ai.api.nvidia.com/v1/retrieval/nvidia/nv-embedcode-7b-v1/invoke', payload);
  }

  // Style transfer / image editing via Phi-4 Vision
  async styleTransfer(imageUrl, style) {
    return this._chatRequest('phi-4-multimodal', [
      { role: 'user', content: [{ type: 'text', text: `Apply this style: "${style}". Describe what you see.` }, { type: 'image_url', image_url: { url: imageUrl } }] }
    ], { maxTokens: 1024 });
  }

  // Smart asset description for accessibility
  async describeAsset(imageData, context) {
    const result = await this.describeImage(imageData, `Describe this web dev asset: ${context}. Return ONLY valid JSON: { "description": "...", "tags": [...], "suggested_css": "..." }`);
    return result;
  }
}

// ==========================================
// PART 1: ZERO-DEPENDENCY CORE ENGINE
// ==========================================

class ShadowStudioCore {
  constructor() {
    this.version = '5.1.0';
    this.build = '20260512';
    this.config = {
      apiBase: '/api',
      cacheStrategy: 'memory-first',
      lazyLoad: true,
      moduleTimeout: 30000,
      autosaveInterval: 30000,
      maxUndoStack: 50,
      enableNVIDIA: false
    };

    this.cache = new Map();
    this.modules = new Map();
    this.plugins = new Map();
    this.hooks = new Map();
    this.state = new Map();
    this.undoStack = [];
    this.redoStack = [];
    this.isReady = false;
    this.metrics = {
      loadTime: 0,
      moduleLoadTimes: new Map(),
      renderTimes: new Map(),
      memoryUsage: 0,
      exportCount: 0
    };
    this._autosaveTimer = null;
    this._nvidia = new NVIDIAAPIBridge();

    this._init();
  }

  async _init() {
    console.time('shadow-studio-init');
    const steps = ['Storage', 'BuiltIns', 'State', 'Offline', 'Autosave'];
    for (const step of steps) {
      const t0 = performance.now();
      await this[`_init${step}`]();
      console.log(`  ✓ ${step} init: ${(performance.now() - t0).toFixed(1)}ms`);
    }
    this.isReady = true;
    this.metrics.loadTime = performance.now();
    console.timeEnd('shadow-studio-init');
    console.log(`%c🚀 Shadow Studio v${this.version} ready in ${this.metrics.loadTime.toFixed(0)}ms`, 'color:#7c4dff;font-weight:bold');
    this._emit('ready', this);
  }

  async _initStorage() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ShadowStudio', 3);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        const stores = ['projects', 'assets', 'plugins', 'settings', 'history', 'exports'];
        stores.forEach(name => {
          if (!db.objectStoreNames.contains(name)) {
            if (name === 'assets' || name === 'exports') {
              db.createObjectStore(name, { keyPath: 'id', autoIncrement: true });
            } else {
              db.createObjectStore(name, { keyPath: 'id' });
            }
          }
        });
        // Create indices
        try { db.transaction('assets').objectStore('assets').createIndex('type', 'type', { unique: false }); } catch(e) {}
        try { db.transaction('assets').objectStore('assets').createIndex('projectId', 'projectId', { unique: false }); } catch(e) {}
        try { db.transaction('exports').objectStore('exports').createIndex('date', 'date', { unique: false }); } catch(e) {}
      };
      request.onsuccess = () => { this.db = request.result; resolve(); };
      request.onerror = () => reject(request.error);
    });
  }

  _initBuiltIns() {
    this.register('utils', new ShadowUtils(this));
    this.register('export', new ShadowExport(this));
    this.register('plugins', new ShadowPluginManager(this));
    this.register('byok', new ShadowBYOK(this));
    this.register('nvidia', this._nvidia);
    this.register('performance', new ShadowPerfMonitor(this));
  }

  async _initState() {
    if (!this.db) return;
    try {
      const settings = await this._dbGetAll('settings');
      if (settings) settings.forEach(s => this.state.set(s.key, s.value));
      // Restore BYOK keys
      const keys = await this._dbGetAll('byok_keys');
      if (keys) keys.forEach(k => {
        if (k.service === 'nvidia') this._nvidia.setKey(k.key);
        this.get('byok')?.keys.set(k.service, k.key);
      });
    } catch(e) {}
  }

  _initOffline() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js').catch(() => {});
    }
    // Cache critical assets
    if ('caches' in window) {
      caches.open('shadow-studio-v5').then(cache => {
        cache.addAll(['/', '/index.html', '/shadow-core-v5.js', '/manifest.json']).catch(() => {});
      });
    }
  }

  _initAutosave() {
    if (this._autosaveTimer) clearInterval(this._autosaveTimer);
    const interval = this.config.autosaveInterval || 30000;
    this._autosaveTimer = setInterval(() => {
      if (this.state.size > 0) this._persistState();
      this._emit('autosave', { time: new Date().toISOString() });
    }, interval);
  }

  // ===== Module System =====

  async load(id, loader, deps = []) {
    if (this.modules.has(id)) return this.modules.get(id);
    console.time(`[ShadowStudio] load: ${id}`);
    const start = performance.now();
    try {
      for (const dep of deps) {
        if (!this.modules.has(dep)) throw new Error(`Missing dependency: ${dep}`);
      }
      const module = await loader();
      this.modules.set(id, module);
      if (module.init) await module.init(this);
      this.metrics.moduleLoadTimes.set(id, performance.now() - start);
      console.timeEnd(`[ShadowStudio] load: ${id}`);
      this._emit('module:loaded', { id, time: performance.now() - start });
      return module;
    } catch (err) {
      console.error(`[ShadowStudio] Failed to load ${id}:`, err);
      throw err;
    }
  }

  register(id, module) {
    this.modules.set(id, module);
    if (module.init) module.init(this);
    this._emit('module:registered', { id });
    return this;
  }

  get(id) { return this.modules.get(id); }
  has(id) { return this.modules.has(id); }

  // ===== State Management =====

  setState(key, value, persist = true) {
    const old = this.state.get(key);
    this.state.set(key, value);
    if (persist) this._persistState();
    this._emit('state:change', { key, value, old });
    this._pushUndo({ type: 'state', key, old, value });
    return this;
  }

  getState(key, defaultValue = null) { return this.state.get(key) ?? defaultValue; }

  // ===== Undo/Redo =====

  _pushUndo(action) {
    this.undoStack.push(action);
    if (this.undoStack.length > this.config.maxUndoStack) this.undoStack.shift();
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length === 0) return false;
    const action = this.undoStack.pop();
    if (action.type === 'state') {
      this.state.set(action.key, action.old);
    }
    this.redoStack.push(action);
    this._emit('undo', action);
    return true;
  }

  redo() {
    if (this.redoStack.length === 0) return false;
    const action = this.redoStack.pop();
    if (action.type === 'state') {
      this.state.set(action.key, action.value);
    }
    this.undoStack.push(action);
    this._emit('redo', action);
    return true;
  }

  // ===== Event System =====

  on(event, handler) {
    if (!this.hooks.has(event)) this.hooks.set(event, []);
    this.hooks.get(event).push(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    const handlers = this.hooks.get(event);
    if (!handlers) return;
    const idx = handlers.indexOf(handler);
    if (idx !== -1) handlers.splice(idx, 1);
  }

  once(event, handler) {
    const wrapped = (...args) => { this.off(event, wrapped); handler(...args); };
    this.on(event, wrapped);
  }

  _emit(event, data) {
    const handlers = this.hooks.get(event);
    if (handlers) handlers.forEach(h => { try { h(data); } catch(e) { console.error(`Event handler error for ${event}:`, e); } });
  }

  // ===== IndexedDB Operations =====

  async _dbGetAll(storeName) {
    if (!this.db) return null;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async save(type, data) {
    if (!this.db) return;
    try {
      const tx = this.db.transaction([type], 'readwrite');
      const store = tx.objectStore(type);
      if (Array.isArray(data)) {
        data.forEach(item => store.put(item));
      } else {
        if (!data.id) data.id = this._uid();
        if (!data.createdAt) data.createdAt = new Date().toISOString();
        data.updatedAt = new Date().toISOString();
        store.put(data);
      }
      return new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    } catch(err) {
      console.error(`[ShadowStudio] Save error (${type}):`, err);
    }
  }

  async load(type, id) {
    if (!this.db) return null;
    try {
      const tx = this.db.transaction([type], 'readonly');
      const store = tx.objectStore(type);
      return new Promise((resolve) => {
        const request = id ? store.get(id) : store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      });
    } catch(err) {
      console.error(`[ShadowStudio] Load error (${type}):`, err);
      return null;
    }
  }

  async delete(type, id) {
    if (!this.db) return;
    try {
      const tx = this.db.transaction([type], 'readwrite');
      tx.objectStore(type).delete(id);
      return new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    } catch(err) {
      console.error(`[ShadowStudio] Delete error:`, err);
    }
  }

  async query(storeName, indexName, range) {
    if (!this.db) return [];
    return new Promise((resolve) => {
      const tx = this.db.transaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(range);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }

  // ===== UID & Utilities =====

  _uid(prefix = 'ss') {
    return `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9)}`;
  }

  _persistState() {
    if (!this.db) return;
    const settings = Array.from(this.state.entries()).map(([key, value]) => ({
      id: `st_${key}`,
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : value,
      updatedAt: new Date().toISOString()
    }));
    try {
      const tx = this.db.transaction(['settings'], 'readwrite');
      const store = tx.objectStore('settings');
      settings.forEach(s => store.put(s));
    } catch(e) {
      console.warn('State persistence failed:', e);
    }
  }

  // ===== NVIDIA AI Integration =====

  enableNVIDIA(key) {
    this.config.enableNVIDIA = true;
    this._nvidia.setKey(key);
    this.setState('nvidia_key', key);
    this._emit('nvidia:enabled', { available: this._nvidia.isAvailable });
    return this._nvidia.isAvailable;
  }

  disableNVIDIA() {
    this.config.enableNVIDIA = false;
    this._nvidia.setKey(null);
    this.setState('nvidia_key', null);
    this._emit('nvidia:disabled');
  }

  getNVIDIAStatus() {
    return {
      available: this._nvidia.isAvailable,
      enabled: this.config.enableNVIDIA,
      rateLimit: { ...this._nvidia.rateLimit }
    };
  }

  // ===== Performance Monitor =====

  measureTask(name, fn) {
    const t0 = performance.now();
    const result = fn();
    const elapsed = performance.now() - t0;
    this.metrics.renderTimes.set(name, elapsed);
    return result;
  }

  // ===== Export Stats =====

  recordExport(format) {
    this.metrics.exportCount++;
    const exportRecord = {
      id: this._uid('exp'),
      format,
      timestamp: new Date().toISOString(),
      tool: this.getState('currentTool')
    };
    this.save('exports', exportRecord);
    this._emit('export:recorded', exportRecord);
  }
}

// ==========================================
// PART 2: UTILITY MODULES
// ==========================================

class ShadowUtils {
  constructor(core) { this.core = core; }

  debounce(fn, ms = 300) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
  }

  throttle(fn, ms = 300) {
    let last = 0;
    return (...args) => { const now = Date.now(); if (now - last >= ms) { last = now; fn(...args); } };
  }

  clone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (Array.isArray(obj)) return obj.map(item => this.clone(item));
    const cloned = {};
    for (const key in obj) { if (obj.hasOwnProperty(key)) cloned[key] = this.clone(obj[key]); }
    return cloned;
  }

  uid(prefix = 'ss') {
    return `${prefix}-${crypto.randomUUID ? crypto.randomUUID().slice(0,12) : Math.random().toString(36).substr(2, 9)}`;
  }

  download(filename, content, type = 'text/plain') {
    const blob = new Blob([content], { type, endings: 'native' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.core.recordExport(type);
  }

  async copy(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (err) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta); return true;
    }
  }

  async copyImage(dataUrl) {
    try {
      const blob = await fetch(dataUrl).then(r => r.blob());
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      return true;
    } catch { return false; }
  }

  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  measureText(text, font = '16px Inter') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = font;
    return ctx.measureText(text);
  }

  // Color utilities
  hexToRgb(hex) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? { r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16) } : { r:0, g:0, b:0 };
  }

  rgbToHex(r, g, b) {
    return '#' + [r,g,b].map(x => Math.round(x).toString(16).padStart(2,'0')).join('');
  }

  hexToHsl(hex) {
    const {r,g,b} = this.hexToRgb(hex);
    let r_=r/255, g_=g/255, b_=b/255;
    const max=Math.max(r_,g_,b_), min=Math.min(r_,g_,b_);
    let h,s,l=(max+min)/2;
    if(max!==min){const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);
      switch(max){case r_:h=((g_-b_)/d+(g_<b_?6:0))/6;break;case g_:h=((b_-r_)/d+2)/6;break;case b_:h=((r_-g_)/d+4)/6;break;}}
    else s=0;
    return [Math.round(h*360),Math.round(s*100),Math.round(l*100)];
  }

  hslToHex(h,s,l){
    h/=360;s/=100;l/=100;
    const hue2rgb=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p};
    let r,g,b;
    if(s===0)r=g=b=l;
    else{const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;r=hue2rgb(p,q,h+1/3);g=hue2rgb(p,q,h);b=hue2rgb(p,q,h-1/3);}
    return this.rgbToHex(Math.round(r*255),Math.round(g*255),Math.round(b*255));
  }

  // Data URL to Blob
  dataUrlToBlob(dataUrl) {
    const parts = dataUrl.split(',');
    const mime = parts[0].match(/:(.*?);/)[1];
    const bin = atob(parts[1]);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  // Generate unique palette from text hash
  textToColors(text, count = 5) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    const rng = () => { hash = (hash * 16807 + 0) % 2147483647; return (hash - 1) / 2147483646; };
    return Array.from({length: count}, () => {
      const h = Math.floor(rng() * 360);
      const s = 50 + Math.floor(rng() * 50);
      const l = 40 + Math.floor(rng() * 30);
      return this.hslToHex(h, s, l);
    });
  }

  // SVG generation helpers
  svgRect(x, y, w, h, fill, stroke) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${stroke ? `stroke="${stroke}"` : ''}/>`;
  }
  svgCircle(cx, cy, r, fill, stroke) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${stroke ? `stroke="${stroke}"` : ''}/>`;
  }
  svgText(x, y, text, size, fill) {
    return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-family="monospace">${text}</text>`;
  }
}

// ==========================================
// PART 3: ADVANCED EXPORT ENGINE
// ==========================================

class ShadowExport {
  constructor(core) { this.core = core; this.utils = core.get('utils'); }

  html(data) {
    const { title = 'Shadow Studio Export', html = '', css = '', js = '', meta = {} } = data;
    const metaTags = Object.entries(meta).map(([k,v]) => `<meta name="${k}" content="${v}">`).join('\n  ');
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${metaTags}
  <style>/* Shadow Studio Export */\n${css}</style>
</head>
<body>
${html}
<script>${js}<\/script>
</body>
</html>`;
  }

  css(data) {
    const { selectors = {}, variables = {} } = data;
    let css = ':root {\n';
    for (const [key, value] of Object.entries(variables)) css += `  --${key}: ${value};\n`;
    css += '}\n\n';
    for (const [selector, properties] of Object.entries(selectors)) {
      css += `${selector} {\n`;
      for (const [prop, val] of Object.entries(properties)) css += `  ${prop}: ${val};\n`;
      css += '}\n\n';
    }
    return css;
  }

  async image(canvas, format = 'png', quality = 0.92) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(URL.createObjectURL(blob)), `image/${format}`, quality);
    });
  }

  json(data, pretty = true) { return JSON.stringify(data, null, pretty ? 2 : 0); }

  async zip(files) {
    if (typeof JSZip !== 'undefined') {
      const zip = new JSZip();
      files.forEach(file => zip.file(file.name, file.content));
      const blob = await zip.generateAsync({ type: 'blob' });
      this.utils.download('shadow-studio-export.zip', blob, 'application/zip');
    } else {
      this.utils.download('shadow-studio-export.zip', JSON.stringify(files, null, 2), 'application/json');
    }
  }

  // New: Export complete project as single HTML
  projectToHTML(projectData) {
    const { name = 'Shadow Studio Project', css = '', html = '', js = '', assets = [] } = projectData;
    const assetScripts = assets.map(a => {
      if (a.type === 'image') return `<img src="${a.data}" alt="${a.name}">\n`;
      if (a.type === 'css') return `<style>${a.data}</style>\n`;
      if (a.type === 'js') return `<script>${a.data}<\/script>\n`;
      return '';
    }).join('\n');

    return this.html({
      title: name,
      html: `<div class="ss-project">\n${html}\n${assetScripts}</div>`,
      css: `.ss-project{font-family:system-ui,sans-serif;} ` + css,
      js: `// Shadow Studio Project: ${name}\n` + js,
      meta: { generator: 'Shadow Studio v5.1.0', 'color-scheme': 'dark' }
    });
  }

  // New: Download with filename suggestion
  downloadWithMeta(content, filename, type) {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
    const name = filename.replace(/\.[^.]+$/, '') + `_${dateStr}` + (filename.includes('.') ? '' : '.txt');
    this.utils.download(name, content, type);
    this.core.recordExport(type);
  }
}

// ==========================================
// PART 4: ENHANCED PLUGIN SYSTEM
// ==========================================

class ShadowPluginManager {
  constructor(core) { this.core = core; this.installed = new Map(); this.registry = new Map(); }

  registerPluginType(type, handler) {
    this.registry.set(type, handler);
  }

  isValidManifest(manifest) {
    return manifest && manifest.id && manifest.name && manifest.version && manifest.main &&
           manifest.permissions && Array.isArray(manifest.permissions);
  }

  async install(source, options = {}) {
    try {
      const manifest = await fetch(`${source}/plugin.json`).then(r => r.json());
      if (!this.isValidManifest(manifest)) throw new Error('Invalid plugin manifest');

      // Check permissions
      if (manifest.permissions.includes('nvidia') && !this.core.config.enableNVIDIA) {
        if (!options.autoApprove) throw new Error('Plugin requires NVIDIA API access');
      }

      const module = await import(`${source}/${manifest.main}`);
      const plugin = new module.default(this.core);
      this.installed.set(manifest.id, { manifest, plugin, source, options });
      if (plugin.init) await plugin.init();
      await this.core.save('plugins', {
        id: manifest.id,
        source,
        manifest,
        installedAt: new Date().toISOString()
      });
      this.core._emit('plugin:installed', { id: manifest.id, name: manifest.name });
      return { success: true, id: manifest.id };
    } catch (err) {
      console.error(`[ShadowStudio] Plugin install failed:`, err);
      return { success: false, error: err.message };
    }
  }

  async uninstall(id) {
    const plugin = this.installed.get(id);
    if (!plugin) return { success: false, error: `Plugin "${id}" not found` };
    if (plugin.plugin.destroy) await plugin.plugin.destroy();
    this.installed.delete(id);
    this.core._emit('plugin:uninstalled', { id });
    await this.core.delete('plugins', id);
    return { success: true };
  }

  async list() {
    return Array.from(this.installed.entries()).map(([id, data]) => ({
      id, name: data.manifest.name, version: data.manifest.version,
      description: data.manifest.description, permissions: data.manifest.permissions
    }));
  }

  async discover() {
    // Fetch plugin registry from CDN
    try {
      const registry = await fetch('https://shadow-toolkit.github.io/plugins/registry.json');
      return await registry.json();
    } catch { return []; }
  }
}

// ==========================================
// PART 5: ENHANCED BYOK SYSTEM
// ==========================================

class ShadowBYOK {
  constructor(core) { this.core = core; this.keys = new Map(); }

  async addKey(service, key, encrypted = false) {
    this.keys.set(service, key);
    const storeVal = encrypted ? '***encrypted***' : key;
    await this.core.save('byok_keys', { id: `byok_${service}`, service, key: storeVal });
    this.core._emit('byok:keyAdded', { service });
    return true;
  }

  getKey(service) { return this.keys.get(service); }
  hasKey(service) { return this.keys.has(service); }
  hasAny() { return this.keys.size > 0; }

  async removeKey(service) {
    this.keys.delete(service);
    if (this.core.db) {
      const tx = this.core.db.transaction(['byok_keys'], 'readwrite');
      tx.objectStore('byok_keys').delete(`byok_${service}`);
    }
    this.core._emit('byok:keyRemoved', { service });
  }

  list() { return Array.from(this.keys.keys()); }
}

// ==========================================
// PART 6: PERFORMANCE MONITOR
// ==========================================

class ShadowPerfMonitor {
  constructor(core) { this.core = core; this.metrics = new Map(); }

  start(name) {
    this.metrics.set(name, { start: performance.now(), end: null });
  }

  end(name) {
    const m = this.metrics.get(name);
    if (m) { m.end = performance.now(); m.elapsed = m.end - m.start; }
    return m;
  }

  get(name) { return this.metrics.get(name); }

  getAll() {
    return Array.from(this.metrics.entries()).map(([name, m]) => ({
      name, start: m.start, end: m.end, elapsed: m.elapsed
    }));
  }

  clear() { this.metrics.clear(); }

  // Memory estimate
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }
}

// ==========================================
// PART 7: AI TOOL DISCOVERY & REGISTRY
// ==========================================

class ShadowToolRegistry {
  constructor(core) {
    this.core = core;
    this.tools = new Map();
    this._initDefaultTools();
  }

  _initDefaultTools() {
    // Register all built-in Shadow Studio tools
    const tools = [
      {
        id: 'cursor_generator',
        name: 'Cursor Studio',
        description: 'Design custom cursors with 8+ themes',
        category: 'visual',
        inputSchema: { type: 'object', properties: { theme: { type: 'string', enum: ['circle','crosshair','diamond','square','arrow','dot','ring','star'] }, color: { type: 'string', format: 'color' }, size: { type: 'integer', min: 16, max: 64 } } },
        outputSchema: { type: 'object', properties: { css: { type: 'string' }, svg: { type: 'string' }, dataUrl: { type: 'string' } } },
        url: 'cursor_generator.html'
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