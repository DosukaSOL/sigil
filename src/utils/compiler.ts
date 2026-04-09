// ============================================================================
// Sigil — Purp Compiler Bridge
// Wraps the Purp SCL compiler for use in MCP tools
// ============================================================================

import { compile, type CompileResult, type CompileOptions } from 'purp-scl/dist/compiler/src/index.js';
import { Lexer } from 'purp-scl/dist/compiler/src/lexer/index.js';
import { Parser } from 'purp-scl/dist/compiler/src/parser/index.js';
import { PurpLinter, type LintResult } from 'purp-scl/dist/compiler/src/linter/index.js';

export { compile, type CompileResult, type CompileOptions };

export function tokenizeAndParse(source: string, file: string = '<stdin>') {
  const lexer = new Lexer(source, file);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens, file);
  const ast = parser.parse();
  return { tokens, ast };
}

export function lint(source: string, file: string = '<stdin>'): LintResult {
  const { ast } = tokenizeAndParse(source, file);
  const linter = new PurpLinter();
  return linter.lint(ast, file);
}

export function check(source: string): { success: boolean; errors: string[] } {
  const result = compile(source, { target: 'both', resolveImports: false });
  if (result.success) {
    return { success: true, errors: [] };
  }
  const errors = result.diagnostics.getErrors().map((d) => {
    const loc = d.location ? `:${d.location.line}:${d.location.column}` : '';
    return `${d.severity}${loc}: ${d.description}`;
  });
  return { success: false, errors };
}
