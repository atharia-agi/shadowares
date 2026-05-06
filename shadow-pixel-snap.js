/**
 * SHADOW PIXEL DISINTEGRATION ENGINE
 * Interactive "Thanos Snap" Particle Physics Web Component
 * 
 * DEVELOPER/AI HANDOVER INSTRUCTIONS:
 * 1. Import script ini di HTML lo: <script src="shadow-pixel-snap.js"></script>
 * 2. Gunakan tag:
 *    <shadow-pixel-snap>
 *        <img src="aset.png"> atau <canvas></canvas>
 *    </shadow-pixel-snap>
 * 
 * Saat diklik, aset di dalamnya akan meledak menjadi ribuan partikel piksel 
 * yang merespon gravitasi buatan, lalu kembali utuh!
 */

class ShadowPixelSnap extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.innerHTML = `
            <style>
                :host { 
                    display: inline-block; 
                    position: relative; 
                    cursor: crosshair; 
                }
                .wrapper { 
                    position: relative; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                }
                /* Overlay canvas untuk partikel ledakan */
                canvas { 
                    position: absolute; 
                    top: 0; left: 0; 
                    pointer-events: none; 
                    z-index: 10; 
                    overflow: visible;
                }
                ::slotted(*) { 
                    transition: opacity 0.1s; 
                    max-width: 100%; 
                    object-fit: contain;
                }
                .hidden ::slotted(*) { 
                    opacity: 0 !important; 
                }
            </style>
            <div class="wrapper" id="wrap">
                <slot id="content"></slot>
                <canvas id="cvs"></canvas>
            </div>
        `;
        
        this.canvas = this.shadowRoot.getElementById('cvs');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.wrap = this.shadowRoot.getElementById('wrap');
        this.particles = [];
        this.isSnapping = false;
    }

    connectedCallback() {
        this.addEventListener('click', this.triggerSnap.bind(this));
    }

    triggerSnap() {
        if (this.isSnapping) return;
        this.isSnapping = true;
        
        const slot = this.shadowRoot.getElementById('content');
        const nodes = slot.assignedNodes({flatten: true});
        const media = nodes.find(n => ['IMG', 'VIDEO', 'CANVAS'].includes(n.tagName));
        
        if (!media) {
            this.isSnapping = false;
            return;
        }

        // Ambil dimensi asli elemen
        const w = media.width || media.clientWidth || media.videoWidth;
        const h = media.height || media.clientHeight || media.videoHeight;
        
        // Buat canvas sedikit lebih besar biar ledakannya bisa nyebar ke luar batas asli
        this.canvas.width = w * 2;
        this.canvas.height = h * 2;
        this.canvas.style.left = `-${w/2}px`;
        this.canvas.style.top = `-${h/2}px`;
        
        const offsetX = w / 2;
        const offsetY = h / 2;
        
        // Ekstrak data pixel ke canvas virtual
        this.ctx.drawImage(media, offsetX, offsetY, w, h);
        const data = this.ctx.getImageData(offsetX, offsetY, w, h).data;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Sembunyikan elemen asli
        this.wrap.classList.add('hidden');
        
        // Bangkitkan partikel dari pixel yang TIDAK transparan
        // Lompat tiap 3 pixel biar browser nggak crash ngeproses jutaan debu
        const step = 3; 
        for (let y = 0; y < h; y += step) {
            for (let x = 0; x < w; x += step) {
                const i = (y * w + x) * 4;
                if (data[i+3] > 10) { // Jika pixel terlihat (alpha > 10)
                    this.particles.push({
                        x: x + offsetX, 
                        y: y + offsetY,
                        vx: (Math.random() - 0.5) * 15, // Ledakan horizontal
                        vy: (Math.random() - 1) * 15,   // Ledakan ke atas (anti-gravitasi awal)
                        color: `rgba(${data[i]}, ${data[i+1]}, ${data[i+2]}, ${data[i+3]/255})`,
                        alpha: 1,
                        size: Math.random() * 2 + 1.5
                    });
                }
            }
        }
        
        this.animatePhysics();
    }

    animatePhysics() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let alive = false;
        
        for (let p of this.particles) {
            if (p.alpha <= 0) continue;
            alive = true;
            
            p.vy += 0.8; // Gaya Gravitasi turun
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= Math.random() * 0.03 + 0.01; // Memudar pelan-pelan
            
            this.ctx.globalAlpha = Math.max(0, p.alpha);
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        }
        
        if (alive) {
            requestAnimationFrame(this.animatePhysics.bind(this));
        } else {
            // Reconstruct: Kembalikan partikel dan elemen asli
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.wrap.classList.remove('hidden');
            this.particles = [];
            this.isSnapping = false;
        }
    }
}

customElements.define('shadow-pixel-snap', ShadowPixelSnap);
