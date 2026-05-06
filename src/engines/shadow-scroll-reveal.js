/**
 * SHADOW SCROLL REVEAL ENGINE
 * Zero-dependency Web Component for scroll-triggered entrance animations.
 *
 * CARA PAKAI:
 *   <script src="shadow-scroll-reveal.js"></script>
 *
 *   <shadow-reveal animation="fade-up" delay="0.2">
 *       <div>Konten lo di sini</div>
 *   </shadow-reveal>
 *
 * ATTRIBUTES:
 *   animation  = fade-up | fade-down | fade-left | fade-right | zoom-in | zoom-out | flip | blur
 *   delay      = detik (default: 0) — stagger delay buat elemen berurutan
 *   duration   = detik (default: 0.7)
 *   threshold  = 0-1 (default: 0.15) — seberapa banyak elemen harus visible sebelum trigger
 *   once       = "true" (default) — animasi cuma jalan sekali, atau "false" buat re-trigger
 */

class ShadowScrollReveal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.hasRevealed = false;
    }

    connectedCallback() {
        const animation = this.getAttribute('animation') || 'fade-up';
        const duration = parseFloat(this.getAttribute('duration') || '0.7');
        const delay = parseFloat(this.getAttribute('delay') || '0');
        const once = this.getAttribute('once') !== 'false';

        // Pre-animation states (hidden)
        const preStates = {
            'fade-up':    'opacity:0; transform:translateY(40px);',
            'fade-down':  'opacity:0; transform:translateY(-40px);',
            'fade-left':  'opacity:0; transform:translateX(-40px);',
            'fade-right': 'opacity:0; transform:translateX(40px);',
            'zoom-in':    'opacity:0; transform:scale(0.85);',
            'zoom-out':   'opacity:0; transform:scale(1.15);',
            'flip':       'opacity:0; transform:perspective(800px) rotateX(30deg);',
            'blur':       'opacity:0; filter:blur(10px); transform:translateY(20px);'
        };

        const pre = preStates[animation] || preStates['fade-up'];

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    will-change: transform, opacity, filter;
                }
                .wrapper {
                    ${pre}
                    transition: all ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s;
                }
                .wrapper.revealed {
                    opacity: 1 !important;
                    transform: none !important;
                    filter: none !important;
                }
            </style>
            <div class="wrapper"><slot></slot></div>
        `;

        this.wrapper = this.shadowRoot.querySelector('.wrapper');

        // IntersectionObserver — trigger animasi saat scroll ke viewport
        const threshold = parseFloat(this.getAttribute('threshold') || '0.15');
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.wrapper.classList.add('revealed');
                    this.hasRevealed = true;
                    if (once) this.observer.unobserve(this);
                } else if (!once && this.hasRevealed) {
                    this.wrapper.classList.remove('revealed');
                }
            });
        }, { threshold });

        this.observer.observe(this);
    }

    disconnectedCallback() {
        if (this.observer) this.observer.disconnect();
    }
}

customElements.define('shadow-reveal', ShadowScrollReveal);

// Export for ES modules
export { ShadowScrollReveal };
