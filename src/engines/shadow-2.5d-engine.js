/**
 * SHADOW 2.5D PHYSICS ENGINE
 * Framework-Agnostic Web Component for Premium Interactive Assets
 * 
 * DEVELOPER/AI HANDOVER INSTRUCTIONS:
 * 1. Import file ini ke dalam project web (React, Vue, Next.js, Vanilla HTML).
 *    <script src="shadow-2.5d-engine.js"></script>
 * 
 * 2. Bungkus aset animasi/gambar transparan dengan tag <shadow-2d-physics>.
 *    Contoh:
 *    <shadow-2d-physics style="width: 200px; height: 200px;">
 *        <video src="assets/Aset_1.webm" autoplay loop muted></video>
 *    </shadow-2d-physics>
 * 
 * Tag ini otomatis menyuntikkan Dynamic Lighting, Mouse Tracking, dan Spring Physics!
 */

class ShadowPhysicsEngine extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isJumping = false;
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    perspective: 1200px;
                    cursor: grab;
                }
                :host(:active) { cursor: grabbing; }
                .wrapper {
                    position: relative;
                    width: 100%; height: 100%;
                    transform-style: preserve-3d;
                    transition: transform 0.1s ease-out, filter 0.1s ease-out;
                    will-change: transform, filter;
                    filter: drop-shadow(0px 20px 20px rgba(0,0,0,0.5));
                }
                /* Memastikan elemen apapun (img, video, canvas) di dalamnya pas */
                ::slotted(*) {
                    width: 100%; height: 100%;
                    object-fit: contain;
                    pointer-events: none;
                }
            </style>
            <div class="wrapper" id="wrapper">
                <slot></slot>
            </div>
        `;
        
        this.wrapper = this.shadowRoot.getElementById('wrapper');
    }

    connectedCallback() {
        // Track posisi mouse global untuk mengkalkulasi jatuhnya bayangan (Lighting)
        this.boundMouseMove = this.handleMouseMove.bind(this);
        document.addEventListener('mousemove', this.boundMouseMove);
        
        // Physics Click Event
        this.addEventListener('mousedown', this.handlePhysicsBump.bind(this));
    }

    disconnectedCallback() {
        // Cleanup memory saat komponen dihapus dari DOM
        document.removeEventListener('mousemove', this.boundMouseMove);
    }

    handleMouseMove(e) {
        if (this.isJumping) return;
        
        const rect = this.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distance = Math.sqrt(deltaX**2 + deltaY**2);

        // Radius efek: hanya aktif jika kursor dalam 250px dari elemen ini
        const PROXIMITY_RADIUS = 250;

        if (distance > PROXIMITY_RADIUS) {
            // Reset ke postur netral secara smooth kalau kursor keluar radius
            this.wrapper.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1.0)';
            this.wrapper.style.filter = 'drop-shadow(0px 20px 20px rgba(0,0,0,0.5))';
            return;
        }

        // Faktor interpolasi: 1.0 = kursor di tengah, 0.0 = kursor di batas radius
        const proximity = 1 - (distance / PROXIMITY_RADIUS);

        // Tilt 3D (Max 20 derajat, proporsional dengan kedekatan kursor)
        const tiltX = Math.max(-20, Math.min(20, (deltaY / 12))) * proximity;
        const tiltY = Math.max(-20, Math.min(20, -(deltaX / 12))) * proximity;

        // Scale membesar sedikit saat kursor dekat
        const scaleVal = 1.0 + (0.08 * proximity);

        // Kalkulasi Drop Shadow (Berlawanan arah kursor, makin kuat makin dekat)
        const safeDistance = Math.max(distance, 1);
        const shadowX = (deltaX / safeDistance) * -12 * proximity;
        const shadowY = (deltaY / safeDistance) * -12 * proximity;
        const blur = 8 + (12 * (1 - proximity));

        // Ambient Glow (Makin dekat kursor, makin terang)
        const glow = proximity * 0.6;

        this.wrapper.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scaleVal})`;
        this.wrapper.style.filter = `drop-shadow(${shadowX}px ${shadowY}px ${blur}px rgba(0,0,0,0.7)) drop-shadow(0px 0px ${glow * 25}px rgba(6,182,212,${glow}))`;
    }

    handlePhysicsBump() {
        if (this.isJumping) return;
        this.isJumping = true;
        
        // Lompatan ke atas (Spring Up)
        this.wrapper.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.4s ease';
        const randomRot = (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random()*15);
        this.wrapper.style.transform = `translateY(-60px) scale(1.2) rotateZ(${randomRot}deg)`;
        this.wrapper.style.filter = `drop-shadow(0px 60px 20px rgba(0, 0, 0, 0.3)) drop-shadow(0px 0px 30px rgba(6, 182, 212, 1))`;
        
        // Gravitasi Jatuh dan Gepeng (Squash)
        setTimeout(() => {
            this.wrapper.style.transition = 'transform 0.3s cubic-bezier(0.6, -0.28, 0.735, 0.045), filter 0.3s ease';
            this.wrapper.style.transform = `translateY(10px) scale(0.95) rotateZ(0deg)`;
            this.wrapper.style.filter = `drop-shadow(0px 5px 5px rgba(0, 0, 0, 0.8))`;
            
            // Stabilisasi (Kembali ke postur semula)
            setTimeout(() => {
                this.wrapper.style.transition = 'transform 0.1s ease-out, filter 0.1s ease-out';
                this.isJumping = false;
            }, 300);
        }, 400);
    }
}

// Daftarkan Custom Element ke Browser
customElements.define('shadow-2d-physics', ShadowPhysicsEngine);

// Export for ES modules
export { ShadowPhysicsEngine };
