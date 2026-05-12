/*!
 * SHADOW STUDIO v3.0 — Universal Asset Generator Platform
 * "Canva untuk Agent & Web Dev Pemula"
 * 
 * Feature Levels:
 *   Level 1 (Beginner): Visual editor, templates, wizards
 *   Level 2 (Intermediate): Component builder, animation studio  *   Level 3 (Pro/Agent): Plugin API, AI integration
 * 
 * @author Shadow Toolkit Team
 * @version 3.0.0
 * @license MIT
 * @website https://shadowares.vercel.app
 */

// ==========================================
// PART 1: UNIVERSAL PLUGIN ARCHITECTURE
// ==========================================

/**
 * Base class untuk semua tools/plugins
 * Easy to extend, zero knowledge required
 */
class ShadowPlugin {
  static get info() {
    return {
      id: 'base',
      name: 'Base Plugin',
      description: 'Base plugin class',
      version: '3.0.0',
      author: 'Shadow Toolkit',
      level: 'all', // 'beginner', 'intermediate', 'pro', 'all'
      category: 'utility',
      icon: '🔧',
      tags: ['base'],
      hasUI: true,
      hasAI: false,
    };
  }

  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    this.id = this.constructor.info.id;
    this.state = new Map();
    this.eventListeners = [];
    this.ui = null;
    this.isInitialized = false;
  }

  // ===== LEVEL 1: Simple Methods (Beginner) =====

  /**
   * Initialize plugin - called automatically by orchestrator
   * Override this to setup your plugin
   */
  async init() {
    this.isInitialized = true;
    this.log('Plugin initialized');
  }

  /**
   * Create UI - returns HTML string or DOM element
   * Automatically rendered by orchestrator
   */
  renderUI() {
    // Override in subclass
    return `<div>Plugin: ${this.constructor.info.name}</div>`;
  }

  /**
   * Handle user action - simple event handler
   */
  async onAction(action, data) {
    // Example: { type: 'export', format: 'png' }
    this.log(`Action: ${action}`, data);
  }

  // ===== LEVEL 2: Advanced Methods (Intermediate) =====

  /**
   * Get current state - useful for saving/loading
   */
  getState() {
    return Object.fromEntries(this.state);
  }

  /**
   * Restore state - for undo/redo, session restore
   */
  setState(data) {
    this.state = new Map(Object.entries(data));
  }

  /**
   * Export data in various formats
   */
  async export(format = 'json') {
    return {
      format,
      data: this.getState(),
      timestamp: Date.now()
    };
  }

  // ===== LEVEL 3: Pro Methods =====

  /**
   * AI integration hook
   */
  async onAIRequest(prompt, context) {
    // Override for AI-powered features
    return null;
  }

  /**
   * Plugin-to-plugin communication
   */
  sendToPlugin(pluginId, message) {
    this.orchestrator.sendToPlugin(this.id, pluginId, message);
  }

  /**
   * Register a hook into the system
   */
  registerHook(hookName, callback) {
    this.orchestrator.registerHook(hookName, this.id, callback);
  }

  // ===== INTERNAL METHODS =====

  log(...args) {
    console.log(`[${this.id}]`, ...args);
  }

  destroy() {
    this.eventListeners.forEach(fn => fn());
    this.eventListeners = [];
    this.isInitialized = false;
  }
}

// ==========================================
// PART 2: VISUAL EDITOR ENGINE
// ==========================================

/**
 * WYSIWYG Editor - Drag & drop visual builder
 * Zero coding knowledge required
 */
class VisualEditor extends ShadowPlugin {
  static get info() {
    return {
      id: 'visual-editor',
      name: 'Visual Studio',
      description: 'Drag & drop web page builder',
      version: '3.0.0',
      level: 'beginner',
      category: 'editor',
      icon: '🎨',
      tags: ['visual', 'editor', 'drag-drop'],
      hasUI: true,
      hasAI: true,
    };
  }

  renderUI() {
    return `
      <div class="visual-editor" style="display:flex;flex-direction:column;height:100%;">
        <!-- Toolbar -->
        <div class="editor-toolbar" style="padding:12px 20px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;gap:8px;align-items:center;">
          <button onclick="editor.addText()" class="btn-icon" title="Add Text">📝</button>
          <button onclick="editor.addImage()" class="btn-icon" title="Add Image">🖼</button>
          <button onclick="editor.addButton()" class="btn-icon" title="Add Button">🔘</button>
          <button onclick="editor.addShape()" class="btn-icon" title="Add Shape">🔷</button>
          <div class="sep"></div>
          <button onclick="editor.undo()" class="btn-icon" title="Undo">↩</button>
          <button onclick="editor.redo()" class="btn-icon" title="Redo">↪</button>
          <div style="margin-left:auto;display:flex;gap:8px;">
            <button onclick="editor.preview()" class="btn-secondary">Preview</button>
            <button onclick="editor.export()" class="btn-primary">Export</button>
          </div>
        </div>
        
        <div style="display:flex;flex:1;overflow:hidden;">
          <!-- Components Panel -->
          <div class="components-panel" style="width:240px;background:var(--sidebar);border-right:1px solid var(--border);padding:16px;overflow-y:auto;">
            <h3 style="font-size:.8rem;color:var(--muted);text-transform:uppercase;letter-spacing:2px;margin-bottom:16px;">Components</h3>
            <div class="component-grid" style="display:grid;grid-template-columns:repeat(2, 1fr);gap:8px;">
              ${this._getComponentButtons()}
            </div>
            
            <h3 style="font-size:.8rem;color:var(--muted);text-transform:uppercase;letter-spacing:2px;margin:24px 0 16px;">Templates</h3>
            <div class="template-list">
              ${this._getTemplateList()}
            </div>
          </div>
          
          <!-- Canvas -->
          <div class="canvas-container" style="flex:1;display:flex;flex-direction:column;overflow:hidden;">
            <div class="canvas-area" id="canvasArea" style="flex:1;background:#1a1d29;position:relative;overflow:auto;padding:40px;">
              <div id="editorCanvas" class="editor-canvas" style="min-height:600px;background:var(--surface);border-radius:12px;border:1px solid var(--border);box-shadow:0 20px 60px rgba(0,0,0,.4);position:relative;overflow:hidden;">
                <div class="canvas-placeholder" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--muted);padding:60px;">
                  <div style="font-size:3rem;margin-bottom:16px;opacity:.5;">🎨</div>
                  <p style="font-size:1rem;margin-bottom:8px;">Start Creating!</p>
                  <p style="font-size:.8rem;opacity:.7;">Drag components here or choose a template</p>
                  <button onclick="editor.loadTemplate('landing-page')" class="btn-primary" style="margin-top:20px;">📄 Landing Page Template</button>
                </div>
              </div>
            </div>
            
            <!-- Properties Panel (bottom) -->
            <div class="properties-bar" style="height:50px;background:var(--sidebar);border-top:1px solid var(--border);display:flex;align-items:center;padding:0 20px;gap:16px;font-size:.8rem;">
              <span style="color:var(--muted);">Selected: <span id="selectedElement" style="color:var(--text)">None</span></span>
              <div class="sep" style="height:20px;width:1px;background:var(--border);"></div>
              <span style="color:var(--muted);">Size: <span id="canvasSize">1024 × 768</span></span>
              <div style="margin-left:auto;display:flex;gap:8px;">
                <button class="btn-icon-small" title="Desktop" onclick="editor.setCanvasSize('desktop')">🖥</button>
                <button class="btn-icon-small" title="Tablet" onclick="editor.setCanvasSize('tablet')">📱</button>
                <button class="btn-icon-small" title="Mobile" onclick="editor.setCanvasSize('mobile')">📲</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>
        .btn-icon {
          background: rgba(255,255,255,.05);
          border: 1px solid var(--border);
          color: var(--text);
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: all .2s;
        }
        .btn-icon:hover { background: rgba(255,255,255,.1); border-color: var(--primary); }
        .btn-icon-small { 
          background: transparent; border: none; color: var(--muted); 
          padding: 4px; cursor: pointer; font-size: 1rem; opacity: .6; 
          transition: opacity .2s; 
        }
        .btn-icon-small:hover { opacity: 1; }
        .btn-primary { 
          background: linear-gradient(135deg, var(--primary), #7c3aed); 
          border: none; color: white; padding: 8px 16px; border-radius: 8px; 
          cursor: pointer; font-size: .8rem; font-weight: 600; 
        }
        .btn-secondary { 
          background: var(--surface); border: 1px solid var(--border); 
          color: var(--text); padding: 8px 16px; border-radius: 8px; 
          cursor: pointer; font-size: .8rem; 
        }
        .sep { width: 1px; height: 24px; background: var(--border); }
        
        .component-card {
          background: rgba(255,255,255,.03);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px;
          text-align: center;
          cursor: grab;
          transition: all .2s;
          font-size: .75rem;
          color: var(--muted);
        }
        .component-card:hover {
          border-color: var(--primary);
          background: rgba(139,92,246,.05);
          color: var(--text);
        }
        .component-card .icon { font-size: 1.5rem; margin-bottom: 4px; }
      </style>
    `;
  }

  _getComponentButtons() {
    const components = [
      { icon: '📰', name: 'Header', type: 'header' },
      { icon: '📝', name: 'Text', type: 'text' },
      { icon: '🖼', name: 'Image', type: 'image' },
      { icon: '🔘', name: 'Button', type: 'button' },
      { icon: '📊', name: 'Card', type: 'card' },
      { icon: '🎯', name: 'Hero', type: 'hero' },
      { icon: '📑', name: 'Form', type: 'form' },
      { icon: '⚡', name: 'Animation', type: 'animation' },
    ];
    return components.map(c => `
      <div class="component-card" draggable="true" data-type="${c.type}">
        <div class="icon">${c.icon}</div>
        <div>${c.name}</div>
      </div>
    `).join('');
  }

  _getTemplateList() {
    const templates = [
      { name: 'Landing Page', icon: '📄', id: 'landing-page' },
      { name: 'Portfolio', icon: '💼', id: 'portfolio' },
      { name: 'Dashboard', icon: '📊', id: 'dashboard' },
      { name: 'E-commerce', icon: '🛒', id: 'ecommerce' },
      { name: 'Blog', icon: '📰', id: 'blog' },
      { name: 'App UI', icon: '📱', id: 'app-ui' },
    ];
    return templates.map(t => `
      <div class="template-item" style="padding:10px;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:8px;margin-bottom:8px;cursor:pointer;display:flex;align-items:center;gap:10px;transition:all .2s;" onclick="editor.loadTemplate('${t.id}')">
        <span style="font-size:1.2rem;">${t.icon}</span>
        <span style="font-size:.8rem;">${t.name}</span>
      </div>
    `).join('');
  }

  // Actions
  addText() { this.log('Add text element'); }
  addImage() { this.log('Add image element'); }
  addButton() { this.log('Add button'); }
  addShape() { this.log('Add shape'); }
  undo() { this.log('Undo action'); }
  redo() { this.log('Redo action'); }
  preview() { this.log('Preview mode'); }
  export() { this.log('Export project'); }
  loadTemplate(id) { this.log('Load template:', id); }
  setCanvasSize(size) { this.log('Canvas size:', size); }
}

// ==========================================
// PART 3: TEMPLATE SYSTEM
// ==========================================

class TemplateSystem {
  constructor() {
    this.templates = new Map();
    this._initTemplates();
  }

  _initTemplates() {
    const templates = {
      'landing-page': {
        name: 'Landing Page',
        description: 'Professional landing page with hero, features, and CTA',
        elements: [
          { type: 'hero', title: 'Build Beautiful Apps', subtitle: 'No coding required', cta: 'Get Started' },
          { type: 'features', items: ['Easy to use', 'Fast', 'Beautiful'] },
          { type: 'cta', text: 'Start Building Today' }
        ]
      },
      'portfolio': {
        name: 'Portfolio',
        description: 'Showcase your work with style',
        elements: [
          { type: 'header', name: 'John Doe', role: 'Full Stack Developer' },
          { type: 'projects', items: [] },
          { type: 'contact', email: '', social: [] }
        ]
      },
      'dashboard': {
        name: 'Dashboard',
        description: 'Analytics dashboard with charts and widgets',
        elements: [
          { type: 'stats', cards: ['Users', 'Revenue', 'Growth'] },
          { type: 'chart', type: 'line' },
          { type: 'table', data: [] }
        ]
      },
    };
    
    Object.entries(templates).forEach(([id, data]) => {
      this.templates.set(id, data);
    });
  }

  get(id) { return this.templates.get(id); }
  getAll() { return Array.from(this.templates.values()); }
  search(query) {
    return this.getAll().filter(t => 
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase())
    );
  }
}

// ==========================================
// PART 4: EXPORT ENGINE
// ==========================================

class ExportEngine {
  /**
   * Export to multiple formats with one click
   */
  static async export(project, options = {}) {
    const formats = options.formats || ['html', 'css', 'zip'];
    const results = [];

    for (const format of formats) {
      try {
        const result = await this.exportTo(project, format);
        results.push({ format, success: true, data: result });
      } catch (err) {
        results.push({ format, success: false, error: err.message });
      }
    }

    return results;
  }

  static async exportTo(project, format) {
    switch (format) {
      case 'html':
        return this.generateHTML(project);
      case 'css':
        return this.generateCSS(project);
      case 'zip':
        return this.generateZIP(project);
      case 'png':
        return this.generateImage(project, 'png');
      case 'json':
        return JSON.stringify(project);
      default:
        throw new Error(`Unknown export format: ${format}`);
    }
  }

  static generateHTML(project) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.title || 'Shadow Studio Export'}</title>
  ${project.css ? `<style>${project.css}</style>` : ''}
</head>
<body>
  <!-- Shadow Studio Generated Content -->
  ${project.html || ''}
  <footer style="text-align:center;padding:20px;color:#999;font-size:.8rem;">
    Made with ❤️ by Shadow Studio
  </footer>
</body>
</html>`;
  }

  static generateCSS(project) {
    return `/* Shadow Studio Generated Styles */
:root {
  --primary: ${project.primaryColor || '#8b5cf6'};
  --accent: ${project.accentColor || '#22d3ee'};
}
${project.css || ''}`;
  }

  static async generateZIP(project) {
    // Implementation using JSZip or similar
    return { type: 'zip', name: `${project.name}-export.zip` };
  }

  static generateImage(project, type) {
    // Use html2canvas or similar
    return { type, name: `${project.name}.${type}` };
  }
}

// ==========================================
// PART 5: MAIN ORCHESTRATOR
// ==========================================

class ShadowOrchestrator {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
    this.templates = new TemplateSystem();
    this.activePlugin = null;
    this.state = new Map();
    this.init();
  }

  async init() {
    console.log('🚀 Shadow Studio v3.0 initialized');
    this.registerPlugin(VisualEditor);
    // Register other plugins here
  }

  registerPlugin(PluginClass) {
    const plugin = new PluginClass(this);
    this.plugins.set(PluginClass.info.id, plugin);
    return plugin;
  }

  getPlugin(id) { return this.plugins.get(id); }
  getAllPlugins() { return Array.from(this.plugins.values()); }

  activatePlugin(id) {
    const plugin = this.plugins.get(id);
    if (!plugin) return null;
    this.activePlugin = plugin;
    return plugin;
  }

  sendToPlugin(fromId, toId, message) {
    const target = this.plugins.get(toId);
    if (target && target.onMessage) {
      target.onMessage({ from: fromId, ...message });
    }
  }

  registerHook(name, pluginId, callback) {
    if (!this.hooks.has(name)) this.hooks.set(name, []);
    this.hooks.get(name).push({ pluginId, callback });
  }

  async executeHook(name, data) {
    const hooks = this.hooks.get(name) || [];
    for (const hook of hooks) {
      try { await hook.callback(data); } catch (e) { console.error(e); }
    }
  }
}

// ==========================================
// PART 6: QUICK EXPORT API
// ==========================================

/**
 * Quick export - untuk pemula yang cuma mahu export simple
 */
window.QuickExport = {
  /**
   * Export element sebagai image
   */
  async toImage(selector, options = {}) {
    // TODO: Implement using html2canvas
    console.log('Exporting to image:', selector);
  },

  /**
   * Copy code ke clipboard
   */
  async copyCode(type, content) {
    try {
      await navigator.clipboard.writeText(content);
      console.log('Code copied successfully!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  },

  /**
   * Download file
   */
  download(filename, content, type = 'text/html') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

// ==========================================
// INIT
// ==========================================

const shadowStudio = new ShadowOrchestrator();
window.shadowStudio = shadowStudio;
window.ShadowPlugin = ShadowPlugin;
