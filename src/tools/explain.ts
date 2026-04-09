// ============================================================================
// purp_explain — Explain what a .purp program does in plain language
// ============================================================================

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { tokenizeAndParse } from '../utils/compiler.js';

export function registerExplainTool(server: McpServer): void {
  server.tool(
    'purp_explain',
    'Parse a Purp SCL program and return a plain-language explanation of its structure: accounts, instructions, events, errors, and data flow.',
    {
      source: z.string().describe('The .purp source code to explain'),
    },
    async ({ source }) => {
      try {
        const { ast } = tokenizeAndParse(source);
        const sections: string[] = [];

        for (const node of ast.body) {
          if ((node as any).kind === 'ProgramDeclaration') {
            sections.push(`# Program: \`${(node as any).name}\`\n`);

            const accounts = (node as any).body.filter((n: any) => n.kind === 'AccountDeclaration');
            const instructions = (node as any).body.filter((n: any) => n.kind === 'InstructionDeclaration');
            const events = (node as any).body.filter((n: any) => n.kind === 'EventDeclaration');
            const errors = (node as any).body.filter((n: any) => n.kind === 'ErrorDeclaration');

            if (accounts.length > 0) {
              sections.push(`## Accounts (${accounts.length})\n`);
              for (const acc of accounts) {
                const fields = (acc as any).fields
                  ?.map((f: any) => `  - \`${f.name}\`: ${f.typeAnnotation?.name ?? f.typeAnnotation?.type ?? 'unknown'}`)
                  .join('\n');
                sections.push(`**${(acc as any).name}**\n${fields ?? '  (no fields)'}`);
              }
            }

            if (instructions.length > 0) {
              sections.push(`\n## Instructions (${instructions.length})\n`);
              for (const ix of instructions) {
                const params = (ix as any).params
                  ?.map((p: any) => {
                    const attrs = p.attributes?.map((a: any) => `#[${a.name}]`).join(' ') ?? '';
                    const kind = p.accountType ?? '';
                    return `${attrs} ${kind} ${p.name}`.trim();
                  })
                  .join(', ');
                const vis = (ix as any).isPublic ? 'pub ' : '';
                sections.push(
                  `**${vis}${(ix as any).name}**(${params ?? ''})\n` +
                    describeInstructionBody((ix as any).body),
                );
              }
            }

            if (events.length > 0) {
              sections.push(`\n## Events (${events.length})\n`);
              for (const ev of events) {
                const fields = (ev as any).fields
                  ?.map((f: any) => `\`${f.name}\``)
                  .join(', ');
                sections.push(`- **${(ev as any).name}**: ${fields ?? '(no fields)'}`);
              }
            }

            if (errors.length > 0) {
              sections.push(`\n## Errors (${errors.length})\n`);
              for (const err of errors) {
                const variants = (err as any).variants
                  ?.map((v: any) => `- \`${v.name}\` = "${v.message}"`)
                  .join('\n');
                sections.push(`**${(err as any).name}**\n${variants ?? '  (no variants)'}`);
              }
            }
          }
        }

        if (sections.length === 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: 'No program declaration found. Make sure your code starts with `program MyProgram { ... }`.',
              },
            ],
          };
        }

        return {
          content: [{ type: 'text' as const, text: sections.join('\n') }],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: 'text' as const, text: `Explain error: ${message}` }],
          isError: true,
        };
      }
    },
  );
}

function describeInstructionBody(body: any[]): string {
  if (!body || body.length === 0) return '  Empty body.';

  const descriptions: string[] = [];

  for (const stmt of body) {
    if (stmt.type === 'AssignmentStatement' || stmt.type === 'AssignmentExpression') {
      descriptions.push('  - Sets account data');
    } else if (stmt.type === 'EmitStatement') {
      descriptions.push(`  - Emits event \`${stmt.event ?? stmt.name ?? 'unknown'}\``);
    } else if (stmt.type === 'AssertStatement') {
      descriptions.push('  - Validates a condition (assert)');
    } else if (stmt.type === 'IfStatement') {
      descriptions.push('  - Conditional logic');
    } else if (stmt.type === 'ForStatement' || stmt.type === 'WhileStatement') {
      descriptions.push('  - Loop');
    } else if (stmt.type === 'ReturnStatement') {
      descriptions.push('  - Returns a value');
    } else if (stmt.type === 'VariableDeclaration') {
      descriptions.push('  - Declares a local variable');
    }
  }

  return descriptions.length > 0 ? descriptions.join('\n') : '  - Contains logic';
}
