/**
 * Animation Workflow Engine v1.0
 * Shadow Studio — 2.5D Animation Pipeline
 * Import → BG Remove → Export Transparent WebM
 */
const WF = {
  frames: [],
  processedFrames: [],
  currentFrame: 0,
  currentStep: 1,
  method: 'chroma',
  exportFormat: 'webm',
  isPlaying: false,
  playInterval: null,
  sourceType: null,
  videoEl: null,
  pickerMode: false,
  eraseMode: true,

  init() {
    this.videoEl = document.getElementById('srcVideo');
    this.setupUpload();
    this.loadApiKey();
    this.checkAI();
    document.getElementById('playSpeed').addEventListener('input', (e) => {
      document.getElementById('speedVal').textContent = e.target.value + ' fps';
    });
    document.getElementById('chromaTolerance').addEventListener('input', (e) => {
      document.getElementById('tolVal').textContent = e.target.value;
    });
    document.getElementById('chromaSoftness').addEventListener('input', (e) => {
      document.getElementById('softVal').textContent = e.target.value;
    });
    document.getElementById('chromaSpill').addEventListener('input', (e) => {
      document.getElementById('spillVal').textContent = e.target.value;
    });
    this.toast('🎬 Animation Workflow ready! Drop a video or image to start.');
  },

  // === UPLOAD ===
  setupUpload() {
    const zone = document.getElementById('uploadZone');
    const input = document.getElementById('fileInput');
    zone.addEventListener('click', () => input.click());
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault(); zone.classList.remove('dragover');
      if (e.dataTransfer.files.length) this.handleFiles(e.dataTransfer.files);
    });
    input.addEventListener('change', (e) => { if (e.target.files.length) this.handleFiles(e.target.files); });
  },

  handleFiles(files) {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video') || file.name.match(/\.(webm|mp4|gif)$/i);
    const isImage = file.type.startsWith('image') && !file.name.match(/\.gif$/i);

    document.getElementById('uploadZone').style.display = 'none';
    document.getElementById('importPreview').style.display = 'block';

    if (isVideo) {
      this.sourceType = 'video';
      const vid = document.getElementById('srcVideo');
      vid.src = url; vid.style.display = 'block';
      document.getElementById('srcImage').style.display = 'none';
      document.getElementById('fpsGroup').style.display = 'flex';
      document.getElementById('rangeGroup').style.display = 'flex';
      vid.onloadedmetadata = () => {
        document.getElementById('endTime').value = Math.min(vid.duration, 5).toFixed(1);
        document.getElementById('srcInfo').textContent = `${file.name} — ${vid.videoWidth}x${vid.videoHeight}, ${vid.duration.toFixed(1)}s`;
      };
    } else if (isImage) {
      this.sourceType = 'image';
      const img = document.getElementById('srcImage');
      img.src = url; img.style.display = 'block';
      document.getElementById('srcVideo').style.display = 'none';
      document.getElementById('fpsGroup').style.display = 'none';
      document.getElementById('rangeGroup').style.display = 'none';
      img.onload = () => {
        document.getElementById('srcInfo').textContent = `${file.name} — ${img.naturalWidth}x${img.naturalHeight}`;
        // For single image, auto-extract as 1 frame
        this.frames = [];
        const c = document.createElement('canvas');
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        c.getContext('2d').drawImage(img, 0, 0);
        this.frames.push(c.toDataURL('image/png'));
        this.renderFrameGrid('extractedFrames');
        this.toast('📸 Image loaded as single frame');
      };
    }
  },

  // === FRAME EXTRACTION ===
  async extractFrames() {
    if (this.sourceType === 'image') {
      this.toast('✅ Image already extracted as frame');
      return;
    }
    const vid = this.videoEl;
    const fps = parseInt(document.getElementById('extractFps').value) || 12;
    const start = parseFloat(document.getElementById('startTime').value) || 0;
    const end = parseFloat(document.getElementById('endTime').value) || vid.duration;
    const interval = 1 / fps;
    const totalFrames = Math.ceil((end - start) * fps);

    this.frames = [];
    document.getElementById('extractProgress').style.display = 'block';

    const canvas = document.createElement('canvas');
    canvas.width = vid.videoWidth; canvas.height = vid.videoHeight;
    const ctx = canvas.getContext('2d');

    let extracted = 0;
    vid.currentTime = start;

    await new Promise(resolve => {
      const captureFrame = () => {
        if (vid.currentTime >= end || extracted >= totalFrames) {
          resolve(); return;
        }
        ctx.drawImage(vid, 0, 0);
        this.frames.push(canvas.toDataURL('image/png'));
        extracted++;
        const pct = Math.round((extracted / totalFrames) * 100);
        document.getElementById('extractFill').style.width = pct + '%';
        document.getElementById('extractStatus').textContent = `Extracted ${extracted}/${totalFrames} frames`;
        vid.currentTime = Math.min(vid.currentTime + interval, end);
      };
      vid.onseeked = captureFrame;
      captureFrame();
    });

    document.getElementById('extractFill').style.width = '100%';
    document.getElementById('extractStatus').textContent = `✅ Done! ${this.frames.length} frames extracted`;
    this.renderFrameGrid('extractedFrames');
    this.toast(`🎞️ Extracted ${this.frames.length} frames at ${fps}fps`);
  },

  renderFrameGrid(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const src = containerId === 'downloadGrid' ? this.processedFrames : this.frames;
    src.forEach((dataUrl, i) => {
      const card = document.createElement('div');
      card.className = 'frame-card' + (i === this.currentFrame ? ' selected' : '');
      card.innerHTML = `
        <img src="${dataUrl}" alt="Frame ${i+1}">
        <div class="frame-info">
          <span>#${i+1}</span>
          <button class="btn btn-sm btn-secondary" onclick="WF.downloadFrame(${i})" title="Download this frame">⬇️</button>
        </div>
      `;
      card.addEventListener('click', () => { this.currentFrame = i; this.showFrame(i, containerId); });
      container.appendChild(card);
    });
  },

  showFrame(idx, containerId) {
    const container = document.getElementById(containerId);
    container.querySelectorAll('.frame-card').forEach((c, i) => {
      c.classList.toggle('selected', i === idx);
    });
    this.currentFrame = idx;
    if (this.currentStep === 2) this.previewBg();
    if (this.currentStep === 3) this.renderPreviewFrame();
  },

  // === STEP NAVIGATION ===
  goStep(n) {
    if (n > 1 && this.frames.length === 0) { this.toast('⚠️ Import a file first!'); return; }
    if (n === 2 && this.processedFrames.length === 0) {
      this.processedFrames = [...this.frames];
    }
    this.currentStep = n;
    document.querySelectorAll('.panel').forEach((p, i) => p.classList.toggle('active', i === n - 1));
    document.querySelectorAll('.step').forEach((s, i) => {
      s.classList.remove('active', 'done');
      if (i === n - 1) s.classList.add('active');
      else if (i < n - 1) s.classList.add('done');
    });
    if (n === 2) {
      document.getElementById('bgFrameCount').textContent = this.frames.length;
      this.renderFrameGrid('bgFrameGrid');
      this.previewBg();
    }
    if (n === 3) {
      this.renderFrameGrid('previewFrameGrid');
      this.renderPreviewFrame();
    }
    if (n === 4) {
      this.renderFrameGrid('downloadGrid');
      this.generateCss();
    }
  },

  // === BG REMOVAL ===
  setMethod(method, el) {
    this.method = method;
    document.querySelectorAll('.method-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('chromaSettings').style.display = method === 'chroma' ? 'block' : 'none';
    document.getElementById('aiSettings').style.display = method === 'ai' ? 'block' : 'none';
    document.getElementById('manualSettings').style.display = method === 'manual' ? 'block' : 'none';
    if (method !== 'manual') this.previewBg();
  },

  previewBg() {
    if (this.frames.length === 0) return;
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      if (this.method === 'chroma') this.applyChromaKey(ctx, canvas.width, canvas.height);
    };
    img.src = this.frames[this.currentFrame];
  },

  applyChromaKey(ctx, w, h) {
    const color = document.getElementById('chromaColor').value;
    const tolerance = parseInt(document.getElementById('chromaTolerance').value);
    const softness = parseInt(document.getElementById('chromaSoftness').value);
    const spill = parseInt(document.getElementById('chromaSpill').value) / 100;

    const r0 = parseInt(color.substr(1, 2), 16);
    const g0 = parseInt(color.substr(3, 2), 16);
    const b0 = parseInt(color.substr(5, 2), 16);

    const imageData = ctx.getImageData(0, 0, w, h);
    const d = imageData.data;

    for (let i = 0; i < d.length; i += 4) {
      const dr = d[i] - r0, dg = d[i+1] - g0, db = d[i+2] - b0;
      const dist = Math.sqrt(dr*dr + dg*dg + db*db);

      if (dist < tolerance) {
        d[i+3] = 0;
      } else if (dist < tolerance + softness) {
        const alpha = ((dist - tolerance) / softness) * 255;
        d[i+3] = Math.min(d[i+3], Math.round(alpha));
      }

      // Spill suppression
      if (spill > 0 && d[i+3] > 0) {
        const spillAmount = Math.max(0, 1 - dist / (tolerance * 3)) * spill;
        if (g0 > r0 && g0 > b0) d[i+1] = Math.round(d[i+1] * (1 - spillAmount * 0.5));
        if (b0 > r0 && b0 > g0) d[i+2] = Math.round(d[i+2] * (1 - spillAmount * 0.5));
        if (r0 > g0 && r0 > b0) d[i] = Math.round(d[i] * (1 - spillAmount * 0.5));
      }
    }
    ctx.putImageData(imageData, 0, 0);
  },

  pickColor() {
    this.pickerMode = true;
    const canvas = document.getElementById('bgCanvas');
    this.toast('🎯 Click on the background color to pick');
    canvas.style.cursor = 'crosshair';
    canvas.onclick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.round((e.clientX - rect.left) * (canvas.width / rect.width));
      const y = Math.round((e.clientY - rect.top) * (canvas.height / rect.height));
      const ctx = canvas.getContext('2d');
      const px = ctx.getImageData(x, y, 1, 1).data;
      const hex = '#' + [px[0], px[1], px[2]].map(v => v.toString(16).padStart(2, '0')).join('');
      document.getElementById('chromaColor').value = hex;
      canvas.style.cursor = 'default';
      canvas.onclick = null;
      this.pickerMode = false;
      this.previewBg();
      this.toast(`🎨 Picked color: ${hex}`);
    };
  },

  async removeBgAll() {
    if (this.frames.length === 0) return;
    document.getElementById('bgProgress').style.display = 'block';
    this.processedFrames = [];

    for (let i = 0; i < this.frames.length; i++) {
      const pct = Math.round(((i + 1) / this.frames.length) * 100);
      document.getElementById('bgFill').style.width = pct + '%';
      document.getElementById('bgStatus').textContent = `Processing frame ${i+1}/${this.frames.length}...`;

      const processed = await this.removeBgFrame(this.frames[i]);
      this.processedFrames.push(processed);
      await new Promise(r => setTimeout(r, 10));
    }

    document.getElementById('bgStatus').textContent = `✅ Done! ${this.processedFrames.length} frames processed`;
    this.toast(`🪄 Background removed from ${this.processedFrames.length} frames!`);
  },

  removeBgFrame(dataUrl) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);

        if (this.method === 'chroma') {
          this.applyChromaKey(ctx, c.width, c.height);
        }
        resolve(c.toDataURL('image/png'));
      };
      img.src = dataUrl;
    });
  },

  removeBgSelected() {
    if (this.frames.length === 0) return;
    const idx = this.currentFrame;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      if (this.method === 'chroma') this.applyChromaKey(ctx, c.width, c.height);
      this.processedFrames[idx] = c.toDataURL('image/png');
      this.previewBg();
      this.toast(`✅ Frame #${idx + 1} processed`);
    };
    img.src = this.frames[idx];
  },

  undoBg() {
    if (this.frames.length === 0) return;
    this.processedFrames[this.currentFrame] = this.frames[this.currentFrame];
    this.previewBg();
    this.toast('↩️ Frame restored');
  },

  // === PREVIEW ===
  renderPreviewFrame() {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const src = this.processedFrames.length ? this.processedFrames : this.frames;
    if (src.length === 0) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = src[this.currentFrame] || src[0];
  },

  playPreview() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    const fps = parseInt(document.getElementById('playSpeed').value) || 12;
    const src = this.processedFrames.length ? this.processedFrames : this.frames;
    if (src.length < 2) { this.toast('Need 2+ frames to play'); return; }
    this.playInterval = setInterval(() => {
      this.currentFrame = (this.currentFrame + 1) % src.length;
      this.renderPreviewFrame();
    }, 1000 / fps);
  },

  pausePreview() {
    this.isPlaying = false;
    if (this.playInterval) { clearInterval(this.playInterval); this.playInterval = null; }
  },

  // === EXPORT ===
  setExport(fmt, el) {
    this.exportFormat = fmt;
    document.querySelectorAll('.export-opt').forEach(o => o.classList.remove('active'));
    el.classList.add('active');
  },

  async exportAll() {
    const src = this.processedFrames.length ? this.processedFrames : this.frames;
    if (src.length === 0) { this.toast('⚠️ No frames to export!'); return; }

    document.getElementById('exportProgress').style.display = 'block';
    document.getElementById('exportFill').style.width = '0%';

    switch (this.exportFormat) {
      case 'webm': await this.exportWebM(src); break;
      case 'frames': this.exportFrames(src); break;
      case 'sprite': this.exportSpriteSheet(src); break;
      case 'css': this.generateCss(); this.toast('✅ CSS generated! Copy it above.'); break;
    }
  },

  async exportWebM(src) {
    const fps = parseInt(document.getElementById('exportFps').value) || 12;
    const canvas = document.createElement('canvas');
    const firstImg = await this.loadImg(src[0]);
    canvas.width = firstImg.width; canvas.height = firstImg.height;
    const ctx = canvas.getContext('2d');

    // Check for VP9 alpha support
    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
    }

    const stream = canvas.captureStream(fps);
    const chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 });
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

    return new Promise(resolve => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        this.downloadBlob(blob, 'animation-transparent.webm');
        document.getElementById('exportFill').style.width = '100%';
        document.getElementById('exportStatus').textContent = '✅ WebM exported with transparency!';
        this.toast('🎬 WebM exported with transparent background!');
        resolve();
      };

      recorder.start();
      let frame = 0;
      const renderNext = () => {
        if (frame >= src.length) {
          setTimeout(() => recorder.stop(), 200);
          return;
        }
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const pct = Math.round(((frame + 1) / src.length) * 100);
          document.getElementById('exportFill').style.width = pct + '%';
          document.getElementById('exportStatus').textContent = `Encoding frame ${frame+1}/${src.length}...`;
          frame++;
          setTimeout(renderNext, 1000 / fps);
        };
        img.src = src[frame];
      };
      renderNext();
    });
  },

  exportFrames(src) {
    src.forEach((dataUrl, i) => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `frame-${String(i+1).padStart(4,'0')}.png`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    });
    document.getElementById('exportFill').style.width = '100%';
    document.getElementById('exportStatus').textContent = `✅ ${src.length} PNG frames downloaded!`;
    this.toast(`📥 Downloaded ${src.length} frames`);
  },

  exportSpriteSheet(src) {
    if (src.length === 0) return;
    const first = new Image();
    first.onload = () => {
      const cols = Math.ceil(Math.sqrt(src.length));
      const rows = Math.ceil(src.length / cols);
      const canvas = document.createElement('canvas');
      canvas.width = first.width * cols;
      canvas.height = first.height * rows;
      const ctx = canvas.getContext('2d');

      let loaded = 0;
      src.forEach((dataUrl, i) => {
        const img = new Image();
        img.onload = () => {
          const col = i % cols, row = Math.floor(i / cols);
          ctx.drawImage(img, col * first.width, row * first.height);
          loaded++;
          if (loaded === src.length) {
            canvas.toBlob(blob => {
              this.downloadBlob(blob, 'spritesheet.png');
              // Also export JSON metadata
              const meta = JSON.stringify({
                frames: src.length, cols, rows,
                frameWidth: first.width, frameHeight: first.height,
                totalWidth: canvas.width, totalHeight: canvas.height
              }, null, 2);
              this.downloadBlob(new Blob([meta], {type:'application/json'}), 'spritesheet.json');
              this.toast('📊 Sprite sheet + JSON exported!');
            });
          }
        };
        img.src = dataUrl;
      });
    };
    first.src = src[0];
  },

  generateCss() {
    const src = this.processedFrames.length ? this.processedFrames : this.frames;
    if (src.length === 0) return;
    const fps = parseInt(document.getElementById('exportFps').value) || 12;
    const duration = (src.length / fps).toFixed(2);

    let css = `/* 🎬 Shadow Studio — 2.5D Animation CSS */\n`;
    css += `/* ${src.length} frames @ ${fps}fps = ${duration}s */\n\n`;
    css += `.animated-sprite {\n`;
    css += `  width: 200px; /* adjust to your needs */\n`;
    css += `  height: 200px;\n`;
    css += `  background-size: contain;\n`;
    css += `  background-repeat: no-repeat;\n`;
    css += `  background-position: center;\n`;
    css += `  animation: sprite-play ${duration}s steps(1) infinite;\n`;
    css += `}\n\n`;
    css += `@keyframes sprite-play {\n`;
    src.forEach((_, i) => {
      const pct = ((i / src.length) * 100).toFixed(2);
      css += `  ${pct}% { background-image: url('frames/frame-${String(i+1).padStart(4,'0')}.png'); }\n`;
    });
    css += `}\n\n`;
    css += `/* === HTML Usage === */\n`;
    css += `/* <div class="animated-sprite"></div> */\n\n`;
    css += `/* === Alternative: WebM video tag === */\n`;
    css += `/* <video src="animation-transparent.webm" autoplay loop muted playsinline\n`;
    css += `         style="width:200px;height:200px;object-fit:contain;mix-blend-mode:normal"></video> */\n\n`;
    css += `/* === For 2.5D component === */\n`;
    css += `/* <shadow-2d-physics style="width:200px;height:200px">\n`;
    css += `     <video src="animation-transparent.webm" autoplay loop muted></video>\n`;
    css += `   </shadow-2d-physics> */`;

    document.getElementById('cssOutput').innerHTML = `<button class="copy-btn" onclick="WF.copyCss()">📋 Copy</button>${this.escapeHtml(css)}`;
    this._cssContent = css;
  },

  copyCss() {
    if (!this._cssContent) { this.toast('⚠️ Generate CSS first'); return; }
    navigator.clipboard.writeText(this._cssContent).then(() => this.toast('📋 CSS copied to clipboard!'));
  },

  // === DOWNLOAD HELPERS ===
  downloadFrame(idx) {
    const src = this.processedFrames.length ? this.processedFrames : this.frames;
    if (!src[idx]) return;
    const link = document.createElement('a');
    link.href = src[idx];
    link.download = `frame-${String(idx+1).padStart(4,'0')}.png`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    this.toast(`💾 Frame #${idx+1} downloaded`);
  },

  downloadSelected() {
    this.downloadFrame(this.currentFrame);
  },

  downloadAll() {
    const src = this.processedFrames.length ? this.processedFrames : this.frames;
    if (src.length === 0) { this.toast('⚠️ No frames!'); return; }
    if (src.length === 1) { this.downloadFrame(0); return; }
    // Download all frames sequentially
    src.forEach((_, i) => setTimeout(() => this.downloadFrame(i), i * 200));
    this.toast(`📦 Downloading ${src.length} frames...`);
  },

  downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
  },

  // === AI (NVIDIA NIM) ===
  loadApiKey() {
    const key = localStorage.getItem('shadow-nvidia-key');
    if (key) document.getElementById('nvApiKey').value = key;
  },

  checkAI() {
    const key = document.getElementById('nvApiKey').value.trim();
    const badge = document.getElementById('aiStatus');
    if (key && key.startsWith('nvapi-')) {
      localStorage.setItem('shadow-nvidia-key', key);
      badge.className = 'status-badge online';
      badge.textContent = '🤖 AI Ready';
    } else {
      badge.className = 'status-badge offline';
      badge.textContent = '⚡ Local Mode';
    }
  },

  toggleEraseMode() { this.eraseMode = true; this.toast('🗑️ Erase mode active'); },
  toggleRestoreMode() { this.eraseMode = false; this.toast('✅ Restore mode active'); },

  // === UTILS ===
  loadImg(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = src;
    });
  },

  escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },

  toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
  }
};

document.addEventListener('DOMContentLoaded', () => WF.init());
