declare class ShadowPhysicsEngine extends HTMLElement {
  constructor();
  
  connectedCallback(): void;
  disconnectedCallback(): void;
  
  /** Handle mouse move for tilt physics */
  handleMouseMove(e: MouseEvent): void;
  
  /** Handle click for physics bump */
  handlePhysicsBump(): void;
}

declare global {
  interface HTMLElementTagNameMap {
    'shadow-2d-physics': ShadowPhysicsEngine;
  }
}

export { ShadowPhysicsEngine };