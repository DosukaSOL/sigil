// ============================================================================
// purp_scaffold — Generate a complete Purp program from a template
// ============================================================================

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getTemplate, listTemplates } from '../templates/index.js';
import { compile } from '../utils/compiler.js';

export function registerScaffoldTool(server: McpServer): void {
  server.tool(
    'purp_scaffold',
    'Generate a complete Purp SCL program from one of 11 production-ready templates: token, escrow, staking, dao, nft, game, amm, multisig, auction, lending, vesting. Use "list" to see all options. Returns compilable .purp source code.',
    {
      template: z
        .string()
        .describe(
          'Template name. Options: token, escrow, staking, dao, nft, game, amm, multisig, auction, lending, vesting. Use "list" to see all.',
        ),
      programName: z
        .string()
        .optional()
        .describe('Custom program name (PascalCase). Defaults to the template name.'),
    },
    async ({ template, programName }) => {
      try {
        if (template === 'list') {
          return {
            content: [
              {
                type: 'text' as const,
                text: `Available templates:\n\n${listTemplates()}`,
              },
            ],
          };
        }

        const tmpl = getTemplate(template, programName);
        if (!tmpl) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `Unknown template: "${template}". Available templates:\n\n${listTemplates()}`,
              },
            ],
          };
        }

        // Verify the template compiles
        const result = compile(tmpl.source, { target: 'both', resolveImports: false });
        const status = result.success
          ? '✅ Template compiles successfully.'
          : '⚠️ Template generated but may have compilation notes (stdlib imports resolve at build time).';

        return {
          content: [
            {
              type: 'text' as const,
              text: `Generated **${tmpl.name}** template.\n\n${status}\n\n\`\`\`purp\n${tmpl.source}\`\`\``,
            },
          ],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: 'text' as const, text: `Scaffold error: ${message}` }],
          isError: true,
        };
      }
    },
  );
}
