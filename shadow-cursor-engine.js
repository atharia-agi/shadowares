/**
 * SHADOW CURSOR ENGINE v2
 * Full-package Cursor Generator: UMKM Business + Gaming Themes
 * Features: Idle, Hover, Click states + Dynamic Particle Trails
 * Cursor shapes: Arrow Pointer, Pixel Sword, Crosshair, Staff, Retro, Speedometer
 */
class ShadowCursorEngine {
    constructor() {
        // Definisi Tema UMKM & Bisnis — warna unik per kategori
        this.themes = {
            warteg: {
                name: "Warteg / Kuliner",
                fill: '#ef4444', stroke: '#7f1d1d', glow: '#fca5a5', accent: '🌶️',
                trail: 'splash', color: '#ef4444'
            },
            warkop: {
                name: "Warkop / Cafe",
                fill: '#d97706', stroke: '#78350f', glow: '#fcd34d', accent: '☕',
                trail: 'smoke', color: '#d1d5db'
            },
            bengkel: {
                name: "Bengkel Otomotif",
                fill: '#64748b', stroke: '#1e293b', glow: '#94a3b8', accent: '🔧',
                trail: 'spark', color: '#f59e0b'
            },
            salon: {
                name: "Salon & Spa",
                fill: '#ec4899', stroke: '#831843', glow: '#f9a8d4', accent: '✂️',
                trail: 'bubble', color: '#ec4899'
            },
            pasar: {
                name: "Toko Kelontong",
                fill: '#10b981', stroke: '#064e3b', glow: '#6ee7b7', accent: '🛒',
                trail: 'coin', color: '#fbbf24'
            },
            tech: {
                name: "Tech Startup",
                fill: '#0ea5e9', stroke: '#0c4a6e', glow: '#7dd3fc', accent: '💻',
                trail: 'glitch', color: '#0ea5e9'
            },
            default: {
                name: "Default Magic",
                fill: '#8b5cf6', stroke: '#3b0764', glow: '#c4b5fd', accent: '🪄',
                trail: 'magic', color: '#8b5cf6'
            },
            // --- GAMING THEMES ---
            minecraft: {
                name: "Minecraft Sword",
                fill: '#5eead4', stroke: '#0d9488', glow: '#99f6e4', accent: '⚔️',
                trail: 'pixel', color: '#5eead4', cursorType: 'sword'
            },
            fps: {
                name: "FPS / Shooter",
                fill: '#ef4444', stroke: '#450a0a', glow: '#fca5a5', accent: '🎯',
                trail: 'bullet', color: '#ef4444', cursorType: 'crosshair'
            },
            rpg: {
                name: "RPG / Fantasy",
                fill: '#a855f7', stroke: '#581c87', glow: '#d8b4fe', accent: '🔮',
                trail: 'rune', color: '#a855f7', cursorType: 'staff'
            },
            retro: {
                name: "Retro Arcade",
                fill: '#facc15', stroke: '#713f12', glow: '#fef08a', accent: '👾',
                trail: 'pixel', color: '#facc15', cursorType: 'retro_arrow'
            },
            racing: {
                name: "Racing / Speed",
                fill: '#f97316', stroke: '#7c2d12', glow: '#fdba74', accent: '🏎️',
                trail: 'speed', color: '#f97316', cursorType: 'speed'
            }
        };

        this.currentTheme = 'default';
        this.particles = [];
        this.ripples = [];       // Click ripple rings
        this.ghostTrail = [];    // Afterimage ghost positions
        this.mouse = { x: -100, y: -100, isDown: false, isMoving: false };
        this.lastMouse = { x: -100, y: -100 };
        this.frameCount = 0;
        
        this.initCanvas();
        this.bindEvents();
        this.setTheme('default');
        this.animate();
    }

    initCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.cssText = `
            position: fixed; top: 0; left: 0;
            width: 100vw; height: 100vh;
            pointer-events: none; z-index: 999999;
        `;
        document.body.appendChild(this.canvas);
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // --- SVG CURSOR BUILDERS ---

    _filter(glow, opacity='0.7', blur='1.5') {
        return `<defs><filter id="g"><feDropShadow dx="0" dy="1" stdDeviation="${blur}" flood-color="${glow}" flood-opacity="${opacity}"/></filter></defs>`;
    }

    /** Business Idle: Classic arrow pointer ↖ */
    buildArrowSVG(fill, stroke, glow) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${this._filter(glow)}` +
            `<path d="M4 2 L4 26 L10 20 L16 28 L20 26 L14 18 L22 18 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round" filter="url(#g)"/></svg>`;
    }
    /** Business Hover: Pointer hand */
    buildHandSVG(fill, stroke, glow) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${this._filter(glow)}` +
            `<path d="M14 2 C14 2 12 2 12 4 L12 14 L10 12 C8 10 6 11 6 13 L6 14 L12 22 L12 28 L24 28 L24 20 C24 16 22 14 22 10 L22 6 C22 4 20 4 20 6 L20 12 L18 4 C18 2 16 2 16 4 L16 12 L14 2 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round" filter="url(#g)"/></svg>`;
    }
    /** Business Click: Glowing pressed arrow */
    buildClickSVG(fill, stroke, glow) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${this._filter(glow,'1','2.5')}` +
            `<path d="M5 4 L5 24 L10 19 L15 26 L19 24 L14 17 L21 17 Z" fill="${glow}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round" filter="url(#g)"/></svg>`;
    }

    // --- GAMING SVG BUILDERS ---

    /** Minecraft: Pixel sword diagonal \ (3px grid) */
    buildSwordSVG(fill, stroke, glow) {
        const px = (x,y,c) => `<rect x="${x}" y="${y}" width="3" height="3" fill="${c}"/>`;
        let rects = '';
        // Blade (diagonal dari kiri-atas ke kanan-bawah)
        const blade = [[0,0],[3,3],[6,6],[9,9],[12,12]];
        const edge  = [[3,0],[6,3],[9,6],[12,9],[15,12]];
        const dark  = [[0,3],[3,6],[6,9],[9,12],[12,15]];
        blade.forEach(([x,y]) => rects += px(x,y,fill));
        edge.forEach(([x,y]) => rects += px(x,y,glow));
        dark.forEach(([x,y]) => rects += px(x,y,stroke));
        // Guard
        rects += px(12,18,'#92400e') + px(15,15,'#92400e') + px(18,12,'#92400e');
        // Handle
        rects += px(18,18,'#78350f') + px(21,21,'#78350f') + px(24,24,'#451a03');
        return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${this._filter(glow)}` +
            `<g filter="url(#g)">${rects}</g></svg>`;
    }

    /** FPS: Crosshair reticle */
    buildCrosshairSVG(fill, stroke, glow) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${this._filter(glow,'0.8','2')}` +
            `<g filter="url(#g)" stroke="${fill}" stroke-width="2" fill="none">` +
            `<circle cx="16" cy="16" r="8"/>` +
            `<line x1="16" y1="2" x2="16" y2="10"/>` +
            `<line x1="16" y1="22" x2="16" y2="30"/>` +
            `<line x1="2" y1="16" x2="10" y2="16"/>` +
            `<line x1="22" y1="16" x2="30" y2="16"/>` +
            `<circle cx="16" cy="16" r="2" fill="${glow}"/>` +
            `</g></svg>`;
    }

    /** RPG: Magic staff */
    buildStaffSVG(fill, stroke, glow) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${this._filter(glow,'0.9','2')}` +
            `<g filter="url(#g)">` +
            `<line x1="6" y1="6" x2="26" y2="26" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>` +
            `<line x1="6" y1="6" x2="26" y2="26" stroke="#92400e" stroke-width="2" stroke-linecap="round"/>` +
            `<circle cx="6" cy="6" r="5" fill="${fill}" stroke="${stroke}" stroke-width="1"/>` +
            `<circle cx="6" cy="6" r="2.5" fill="${glow}"/>` +
            `</g></svg>`;
    }

    /** Retro: Pixelated arrow (blocky 4px grid) */
    buildRetroArrowSVG(fill, stroke, glow) {
        const px = (x,y,c) => `<rect x="${x}" y="${y}" width="4" height="4" fill="${c}"/>`;
        let r = '';
        // Pixel arrow pointing top-left
        r += px(0,0,fill)+px(4,0,fill)+px(8,0,fill)+px(12,0,fill)+px(16,0,fill);
        r += px(0,4,fill)+px(4,4,glow);
        r += px(0,8,fill)+px(4,8,glow)+px(8,8,fill);
        r += px(0,12,fill)+px(12,12,fill)+px(16,12,glow);
        r += px(0,16,fill)+px(16,16,fill)+px(20,16,glow);
        r += px(24,20,fill);
        return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${this._filter(glow)}` +
            `<g filter="url(#g)">${r}</g></svg>`;
    }

    /** Racing: Speed arrow with motion lines */
    buildSpeedSVG(fill, stroke, glow) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${this._filter(glow,'0.8','2')}` +
            `<g filter="url(#g)">` +
            `<path d="M4 2 L4 26 L10 20 L16 28 L20 26 L14 18 L22 18 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/>` +
            `<line x1="24" y1="8" x2="30" y2="8" stroke="${glow}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>` +
            `<line x1="24" y1="14" x2="28" y2="14" stroke="${glow}" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>` +
            `</g></svg>`;
    }

    svgToURI(svgStr, hotX = 4, hotY = 2) {
        return `url("data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}") ${hotX} ${hotY}, auto`;
    }

    applyStyles() {
        const t = this.themes[this.currentTheme];
        const styleId = 'shadow-cursor-style';
        let styleEl = document.getElementById(styleId);
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
        }

        let idle, hover, click;
        const ct = t.cursorType || 'arrow';

        // Hotspot logic
        if (ct === 'sword') {
            idle  = this.svgToURI(this.buildSwordSVG(t.fill, t.stroke, t.glow), 2, 2);
            hover = this.svgToURI(this.buildSwordSVG(t.glow, t.stroke, t.fill), 2, 2);
            click = this.svgToURI(this.buildSwordSVG('#fff', t.stroke, t.glow), 2, 2);
        } else if (ct === 'crosshair') {
            idle  = this.svgToURI(this.buildCrosshairSVG(t.fill, t.stroke, t.glow), 16, 16);
            hover = this.svgToURI(this.buildCrosshairSVG(t.glow, t.stroke, t.fill), 16, 16);
            click = this.svgToURI(this.buildCrosshairSVG('#fff', t.stroke, t.glow), 16, 16);
        } else if (ct === 'staff') {
            idle  = this.svgToURI(this.buildStaffSVG(t.fill, t.stroke, t.glow), 6, 6);
            hover = this.svgToURI(this.buildStaffSVG(t.glow, t.stroke, t.fill), 6, 6);
            click = this.svgToURI(this.buildStaffSVG('#fff', t.stroke, t.glow), 6, 6);
        } else if (ct === 'retro_arrow') {
            idle  = this.svgToURI(this.buildRetroArrowSVG(t.fill, t.stroke, t.glow), 2, 2);
            hover = this.svgToURI(this.buildRetroArrowSVG(t.glow, t.stroke, t.fill), 2, 2);
            click = this.svgToURI(this.buildRetroArrowSVG('#fff', t.stroke, t.glow), 2, 2);
        } else if (ct === 'speed') {
            idle  = this.svgToURI(this.buildSpeedSVG(t.fill, t.stroke, t.glow), 4, 2);
            hover = this.svgToURI(this.buildHandSVG(t.fill, t.stroke, t.glow), 10, 2);
            click = this.svgToURI(this.buildSpeedSVG('#fff', t.stroke, t.glow), 4, 2);
        } else {
            idle  = this.svgToURI(this.buildArrowSVG(t.fill, t.stroke, t.glow), 4, 2);
            hover = this.svgToURI(this.buildHandSVG(t.fill, t.stroke, t.glow), 10, 2);
            click = this.svgToURI(this.buildClickSVG(t.fill, t.stroke, t.glow), 5, 4);
        }

        // --- THE FIX: Gunakan inheritance, jangan paksa kursor di SEMUA elemen (*) ---
        styleEl.innerHTML = `
            html, body { 
                cursor: ${idle} !important; 
                min-height: 100vh;
            }
            /* Elemen interaktif - Override inheritance */
            a, button, input, select, textarea, [role="button"], .hoverable, [onclick] { 
                cursor: ${hover} !important; 
            }
            /* Active state - Paling spesifik */
            html:active, body:active, a:active, button:active, *:active { 
                cursor: ${click} !important; 
            }
            /* Matikan seleksi teks agar tidak memicu kursor I-beam bawaan */
            .no-select, button, a { user-select: none; -webkit-user-drag: none; }
        `;
    }

    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            this.applyStyles();
            // Force refresh cursor dengan memicu hover dummy
            document.body.style.display = 'none';
            document.body.offsetHeight; // trigger reflow
            document.body.style.display = '';
            return this.themes[themeName];
        }
        return null;
    }

    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.lastMouse.x = this.mouse.x;
            this.lastMouse.y = this.mouse.y;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            
            const dx = this.mouse.x - this.lastMouse.x;
            const dy = this.mouse.y - this.lastMouse.y;
            const speed = Math.sqrt(dx*dx + dy*dy);
            
            if (speed > 2) {
                this.spawnParticles(1 + Math.min(3, Math.floor(speed/10)));
            }

            // Afterimage ghost trail — simpan posisi tiap 3 frame
            if (this.frameCount % 3 === 0) {
                this.ghostTrail.push({ x: this.mouse.x, y: this.mouse.y, life: 1 });
                if (this.ghostTrail.length > 8) this.ghostTrail.shift();
            }
        });

        document.addEventListener('mousedown', (e) => {
            this.mouse.isDown = true;
            this.spawnParticles(15);

            // Click Ripple Ring
            this.ripples.push({ x: e.clientX, y: e.clientY, radius: 5, maxRadius: 60, life: 1 });

            // Micro Click Sound (subtle, per-theme pitch)
            this.playClickSound();
        });

        document.addEventListener('mouseup', () => {
            this.mouse.isDown = false;
        });
    }

    /** Subtle click audio feedback via Web Audio */
    playClickSound() {
        try {
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ac.createOscillator();
            const gain = ac.createGain();
            const t = this.themes[this.currentTheme];

            // Pitch berbeda per kategori
            const pitchMap = {
                warteg:800, warkop:600, bengkel:200, salon:1200, pasar:900,
                tech:1500, default:1000, minecraft:400, fps:300, rpg:700, retro:1600, racing:500
            };
            const freq = pitchMap[this.currentTheme] || 800;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ac.currentTime + 0.08);
            gain.gain.setValueAtTime(0.08, ac.currentTime); // Super pelan
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.1);

            osc.connect(gain); gain.connect(ac.destination);
            osc.start(); osc.stop(ac.currentTime + 0.12);
        } catch(e) { /* Audio not supported, skip silently */ }
    }

    spawnParticles(count) {
        const theme = this.themes[this.currentTheme];
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle(theme));
        }
    }

    createParticle(theme) {
        const type = theme.trail;
        const p = {
            x: this.mouse.x, y: this.mouse.y,
            life: 1, color: theme.color, type: type
        };

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + (this.mouse.isDown ? 4 : 1);

        // Fisika unik untuk setiap kategori UMKM
        if (type === 'splash') { // Warteg
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed - 3; // Muncrat ke atas lalu jatuh
            p.gravity = 0.4;
            p.decay = 0.02 + Math.random() * 0.02;
            p.size = Math.random() * 6 + 2;
        } else if (type === 'smoke') { // Warkop
            p.vx = (Math.random() - 0.5) * 1.5;
            p.vy = -Math.random() * 2 - 1; // Menguap ke atas
            p.gravity = -0.02;
            p.decay = 0.015 + Math.random() * 0.01;
            p.size = Math.random() * 15 + 5;
        } else if (type === 'spark') { // Bengkel
            p.vx = Math.cos(angle) * (speed * 2.5);
            p.vy = Math.sin(angle) * (speed * 2.5); // Melompat ganas
            p.gravity = 0.5;
            p.decay = 0.04 + Math.random() * 0.02;
            p.size = Math.random() * 4 + 1;
        } else if (type === 'bubble') { // Salon
            p.vx = (Math.random() - 0.5) * 2;
            p.vy = -Math.random() * 3 - 0.5; // Mengapung
            p.gravity = -0.03;
            p.decay = 0.01;
            p.size = Math.random() * 10 + 4;
            p.angle = Math.random() * Math.PI * 2;
        } else if (type === 'coin') { // Pasar
            p.vx = (Math.random() - 0.5) * 5;
            p.vy = -Math.random() * 6 - 2; // Lompatan koin
            p.gravity = 0.5;
            p.decay = 0.02;
            p.size = Math.random() * 7 + 4;
            p.spin = Math.random() * 0.3;
            p.spinAngle = 0;
        } else if (type === 'glitch') { // Tech
            p.vx = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 5 + 2);
            p.vy = 0; // Gerak horizontal tajam
            p.gravity = 0;
            p.decay = 0.05;
            p.size = Math.random() * 4 + 2;
            p.width = Math.random() * 20 + 10;
        } else if (type === 'pixel') { // Minecraft / Retro — kotak pixel jatuh elegan
            p.vx = (Math.random() - 0.5) * 2;
            p.vy = Math.random() * 1 + 0.5; // Jatuh pelan ke bawah
            p.gravity = 0.08;
            p.decay = 0.025;
            p.size = Math.floor(Math.random() * 3 + 2) * 2; // Kelipatan 2 biar grid-aligned
        } else if (type === 'bullet') { // FPS — garis pendek tajam
            p.vx = (Math.random() - 0.5) * 8;
            p.vy = (Math.random() - 0.5) * 8;
            p.gravity = 0;
            p.decay = 0.06;
            p.size = 2;
            p.length = Math.random() * 6 + 4;
        } else if (type === 'rune') { // RPG — simbol melayang naik
            p.vx = (Math.random() - 0.5) * 1;
            p.vy = -Math.random() * 2 - 1;
            p.gravity = -0.01;
            p.decay = 0.015;
            p.size = Math.random() * 6 + 3;
            p.angle = Math.random() * Math.PI * 2;
            p.rotSpeed = (Math.random() - 0.5) * 0.1;
        } else if (type === 'speed') { // Racing — garis horizontal speed
            p.vx = -Math.random() * 10 - 5; // Meluncur ke kiri (efek kecepatan)
            p.vy = (Math.random() - 0.5) * 2;
            p.gravity = 0;
            p.decay = 0.04;
            p.size = 2;
            p.width = Math.random() * 15 + 8;
        } else { // Default Magic
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.gravity = 0.05;
            p.decay = 0.02;
            p.size = Math.random() * 4 + 2;
        }

        return p;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.frameCount++;
        const t = this.themes[this.currentTheme];

        // --- 1. AMBIENT GLOW HALO di sekitar cursor ---
        const grd = this.ctx.createRadialGradient(
            this.mouse.x, this.mouse.y, 0,
            this.mouse.x, this.mouse.y, 50
        );
        grd.addColorStop(0, t.fill + '18'); // Sangat transparan
        grd.addColorStop(1, 'transparent');
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(this.mouse.x-50, this.mouse.y-50, 100, 100);

        // --- 2. AFTERIMAGE GHOST TRAIL ---
        for (let i = 0; i < this.ghostTrail.length; i++) {
            const g = this.ghostTrail[i];
            g.life -= 0.05;
            if (g.life <= 0) { this.ghostTrail.splice(i, 1); i--; continue; }
            this.ctx.save();
            this.ctx.globalAlpha = g.life * 0.15;
            this.ctx.fillStyle = t.fill;
            this.ctx.beginPath();
            this.ctx.arc(g.x, g.y, 4 * g.life, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        // --- 3. CLICK RIPPLE RINGS ---
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const r = this.ripples[i];
            r.radius += 2;
            r.life -= 0.03;
            if (r.life <= 0) { this.ripples.splice(i, 1); continue; }
            this.ctx.save();
            this.ctx.globalAlpha = r.life * 0.5;
            this.ctx.strokeStyle = t.glow;
            this.ctx.lineWidth = 2 * r.life;
            this.ctx.beginPath();
            this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        }

        // --- 4. PARTICLES ---
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            if (p.gravity) p.vy += p.gravity;
            
            // Extra pergerakan
            if (p.type === 'bubble') {
                p.x += Math.sin(p.life * 10 + p.angle) * 1.5; // Bergoyang
            } else if (p.type === 'coin') {
                p.spinAngle += p.spin; // Berputar 3D
            } else if (p.type === 'smoke') {
                p.size += 0.2; // Makin besar saat menguap
            }

            p.life -= p.decay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = p.type === 'smoke' ? p.life * 0.5 : p.life;
            this.ctx.fillStyle = p.color;

            if (p.type === 'bubble') {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * Math.max(0.1, p.life), 0, Math.PI * 2);
                this.ctx.strokeStyle = p.color;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                // Highlight gelembung
                this.ctx.fillStyle = 'white';
                this.ctx.beginPath();
                this.ctx.arc(p.x - p.size*0.3, p.y - p.size*0.3, p.size*0.2, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (p.type === 'coin') {
                this.ctx.translate(p.x, p.y);
                this.ctx.scale(Math.cos(p.spinAngle), 1); // Efek putaran koin
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#fef08a'; // Sisi dalam lebih terang
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (p.type === 'glitch' || p.type === 'speed') {
                this.ctx.fillRect(p.x, p.y, p.width * p.life, p.size);
            } else if (p.type === 'pixel') {
                // Kotak pixel solid — elegan dan clean
                const s = p.size * Math.max(0.3, p.life);
                this.ctx.fillRect(Math.round(p.x), Math.round(p.y), s, s);
            } else if (p.type === 'bullet') {
                // Garis pendek tajam dari titik pusat
                const ang = Math.atan2(p.vy, p.vx);
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x - Math.cos(ang)*p.length, p.y - Math.sin(ang)*p.length);
                this.ctx.strokeStyle = p.color;
                this.ctx.lineWidth = p.size;
                this.ctx.stroke();
            } else if (p.type === 'rune') {
                // Diamond rune shape berputar
                p.angle += p.rotSpeed;
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.angle);
                const s = p.size * Math.max(0.2, p.life);
                this.ctx.beginPath();
                this.ctx.moveTo(0, -s); this.ctx.lineTo(s, 0);
                this.ctx.lineTo(0, s); this.ctx.lineTo(-s, 0);
                this.ctx.closePath();
                this.ctx.fill();
            } else {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * Math.max(0.1, p.life), 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.restore();
        }

        requestAnimationFrame(() => this.animate());
    }

    /** Menghapus engine dan membersihkan DOM */
    destroy() {
        this.canvas.remove();
        const s = document.getElementById('shadow-cursor-style');
        if (s) s.remove();
    }
}

// Auto-instantiate
window.shadowCursor = new ShadowCursorEngine();
