// ============================================================================
// solana_lookup — Look up Solana program IDs, errors, constants, sysvars
// ============================================================================

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  lookupProgram,
  lookupError,
  formatConstants,
  PROGRAM_IDS,
  SYSVARS,
  SECURITY_RULES,
} from '../knowledge/solana.js';

export function registerLookupTool(server: McpServer): void {
  server.tool(
    'solana_lookup',
    'Look up Solana program IDs, sysvar addresses, common error codes, runtime constants, and security best practices. Your go-to reference for Solana development.',
    {
      category: z
        .enum(['program', 'error', 'constants', 'sysvar', 'security', 'all'])
        .describe('What to look up: program IDs, error codes, constants, sysvars, security rules, or all programs'),
      query: z
        .string()
        .optional()
        .describe('Search query (e.g., "token", "metaplex", "insufficient funds"). Required for program and error lookups.'),
    },
    async ({ category, query }) => {
      try {
        if (category === 'program') {
          if (!query) {
            const list = Object.entries(PROGRAM_IDS)
              .map(([name, info]) => `- **${name}**: \`${info.address}\``)
              .join('\n');
            return { content: [{ type: 'text' as const, text: `## Known Solana Programs (${Object.keys(PROGRAM_IDS).length})\n\n${list}` }] };
          }
          const result = lookupProgram(query);
          if (result) return { content: [{ type: 'text' as const, text: result }] };
          return { content: [{ type: 'text' as const, text: `No program found matching "${query}". Try: token, metaplex, jupiter, system, memo, pyth, drift, squads, raydium, orca.` }] };
        }

        if (category === 'error') {
          if (!query) {
            const list = Object.keys(
              await import('../knowledge/solana.js').then((m) => m.COMMON_ERRORS),
            )
              .map((name) => `- ${name}`)
              .join('\n');
            return { content: [{ type: 'text' as const, text: `## Common Solana Errors\n\n${list}\n\nProvide a query to get details on a specific error.` }] };
          }
          const result = lookupError(query);
          if (result) return { content: [{ type: 'text' as const, text: result }] };
          return { content: [{ type: 'text' as const, text: `No error found matching "${query}". Try: insufficient funds, missing signature, account not initialized, program failed, blockhash expired.` }] };
        }

        if (category === 'constants') {
          return { content: [{ type: 'text' as const, text: `## Solana Runtime Constants\n\n${formatConstants()}` }] };
        }

        if (category === 'sysvar') {
          const list = Object.entries(SYSVARS)
            .map(([name, info]) => `- **${name}**: \`${info.address}\`\n  ${info.description}`)
            .join('\n');
          return { content: [{ type: 'text' as const, text: `## Solana Sysvars\n\n${list}` }] };
        }

        if (category === 'security') {
          const rules = SECURITY_RULES.map(
            (r) => `### ${r.severity.toUpperCase()}: ${r.rule}\n${r.description}\n**Fix:** ${r.fix}`,
          ).join('\n\n');
          return { content: [{ type: 'text' as const, text: `## Solana Security Best Practices (${SECURITY_RULES.length} rules)\n\n${rules}` }] };
        }

        if (category === 'all') {
          const list = Object.entries(PROGRAM_IDS)
            .map(([name, info]) => `| ${name} | \`${info.address}\` | ${info.description} |`)
            .join('\n');
          return {
            content: [
              {
                type: 'text' as const,
                text: `## All Known Solana Programs\n\n| Program | Address | Description |\n|---|---|---|\n${list}`,
              },
            ],
          };
        }

        return { content: [{ type: 'text' as const, text: 'Unknown category.' }] };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: 'text' as const, text: `Lookup error: ${message}` }], isError: true };
      }
    },
  );
}
