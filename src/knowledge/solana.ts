// ============================================================================
// Solana Knowledge Base — Program IDs, Constants, Error Codes, Best Practices
// Embedded reference data for AI agents
// ============================================================================

// ---- Well-Known Program IDs ----
export const PROGRAM_IDS: Record<string, { address: string; description: string; docs: string }> = {
  'System Program': {
    address: '11111111111111111111111111111111',
    description: 'Creates accounts, transfers SOL, allocates data, assigns ownership. The only program that can create new accounts.',
    docs: 'https://solana.com/docs/core/programs/builtin-programs',
  },
  'Token Program': {
    address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    description: 'SPL Token program for fungible and non-fungible tokens. Handles mint, transfer, burn, freeze, approve, and revoke.',
    docs: 'https://www.solana-program.com/docs/token',
  },
  'Token 2022 (Token Extensions)': {
    address: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
    description: 'Extended token program with transfer hooks, confidential transfers, permanent delegate, interest-bearing tokens, and more.',
    docs: 'https://www.solana-program.com/docs/token-2022',
  },
  'Associated Token Account': {
    address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
    description: 'Derives deterministic token account addresses from owner + mint. Creates ATAs for any wallet.',
    docs: 'https://www.solana-program.com/docs/associated-token-account',
  },
  'Metaplex Token Metadata': {
    address: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
    description: 'NFT metadata standard. Stores name, symbol, URI, creators, and royalties for SPL tokens.',
    docs: 'https://developers.metaplex.com/token-metadata',
  },
  'Metaplex Bubblegum': {
    address: 'BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY',
    description: 'Compressed NFT (cNFT) program using Merkle tree compression. Enables minting millions of NFTs cheaply.',
    docs: 'https://developers.metaplex.com/bubblegum',
  },
  'Metaplex Candy Machine V3': {
    address: 'Guard1JwRhJkVH6XZhzoYxeBVQe872VH6QggF4BWmS9g',
    description: 'NFT minting machine with configurable guards (allowlist, payment, dates, limits).',
    docs: 'https://developers.metaplex.com/candy-machine',
  },
  Memo: {
    address: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
    description: 'Attaches arbitrary string data to transactions. Used for transaction notes and compliance.',
    docs: 'https://www.solana-program.com/docs/memo',
  },
  'Compute Budget': {
    address: 'ComputeBudget111111111111111111111111111111',
    description: 'Sets compute unit limits and priority fees for transactions.',
    docs: 'https://solana.com/docs/core/programs/builtin-programs',
  },
  'Address Lookup Table': {
    address: 'AddressLookupTab1e1111111111111111111111111',
    description: 'Manages address lookup tables for versioned transactions. Enables >35 accounts per transaction.',
    docs: 'https://solana.com/docs/core/programs/builtin-programs',
  },
  'BPF Loader Upgradeable': {
    address: 'BPFLoaderUpgradeab1e11111111111111111111111',
    description: 'Deploys and upgrades Solana programs. Most programs use this loader.',
    docs: 'https://solana.com/docs/core/programs/program-deployment',
  },
  Vote: {
    address: 'Vote111111111111111111111111111111111111111',
    description: 'Creates and manages validator vote accounts for consensus.',
    docs: 'https://solana.com/docs/core/programs/builtin-programs',
  },
  Stake: {
    address: 'Stake11111111111111111111111111111111111111',
    description: 'Creates and manages stake delegations to validators.',
    docs: 'https://solana.com/docs/core/programs/builtin-programs',
  },
  'Name Service': {
    address: 'namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX',
    description: 'Solana Name Service (SNS) for .sol domain names.',
    docs: 'https://sns.guide',
  },
  'Jupiter Aggregator v6': {
    address: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
    description: 'Token swap aggregator. Routes trades across all Solana DEXes for best price.',
    docs: 'https://station.jup.ag/docs',
  },
  'Raydium AMM': {
    address: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
    description: 'Raydium AMM for concentrated liquidity pools and swaps.',
    docs: 'https://docs.raydium.io',
  },
  'Orca Whirlpool': {
    address: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
    description: 'Concentrated liquidity AMM for efficient token swaps.',
    docs: 'https://docs.orca.so',
  },
  'Marinade Finance': {
    address: 'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD',
    description: 'Liquid staking protocol. Stake SOL and receive mSOL.',
    docs: 'https://docs.marinade.finance',
  },
  'Drift Protocol': {
    address: 'dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH',
    description: 'Perpetual futures exchange with up to 20x leverage.',
    docs: 'https://docs.drift.trade',
  },
  'Squads Multisig v4': {
    address: 'SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf',
    description: 'Multisig wallet for teams. Threshold-based transaction approval.',
    docs: 'https://docs.squads.so',
  },
  Pyth: {
    address: 'FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH',
    description: 'Oracle network providing real-time price feeds for crypto, equities, and commodities.',
    docs: 'https://docs.pyth.network',
  },
  Switchboard: {
    address: 'SW1TCH7qEPTdLsDHRgPuMQjbQxKdH2aBStViMFnt64f',
    description: 'Oracle network and verifiable randomness function (VRF) provider.',
    docs: 'https://docs.switchboard.xyz',
  },
};

// ---- Sysvar Accounts ----
export const SYSVARS: Record<string, { address: string; description: string }> = {
  Clock: {
    address: 'SysvarC1ock11111111111111111111111111111111',
    description: 'Current slot, epoch, unix_timestamp, leader_schedule_epoch. Used for time-based logic.',
  },
  Rent: {
    address: 'SysvarRent111111111111111111111111111111111',
    description: 'Rent parameters: lamports_per_byte_year, exemption_threshold, burn_percentage.',
  },
  EpochSchedule: {
    address: 'SysvarEpochScheworG5KeAMDoKbNqGVMr4WZdPGVCEp',
    description: 'Epoch schedule parameters: slots_per_epoch, warmup.',
  },
  'Recent Blockhashes': {
    address: 'SysvarRecentB1teleportHashes11111111111111',
    description: 'Recent blockhashes for transaction deduplication.',
  },
  'Stake History': {
    address: 'SysvarStakeHistory1111111111111111111111111',
    description: 'Historical stake activation/deactivation data.',
  },
  Instructions: {
    address: 'Sysvar1nstructions1111111111111111111111111',
    description: 'Introspection sysvar — access instruction data within a program.',
  },
  SlotHashes: {
    address: 'SysvarS1otHashes111111111111111111111111111',
    description: 'Recent slot hashes for slot-based logic.',
  },
};

// ---- Solana Constants ----
export const CONSTANTS = {
  accounts: {
    MAX_ACCOUNT_DATA_LEN: { value: 10_485_760, unit: 'bytes', description: 'Maximum account data size (10 MiB)' },
    MAX_PERMITTED_DATA_INCREASE: { value: 10_240, unit: 'bytes', description: 'Maximum realloc increase per CPI (10 KiB)' },
  },
  transactions: {
    PACKET_DATA_SIZE: { value: 1_232, unit: 'bytes', description: 'Maximum transaction size (IPv6 MTU minus headers)' },
    MAX_ACCOUNTS_PER_TRANSACTION: { value: 64, unit: 'accounts', description: 'Maximum accounts per transaction (128 with feature gate)' },
    MAX_PROCESSING_AGE: { value: 150, unit: 'slots', description: 'Blockhash expiry window (~1 minute)' },
  },
  compute: {
    DEFAULT_INSTRUCTION_CU_LIMIT: { value: 200_000, unit: 'CUs', description: 'Default compute unit limit per instruction' },
    MAX_CU_PER_TRANSACTION: { value: 1_400_000, unit: 'CUs', description: 'Maximum compute units per transaction' },
    LAMPORTS_PER_SIGNATURE: { value: 5_000, unit: 'lamports', description: 'Base fee per signature' },
    WRITE_LOCK_UNITS: { value: 300, unit: 'CUs', description: 'Compute cost per write-locked account' },
    SIGNATURE_COST: { value: 720, unit: 'CUs', description: 'Compute cost per Ed25519 signature' },
    DEFAULT_HEAP_COST: { value: 8, unit: 'CUs per 32 KiB', description: 'Cost to allocate heap pages' },
    CREATE_PROGRAM_ADDRESS_UNITS: { value: 1_500, unit: 'CUs', description: 'Cost per PDA derivation syscall' },
    CPI_INVOCATION_COST: { value: 1_000, unit: 'CUs', description: 'Cost per cross-program invocation' },
  },
  pda: {
    MAX_SEEDS: { value: 16, unit: 'seeds', description: 'Maximum number of seeds per PDA derivation' },
    MAX_SEED_LEN: { value: 32, unit: 'bytes', description: 'Maximum length of a single PDA seed' },
  },
  cpi: {
    MAX_INSTRUCTION_STACK_DEPTH: { value: 5, unit: 'levels', description: 'Maximum CPI call depth (9 with SIMD-0268)' },
    MAX_RETURN_DATA: { value: 1_024, unit: 'bytes', description: 'Maximum return data from a CPI' },
    MAX_SIGNERS: { value: 16, unit: 'signers', description: 'Maximum PDA signers per CPI' },
  },
  rent: {
    LAMPORTS_PER_BYTE_YEAR: 3480,
    EXEMPTION_THRESHOLD_YEARS: 2,
    ACCOUNT_HEADER_SIZE: 128,
  },
};

// ---- Rent Calculator ----
export function calculateRent(dataSize: number): {
  totalSize: number;
  lamports: number;
  sol: number;
} {
  const totalSize = dataSize + CONSTANTS.rent.ACCOUNT_HEADER_SIZE;
  const lamports = Math.ceil(
    totalSize * CONSTANTS.rent.LAMPORTS_PER_BYTE_YEAR * CONSTANTS.rent.EXEMPTION_THRESHOLD_YEARS,
  );
  const sol = lamports / 1_000_000_000;
  return { totalSize, lamports, sol };
}

// ---- Type Sizes (for account cost estimation) ----
export const TYPE_SIZES: Record<string, number> = {
  u8: 1,
  u16: 2,
  u32: 4,
  u64: 8,
  u128: 16,
  i8: 1,
  i16: 2,
  i32: 4,
  i64: 8,
  i128: 16,
  f32: 4,
  f64: 8,
  bool: 1,
  pubkey: 32,
  // Borsh string: 4 bytes length prefix + estimated avg content
  string: 36,
  bytes: 36,
};

// ---- Common Error Codes ----
export const COMMON_ERRORS: Record<string, { code: string; meaning: string; fix: string }> = {
  'AccountNotInitialized': {
    code: '0x0',
    meaning: 'The account has not been initialized yet.',
    fix: 'Use #[init] on the account parameter or ensure the account is created before use.',
  },
  'InsufficientFunds': {
    code: '0x1',
    meaning: 'The account does not have enough lamports for the operation.',
    fix: 'Ensure the payer has enough SOL. Check with connection.getBalance().',
  },
  'AccountAlreadyInitialized': {
    code: '0x0',
    meaning: 'Attempting to initialize an account that already exists.',
    fix: 'Check if the account exists before creating. Use findProgramAddress for unique PDAs.',
  },
  'InvalidProgramId': {
    code: '0x2',
    meaning: 'The account is not owned by the expected program.',
    fix: 'Verify the account.owner matches your program ID.',
  },
  'MissingRequiredSignature': {
    code: '0x3',
    meaning: 'A required signer did not sign the transaction.',
    fix: 'Ensure all signer accounts have isSigner: true in the instruction.',
  },
  'AccountBorrowFailed': {
    code: '0x5',
    meaning: 'Account data could not be borrowed. Usually caused by double-borrowing.',
    fix: 'Ensure you are not passing the same account twice in the instruction.',
  },
  'InvalidAccountData': {
    code: '0x7',
    meaning: 'Account data is malformed or wrong size.',
    fix: 'Check account data length matches expected struct size. May be wrong discriminator.',
  },
  'InvalidInstructionData': {
    code: '0xA',
    meaning: 'Instruction data could not be deserialized.',
    fix: 'Verify client SDK matches on-chain program version. Check Borsh serialization.',
  },
  'ProgramFailedToComplete': {
    code: '0xB',
    meaning: 'Program ran out of compute units or panicked.',
    fix: 'Increase compute budget with ComputeBudgetProgram.setComputeUnitLimit(). Optimize loops.',
  },
  'AccountDataTooSmall': {
    code: '0xE',
    meaning: 'Account does not have enough space for the data being written.',
    fix: 'Allocate more space during account creation. Use realloc if needed.',
  },
  'TransactionTooLarge': {
    code: 'N/A',
    meaning: 'Transaction exceeds 1,232 bytes.',
    fix: 'Use Address Lookup Tables for transactions with many accounts. Reduce accounts or instruction data.',
  },
  'BlockhashExpired': {
    code: 'N/A',
    meaning: 'Transaction blockhash is too old (>150 slots).',
    fix: 'Get a fresh blockhash before sending. Use commitment: "confirmed" for getLatestBlockhash.',
  },
};

// ---- Security Best Practices ----
export const SECURITY_RULES: Array<{ rule: string; severity: 'critical' | 'high' | 'medium'; description: string; fix: string }> = [
  {
    rule: 'signer-authorization',
    severity: 'critical',
    description: 'Every instruction that modifies state must verify the signer has authority.',
    fix: 'Add assert(account.authority == signer, "Unauthorized") at the top of instructions.',
  },
  {
    rule: 'owner-check',
    severity: 'critical',
    description: 'Verify that accounts are owned by the expected program.',
    fix: 'Check account_info.owner == program_id for all non-system accounts.',
  },
  {
    rule: 'arithmetic-overflow',
    severity: 'high',
    description: 'Unchecked math can cause overflows leading to fund loss.',
    fix: 'Use checked_add(), checked_sub(), checked_mul() instead of +, -, *.',
  },
  {
    rule: 'account-reinitialization',
    severity: 'high',
    description: 'If an account can be reinitialized, attackers can reset it to steal funds.',
    fix: 'Add is_initialized check: assert(account.is_initialized == false, "Already initialized").',
  },
  {
    rule: 'pda-validation',
    severity: 'high',
    description: 'PDA accounts must be verified to prevent address substitution attacks.',
    fix: 'Derive the expected PDA address and compare: assert(expected_pda == account_key).',
  },
  {
    rule: 'close-account-drain',
    severity: 'high',
    description: 'When closing accounts, all lamports must be drained and data zeroed.',
    fix: 'Transfer all lamports to destination, then zero out account data and set owner to System Program.',
  },
  {
    rule: 'missing-rent-check',
    severity: 'medium',
    description: 'Accounts below rent-exempt minimum will be garbage collected.',
    fix: 'Always create accounts with rent-exempt lamport balance. Use calculateRent() to determine amount.',
  },
  {
    rule: 'duplicate-mutable-accounts',
    severity: 'high',
    description: 'Passing the same account as two different mutable parameters can corrupt state.',
    fix: 'Add checks that mutable account addresses are distinct: assert(account_a != account_b).',
  },
  {
    rule: 'integer-truncation',
    severity: 'medium',
    description: 'Casting between integer sizes can silently truncate values.',
    fix: 'Use try_into() or explicit range checks before casting (e.g., u64 to u32).',
  },
  {
    rule: 'cpi-privilege-escalation',
    severity: 'critical',
    description: 'CPI calls inherit signer privileges. Malicious programs can exploit this.',
    fix: 'Only invoke trusted programs. Verify program_id of the callee. Use PDA signers for CPI.',
  },
];

// ---- Lookup function ----
export function lookupProgram(query: string): string | null {
  const q = query.toLowerCase();
  for (const [name, info] of Object.entries(PROGRAM_IDS)) {
    if (name.toLowerCase().includes(q) || info.address.includes(query)) {
      return `**${name}**\n- Address: \`${info.address}\`\n- ${info.description}\n- Docs: ${info.docs}`;
    }
  }
  for (const [name, info] of Object.entries(SYSVARS)) {
    if (name.toLowerCase().includes(q) || info.address.includes(query)) {
      return `**Sysvar: ${name}**\n- Address: \`${info.address}\`\n- ${info.description}`;
    }
  }
  return null;
}

export function lookupError(query: string): string | null {
  const q = query.toLowerCase();
  for (const [name, info] of Object.entries(COMMON_ERRORS)) {
    if (name.toLowerCase().includes(q) || info.meaning.toLowerCase().includes(q)) {
      return `**${name}** (${info.code})\n- ${info.meaning}\n- Fix: ${info.fix}`;
    }
  }
  return null;
}

export function formatConstants(): string {
  const sections: string[] = [];
  for (const [category, entries] of Object.entries(CONSTANTS)) {
    if (category === 'rent') continue;
    const lines = Object.entries(entries as Record<string, any>).map(
      ([key, val]) => `| \`${key}\` | ${val.value.toLocaleString()} ${val.unit} | ${val.description} |`,
    );
    sections.push(`### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n| Constant | Value | Description |\n|---|---|---|\n${lines.join('\n')}`);
  }
  return sections.join('\n\n');
}
