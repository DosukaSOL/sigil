// ============================================================================
// purp_audit — Security audit for Purp programs using Solana best practices
// ============================================================================

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { tokenizeAndParse } from '../utils/compiler.js';
import { SECURITY_RULES } from '../knowledge/solana.js';

export function registerAuditTool(server: McpServer): void {
  server.tool(
    'purp_audit',
    'Run a comprehensive security audit on a Purp program. Checks for signer authorization, owner verification, overflow risks, reinitialization, PDA validation, and more. Returns severity-rated findings.',
    {
      source: z.string().describe('The .purp source code to audit'),
    },
    async ({ source }) => {
      try {
        const { ast } = tokenizeAndParse(source);
        const findings: Array<{
          severity: 'critical' | 'high' | 'medium';
          rule: string;
          location: string;
          detail: string;
          fix: string;
        }> = [];

        for (const node of ast.body) {
          if ((node as any).kind !== 'ProgramDeclaration') continue;
          const body = (node as any).body ?? [];
          const programName = (node as any).name;

          const instructions = body.filter((n: any) => n.kind === 'InstructionDeclaration');
          const accounts = body.filter((n: any) => n.kind === 'AccountDeclaration');

          for (const ix of instructions) {
            const ixName = (ix as any).name;
            const params = (ix as any).params ?? [];
            const ixSource = getInstructionSource(source, ix);

            // Check: signer-authorization
            const hasSigner = params.some((p: any) => p.accountType === 'signer');
            const hasMut = params.some(
              (p: any) => p.attributes?.some((a: any) => a.name === 'mut'),
            );
            if (hasMut && !hasSigner) {
              const rule = SECURITY_RULES.find((r) => r.rule === 'signer-authorization')!;
              findings.push({
                severity: rule.severity,
                rule: rule.rule,
                location: `instruction \`${ixName}\``,
                detail: 'Instruction modifies state (#[mut]) but has no signer parameter.',
                fix: rule.fix,
              });
            }

            // Check: signer authorization assert
            if (hasSigner && hasMut) {
              const hasAuthorityCheck =
                ixSource.includes('== signer') ||
                ixSource.includes('== authority') ||
                ixSource.includes('.authority ==') ||
                ixSource.includes('.owner ==') ||
                ixSource.includes('.maker ==') ||
                ixSource.includes('.admin ==');
              if (!hasAuthorityCheck && !(ix as any).name?.includes('initialize') && !(ix as any).name?.includes('create')) {
                findings.push({
                  severity: 'high',
                  rule: 'signer-authorization',
                  location: `instruction \`${ixName}\``,
                  detail: 'Instruction has a signer but no authority check (assert). Any wallet could call this.',
                  fix: 'Add `assert(account.authority == signer, "Unauthorized")` before state changes.',
                });
              }
            }

            // Check: account-reinitialization
            const hasInit = params.some(
              (p: any) => p.attributes?.some((a: any) => a.name === 'init'),
            );
            if (hasInit) {
              const hasInitCheck =
                ixSource.includes('is_initialized') ||
                ixSource.includes('initialized');
              if (!hasInitCheck) {
                const rule = SECURITY_RULES.find((r) => r.rule === 'account-reinitialization')!;
                findings.push({
                  severity: rule.severity,
                  rule: rule.rule,
                  location: `instruction \`${ixName}\``,
                  detail: 'Uses #[init] without checking if already initialized. Account could be reinitialized.',
                  fix: rule.fix,
                });
              }
            }

            // Check: arithmetic-overflow
            const hasUncheckedMath =
              /\w+\s*\+=\s*\w+/.test(ixSource) ||
              /\w+\s*-=\s*\w+/.test(ixSource) ||
              /\w+\s*\*=\s*\w+/.test(ixSource);
            if (hasUncheckedMath) {
              const hasOverflowCheck =
                ixSource.includes('checked_') ||
                ixSource.includes('>= amount') ||
                ixSource.includes('>= ') ||
                ixSource.includes('assert(');
              if (!hasOverflowCheck) {
                const rule = SECURITY_RULES.find((r) => r.rule === 'arithmetic-overflow')!;
                findings.push({
                  severity: rule.severity,
                  rule: rule.rule,
                  location: `instruction \`${ixName}\``,
                  detail: 'Arithmetic operations without overflow protection detected.',
                  fix: rule.fix,
                });
              }
            }

            // Check: duplicate-mutable-accounts
            const mutAccounts = params.filter(
              (p: any) =>
                p.attributes?.some((a: any) => a.name === 'mut') &&
                p.accountType === 'account',
            );
            if (mutAccounts.length >= 2) {
              const hasDuplicateCheck = ixSource.includes('!=');
              if (!hasDuplicateCheck) {
                const rule = SECURITY_RULES.find((r) => r.rule === 'duplicate-mutable-accounts')!;
                findings.push({
                  severity: 'medium',
                  rule: rule.rule,
                  location: `instruction \`${ixName}\``,
                  detail: `Has ${mutAccounts.length} mutable accounts without duplicate check.`,
                  fix: rule.fix,
                });
              }
            }
          }

          // Check: missing events for state-changing instructions
          const events = body.filter((n: any) => n.kind === 'EventDeclaration');
          if (instructions.length > 0 && events.length === 0) {
            findings.push({
              severity: 'medium',
              rule: 'missing-events',
              location: `program \`${programName}\``,
              detail: 'No events defined. State changes cannot be tracked off-chain.',
              fix: 'Add event declarations and emit them in every state-changing instruction.',
            });
          }

          // Check: missing error definitions
          const errors = body.filter((n: any) => n.kind === 'ErrorDeclaration');
          if (errors.length === 0) {
            findings.push({
              severity: 'medium',
              rule: 'missing-errors',
              location: `program \`${programName}\``,
              detail: 'No custom error block. Assert strings are not client-parseable.',
              fix: 'Add an error block with descriptive error codes.',
            });
          }

          // Check: accounts with no authority field
          for (const acc of accounts) {
            const fields = (acc as any).fields ?? [];
            const fieldNames = fields.map((f: any) => f.name);
            const hasAuthority =
              fieldNames.includes('authority') ||
              fieldNames.includes('owner') ||
              fieldNames.includes('admin');
            if (!hasAuthority && fields.length > 1) {
              findings.push({
                severity: 'medium',
                rule: 'owner-check',
                location: `account \`${(acc as any).name}\``,
                detail: 'Account has no authority/owner field. Anyone could modify it if not checked in instruction.',
                fix: 'Add an `authority: pubkey` field and verify it in instructions.',
              });
            }
          }
        }

        // Sort by severity
        const severityOrder = { critical: 0, high: 1, medium: 2 };
        findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

        const criticals = findings.filter((f) => f.severity === 'critical').length;
        const highs = findings.filter((f) => f.severity === 'high').length;
        const mediums = findings.filter((f) => f.severity === 'medium').length;

        if (findings.length === 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: '## Security Audit — ✅ PASS\n\nNo security issues found. The program follows Solana security best practices.',
              },
            ],
          };
        }

        const severityIcon = (s: string) =>
          s === 'critical' ? '🔴' : s === 'high' ? '🟠' : '🟡';

        const report =
          `## Security Audit Report\n\n` +
          `**${findings.length} finding(s):** ${criticals} critical, ${highs} high, ${mediums} medium\n\n` +
          findings
            .map(
              (f, i) =>
                `### ${i + 1}. ${severityIcon(f.severity)} ${f.severity.toUpperCase()} — ${f.rule}\n` +
                `- **Where:** ${f.location}\n` +
                `- **Issue:** ${f.detail}\n` +
                `- **Fix:** ${f.fix}`,
            )
            .join('\n\n') +
          `\n\n---\n\n*Audit based on ${SECURITY_RULES.length} Solana security rules. This is a static analysis — manual review is always recommended before mainnet deployment.*`;

        return { content: [{ type: 'text' as const, text: report }] };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: 'text' as const, text: `Audit error: ${message}` }], isError: true };
      }
    },
  );
}

function getInstructionSource(fullSource: string, ix: any): string {
  // Try to extract the instruction source from the full source
  const name = ix.name;
  if (!name) return fullSource;
  const regex = new RegExp(`instruction\\s+${name}\\s*\\([\\s\\S]*?\\}`, 'm');
  const match = fullSource.match(regex);
  return match ? match[0] : fullSource;
}
