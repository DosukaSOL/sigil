// ============================================================================
// purp_compile — Compile .purp source to Rust + TypeScript + IDL
// ============================================================================

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { compile } from '../utils/compiler.js';

export function registerCompileTool(server: McpServer): void {
  server.tool(
    'purp_compile',
    'Compile Purp SCL source code into Pinocchio Rust, TypeScript SDK, and IDL. Returns all generated outputs.',
    {
      source: z.string().describe('The .purp source code to compile'),
      target: z
        .enum(['rust', 'typescript', 'both'])
        .default('both')
        .describe('Which output targets to generate'),
    },
    async ({ source, target }) => {
      try {
        const result = compile(source, { target, resolveImports: false });

        if (!result.success) {
          const errors = result.diagnostics
            .getErrors()
            .map((d) => {
              const loc = d.location ? ` (line ${d.location.line}:${d.location.column})` : '';
              return `• ${d.description}${loc}`;
            })
            .join('\n');

          return {
            content: [
              {
                type: 'text' as const,
                text: `Compilation failed with ${result.diagnostics.getErrors().length} error(s):\n\n${errors}`,
              },
            ],
          };
        }

        const sections: string[] = [];

        if (result.rust) {
          sections.push(`## Rust (Pinocchio)\n\n\`\`\`rust\n${result.rust}\n\`\`\``);
        }
        if (result.typescript) {
          sections.push(`## TypeScript SDK\n\n\`\`\`typescript\n${result.typescript}\n\`\`\``);
        }
        if (result.idl) {
          sections.push(`## IDL\n\n\`\`\`json\n${result.idl}\n\`\`\``);
        }
        if (result.frontend) {
          sections.push(`## Frontend\n\n\`\`\`tsx\n${result.frontend}\n\`\`\``);
        }

        const warnings = result.diagnostics.getWarnings();
        if (warnings.length > 0) {
          const warnText = warnings.map((w) => `• ${w.description}`).join('\n');
          sections.push(`## Warnings\n\n${warnText}`);
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: `Compilation successful.\n\n${sections.join('\n\n---\n\n')}`,
            },
          ],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: 'text' as const, text: `Compilation error: ${message}` }],
          isError: true,
        };
      }
    },
  );
}
