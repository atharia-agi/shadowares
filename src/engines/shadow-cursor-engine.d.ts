type CursorTheme = {
  name: string;
  fill: string;
  stroke: string;
  glow: string;
  accent: string;
  trail: string;
  color: string;
  cursorType?: "arrow" | "sword" | "crosshair" | "staff" | "retro_arrow" | "speed";
  group?: "business" | "gaming" | "creative";
};

declare class ShadowCursorEngine {
  constructor();
  themes: Record<string, CursorTheme>;
  currentTheme: string;
  setTheme(themeName: string): CursorTheme | null;
  destroy(): void;
}

declare const shadowCursor: ShadowCursorEngine;
export { ShadowCursorEngine, shadowCursor, CursorTheme };
