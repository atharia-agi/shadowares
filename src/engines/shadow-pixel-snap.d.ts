declare class ShadowPixelSnap extends HTMLElement {
  constructor();
  
  connectedCallback(): void;
  disconnectedCallback(): void;
  
  /** Trigger the disintegration animation */
  triggerSnap(): void;
  
  /** Animate the physics of particles */
  animatePhysics(): void;
}

declare global {
  interface HTMLElementTagNameMap {
    'shadow-pixel-snap': ShadowPixelSnap;
  }
}

export { ShadowPixelSnap };