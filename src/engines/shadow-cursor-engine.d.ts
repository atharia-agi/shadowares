declare class ShadowCursorEngine {
  constructor();
  
  /** Available cursor themes */
  themes: {
    warteg: { name: string; fill: string; stroke: string; glow: string; accent: string; trail: string; color: string };
    warkop: { name: string; fill: string; stroke: string; glow: string; accent: string; trail: string; color: string };
    bengkel: { name: string; fill: string; stroke: string; glow: string; accent: string; trail: string; color: string };
    salon: { name: string; fill: string; stroke: string; glow: string; accent: string; trail: string; color: string };
    pasar: { name: string; fill: string; stroke: string; glow: string; accent: string; trail: string; color: string };
    tech: { name: string; fill: string; stroke: string; glow: string; accent: string; trail: string; color: string };
    default: { name: string; fill: string; stroke: string; glow: string; accent: string; trail: string; color: string };
    minecraft: { name: string; fill: string; stroke: string; glow: string; accent: string; trail: string; color: string; cursorType: 'sword' };
    fps: { name: string; fill: string; stroke: string; glow: string; accent: string; trail: string; color: string; cursorType: 'crosshair' };
    rpg: { name: string; fill: string; stroke: string; glow: string; accent: string; trail: string; color: string; cursorType: 'staff' };
    retro: { name: string; fill: string; stroke: string; glow: string; accent: string; trail: string; color: string; cursorType: 'retro_arrow' };
    racing: { name: string; fill: string; stroke: string; glow: string; accent: string; trail: string; color: string; cursorType: 'speed' };
  };
  
  currentTheme: string;
  
  /** Set cursor theme */
  setTheme(themeName: string): ReturnType<ShadowCursorEngine['setTheme']> | null;
  
  /** Destroy engine and clean up DOM */
  destroy(): void;
}

declare const shadowCursor: ShadowCursorEngine;
export { ShadowCursorEngine, shadowCursor };