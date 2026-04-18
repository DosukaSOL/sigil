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

        for (const node of ast.body as any[]) {
          if (node.kind !== 'ProgramDeclaration') continue;
          sections.push(`# Program: \`${node.name}\`\n`);

          const body = node.body ?? [];
          const accounts = body.filter((n: any) => n.kind === 'AccountDeclaration');
          const instructions = body.filter((n: any) => n.kind === 'InstructionDeclaration');
          const events = body.filter((n: any) => n.kind === 'EventDeclaration');
          const errors = body.filter((n: any) => n.kind === 'ErrorDeclaration');

          if (accounts.length > 0) {
            sections.push(`## Accounts (${accounts.length})\n`);
            for (const acc of accounts) {
              const fields = (acc.fields ?? [])
                .map((f: any) => `  - \`${f.name}\`: ${typeName(f)}`)
                .join('\n');
              sections.push(`**${acc.name}**\n${fields || '  (no fields)'}`);
            }
          }

          if (instructions.length > 0) {
            sections.push(`\n## Instructions (${instructions.length})\n`);
            for (const ix of instructions) {
              const accountSig = (ix.accounts ?? [])
                .map((p: any) => formatAccountParam(p))
                .join(', ');
              const dataSig = (ix.params ?? [])
                .map((p: any) => `${p.name}: ${typeName(p)}`)
                .join(', ');
              const sig = [accountSig, dataSig].filter(Boolean).join(', ');
              const vis = ix.visibility === 'pub' ? 'pub ' : '';
              sections.push(
                `**${vis}${ix.name}**(${sig})\n${describeInstructionBody(ix.body)}`,
              );
            }
          }

          if (events.length > 0) {
            sections.push(`\n## Events (${events.length})\n`);
            for (const ev of events) {
              const fields = (ev.fields ?? [])
                .map((f: any) => `\`${f.name}: ${typeName(f)}\``)
                .join(', ');
              sections.push(`- **${ev.name}**: ${fields || '(no fields)'}`);
            }
          }

          if (errors.length > 0) {
            sections.push(`\n## Errors (${errors.length})\n`);
            for (const err of errors) {
              const variants = (err.variants ?? [])
                .map((v: any) => {
                  const code = v.code !== undefined ? ` (code ${v.code})` : '';
                  return `- \`${v.name}\`${code}: "${v.message ?? v.value ?? ''}"`;
                })
                .join('\n');
              sections.push(`**${err.name}**\n${variants || '  (no variants)'}`);
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

// ----- helpers -----

function typeName(node: any): string {
  // Field/Param shape: { type: { kind: 'PrimitiveType'|'TypeReference', name: string } }
  // Fallback: legacy `typeAnnotation.name`.
  const t = node?.type ?? node?.typeAnnotation;
  if (!t) return 'unknown';
  if (typeof t === 'string') return t;
  return t.name ?? t.kind ?? 'unknown';
}

function formatAccountParam(p: any): string {
  const constraints: string[] = (p.constraints ?? []).map(
    (c: any) => `#[${c.kind}]`,
  );
  const kind = p.accountType?.kind === 'Signer' ? 'signer' : 'account';
  const attrs = constraints.length > 0 ? constraints.join(' ') + ' ' : '';
  return `${attrs}${kind} ${p.name}`;
}

function describeInstructionBody(body: any[] | undefined): string {
  if (!body || body.length === 0) return '  (empty body)';

  const lines: string[] = [];
  for (const stmt of body) {
    switch (stmt.kind) {
      case 'AssignmentStatement':
      case 'AssignmentExpression':
        lines.push('  - Updates account state');
        break;
      case 'EmitStatement': {
        const name = stmt.event?.name ?? stmt.event ?? stmt.name ?? 'unknown';
        lines.push(`  - Emits event \`${name}\``);
        break;
      }
      case 'AssertStatement':
        lines.push('  - Validates a condition (assert)');
        break;
      case 'IfStatement':
        lines.push('  - Branches on a condition');
        break;
      case 'ForStatement':
      case 'WhileStatement':
        lines.push('  - Loop');
        break;
      case 'ReturnStatement':
        lines.push('  - Returns a value');
        break;
      case 'LetStatement':
      case 'VariableDeclaration':
        lines.push(`  - Declares local \`${stmt.name ?? '?'}\``);
        break;
      case 'CallExpression':
      case 'CallStatement':
        lines.push('  - Calls a function');
        break;
      default:
        lines.push(`  - ${stmt.kind}`);
    }
  }
  return lines.join('\n');
}
