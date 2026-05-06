class ShadowCursorEngine {
    constructor() {
        this.themes = {
            warteg: { name: "Warteg Kuliner", fill: "#ef4444", stroke: "#7f1d1d", glow: "#fca5a5", accent: "🌶️", trail: "splash", color: "#ef4444", cursorType: "arrow", group: "business" },
            warkop: { name: "Warkop Cafe", fill: "#d97706", stroke: "#78350f", glow: "#fcd34d", accent: "☕", trail: "smoke", color: "#d1d5db", cursorType: "arrow", group: "business" },
            bengkel: { name: "Bengkel Otomotif", fill: "#64748b", stroke: "#1e293b", glow: "#94a3b8", accent: "🔧", trail: "spark", color: "#f59e0b", cursorType: "arrow", group: "business" },
            salon: { name: "Salon Spa", fill: "#ec4899", stroke: "#831843", glow: "#f9a8d4", accent: "✂️", trail: "bubble", color: "#ec4899", cursorType: "arrow", group: "business" },
            pasar: { name: "Toko Pasar", fill: "#10b981", stroke: "#064e3b", glow: "#6ee7b7", accent: "🛒", trail: "coin", color: "#fbbf24", cursorType: "arrow", group: "business" },
            tech: { name: "Tech Startup", fill: "#0ea5e9", stroke: "#0c4a6e", glow: "#7dd3fc", accent: "💻", trail: "glitch", color: "#0ea5e9", cursorType: "arrow", group: "business" },
            bakery: { name: "Bakery Pastry", fill: "#f59e0b", stroke: "#78350f", glow: "#fde68a", accent: "🥐", trail: "crumb", color: "#fbbf24", cursorType: "arrow", group: "business" },
            florist: { name: "Florist Bouquet", fill: "#22c55e", stroke: "#14532d", glow: "#86efac", accent: "💐", trail: "petal", color: "#4ade80", cursorType: "arrow", group: "business" },
            laundry: { name: "Laundry Express", fill: "#38bdf8", stroke: "#0c4a6e", glow: "#bae6fd", accent: "🧺", trail: "bubble", color: "#7dd3fc", cursorType: "arrow", group: "business" },
            barbershop: { name: "Barbershop Fade", fill: "#f43f5e", stroke: "#881337", glow: "#fda4af", accent: "💈", trail: "spark", color: "#fb7185", cursorType: "arrow", group: "business" },
            mart: { name: "Mini Market", fill: "#84cc16", stroke: "#365314", glow: "#bef264", accent: "🏬", trail: "coin", color: "#a3e635", cursorType: "arrow", group: "business" },
            clinic: { name: "Clinic Care", fill: "#0ea5e9", stroke: "#0f172a", glow: "#7dd3fc", accent: "🩺", trail: "pulse", color: "#38bdf8", cursorType: "arrow", group: "business" },
            realtor: { name: "Property Agent", fill: "#14b8a6", stroke: "#134e4a", glow: "#5eead4", accent: "🏠", trail: "line", color: "#2dd4bf", cursorType: "arrow", group: "business" },
            fintech: { name: "Fintech Wallet", fill: "#6366f1", stroke: "#312e81", glow: "#a5b4fc", accent: "💳", trail: "glitch", color: "#818cf8", cursorType: "arrow", group: "business" },
            default: { name: "Default Magic", fill: "#8b5cf6", stroke: "#3b0764", glow: "#c4b5fd", accent: "🪄", trail: "magic", color: "#8b5cf6", cursorType: "arrow", group: "business" },

            minecraft: { name: "Minecraft Sword", fill: "#5eead4", stroke: "#0d9488", glow: "#99f6e4", accent: "⚔️", trail: "pixel", color: "#5eead4", cursorType: "sword", group: "gaming" },
            fps: { name: "FPS Shooter", fill: "#ef4444", stroke: "#450a0a", glow: "#fca5a5", accent: "🎯", trail: "bullet", color: "#ef4444", cursorType: "crosshair", group: "gaming" },
            rpg: { name: "RPG Fantasy", fill: "#a855f7", stroke: "#581c87", glow: "#d8b4fe", accent: "🔮", trail: "rune", color: "#a855f7", cursorType: "staff", group: "gaming" },
            retro: { name: "Retro Arcade", fill: "#facc15", stroke: "#713f12", glow: "#fef08a", accent: "👾", trail: "pixel", color: "#facc15", cursorType: "retro_arrow", group: "gaming" },
            racing: { name: "Racing Speed", fill: "#f97316", stroke: "#7c2d12", glow: "#fdba74", accent: "🏎️", trail: "speed", color: "#f97316", cursorType: "speed", group: "gaming" },
            cyberpunk: { name: "Cyberpunk Neon", fill: "#f43f5e", stroke: "#4c0519", glow: "#fb7185", accent: "🌃", trail: "neon", color: "#fb7185", cursorType: "crosshair", group: "gaming" },
            ninja: { name: "Ninja Stealth", fill: "#6b7280", stroke: "#111827", glow: "#9ca3af", accent: "🥷", trail: "smoke", color: "#9ca3af", cursorType: "staff", group: "gaming" },
            moba: { name: "MOBA Skillshot", fill: "#2563eb", stroke: "#1e3a8a", glow: "#93c5fd", accent: "🧿", trail: "rune", color: "#60a5fa", cursorType: "crosshair", group: "gaming" },
            battleRoyale: { name: "Battle Royale", fill: "#f97316", stroke: "#7c2d12", glow: "#fdba74", accent: "🪂", trail: "bullet", color: "#fb923c", cursorType: "crosshair", group: "gaming" },
            dungeon: { name: "Dungeon Crawler", fill: "#7c3aed", stroke: "#3b0764", glow: "#c4b5fd", accent: "🏰", trail: "rune", color: "#8b5cf6", cursorType: "staff", group: "gaming" },
            mech: { name: "Mech Warfare", fill: "#94a3b8", stroke: "#1f2937", glow: "#cbd5e1", accent: "🤖", trail: "spark", color: "#cbd5e1", cursorType: "crosshair", group: "gaming" },
            esports: { name: "Esports Arena", fill: "#ef4444", stroke: "#450a0a", glow: "#fca5a5", accent: "🏆", trail: "speed", color: "#f87171", cursorType: "crosshair", group: "gaming" },
            tactical: { name: "Tactical Ops", fill: "#22d3ee", stroke: "#083344", glow: "#67e8f9", accent: "🎖️", trail: "bullet", color: "#22d3ee", cursorType: "crosshair", group: "gaming" },
            drift: { name: "Night Drift", fill: "#a855f7", stroke: "#3b0764", glow: "#d8b4fe", accent: "💨", trail: "speed", color: "#c084fc", cursorType: "speed", group: "gaming" },

            streamer: { name: "Streamer RGB", fill: "#8b5cf6", stroke: "#4c1d95", glow: "#c4b5fd", accent: "🎥", trail: "neon", color: "#a78bfa", cursorType: "arrow", group: "creative" },
            synthwave: { name: "Synthwave 80s", fill: "#ec4899", stroke: "#831843", glow: "#f9a8d4", accent: "🌆", trail: "neon", color: "#f472b6", cursorType: "retro_arrow", group: "creative" },
            hacker: { name: "Hacker Matrix", fill: "#22c55e", stroke: "#052e16", glow: "#86efac", accent: "🔐", trail: "glitch", color: "#4ade80", cursorType: "arrow", group: "creative" },
            lunar: { name: "Lunar Mist", fill: "#cbd5e1", stroke: "#334155", glow: "#f1f5f9", accent: "🌕", trail: "smoke", color: "#e2e8f0", cursorType: "arrow", group: "creative" },
            ocean: { name: "Ocean Drift", fill: "#06b6d4", stroke: "#164e63", glow: "#67e8f9", accent: "🌊", trail: "bubble", color: "#22d3ee", cursorType: "arrow", group: "creative" },
            volcano: { name: "Volcano Ember", fill: "#dc2626", stroke: "#450a0a", glow: "#fca5a5", accent: "🌋", trail: "ember", color: "#ef4444", cursorType: "arrow", group: "creative" },
            forest: { name: "Forest Spirit", fill: "#16a34a", stroke: "#14532d", glow: "#86efac", accent: "🌲", trail: "leaf", color: "#22c55e", cursorType: "arrow", group: "creative" },
            desert: { name: "Desert Mirage", fill: "#f59e0b", stroke: "#78350f", glow: "#fde68a", accent: "🏜️", trail: "dust", color: "#fbbf24", cursorType: "arrow", group: "creative" },
            aurora: { name: "Aurora Borealis", fill: "#14b8a6", stroke: "#0f766e", glow: "#99f6e4", accent: "✨", trail: "magic", color: "#2dd4bf", cursorType: "arrow", group: "creative" },
            candy: { name: "Candy Pop", fill: "#fb7185", stroke: "#9f1239", glow: "#fbcfe8", accent: "🍭", trail: "bubble", color: "#fda4af", cursorType: "arrow", group: "creative" },
            monochrome: { name: "Monochrome Pro", fill: "#e5e7eb", stroke: "#111827", glow: "#9ca3af", accent: "◼️", trail: "line", color: "#d1d5db", cursorType: "arrow", group: "creative" },
            blueprint: { name: "Blueprint CAD", fill: "#0ea5e9", stroke: "#082f49", glow: "#7dd3fc", accent: "📐", trail: "line", color: "#38bdf8", cursorType: "crosshair", group: "creative" },
            crypto: { name: "Crypto Pulse", fill: "#f59e0b", stroke: "#78350f", glow: "#fde68a", accent: "₿", trail: "coin", color: "#fbbf24", cursorType: "arrow", group: "creative" },
            galaxy: { name: "Galaxy Core", fill: "#6366f1", stroke: "#312e81", glow: "#c4b5fd", accent: "🌌", trail: "magic", color: "#818cf8", cursorType: "arrow", group: "creative" }
        };

        this.currentTheme = "default";
        this.particles = [];
        this.ripples = [];
        this.ghostTrail = [];
        this.mouse = { x: -100, y: -100, isDown: false };
        this.lastMouse = { x: -100, y: -100 };
        this.frameCount = 0;

        this.initCanvas();
        this.bindEvents();
        this.setTheme("default");
        this.animate();

        window.addEventListener("message", (e) => {
            if (e.data && e.data.type === "shadow-cursor-set-theme") this.setTheme(e.data.theme);
        });
    }

    initCanvas() {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:999999;";
        document.body.appendChild(this.canvas);
        this.resize();
        window.addEventListener("resize", () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    _filter(glow, opacity = "0.7", blur = "1.5") {
        return `<defs><filter id="g"><feDropShadow dx="0" dy="1" stdDeviation="${blur}" flood-color="${glow}" flood-opacity="${opacity}"/></filter></defs>`;
    }
    buildArrowSVG(fill, stroke, glow) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${this._filter(glow)}<path d="M4 2 L4 26 L10 20 L16 28 L20 26 L14 18 L22 18 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round" filter="url(#g)"/></svg>`;
    }
    buildHandSVG(fill, stroke, glow) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${this._filter(glow)}<path d="M14 2 C14 2 12 2 12 4 L12 14 L10 12 C8 10 6 11 6 13 L6 14 L12 22 L12 28 L24 28 L24 20 C24 16 22 14 22 10 L22 6 C22 4 20 4 20 6 L20 12 L18 4 C18 2 16 2 16 4 L16 12 L14 2 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round" filter="url(#g)"/></svg>`;
    }
    buildClickSVG(fill, stroke, glow) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${this._filter(glow, "1", "2.5")}<path d="M5 4 L5 24 L10 19 L15 26 L19 24 L14 17 L21 17 Z" fill="${glow}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round" filter="url(#g)"/></svg>`;
    }
    buildTextSVG(fill, stroke, glow) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${this._filter(glow, "0.9", "2")}<g filter="url(#g)" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"><line x1="16" y1="4" x2="16" y2="28"/><line x1="10" y1="6" x2="22" y2="6"/><line x1="10" y1="26" x2="22" y2="26"/></g><circle cx="16" cy="16" r="2.2" fill="${fill}"/></svg>`;
    }
    buildSwordSVG(fill, stroke, glow) {
        const p = (x, y, c) => `<rect x="${x}" y="${y}" width="3" height="3" fill="${c}"/>`;
        let r = "";
        [[0, 0], [3, 3], [6, 6], [9, 9], [12, 12]].forEach(([x, y]) => { r += p(x, y, fill); });
        [[3, 0], [6, 3], [9, 6], [12, 9], [15, 12]].forEach(([x, y]) => { r += p(x, y, glow); });
        [[0, 3], [3, 6], [6, 9], [9, 12], [12, 15]].forEach(([x, y]) => { r += p(x, y, stroke); });
        r += p(12, 18, "#92400e") + p(15, 15, "#92400e") + p(18, 12, "#92400e");
        r += p(18, 18, "#78350f") + p(21, 21, "#78350f") + p(24, 24, "#451a03");
        return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${this._filter(glow)}<g filter="url(#g)">${r}</g></svg>`;
    }
    buildCrosshairSVG(fill, stroke, glow) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${this._filter(glow, "0.8", "2")}<g filter="url(#g)" stroke="${fill}" stroke-width="2" fill="none"><circle cx="16" cy="16" r="8"/><line x1="16" y1="2" x2="16" y2="10"/><line x1="16" y1="22" x2="16" y2="30"/><line x1="2" y1="16" x2="10" y2="16"/><line x1="22" y1="16" x2="30" y2="16"/><circle cx="16" cy="16" r="2" fill="${glow}"/></g></svg>`;
    }
    buildStaffSVG(fill, stroke, glow) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${this._filter(glow, "0.9", "2")}<g filter="url(#g)"><line x1="6" y1="6" x2="26" y2="26" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/><line x1="6" y1="6" x2="26" y2="26" stroke="#92400e" stroke-width="2" stroke-linecap="round"/><circle cx="6" cy="6" r="5" fill="${fill}" stroke="${stroke}" stroke-width="1"/><circle cx="6" cy="6" r="2.5" fill="${glow}"/></g></svg>`;
    }
    buildRetroArrowSVG(fill, stroke, glow) {
        const p = (x, y, c) => `<rect x="${x}" y="${y}" width="4" height="4" fill="${c}"/>`;
        let r = "";
        r += p(0, 0, fill) + p(4, 0, fill) + p(8, 0, fill) + p(12, 0, fill) + p(16, 0, fill);
        r += p(0, 4, fill) + p(4, 4, glow);
        r += p(0, 8, fill) + p(4, 8, glow) + p(8, 8, fill);
        r += p(0, 12, fill) + p(12, 12, fill) + p(16, 12, glow);
        r += p(0, 16, fill) + p(16, 16, fill) + p(20, 16, glow);
        r += p(24, 20, fill);
        return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${this._filter(glow)}<g filter="url(#g)">${r}</g></svg>`;
    }
    buildSpeedSVG(fill, stroke, glow) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${this._filter(glow, "0.8", "2")}<g filter="url(#g)"><path d="M4 2 L4 26 L10 20 L16 28 L20 26 L14 18 L22 18 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/><line x1="24" y1="8" x2="30" y2="8" stroke="${glow}" stroke-width="2" stroke-linecap="round" opacity="0.7"/><line x1="24" y1="14" x2="28" y2="14" stroke="${glow}" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/></g></svg>`;
    }
    svgToURI(svgStr, hotX = 4, hotY = 2) {
        return `url("data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}") ${hotX} ${hotY}, auto`;
    }

    applyStyles() {
        const t = this.themes[this.currentTheme];
        let styleEl = document.getElementById("shadow-cursor-style");
        if (!styleEl) {
            styleEl = document.createElement("style");
            styleEl.id = "shadow-cursor-style";
            document.head.appendChild(styleEl);
        }

        let idle;
        let hover;
        let click;
        const ct = t.cursorType || "arrow";
        if (ct === "sword") {
            idle = this.svgToURI(this.buildSwordSVG(t.fill, t.stroke, t.glow), 2, 2);
            hover = this.svgToURI(this.buildSwordSVG(t.glow, t.stroke, t.fill), 2, 2);
            click = this.svgToURI(this.buildSwordSVG("#fff", t.stroke, t.glow), 2, 2);
        } else if (ct === "crosshair") {
            idle = this.svgToURI(this.buildCrosshairSVG(t.fill, t.stroke, t.glow), 16, 16);
            hover = this.svgToURI(this.buildCrosshairSVG(t.glow, t.stroke, t.fill), 16, 16);
            click = this.svgToURI(this.buildCrosshairSVG("#fff", t.stroke, t.glow), 16, 16);
        } else if (ct === "staff") {
            idle = this.svgToURI(this.buildStaffSVG(t.fill, t.stroke, t.glow), 6, 6);
            hover = this.svgToURI(this.buildStaffSVG(t.glow, t.stroke, t.fill), 6, 6);
            click = this.svgToURI(this.buildStaffSVG("#fff", t.stroke, t.glow), 6, 6);
        } else if (ct === "retro_arrow") {
            idle = this.svgToURI(this.buildRetroArrowSVG(t.fill, t.stroke, t.glow), 2, 2);
            hover = this.svgToURI(this.buildRetroArrowSVG(t.glow, t.stroke, t.fill), 2, 2);
            click = this.svgToURI(this.buildRetroArrowSVG("#fff", t.stroke, t.glow), 2, 2);
        } else if (ct === "speed") {
            idle = this.svgToURI(this.buildSpeedSVG(t.fill, t.stroke, t.glow), 4, 2);
            hover = this.svgToURI(this.buildHandSVG(t.fill, t.stroke, t.glow), 10, 2);
            click = this.svgToURI(this.buildSpeedSVG("#fff", t.stroke, t.glow), 4, 2);
        } else {
            idle = this.svgToURI(this.buildArrowSVG(t.fill, t.stroke, t.glow), 4, 2);
            hover = this.svgToURI(this.buildHandSVG(t.fill, t.stroke, t.glow), 10, 2);
            click = this.svgToURI(this.buildClickSVG(t.fill, t.stroke, t.glow), 5, 4);
        }
        const texting = this.svgToURI(this.buildTextSVG(t.fill, t.stroke, t.glow), 16, 16);

        styleEl.innerHTML = `
            html, body { cursor: ${idle} !important; min-height: 100vh; }
            a, button, select, [role="button"], .hoverable, [onclick] { cursor: ${hover} !important; }
            input, textarea, [contenteditable="true"], [contenteditable=""], .texting { cursor: ${texting} !important; }
            html:active, body:active, a:active, button:active, *:active { cursor: ${click} !important; }
            .no-select, button, a { user-select: none; -webkit-user-drag: none; }
        `;
    }

    setTheme(themeName) {
        if (!this.themes[themeName]) return null;
        this.currentTheme = themeName;
        this.applyStyles();
        document.body.style.display = "none";
        document.body.offsetHeight;
        document.body.style.display = "";
        return this.themes[themeName];
    }

    bindEvents() {
        document.addEventListener("mousemove", (e) => {
            this.lastMouse.x = this.mouse.x;
            this.lastMouse.y = this.mouse.y;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;

            const dx = this.mouse.x - this.lastMouse.x;
            const dy = this.mouse.y - this.lastMouse.y;
            const speed = Math.sqrt((dx * dx) + (dy * dy));
            if (speed > 2) this.spawnParticles(1 + Math.min(3, Math.floor(speed / 10)));
            if (this.frameCount % 3 === 0) {
                this.ghostTrail.push({ x: this.mouse.x, y: this.mouse.y, life: 1 });
                if (this.ghostTrail.length > 8) this.ghostTrail.shift();
            }
        });
        document.addEventListener("mousedown", (e) => {
            this.mouse.isDown = true;
            this.spawnParticles(15);
            this.ripples.push({ x: e.clientX, y: e.clientY, radius: 5, life: 1 });
            this.playClickSound();
        });
        document.addEventListener("mouseup", () => { this.mouse.isDown = false; });
    }

    playClickSound() {
        try {
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ac.createOscillator();
            const gain = ac.createGain();
            const freq = 700 + (Object.keys(this.themes).indexOf(this.currentTheme) % 20) * 35;
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ac.currentTime + 0.08);
            gain.gain.setValueAtTime(0.08, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(ac.destination);
            osc.start();
            osc.stop(ac.currentTime + 0.12);
        } catch (_err) {}
    }

    spawnParticles(count) {
        const theme = this.themes[this.currentTheme];
        for (let i = 0; i < count; i += 1) this.particles.push(this.createParticle(theme));
    }

    createParticle(theme) {
        const p = { x: this.mouse.x, y: this.mouse.y, life: 1, color: theme.color, type: theme.trail };
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + (this.mouse.isDown ? 4 : 1);

        if (p.type === "splash") { p.vx = Math.cos(angle) * speed; p.vy = (Math.sin(angle) * speed) - 3; p.gravity = 0.4; p.decay = 0.03; p.size = Math.random() * 6 + 2; }
        else if (p.type === "smoke") { p.vx = (Math.random() - 0.5) * 1.5; p.vy = -Math.random() * 2 - 1; p.gravity = -0.02; p.decay = 0.02; p.size = Math.random() * 15 + 5; }
        else if (p.type === "spark") { p.vx = Math.cos(angle) * (speed * 2.5); p.vy = Math.sin(angle) * (speed * 2.5); p.gravity = 0.5; p.decay = 0.05; p.size = Math.random() * 4 + 1; }
        else if (p.type === "bubble") { p.vx = (Math.random() - 0.5) * 2; p.vy = -Math.random() * 3 - 0.5; p.gravity = -0.03; p.decay = 0.015; p.size = Math.random() * 10 + 4; p.angle = Math.random() * Math.PI * 2; }
        else if (p.type === "coin") { p.vx = (Math.random() - 0.5) * 5; p.vy = -Math.random() * 6 - 2; p.gravity = 0.5; p.decay = 0.02; p.size = Math.random() * 7 + 4; p.spin = Math.random() * 0.3; p.spinAngle = 0; }
        else if (p.type === "glitch") { p.vx = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 5 + 2); p.vy = 0; p.gravity = 0; p.decay = 0.05; p.size = Math.random() * 4 + 2; p.width = Math.random() * 20 + 10; }
        else if (p.type === "pixel") { p.vx = (Math.random() - 0.5) * 2; p.vy = Math.random() * 1 + 0.5; p.gravity = 0.08; p.decay = 0.025; p.size = Math.floor(Math.random() * 3 + 2) * 2; }
        else if (p.type === "bullet") { p.vx = (Math.random() - 0.5) * 8; p.vy = (Math.random() - 0.5) * 8; p.gravity = 0; p.decay = 0.06; p.size = 2; p.length = Math.random() * 6 + 4; }
        else if (p.type === "rune") { p.vx = (Math.random() - 0.5) * 1; p.vy = -Math.random() * 2 - 1; p.gravity = -0.01; p.decay = 0.015; p.size = Math.random() * 6 + 3; p.angle = Math.random() * Math.PI * 2; p.rotSpeed = (Math.random() - 0.5) * 0.1; }
        else if (p.type === "speed" || p.type === "neon") { p.vx = -Math.random() * 10 - 5; p.vy = (Math.random() - 0.5) * 2; p.gravity = 0; p.decay = 0.04; p.size = 2; p.width = Math.random() * 15 + 8; }
        else if (p.type === "pulse") { p.vx = (Math.random() - 0.5) * 1.2; p.vy = (Math.random() - 0.5) * 1.2; p.gravity = 0; p.decay = 0.02; p.size = Math.random() * 8 + 3; }
        else if (p.type === "line") { p.vx = (Math.random() - 0.5) * 2; p.vy = (Math.random() - 0.5) * 2; p.gravity = 0; p.decay = 0.03; p.size = 1.5; p.length = Math.random() * 14 + 8; }
        else if (p.type === "petal" || p.type === "leaf") { p.vx = (Math.random() - 0.5) * 2; p.vy = -Math.random() * 1.5; p.gravity = 0.05; p.decay = 0.018; p.size = Math.random() * 7 + 3; p.angle = Math.random() * Math.PI * 2; p.rotSpeed = (Math.random() - 0.5) * 0.08; }
        else if (p.type === "ember") { p.vx = (Math.random() - 0.5) * 2.5; p.vy = -Math.random() * 3; p.gravity = -0.01; p.decay = 0.04; p.size = Math.random() * 4 + 1; }
        else if (p.type === "crumb" || p.type === "dust") { p.vx = (Math.random() - 0.5) * 2; p.vy = Math.random() * 2; p.gravity = 0.08; p.decay = 0.025; p.size = Math.random() * 3 + 1; }
        else { p.vx = Math.cos(angle) * speed; p.vy = Math.sin(angle) * speed; p.gravity = 0.05; p.decay = 0.02; p.size = Math.random() * 4 + 2; }
        return p;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.frameCount += 1;
        const t = this.themes[this.currentTheme];

        const grd = this.ctx.createRadialGradient(this.mouse.x, this.mouse.y, 0, this.mouse.x, this.mouse.y, 50);
        grd.addColorStop(0, `${t.fill}18`);
        grd.addColorStop(1, "transparent");
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(this.mouse.x - 50, this.mouse.y - 50, 100, 100);

        for (let i = 0; i < this.ghostTrail.length; i += 1) {
            const g = this.ghostTrail[i];
            g.life -= 0.05;
            if (g.life <= 0) { this.ghostTrail.splice(i, 1); i -= 1; continue; }
            this.ctx.save();
            this.ctx.globalAlpha = g.life * 0.15;
            this.ctx.fillStyle = t.fill;
            this.ctx.beginPath();
            this.ctx.arc(g.x, g.y, 4 * g.life, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        for (let i = this.ripples.length - 1; i >= 0; i -= 1) {
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

        for (let i = this.particles.length - 1; i >= 0; i -= 1) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.gravity) p.vy += p.gravity;
            if (p.type === "bubble") p.x += Math.sin((p.life * 10) + p.angle) * 1.5;
            if (p.type === "coin") p.spinAngle += p.spin;
            if (p.type === "smoke") p.size += 0.2;
            p.life -= p.decay;
            if (p.life <= 0) { this.particles.splice(i, 1); continue; }

            this.ctx.save();
            this.ctx.globalAlpha = p.type === "smoke" ? p.life * 0.5 : p.life;
            this.ctx.fillStyle = p.color;

            if (p.type === "bubble") {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * Math.max(0.1, p.life), 0, Math.PI * 2);
                this.ctx.strokeStyle = p.color;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            } else if (p.type === "coin") {
                this.ctx.translate(p.x, p.y);
                this.ctx.scale(Math.cos(p.spinAngle), 1);
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (p.type === "glitch" || p.type === "speed" || p.type === "neon") {
                if (p.type === "neon") { this.ctx.shadowBlur = 12; this.ctx.shadowColor = p.color; }
                this.ctx.fillRect(p.x, p.y, p.width * p.life, p.size);
            } else if (p.type === "pulse") {
                this.ctx.strokeStyle = p.color;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * (1.2 - p.life), 0, Math.PI * 2);
                this.ctx.stroke();
            } else if (p.type === "line" || p.type === "bullet") {
                const a = Math.atan2(p.vy, p.vx);
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x - (Math.cos(a) * p.length), p.y - (Math.sin(a) * p.length));
                this.ctx.strokeStyle = p.color;
                this.ctx.lineWidth = p.size;
                this.ctx.stroke();
            } else if (p.type === "pixel") {
                const s = p.size * Math.max(0.3, p.life);
                this.ctx.fillRect(Math.round(p.x), Math.round(p.y), s, s);
            } else if (p.type === "petal" || p.type === "leaf" || p.type === "rune") {
                p.angle += p.rotSpeed || 0;
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.angle || 0);
                const s = p.size * Math.max(0.2, p.life);
                this.ctx.beginPath();
                if (p.type === "rune") {
                    this.ctx.moveTo(0, -s); this.ctx.lineTo(s, 0); this.ctx.lineTo(0, s); this.ctx.lineTo(-s, 0); this.ctx.closePath();
                } else {
                    this.ctx.ellipse(0, 0, s, s * 0.6, 0, 0, Math.PI * 2);
                }
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

    destroy() {
        this.canvas.remove();
        const s = document.getElementById("shadow-cursor-style");
        if (s) s.remove();
    }
}

window.shadowCursor = new ShadowCursorEngine();
export { ShadowCursorEngine };
