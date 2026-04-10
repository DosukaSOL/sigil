import { compile, tokenizeAndParse, lint, check } from '../src/utils/compiler.js';
import { getTemplate, TEMPLATES } from '../src/templates/index.js';
import { calculateRent, TYPE_SIZES, lookupProgram, lookupError, PROGRAM_IDS, SECURITY_RULES, formatConstants } from '../src/knowledge/solana.js';

const PROGRAM = `
program TestToken {
  account Vault {
    authority: pubkey,
    balance: u64,
    name: string
  }

  pub instruction deposit(
    #[mut] signer user,
    #[mut] account vault,
    amount: u64
  ) {
    assert(vault.authority == user, "Unauthorized");
    vault.balance += amount;
    emit Deposited(user, amount);
  }

  pub instruction withdraw(
    #[mut] signer user,
    #[mut] account vault,
    amount: u64
  ) {
    assert(vault.authority == user, "Unauthorized");
    assert(vault.balance >= amount, "Insufficient");
    vault.balance -= amount;
    emit Withdrawn(user, amount);
  }

  event Deposited { user: pubkey, amount: u64 }
  event Withdrawn { user: pubkey, amount: u64 }

  error Errors {
    Unauthorized = "Not authorized",
    Insufficient = "Not enough balance"
  }
}`;

let pass = 0;
let fail = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    pass++;
    console.log(`  ✅ ${name}`);
  } catch (e: any) {
    fail++;
    console.log(`  ❌ ${name}: ${e.message}`);
  }
}

function assert(cond: any, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

console.log('=== RUNTIME INTEGRATION TESTS ===\n');

console.log('>> Compiler Bridge');
test('compile valid program', () => {
  const r: any = compile(PROGRAM, { resolveImports: false });
  assert(r.success, 'should compile');
  assert(r.rust && r.rust.length > 100, 'should produce substantial Rust');
  assert(r.typescript && r.typescript.length > 50, 'should produce TypeScript');
});

test('parse valid program', () => {
  const { ast } = tokenizeAndParse(PROGRAM);
  const prog: any = ast.body.find((n: any) => n.kind === 'ProgramDeclaration');
  assert(prog, 'should find program');
  assert(prog.name === 'TestToken', 'program name should be TestToken');
  const accounts = prog.body.filter((n: any) => n.kind === 'AccountDeclaration');
  assert(accounts.length === 1, 'should have 1 account');
  assert(accounts[0].name === 'Vault', 'account name should be Vault');
  const fields = accounts[0].fields;
  assert(fields.length === 3, 'should have 3 fields');
});

console.log('\n>> Account Size Calculation');
test('calculate account sizes from AST', () => {
  const { ast } = tokenizeAndParse(PROGRAM);
  const prog: any = ast.body.find((n: any) => n.kind === 'ProgramDeclaration');
  const acc = prog.body.find((n: any) => n.kind === 'AccountDeclaration');
  let size = 8; // discriminator
  for (const f of acc.fields) {
    const typeName = f.type?.name ?? f.typeAnnotation?.name ?? 'unknown';
    const s = TYPE_SIZES[typeName] ?? 36;
    size += s;
  }
  // authority: pubkey (32) + balance: u64 (8) + name: string (36) + discriminator (8) = 84
  assert(size === 84, 'expected 84 bytes, got ' + size);
  const rent = calculateRent(size);
  assert(rent.totalSize === 84 + 128, 'totalSize should be ' + (84 + 128) + ', got ' + rent.totalSize);
  assert(rent.lamports > 0, 'lamports should be positive');
  assert(rent.sol > 0, 'sol should be positive');
});

console.log('\n>> Knowledge Base Lookups');
test('lookup system program', () => {
  const r = lookupProgram('system');
  assert(r !== undefined, 'should find system');
  assert(r!.includes('11111111111111111111111111111111'), 'should have system address');
});

test('lookup token program', () => {
  const r = lookupProgram('token');
  assert(r !== undefined, 'should find token');
  assert(r!.includes('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), 'should have token address');
});

test('lookup jupiter', () => {
  const r = lookupProgram('jupiter');
  assert(r !== undefined, 'should find jupiter');
  assert(r!.includes('JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'), 'should have jupiter address');
});

test('lookup error by name', () => {
  const r = lookupError('insufficient');
  assert(r !== undefined, 'should find error');
  assert(r!.includes('InsufficientFunds'), 'should match');
});

test('format constants', () => {
  const r = formatConstants();
  assert(r.includes('PACKET_DATA_SIZE'), 'should include packet data size');
  assert(r.includes('1,232') || r.includes('1232'), 'should have value');
});

console.log('\n>> Templates (all 11)');
for (const [key, tpl] of Object.entries(TEMPLATES)) {
  test('template "' + key + '" parses cleanly', () => {
    const src = tpl.source.replace(/\{name\}/g, tpl.name.replace(/\s+/g, ''));
    const { ast } = tokenizeAndParse(src);
    const prog: any = ast.body.find((n: any) => n.kind === 'ProgramDeclaration');
    assert(prog, key + ' should have a program declaration');
    const accounts = prog.body.filter((n: any) => n.kind === 'AccountDeclaration');
    assert(accounts.length > 0, key + ' should have accounts');
    const instructions = prog.body.filter((n: any) => n.kind === 'InstructionDeclaration');
    assert(instructions.length > 0, key + ' should have instructions');
    const events = prog.body.filter((n: any) => n.kind === 'EventDeclaration');
    assert(events.length > 0, key + ' should have events');
    const errors = prog.body.filter((n: any) => n.kind === 'ErrorDeclaration');
    assert(errors.length > 0, key + ' should have errors');
  });
}

console.log('\n>> Diff Logic');
test('diff detects added account', () => {
  const before = 'program A { account X { v: u64 } pub instruction go(#[mut] signer s) { } event E { v: u64 } error Err { X = "x" } }';
  const after = 'program A { account X { v: u64 } account Y { w: u64 } pub instruction go(#[mut] signer s) { } event E { v: u64 } error Err { X = "x" } }';

  const oldAst = tokenizeAndParse(before).ast;
  const newAst = tokenizeAndParse(after).ast;
  const oldProg: any = oldAst.body.find((n: any) => n.kind === 'ProgramDeclaration');
  const newProg: any = newAst.body.find((n: any) => n.kind === 'ProgramDeclaration');
  const oldAccounts = oldProg.body.filter((n: any) => n.kind === 'AccountDeclaration').map((n: any) => n.name);
  const newAccounts = newProg.body.filter((n: any) => n.kind === 'AccountDeclaration').map((n: any) => n.name);
  assert(oldAccounts.length === 1, 'old should have 1 account');
  assert(newAccounts.length === 2, 'new should have 2 accounts');
  assert(newAccounts.includes('Y'), 'Y should be added');
});

console.log('\n>> Audit Logic');
test('audit detects missing signer on mutable instruction', () => {
  const src = [
    'program Bad {',
    '  account Data { value: u64 }',
    '  pub instruction set(#[mut] account data, value: u64) {',
    '    data.value = value;',
    '  }',
    '  event E { v: u64 }',
    '  error Err { X = "x" }',
    '}'
  ].join('\n');
  const { ast } = tokenizeAndParse(src);
  const prog: any = ast.body.find((n: any) => n.kind === 'ProgramDeclaration');
  const ix = prog.body.find((n: any) => n.kind === 'InstructionDeclaration');
  const ixAccounts = ix.accounts ?? [];
  const hasSigner = ixAccounts.some((p: any) => p.accountType?.kind === 'Signer');
  const hasMut = ixAccounts.some((p: any) => p.accountType?.mutable === true || p.constraints?.some((c: any) => c.kind === 'mut'));
  assert(hasMut, 'should detect #[mut]');
  assert(!hasSigner, 'should detect missing signer');
});

console.log('\n>> Security Rules');
test('all security rules have required fields', () => {
  for (const rule of SECURITY_RULES) {
    assert(!!rule.rule, 'should have rule name');
    assert(!!rule.severity, 'should have severity');
    assert(!!rule.description, 'should have description');
    assert(!!rule.fix, 'should have fix');
    assert(['critical', 'high', 'medium'].includes(rule.severity), 'invalid severity: ' + rule.severity);
  }
});

console.log('\n=== RESULTS: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail > 0 ? 1 : 0);
