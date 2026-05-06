/**
 * SHADOW HOLOGRAPHIC CARD ENGINE
 * Premium Glassmorphism & Holographic Foil Web Component
 * 
 * DEVELOPER/AI HANDOVER INSTRUCTIONS:
 * 1. Import script ini di HTML lo: <script src="shadow-holo-card.js"></script>
 * 2. Gunakan tag:
 *    <shadow-holo-card>
 *        <img src="aset.png"> atau <video src="aset.webm">
 *    </shadow-holo-card>
 */

class ShadowHoloCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    perspective: 1500px;
                    width: 240px;
                    height: 320px;
                    border-radius: 16px;
                }
                .card-container {
                    position: relative;
                    width: 100%; height: 100%;
                    border-radius: 16px;
                    transform-style: preserve-3d;
                    transition: transform 0.1s ease-out;
                    background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0.3));
                    border: 1px solid rgba(255,255,255,0.2);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                    overflow: hidden;
                }
                
                /* Konten asli (video/gambar) */
                .content-layer {
                    position: absolute;
                    inset: 10px;
                    z-index: 2;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transform: translateZ(30px); /* Bikin konten popup 3D */
                    filter: drop-shadow(0 15px 15px rgba(0,0,0,0.8));
                }
                ::slotted(*) {
                    max-width: 100%; max-height: 100%;
                    object-fit: contain;
                    pointer-events: none;
                }

                /* Efek Foil Pelangi (Holographic) */
                .holo-foil {
                    position: absolute;
                    inset: 0;
                    z-index: 3;
                    border-radius: 16px;
                    background-image: linear-gradient(
                        115deg, 
                        transparent 20%, 
                        rgba(255, 0, 128, 0.5) 30%, 
                        rgba(255, 255, 0, 0.5) 40%, 
                        rgba(0, 255, 255, 0.5) 50%, 
                        transparent 60%
                    );
                    background-size: 200% 200%;
                    background-position: 50% 50%;
                    mix-blend-mode: color-dodge;
                    opacity: 0;
                    transition: opacity 0.3s ease-out;
                    pointer-events: none;
                }

                /* Kilauan Senter (Glare) */
                .glare {
                    position: absolute;
                    inset: 0;
                    z-index: 4;
                    border-radius: 16px;
                    background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 0%, transparent 60%);
                    mix-blend-mode: overlay;
                    opacity: 0;
                    transition: opacity 0.3s ease-out;
                    pointer-events: none;
                }
                
                /* Border Glow */
                .border-glow {
                    position: absolute; inset: 0; z-index: 1; border-radius: 16px;
                    box-shadow: inset 0 0 20px rgba(255,255,255,0.1);
                }
            </style>
            
            <div class="card-container" id="card">
                <div class="border-glow"></div>
                <div class="content-layer">
                    <slot></slot>
                </div>
                <div class="holo-foil" id="foil"></div>
                <div class="glare" id="glare"></div>
            </div>
        `;
        
        this.card = this.shadowRoot.getElementById('card');
        this.foil = this.shadowRoot.getElementById('foil');
        this.glare = this.shadowRoot.getElementById('glare');
        this.bounds = null;
    }

    connectedCallback() {
        this.addEventListener('mouseenter', () => {
            this.bounds = this.getBoundingClientRect();
            this.foil.style.opacity = '1';
            this.glare.style.opacity = '1';
        });

        this.addEventListener('mouseleave', () => {
            this.card.style.transform = 'rotateX(0deg) rotateY(0deg)';
            this.foil.style.opacity = '0';
            this.glare.style.opacity = '0';
        });

        this.addEventListener('mousemove', (e) => {
            if (!this.bounds) this.bounds = this.getBoundingClientRect();
            
            const mouseX = e.clientX - this.bounds.left;
            const mouseY = e.clientY - this.bounds.top;
            const width = this.bounds.width;
            const height = this.bounds.height;
            
            // Kalkulasi Rotasi 3D
            const rotateX = ((mouseY / height) - 0.5) * -30; // Max kemiringan 30 derajat
            const rotateY = ((mouseX / width) - 0.5) * 30;
            
            // Kalkulasi Posisi Glare & Foil
            const glareX = (mouseX / width) * 100;
            const glareY = (mouseY / height) * 100;
            
            // Pergerakan foil pelangi
            const foilPos = (mouseX / width) * 100;
            
            this.card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            this.glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.9) 0%, transparent 60%)`;
            this.foil.style.backgroundPosition = `${foilPos}% 50%`;
        });
    }
}

customElements.define('shadow-holo-card', ShadowHoloCard);
