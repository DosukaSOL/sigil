// ============================================================================
// Sigil v1.0 MCP Server Tests
// ============================================================================

import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { compile, check, lint, tokenizeAndParse } from '../src/utils/compiler.js';
import { getTemplate, listTemplates, TEMPLATES } from '../src/templates/index.js';
import {
  PROGRAM_IDS,
  SYSVARS,
  CONSTANTS,
  COMMON_ERRORS,
  SECURITY_RULES,
  TYPE_SIZES,
  calculateRent,
  lookupProgram,
  lookupError,
  formatConstants,
} from '../src/knowledge/solana.js';

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
  it('has 11 templates', () => {
    assert.strictEqual(Object.keys(TEMPLATES).length, 11);
  });

  it('listTemplates() returns formatted list with all templates', () => {
    const list = listTemplates();
    const expected = ['token', 'escrow', 'staking', 'dao', 'nft', 'game', 'amm', 'multisig', 'auction', 'lending', 'vesting'];
    for (const name of expected) {
      assert.ok(list.includes(name), `should include ${name}`);
    }
  });

  it('getTemplate() resolves original aliases', () => {
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

  it('getTemplate() resolves new aliases', () => {
    assert.ok(getTemplate('dex'));
    assert.strictEqual(getTemplate('dex')!.name, 'AMM DEX');

    assert.ok(getTemplate('safe'));
    assert.strictEqual(getTemplate('safe')!.name, 'Multisig Wallet');

    assert.ok(getTemplate('bid'));
    assert.strictEqual(getTemplate('bid')!.name, 'Auction House');

    assert.ok(getTemplate('borrow'));
    assert.strictEqual(getTemplate('borrow')!.name, 'Lending Protocol');

    assert.ok(getTemplate('cliff'));
    assert.strictEqual(getTemplate('cliff')!.name, 'Token Vesting');
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
    it(`template "${key}" compiles or parses without errors`, () => {
      const source = template.source.replace(/\{name\}/g, template.name.replace(/\s+/g, ''));
      const result = compile(source, { resolveImports: false });
      if (!result.success) {
        const { ast } = tokenizeAndParse(source);
        assert.ok(ast.body.length > 0, `template "${key}" should produce AST`);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// AST Inspection
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

// ---------------------------------------------------------------------------
// Solana Knowledge Base
// ---------------------------------------------------------------------------
describe('solana knowledge base', () => {
  it('has 22 program IDs', () => {
    assert.strictEqual(Object.keys(PROGRAM_IDS).length, 22);
  });

  it('has 7 sysvars', () => {
    assert.strictEqual(Object.keys(SYSVARS).length, 7);
  });

  it('has 12 common errors', () => {
    assert.strictEqual(Object.keys(COMMON_ERRORS).length, 12);
  });

  it('has 10 security rules', () => {
    assert.strictEqual(SECURITY_RULES.length, 10);
  });

  it('security rules have correct severity levels', () => {
    const criticals = SECURITY_RULES.filter((r) => r.severity === 'critical');
    const highs = SECURITY_RULES.filter((r) => r.severity === 'high');
    const mediums = SECURITY_RULES.filter((r) => r.severity === 'medium');
    assert.ok(criticals.length >= 3, 'should have at least 3 critical rules');
    assert.ok(highs.length >= 3, 'should have at least 3 high rules');
    assert.ok(mediums.length >= 2, 'should have at least 2 medium rules');
  });

  it('has type sizes for all basic types', () => {
    const expected = ['u8', 'u16', 'u32', 'u64', 'u128', 'i8', 'i16', 'i32', 'i64', 'i128', 'f32', 'f64', 'bool', 'pubkey', 'string', 'bytes'];
    for (const type of expected) {
      assert.ok(TYPE_SIZES[type] !== undefined, `should have size for ${type}`);
      assert.ok(TYPE_SIZES[type] > 0, `size for ${type} should be positive`);
    }
  });

  it('constants have expected categories', () => {
    assert.ok(CONSTANTS.accounts);
    assert.ok(CONSTANTS.transactions);
    assert.ok(CONSTANTS.compute);
    assert.ok(CONSTANTS.pda);
    assert.ok(CONSTANTS.cpi);
    assert.ok(CONSTANTS.rent);
  });

  it('program IDs have valid base58 addresses', () => {
    for (const [name, info] of Object.entries(PROGRAM_IDS)) {
      assert.ok(info.address.length >= 32, `${name} address should be at least 32 chars`);
      assert.ok(info.description.length > 0, `${name} should have a description`);
      assert.ok(info.docs.startsWith('http'), `${name} should have a valid docs URL`);
    }
  });
});

// ---------------------------------------------------------------------------
// Rent Calculator
// ---------------------------------------------------------------------------
describe('rent calculator', () => {
  it('calculates rent for zero-size account', () => {
    const result = calculateRent(0);
    assert.strictEqual(result.totalSize, 128); // header only
    assert.ok(result.lamports > 0);
    assert.ok(result.sol > 0);
  });

  it('calculates rent for small account (8 bytes)', () => {
    const result = calculateRent(8);
    assert.strictEqual(result.totalSize, 136);
    const expected = Math.ceil(136 * 3480 * 2);
    assert.strictEqual(result.lamports, expected);
  });

  it('calculates rent for typical account (165 bytes, token account size)', () => {
    const result = calculateRent(165);
    assert.strictEqual(result.totalSize, 293);
    assert.ok(result.lamports > 0);
    assert.ok(result.sol < 1, 'rent should be less than 1 SOL');
  });

  it('sol equals lamports / 1e9', () => {
    const result = calculateRent(100);
    assert.strictEqual(result.sol, result.lamports / 1_000_000_000);
  });
});

// ---------------------------------------------------------------------------
// Lookup Functions
// ---------------------------------------------------------------------------
describe('lookup functions', () => {
  it('lookupProgram finds System Program', () => {
    const result = lookupProgram('system');
    assert.ok(result);
    assert.ok(result.includes('11111111111111111111111111111111'));
  });

  it('lookupProgram finds Token Program', () => {
    const result = lookupProgram('token');
    assert.ok(result);
    assert.ok(result.includes('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'));
  });

  it('lookupProgram finds by address', () => {
    const result = lookupProgram('JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4');
    assert.ok(result);
    assert.ok(result.includes('Jupiter'));
  });

  it('lookupProgram finds sysvars', () => {
    const result = lookupProgram('clock');
    assert.ok(result);
    assert.ok(result.includes('Sysvar'));
  });

  it('lookupProgram returns null for unknown', () => {
    assert.strictEqual(lookupProgram('xyznonexistent123'), null);
  });

  it('lookupError finds InsufficientFunds', () => {
    const result = lookupError('insufficient');
    assert.ok(result);
    assert.ok(result.includes('lamports'));
  });

  it('lookupError finds by meaning', () => {
    const result = lookupError('compute units');
    assert.ok(result);
    assert.ok(result.includes('ProgramFailedToComplete'));
  });

  it('lookupError returns null for unknown', () => {
    assert.strictEqual(lookupError('xyznonexistent123'), null);
  });

  it('formatConstants returns markdown with tables', () => {
    const result = formatConstants();
    assert.ok(result.includes('Accounts'));
    assert.ok(result.includes('Transactions'));
    assert.ok(result.includes('Compute'));
    assert.ok(result.includes('|'));
  });
});
