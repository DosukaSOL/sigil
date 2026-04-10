// ============================================================================
// purp_optimize — Suggest compute & size optimizations for Purp programs
// ============================================================================

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { tokenizeAndParse } from '../utils/compiler.js';
import { TYPE_SIZES, CONSTANTS } from '../knowledge/solana.js';

export function registerOptimizeTool(server: McpServer): void {
  server.tool(
    'purp_optimize',
    'Analyze a Purp program and suggest optimizations for compute units, account size, transaction size, and overall efficiency.',
    {
      source: z.string().describe('The .purp source code to optimize'),
    },
    async ({ source }) => {
      try {
        const { ast } = tokenizeAndParse(source);
        const suggestions: string[] = [];
        let score = 100;

        for (const node of ast.body) {
          if ((node as any).kind !== 'ProgramDeclaration') continue;
          const body = (node as any).body ?? [];

          const accounts = body.filter((n: any) => n.kind === 'AccountDeclaration');
          const instructions = body.filter((n: any) => n.kind === 'InstructionDeclaration');

          // Check 1: Large accounts
          for (const acc of accounts) {
            const fields = (acc as any).fields ?? [];
            let size = 8; // discriminator
            let stringCount = 0;
            for (const f of fields) {
              const typeName = f.type?.name ?? f.typeAnnotation?.name ?? 'unknown';
              const fieldSize = TYPE_SIZES[typeName] ?? 36;
              size += fieldSize;
              if (typeName === 'string') stringCount++;
            }
            if (size > 512) {
              suggestions.push(
                `**Account \`${(acc as any).name}\`** is ${size} bytes — consider splitting into multiple accounts to reduce rent costs.`,
              );
              score -= 10;
            }
            if (stringCount >= 3) {
              suggestions.push(
                `**Account \`${(acc as any).name}\`** has ${stringCount} string fields. Strings use variable-length Borsh encoding — consider using fixed-size \`[u8; N]\` for predictable sizing.`,
              );
              score -= 5;
            }
          }

          // Check 2: Instruction complexity
          for (const ix of instructions) {
            const ixAccounts = (ix as any).accounts ?? [];
            const ixParams = (ix as any).params ?? [];
            const allParams = [...ixAccounts, ...ixParams];
            const mutAccounts = ixAccounts.filter(
              (p: any) => p.accountType?.mutable === true || p.constraints?.some((c: any) => c.kind === 'mut'),
            );
            const initAccounts = ixAccounts.filter(
              (p: any) => p.constraints?.some((c: any) => c.kind === 'init'),
            );

            if (allParams.length > 8) {
              suggestions.push(
                `**Instruction \`${(ix as any).name}\`** has ${allParams.length} parameters — may exceed transaction size limit (${CONSTANTS.transactions.PACKET_DATA_SIZE.value} bytes). Consider splitting into multiple instructions.`,
              );
              score -= 15;
            }

            if (mutAccounts.length > 4) {
              suggestions.push(
                `**Instruction \`${(ix as any).name}\`** has ${mutAccounts.length} mutable accounts — each write lock costs ${CONSTANTS.compute.WRITE_LOCK_UNITS.value} CUs. Minimize mutable accounts where possible.`,
              );
              score -= 5;
            }

            if (initAccounts.length > 2) {
              suggestions.push(
                `**Instruction \`${(ix as any).name}\`** creates ${initAccounts.length} accounts in one call — each account creation adds a CPI to System Program (${CONSTANTS.compute.CPI_INVOCATION_COST.value} CUs). Consider batching differently.`,
              );
              score -= 5;
            }

            // Check for assert statements (estimate compute)
            const bodyCode = source.substring(
              (ix as any).location?.start ?? 0,
              (ix as any).location?.end ?? source.length,
            );
            const assertCount = (bodyCode.match(/\bassert\(/g) || []).length;
            if (assertCount > 5) {
              suggestions.push(
                `**Instruction \`${(ix as any).name}\`** has ${assertCount} assert statements — consider consolidating related checks to reduce branching overhead.`,
              );
              score -= 3;
            }
          }

          // Check 3: Missing events (hinders indexing)
          const events = body.filter((n: any) => n.kind === 'EventDeclaration');
          if (instructions.length > 0 && events.length === 0) {
            suggestions.push(
              `Program has **no events** — add events to enable off-chain indexing and transaction monitoring. Every state-changing instruction should emit an event.`,
            );
            score -= 10;
          }

          // Check 4: Missing error definitions
          const errors = body.filter((n: any) => n.kind === 'ErrorDeclaration');
          if (errors.length === 0 && instructions.length > 0) {
            suggestions.push(
              `Program has **no custom errors** — add an error block for descriptive error messages instead of raw assert strings.`,
            );
            score -= 5;
          }

          // Check 5: Too many accounts
          if (accounts.length > 8) {
            suggestions.push(
              `Program defines **${accounts.length} account types** — consider using Address Lookup Tables for transactions that reference many accounts (max ${CONSTANTS.transactions.MAX_ACCOUNTS_PER_TRANSACTION.value} per tx).`,
            );
            score -= 5;
          }
        }

        score = Math.max(0, Math.min(100, score));
        const grade =
          score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

        if (suggestions.length === 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `## Optimization Report — Grade: ${grade} (${score}/100)\n\nNo optimization issues found. Program looks efficient.`,
              },
            ],
          };
        }

        const report =
          `## Optimization Report — Grade: ${grade} (${score}/100)\n\n` +
          `Found **${suggestions.length}** suggestion(s):\n\n` +
          suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n\n') +
          `\n\n---\n\n*Compute budget: up to ${CONSTANTS.compute.MAX_CU_PER_TRANSACTION.value.toLocaleString()} CUs per transaction, ${CONSTANTS.compute.DEFAULT_INSTRUCTION_CU_LIMIT.value.toLocaleString()} CUs default per instruction.*`;

        return { content: [{ type: 'text' as const, text: report }] };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: 'text' as const, text: `Optimize error: ${message}` }], isError: true };
      }
    },
  );
}
