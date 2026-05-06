/**
 * Shadow Toolkit Theme Manager
 * Centralized theming system with CSS variables and presets
 */

class ShadowThemeManager {
  constructor() {
    this.themes = {
      dark: {
        '--bg': '#07080f',
        '--surface': '#111827',
        '--text': '#f1f5f9',
        '--muted': '#64748b',
        '--primary': '#8b5cf6',
        '--accent': '#22d3ee'
      },
      light: {
        '--bg': '#f8fafc',
        '--surface': '#ffffff',
        '--text': '#1e293b',
        '--muted': '#64748b',
        '--primary': '#3b82f6',
        '--accent': '#06b6d4'
      },
      noir: {
        '--bg': '#000000',
        '--surface': '#0a0a0a',
        '--text': '#f0f0f0',
        '--muted': '#888888',
        '--primary': '#ff006e',
        '--accent': '#00f3ff'
      },
      cyberpunk: {
        '--bg': '#0a0a0a',
        '--surface': '#1a1a2e',
        '--text': '#00ffef',
        '--muted': '#4cc9f0',
        '--primary': '#ff006e',
        '--accent': '#00f3ff'
      }
    };
    
    this.currentTheme = 'dark';
    this.init();
  }
  
  init() {
    // Create theme style element if it doesn't exist
    if (!document.getElementById('shadow-theme-styles')) {
      const style = document.createElement('style');
      style.id = 'shadow-theme-styles';
      document.head.appendChild(style);
    }
    
    // Apply initial theme
    this.applyTheme(this.currentTheme);
  }
  
  applyTheme(themeName) {
    if (!this.themes[themeName]) {
      console.warn(`Theme "${themeName}" not found. Falling back to dark.`);
      themeName = 'dark';
    }
    
    this.currentTheme = themeName;
    const theme = this.themes[themeName];
    const styleElement = document.getElementById('shadow-theme-styles');
    
    let css = ':root {\n';
    for (const [property, value] of Object.entries(theme)) {
      css += `  ${property}: ${value};\n`;
    }
    css += '}\n';
    
    styleElement.textContent = css;
    
    // Also update cursor engine themes to match
    if (window.shadowCursor) {
      // Update cursor colors to match theme
      const themeColors = {
        dark: { fill: '#8b5cf6', stroke: '#3b0764', glow: '#c4b5fd', accent: '🪄', color: '#8b5cf6' },
        light: { fill: '#3b82f6', stroke: '#1d4ed8', glow: '#bfdbfe', accent: '💙', color: '#3b82f6' },
        noir: { fill: '#ff006e', stroke: '#990042', glow: '#ff66a8', accent: '🖤', color: '#ff006e' },
        cyberpunk: { fill: '#00ffef', stroke: '#0099b3', glow: '#66ffff', accent: '💻', color: '#00ffef' }
      };
      
      if (themeColors[themeName]) {
        // This would require modifying the shadowCursor engine - for now we just log
        console.log(`Theme "${themeName}" applied. Cursor colors would sync in full implementation.`);
      }
    }
  }
  
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  getAvailableThemes() {
    return Object.keys(this.themes);
  }
  
  // Generate CSS variables string for manual use
  getCssVariables(themeName = null) {
    const theme = themeName ? this.themes[themeName] : this.themes[this.currentTheme];
    return Object.entries(theme)
      .map(([prop, value]) => `${prop}: ${value}`)
      .join('; ');
  }
}

// Create global instance
window.shadowTheme = new ShadowThemeManager();

// Export for module usage
export { ShadowThemeManager };