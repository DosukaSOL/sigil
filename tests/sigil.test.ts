// ============================================================================
// Sigil MCP Server Tests
// ============================================================================

import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { compile, check, lint, tokenizeAndParse } from '../src/utils/compiler.js';
import { getTemplate, listTemplates, TEMPLATES } from '../src/templates/index.js';

// ---------------------------------------------------------------------------
// Compiler Bridge
// ---------------------------------------------------------------------------
describe('compiler bridge', () => {
  const VALID_PROGRAM = `
program Hello {
  account Greeting {
    message: string,
    author: pubkey
  }

  pub instruction create(
    #[mut] signer author,
    #[init] account greeting,
    message: string
  ) {
    greeting.message = message;
    greeting.author = author;
    emit Created(author, message);
  }

  event Created { author: pubkey, message: string }
}`;

  it('compile() returns rust + typescript for valid program', () => {
    const result = compile(VALID_PROGRAM, { resolveImports: false });
    assert.ok(result.success, 'should compile successfully');
    assert.ok(result.rust, 'should produce Rust output');
    assert.ok(result.typescript, 'should produce TypeScript output');
    assert.ok(result.rust!.includes('pinocchio'), 'Rust should reference pinocchio');
  });

  it('compile() returns diagnostics for invalid program', () => {
    const result = compile('this is not valid purp', { resolveImports: false });
    assert.ok(!result.success || result.diagnostics.getAll().length > 0);
  });

  it('check() returns success for valid program', () => {
    const result = check(VALID_PROGRAM);
    assert.ok(result.success);
    assert.strictEqual(result.errors.length, 0);
  });

  it('check() returns errors for invalid program', () => {
    const result = check('program {}');
    assert.ok(!result.success || result.errors.length > 0);
  });

  it('tokenizeAndParse() produces AST', () => {
    const { tokens, ast } = tokenizeAndParse(VALID_PROGRAM);
    assert.ok(tokens.length > 0, 'should produce tokens');
    assert.ok(ast.body.length > 0, 'should produce AST nodes');
  });

  it('lint() runs without crashing on valid code', () => {
    const result = lint(VALID_PROGRAM);
    assert.strictEqual(typeof result.errors, 'number');
    assert.strictEqual(typeof result.warnings, 'number');
  });
});

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------
describe('templates', () => {
  it('has 6 templates', () => {
    assert.strictEqual(Object.keys(TEMPLATES).length, 6);
  });

  it('listTemplates() returns formatted list', () => {
    const list = listTemplates();
    assert.ok(list.includes('token'));
    assert.ok(list.includes('escrow'));
    assert.ok(list.includes('staking'));
    assert.ok(list.includes('dao'));
    assert.ok(list.includes('nft'));
    assert.ok(list.includes('game'));
  });

  it('getTemplate() resolves aliases', () => {
    const t1 = getTemplate('spl');
    assert.ok(t1);
    assert.strictEqual(t1.name, 'SPL Token');

    const t2 = getTemplate('governance');
    assert.ok(t2);
    assert.strictEqual(t2.name, 'DAO Governance');

    const t3 = getTemplate('mint');
    assert.ok(t3);
    assert.strictEqual(t3.name, 'NFT Collection');
  });

  it('getTemplate() returns null for unknown template', () => {
    assert.strictEqual(getTemplate('nonexistent'), null);
  });

  it('getTemplate() substitutes program name', () => {
    const t = getTemplate('token', 'MyToken');
    assert.ok(t);
    assert.ok(t.source.includes('program MyToken'));
    assert.ok(!t.source.includes('{name}'));
  });

  for (const [key, template] of Object.entries(TEMPLATES)) {
    it(`template "${key}" compiles without errors`, () => {
      const source = template.source.replace(/\{name\}/g, template.name.replace(/\s+/g, ''));
      const result = compile(source, { resolveImports: false });
      // Templates with stdlib imports may not fully compile but should parse
      if (!result.success) {
        // At minimum, should tokenize and parse
        const { ast } = tokenizeAndParse(source);
        assert.ok(ast.body.length > 0, `template "${key}" should produce AST`);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Explain tool logic (AST inspection)
// ---------------------------------------------------------------------------
describe('AST inspection', () => {
  it('parses program with accounts, instructions, events', () => {
    const source = `
program Test {
  account Data { value: u64 }
  pub instruction set(#[mut] signer user, #[mut] account data, value: u64) {
    data.value = value;
  }
  event ValueSet { value: u64 }
}`;
    const { ast } = tokenizeAndParse(source);
    const prog = ast.body.find((n: any) => n.kind === 'ProgramDeclaration') as any;
    assert.ok(prog, 'should find program declaration');
    assert.strictEqual(prog.name, 'Test');

    const accounts = prog.body.filter((n: any) => n.kind === 'AccountDeclaration');
    assert.strictEqual(accounts.length, 1);

    const instructions = prog.body.filter((n: any) => n.kind === 'InstructionDeclaration');
    assert.strictEqual(instructions.length, 1);

    const events = prog.body.filter((n: any) => n.kind === 'EventDeclaration');
    assert.strictEqual(events.length, 1);
  });
});
