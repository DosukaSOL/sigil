<p align="center">
  <img src="./logo.svg" alt="Sigil Logo" width="180" />
</p>

<h1 align="center">Sigil</h1>
<h3 align="center">AI-Powered Solana Development via MCP</h3>

<p align="center">
  Give any AI agent the power to build, compile, lint, audit, and optimize Solana programs.<br/>
  Built on <a href="https://github.com/DosukaSOL/purp-scl">Purp SCL</a> — the Solana-native programming language.
</p>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-7C3AED?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/tests-45%20passing-22C55E?style=flat-square" alt="Tests" />
  <img src="https://img.shields.io/badge/tools-11%20MCP%20tools-6366F1?style=flat-square" alt="Tools" />
  <img src="https://img.shields.io/badge/templates-11-F59E0B?style=flat-square" alt="Templates" />
  <img src="https://img.shields.io/badge/resources-5-14B8A6?style=flat-square" alt="Resources" />
  <img src="https://img.shields.io/badge/prompts-4-EC4899?style=flat-square" alt="Prompts" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/MCP-compatible-14F195?style=flat-square" alt="MCP" />
</p>

<p align="center">
  <a href="#quickstart">Quickstart</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#tools">Tools</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#templates">Templates</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#resources">Resources</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#prompts">Prompts</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#knowledge-base">Knowledge Base</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#how-it-works">How It Works</a>
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

**Sigil** is an [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that gives AI agents — Claude, GPT, Cursor, Windsurf, or any MCP-compatible client — the ability to **build, compile, lint, audit, optimize, and scaffold** Solana programs using [Purp SCL](https://github.com/DosukaSOL/purp-scl).

Instead of pasting code back and forth, your AI can directly invoke Solana development tools in real time:

```
You: "Build me a lending protocol with collateral and liquidation"
AI:  → calls purp_scaffold(template: "lending", programName: "SolLend")
     → calls purp_compile(source: ...) → Pinocchio Rust + TypeScript SDK + IDL
     → calls purp_audit(source: ...) → security report (0 critical findings)
     → calls purp_account_size(source: ...) → rent costs: 0.003 SOL
     → calls purp_optimize(source: ...) → Grade A (95/100)
```

### Why Sigil?

| Problem | Sigil Solution |
|---|---|
| AI can't compile Solana code | `purp_compile` outputs deployment-ready Pinocchio Rust |
| AI hallucinates invalid programs | `purp_check` + `purp_lint` catch errors instantly |
| Starting from scratch is slow | `purp_scaffold` generates from 11 templates |
| No security review | `purp_audit` checks 10 vulnerability classes |
| Unknown deployment costs | `purp_account_size` calculates exact rent in lamports/SOL |
| No Solana reference data | `solana_lookup` has 22 program IDs, 12 error codes, all constants |
| AI doesn't know Solana limits | 5 embedded resources with runtime constants, type sizes, security rules |

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

Once configured, your AI agent automatically discovers all 11 tools, 5 resources, and 4 prompts. Just ask it to build Solana programs!

## Tools

Sigil exposes **11 MCP tools** organized in four categories:

### Build & Compile

| Tool | Description |
|---|---|
| `purp_compile` | Compile `.purp` to Pinocchio Rust + TypeScript SDK + IDL |
| `purp_scaffold` | Generate complete programs from 11 templates |
| `purp_fix` | Auto-fix typos, formatting, missing commas, unbalanced braces |

### Analyze & Understand

| Tool | Description |
|---|---|
| `purp_explain` | Plain-language explanation of a program's structure |
| `purp_lint` | Lint with 15 Solana-specific rules |
| `purp_check` | Type-check without generating output |
| `purp_diff` | Compare two program versions, show structural changes |

### Security & Optimization

| Tool | Description |
|---|---|
| `purp_audit` | Security audit: signer auth, overflow, reinitialization, PDA, CPI |
| `purp_optimize` | Performance analysis with letter grade (compute, size, limits) |
| `purp_account_size` | Calculate byte sizes and rent-exempt costs for all accounts |

### Solana Reference

| Tool | Description |
|---|---|
| `solana_lookup` | Look up 22 program IDs, 12 error codes, constants, sysvars, security rules |

### Tool Parameters

<details>
<summary><code>purp_compile</code></summary>

| Parameter | Type | Description |
|---|---|---|
| `source` | `string` | The `.purp` source code to compile |
| `target` | `"rust" \| "typescript" \| "both"` | Output targets (default: `both`) |
</details>

<details>
<summary><code>purp_scaffold</code></summary>

| Parameter | Type | Description |
|---|---|---|
| `template` | `string` | Template name or `"list"` to see all |
| `programName` | `string?` | Custom program name (PascalCase) |
</details>

<details>
<summary><code>purp_audit</code></summary>

| Parameter | Type | Description |
|---|---|---|
| `source` | `string` | The `.purp` source code to audit |

Checks for: signer authorization, owner verification, arithmetic overflow, account reinitialization, PDA validation, close-account drain, rent checks, duplicate mutable accounts, integer truncation, CPI privilege escalation.
</details>

<details>
<summary><code>purp_optimize</code></summary>

| Parameter | Type | Description |
|---|---|---|
| `source` | `string` | The `.purp` source code to optimize |

Returns a letter grade (A–F) with suggestions for: large accounts, string fields, instruction complexity, write locks, missing events/errors.
</details>

<details>
<summary><code>purp_account_size</code></summary>

| Parameter | Type | Description |
|---|---|---|
| `source` | `string` | The `.purp` source code to analyze |

Returns per-account: data size, total with header, rent-exempt cost in lamports and SOL.
</details>

<details>
<summary><code>purp_diff</code></summary>

| Parameter | Type | Description |
|---|---|---|
| `before` | `string` | Original `.purp` source |
| `after` | `string` | Updated `.purp` source |

Shows added, removed, and modified accounts, instructions, events, and errors.
</details>

<details>
<summary><code>solana_lookup</code></summary>

| Parameter | Type | Description |
|---|---|---|
| `category` | `"program" \| "error" \| "constants" \| "sysvar" \| "security" \| "all"` | What to look up |
| `query` | `string?` | Search query (e.g., "token", "metaplex", "insufficient funds") |
</details>

## Templates

Sigil includes **11 production-ready templates** covering the most common Solana program patterns:

| Template | Description | Accounts | Instructions | Aliases |
|---|---|---|---|---|
| **token** | SPL Token with mint, transfer, burn, freeze | 1 | 5 | `spl`, `spltoken` |
| **escrow** | Trustless P2P escrow for trades | 1 | 4 | `trade`, `swap` |
| **staking** | Staking pool with rewards and lock periods | 2 | 4 | `stake`, `rewards` |
| **dao** | DAO governance with proposals and voting | 3 | 5 | `governance`, `vote` |
| **nft** | NFT collection with mint, list, and buy | 2 | 5 | `collection`, `mint` |
| **game** | On-chain game with scores and rounds | 2 | 5 | `gaming`, `onchain` |
| **amm** | AMM/DEX with liquidity pools and swaps | 2 | 5 | `dex`, `lp` |
| **multisig** | Multi-signature wallet with threshold approval | 3 | 5 | `safe`, `wallet` |
| **auction** | Timed auction with bidding and settlement | 2 | 5 | `bid`, `auctionhouse` |
| **lending** | Lending/borrowing with collateral & liquidation | 3 | 6 | `borrow`, `defi` |
| **vesting** | Token vesting with cliff and linear unlock | 1 | 4 | `vest`, `cliff` |

Every template includes events, custom error enums, authority checks, and proper account validation.

## Resources

Sigil provides **5 MCP resources** — static reference documents that AI agents can read for context:

| Resource | URI | Description |
|---|---|---|
| **Purp Language Reference** | `sigil://docs/purp-reference` | Complete syntax guide — programs, accounts, instructions, types, events, errors |
| **Solana Program IDs** | `sigil://docs/solana-programs` | 22 known program addresses with descriptions and docs links |
| **Solana Constants** | `sigil://docs/solana-constants` | Runtime limits — compute units, account sizes, transaction limits, rent, PDA, CPI |
| **Solana Errors** | `sigil://docs/solana-errors` | 12 common error codes with meanings and fix suggestions |
| **Security Checklist** | `sigil://docs/security-checklist` | 10 security rules rated by severity (critical/high/medium) |

## Prompts

Sigil includes **4 MCP prompts** — guided workflows that AI agents can invoke:

| Prompt | Description | Parameters |
|---|---|---|
| **build_program** | Step-by-step program building workflow | `description`, `template?` |
| **audit_program** | Comprehensive security audit with checklist | `source` |
| **explain_solana** | Explain any Solana concept with Purp examples | `concept` |
| **migrate_to_purp** | Migrate Anchor/Rust programs to Purp SCL | `anchor_code` |

### Prompt Examples

```
build_program:
  description: "A token staking pool with 7-day lock and 5% APY"
  template: "staking"
  → Guides through: scaffold → customize → compile → lint → audit → optimize

audit_program:
  source: <your .purp code>
  → Runs automated audit + manual checklist review → structured report

explain_solana:
  concept: "PDAs"
  → Detailed explanation with Purp code examples and relevant constants

migrate_to_purp:
  anchor_code: <your Anchor Rust code>
  → Maps Anchor types to Purp syntax → compiles → verifies
```

## Knowledge Base

Sigil embeds a comprehensive **Solana knowledge base** that powers the lookup tool, audit, and optimizer:

| Data | Count | Examples |
|---|---|---|
| **Program IDs** | 22 | System, Token, Token2022, ATA, Metaplex, Jupiter, Raydium, Orca, Drift, Squads, Pyth |
| **Sysvars** | 7 | Clock, Rent, EpochSchedule, RecentBlockhashes, StakeHistory, Instructions, SlotHashes |
| **Constants** | 25+ | MAX_ACCOUNT_DATA_LEN (10 MiB), PACKET_DATA_SIZE (1,232 B), MAX_CU (1.4M), LAMPORTS_PER_SIGNATURE (5,000) |
| **Error Codes** | 12 | AccountNotInitialized, InsufficientFunds, MissingSignature, BlockhashExpired |
| **Security Rules** | 10 | signer-auth, owner-check, overflow, reinitialization, PDA validation, CPI escalation |
| **Type Sizes** | 16 | u8=1B, u64=8B, pubkey=32B, string=36B |
| **Rent Calculator** | — | `(data + 128 header) × 3,480 lamports/byte/year × 2 years` |

## How It Works

```
┌─────────────────────────────────────────────────────┐
│                    AI Agent                          │
│          (Claude, GPT, Cursor, Windsurf)             │
└──────────────────┬──────────────────────────────────┘
                   │ MCP Protocol (stdio)
                   ▼
┌──────────────────────────────────────────────────────┐
│                Sigil v1.0 MCP Server                  │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │            11 Tools                              │  │
│  │  compile · lint · check · scaffold · explain     │  │
│  │  fix · lookup · audit · optimize · diff · size   │  │
│  └─────────────────────┬───────────────────────────┘  │
│  ┌────────────────┐ ┌──┴─────────────┐ ┌───────────┐ │
│  │  5 Resources   │ │  4 Prompts     │ │ Knowledge │ │
│  │  purp-ref      │ │  build_program │ │ 22 IDs    │ │
│  │  program-ids   │ │  audit_program │ │ 12 errors │ │
│  │  constants     │ │  explain       │ │ 10 rules  │ │
│  │  errors        │ │  migrate       │ │ constants │ │
│  │  security      │ │                │ │ rent calc │ │
│  └────────────────┘ └────────────────┘ └───────────┘ │
│                        │                              │
│              ┌─────────▼──────────┐                   │
│              │   Purp Compiler    │                   │
│              │  Lexer → Parser    │                   │
│              │  → AST → Codegen   │                   │
│              └─────────┬──────────┘                   │
└────────────────────────┼─────────────────────────────┘
                         ▼
           ┌──────────────────────────┐
           │     Generated Output     │
           │                          │
           │  • Pinocchio Rust        │
           │  • TypeScript SDK        │
           │  • IDL (JSON)            │
           └──────────────────────────┘
```

## Demo

### Build → Audit → Deploy Flow

```
User: "Create a token vesting schedule with 30-day cliff"

AI calls purp_scaffold:
  template: "vesting"
  programName: "SolVest"
→ Complete .purp source with cliff + linear unlock

AI calls purp_compile:
  source: <generated>
  target: "both"
→ Pinocchio Rust + TypeScript SDK + IDL

AI calls purp_audit:
  source: <generated>
→ ✅ PASS — No critical findings
→ 1 medium: account reinitialization (auto-handled by #[init])

AI calls purp_account_size:
  source: <generated>
→ VestingSchedule: 145 bytes, rent: 1,900,080 lamports (0.001900 SOL)

AI calls purp_optimize:
  source: <generated>
→ Grade A (95/100) — No optimization issues
```

### Security Audit Flow

```
User: "Audit this program for security issues"

AI calls purp_audit:
→ 3 findings: 1 critical, 1 high, 1 medium
  🔴 CRITICAL: signer-authorization — instruction modifies state without signer
  🟠 HIGH: arithmetic-overflow — unchecked math on token amounts
  🟡 MEDIUM: missing-events — no events for state changes

AI calls purp_fix:
→ Applies auto-fixes, reports remaining manual fixes needed
```

## Purp SCL

Sigil is powered by [**Purp SCL**](https://github.com/DosukaSOL/purp-scl) — a Solana-native programming language that compiles `.purp` files into deployment-ready Rust, TypeScript, and IDL.

```purp
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

  error Errors {
    Unauthorized = "You are not the vault authority"
  }
}
```

This compiles to ~200 lines of Pinocchio Rust with account validation, Borsh serialization, and instruction dispatch — plus a TypeScript SDK.

## Project Structure

```
sigil/
├── src/
│   ├── index.ts              # MCP server entry — registers everything
│   ├── tools/
│   │   ├── compile.ts        # purp_compile
│   │   ├── lint.ts           # purp_lint
│   │   ├── check.ts          # purp_check
│   │   ├── scaffold.ts       # purp_scaffold
│   │   ├── explain.ts        # purp_explain
│   │   ├── fix.ts            # purp_fix
│   │   ├── lookup.ts         # solana_lookup
│   │   ├── account-size.ts   # purp_account_size
│   │   ├── optimize.ts       # purp_optimize
│   │   ├── diff.ts           # purp_diff
│   │   └── audit.ts          # purp_audit
│   ├── templates/
│   │   └── index.ts          # 11 program templates
│   ├── resources/
│   │   └── index.ts          # 5 MCP resources
│   ├── prompts/
│   │   └── index.ts          # 4 MCP prompts
│   ├── knowledge/
│   │   └── solana.ts         # Solana knowledge base
│   └── utils/
│       └── compiler.ts       # Purp compiler bridge
├── tests/
│   └── sigil.test.ts         # 45 tests across 6 suites
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

# Run tests (45 tests, 6 suites)
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
  <strong>Sigil v1.0</strong> — Give your AI the power to build on Solana.<br/>
  <a href="https://github.com/DosukaSOL/purp-scl">Purp SCL</a> · <a href="https://modelcontextprotocol.io">MCP</a> · <a href="https://solana.com">Solana</a>
</p>
