# AI Agent Tool Discovery & Execution: Technical Research

## Table of Contents
1. [Overview of Standards](#1-overview-of-standards)
2. [Model Context Protocol (MCP)](#2-model-context-protocol-mcp)
3. [OpenAI Function Calling](#3-openai-function-calling)
4. [Anthropic Tool Use](#4-anthropic-tool-use)
5. [JSON Schema for Tool Description](#5-json-schema-for-tool-description)
6. [Implementation Guide](#6-implementation-guide)
7. [Code Examples](#7-code-examples)
8. [Discovery Endpoints & URLs](#8-discovery-endpoints--urls)
9. [Making Your Web App AI-Agent Ready](#9-making-your-web-app-ai-agent-ready)

---

## 1. Overview of Standards

Modern AI agents discover and execute tools through standardized protocols. The three main approaches are:

| Standard | Organization | Transport | Protocol |
|----------|-------------|-----------|----------|
| **MCP** | Anthropic (Open Standard) | stdio, HTTP/SSE | JSON-RPC 2.0 |
| **Function Calling** | OpenAI | HTTP REST | OpenAI API |
| **Tool Use** | Anthropic | HTTP REST | Anthropic API |

---

## 2. Model Context Protocol (MCP)

### 2.1 What is MCP?

MCP is an **open standard** (maintained by Anthropic but designed to be vendor-neutral) that defines how AI applications (hosts) connect to external data sources and tools (servers). It uses **JSON-RPC 2.0** over stdio or HTTP with Server-Sent Events (SSE).

### 2.2 MCP Tool Discovery Flow

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   AI Host   │ ──▶  │ MCP Client   │ ──▶  │ MCP Server  │
│  (Claude)   │      │ (Your Code)  │      │ (Your App)  │
└─────────────┘      └──────────────┘      └─────────────┘
       │                      │                       │
       │  1. Initialize       │  2. Initialize        │
       │  3. tools/list       │  4. tools/list        │
       │  5. Select tool      │  6. tools/call        │
       │  7. Process result   │  8. Return result     │
```

### 2.3 MCP Initialization (JSON-RPC)

The client MUST start with an `initialize` request:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-06-18",
    "capabilities": {
      "roots": { "listChanged": true },
      "sampling": {},
      "elicitation": {}
    },
    "clientInfo": {
      "name": "ExampleClient",
      "title": "Example Client Display Name",
      "version": "1.0.0"
    }
  }
}
```

Server responds with capabilities including tools:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2025-06-18",
    "capabilities": {
      "logging": {},
      "prompts": { "listChanged": true },
      "resources": { "subscribe": true, "listChanged": true },
      "tools": { "listChanged": true }
    },
    "serverInfo": {
      "name": "ExampleServer",
      "title": "Example Server Display Name",
      "version": "1.0.0"
    },
    "instructions": "Optional instructions for the client"
  }
}
```

### 2.4 MCP Tool Listing Request

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {
    "cursor": "optional-cursor-value"
  }
}
```

### 2.5 MCP Tool Listing Response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "get_weather",
        "title": "Weather Information Provider",
        "description": "Get current weather information for a location",
        "inputSchema": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "City name or zip code"
            }
          },
          "required": ["location"]
        },
        "outputSchema": {
          "type": "object",
          "properties": {
            "temperature": {
              "type": "number",
              "description": "Temperature in celsius"
            },
            "conditions": {
              "type": "string",
              "description": "Weather conditions description"
            }
          },
          "required": ["temperature", "conditions"]
        }
      }
    ],
    "nextCursor": "next-page-cursor"
  }
}
```

### 2.6 MCP Tool Call Request

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_weather",
    "arguments": {
      "location": "New York"
    }
  }
}
```

### 2.7 MCP Tool Call Response

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Current weather in New York:\nTemperature: 72°F\nConditions: Partly cloudy"
      }
    ],
    "isError": false
  }
}
```

### 2.8 MCP Capabilities Declaration

Servers MUST declare capabilities during initialization:

```json
{
  "capabilities": {
    "tools": {
      "listChanged": true
    }
  }
}
```

- `listChanged`: Indicates whether the server emits notifications when tools change

### 2.9 MCP Transport Options

#### Standard I/O (stdio)
- Client launches server as subprocess
- Server reads from stdin, writes to stdout
- Messages are newline-delimited JSON-RPC
- Server can log to stderr

#### Streamable HTTP
- Single HTTP endpoint supporting POST and GET
- POST for sending requests, GET for SSE stream
- Session management via `Mcp-Session-Id` header
- Protocol version via `MCP-Protocol-Version` header
- Supports SSE for server-to-client streaming

### 2.10 MCP Tool Result Types

Tools can return various content types:

```json
{
  "type": "text",
  "text": "Tool result text"
}
```

```json
{
  "type": "image",
  "data": "base64-encoded-data",
  "mimeType": "image/png"
}
```

```json
{
  "type": "audio",
  "data": "base64-encoded-audio-data",
  "mimeType": "audio/wav"
}
```

```json
{
  "type": "resource_link",
  "uri": "file:///project/src/main.rs",
  "name": "main.rs",
  "description": "Primary application entry point",
  "mimeType": "text/x-rust"
}
```

---

## 3. OpenAI Function Calling

### 3.1 API Endpoint

```
POST https://api.openai.com/v1/chat/completions
```

### 3.2 Tool Definition Format

```json
{
  "model": "gpt-4o", 
  "messages": [{"role": "user", "content": "What's the weather in New York?"}],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get current weather for a location",
        "strict": true,
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "City and state, e.g. San Francisco, CA"
            },
            "unit": {
              "type": "string", 
              "enum": ["celsius", "fahrenheit"],
              "description": "Temperature unit"
            }
          },
          "required": ["location", "unit"],
          "additionalProperties": false
        }
      }
    }
  ],
  "tool_choice": "auto"
}
```

### 3.3 Tool Choice Options

| Value | Description |
|-------|-------------|
| `"auto"` | Model decides whether to call a tool |
| `"none"` | Never call tools |
| `"required"` | Must call at least one tool |
| `{"type": "function", "function": {"name": "get_weather"}}` | Force specific tool |

### 3.4 Function Call Response

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1699980000,
  "model": "gpt-4o-2024-08-06",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": null,
        "tool_calls": [
          {
            "id": "call_abc123",
            "type": "function",
            "function": {
              "name": "get_weather",
              "arguments": "{\"location\": \"New York\", \"unit\": \"fahrenheit\"}"
            }
          }
        ]
      },
      "finish_reason": "tool_calls"
    }
  ]
}
```

### 3.5 Submitting Tool Results

```json
{
  "model": "gpt-4o",
  "messages": [
    {"role": "user", "content": "What's the weather in New York?"},
    {"role": "assistant", "content": null, "tool_calls": [...]},
    {
      "role": "tool",
      "tool_call_id": "call_abc123",
      "content": "{\"temperature\": 72, \"conditions\": \"Partly cloudy\"}"
    }
  ]
}
```

---

## 4. Anthropic Tool Use

### 4.1 API Endpoint

```
POST https://api.anthropic.com/v1/messages
```

### 4.2 Tool Definition Format

```json
{
  "model": "claude-opus-4-7",
  "max_tokens": 1024,
  "tools": [
    {
      "name": "get_weather",
      "description": "Get current weather for a location",
      "input_schema": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string",
            "description": "City name or zip code"
          }
        },
        "required": ["location"]
      }
    }
  ],
  "messages": [
    {
      "role": "user",
      "content": "What's the weather in New York?"
    }
  ],
  "tool_choice": {"type": "auto"}
}
```

### 4.3 Tool Response Format

```json
{
  "content": [
    {
      "type": "tool_use",
      "id": "toolu_01A09q90qw90lq917835lq9",
      "name": "get_weather",
      "input": {
        "location": "New York, NY",
        "unit": "fahrenheit"
      }
    }
  ],
  "stop_reason": "tool_use",
  "usage": {...}
}
```

### 4.4 Tool Result Submission

```json
{
  "role": "user",
  "content": [
    {
      "type": "tool_result",
      "tool_use_id": "toolu_01A09q90qw90lq917835lq9",
      "content": "Current weather in New York: 72°F, partly cloudy"
    }
  ]
}
```

### 4.5 Strict Tool Use

Add `"strict": true` to enforce exact schema conformance:

```json
{
  "name": "get_weather",
  "description": "Get current weather for a location",
  "strict": true,
  "input_schema": { ... }
}
```

---

## 5. JSON Schema for Tool Description

### 5.1 Standard Schema Format

All modern LLM tool systems use **JSON Schema 2020-12** (or subsets) to describe tool parameters.

```json
{
  "type": "object",
  "title": "WeatherRequest",
  "description": "Parameters for weather lookup",
  "properties": {
    "location": {
      "type": "string",
      "description": "City name or zip code",
      "examples": ["New York, NY", "90210"]
    },
    "unit": {
      "type": "string",
      "enum": ["celsius", "fahrenheit"],
      "default": "fahrenheit",
      "description": "Temperature unit"
    },
    "days": {
      "type": "integer",
      "minimum": 1,
      "maximum": 10,
      "default": 1,
      "description": "Number of forecast days"
    }
  },
  "required": ["location"],
  "additionalProperties": false
}
```

### 5.2 Schema Comparison Table

| Feature | MCP | OpenAI | Anthropic |
|---------|-----|--------|-----------|
| Schema location | `inputSchema` + `outputSchema` | `function.parameters` | `input_schema` |
| JSON Schema version | 2020-12 | Subset of 2020-12 | 2020-12 |
| Support for `$ref` | Yes | No | Yes |
| `additionalProperties` | Yes | Yes (use `false`) | Yes |
| `strict` mode | N/A | Yes | Yes |
| Descriptions required | Recommended | Recommended | Recommended |

### 5.3 Important Schema Properties

```json
{
  "type": "object",
  "properties": {
    "simple_string": {
      "type": "string",
      "description": "Human-readable description for the AI"
    },
    "enum_value": {
      "type": "string",
      "enum": ["a", "b", "c"],
      "description": "Must be one of the allowed values"
    },
    "array_param": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of string values"
    },
    "object_param": {
      "type": "object",
      "properties": {
        "nested_field": {
          "type": "number",
          "description": "A nested field"
        }
      },
      "required": ["nested_field"]
    }
  },
  "required": ["simple_string"]
}
```

---

## 6. Implementation Guide

### 6.1 Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Application                    │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   LLM     │  │ MCP Client   │  │  HTTP/REST Client    │ │
│  │  (Claude) │  │ (JSON-RPC)   │  │  (OpenAI API)        │ │
│  └─────┬─────┘  └──────┬───────┘  └──────────┬───────────┘ │
│        │               │                     │              │
│        └───────────────┼─────────────────────┘              │
│                        │                                    │
│                   Discovery Layer                            │
│                        │                                    │
│  ┌─────────────────────┼──────────────────────┐              │
│  │                     │                       │              │
│  ▼                     ▼                       ▼              │
│ MCP Server         Web API              Function Call        │
│ (stdio/SSE)    (AI-Discovery)          (OpenAI API)          │
│  │                     │                       │              │
│  └─────────────────────┴───────────────────────┘              │
│                        │                                    │
│                   Your Application                           │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Implementation Steps

1. **Define your tools** using JSON Schema
2. **Choose your transport** (MCP stdio, MCP HTTP, or direct API)
3. **Implement the discovery endpoint** (for MCP: `tools/list`)
4. **Implement the execution endpoint** (for MCP: `tools/call`)
5. **Handle the tool loop** in your client code

---

## 7. Code Examples

### 7.1 Complete MCP Server (Node.js/TypeScript)

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "weather",
  version: "1.0.0",
});

// Register a tool with Zod schema
server.registerTool(
  "get_weather",
  {
    description: "Get weather information for a location",
    inputSchema: {
      location: z.string().describe("City name or zip code"),
      unit: z.enum(["celsius", "fahrenheit"]).optional().describe("Temperature unit"),
    },
  },
  async ({ location, unit = "fahrenheit" }) => {
    // Your implementation here
    const weatherData = await fetchWeather(location, unit);
    
    return {
      content: [
        {
          type: "text",
          text: `Weather in ${location}: ${weatherData.temperature}°${unit}, ${weatherData.conditions}`,
        },
      ],
      isError: false,
    };
  }
);

// Run server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

### 7.2 MCP Server Configuration (Claude Desktop)

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/path/to/weather-server/build/index.js"]
    }
  }
}
```

### 7.3 Complete MCP Over HTTP (Express.js)

```javascript
const express = require('express');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');

const app = express();
app.use(express.json());

const server = new McpServer({
  name: "my-web-app",
  version: "1.0.0",
});

// Register tools
server.registerTool("get_user", {
  description: "Get user information",
  inputSchema: {
    userId: { type: "string" }
  }
}, async ({ userId }) => {
  // Implementation
});

// MCP Streamable HTTP endpoint
app.post('/mcp', async (req, res) => {
  const result = await server.handleRequest(req.body);
  res.json(result);
});

// SSE endpoint for server-to-client messages
app.get('/mcp', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Handle SSE connection
  const clientId = generateClientId();
  clients.set(clientId, res);
  
  req.on('close', () => {
    clients.delete(clientId);
  });
});

app.listen(3000, () => {
  console.log('MCP Server running on http://localhost:3000/mcp');
});
```

### 7.4 OpenAI Function Calling Client

```python
from openai import OpenAI
import json

client = OpenAI()

# Define the tool
weather_function = {
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get weather for a location",
        "strict": True,
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City and state, e.g. San Francisco, CA"
                }
            },
            "required": ["location"],
            "additionalProperties": False
        }
    }
}

# Call the API
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What's the weather in New York?"}],
    tools=[weather_function],
    tool_choice="auto"
)

# Extract tool call
if response.choices[0].message.tool_calls:
    tool_call = response.choices[0].message.tool_calls[0]
    function_name = tool_call.function.name
    arguments = json.loads(tool_call.function.arguments)
    
    # Execute your function
    result = get_weather(**arguments)
    
    # Submit result back
    second_response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "user", "content": "What's the weather in New York?"},
            response.choices[0].message,
            {
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": str(result)
            }
        ],
        tools=[weather_function]
    )
```

### 7.5 Anthropic Tool Use Client

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=1024,
    tools=[
        {
            "name": "get_weather",
            "description": "Get weather for a location",
            "input_schema": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City name or zip code"
                    }
                },
                "required": ["location"]
            }
        }
    ],
    messages=[{"role": "user", "content": "What's the weather in New York?"}]
)

# Handle tool use
for content in response.content:
    if content.type == "tool_use":
        tool_name = content.name
        tool_input = content.input
        
        # Execute the tool
        result = execute_tool(tool_name, tool_input)
        
        # Send result back
        final_response = client.messages.create(
            model="claude-opus-4-7",
            max_tokens=1024,
            tools=[...],
            messages=[
                {"role": "user", "content": "What's the weather in New York?"},
                {"role": "assistant", "content": response.content},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "tool_result",
                            "tool_use_id": content.id,
                            "content": str(result)
                        }
                    ]
                }
            ]
        )
```

### 7.6 Python FastAPI Web App with AI Tool Discovery

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json

app = FastAPI(title="AI-Ready API", version="1.0.0")

# ============================================================
# TOOL DEFINITIONS
# ============================================================

class ToolSchema(BaseModel):
    type: str = "object"
    properties: Dict[str, Any]
    required: List[str] = []
    additionalProperties: bool = False

class Tool(BaseModel):
    name: str
    description: str
    title: Optional[str] = None
    inputSchema: ToolSchema
    outputSchema: Optional[Dict[str, Any]] = None

class ToolCallRequest(BaseModel):
    name: str
    arguments: Dict[str, Any]

class ToolResult(BaseModel):
    content: List[Dict[str, Any]]
    isError: bool = False

# ============================================================
# DISCOVERY ENDPOINTS
# ============================================================

@app.get("/.well-known/ai-tools.json")
async def discover_tools():
    """
    AI Tool Discovery Endpoint
    Standard: Well-known URI for tool discovery
    """
    return {
        "tools": [
            {
                "name": "get_user",
                "title": "Get User Information",
                "description": "Retrieve information about a user by their ID",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "userId": {
                            "type": "string",
                            "description": "Unique identifier for the user"
                        }
                    },
                    "required": ["userId"],
                    "additionalProperties": False
                },
                "outputSchema": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "name": {"type": "string"},
                        "email": {"type": "string"}
                    },
                    "required": ["id", "name", "email"]
                }
            },
            {
                "name": "create_task",
                "title": "Create Task",
                "description": "Create a new task with title and optional description",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": "Task title"
                        },
                        "description": {
                            "type": "string",
                            "description": "Optional task description"
                        },
                        "priority": {
                            "type": "string",
                            "enum": ["low", "medium", "high"],
                            "description": "Task priority level"
                        }
                    },
                    "required": ["title", "priority"],
                    "additionalProperties": False
                }
            }
        ]
    }

@app.get("/.well-known/openapi.json")
async def openapi_spec():
    """
    Standard OpenAPI specification for non-AI clients
    """
    return app.openapi()

# ============================================================
# TOOL EXECUTION ENDPOINTS
# ============================================================

@app.post("/ai/tools/call")
async def execute_tool_call(request: ToolCallRequest):
    """
    Generic tool execution endpoint for AI agents
    """
    if request.name == "get_user":
        user_id = request.arguments.get("userId")
        # Your logic here
        return ToolResult(
            content=[{
                "type": "text",
                "text": f"User: {user_id} - Retrieved successfully"
            }],
            isError=False
        )
    
    elif request.name == "create_task":
        title = request.arguments.get("title")
        # Your logic here
        return ToolResult(
            content=[{
                "type": "text",
                "text": f"Task '{title}' created successfully"
            }],
            isError=False
        )
    
    raise HTTPException(status_code=404, detail=f"Unknown tool: {request.name}")

# ============================================================
# MCP COMPATIBLE ENDPOINTS
# ============================================================

@app.post("/mcp")
async def mcp_endpoint(request: dict):
    """
    MCP Compatible JSON-RPC endpoint
    """
    method = request.get("method")
    
    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": request.get("id"),
            "result": {
                "protocolVersion": "2025-06-18",
                "capabilities": {
                    "tools": {"listChanged": True}
                },
                "serverInfo": {
                    "name": "ai-ready-api",
                    "version": "1.0.0"
                }
            }
        }
    
    elif method == "tools/list":
        tools = await discover_tools()
        return {
            "jsonrpc": "2.0",
            "id": request.get("id"),
            "result": {
                "tools": tools["tools"],
                "nextCursor": None
            }
        }
    
    elif method == "tools/call":
        params = request.get("params", {})
        call_request = ToolCallRequest(**params)
        result = await execute_tool_call(call_request)
        return {
            "jsonrpc": "2.0",
            "id": request.get("id"),
            "result": result.dict()
        }
    
    return {
        "jsonrpc": "2.0",
        "id": request.get("id"),
        "error": {
            "code": -32601,
            "message": "Method not found"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 8. Discovery Endpoints & URLs

### 8.1 Standard Discovery URLs

| Endpoint | Purpose | Standard |
|----------|---------|----------|
| `/.well-known/ai-tools.json` | AI tool discovery | Emerging convention |
| `/.well-known/openapi.json` | OpenAPI specification | RFC 8615 |
| `/mcp` | MCP JSON-RPC endpoint | MCP Specification |
| `/ai/discover` | Custom AI discovery | Application-specific |
| `/api/v1/tools` | RESTful tools list | Application-specific |

### 8.2 llms.txt Standard

An emerging convention for making websites AI-discoverable:

**File location:** `https://example.com/llms.txt`

```
# Model Context Protocol

## Docs
- [Getting Started](https://example.com/docs/getting-started.md)
- [API Reference](https://example.com/docs/api.md)

## Tools
- name: search_products
  description: Search the product catalog
  endpoint: https://api.example.com/v1/search
  
- name: create_order  
  description: Place an order
  endpoint: https://api.example.com/v1/orders

## Resources
- [Product Catalog](https://example.com/data/products.json)
- [Documentation](https://example.com/docs/)
```

### 8.3 Well-Known URI Registration

According to RFC 8615, you can register custom well-known URIs for your service:

```
/.well-known/ai-tools.json
/.well-known/mcp
/.well-known/openapi.json
```

---

## 9. Making Your Web App AI-Agent Ready

### 9.1 Checklist

- [ ] **Expose tool schemas** via `/.well-known/ai-tools.json`
- [ ] **Implement MCP server** (stdio or HTTP transport)
- [ ] **Add OpenAPI specification** for structured API discovery
- [ ] **Use descriptive tool names** (snake_case recommended)
- [ ] **Write clear tool descriptions** for LLM consumption
- [ ] **Define strict JSON schemas** with proper types and constraints
- [ ] **Include examples** in schema descriptions
- [ ] **Implement error handling** with structured error responses
- [ ] **Add authentication** for tool execution (not discovery)
- [ ] **Provide rate limiting** on tool endpoints
- [ ] **Document side effects** clearly (read-only vs mutating)

### 9.2 Best Practices

1. **Naming Conventions:**
   - Use `snake_case` for tool names (e.g., `get_weather`, not `getWeather`)
   - Be descriptive: `search_products` not `query`
   - Group related tools: `user_create`, `user_delete`, `user_update`

2. **Schema Design:**
   - Always include `description` for every parameter
   - Use `enum` for constrained choices
   - Set `additionalProperties: false` for strict mode
   - Provide `examples` where helpful

3. **Security:**
   - Validate ALL tool inputs server-side
   - Implement rate limiting
   - Use authentication for execution, not discovery
   - Sanitize outputs before returning to LLM
   - Log tool usage for audit

4. **Error Handling:**
   - Return structured errors with `isError: true`
   - Include human-readable error messages
   - Provide actionable next steps when possible

### 9.3 Example Tool Schema Design

```json
{
  "name": "create_invoice",
  "title": "Create Invoice",
  "description": "Create a new invoice for a customer. Returns the invoice ID and payment URL. Requires 'billing' scope.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "customer_id": {
        "type": "string",
        "description": "Unique customer identifier (e.g., 'cust_12345')",
        "pattern": "^cust_[0-9]+$"
      },
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "description": {
              "type": "string",
              "description": "Line item description"
            },
            "amount": {
              "type": "number",
              "minimum": 0.01,
              "description": "Amount in dollars (e.g., 29.99)"
            },
            "quantity": {
              "type": "integer",
              "minimum": 1,
              "default": 1,
              "description": "Quantity ordered"
            }
          },
          "required": ["description", "amount"]
        }
      },
      "due_date": {
        "type": "string",
        "format": "date",
        "description": "Payment due date in YYYY-MM-DD format. Defaults to 30 days from now."
      }
    },
    "required": ["customer_id", "items"],
    "additionalProperties": false
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "invoice_id": { "type": "string" },
      "payment_url": { "type": "string", "format": "uri" },
      "total": { "type": "number" }
    },
    "required": ["invoice_id", "payment_url", "total"]
  }
}
```

---

## 10. Summary Table

| Aspect | MCP | OpenAI Functions | Anthropic Tools |
|--------|-----|-----------------|-----------------|
| **Protocol** | JSON-RPC 2.0 | REST API | REST API |
| **Transport** | stdio, HTTP/SSE | HTTP | HTTP |
| **Discovery** | `tools/list` | Static definition | Static definition |
| **Schema** | `inputSchema`/`outputSchema` | `parameters` | `input_schema` |
| **Invocation** | `tools/call` | `tool_calls` in response | `tool_use` block |
| **Result** | `ToolResult` | `role: "tool"` | `tool_result` block |
| **Strict Mode** | N/A | `strict: true` | `strict: true` |
| **Async** | Yes | Yes | Yes |
| **Multi-call** | Yes | Yes | Yes |
| **Standard** | Open standard | Proprietary | Proprietary |
| **Ecosystem** | Multi-vendor | OpenAI-only | Anthropic-only |

---

## 11. References

1. **Model Context Protocol Specification:** https://spec.modelcontextprotocol.io
2. **MCP Documentation:** https://modelcontextprotocol.io
3. **OpenAI Function Calling:** https://platform.openai.com/docs/guides/function-calling
4. **Anthropic Tool Use:** https://docs.anthropic.com/en/docs/build-with-claude/tool-use
5. **JSON Schema 2020-12:** https://json-schema.org/draft/2020-12
6. **RFC 8615 - Well-Known URIs:** https://tools.ietf.org/html/rfc8615
7. **llms.txt Convention:** https://llmstxt.org

---

*Research compiled: 2026-05-07*
*Covers: MCP v2025-06-18, OpenAI API v2, Anthropic API v2023-06-01*
