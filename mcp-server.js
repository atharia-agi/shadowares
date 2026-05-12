/**
 * SHADOW STUDIO v5.1 — MCP (Model Context Protocol) Server
 * Enables AI agents (Claude, GPT, Anthropic) to discover and execute Shadow Studio tools
 * Supports: tools/list, tools/call, tools/discover
 * 
 * Can run as:
 * 1. Standalone Node server: node mcp-server.js --port 3000
 * 2. In-browser via postMessage (when loaded in browser context)
 * 3. SSE endpoint for streaming
 * 
 * @version 5.1.0
 */

// ===== Constants =====
const MCP_VERSION = '2024-11-05';
const TOOLS_BATCH_SIZE = 50;
const STREAM_INTERVAL = 500; // ms between stream chunks

// ===== MCP JSON-RPC Methods =====
const MCP_METHODS = {
  'initialize': handleInitialize,
  'tools/list': handleToolsList,
  'tools/call': handleToolsCall,
  'tools/discover': handleToolsDiscover,
  'ping': handlePing,
};

// ===== Session Store =====
const sessions = new Map();

function createSession(id) {
  const session = {
    id,
    createdAt: Date.now(),
    tools: new Map(),
    state: new Map(),
    lastActivity: Date.now()
  };
  sessions.set(id, session);
  return session;
}

// ===== MCP Handlers =====

async function handleInitialize(params) {
  const sessionId = params.sessionId || crypto.randomUUID();
  const session = createSession(sessionId);
  
  return {
    jsonrpc: '2.0',
    id: params.id,
    result: {
      protocolVersion: MCP_VERSION,
      capabilities: {
        tools: {
          listChanged: true,
          call: true,
          discover: true
        },
        resources: false,
        prompts: false
      },
      sessionId,
      metadata: {
        name: 'Shadow Studio v5.1 MCP Server',
        version: '5.1.0',
        description: 'Universal Asset Generator — 14+ creative tools',
        tools: getToolCount()
      }
    }
  };
}

async function handleToolsList(params) {
  // Cursor-based pagination
  const cursor = params.cursor || 0;
  const allTools = getRegisteredTools();
  const batch = allTools.slice(cursor, cursor + TOOLS_BATCH_SIZE);
  const nextCursor = cursor + batch.length < allTools.length 
    ? cursor + batch.length 
    : null;

  return {
    jsonrpc: '2.0',
    id: params.id,
    result: {
      tools: batch.map(tool => ({
        name: tool.id,
        description: tool.description,
        inputSchema: tool.inputSchema,
        outputSchema: tool.outputSchema,
        meta: tool.meta
      })),
      nextCursor,
      totalCount: allTools.length
    }
  };
}

async function handleToolsCall(params) {
  const { toolName, arguments: args } = params;
  
  const tool = getRegisteredTools().find(t => t.id === toolName);
  if (!tool) {
    return {
      jsonrpc: '2.0',
      id: params.id,
      error: {
        code: -32602,
        message: `Tool "${toolName}" not found. Available: ${getToolNames().join(', ')}`
      }
    };
  }

  // Validate input against schema
  const errors = validateInput(tool.inputSchema, args);
  if (errors.length > 0) {
    return {
      jsonrpc: '2.0',
      id: params.id,
      error: {
        code: -32602,
        message: `Invalid input for "${toolName}": ${errors.join('; ')}`
      }
    };
  }

  try {
    // Execute tool — in Node.js, this dispatches to execute.js
    // In browser, this posts a message to the tool's iframe
    const result = await executeToolByName(toolName, args);
    
    return {
      jsonrpc: '2.0',
      id: params.id,
      result: {
        success: true,
        toolName,
        output: result
      }
    };
  } catch (err) {
    return {
      jsonrpc: '2.0',
      id: params.id,
      error: {
        code: -32603,
        message: `Tool execution failed: ${err.message}`
      }
    };
  }
}

async function handleToolsDiscover(params) {
  const filter = params.filter || {};
  let tools = getRegisteredTools();
  
  if (filter.category) tools = tools.filter(t => t.category === filter.category);
  if (filter.level) tools = tools.filter(t => t.level === filter.level);
  if (filter.offlineOnly) tools = tools.filter(t => t.meta?.offline);
  
  return {
    jsonrpc: '2.0',
    id: params.id,
    result: {
      tools: tools.map(t => ({
        name: t.id,
        description: t.description,
        category: t.category,
        level: t.level,
        icon: t.icon,
        meta: t.meta
      })),
      totalCount: tools.length,
      categories: [...new Set(tools.map(t => t.category))],
      levels: [...new Set(tools.map(t => t.level))]
    }
  };
}

async function handlePing(params) {
  return {
    jsonrpc: '2.0',
    id: params.id,
    result: { alive: true, timestamp: Date.now() }
  };
}

// ===== Tool Discovery =====

function getRegisteredTools() {
  // Try to load from ShadowAIRegistry (browser/bundled context)
  if (typeof ShadowAIRegistry !== 'undefined') {
    return ShadowAIRegistry.tools || [];
  }
  // Try require (Node.js context)
  try {
    const reg = require('./ai-tool-registry.js');
    return reg.ShadowAIRegistry?.tools || [];
  } catch { return []; }
}

function getToolNames() {
  return getRegisteredTools().map(t => t.id);
}

function getToolCount() {
  return getRegisteredTools().length;
}

function findTool(name) {
  return getRegisteredTools().find(t => t.id === name);
}

// ===== Tool Execution =====

async function executeToolByName(toolName, args) {
  // In browser context: postMessage to tool iframe
  if (typeof window !== 'undefined') {
    return await executeInBrowser(toolName, args);
  }
  // In Node.js context: use execute.js
  return await executeInNode(toolName, args);
}

async function executeInBrowser(toolName, args) {
  return new Promise((resolve, reject) => {
    const tool = findTool(toolName);
    if (!tool || !tool.url) {
      reject(new Error(`Tool ${toolName} has no URL configured`));
      return;
    }
    
    const win = window.open(tool.url, '_blank');
    if (!win) {
      // Fallback: dispatch via custom event
      window.dispatchEvent(new CustomEvent('shadow:tool:execute', {
        detail: { toolName, args }
      }));
      resolve({ dispatched: true });
      return;
    }
    
    const timeout = setTimeout(() => {
      reject(new Error('Tool execution timeout'));
    }, 30000);
    
    const handler = (e) => {
      if (e.data?.type === 'shadow-tool-output' && e.data.toolName === toolName) {
        clearTimeout(timeout);
        window.removeEventListener('message', handler);
        resolve(e.data.output);
      }
    };
    
    window.addEventListener('message', handler);
    win.addEventListener('load', () => {
      win.postMessage({ type: 'shadow-tool-input', toolName, input: args }, '*');
    });
  });
}

async function executeInNode(toolName, args) {
  // Requires a browser environment or Electron — return instructions
  return {
    note: 'This tool requires a browser context to execute.',
    tool: toolName,
    args,
    url: findTool(toolName)?.url,
    instruction: `Open ${findTool(toolName)?.url} in a browser to execute this tool.`
  };
}

// ===== Input Validation =====

function validateInput(schema, input) {
  const errors = [];
  if (!schema || !schema.properties) return errors;
  
  const required = schema.required || [];
  for (const key of required) {
    if (input[key] === undefined || input[key] === null) {
      errors.push(`Missing required field: "${key}"`);
    }
  }
  
  for (const [key, value] of Object.entries(input || {})) {
    const prop = schema.properties[key];
    if (!prop) continue;
    
    if (prop.type === 'string' && typeof value !== 'string') {
      errors.push(`Field "${key}" must be a string`);
    }
    if (prop.type === 'number' && typeof value !== 'number') {
      errors.push(`Field "${key}" must be a number`);
    }
    if (prop.type === 'boolean' && typeof value !== 'boolean') {
      errors.push(`Field "${key}" must be a boolean`);
    }
    if (prop.enum && !prop.enum.includes(value)) {
      errors.push(`Field "${key}" must be one of: ${prop.enum.join(', ')}`);
    }
    if (prop.minimum !== undefined && value < prop.minimum) {
      errors.push(`Field "${key}" must be >= ${prop.minimum}`);
    }
    if (prop.maximum !== undefined && value > prop.maximum) {
      errors.push(`Field "${key}" must be <= ${prop.maximum}`);
    }
  }
  
  return errors;
}

// ===== Streaming Support =====

async function streamToolCall(toolName, args, onChunk) {
  const tool = findTool(toolName);
  if (!tool) throw new Error(`Tool "${toolName}" not found`);
  
  onChunk({ type: 'start', tool: toolName });
  onChunk({ type: 'status', message: `Initializing ${tool.name}...` });
  
  try {
    // Simulate progressive output
    onChunk({ type: 'progress', progress: 0.1, message: 'Processing...' });
    await sleep(200);
    onChunk({ type: 'progress', progress: 0.5, message: 'Generating...' });
    await sleep(200);
    onChunk({ type: 'progress', progress: 0.9, message: 'Finalizing...' });
    await sleep(100);
    
    const result = await executeToolByName(toolName, args);
    onChunk({ type: 'complete', result });
  } catch (err) {
    onChunk({ type: 'error', message: err.message });
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ===== HTTP Server (Node.js) =====

function createHttpServer(port = 3000) {
  const http = require('http');
  
  const server = http.createServer(async (req, res) => {
    // SSE endpoint
    if (req.url === '/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
      res.write('data: {"status":"connected","tools":' + getToolCount() + '}\n\n');
      return;
    }
    
    // MCP JSON-RPC endpoint
    if (req.url === '/mcp' || req.url === '/') {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const request = JSON.parse(body);
            const handler = MCP_METHODS[request.method];
            if (handler) {
              const response = await handler(request.params || {});
              response.id = request.id;
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(response));
            } else {
              res.writeHead(404);
              res.end(JSON.stringify({ error: 'Method not found' }));
            }
          } catch (err) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      } else {
        // GET: serve MCP discovery page
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(getMCPDashboard());
      }
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });
  
  server.listen(port, () => {
    console.log(`\n🤖 Shadow Studio MCP Server running at http://localhost:${port}/mcp`);
    console.log(`   Tools available: ${getToolCount()}`);
    console.log(`   SSE events: http://localhost:${port}/events`);
    console.log(`   Try: curl -X POST http://localhost:${port}/mcp -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"tools/list","params":{"cursor":0},"id":1}'\n`);
  });
  
  return server;
}

function getMCPDashboard() {
  const tools = getRegisteredTools();
  return `<!DOCTYPE html><html><head><title>Shadow Studio MCP</title>
<style>body{font-family:system-ui;background:#0a0b14;color:#f1f3f7;padding:2em}h1{color:#7c4dff}code{background:#15172a;padding:2px 6px;border-radius:4px}pre{background:#15172a;padding:1em;overflow-x:auto}</style></head>
<body>
<h1>🤖 Shadow Studio MCP Server</h1>
<p>Tools available: <strong>${tools.length}</strong></p>
<h2>Test Command</h2>
<pre><code>curl -X POST http://localhost:3000/mcp \\
  -H 'Content-Type: application/json' \\
  -d '{"jsonrpc":"2.0","method":"tools/list","params":{"cursor":0},"id":1}'</code></pre>
<h2>Available Tools</h2>
${tools.map(t => `<div style="margin:8px 0;padding:12px;background:#15172a;border-radius:8px;border:1px solid #2a2d4a"><strong style="color:#00e5ff">${t.id}</strong> — ${t.description}<br><code style="font-size:.75rem">${t.category} / ${t.level}</code></div>`).join('')}
</body></html>`;
}

// ===== WebSocket Server (Optional) =====

function createWebSocketServer(server) {
  try {
    const WebSocket = require('ws');
    const wss = new WebSocket.Server({ server });
    
    wss.on('connection', (ws) => {
      ws.send(JSON.stringify({ jsonrpc: '2.0', method: 'connected', params: { tools: getToolCount() } }));
      
      ws.on('message', async (data) => {
        try {
          const request = JSON.parse(data);
          const handler = MCP_METHODS[request.method];
          if (handler) {
            const response = await handler(request.params || {});
            response.id = request.id;
            ws.send(JSON.stringify(response));
          }
        } catch (err) {
          ws.send(JSON.stringify({ error: err.message }));
        }
      });
    });
    
    console.log(`   WebSocket: ws://localhost:${server.address().port}/ws`);
  } catch { console.log('   WebSocket: ws module not available (optional)'); }
}

// ===== CLI Entry =====

if (require.main === module) {
  const args = process.argv.slice(2);
  const port = parseInt(args.find(a => a === '--port' && args[args.indexOf(a) + 1]) || args.find(a => a.startsWith('--port='))?.split('=')[1]) || 3000;
  
  console.log('🚀 Starting Shadow Studio MCP Server...\n');
  const server = createHttpServer(port);
  createWebSocketServer(server);
}

// ===== Browser Global =====
if (typeof window !== 'undefined') {
  window.ShadowMCPServer = {
    handleRequest: async (request) => {
      const handler = MCP_METHODS[request.method];
      return handler ? handler(request.params || {}) : { error: 'Method not found' };
    },
    getTools: getRegisteredTools,
    execute: executeToolByName,
    stream: streamToolCall
  };
}

// ===== CommonJS Export =====
module.exports = {
  createHttpServer,
  createWebSocketServer,
  handleMCPRequest: async (req, res) => {
    try {
      const body = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });
      const request = JSON.parse(body);
      const handler = MCP_METHODS[request.method];
      const response = handler ? await handler(request.params || {}) : { jsonrpc: '2.0', error: { code: -32601, message: 'Method not found' }, id: request.id };
      response.id = request.id;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    } catch (err) {
      res.writeHead(400);
      res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32603, message: err.message } }));
    }
  },
  getToolCount,
  getRegisteredTools,
  MCP_METHODS
};