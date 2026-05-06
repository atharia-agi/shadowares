# ⚡ Shadow Toolkit - Universal Asset Engineering Suite

**Zero-dependency browser-native toolkit** for sprite isolation, 2.5D physics, procedural audio, custom cursors, color palettes, and scroll animations.

## 🚀 Features

- **Custom Cursor Engine** - 12 themes (UMKM + Gaming) with particle trails and click feedback
- **2.5D Physics Engine** - Dynamic lighting, tilt physics, and spring interactions
- **Holographic Card** - Premium glassmorphism with rainbow foil and glare effects
- **Pixel Disintegration** - Interactive "Thanos Snap" particle explosion/reconstruction
- **Scroll Reveal** - Zero-dependency entrance animations on scroll
- **Asset Isolation Tools** - Sprite mapping and animated exporter with transparency
- **Design Utilities** - Color palette generator and CSS effect builder

## 📦 Installation

### Direct Browser Usage (Recommended for quick prototyping)

```html
<!-- Include any of the individual engines -->
<script src="shadow-cursor-engine.js"></script>
<script>
  // Set cursor theme
  shadowCursor.setTheme('minecraft');
</script>

<!-- Or use the Web Components -->
<script src="shadow-2.5d-engine.js"></script>
<shadow-2d-physics style="width: 200px; height: 200px;">
  <video src="your-asset.webm" autoplay loop muted></video>
</shadow-2d-physics>
```

### NPM Installation (For build systems)

```bash
npm install @shadow-toolkit/core
```

```javascript
// Import specific components
import { ShadowCursorEngine } from '@shadow-toolkit/core';

// Initialize cursor
const cursor = new ShadowCursorEngine();
cursor.setTheme('tech');
```

## 🎯 Usage Examples

### Custom Cursor

```html
<script src="shadow-cursor-engine.js"></script>
<script>
  // Available themes: warteg, warkop, bengkel, salon, pasar, tech, default, minecraft, fps, rpg, retro, racing
  shadowCursor.setTheme('minecraft');
</script>
```

### 2.5D Physics

```html
<script src="shadow-2.5d-engine.js"></script>
<shadow-2d-physics style="width: 300px; height: 300px;">
  <img src="character.png" alt="Game Character">
</shadow-2d-physics>
```

### Holographic Card

```html
<script src="shadow-holo-card.js"></script>
<shadow-holo-card>
  <img src="product.png" alt="Premium Product">
</shadow-holo-card>
```

### Pixel Disintegration

```html
<script src="shadow-pixel-snap.js"></script>
<shadow-pixel-snap>
  <img src="sprite.png" alt="Game Sprite">
</shadow-pixel-snap>
```

### Scroll Reveal

```html
<script src="shadow-scroll-reveal.js"></script>
<shadow-reveal animation="fade-up" delay="0.2">
  <div>Content to animate</div>
</shadow-reveal>
```

## 🧩 Framework Integration

### React

```jsx
import { ShadowCursorEngine, ShadowThemeManager } from '@shadow-toolkit/core';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Initialize cursor
    const cursor = new ShadowCursorEngine();
    cursor.setTheme('gaming');
    
    // Initialize theme manager (optional)
    const themeManager = new ShadowThemeManager();
    themeManager.applyTheme('dark');
    
    return () => {
      cursor.destroy();
      // themeManager.cleanup() if needed
    };
  }, []);
  
  return (
    <div>
      {/* Your app content */}
    </div>
  );
}
```

### Vue 3

```vue
<template>
  <shadow-2d-physics ref="physicsContainer">
    <video src="asset.webm" autoplay loop muted></video>
  </shadow-2d-physics>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { ShadowCursorEngine, ShadowThemeManager } from '@shadow-toolkit/core';

const physicsContainer = ref(null);
let cursorEngine = null;
let themeManager = null;

onMounted(() => {
  cursorEngine = new ShadowCursorEngine();
  cursorEngine.setTheme('tech');
  
  themeManager = new ShadowThemeManager();
  themeManager.applyTheme('dark');
});

onUnmounted(() => {
  if (cursorEngine) cursorEngine.destroy();
  // themeManager.cleanup() if needed
});
</script>
```

### Svelte

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import { ShadowCursorEngine, ShadowThemeManager } from '@shadow-toolkit/core';
  
  let cursor;
  let themeManager;
  
  onMount(() => {
    cursor = new ShadowCursorEngine();
    cursor.setTheme('retro');
    
    themeManager = new ShadowThemeManager();
    themeManager.applyTheme('dark');
  });
  
  onDestroy(() => {
    if (cursor) cursor.destroy();
    // themeManager.cleanup() if needed
  });
</script>

<div class="app">
  <!-- Your content -->
</div>
```

## 🔧 API Reference

### ShadowCursorEngine

#### Methods
- `setTheme(themeName)` - Change cursor theme
- `destroy()` - Clean up engine and remove DOM elements

#### Themes
- `warteg` - Culinary/Food business theme
- `warkop` - Coffee shop theme  
- `bengkel` - Automotive workshop theme
- `salon` - Beauty salon theme
- `pasar` - Convenience store theme
- `tech` - Technology startup theme
- `default` - Classic magic theme
- `minecraft` - Pixel sword cursor
- `fps` - Crosshair shooter theme
- `rpg` - Fantasy staff theme
- `retro` - Arcade pixel theme
- `racing` - Speedometer theme

### ShadowPhysicsEngine (Web Component)

#### Attributes
- No special attributes required - works with any slotted content

#### CSS Properties
- Can be styled like any regular element: width, height, margin, etc.

### ShadowHoloCard (Web Component)

#### Attributes
- No special attributes required

#### CSS Properties
- Width/height can be customized (default: 240px x 320px)

### ShadowPixelSnap (Web Component)

#### Attributes
- No special attributes required

#### CSS Properties
- Width/height can be customized

### ShadowScrollReveal (Web Component)

#### Attributes
- `animation` - Type of animation: `fade-up`, `fade-down`, `fade-left`, `fade-right`, `zoom-in`, `zoom-out`, `flip`, `blur` (default: `fade-up`)
- `duration` - Animation duration in seconds (default: `0.7`)
- `delay` - Delay before animation starts in seconds (default: `0`)
- `threshold` - Visibility threshold to trigger animation (0-1, default: `0.15`)
- `once` - Whether animation should only happen once (default: `true`)

## 🛠️ Development

### Building from Source

```bash
# Install dependencies
npm install

# Build distribution files
npm run build

# Watch for changes during development
npm run dev
```

### Project Structure

```
/src
  /engines
    shadow-cursor-engine.js
    shadow-2.5d-engine.js
    shadow-holo-card.js
    shadow-pixel-snap.js
    shadow-scroll-reveal.js
  /utils
    color-palette-generator.html
    css-effect-generator.html
  /tools
    icon-mapper.html
    icon-exporter-animated.html
  index.html          # Main dashboard
  component-showcase.html  # Premium demo
```

## 📱 Browser Support

All engines are built with vanilla JavaScript and modern web APIs:
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13.1+
- ✅ Edge 80+
- ✅ Mobile browsers (iOS Safari, Android Chrome)

## 💝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by modern UI/UX trends and game development techniques
- Built with love for developers who want to create magical web experiences
- Special thanks to the open-source community for various techniques and inspiration

---

**Shadow Toolkit** - Make your web assets come alive with zero dependencies and maximum magic. ✨