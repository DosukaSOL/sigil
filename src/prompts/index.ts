// ============================================================================
// MCP Prompts — Guided workflows for AI agents
// ============================================================================

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { listTemplates } from '../templates/index.js';
import { SECURITY_RULES } from '../knowledge/solana.js';

export function registerPrompts(server: McpServer): void {
  // ---- Build Program Prompt ----
  server.prompt(
    'build_program',
    'Guided workflow to build a new Solana program with Purp SCL. Describe what you want and Sigil will help you scaffold, compile, lint, audit, and optimize it.',
    {
      description: z.string().describe('What should the program do? E.g., "A token staking pool with 7-day lock and 5% APY"'),
      template: z.string().optional().describe(`Optional starting template: ${Object.keys(getTemplateNames()).join(', ')}`),
    },
    async ({ description, template }) => {
      const steps = [
        `You are helping a developer build a Solana program using Purp SCL via the Sigil MCP server.`,
        ``,
        `## Requirements`,
        `The developer wants: **${description}**`,
        template ? `Starting from the **${template}** template.` : `No template was specified — choose the best match or start from scratch.`,
        ``,
        `## Available Templates`,
        listTemplates(),
        ``,
        `## Workflow`,
        `Follow these steps in order:`,
        ``,
        `1. **Scaffold** — Use \`purp_scaffold\` to generate the initial program from a template (if applicable)`,
        `2. **Customize** — Modify the generated code based on the requirements`,
        `3. **Compile** — Use \`purp_compile\` to verify it compiles to Rust + TypeScript`,
        `4. **Lint** — Use \`purp_lint\` to check for code quality issues`,
        `5. **Audit** — Use \`purp_audit\` to check for security vulnerabilities`,
        `6. **Optimize** — Use \`purp_optimize\` to check for performance issues`,
        `7. **Account Size** — Use \`purp_account_size\` to calculate rent costs`,
        `8. **Fix** — Use \`purp_fix\` to auto-fix any issues found`,
        `9. **Explain** — Use \`purp_explain\` to summarize the final program`,
        ``,
        `## Guidelines`,
        `- Every instruction that modifies state must have a signer`,
        `- Add authority checks (assert) to prevent unauthorized access`,
        `- Emit events for all state changes`,
        `- Define custom error types`,
        `- Keep accounts as small as possible to minimize rent`,
        `- Use checked arithmetic for token amounts`,
      ];

      return {
        messages: [
          {
            role: 'user' as const,
            content: { type: 'text' as const, text: steps.join('\n') },
          },
        ],
      };
    },
  );

  // ---- Audit Program Prompt ----
  server.prompt(
    'audit_program',
    'Run a comprehensive security audit on a Purp program. Provides a step-by-step review using Solana security best practices.',
    {
      source: z.string().describe('The .purp source code to audit'),
    },
    async ({ source }) => {
      const checklist = SECURITY_RULES.map(
        (r, i) => `${i + 1}. **[${r.severity.toUpperCase()}] ${r.rule}** — ${r.description}`,
      ).join('\n');

      return {
        messages: [
          {
            role: 'user' as const,
            content: {
              type: 'text' as const,
              text: [
                `You are performing a security audit on a Solana program written in Purp SCL.`,
                ``,
                `## Program Code`,
                '```purp',
                source,
                '```',
                ``,
                `## Audit Instructions`,
                ``,
                `1. First, use \`purp_audit\` to run the automated security analysis`,
                `2. Then manually review against this checklist:`,
                ``,
                checklist,
                ``,
                `3. Use \`purp_explain\` to understand the program structure`,
                `4. Use \`purp_account_size\` to check rent costs`,
                `5. Use \`purp_optimize\` to check for efficiency issues`,
                `6. Use \`solana_lookup\` with category "security" for detailed security rules`,
                ``,
                `## Output Format`,
                `Provide a structured audit report with:`,
                `- Executive summary (PASS / FAIL / NEEDS REVIEW)`,
                `- Findings sorted by severity (Critical → High → Medium)`,
                `- Specific fix suggestions with code examples`,
                `- Overall risk assessment`,
              ].join('\n'),
            },
          },
        ],
      };
    },
  );

  // ---- Explain Solana Concept Prompt ----
  server.prompt(
    'explain_solana',
    'Get a detailed explanation of a Solana concept with practical examples in Purp SCL.',
    {
      concept: z.string().describe('The Solana concept to explain (e.g., "PDAs", "CPIs", "rent", "token accounts", "compute budget")'),
    },
    async ({ concept }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: [
              `Explain the Solana concept: **${concept}**`,
              ``,
              `Use these Sigil tools to provide practical examples:`,
              `- \`solana_lookup\` — look up relevant program IDs, constants, or errors`,
              `- \`purp_scaffold\` — generate example code if relevant`,
              `- \`purp_explain\` — break down example programs`,
              ``,
              `Include:`,
              `1. What it is and why it matters`,
              `2. How it works on Solana`,
              `3. A practical Purp SCL code example`,
              `4. Common pitfalls and best practices`,
              `5. Relevant constants or limits from Solana runtime`,
            ].join('\n'),
          },
        },
      ],
    }),
  );

  // ---- Migrate from Anchor Prompt ----
  server.prompt(
    'migrate_to_purp',
    'Help migrate an Anchor/Rust Solana program to Purp SCL.',
    {
      anchor_code: z.string().describe('The Anchor Rust code to migrate'),
    },
    async ({ anchor_code }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: [
              `You are migrating a Solana program from Anchor/Rust to Purp SCL.`,
              ``,
              `## Original Anchor Code`,
              '```rust',
              anchor_code,
              '```',
              ``,
              `## Migration Instructions`,
              ``,
              `1. Identify all accounts, instructions, events, and errors`,
              `2. Map Anchor types → Purp types:`,
              `   - \`#[account]\` → \`account { ... }\``,
              `   - \`#[derive(Accounts)]\` → instruction parameters with attributes`,
              `   - \`#[account(mut)]\` → \`#[mut] account name\``,
              `   - \`#[account(init)]\` → \`#[init] account name\``,
              `   - \`Signer<'info>\` → \`signer name\``,
              `   - \`msg!()\` → \`emit EventName(...)\``,
              `   - \`require!()\` → \`assert(condition, "message")\``,
              `   - \`err!(ErrorCode::X)\` → \`error { X = "..." }\``,
              `3. Convert the program structure to Purp syntax`,
              `4. Use \`purp_compile\` to verify it compiles`,
              `5. Use \`purp_audit\` to verify security is preserved`,
              `6. Use \`purp_diff\` to compare if needed`,
              ``,
              `## Key Differences`,
              `- Purp uses Pinocchio (not Anchor) — 10x more efficient`,
              `- No framework overhead, direct BPF instructions`,
              `- Built-in events, errors, and client generation`,
            ].join('\n'),
          },
        },
      ],
    }),
  );
}

function getTemplateNames(): Record<string, boolean> {
  return { token: true, escrow: true, staking: true, dao: true, nft: true, game: true, amm: true, multisig: true, auction: true, lending: true, vesting: true };
}
