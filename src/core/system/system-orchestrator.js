/**
 * SHADOW SYSTEM ORCHESTRATOR v3.0
 * Core Universal Engine for AI Asset Generator Platform
 *
 * Handles:
 * - Plugin registry & lifecycle management
 * - State orchestration across all components
 * - Service discovery for AI agents
 * - Cross-tab synchronization
 * - Event routing & broadcast
 *
 * @author Shadow Toolkit Team
 * @version 3.0.0
 */

class ShadowSystemOrchestrator {
  constructor(config = {}) {
    this.version = '3.0.0';
    this.config = {
      maxPlugins: Infinity,
      eventHistorySize: 1000,
      enableAIIntegration: true,
      enableRealTimeSync: false,
      persistence: 'hybrid', // 'local', 'memory', 'hybrid'
      ...config
    };

    // Internal state
    this.plugins = new Map();
    this.state = new Map();
    this.services = new Map();
    this.hooks = new Map();
    this.eventHistory = [];
    this.isInitialized = false;

    // AI registry
    this.aiModels = new Map();
    this.aiSchemas = new Map();

    // Init core services
    this._initCore();
  }

  /* ── INITIALIZATION ──────────────────────────────────────────────── */

  _initCore() {
    if (this._initPromise) return this._initPromise;

    this._initPromise = new Promise(async (resolve) => {
      // 1. Setup event bus bridge
      await this._setupEventBus();

      // 2. Initialize session manager
      await this._initSession();

      // 3. Restore persisted state
      await this._restoreState();

      // 4. Register core services
      this._registerCoreServices();

      this.isInitialized = true;
      this._log('System Orchestrator v3.0 initialized');
      resolve(this);
    });

    return this._initPromise;
  }

  /* ── PLUGIN MANAGEMENT ───────────────────────────────────────────── */

  /**
   * Register a plugin with the system
   * @param {Object} plugin - Plugin instance following the Plugin Contract
   */
  async registerPlugin(plugin) {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin "${plugin.id}" is already registered`);
    }

    // Validate plugin contract
    if (!this._validatePlugin(plugin)) {
      throw new Error(`Plugin "${plugin.id}" does not follow the contract`);
    }

    // Initialize plugin
    if (plugin.init) {
      await plugin.init(this);
    }

    this.plugins.set(plugin.id, plugin);

    // Auto-generate AI schema if not present
    if (!plugin.getSchema && this.config.enableAIIntegration) {
      this._generateAISchema(plugin);
    }

    this._broadcast('plugin:registered', { id: plugin.id, name: plugin.name });
    this._log(`Plugin registered: ${plugin.name} (${plugin.id})`);

    return this;
  }

  /**
   * Uninstall & cleanup a plugin
   */
  async unregisterPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    if (plugin.destroy) {
      await plugin.destroy();
    }

    this.plugins.delete(pluginId);
    this._broadcast('plugin:unregistered', { id: pluginId });
    return true;
  }

  /**
   * Get all registered plugins
   */
  getPlugins(filter = {}) {
    const all = Array.from(this.plugins.values());
    if (!filter.type) return all;
    return all.filter(p => p.type === filter.type);
  }

  /**
   * Discover plugins by AI agent
   */
  discoverPlugins(aiContext = {}) {
    const schema = [];
    this.plugins.forEach((plugin, id) => {
      schema.push({
        id,
        name: plugin.name,
        description: plugin.description,
        type: plugin.type,
        version: plugin.version,
        aiSchema: plugin.getSchema?.() || this.aiSchemas.get(id),
        state: this.state.get(id) || {}
      });
    });
    return schema;
  }

  /* ── STATE MANAGEMENT ────────────────────────────────────────────── */

  setState(key, value, options = {}) {
    this.state.set(key, value);

    if (options.persist) {
      this._persistState(key, value);
    }

    this._broadcast('state:changed', { key, value });
    return this;
  }

  getState(key, defaultValue) {
    return this.state.get(key) ?? defaultValue;
  }

  /* ── EVENT SYSTEM ──────────────────────────────────────────────────── */

  on(event, handler, options = {}) {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, []);
    }
    this.hooks.get(event).push({ handler, once: options.once === true });
  }

  off(event, handler) {
    const handlers = this.hooks.get(event);
    if (!handlers) return;
    const idx = handlers.findIndex(h => h.handler === handler);
    if (idx !== -1) handlers.splice(idx, 1);
  }

  once(event, handler) {
    this.on(event, handler, { once: true });
  }

  emit(event, data) {
    this._broadcast(event, data);
  }

  _broadcast(event, data) {
    // Record history
    this.eventHistory.push({ event, data, timestamp: Date.now() });
    if (this.eventHistory.length > this.config.eventHistorySize) {
      this.eventHistory.shift();
    }

    // Execute hooks
    const handlers = this.hooks.get(event);
    if (handlers) {
      handlers.forEach((h, idx) => {
        h.handler(data);
        if (h.once) handlers.splice(idx, 1);
      });
    }

    // Global hook
    const global = this.hooks.get('*');
    if (global) {
      global.forEach(h => h.handler(event, data));
    }
  }

  /* ── AI INTEGRATION ──────────────────────────────────────────────── */

  /**
   * Execute an action via AI model
   */
  async executeAIAction(pluginId, action, params) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || !plugin.executeAI) {
      throw new Error(`Plugin "${pluginId}" does not support AI execution`);
    }

    const result = await plugin.executeAI(action, params);
    this._broadcast('ai:actionExecuted', { pluginId, action, result });
    return result;
  }

  registerAIModel(name, model) {
    this.aiModels.set(name, model);
  }

  /* ── INTERNAL HELPERS ────────────────────────────────────────────── */

  _validatePlugin(plugin) {
    return (
      plugin.id &&
      typeof plugin.id === 'string' &&
      plugin.name &&
      plugin.version
    );
  }

  _generateAISchema(plugin) {
    this.aiSchemas.set(plugin.id, {
      id: plugin.id,
      name: plugin.name,
      description: plugin.description || '',
      actions: plugin.actions || []
    });
  }

  async _setupEventBus() {
    // Injected via event-bus.js
    if (typeof ShadowEventBus !== 'undefined') {
      this.eventBus = new ShadowEventBus(this);
    }
  }

  async _initSession() {
    // Injected via session-manager.js
    if (typeof ShadowSessionManager !== 'undefined') {
      this.session = new ShadowSessionManager(this);
    }
  }

  async _restoreState() {
    try {
      const saved = localStorage.getItem('shadow-system-state');
      if (saved) {
        const data = JSON.parse(saved);
        Object.entries(data).forEach(([k, v]) => this.state.set(k, v));
      }
    } catch (e) {
      // localStorage not available
    }
  }

  _persistState(key, value) {
    try {
      const current = JSON.parse(localStorage.getItem('shadow-system-state') || '{}');
      current[key] = value;
      localStorage.setItem('shadow-system-state', JSON.stringify(current));
    } catch (e) {
      // localStorage not available
    }
  }

  _registerCoreServices() {
    this.services.set('orchestrator', this);
  }

  _log(msg) {
    // Suppress in production
    if (process?.env?.NODE_ENV !== 'production') {
      console.log(`[ShadowSystem] ${msg}`);
    }
  }
}

// Singleton export
window.ShadowSystemOrchestrator = ShadowSystemOrchestrator;

if (typeof shadowSystem === 'undefined') {
  window.shadowSystem = new ShadowSystemOrchestrator();
}
