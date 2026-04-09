// ============================================================================
// purp_lint — Lint .purp source with 15 Solana-specific rules
// ============================================================================

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { lint } from '../utils/compiler.js';

export function registerLintTool(server: McpServer): void {
  server.tool(
    'purp_lint',
    'Lint Purp SCL source code with 15 Solana-specific rules. Returns errors, warnings, and suggestions.',
    {
      source: z.string().describe('The .purp source code to lint'),
    },
    async ({ source }) => {
      try {
        const result = lint(source);

        if (result.errors === 0 && result.warnings === 0 && result.infos === 0) {
          return {
            content: [{ type: 'text' as const, text: 'No issues found. Code looks clean.' }],
          };
        }

        const allDiags = result.diagnostics.getAll();
        const lines = allDiags.map((d) => {
          const loc = d.location ? ` (line ${d.location.line}:${d.location.column})` : '';
          const icon =
            d.severity === 'error' ? '❌' : d.severity === 'warning' ? '⚠️' : 'ℹ️';
          return `${icon} ${d.severity}${loc}: ${d.description}`;
        });

        const summary = [
          result.errors > 0 ? `${result.errors} error(s)` : null,
          result.warnings > 0 ? `${result.warnings} warning(s)` : null,
          result.infos > 0 ? `${result.infos} info(s)` : null,
        ]
          .filter(Boolean)
          .join(', ');

        return {
          content: [
            {
              type: 'text' as const,
              text: `Lint results: ${summary}\n\n${lines.join('\n')}`,
            },
          ],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: 'text' as const, text: `Lint error: ${message}` }],
          isError: true,
        };
      }
    },
  );
}
