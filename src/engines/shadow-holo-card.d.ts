declare class ShadowHoloCard extends HTMLElement {
  constructor();
  
  connectedCallback(): void;
  disconnectedCallback(): void;
}

declare global {
  interface HTMLElementTagNameMap {
    'shadow-holo-card': ShadowHoloCard;
  }
}

export { ShadowHoloCard };