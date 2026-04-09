// ============================================================================
// purp_fix — Auto-fix common issues in .purp source code
// ============================================================================

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { lint, compile } from '../utils/compiler.js';

export function registerFixTool(server: McpServer): void {
  server.tool(
    'purp_fix',
    'Auto-fix common issues in Purp SCL source code: missing semicolons, trailing commas, uninitialized fields, and formatting problems.',
    {
      source: z.string().describe('The .purp source code to fix'),
    },
    async ({ source }) => {
      try {
        let fixed = source;
        const fixes: string[] = [];

        // Fix 1: Normalize line endings
        if (fixed.includes('\r\n')) {
          fixed = fixed.replace(/\r\n/g, '\n');
          fixes.push('Normalized line endings (CRLF → LF)');
        }

        // Fix 2: Remove trailing whitespace
        const beforeTrailing = fixed;
        fixed = fixed
          .split('\n')
          .map((line) => line.trimEnd())
          .join('\n');
        if (fixed !== beforeTrailing) {
          fixes.push('Removed trailing whitespace');
        }

        // Fix 3: Ensure trailing newline
        if (!fixed.endsWith('\n')) {
          fixed += '\n';
          fixes.push('Added trailing newline');
        }

        // Fix 4: Fix common typos in keywords
        const keywordFixes: [RegExp, string, string][] = [
          [/\bprogramm\b/g, 'program', 'Fixed typo: programm → program'],
          [/\binstuction\b/g, 'instruction', 'Fixed typo: instuction → instruction'],
          [/\binstrcution\b/g, 'instruction', 'Fixed typo: instrcution → instruction'],
          [/\baccout\b/g, 'account', 'Fixed typo: accout → account'],
          [/\bpubkey\s*,\s*\n\s*\}/g, 'pubkey\n}', 'Removed trailing comma in account fields'],
        ];

        for (const [pattern, replacement, desc] of keywordFixes) {
          if (pattern.test(fixed)) {
            fixed = fixed.replace(pattern, replacement);
            fixes.push(desc);
          }
        }

        // Fix 5: Ensure account fields use commas
        fixed = fixed.replace(
          /^(\s+\w+:\s+\w+)\s*$/gm,
          (match, field) => {
            if (!match.trim().endsWith(',') && !match.trim().endsWith('{') && !match.trim().endsWith('}')) {
              fixes.push(`Added missing comma after field: ${field.trim()}`);
              return `${field},`;
            }
            return match;
          },
        );

        // Fix 6: Add missing closing braces (check brace balance)
        const openBraces = (fixed.match(/\{/g) || []).length;
        const closeBraces = (fixed.match(/\}/g) || []).length;
        if (openBraces > closeBraces) {
          const diff = openBraces - closeBraces;
          for (let i = 0; i < diff; i++) {
            fixed += '\n}';
          }
          fixes.push(`Added ${diff} missing closing brace(s)`);
        }

        // Verify the fix compiles
        const result = compile(fixed, { target: 'both', resolveImports: false });
        const compiles = result.success;

        if (fixes.length === 0) {
          // Try lint to see if there are issues we couldn't fix
          const lintResult = lint(source);
          if (lintResult.errors > 0 || lintResult.warnings > 0) {
            const issues = lintResult.diagnostics
              .getAll()
              .map((d) => {
                const loc = d.location ? ` (line ${d.location.line})` : '';
                return `• ${d.description}${loc}`;
              })
              .join('\n');
            return {
              content: [
                {
                  type: 'text' as const,
                  text: `No auto-fixable issues found, but lint reports these issues that need manual attention:\n\n${issues}`,
                },
              ],
            };
          }
          return {
            content: [{ type: 'text' as const, text: 'No issues found. Code is already clean.' }],
          };
        }

        const fixSummary = fixes.map((f) => `✅ ${f}`).join('\n');
        const status = compiles
          ? '✅ Fixed code compiles successfully.'
          : '⚠️ Fixed code still has compilation errors. Further manual fixes may be needed.';

        return {
          content: [
            {
              type: 'text' as const,
              text: `Applied ${fixes.length} fix(es):\n\n${fixSummary}\n\n${status}\n\n## Fixed Code\n\n\`\`\`purp\n${fixed}\`\`\``,
            },
          ],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: 'text' as const, text: `Fix error: ${message}` }],
          isError: true,
        };
      }
    },
  );
}
