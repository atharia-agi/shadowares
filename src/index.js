// Export all engines for easy importing
export { ShadowCursorEngine } from './engines/shadow-cursor-engine.js';
export { ShadowPhysicsEngine } from './engines/shadow-2.5d-engine.js';
export { ShadowHoloCard } from './engines/shadow-holo-card.js';
export { ShadowPixelSnap } from './engines/shadow-pixel-snap.js';
export { ShadowScrollReveal } from './engines/shadow-scroll-reveal.js';
export { ShadowThemeManager } from './utils/theme-manager.js';
export { ShadowPluginSystem } from './utils/plugin-system.js';

// Also export as default for backward compatibility
export default {
  ShadowCursorEngine,
  ShadowPhysicsEngine,
  ShadowHoloCard,
  ShadowPixelSnap,
  ShadowScrollReveal,
  ShadowThemeManager,
  ShadowPluginSystem
};