// ============================================================================
// Sigil v1.0 — MCP Server for AI-Powered Solana Development
// Main entry point: registers tools, resources, prompts, and starts transport
// ============================================================================

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerCompileTool } from './tools/compile.js';
import { registerLintTool } from './tools/lint.js';
import { registerScaffoldTool } from './tools/scaffold.js';
import { registerExplainTool } from './tools/explain.js';
import { registerCheckTool } from './tools/check.js';
import { registerFixTool } from './tools/fix.js';
import { registerLookupTool } from './tools/lookup.js';
import { registerAccountSizeTool } from './tools/account-size.js';
import { registerOptimizeTool } from './tools/optimize.js';
import { registerDiffTool } from './tools/diff.js';
import { registerAuditTool } from './tools/audit.js';
import { registerResources } from './resources/index.js';
import { registerPrompts } from './prompts/index.js';

const server = new McpServer(
  {
    name: 'sigil',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
    instructions: `Sigil is an MCP server that gives AI agents the power to build, compile, lint, audit, and optimize Solana programs using Purp SCL.

Purp is a high-level Solana Compiled Language that compiles .purp source files into:
- Pinocchio-powered Rust (ready to deploy as Solana programs)
- TypeScript SDK (auto-generated client code)
- IDL (Interface Definition Language)

## Tools (11)

### Build & Compile
- **purp_compile** — Compile .purp source code to Rust, TypeScript, and IDL
- **purp_scaffold** — Generate a complete program from 11 templates (token, escrow, staking, dao, nft, game, amm, multisig, auction, lending, vesting)
- **purp_fix** — Auto-fix common issues (typos, formatting, missing commas/braces)

### Analyze & Understand
- **purp_explain** — Explain what a Purp program does in plain language
- **purp_lint** — Lint with 15 Solana-specific rules
- **purp_check** — Type-check without generating output
- **purp_diff** — Compare two program versions and explain structural changes

### Security & Optimization
- **purp_audit** — Comprehensive security audit (signer auth, overflow, reinitialization, PDA validation, CPI)
- **purp_optimize** — Performance analysis with grade (compute units, account sizes, transaction limits)
- **purp_account_size** — Calculate byte sizes and rent-exempt costs for all accounts

### Solana Reference
- **solana_lookup** — Look up program IDs, error codes, constants, sysvars, and security rules

## Resources (5)
- **purp-language-reference** — Complete Purp syntax guide
- **solana-program-ids** — 22 known program addresses (System, Token, Metaplex, Jupiter, etc.)
- **solana-constants** — Runtime limits (compute, accounts, transactions, rent, PDA, CPI)
- **solana-errors** — 12 common error codes with fixes
- **security-checklist** — 10 security rules rated by severity

## Prompts (4)
- **build_program** — Guided workflow to build a new program from description
- **audit_program** — Step-by-step security audit with checklist
- **explain_solana** — Explain any Solana concept with Purp examples
- **migrate_to_purp** — Migrate Anchor/Rust programs to Purp SCL

## Purp Syntax Quick Reference
- Programs: \`program MyProgram { ... }\`
- Accounts: \`account MyAccount { field: type, ... }\`
- Instructions: \`pub instruction my_fn(#[mut] signer user, #[init] account data, amount: u64) { ... }\`
- Events: \`event MyEvent { field: type }\`
- Errors: \`error MyErrors { NotFound = "Not found", ... }\`
- Types: u8–u128, i8–i128, f32, f64, bool, string, pubkey, bytes
- Assert: \`assert(condition, "message")\`
- Emit: \`emit EventName(arg1, arg2)\`
- Clock: \`Clock.slot\`, \`Clock.unix_timestamp\`
- Import: \`import { Token } from "@purp/stdlib"\``,
  },
);

// Register all tools
registerCompileTool(server);
registerLintTool(server);
registerScaffoldTool(server);
registerExplainTool(server);
registerCheckTool(server);
registerFixTool(server);
registerLookupTool(server);
registerAccountSizeTool(server);
registerOptimizeTool(server);
registerDiffTool(server);
registerAuditTool(server);

// Register resources and prompts
registerResources(server);
registerPrompts(server);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
