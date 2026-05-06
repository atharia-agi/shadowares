/**
 * Shadow Toolkit Plugin System
 * Allows extending the toolkit with custom components and engines
 */

class ShadowPluginSystem {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
    this.initialized = false;
  }
  
  /**
   * Register a plugin
   * @param {string} name - Plugin name
   * @param {Object} plugin - Plugin object with install, hooks, etc.
   */
  register(name, plugin) {
    if (!name || typeof name !== 'string') {
      throw new Error('Plugin name must be a non-empty string');
    }
    
    if (!plugin || typeof plugin !== 'object') {
      throw new Error('Plugin must be an object');
    }
    
    if (this.plugins.has(name)) {
      console.warn(`Plugin "${name}" is already registered. Overwriting.`);
    }
    
    this.plugins.set(name, plugin);
    
    // Auto-install if system is already initialized
    if (this.initialized) {
      this._installPlugin(name, plugin);
    }
    
    return this;
  }
  
  /**
   * Unregister a plugin
   * @param {string} name - Plugin name
   */
  unregister(name) {
    if (!this.plugins.has(name)) {
      console.warn(`Plugin "${name}" is not registered`);
      return this;
    }
    
    const plugin = this.plugins.get(name);
    
    // Call uninstall if it exists
    if (plugin.uninstall && typeof plugin.uninstall === 'function') {
      try {
        plugin.uninstall();
      } catch (error) {
        console.error(`Error uninstalling plugin "${name}":`, error);
      }
    }
    
    this.plugins.delete(name);
    
    // Clean up hooks
    this.hooks.forEach((hookList, hookName) => {
      const filtered = hookList.filter(hook => hook.pluginName !== name);
      if (filtered.length === 0) {
        this.hooks.delete(hookName);
      } else {
        this.hooks.set(hookName, filtered);
      }
    });
    
    return this;
  }
  
  /**
   * Initialize the plugin system
   * Should be called after registering all plugins
   */
  initialize() {
    if (this.initialized) {
      console.warn('Plugin system already initialized');
      return this;
    }
    
    this.initialized = true;
    
    // Install all registered plugins
    this.plugins.forEach((plugin, name) => {
      this._installPlugin(name, plugin);
    });
    
    return this;
  }
  
  /**
   * Install a single plugin
   * @private
   */
  _installPlugin(name, plugin) {
    try {
      // Call plugin install method if it exists
      if (plugin.install && typeof plugin.install === 'function') {
        plugin.install(this);
      }
      
      // Register plugin hooks if they exist
      if (plugin.hooks && Array.isArray(plugin.hooks)) {
        plugin.hooks.forEach(hook => {
          this._registerHook(name, hook);
        });
      }
      
      console.log(`Plugin "${name}" installed successfully`);
    } catch (error) {
      console.error(`Error installing plugin "${name}":`, error);
      throw error;
    }
  }
  
  /**
   * Register a hook from a plugin
   * @private
   */
  _registerHook(pluginName, hook) {
    if (!hook.name || typeof hook.name !== 'string') {
      console.warn(`Hook must have a string name`, hook);
      return;
    }
    
    if (!hook.callback || typeof hook.callback !== 'function') {
      console.warn(`Hook must have a callback function`, hook);
      return;
    }
    
    const hookObject = {
      pluginName,
      name: hook.name,
      callback: hook.callback,
      priority: hook.priority || 0
    };
    
    if (!this.hooks.has(hook.name)) {
      this.hooks.set(hook.name, []);
    }
    
    const hooks = this.hooks.get(hook.name);
    hooks.push(hookObject);
    
    // Sort by priority (higher priority first)
    hooks.sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * Execute a hook
   * @param {string} hookName - Name of the hook to execute
   * @param {...any} args - Arguments to pass to the hook callbacks
   * @returns {Array} Results from all hook callbacks
   */
  executeHook(hookName, ...args) {
    if (!this.hooks.has(hookName)) {
      return [];
    }
    
    const hooks = this.hooks.get(hookName);
    const results = [];
    
    for (const hook of hooks) {
      try {
        const result = hook.callback(...args);
        results.push({ plugin: hook.pluginName, result });
      } catch (error) {
        console.error(`Error executing hook "${hookName}" from plugin "${hook.pluginName}":`, error);
        results.push({ plugin: hook.pluginName, error });
      }
    }
    
    return results;
  }
  
  /**
   * Get a registered plugin
   * @param {string} name - Plugin name
   * @returns {Object|undefined} The plugin object
   */
  getPlugin(name) {
    return this.plugins.get(name);
  }
  
  /**
   * List all registered plugins
   * @returns {Array} Array of plugin names
   */
  listPlugins() {
    return Array.from(this.plugins.keys());
  }
  
  /**
   * List all registered hooks
   * @returns {Object} Map of hook names to hook arrays
   */
  listHooks() {
    const result = new Map();
    this.hooks.forEach((hooks, name) => {
      result.set(name, hooks.map(h => ({
        pluginName: h.pluginName,
        name: h.name,
        priority: h.priority
      })));
    });
    return result;
  }
}

// Create global instance
window.shadowPlugins = new ShadowPluginSystem();

// Export for module usage
export { ShadowPluginSystem };