declare class ShadowScrollReveal extends HTMLElement {
  constructor();
  
  connectedCallback(): void;
  disconnectedCallback(): void;
}

declare global {
  interface HTMLElementTagNameMap {
    'shadow-reveal': ShadowScrollReveal;
  }
}

export { ShadowScrollReveal };