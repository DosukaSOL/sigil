// ============================================================================
// Sigil — MCP Server for AI-Powered Solana Development
// Main entry point: registers tools and starts stdio transport
// ============================================================================

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerCompileTool } from './tools/compile.js';
import { registerLintTool } from './tools/lint.js';
import { registerScaffoldTool } from './tools/scaffold.js';
import { registerExplainTool } from './tools/explain.js';
import { registerCheckTool } from './tools/check.js';
import { registerFixTool } from './tools/fix.js';

const server = new McpServer(
  {
    name: 'sigil',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
    instructions: `Sigil gives you the power to build Solana programs using Purp SCL.

Purp is a high-level language that compiles .purp source files into:
- Pinocchio-powered Rust (ready to deploy as Solana programs)
- TypeScript SDK (auto-generated client code)
- Frontend UI components
- IDL (Interface Definition Language)

Available tools:
- purp_compile: Compile .purp source code to Rust, TypeScript, and IDL
- purp_lint: Lint .purp code with 15 Solana-specific rules
- purp_scaffold: Generate a complete Purp program from a template
- purp_check: Type-check .purp code without generating output
- purp_explain: Explain what a .purp program does in plain language
- purp_fix: Auto-fix common issues in .purp code

Purp syntax basics:
- Programs: program MyProgram { ... }
- Accounts: account MyAccount { field: type, ... }
- Instructions: pub instruction my_fn(#[mut] signer user, #[init] account data, amount: u64) { ... }
- Events: event MyEvent { field: type }
- Errors: error MyErrors { NotFound = "Not found", ... }
- Types: u8-u128, i8-i128, f32, f64, bool, string, pubkey, bytes
- Client: client { async fn getData(...) { ... } }
- Frontend: frontend { page "/" { component App { ... } } }
- Imports: import { Token } from "@purp/stdlib"`,
  },
);

// Register all tools
registerCompileTool(server);
registerLintTool(server);
registerScaffoldTool(server);
registerExplainTool(server);
registerCheckTool(server);
registerFixTool(server);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
