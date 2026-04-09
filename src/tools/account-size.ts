// ============================================================================
// purp_account_size — Calculate account sizes and rent costs
// ============================================================================

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { tokenizeAndParse } from '../utils/compiler.js';
import { calculateRent, TYPE_SIZES, CONSTANTS } from '../knowledge/solana.js';

export function registerAccountSizeTool(server: McpServer): void {
  server.tool(
    'purp_account_size',
    'Calculate the byte size and rent-exempt cost (in SOL and lamports) for each account in a Purp program. Essential for deployment cost estimation.',
    {
      source: z.string().describe('The .purp source code containing account declarations'),
    },
    async ({ source }) => {
      try {
        const { ast } = tokenizeAndParse(source);
        const results: string[] = [];
        let totalBytes = 0;
        let totalLamports = 0;

        for (const node of ast.body) {
          const accounts = getAccounts(node);
          for (const acc of accounts) {
            const name = (acc as any).name;
            const fields = (acc as any).fields ?? [];

            // 8 bytes discriminator + field sizes
            let dataSize = 8;
            const fieldDetails: string[] = [];

            for (const field of fields) {
              const typeName = getTypeName(field);
              const size = TYPE_SIZES[typeName] ?? 36; // default to 36 for unknown types
              dataSize += size;
              fieldDetails.push(`  - \`${(field as any).name}\`: ${typeName} (${size} bytes)`);
            }

            const rent = calculateRent(dataSize);
            totalBytes += dataSize;
            totalLamports += rent.lamports;

            results.push(
              `### ${name}\n` +
                `- Data size: **${dataSize} bytes** (8 discriminator + ${dataSize - 8} fields)\n` +
                `- Total with header: **${rent.totalSize} bytes**\n` +
                `- Rent-exempt: **${rent.lamports.toLocaleString()} lamports** (${rent.sol.toFixed(6)} SOL)\n` +
                `- Fields:\n${fieldDetails.join('\n')}`,
            );
          }
        }

        if (results.length === 0) {
          return {
            content: [{ type: 'text' as const, text: 'No account declarations found in the provided code.' }],
          };
        }

        const totalRent = calculateRent(totalBytes);
        const summary =
          `## Account Size & Rent Analysis\n\n` +
          results.join('\n\n') +
          `\n\n---\n\n### Summary\n` +
          `- Total accounts: **${results.length}**\n` +
          `- Combined data: **${totalBytes} bytes**\n` +
          `- Total rent: **${totalLamports.toLocaleString()} lamports** (${(totalLamports / 1_000_000_000).toFixed(6)} SOL)\n` +
          `\n*Rent calculation: ${CONSTANTS.rent.LAMPORTS_PER_BYTE_YEAR} lamports/byte/year × ${CONSTANTS.rent.EXEMPTION_THRESHOLD_YEARS} years × (data + ${CONSTANTS.rent.ACCOUNT_HEADER_SIZE} byte header)*`;

        return { content: [{ type: 'text' as const, text: summary }] };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: 'text' as const, text: `Account size error: ${message}` }], isError: true };
      }
    },
  );
}

function getAccounts(node: any): any[] {
  if (node.kind === 'ProgramDeclaration') {
    return (node.body ?? []).filter((n: any) => n.kind === 'AccountDeclaration');
  }
  if (node.kind === 'AccountDeclaration') return [node];
  return [];
}

function getTypeName(field: any): string {
  const ta = field.typeAnnotation;
  if (!ta) return 'unknown';
  if (ta.name) return ta.name;
  if (ta.kind === 'TypeReference') return ta.name ?? 'unknown';
  return 'unknown';
}
