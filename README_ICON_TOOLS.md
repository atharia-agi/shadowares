# 🚀 Shadow's Universal Asset Exporter & Mapper

Dokumentasi ini dibuat supaya lo nggak lupa cara kerja dan cara menggunakan kedua *engine* pemotong aset otomatis yang udah gue rancang. *Engine* ini nggak cuma buat satu file, tapi **bisa lo pake untuk berbagai file WebM, MP4, WebP, maupun GIF** di masa depan!

---

## 📁 Ada 2 File Utama

### 1. `icon_mapper.html` (Preview & Web Component Generator)

Gunakan file ini kalau lo **NGGAK MAU** mengekspor file videonya jadi banyak file kecil, melainkan lo mau me-*render* mereka secara *real-time* menggunakan **1 file video master** di background.

- **Kelebihan:** Sangat hemat memori untuk web. 1 video master diload, tapi bisa nampilin 50 icon di halaman web lo secara dinamis.
- **Teknis:** Menggunakan *Offscreen Canvas* dan CSS `mix-blend-mode: screen` untuk menghilangkan background hitam secara *native* tanpa melanggar sekuritas browser.
- **Output:** Menghasilkan kode **Web Component (`<magic-icon>`)** siap tempel.

### 2. `icon_exporter_animated.html` (The Ultimate Standalone Exporter)

Gunakan file ini kalau lo mau **MEMECAH** satu file *spritesheet* video menjadi puluhan file `.webm` satuan yang udah bersih, bolong (transparan), dan independen.

- **Kelebihan:** Lo dapet file aset `.webm` nyata yang bisa lo bagiin ke desainer atau langsung dipasang di web pake tag `<video src="...">` biasa.
- **Teknis:** Menggunakan *Computer Vision (BFS Clustering)* lewat JavaScript dan diekspor menggunakan **MediaRecorder API (VP9 Codec)** yang men-*support* Alpha Channel (transparansi). Output murni **NO SOUND** (audio di-strip total).
- **Fitur Baru:** Dilengkapi dengan **Panel Parameter Dinamis** (baca cara pakainya di bawah).

### 3. `shadow-2.5d-engine.js` (The Reusable Drop-in Library)

Ini adalah senjata rahasia untuk *developer handover* (terutama kalau agent/dev-nya ganti). File ini berbentuk **Custom Web Component** yang memaketkan semua efek *2.5D Tilt, Dynamic Drop Shadow, dan Spring Physics* menjadi satu *tag* HTML murni: `<shadow-2d-physics>`.

**Cara Pakai di Project Apapun (React, Vue, Next.js, Vanilla HTML):**

1. Import script library-nya ke dalam web lo:

   ```html
   <script src="path/to/shadow-2.5d-engine.js"></script>
   ```

2. Gunakan komponen tersebut untuk membungkus aset `.webm` transparan yang udah lo dapet dari *exporter* tadi:

   ```html
   <shadow-2d-physics style="width: 200px; height: 200px;">
       <video src="Aset_Animasi_1.webm" autoplay loop muted></video>
   </shadow-2d-physics>
   ```

3. Boom! Aset lo langsung ngerespon pergerakan mouse dan benturan klik tanpa perlu nulis logic *physics* sebaris pun lagi!

### 4. `shadow-holo-card.js` (Holographic Premium Card)

Komponen ini mengubah gambar statis atau video transparan lo menjadi **Kartu Koleksi Premium** dengan efek 3D Tilt, pantulan cahaya kaca (*glare*), dan *holographic foil* pelangi. Sangat cocok untuk *Product Showcase* elit.

**Cara Pakai:**

```html
<script src="path/to/shadow-holo-card.js"></script>

<shadow-holo-card>
    <video src="Aset_Animasi_1.webm" autoplay loop muted></video>
</shadow-holo-card>
```

### 5. `shadow-pixel-snap.js` (Thanos Snap Particle Engine)

Komponen interaktif yang akan membedah setiap piksel dari objek gambar/video lo. Saat elemen ini diklik, karakternya bakal hancur menjadi ribuan partikel debu (*Pixel Disintegration*) yang bereaksi terhadap gravitasi buatan, sebelum kembali utuh!

**Cara Pakai:**

```html
<script src="path/to/shadow-pixel-snap.js"></script>

<shadow-pixel-snap>
    <img src="Aset_Karakter.png">
</shadow-pixel-snap>
```

### 6. `shadow-cursor-engine.js` (Custom Cursor Generator)

Engine yang menggenerate kursor SVG custom + partikel trail dinamis untuk 12 kategori (7 UMKM + 5 Gaming). Fitur: Idle/Hover/Click state, click ripple, ghost trail, micro SFX.

**Cara Pakai:**

```html
<script src="shadow-cursor-engine.js"></script>
<script>
  // Tema: warteg, warkop, bengkel, salon, pasar, tech,
  //       minecraft, fps, rpg, retro, racing, default
  shadowCursor.setTheme('minecraft');
</script>
```

### 7. `shadow-scroll-reveal.js` (Scroll Animation Engine)

Web Component untuk animasi entrance saat scroll. 8 jenis animasi, configurable delay/duration.

**Cara Pakai:**

```html
<script src="shadow-scroll-reveal.js"></script>

<shadow-reveal animation="fade-up" delay="0.2">
    <div>Konten muncul saat di-scroll</div>
</shadow-reveal>
```

Animasi tersedia: `fade-up`, `fade-down`, `fade-left`, `fade-right`, `zoom-in`, `zoom-out`, `flip`, `blur`.

### 8. `color_palette_generator.html` (Color Harmony Tool)

Generator palet warna otomatis berdasarkan teori warna. Input 1 hex → output 5 harmoni (Complementary, Analogous, Triadic, Split, Tetradic) + shades/tints + CSS variable export.

### 9. `css_effect_generator.html` (CSS Effect Builder)

4-in-1 visual CSS generator: Glassmorphism, Neumorphism, Gradient, dan Box Shadow. Slider live preview + copy CSS.

### 10. Dashboard Hub (`index.html`)

Halaman utama yang mengintegrasikan semua utilitas di atas. Sidebar navigation dengan kategori, iframe loader, dan responsive mobile support. Deploy ke Vercel langsung jalan.

---

## 🎛️ Cara Tuning Parameter di `icon_exporter_animated.html`

Karena *spritesheet* (grid) tiap file webm di masa depan pasti beda-beda jarak dan tingkat *noise* warnanya, lo bisa atur 4 parameter ini di layar sebelum mulai mengekstrak:

1. **Sensitivitas Hapus Background (Core Tolerance)**
   - *Fungsi:* Seberapa agresif sistem mendeteksi warna background.
   - *Kapan digeser:* Kalau masih ada "bercak" sisa warna asli di pinggiran, **besarin** angkanya (misal: 80 - 100). Kalau warna objek utamanya malah ikut bolong/hilang, **kecilin** angkanya.

2. **Kehalusan Tepi (Feathering / Anti-Aliasing)**
   - *Fungsi:* Bikin pinggiran objek lo nggak kasar/bergerigi (*smooth gradasi alpha*).
   - *Kapan digeser:* Naikin kalau pinggiran objek kelihatan kaku (kayak digunting). Jaga di angka wajar (30 - 50) supaya nggak bikin objek lo kelihatan blur berlebihan.

3. **Gabungin Objek Terpisah (Merge Distance)**
   - *Fungsi:* Menggabungkan partikel atau aura yang terputus dari badan karakter agar terhitung sebagai 1 *bounding box* yang sama.
   - *Kapan digeser:*
     - Kalau kepala dan badan karakter kepotong jadi 2 file yang beda, **besarin** (misal: 10px - 20px).
     - Kalau karakter A malah gabung sama karakter B di sebelahnya (anomali kecampur), **kecilin** angkanya mentok ke 0px atau 2px!

4. **Padding Batas (Frame Box)**
   - *Fungsi:* Ngasih jarak aman (napas) di sekeliling objek biar nggak terlalu ngepres saat animasinya bergerak membesar.
   - *Kapan digeser:* Idealnya di angka 2px - 5px. Kalau animasinya banyak lompat-lompat, naikin dikit. Jangan kebesaran nanti nyomot piksel dari grid sebelah.

---

## 🚀 Deployment (Vercel)

```bash
cd K:\Eksperimen
npx vercel --prod
```

Vercel otomatis serve `index.html` sebagai root. Semua file flat — zero config needed.

---

> *"Rule of Thumb: Browser security lokal (`file:///`) itu rese. Tapi sistem pake Blob Injection yang gue rancang udah nge-bypass itu semua. Keep crushing it bro!" - Shadow*
