// ============================================================================
// purp_check — Type-check .purp source without generating output
// ============================================================================

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { check } from '../utils/compiler.js';

export function registerCheckTool(server: McpServer): void {
  server.tool(
    'purp_check',
    'Type-check Purp SCL source code without generating any output files. Fast validation pass.',
    {
      source: z.string().describe('The .purp source code to type-check'),
    },
    async ({ source }) => {
      try {
        const result = check(source);

        if (result.success) {
          return {
            content: [{ type: 'text' as const, text: 'Type-check passed. No errors found.' }],
          };
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: `Type-check failed with ${result.errors.length} error(s):\n\n${result.errors.map((e) => `• ${e}`).join('\n')}`,
            },
          ],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: 'text' as const, text: `Check error: ${message}` }],
          isError: true,
        };
      }
    },
  );
}
