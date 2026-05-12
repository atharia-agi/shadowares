/**
 * SHADOW STUDIO v5.1 — MCP (Model Context Protocol) Server
 * Enables AI agents (Claude, GPT, Anthropic) to discover and execute Shadow Studio tools
 * Supports: tools/list, tools/call, tools/discover, initialize, ping
 * 
 * Run: node mcp-server.js --port 3000
 * 
 * @version 5.1.0
 */

const MCP_VERSION = '2024-11-05';
const TOOLS_BATCH_SIZE = 50;
const SSE_CLIENTS = new Set();

// Load execute module
let executeModule;
try { executeModule = require('./api/execute.js'); } catch(e) { executeModule = { executeTool: async () => ({ error: 'Module not available' }) }; }

// ===== MCP Methods =====
const MCP_METHODS = {
  'initialize': handleInitialize,
  'tools/list': handleToolsList,
  'tools/call': handleToolsCall,
  'tools/discover': handleToolsDiscover,
  'ping': handlePing,
};

// ===== Session Store =====
const sessions = new Map();
const TOOL_TIMEOUT = 60000; // 60 second timeout per tool

function createSession(id) {
  const session = {
    id,
    createdAt: Date.now(),
    tools: new Map(),
    state: new Map(),
    lastActivity: Date.now(),
    messageCount: 0
  };
  sessions.set(id, session);
  setTimeout(() => sessions.delete(id), 30 * 60 * 1000); // 30 min TTL
  return session;
}

function cleanupSessions() {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastActivity > 30 * 60 * 1000) sessions.delete(id);
  }
}
setInterval(cleanupSessions, 5 * 60 * 1000);

// ===== MCP Handlers =====
async function handleInitialize(params) {
  const sessionId = params.sessionId || crypto.randomUUID();
  const session = createSession(sessionId);
  const tools = getAllTools();
  
  return {
    jsonrpc: '2.0',
    id: params.id,
    result: {
      protocolVersion: MCP_VERSION,
      capabilities: {
        tools: {
          listChanged: true,
          call: true,
          discover: true,
          inputSchema: true
        },
        resources: true,
        prompts: false,
        sse: true
      },
      sessionId,
      metadata: {
        name: 'Shadow Studio v5.1 MCP Server',
        version: '5.1.0',
        description: 'Open Source Canva for Web Dev — 14+ creative tools',
        tools: tools.length,
        categories: [...new Set(tools.map(t => t.category))],
        transports: ['http', 'websocket', 'sse', 'postMessage'],
        formats: ['json', 'svg', 'png', 'webp', 'webm', 'css', 'html', 'zip', 'wav']
      }
    }
  };
}

async function handleToolsList(params) {
  const cursor = params.cursor || 0;
  const allTools = getAllTools();
  const batch = allTools.slice(cursor, cursor + TOOLS_BATCH_SIZE);
  const nextCursor = cursor + batch.length < allTools.length ? cursor + batch.length : null;

  return {
    jsonrpc: '2.0',
    id: params.id,
    result: {
      tools: batch.map(tool => ({
        name: tool.id,
        description: tool.description,
        version: tool.version,
        category: tool.category,
        level: tool.level,
        icon: tool.icon,
        url: tool.url,
        inputSchema: tool.inputSchema,
        outputSchema: tool.outputSchema,
        examples: tool.examples,
        meta: tool.meta,
        handlers: tool.handlers
      })),
      nextCursor,
      totalCount: allTools.length,
      hasMore: nextCursor !== null
    }
  };
}

async function handleToolsCall(params) {
  const { toolName, arguments: args } = params;
  const tool = findTool(toolName);
  
  if (!tool) {
    return {
      jsonrpc: '2.0',
      id: params.id,
      error: {
        code: -32602,
        message: `Tool "${toolName}" not found. Available tools: ${getAllTools().map(t => t.id).join(', ')}`,
        suggestions: getAllTools()
          .filter(t => t.id.includes(toolName?.toLowerCase() || '') || toolName?.includes(t.id.toLowerCase()))
          .map(t => t.id)
      }
    };
  }

  // Validate input
  const errors = validateInput(tool.inputSchema, args);
  if (errors.length > 0) {
    return {
      jsonrpc: '2.0',
      id: params.id,
      error: {
        code: -32602,
        message: `Invalid input for "${toolName}"`,
        details: errors,
        schema: tool.inputSchema
      }
    };
  }

  try {
    // Send progress start via SSE
    broadcastSSE({ type: 'tool:start', tool: toolName, id: params.id });
    
    const startTime = Date.now();
    const result = await executeToolByName(toolName, args);
    const duration = Date.now() - startTime;

    broadcastSSE({ type: 'tool:complete', tool: toolName, id: params.id, duration });

    return {
      jsonrpc: '2.0',
      id: params.id,
      result: {
        success: true,
        tool: toolName,
        version: tool.version,
        output: result,
        durationMs: duration
      }
    };
  } catch (err) {
    broadcastSSE({ type: 'tool:error', tool: toolName, id: params.id, error: err.message });
    return {
      jsonrpc: '2.0',
      id: params.id,
      error: {
        code: -32603,
        message: `Tool "${toolName}" execution failed: ${err.message}`,
        suggestion: 'Try again or check the tool\'s input schema'
      }
    };
  }
}

async function handleToolsDiscover(params) {
  const filter = params.filter || {};
  let tools = getAllTools();

  if (filter.category) tools = tools.filter(t => t.category === filter.category);
  if (filter.level) tools = tools.filter(t => t.level === filter.level);
  if (filter.offlineOnly) tools = tools.filter(t => t.meta?.offline);
  if (filter.format) tools = tools.filter(t => t.handlers?.[filter.format] !== undefined);
  if (filter.search) {
    const q = filter.search.toLowerCase();
    tools = tools.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.description.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.includes(q))
    );
  }

  const sortBy = filter.sortBy || 'name';
  tools.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'category') return a.category.localeCompare(b.category);
    if (sortBy === 'level') return a.level.localeCompare(b.level);
    return 0;
  });

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
        version: t.version,
        url: t.url,
        meta: t.meta,
        handlers: t.handlers,
        inputSchema: filter.includeSchema !== false ? t.inputSchema : undefined,
      })),
      totalCount: tools.length,
      categories: [...new Set(getAllTools().map(t => t.category))],
      levels: [...new Set(getAllTools().map(t => t.level))],
      formats: getAllTools().reduce((fmts, t) => {
        if (t.handlers) Object.keys(t.handlers).forEach(h => {
          if (!fmts.includes(h) && !['http', 'postMessage'].includes(h)) fmts.push(h);
        });
        return fmts;
      }, [])
    }
  };
}

async function handlePing(params) {
  return {
    jsonrpc: '2.0',
    id: params.id,
    result: {
      alive: true,
      timestamp: Date.now(),
      version: '5.1.0',
      tools: getAllTools().length,
      uptime: process.uptime()
    }
  };
}

// ===== SSE Handler =====
async function handleSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  res.write('event: connected\ndata: {"status":"connected","version":"5.1.0","tools":' + getAllTools().length + '}\n\n');

  const clientId = crypto.randomUUID();
  SSE_CLIENTS.add({ write: (data) => res.write(data), id: clientId });
  req.on('close', () => {
    SSE_CLIENTS.forEach(c => c.id === clientId && SSE_CLIENTS.delete(c));
  });
}

function broadcastSSE(data) {
  const payload = 'event: ' + (data.type || 'message') + '\ndata: ' + JSON.stringify(data) + '\n\n';
  SSE_CLIENTS.forEach(client => {
    try { client.write(payload); } catch(e) { /* client disconnected */ }
  });
}

// ===== Tool Discovery =====
function getAllTools() {
  if (typeof ShadowAIRegistry !== 'undefined') return ShadowAIRegistry.tools || [];
  try { return require('./ai-tool-registry.js').ShadowAIRegistry?.tools || []; } 
  catch { return []; }
}

function findTool(name) { return getAllTools().find(t => t.id === name); }
function getToolNames() { return getAllTools().map(t => t.id); }
function getToolCount() { return getAllTools().length; }

// ===== Tool Execution =====
async function executeToolByName(toolName, args) {
  if (typeof window !== 'undefined') return executeInBrowser(toolName, args);
  return executeInNode(toolName, args);
}

async function executeInBrowser(toolName, args) {
  return new Promise((resolve, reject) => {
    const tool = findTool(toolName);
    if (!tool || !tool.url) { reject(new Error(`Tool ${toolName} has no URL`)); return; }
    
    const timeout = setTimeout(() => reject(new Error('Tool execution timeout')), TOOL_TIMEOUT);
    const win = window.open(tool.url, '_blank');
    
    if (!win) {
      window.dispatchEvent(new CustomEvent('shadow:tool:execute', { detail: { toolName, args } }));
      resolve({ dispatched: true });
      return;
    }

    const handler = (e) => {
      if (e.data?.type === 'shadow-tool-output' && e.data.toolName === toolName) {
        clearTimeout(timeout);
        window.removeEventListener('message', handler);
        resolve(e.data.output);
      }
    };
    window.addEventListener('message', handler);
    win.addEventListener('load', () => win.postMessage({ type: 'shadow-tool-input', toolName, input: args }, '*'));
  });
}

async function executeInNode(toolName, args) {
  try {
    const result = await executeModule.executeTool({ toolId: toolName, params: args });
    return result;
  } catch(e) {
    return { note: `Tool ${toolName} requires browser context`, tool: toolName, args, url: findTool(toolName)?.url };
  }
}

// ===== Input Validation =====
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
    if (prop.type === 'array' && !Array.isArray(value)) errors.push(`Field "${key}" must be an array`);
  }
  return errors;
}

// ===== HTTP Server =====
function createHttpServer(port = 3000) {
  const http = require('http');

  const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    // SSE endpoint
    if (req.url === '/events' || req.url === '/sse') return handleSSE(req, res);

    // Discovery endpoint
    if (req.url === '/ai/discover.json' || req.url === '/discover') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        version: '5.1.0',
        tools: getAllTools().map(t => ({
          id: t.id, name: t.name, description: t.description,
          category: t.category, level: t.level, icon: t.icon,
          url: t.url, inputSchema: t.inputSchema, meta: t.meta
        }))
      }));
      return;
    }

    // MCP endpoint for AI assistants
    if (req.url === '/mcp' || req.url === '/' || req.url === '/openapi.json') {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
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
        });
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          openapi: '3.0.3',
          info: { title: 'Shadow Studio MCP', version: '5.1.0' },
          servers: [{ url: `http://localhost:${port}` }],
          paths: {
            '/mcp': { post: { summary: 'MCP JSON-RPC endpoint', requestBody: { content: { 'application/json': { schema: { type: 'object' } } } } } },
            '/events': { get: { summary: 'SSE event stream' } },
            '/ai/discover.json': { get: { summary: 'Tool discovery' } },
            '/openapi.json': { get: { summary: 'OpenAPI spec' } }
          }
        }));
      }
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });

  server.listen(port, () => {
    console.log(`\n🤖 Shadow Studio MCP v5.1.0`);
    console.log(`   📍 http://localhost:${port}/mcp (JSON-RPC 2.0)`);
    console.log(`   📍 http://localhost:${port}/events (SSE)`);
    console.log(`   📍 http://localhost:${port}/ai/discover.json`);
    console.log(`   📍 http://localhost:${port}/openapi.json`);
    console.log(`   🔧 Tools: ${getToolCount()}`);
    console.log(`   📡 Try: curl http://localhost:${port}/mcp -X POST -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"tools/list","params":{"cursor":0},"id":1}'\n`);
  });

  return server;
}

// ===== WebSocket Server =====
function createWebSocketServer(server) {
  try {
    const WebSocket = require('ws');
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
      ws.send(JSON.stringify({ jsonrpc: '2.0', method: 'connected', params: { tools: getToolCount(), version: '5.1.0' } }));

      ws.on('message', async (data) => {
        try {
          const request = JSON.parse(data);
          if (request.method === 'subscribe') {
            const interval = setInterval(() => {
              ws.send(JSON.stringify({ jsonrpc: '2.0', method: 'notification', params: { type: 'heartbeat', timestamp: Date.now() } }));
            }, 30000);
            ws.on('close', () => clearInterval(interval));
            ws.send(JSON.stringify({ jsonrpc: '2.0', method: 'subscribed', params: { events: ['heartbeat', 'tool:start', 'tool:complete', 'tool:error'] } }));
            return;
          }
          const handler = MCP_METHODS[request.method];
          if (handler) {
            const response = await handler(request.params || {});
            response.id = request.id;
            ws.send(JSON.stringify(response));
          }
        } catch (err) {
          ws.send(JSON.stringify({ jsonrpc: '2.0', error: { code: -32603, message: err.message } }));
        }
      });
    });

    console.log(`   🔗 WebSocket: ws://localhost:${server.address().port}/ws`);
  } catch(e) {
    console.log('   🔗 WebSocket: ws module not available (optional)');
  }
}

// ===== CLI Entry =====
if (require.main === module) {
  const args = process.argv.slice(2);
  const port = parseInt(args.find((a, i) => a === '--port' && args[i + 1]) || (args.find(a => a.startsWith('--port=')) || '').split('=')[1]) || 3000;

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
    getTools: getAllTools,
    execute: executeToolByName,
    stream: (toolName, args, onChunk) => {
      onChunk({ type: 'start', tool: toolName });
      executeToolByName(toolName, args).then(result => {
        onChunk({ type: 'complete', result });
      }).catch(err => onChunk({ type: 'error', message: err.message }));
    }
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
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify(response));
    } catch (err) {
      res.writeHead(400);
      res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32603, message: err.message } }));
    }
  },
  getAllTools,
  findTool,
  validateInput,
  MCP_METHODS,
  SSE_CLIENTS
};