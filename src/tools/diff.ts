// ============================================================================
// purp_diff — Compare two versions of a Purp program and explain changes
// ============================================================================

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { tokenizeAndParse } from '../utils/compiler.js';

export function registerDiffTool(server: McpServer): void {
  server.tool(
    'purp_diff',
    'Compare two versions of a Purp program. Identifies added, removed, and modified accounts, instructions, events, and errors.',
    {
      before: z.string().describe('The original .purp source code'),
      after: z.string().describe('The updated .purp source code'),
    },
    async ({ before, after }) => {
      try {
        const oldAst = tokenizeAndParse(before).ast;
        const newAst = tokenizeAndParse(after).ast;

        const oldProg = extractProgram(oldAst);
        const newProg = extractProgram(newAst);

        if (!oldProg && !newProg) {
          return {
            content: [{ type: 'text' as const, text: 'No program declarations found in either version.' }],
          };
        }

        const changes: string[] = [];

        // Program name change
        if (oldProg?.name !== newProg?.name) {
          changes.push(`### Program Renamed\n- Before: \`${oldProg?.name ?? '(none)'}\`\n- After: \`${newProg?.name ?? '(none)'}\``);
        }

        // Diff each category
        diffCategory('Account', oldProg?.accounts ?? [], newProg?.accounts ?? [], changes);
        diffCategory('Instruction', oldProg?.instructions ?? [], newProg?.instructions ?? [], changes);
        diffCategory('Event', oldProg?.events ?? [], newProg?.events ?? [], changes);
        diffCategory('Error', oldProg?.errors ?? [], newProg?.errors ?? [], changes);

        if (changes.length === 0) {
          return {
            content: [{ type: 'text' as const, text: 'No structural differences found between the two versions.' }],
          };
        }

        const summary =
          `## Program Diff: \`${oldProg?.name ?? '?'}\` → \`${newProg?.name ?? '?'}\`\n\n` +
          changes.join('\n\n');

        return { content: [{ type: 'text' as const, text: summary }] };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: 'text' as const, text: `Diff error: ${message}` }], isError: true };
      }
    },
  );
}

interface ProgramInfo {
  name: string;
  accounts: NamedItem[];
  instructions: NamedItem[];
  events: NamedItem[];
  errors: NamedItem[];
}

interface NamedItem {
  name: string;
  fields: string[];
}

function extractProgram(ast: any): ProgramInfo | null {
  const prog = ast.body.find((n: any) => n.kind === 'ProgramDeclaration');
  if (!prog) return null;

  const body = prog.body ?? [];
  return {
    name: prog.name,
    accounts: extractItems(body, 'AccountDeclaration'),
    instructions: extractItems(body, 'InstructionDeclaration'),
    events: extractItems(body, 'EventDeclaration'),
    errors: extractItems(body, 'ErrorDeclaration'),
  };
}

function extractItems(body: any[], kind: string): NamedItem[] {
  return body
    .filter((n: any) => n.kind === kind)
    .map((n: any) => ({
      name: n.name ?? '(anonymous)',
      fields: (n.fields ?? n.params ?? n.variants ?? []).map(
        (f: any) => `${f.name}: ${f.typeAnnotation?.name ?? f.accountType ?? f.value ?? '?'}`,
      ),
    }));
}

function diffCategory(
  label: string,
  oldItems: NamedItem[],
  newItems: NamedItem[],
  changes: string[],
): void {
  const oldNames = new Set(oldItems.map((i) => i.name));
  const newNames = new Set(newItems.map((i) => i.name));

  // Added
  for (const item of newItems) {
    if (!oldNames.has(item.name)) {
      changes.push(`### ➕ ${label} Added: \`${item.name}\`\n- Fields: ${item.fields.join(', ') || '(none)'}`);
    }
  }

  // Removed
  for (const item of oldItems) {
    if (!newNames.has(item.name)) {
      changes.push(`### ➖ ${label} Removed: \`${item.name}\`\n- Had: ${item.fields.join(', ') || '(none)'}`);
    }
  }

  // Modified
  for (const oldItem of oldItems) {
    const newItem = newItems.find((i) => i.name === oldItem.name);
    if (!newItem) continue;

    const oldFieldStr = oldItem.fields.join(', ');
    const newFieldStr = newItem.fields.join(', ');
    if (oldFieldStr !== newFieldStr) {
      const addedFields = newItem.fields.filter((f) => !oldItem.fields.includes(f));
      const removedFields = oldItem.fields.filter((f) => !newItem.fields.includes(f));
      let detail = `### ✏️ ${label} Modified: \`${oldItem.name}\``;
      if (addedFields.length > 0) detail += `\n- Added: ${addedFields.join(', ')}`;
      if (removedFields.length > 0) detail += `\n- Removed: ${removedFields.join(', ')}`;
      changes.push(detail);
    }
  }
}
