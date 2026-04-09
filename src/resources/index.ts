// ============================================================================
// MCP Resources — Static reference documents for AI agents
// ============================================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { PROGRAM_IDS, SYSVARS, CONSTANTS, COMMON_ERRORS, SECURITY_RULES, TYPE_SIZES, formatConstants } from '../knowledge/solana.js';

export function registerResources(server: McpServer): void {
  // ---- Purp Language Reference ----
  server.resource(
    'purp-language-reference',
    'sigil://docs/purp-reference',
    { description: 'Complete Purp SCL language reference — syntax, types, declarations, and built-in features.', mimeType: 'text/markdown' },
    async () => ({
      contents: [
        {
          uri: 'sigil://docs/purp-reference',
          mimeType: 'text/markdown',
          text: PURP_REFERENCE,
        },
      ],
    }),
  );

  // ---- Solana Program ID Registry ----
  server.resource(
    'solana-program-ids',
    'sigil://docs/solana-programs',
    { description: 'All known Solana program IDs — System, Token, Metaplex, Jupiter, Raydium, Orca, Drift, and more.', mimeType: 'text/markdown' },
    async () => {
      const rows = Object.entries(PROGRAM_IDS)
        .map(([name, info]) => `| ${name} | \`${info.address}\` | ${info.description} | [Docs](${info.docs}) |`)
        .join('\n');
      const sysvars = Object.entries(SYSVARS)
        .map(([name, info]) => `| ${name} | \`${info.address}\` | ${info.description} |`)
        .join('\n');
      return {
        contents: [
          {
            uri: 'sigil://docs/solana-programs',
            mimeType: 'text/markdown',
            text:
              `# Solana Program ID Registry\n\n` +
              `## Programs (${Object.keys(PROGRAM_IDS).length})\n\n` +
              `| Name | Address | Description | Docs |\n|---|---|---|---|\n${rows}\n\n` +
              `## Sysvars (${Object.keys(SYSVARS).length})\n\n` +
              `| Name | Address | Description |\n|---|---|---|\n${sysvars}`,
          },
        ],
      };
    },
  );

  // ---- Solana Constants & Limits ----
  server.resource(
    'solana-constants',
    'sigil://docs/solana-constants',
    { description: 'Solana runtime constants — account limits, transaction sizes, compute units, PDA rules, CPI limits, and rent parameters.', mimeType: 'text/markdown' },
    async () => ({
      contents: [
        {
          uri: 'sigil://docs/solana-constants',
          mimeType: 'text/markdown',
          text:
            `# Solana Runtime Constants\n\n${formatConstants()}\n\n` +
            `### Rent\n\n` +
            `| Parameter | Value |\n|---|---|\n` +
            `| Lamports per byte per year | ${CONSTANTS.rent.LAMPORTS_PER_BYTE_YEAR} |\n` +
            `| Exemption threshold | ${CONSTANTS.rent.EXEMPTION_THRESHOLD_YEARS} years |\n` +
            `| Account header size | ${CONSTANTS.rent.ACCOUNT_HEADER_SIZE} bytes |\n` +
            `| Formula | \`(data_size + ${CONSTANTS.rent.ACCOUNT_HEADER_SIZE}) × ${CONSTANTS.rent.LAMPORTS_PER_BYTE_YEAR} × ${CONSTANTS.rent.EXEMPTION_THRESHOLD_YEARS}\` |\n\n` +
            `### Type Sizes (Borsh-encoded)\n\n` +
            `| Type | Bytes |\n|---|---|\n` +
            Object.entries(TYPE_SIZES)
              .map(([type, size]) => `| ${type} | ${size} |`)
              .join('\n'),
        },
      ],
    }),
  );

  // ---- Solana Error Reference ----
  server.resource(
    'solana-errors',
    'sigil://docs/solana-errors',
    { description: 'Common Solana error codes with explanations and fix suggestions.', mimeType: 'text/markdown' },
    async () => {
      const rows = Object.entries(COMMON_ERRORS)
        .map(([name, info]) => `### ${name} (\`${info.code}\`)\n- **Meaning:** ${info.meaning}\n- **Fix:** ${info.fix}`)
        .join('\n\n');
      return {
        contents: [
          {
            uri: 'sigil://docs/solana-errors',
            mimeType: 'text/markdown',
            text: `# Common Solana Errors\n\n${rows}`,
          },
        ],
      };
    },
  );

  // ---- Security Checklist ----
  server.resource(
    'security-checklist',
    'sigil://docs/security-checklist',
    { description: 'Solana program security checklist — critical, high, and medium severity rules.', mimeType: 'text/markdown' },
    async () => {
      const rules = SECURITY_RULES.map(
        (r, i) =>
          `### ${i + 1}. [${r.severity.toUpperCase()}] ${r.rule}\n- **Check:** ${r.description}\n- **Fix:** ${r.fix}`,
      ).join('\n\n');
      return {
        contents: [
          {
            uri: 'sigil://docs/security-checklist',
            mimeType: 'text/markdown',
            text:
              `# Solana Security Checklist\n\n` +
              `${SECURITY_RULES.filter((r) => r.severity === 'critical').length} critical, ` +
              `${SECURITY_RULES.filter((r) => r.severity === 'high').length} high, ` +
              `${SECURITY_RULES.filter((r) => r.severity === 'medium').length} medium severity rules.\n\n${rules}`,
          },
        ],
      };
    },
  );
}

// ---- Purp Language Reference (static content) ----
const PURP_REFERENCE = `# Purp SCL Language Reference

Purp is a high-level Solana Compiled Language that compiles to:
- **Rust** (Pinocchio framework) — ready to deploy on Solana
- **TypeScript SDK** — auto-generated client code
- **IDL** — Interface Definition Language for interoperability

## Programs

\`\`\`purp
program MyProgram {
  // accounts, instructions, events, errors
}
\`\`\`

## Accounts

Define on-chain data structures:

\`\`\`purp
account MyAccount {
  authority: pubkey,
  balance: u64,
  name: string,
  is_active: bool
}
\`\`\`

## Instructions

Define entry points. Parameters are accounts or data:

\`\`\`purp
pub instruction transfer(
  #[mut] signer from,       // mutable signer account
  #[mut] account vault,     // mutable data account
  #[init] account new_acc,  // initialize new account
  amount: u64               // instruction data
) {
  assert(vault.authority == from, "Unauthorized");
  vault.balance -= amount;
  emit Transferred(from, amount);
}
\`\`\`

### Account Attributes
- \`#[mut]\` — account is writable
- \`#[init]\` — create and initialize the account

### Account Types
- \`signer\` — must sign the transaction
- \`account\` — program-owned data account

## Types

| Type | Size | Description |
|------|------|-------------|
| u8, u16, u32, u64, u128 | 1-16 bytes | Unsigned integers |
| i8, i16, i32, i64, i128 | 1-16 bytes | Signed integers |
| f32, f64 | 4-8 bytes | Floating point |
| bool | 1 byte | Boolean |
| string | 4 + len bytes | Variable-length string |
| pubkey | 32 bytes | Solana public key |
| bytes | Variable | Raw byte array |

## Events

Emit events for off-chain indexing:

\`\`\`purp
event Transfer { from: pubkey, to: pubkey, amount: u64 }

// In an instruction:
emit Transfer(from, to, amount);
\`\`\`

## Errors

Define custom error codes:

\`\`\`purp
error MyErrors {
  Unauthorized = "You are not authorized",
  InsufficientFunds = "Not enough balance",
  AlreadyInitialized = "Account already exists"
}
\`\`\`

## Assertions

\`\`\`purp
assert(condition, "Error message");
\`\`\`

## Built-in References

- \`Clock.slot\` — current slot number
- \`Clock.unix_timestamp\` — unix timestamp

## Imports

\`\`\`purp
import { Token } from "@purp/stdlib";
\`\`\`

## Client Code

Auto-generated TypeScript client:

\`\`\`purp
client {
  async fn transfer(from: pubkey, amount: u64) {
    // client-side logic
  }
}
\`\`\`

## Frontend

Optional frontend declarations:

\`\`\`purp
frontend {
  page "/" {
    component App {
      state balance: u64 = 0;
    }
  }
}
\`\`\`
`;
