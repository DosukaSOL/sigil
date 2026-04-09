<p align="center">
  <img src="./logo.svg" alt="Sigil Logo" width="180" />
</p>

<h1 align="center">Sigil</h1>
<h3 align="center">AI-Powered Solana Development via MCP</h3>

<p align="center">
  Give any AI agent the power to write, compile, lint, and scaffold Solana programs.<br/>
  Built on <a href="https://github.com/DosukaSOL/purp-scl">Purp SCL</a> — the Solana-native programming language.
</p>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-7C3AED?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/tests-18%20passing-22C55E?style=flat-square" alt="Tests" />
  <img src="https://img.shields.io/badge/tools-6%20MCP%20tools-6366F1?style=flat-square" alt="Tools" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/MCP-compatible-14F195?style=flat-square" alt="MCP" />
</p>

<p align="center">
  <a href="#quickstart">Quickstart</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#tools">Tools</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#templates">Templates</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#how-it-works">How It Works</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#demo">Demo</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#contributing">Contributing</a>
</p>

<br/>

<p align="center">
  <a href="https://solana.com">
    <img src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png" alt="Built for Solana" width="28" style="vertical-align: middle;" />
  </a>
  &nbsp;&nbsp;
  <strong>Built for <a href="https://solana.com">Solana</a></strong>
  &nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="https://modelcontextprotocol.io">
    <strong>Model Context Protocol</strong>
  </a>
  &nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="https://github.com/DosukaSOL/purp-scl">
    <strong>Powered by Purp</strong>
  </a>
</p>

---

## What is Sigil?

**Sigil** is an [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that gives AI agents — Claude, GPT, Cursor, Windsurf, or any MCP-compatible client — the ability to **write, compile, lint, type-check, fix, and scaffold** Solana programs using [Purp SCL](https://github.com/DosukaSOL/purp-scl).

Instead of pasting code back and forth, your AI can directly invoke Solana development tools in real time:

```
You: "Build me a staking program with lock periods and reward claiming"
AI:  → calls purp_scaffold(template: "staking", programName: "SolStake")
     → returns compilable .purp source code
     → calls purp_compile(source: ...)
     → returns Pinocchio Rust + TypeScript SDK + IDL
```

### Why Sigil?

| Problem | Sigil Solution |
|---|---|
| AI can't compile Solana code | `purp_compile` outputs deployment-ready Rust |
| AI hallucinate invalid programs | `purp_check` + `purp_lint` catch errors instantly |
| Starting from scratch is slow | `purp_scaffold` generates complete programs from templates |
| AI doesn't understand Solana specifics | 15 Solana-specific lint rules catch real bugs |
| No structured Solana output | Returns Rust, TypeScript SDK, and IDL in one call |

## Quickstart

### 1. Clone & Install

```bash
git clone https://github.com/DosukaSOL/sigil.git && cd sigil
git clone https://github.com/DosukaSOL/purp-scl.git "../Purp (SCL)"
cd "../Purp (SCL)" && npm install && npm run build && cd ../sigil
npm install
```

### 2. Configure MCP Client

Add Sigil to your MCP client configuration:

<details>
<summary><strong>Claude Desktop</strong></summary>

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sigil": {
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "cwd": "/path/to/sigil"
    }
  }
}
```
</details>

<details>
<summary><strong>VS Code (Copilot / Continue)</strong></summary>

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "sigil": {
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "cwd": "/path/to/sigil"
    }
  }
}
```
</details>

<details>
<summary><strong>Cursor</strong></summary>

Add to Cursor MCP settings:

```json
{
  "mcpServers": {
    "sigil": {
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "cwd": "/path/to/sigil"
    }
  }
}
```
</details>

### 3. Start Using

Once configured, your AI agent can use all 6 Sigil tools automatically. Just ask it to build Solana programs!

## Tools

Sigil exposes **6 MCP tools** that any AI agent can call:

### `purp_compile`
Compile `.purp` source code into Pinocchio Rust, TypeScript SDK, and IDL.

| Parameter | Type | Description |
|---|---|---|
| `source` | `string` | The `.purp` source code to compile |
| `target` | `"rust" \| "typescript" \| "both"` | Output targets (default: `both`) |

**Returns:** Compiled Rust, TypeScript SDK, IDL, and optional frontend code.

### `purp_lint`
Lint `.purp` code with **15 Solana-specific rules** — catches unsafe patterns, missing validations, and common bugs.

| Parameter | Type | Description |
|---|---|---|
| `source` | `string` | The `.purp` source code to lint |

**Returns:** Errors, warnings, and suggestions with line numbers.

### `purp_check`
Type-check `.purp` code without generating output. Fast validation pass.

| Parameter | Type | Description |
|---|---|---|
| `source` | `string` | The `.purp` source code to check |

**Returns:** Pass/fail with error details.

### `purp_scaffold`
Generate a complete Purp program from a template.

| Parameter | Type | Description |
|---|---|---|
| `template` | `string` | Template name or `"list"` to see all |
| `programName` | `string?` | Custom program name (PascalCase) |

**Returns:** Complete, compilable `.purp` source code.

### `purp_explain`
Parse a program and return a structured, plain-language explanation.

| Parameter | Type | Description |
|---|---|---|
| `source` | `string` | The `.purp` source code to explain |

**Returns:** Accounts, instructions, events, errors, and data flow description.

### `purp_fix`
Auto-fix common issues: typos, missing commas, trailing whitespace, unbalanced braces.

| Parameter | Type | Description |
|---|---|---|
| `source` | `string` | The `.purp` source code to fix |

**Returns:** Fixed code with a list of applied fixes.

## Templates

Sigil includes **6 production-ready templates** covering common Solana program patterns:

| Template | Description | Accounts | Instructions |
|---|---|---|---|
| **token** | SPL Token with mint, transfer, burn, freeze | TokenVault | 5 |
| **escrow** | Trustless P2P escrow for trades | Escrow | 4 |
| **staking** | Staking pool with rewards and lock periods | StakePool, StakeInfo | 4 |
| **dao** | DAO governance with proposals and voting | DAO, Proposal, Member | 5 |
| **nft** | NFT collection with mint, list, and buy | Collection, NftMetadata | 5 |
| **game** | On-chain game with scores and rounds | GameState, Player | 5 |

Each template includes events, error enums, and proper account validation — ready to compile and deploy.

## How It Works

```
┌─────────────────────────────────────────────────┐
│                  AI Agent                        │
│         (Claude, GPT, Cursor, etc.)              │
└──────────────────┬──────────────────────────────┘
                   │ MCP Protocol (stdio)
                   ▼
┌──────────────────────────────────────────────────┐
│                  Sigil MCP Server                 │
│                                                   │
│  ┌────────────┐ ┌────────────┐ ┌──────────────┐  │
│  │  compile   │ │   lint     │ │   scaffold   │  │
│  └──────┬─────┘ └──────┬─────┘ └──────┬───────┘  │
│  ┌──────┴─────┐ ┌──────┴─────┐ ┌──────┴───────┐  │
│  │   check    │ │  explain   │ │     fix      │  │
│  └──────┬─────┘ └──────┬─────┘ └──────┬───────┘  │
│         └──────────────┼──────────────┘           │
│                        ▼                          │
│              ┌──────────────────┐                 │
│              │   Purp Compiler  │                 │
│              └────────┬─────────┘                 │
│                       ▼                           │
│         ┌──────────────────────────┐              │
│         │  Lexer → Parser → AST   │              │
│         │  → Semantic → Codegen   │              │
│         └──────────┬───────────────┘              │
└────────────────────┼─────────────────────────────┘
                     ▼
        ┌────────────────────────┐
        │     Generated Output   │
        │                        │
        │  • Pinocchio Rust      │
        │  • TypeScript SDK      │
        │  • IDL (JSON)          │
        │  • Frontend (React)    │
        └────────────────────────┘
```

## Demo

### Compile a Token Program

```
User: "Create a token program called SolGold with minting and burning"

AI calls purp_scaffold:
  template: "token"
  programName: "SolGold"

→ Returns complete .purp source

AI calls purp_compile:
  source: <generated source>
  target: "both"

→ Returns:
  • Pinocchio Rust (ready for cargo-build-sbf)
  • TypeScript SDK (ready for @solana/web3.js)
  • IDL (JSON interface definition)
```

### Lint & Fix Code

```
User: "Check this program for issues"

AI calls purp_lint:
  source: <user's code>

→ Returns:
  ⚠️ warning (line 12:5): Signer not checked — missing ownership validation
  ❌ error (line 18:3): Account field 'balance' used but never initialized
  ⚠️ warning (line 25:1): Unused variable 'temp'

AI calls purp_fix:
  source: <user's code>

→ Returns fixed code with applied fixes
```

## Purp SCL

Sigil is powered by [**Purp SCL**](https://github.com/DosukaSOL/purp-scl) — a Solana-native programming language that compiles `.purp` files into deployment-ready Rust, TypeScript, and frontend code.

A quick taste of Purp syntax:

```
program MyToken {
  account Vault {
    authority: pubkey,
    balance: u64
  }

  pub instruction deposit(
    #[mut] signer user,
    #[mut] account vault,
    amount: u64
  ) {
    assert(vault.authority == user, "Unauthorized");
    vault.balance += amount;
    emit Deposited(user, amount);
  }

  event Deposited { user: pubkey, amount: u64 }
}
```

This compiles to ~200 lines of Pinocchio Rust with account validation, Borsh serialization, and instruction dispatch — plus a TypeScript SDK.

## Project Structure

```
sigil/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── tools/
│   │   ├── compile.ts        # purp_compile tool
│   │   ├── lint.ts           # purp_lint tool
│   │   ├── check.ts          # purp_check tool
│   │   ├── scaffold.ts       # purp_scaffold tool
│   │   ├── explain.ts        # purp_explain tool
│   │   └── fix.ts            # purp_fix tool
│   ├── templates/
│   │   └── index.ts          # 6 program templates
│   └── utils/
│       └── compiler.ts       # Purp compiler bridge
├── tests/
│   └── sigil.test.ts         # 18 tests across 3 suites
├── logo.svg
├── package.json
├── tsconfig.json
└── README.md
```

## Tech Stack

- **[Model Context Protocol](https://modelcontextprotocol.io)** — Open standard for AI ↔ tool communication
- **[Purp SCL](https://github.com/DosukaSOL/purp-scl)** — Solana-native programming language & compiler
- **[Pinocchio](https://github.com/anza-xyz/pinocchio)** — Lightweight Solana program framework (Rust output)
- **[Solana](https://solana.com)** — High-performance blockchain
- **TypeScript** — Server implementation
- **Zod** — Runtime schema validation for tool parameters

## Development

```bash
# Type-check
npx tsc --noEmit

# Run tests
npm test

# Build
npm run build

# Start server (stdio)
npm start
```

## Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a feature branch
3. Add tests for new functionality
4. Submit a PR

## License

[MIT](LICENSE) — built with love for the Solana ecosystem.

---

<p align="center">
  <strong>Sigil</strong> — Give your AI the power to build on Solana.<br/>
  <a href="https://github.com/DosukaSOL/purp-scl">Purp SCL</a> · <a href="https://modelcontextprotocol.io">MCP</a> · <a href="https://solana.com">Solana</a>
</p>
