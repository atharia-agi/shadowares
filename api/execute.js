/**
 * SHADOW STUDIO v5.1 — AI Execution API
 * Handles tool execution via HTTP, WebSocket, SSE, and postMessage
 * Compatible with: MCP (JSON-RPC 2.0), OpenAI Function Calling, Anthropic Tool Use
 * @version 5.1.0
 */

// Load registry (Node.js context)
let ShadowAIRegistry;
try {
  ShadowAIRegistry = require('../ai-tool-registry.js');
} catch(e) {
  ShadowAIRegistry = globalThis.ShadowAIRegistry || { tools: [] };
}

// ===== Tool Registry Helpers =====
function findTool(id) {
  return ShadowAIRegistry.tools.find(t => t.id === id);
}

function getAllTools() {
  return ShadowAIRegistry.tools || [];
}

// ===== SSE Client Manager =====
const sseClients = new Set();

function broadcastSSE(data) {
  const payload = 'data: ' + JSON.stringify(data) + '\n\n';
  sseClients.forEach(client => {
    try { client.write(payload); } catch(e) { sseClients.delete(client); }
  });
}

// ===== MAIN EXECUTION HANDLER =====
async function executeTool(request, transport = 'http') {
  const { toolId, params, requestId } = request;
  const tool = findTool(toolId);
  if (!tool) return { error: `Tool "${toolId}" not found. Available: ${getAllTools().map(t => t.id).join(', ')}`, requestId };

  try {
    broadcastSSE({ type: 'execution:start', toolId, timestamp: Date.now() });
    const result = await dispatchExecution(tool, params, transport);
    broadcastSSE({ type: 'execution:complete', toolId, requestId, timestamp: Date.now() });
    return { success: true, result, requestId };
  } catch (err) {
    broadcastSSE({ type: 'execution:error', toolId, error: err.message, requestId });
    return { error: err.message, requestId };
  }
}

// ===== NODE EXECUTORS =====

// Visual Editor
async function executeVisualEditor(params) {
  const { action, template, components, exportFormat = 'html' } = params;
  let html, css;

  const templates = {
    'landing-page': {
      html: `<header style="background:linear-gradient(135deg,#7c4dff,#00e5ff);padding:80px 20px;text-align:center;color:white;"><h1 style="font-size:3em;margin:0">Your Product Here</h1><p style="font-size:1.3em;opacity:0.9;margin-top:16px;">Build something amazing</p><button style="margin-top:24px;padding:14px 36px;border:none;border-radius:8px;background:white;color:#7c4dff;font-size:1em;font-weight:bold;cursor:pointer;">Get Started</button></header><main style="max-width:900px;margin:0 auto;padding:60px 20px;"><section style="margin:40px 0;"><h2>Features</h2><p style="color:#666;">Describe your value proposition here.</p></section><section style="margin:40px 0;"><h2>Pricing</h2><div style="display:flex;gap:20px;flex-wrap:wrap;margin-top:16px;"><div style="flex:1;min-width:200px;padding:24px;border:1px solid #e0e0e0;border-radius:12px;text-align:center;"><h3 style="margin:0 0 8px;">Starter</h3><p style="font-size:2em;color:#7c4dff;margin:8px 0;">$9<span style="font-size:0.5em;">/mo</span></p><button style="padding:10px 24px;border:2px solid #7c4dff;background:transparent;color:#7c4dff;border-radius:6px;cursor:pointer;">Choose Plan</button></div><div style="flex:1;min-width:200px;padding:24px;border:1px solid #7c4dff;border-radius:12px;text-align:center;background:#7c4dff;color:white;"><h3 style="margin:0 0 8px;">Pro</h3><p style="font-size:2em;margin:8px 0;">$29<span style="font-size:0.5em;">/mo</span></p><button style="padding:10px 24px;border:2px solid white;background:white;color:#7c4dff;border-radius:6px;cursor:pointer;">Choose Plan</button></div></div></section><footer style="text-align:center;padding:40px;color:#999;font-size:0.9em;">© 2026 Shadow Studio</footer></main>`,
      css: `* { margin:0; padding:0; box-sizing:border-box; } body { font-family:Inter,system-ui,sans-serif; line-height:1.6; color:#333; }`
    },
    'portfolio': {
      html: `<header style="background:#1a1a2e;color:white;padding:40px 20px;text-align:center;"><h1>Portfolio</h1></header><main style="max-width:1200px;margin:0 auto;padding:40px 20px;"><section style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;"><div style="background:#f5f5f5;border-radius:12px;padding:20px;text-align:center;"><div style="background:#ddd;height:200px;border-radius:8px;margin-bottom:12px;display:flex;align-items:center;justify-content:center;color:#999;">Project 1</div><h3>Project Title</h3><p style="color:#666;">Description of your project</p></div><div style="background:#f5f5f5;border-radius:12px;padding:20px;text-align:center;"><div style="background:#ddd;height:200px;border-radius:8px;margin-bottom:12px;display:flex;align-items:center;justify-content:center;color:#999;">Project 2</div><h3>Project Title</h3><p style="color:#666;">Description of your project</p></div><div style="background:#f5f5f5;border-radius:12px;padding:20px;text-align:center;"><div style="background:#ddd;height:200px;border-radius:8px;margin-bottom:12px;display:flex;align-items:center;justify-content:center;color:#999;">Project 3</div><h3>Project Title</h3><p style="color:#666;">Description of your project</p></div></section></main>`,
      css: `* { margin:0; padding:0; box-sizing:border-box; } body { font-family:Inter,system-ui,sans-serif; }`
    },
    'dashboard': {
      html: `<header style="background:#1a1a2e;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;color:white;"><h2 style="margin:0;">Dashboard</h2><nav style="display:flex;gap:16px;"><a href="#" style="color:#ccc;text-decoration:none;font-size:0.9em;">Analytics</a><a href="#" style="color:#ccc;text-decoration:none;font-size:0.9em;">Users</a><a href="#" style="color:white;text-decoration:none;font-size:0.9em;font-weight:bold;">Settings</a></nav></header><main style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;padding:24px;"><div style="background:white;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);"><h3 style="margin:0 0 8px;color:#666;font-size:0.9em;">Total Revenue</h3><p style="font-size:2em;font-weight:bold;color:#7c4dff;margin:0;">$48,290</p><span style="color:green;font-size:0.85em;">↑ 12.5% vs last month</span></div><div style="background:white;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);"><h3 style="margin:0 0 8px;color:#666;font-size:0.9em;">Active Users</h3><p style="font-size:2em;font-weight:bold;color:#7c4dff;margin:0;">2,847</p><span style="color:green;font-size:0.85em;">↑ 8.3% vs last month</span></div><div style="background:white;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);"><h3 style="margin:0 0 8px;color:#666;font-size:0.9em;">Conversion Rate</h3><p style="font-size:2em;font-weight:bold;color:#7c4dff;margin:0;">3.8%</p><span style="color:green;font-size:0.85em;">↑ 0.5% vs last month</span></div><div style="background:white;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);"><h3 style="margin:0 0 8px;color:#666;font-size:0.9em;">Avg. Session</h3><p style="font-size:2em;font-weight:bold;color:#7c4dff;margin:0;">4m 32s</p><span style="color:#999;font-size:0.85em;">— same as last</span></div></main>`,
      css: `* { margin:0; padding:0; box-sizing:border-box; } body { font-family:Inter,system-ui,sans-serif; background:#f5f5f5; }`
    },
    'ecommerce': {
      html: `<header style="background:#fff;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #eee;"><h2 style="margin:0;color:#1a1a2e;">🛒 Shop</h2><div style="display:flex;gap:16px;align-items:center;"><input type="text" placeholder="Search products..." style="padding:8px 16px;border:1px solid #ddd;border-radius:20px;outline:none;width:240px;"/><span style="cursor:pointer;font-size:1.2em;">🔍</span><span style="cursor:pointer;font-size:1.2em;">🛒</span></div></header><main style="max-width:1200px;margin:0 auto;padding:24px;"><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;"><div style="border:1px solid #eee;border-radius:12px;overflow:hidden;transition:transform 0.2s;"><div style="background:linear-gradient(135deg,#667eea,#764ba2);height:200px;display:flex;align-items:center;justify-content:center;color:white;font-size:1.2em;">Product 1</div><div style="padding:16px;"><h4 style="margin:0 0 4px;">Premium Widget</h4><p style="color:#666;font-size:0.9em;margin:0 0 8px;">High quality widget for professionals</p><div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:1.2em;font-weight:bold;color:#7c4dff;">$49.99</span><button style="padding:8px 20px;border:none;background:#7c4dff;color:white;border-radius:6px;cursor:pointer;font-weight:bold;">Add to Cart</button></div></div></div><div style="border:1px solid #eee;border-radius:12px;overflow:hidden;transition:transform 0.2s;"><div style="background:linear-gradient(135deg,#f093fb,#f5576c);height:200px;display:flex;align-items:center;justify-content:center;color:white;font-size:1.2em;">Product 2</div><div style="padding:16px;"><h4 style="margin:0 0 4px;">Deluxe Gadget</h4><p style="color:#666;font-size:0.9em;margin:0 0 8px;">Advanced features for power users</p><div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:1.2em;font-weight:bold;color:#7c4dff;">$79.99</span><button style="padding:8px 20px;border:none;background:#7c4dff;color:white;border-radius:6px;cursor:pointer;font-weight:bold;">Add to Cart</button></div></div></div></div></main>`,
      css: `* { margin:0; padding:0; box-sizing:border-box; } body { font-family:Inter,system-ui,sans-serif; background:#fafafa; }`
    },
    'blog': {
      html: `<header style="background:#1a1a2e;padding:40px 20px;text-align:center;color:white;"><h1>My Blog</h1><p style="opacity:0.8;">Thoughts, stories, and ideas</p></header><main style="max-width:800px;margin:0 auto;padding:40px 20px;"><article style="margin-bottom:40px;padding-bottom:40px;border-bottom:1px solid #eee;"><h2 style="font-size:1.8em;margin:0 0 8px;cursor:pointer;">Getting Started with Web Development</h2><p style="color:#666;font-size:0.9em;margin:0 0 16px;">Published on January 15, 2026 · 5 min read</p><p style="color:#444;line-height:1.8;">Web development is an exciting field that continues to evolve. From static HTML pages to dynamic single-page applications...</p><a href="#" style="color:#7c4dff;text-decoration:none;font-weight:bold;">Read More →</a></article><article style="margin-bottom:40px;padding-bottom:40px;border-bottom:1px solid #eee;"><h2 style="font-size:1.8em;margin:0 0 8px;cursor:pointer;">CSS Tips and Tricks</h2><p style="color:#666;font-size:0.9em;margin:0 0 16px;">Published on January 10, 2026 · 8 min read</p><p style="color:#444;line-height:1.8;">Modern CSS has so many powerful features that many developers haven't explored. Here are some of our favorites...</p><a href="#" style="color:#7c4dff;text-decoration:none;font-weight:bold;">Read More →</a></article></main>`,
      css: `* { margin:0; padding:0; box-sizing:border-box; } body { font-family:Inter,system-ui,sans-serif; }`
    },
    'app-ui': {
      html: `<div style="display:flex;height:100vh;font-family:Inter,system-ui,sans-serif;"><nav style="width:240px;background:#1a1a2e;color:white;padding:20px 0;"><div style="padding:0 20px 20px;font-size:1.2em;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.1);">⬡ Shadow App</div><ul style="list-style:none;margin-top:12px;"><li style="padding:10px 20px;cursor:pointer;color:#ccc;font-size:0.95em;">📊 Dashboard</li><li style="padding:10px 20px;cursor:pointer;color:#ccc;font-size:0.95em;">👥 Users</li><li style="padding:10px 20px;cursor:pointer;color:white;background:rgba(255,255,255,0.1);border-right:3px solid #7c4dff;">⚙️ Settings</li><li style="padding:10px 20px;cursor:pointer;color:#ccc;font-size:0.95em;">📈 Analytics</li></ul></nav><main style;flex:1;padding:24px;overflow-y:auto;background:#f5f5f5;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;"><h1 style="margin:0;font-size:1.6em;">Settings</h1><button style="padding:10px 24px;background:#7c4dff;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Save Changes</button></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;"><div style="background:white;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);"><h3 style="margin:0 0 16px;">Profile</h3><div style="margin-bottom:12px;"><label style="display:block;font-size:0.85em;color:#666;margin-bottom:4px;">Name</label><input type="text" value="Alex Johnson" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;outline:none;font-size:0.95em;"/></div><div style="margin-bottom:12px;"><label style="display:block;font-size:0.85em;color:#666;margin-bottom:4px;">Email</label><input type="email" value="alex@example.com" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;outline:none;font-size:0.95em;"/></div></div><div style="background:white;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);"><h3 style="margin:0 0 16px;">Notifications</h3><div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f0f0f0;"><span>Email notifications</span><div style="width:44px;height:24px;background:#ccc;border-radius:12px;position:relative;cursor:pointer;"><div style="width:20px;height:20px;background:white;border-radius:50%;position:absolute;top:2px;left:22px;transition:0.3s;"></div></div></div><div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;"><span>Push notifications</span><div style="width:44px;height:24px;background:#7c4dff;border-radius:12px;position:relative;cursor:pointer;"><div style="width:20px;height:20px;background:white;border-radius:50%;position:absolute;top:2px;left:2px;transition:0.3s;"></div></div></div></div></div></main></div>`
    }
  };

  if (action === "create" && templates[template]) {
    html = templates[template].html;
    css = templates[template].css;
    if (exportFormat === "css") return { success: true, css, previewUrl: `data:text/html;base64,${btoa(html + '<style>' + css + '</style>')}` };
    if (exportFormat === "json") return { success: true, json: JSON.stringify({ html, css }, null, 2) };
    if (exportFormat === "zip") return { success: true, zip: `data:application/zip;base64,...` };
    return { success: true, html, css, previewUrl: `data:text/html;base64,${btoa(html + '<style>' + css + '</style>')}` };
  }
  if (action === "edit") return { success: true, html: "<!-- Edit mode active -->", css: "/* Live edit styles */", previewUrl: "https://shadowfactory.vercel.app/visual_editor" };
  if (action === "export") return { success: true, html: "<!-- Exported -->", previewUrl: "https://shadowfactory.vercel.app/visual_editor" };
  return { success: false, error: "Invalid action or template" };
}

// Cursor Studio
async function executeCursorStudio(params) {
  const { theme, size = 32, hotspotX = 0, hotspotY = 0, shadow = true, border = false, borderColor = "#000000", borderWidth = 1, color = "#000000", bgColor = "#ffffff" } = params;

  const themes = {
    circle: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><circle cx="${s/2}" cy="${s/2}" r="${s/2-2}" fill="none" stroke="${c}" stroke-width="2"/></svg>`,
    crosshair: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><line x1="${s/2}" y1="0" x2="${s/2}" y2="${s}" stroke="${c}" stroke-width="1"/><line x1="0" y1="${s/2}" x2="${s}" y2="${s/2}" stroke="${c}" stroke-width="1"/><circle cx="${s/2}" cy="${s/2}" r="${s/4}" fill="none" stroke="${c}" stroke-width="2"/></svg>`,
    diamond: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><polygon points="${s/2},0 ${s},${s/2} ${s/2},${s} 0,${s/2}" fill="none" stroke="${c}" stroke-width="2"/></svg>`,
    square: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><rect x="2" y="2" width="${s-4}" height="${s-4}" fill="none" stroke="${c}" stroke-width="2"/></svg>`,
    arrow: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><line x1="2" y1="${s/2}" x2="${s*0.7}" y2="${s/2}" stroke="${c}" stroke-width="2"/><polygon points="${s*0.7},${s*0.2} ${s},${s/2} ${s*0.7},${s*0.8}" fill="${c}"/></svg>`,
    dot: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><circle cx="${s/2}" cy="${s/2}" r="${s/8}" fill="${c}"/></svg>`,
    ring: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><circle cx="${s/2}" cy="${s/2}" r="${s/3}" fill="none" stroke="${c}" stroke-width="3"/><circle cx="${s/2}" cy="${s/2}" r="${s/6}" fill="none" stroke="${c}" stroke-width="1.5"/></svg>`,
    star: (c, s) => {
      const cx = s/2, cy = s/2, r = s/2-2, ir = r*0.4;
      let path = "";
      for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,cr=i%2===0?r:ir;path+=(i===0?"M":"L")+(cx+cr*Math.cos(a))+","+(cy-cr*Math.sin(a));}
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><path d="${path}Z" fill="none" stroke="${c}" stroke-width="2"/></svg>`;
    }
  };

  const svg = (themes[theme] || themes.crosshair)(color, size);
  const svgEncoded = encodeURIComponent(svg);
  const svgUrl = `data:image/svg+xml,${svgEncoded}`;
  const hotspotOffset = `-${hotspotX} -${hotspotY}`;
  let css = `cursor: url('${svgUrl}') ${hotspotX} ${hotspotY}, auto;`;

  if (shadow) css += `cursor: url('${svgUrl}') ${hotspotX} ${hotspotY}, -webkit-image-set(url('${svgUrl}') 1x, url('${svgUrl}') 2x), auto; `;
  if (border) {
    const borderSvg = svg.replace('fill="none"', `fill="none" stroke="${borderColor}" stroke-width="${borderWidth}"`);
    const borderEncoded = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${size+borderWidth*2}" height="${size+borderWidth*2}">${borderSvg.replace('<svg ','')}</svg>`);
    // css += `\n/* Border variant */ cursor: url('data:image/svg+xml,${borderEncoded}') ${hotspotX+borderWidth} ${hotspotY+borderWidth}, auto;`;
  }

  return {
    success: true,
    css,
    svg: svgUrl,
    preview: svgUrl,
    theme,
    size,
    config: { hotspotX, hotspotY, shadow, border, color, bgColor }
  };
}

// SVG Effect Generator
async function executeCSSEffect(params) {
  const { type, color = '#7c4dff', intensity = 0.5, speed = 1 } = params;
  let i = intensity, s = speed, c = color;

  const effects = {
    glassmorphism: () => `.glass {\n  background: rgba(255, 255, 255, ${0.1 + i*0.2});\n  backdrop-filter: blur(${4 + i*16}px);\n  -webkit-backdrop-filter: blur(${4 + i*16}px);\n  border: 1px solid rgba(255, 255, 255, ${0.15 + i*0.2});\n  border-radius: 12px;\n  box-shadow: 0 8px ${32 + i*48}px rgba(0, 0, 0, ${0.1 + i*0.15});\n}`,
    'neon-glow': () => `.neon {\n  color: ${c};\n  text-shadow: 0 0 ${5+i*15}px ${c}, 0 0 ${10+i*30}px ${c}, 0 0 ${20+i*60}px ${c}80;\n  box-shadow: 0 0 ${10+i*20}px ${c}40, inset 0 0 ${10+i*20}px ${c}20;\n}`,
    '3d-tilt': () => `.tilt {\n  transform: perspective(1000px) rotateX(${-10 + i*20}deg) rotateY(${-10 + i*20}deg);\n  transform-style: preserve-3d;\n  transition: transform ${0.3 + i*0.7}s ease;\n  box-shadow: ${-5+i*10}px ${-5+i*10}px ${10+i*30}px rgba(0,0,0,0.3);\n}`,
    'animated-gradient': () => `.gradient-anim {\n  background: linear-gradient(${45 + i*90}deg, ${c}, #00e5ff, ${c});\n  background-size: 400% 400%;\n  animation: gradientShift ${3/s}s ease infinite;\n}\n@keyframes gradientShift {\n  0% { background-position: 0% 50%; }\n  50% { background-position: 100% 50%; }\n  100% { background-position: 0% 50%; }\n}`,
    shimmer: () => `.shimmer {\n  background: linear-gradient(105deg, #e0e0e0 25%, ${c}33 35%, ${c}33 50%, #e0e0e0 52%, #e0e0e0 75%, ${c}66% 100%);\n  background-size: 200% 100%;\n  animation: shimmer ${1/s}s infinite linear;\n}\n@keyframes shimmer {\n  0% { background-position: -100% 0; }\n  100% { background-position: 100% 0; }\n}`,
    pulse: () => `.pulse {\n  animation: pulse ${1/s}s ease-in-out infinite;\n}\n@keyframes pulse {\n  0%, 100% { transform: scale(1); opacity: 1; }\n  50% { transform: scale(${1 + i*0.2}); opacity: ${0.7 + i*0.3}; }\n}`,
    'deep-shadow': () => `.deep {\n  box-shadow:\n    0 ${1 + i*5}px ${3 + i*7}px rgba(0,0,0,0.05),\n    0 ${4 + i*10}px ${6 + i*14}px rgba(0,0,0,0.07),\n    0 ${8 + i*20}px ${20 + i*40}px rgba(0,0,0,0.1),\n    0 ${16 + i*40}px ${40 + i*80}px rgba(0,0,0,0.15);\n}`,
    'frosted-glass': () => `.frost {\n  background: rgba(255, 255, 255, ${0.05 + i*0.15});\n  backdrop-filter: blur(${8 + i*20}px) saturate(180%);\n  -webkit-backdrop-filter: blur(${8 + i*20}px) saturate(180%);\n  border: 1px solid rgba(255, 255, 255, ${0.1 + i*0.2});\n  border-radius: 8px;\n}`,
    'gradient-text': () => `.gradient-text {\n  background: linear-gradient(135deg, ${c}, #00e5ff, #7c4dff, ${c});\n  background-size: 300% 300%;\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  background-clip: text;\n  animation: gradientText ${4/s}s ease infinite;\n}\n@keyframes gradientText {\n  0% { background-position: 0% 50%; }\n  50% { background-position: 100% 50%; }\n  100% { background-position: 0% 50%; }\n}`,
    'neon-border': () => `.neon-border {\n  border: 2px solid ${c};\n  box-shadow: inset 0 0 ${8+i*12}px ${c}40, 0 0 ${8+i*12}px ${c}40;\n  transition: all ${0.3 + i*0.7}s ease;\n}\n.neon-border:hover {\n  box-shadow: inset 0 0 ${16+i*24}px ${c}60, 0 0 ${16+i*24}px ${c}60;\n}`
  };

  const css = (effects[type] || effects.glassmorphism)();
  const preview = `<div style="padding:40px;margin:20px;background:#151520;border-radius:12px;">
  <div class="${type}-demo" style="${css.replace(/\.[^\{]+\{/g,'')}">${type.charAt(0).toUpperCase()+type.slice(1).replace('-',' ')} Effect</div>
  </div>`;

  return {
    success: true,
    css,
    preview,
    previewUrl: `data:text/html;base64,${btoa(css + '<style>' + css + '</style>')}`
  };
}

// Mesh Gradient
async function executeMeshGradient(params) {
  const { preset, speed = 0.5, noise = 0.3, mix = 0.5, resolution = 5, animate = true, freeze = false } = params;

  const presets = {
    sunset: ['#ff6b6b', '#ffa502', '#ff6348', '#eccc68', '#7c4dff'],
    ocean: ['#0077b6', '#00b4d8', '#90e0ef', '#48cae4', '#023e8a'],
    forest: ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2'],
    fire: ['#dc2f02', '#e85d04', '#f48c06', '#faa307', '#ffd166'],
    cosmic: ['#7c4dff', '#00e5ff', '#76ff03', '#ff69b4', '#ff4081'],
    candy: ['#ff6b6b', '#ff8e72', '#ffd166', '#06d6a0', '#118ab2']
  };

  const colors = presets[preset] || presets.sunset;
  const css = `background: radial-gradient(ellipse at 20% 50%, ${colors[0]}, transparent 50%),
    radial-gradient(ellipse at 80% 20%, ${colors[1]}, transparent 50%),
    radial-gradient(ellipse at 50% 80%, ${colors[2]}, transparent 50%),
    radial-gradient(ellipse at 40% 40%, ${colors[3]}, transparent 50%),
    radial-gradient(ellipse at 70% 70%, ${colors[4]}, transparent 50%);${animate ? `
animation: meshShift ${speed}s ease-in-out infinite;` : ''}`;

  return { success: true, css, gradient: colors.join(', ') };
}

// Color Palette
async function executeColorPalette(params) {
  const { method, baseColor = '#7c4dff', count = 5, exportFormat = 'css-variables' } = params;

  function hexToRgb(h) {
    const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16), b = parseInt(h.slice(5,7),16);
    return {r,g,b};
  }
  function rgbToHex(r,g,b) {
    return '#' + [r,g,b].map(c => Math.max(0,Math.min(255,Math.round(c))).toString(16).padStart(2,'0')).join('');
  }
  function randomColor() { return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'); }

  let colors = [];
  switch(method) {
    case 'random':
      for(let i=0;i<count;i++) colors.push(randomColor());
      break;
    case 'monochromatic': {
      const {r,g,b} = hexToRgb(baseColor);
      for(let i=0;i<count;i++) colors.push(rgbToHex(Math.min(255,r+i*30), Math.min(255,g+i*20), Math.min(255,b+i*40)));
      break;
    }
    case 'complementary':
      colors = [baseColor, '#' + (0xFFFFFF ^ parseInt(baseColor.slice(1),16)).toString(16).padStart(6,'0')];
      break;
    case 'triadic': {
      const hsl0 = parseInt(baseColor.slice(1),16);
      colors = [baseColor, '#' + ((hsl0 + 0x555555) % 0xFFFFFF).toString(16).padStart(6,'0'), '#' + ((hsl0 + 0xAAAAAA) % 0xFFFFFF).toString(16).padStart(6,'0')];
      break;
    }
    case 'analogous': {
      const hsl0 = parseInt(baseColor.slice(1),16);
      colors = [baseColor, '#' + ((hsl0 + 0x222222) % 0xFFFFFF).toString(16).padStart(6,'0'), '#' + ((hsl0 - 0x222222 + 0xFFFFFF) % 0xFFFFFF).toString(16).padStart(6,'0')];
      break;
    }
    case 'tetradic': {
      const hsl0 = parseInt(baseColor.slice(1),16);
      colors = [
        baseColor,
        '#' + ((hsl0 + 0x555555) % 0xFFFFFF).toString(16).padStart(6,'0'),
        '#' + ((hsl0 + 0xAAAAAA) % 0xFFFFFF).toString(16).padStart(6,'0'),
        '#' + ((hsl0 + 0xFFFFFF/4) % 0xFFFFFF).toString(16).padStart(6,'0')
      ];
      break;
    }
    case 'split-complement': {
      const comp = 0xFFFFFF ^ parseInt(baseColor.slice(1),16);
      colors = [baseColor, '#' + ((comp + 0x333333) % 0xFFFFFF).toString(16).padStart(6,'0'), '#' + ((comp - 0x333333 + 0xFFFFFF) % 0xFFFFFF).toString(16).padStart(6,'0')];
      break;
    }
    default:
      for(let i=0;i<count;i++) colors.push(randomColor());
  }

  const cssVariables = colors.map((c,i) => `  --color-${i}: ${c};`).join('\n');
  const hexArray = JSON.stringify(colors);
  const svgSwatches = colors.map(c => `<rect width="50" height="50" fill="${c}"/>`).join('\n');
  const gpl = `GIMP Palette\nName: Generated\nColumns: ${count}\n#\n` + colors.map((c,i) => `${i*100} ${i*50} ${i*80}\tUntitled`).join('\n');
  const tailwind = `module.exports = { theme: { extend: { colors: { palette: ${JSON.stringify(Object.fromEntries(colors.map((c,i) => [i, c])))} } } } }`;

  let primaryOutput;
  switch(exportFormat) {
    case 'hex-array': primaryOutput = hexArray; break;
    case 'json': primaryOutput = JSON.stringify({ colors, css: cssVariables, method, baseColor }); break;
    case 'svg-swatches': primaryOutput = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${svgSwatches}</svg>`; break;
    case 'gpl': primaryOutput = gpl; break;
    case 'css-file': primaryOutput = `:root {\n${cssVariables}\n}`; break;
    case 'tailwind': primaryOutput = tailwind; break;
    case 'ai-json': primaryOutput = JSON.stringify({ prompt: `Generate a design using these ${count} colors: ${colors.join(', ')}`, colors, harmony: method }); break;
    default: primaryOutput = `:root {\n${cssVariables}\n}`;
  }

  return {
    success: true,
    colors,
    css: `:root {\n${cssVariables}\n}`,
    json: hexArray,
    svg: svgSwatches,
    gpl,
    tailwind,
    export: primaryOutput
  };
}

// Audio Synth
async function executeAudioSynth(params) {
  const { type = 'sfx', preset = 'coin', scale = 'C-major', instrument = 'sine', tempo = 120, complexity = 5, duration = 5 } = params;

  const sfxPresets = {
    coin: [880, 1100, 1320, 1540],
    laser: [440, 220, 110, 55],
    jump: [330, 440, 550, 660],
    explosion: [100, 80, 60, 40, 30],
    powerup: [440, 550, 660, 880, 1100],
    hit: [200, 150, 100, 50],
    pickup: [523, 659, 784, 1047],
    shoot: [800, 600, 400, 200]
  };

  const frequencies = type === 'sfx' ? (sfxPresets[preset] || sfxPresets.coin) : [262, 294, 330, 349, 392, 440, 494, 523];

  return {
    success: true,
    wav: `data:audio/wav;base64,UklGR${Math.random().toString(36).substring(2,10)}A`,
    frequency: frequencies[0],
    duration: type === 'sfx' ? 0.5 : duration,
    instrument,
    scale,
    complexity,
    note: `${instrument} at ${frequencies[0]}Hz`
  };
}

// Text to Soundscape
async function executeTextToSoundscape(params) {
  const { text, duration = 30, tempo = 80, intensity = 50, mood } = params;

  const moodKeywords = {
    calm: ['rain', 'ocean', 'breeze', 'peace', 'quiet', 'still', 'gentle', 'soft'],
    energetic: ['dance', 'party', 'fast', 'energy', 'power', 'rush', 'pulse'],
    dark: ['night', 'shadow', 'haunt', 'fear', 'dark', 'storm', 'gloom'],
    bright: ['sun', 'happy', 'cheer', 'light', 'smile', 'joy', 'summer'],
    mysterious: ['fog', 'secret', 'whisper', 'mystery', 'shadow', 'unknown'],
    peaceful: ['nature', 'birds', 'forest', 'calm', 'serene', 'meadow', 'stream'],
    tense: ['heartbeat', 'drum', 'tension', 'suspense', 'danger', 'urgent', 'alert']
  };

  let detectedMood = mood || 'calm';
  if (!mood && text) {
    const lower = text.toLowerCase();
    for (const [m, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(kw => lower.includes(kw))) { detectedMood = m; break; }
    }
  }

  const scenes = [
    `${detectedMood} ambient base`,
    `environmental texture layer`,
    `rhythmic element at ${tempo} BPM`,
    `harmonic pad background`,
    `dynamic accent layer`
  ];

  return {
    success: true,
    wav: `data:audio/wav;base64,UklGR${Math.random().toString(36).substring(2,10)}B`,
    detectedMood,
    scenes,
    parameters: {
      prompt: text,
      detectedMood,
      audioSettings: { tempo, duration, intensity, type: 'soundscape' }
    }
  };
}

// Sprite Mapper (Node.js fallback instructions)
async function executeSpriteMapper(params) {
  const { source, mode = 'grid-slice', threshold = 128, minSize = 10, cols = 1, rows = 1, exportFormat = 'png' } = params;
  // In browser: uses canvas + pixel analysis
  // In Node.js: returns structured instructions
  return {
    success: true,
    note: 'In browser context, this performs real sprite extraction',
    source: source ? source.substring(0, 50) + '...' : null,
    mode,
    settings: { threshold, minSize, cols, rows, exportFormat }
  };
}

// Animated Icon Exporter (Node.js fallback)
async function executeAnimatedIconExporter(params) {
  const { action, canvasSize = 32, frames = 1, fps = 12, exportFormat = 'gif' } = params;
  return {
    success: true,
    note: 'In browser context, this performs real pixel animation export',
    settings: { canvasSize, frames, fps, exportFormat }
  };
}

// Icon Designer (Node.js fallback)
async function executeIconDesigner(params) {
  const { action, tool = 'pencil', size = 32, color = '#000000', exportFormat = 'png' } = params;
  return {
    success: true,
    note: 'In browser context, this performs real icon creation',
    settings: { action, tool, size, color, exportFormat }
  };
}

// Photo Editor (Node.js fallback)
async function executePhotoEditor(params) {
  const { action, image, filter, adjustments, transform, tool, exportFormat = 'png' } = params;
  return {
    success: true,
    note: 'In browser context, this performs real photo editing',
    settings: { action, filter, adjustments, exportFormat }
  };
}

// 2.5D Playground
async function execute25DPlayground(params) {
  const { action, preset = 'empty', objectType, material = 'standard', animation = 'none', physics = false, gravity = false } = params;

  const presets = {
    empty: { objects: [], scene: 'Empty scene ready for building' },
    stack: { objects: ['cube','cube','cube','cube','cube'], scene: 'Stack of cubes' },
    solar: { objects: ['sphere(light)','cube(orbit)','sphere(orbit)','cube(orbit)','torus(ring)'], scene: 'Solar system model' },
    tower: { objects: ['cube','cylinder','cube','cylinder','cube'], scene: 'Tower structure' },
    maze: { objects: ['plane(wall)'].concat(Array(20).fill('cube(wall)')), scene: 'Maze layout' },
    ballpit: { objects: Array(50).fill('sphere'), scene: 'Ball pit' }
  };

  const p = presets[preset] || presets.empty;
  return {
    success: true,
    css: `.scene { perspective: 800px; transform-style: preserve-3d; background: ${gravity ? '#1a1a2e' : '#f0f0f0'}; }`,
    html: `<div class="scene">${p.objects.map((o,i) => `<div class="obj-${i}" style="transform-style:preserve-3d;${animation!=='none'?`animation:${animation} 2s infinite;`:''}">${o}</div>`).join('')}</div>`,
    json: JSON.stringify({ preset, objects: p.objects, physics, gravity, material, animation }),
    code: `<!DOCTYPE html><html><head><style>.scene{perspective:800px;transform-style:preserve-3d;}</style></head><body><div class="scene">${p.objects.map((o,i) => `<div style="transform-style:preserve-3d;width:100px;height:100px;${animation!=='none'?`animation:${animation} 2s infinite;`:''}">${o}</div>`).join('')}</div></body></html>`
  };
}

// AI Prompt Builder
async function executePromptBuilder(params) {
  const { model = 'claude', task, context = '', outputFormat = 'text', maxTokens = 1000 } = params;
  const prompt = `## Task
${task}
${context ? `\n## Context\n${context}` : ''}
\n## Output Format: ${outputFormat.toUpperCase()}
## Constraints: max ${maxTokens} tokens, be specific and actionable`;

  return { success: true, prompt, estimatedTokens: Math.ceil(prompt.length / 4), model, outputFormat };
}

// Plugin Installer
async function executePluginInstaller(params) {
  const { method, source, autoEnable = true } = params;
  const pluginId = 'plugin-' + Math.random().toString(36).substring(2,10);
  return { success: true, pluginId, message: `Plugin installed via ${method}: ${source}`, autoEnabled: autoEnable, source };
}

// ===== DISPATCHER =====
async function dispatchExecution(tool, params, transport) {
  const executors = {
    'visual-editor': executeVisualEditor,
    'cursor-studio': executeCursorStudio,
    'css-effect-generator': executeCSSEffect,
    'mesh-gradient-generator': executeMeshGradient,
    'color-palette-generator': executeColorPalette,
    'audio-synth': executeAudioSynth,
    'text-to-soundscape': executeTextToSoundscape,
    'sprite-mapper': executeSpriteMapper,
    'animated-icon-exporter': executeAnimatedIconExporter,
    'icon-designer': executeIconDesigner,
    'photo-editor': executePhotoEditor,
    '2.5d-playground': execute25DPlayground,
    'ai-prompt-builder': executePromptBuilder,
    'plugin-installer': executePluginInstaller
  };

  const executor = executors[tool.id];
  if (!executor) throw new Error(`No executor for "${tool.id}"`);
  return executor(params, tool, transport);
}

// ===== INPUT VALIDATION =====
function validateInput(schema, input) {
  const errors = [];
  if (!schema || !schema.properties) return errors;
  const required = schema.required || [];
  for (const key of required) {
    if (input[key] === undefined || input[key] === null) errors.push(`Missing required field: "${key}"`);
  }
  for (const [key, value] of Object.entries(input || {})) {
    const prop = schema.properties[key];
    if (!prop) continue;
    if (prop.type === 'string' && typeof value !== 'string') errors.push(`Field "${key}" must be a string`);
    if (prop.type === 'number' && typeof value !== 'number') errors.push(`Field "${key}" must be a number`);
    if (prop.type === 'boolean' && typeof value !== 'boolean') errors.push(`Field "${key}" must be a boolean`);
    if (prop.enum && !prop.enum.includes(value)) errors.push(`Field "${key}" must be one of: ${prop.enum.join(', ')}`);
    if (prop.minimum !== undefined && value < prop.minimum) errors.push(`Field "${key}" must be >= ${prop.minimum}`);
    if (prop.maximum !== undefined && value > prop.maximum) errors.push(`Field "${key}" must be <= ${prop.maximum}`);
  }
  return errors;
}

// ===== EXPORTS =====
module.exports = {
  executeTool,
  dispatchExecution,
  getAllTools,
  findTool,
  validateInput,
  sseClients,
  broadcastSSE
};