# AVALANCHE AI PROMPT LIBRARY

# Copy-paste prompts for 10x productivity with Claude Code, Cursor, and Windsurf

# Each prompt is designed to be self-contained and produce production-ready output

---

## 🏗️ SCAFFOLDING PROMPTS

### New ERC-20 Token Project

```
Scaffold a complete Foundry project for an Avalanche C-Chain ERC-20 token with:
- Token name: [NAME], symbol: [SYMBOL], max supply: [AMOUNT]
- Gasless approvals via ERC20Permit
- Governance votes via ERC20Votes  
- Role-based minting (DEFAULT_ADMIN_ROLE, MINTER_ROLE using OpenZeppelin AccessControl)
- Custom errors, NatSpec, Solidity 0.8.24, evmVersion cancun
- Full Foundry test suite: unit tests, fuzz tests for transfer/mint/burn,
  invariant test ensuring totalSupply never exceeds maxSupply
- Deploy script for Fuji and mainnet
- foundry.toml with evm_version="cancun", .env.example, .gitignore

Use OpenZeppelin v5. Do not stub — implement fully.
```

### New NFT Collection

```
Build a production Avalanche NFT collection with Foundry:
- ERC-721 with ERC2981 royalties (5%), max supply [N], mint price [X] AVAX
- Reveal mechanic: unrevealed URI until owner calls reveal(baseURI)
- Phases: whitelist mint (merkle proof), public mint, sold out
- ReentrancyGuard on mint, custom errors, NatSpec
- Withdraw function that sends ETH to owner
- Foundry tests: unit + fuzz (mint quantities, edge cases) + invariant (supply cap)
- Deploy script with constructor args
- evmVersion = cancun in foundry.toml

Solidity 0.8.24. OpenZeppelin v5. No stubs.
```

### New DeFi Protocol

```
Build a simple ERC-20 staking contract on Avalanche:
- Stake any ERC-20, earn rewards in a separate reward token
- Reward rate: [X] tokens per second per staked token
- Compound function, emergency withdraw, owner pause
- Checks-Effects-Interactions, ReentrancyGuard, SafeERC20 everywhere
- Custom errors for: ZeroAmount, InsufficientBalance, ContractPaused
- Foundry tests: unit, fuzz (stake/unstake amounts), invariant (reward math)
- evmVersion = cancun

Use OpenZeppelin v5 Pausable, ReentrancyGuard, SafeERC20. Solidity 0.8.24.
```

### Cross-Chain Application (ICM)

```
Build a cross-chain message passing system for Avalanche using ICM/Teleporter:
- Source chain: Fuji C-Chain (Chain ID 43113)
- Destination chain: [YOUR L1 RPC] (Chain ID [X])
- Message payload: ABI-encoded (address sender, uint256 value, bytes32 id)
- Sender contract: calls TeleporterRegistry.getLatestTeleporter().sendCrossChainMessage()
- Receiver contract: implements ITeleporterReceiver, checks msg.sender == teleporter
- Both contracts emit events: MessageSent(bytes32 messageID) / MessageReceived(...)
- Foundry tests using fork testing against Fuji: vm.createFork("fuji")
- Deploy scripts for both chains
- Teleporter Registry on Fuji: 0x7C43605E14F391720e1b37E49C78C4b03A488d98
- evmVersion = cancun in foundry.toml

Use: forge install ava-labs/teleporter
```

---

## 🔒 SECURITY PROMPTS

### Full Security Audit

```
Perform a complete security audit on this Avalanche smart contract codebase.

Check for and fix ALL of the following:
1. evmVersion not set to "cancun" in foundry.toml — CRITICAL
2. Reentrancy vulnerabilities (missing ReentrancyGuard, CEI violations)
3. Access control issues (missing modifiers, unprotected initializers)
4. Integer overflow/underflow (Solidity <0.8, unchecked blocks)
5. Private key or secret hardcoded outside .env
6. tx.origin used for authentication
7. Unchecked return values from external calls
8. Gas griefing via unbounded loops
9. Oracle manipulation / single-block price reads
10. ICM receiver not checking msg.sender == teleporterMessenger
11. Missing input validation (address(0), zero amounts, array bounds)
12. Missing events on state changes
13. Floating pragma
14. SafeERC20 not used for ERC-20 interactions

For each finding:
- Severity: CRITICAL / HIGH / MEDIUM / LOW / INFO
- Location: file + line number
- Explanation: what can go wrong
- Fix: exact before/after code
- Test: regression test that would catch it

Then write a Slither config (.slither.config.json) to filter false positives from lib/.
```

### Slither Triage

```
I ran `slither . --print human-summary` and got this output:
[PASTE SLITHER OUTPUT HERE]

For each HIGH and MEDIUM finding:
1. Is this a real vulnerability or a false positive? Explain why.
2. If real: show the exact fix with before/after code diff
3. If false positive: show me how to suppress it in .slither.config.json

Then: are there any Avalanche-specific security issues Slither wouldn't catch?
(evmVersion, ICM trust model, Octane dynamic gas, etc.)
```

### Fuzz Test Generation

```
Generate comprehensive fuzz tests for this contract: [PASTE CONTRACT]

For every state-changing function, write:
- testFuzz_ test using forge-std bound() for safe ranges
- Edge cases: zero values, max uint256, address(0), address(this)
- State transitions: test before/after relationships
- Access control: verify unauthorized callers always revert

Also write testInvariant_ tests for:
- Total supply constraints
- Balance conservation  
- Any "should never happen" properties

Tests must compile with Foundry (forge-std/Test.sol), evmVersion cancun.
```

---

## 🚀 DEPLOYMENT PROMPTS

### Pre-Deploy Checklist

```
Run the complete pre-deployment checklist for this Avalanche project:

1. Check foundry.toml for evm_version = "cancun" — fail if missing
2. Run forge build — report any errors or warnings
3. Run forge test — report any failures, show failing test names
4. Run forge coverage — report files below 90% line coverage
5. Check .gitignore includes .env
6. Check no .sol/.ts/.js files contain hex strings that look like private keys
7. Run slither . --print human-summary — report HIGH and MEDIUM findings
8. Do forge script script/Deploy.s.sol --rpc-url fuji (DRY RUN, no --broadcast)
   and report estimated gas cost

For each failed check: explain the issue and provide the exact fix.
Do not proceed to next step until all are passing.
```

### Gas Optimization

```
Read .gas-snapshot and analyze the gas costs for this Avalanche contract.

1. List the 5 most expensive functions with their current gas cost
2. For each, suggest specific optimizations:
   - Can storage slots be packed?
   - Can Solady replacements reduce cost?
   - Can mappings replace arrays?
   - Are there unnecessary SLOADs?
   - Can unchecked math be used safely?
3. Show before/after code for each optimization
4. Estimate the gas saved per call
5. Flag any optimization that would reduce safety — don't recommend it

After changes: run forge snapshot again and show the delta.
```

---

## 🔧 DEBUGGING PROMPTS

### Transaction Failed

```
This transaction failed on Avalanche [Fuji/Mainnet]:
- TX hash: [HASH]
- Contract: [ADDRESS]  
- Function called: [FUNCTION + ARGS]
- Error message: [ERROR]

1. Decode the revert reason
2. Find the exact line in the contract that reverted
3. Explain why it reverted given the inputs
4. Show me the fix
5. Write a failing test that reproduces this exact scenario,
   then fix it so the test passes
```

### Slither False Positive

```
Slither is flagging this as a vulnerability but I believe it's a false positive:
[PASTE FINDING]

Contract code: [PASTE RELEVANT CODE]

1. Is this actually safe? Explain the risk model
2. If safe: write a Foundry test that proves it's safe under all conditions
3. Show me the exact .slither.config.json entry to suppress this finding
4. Is there a safer way to write this code that avoids the Slither warning entirely?
```

### ICM Message Not Delivered

```
My ICM cross-chain message isn't being delivered on Avalanche.

Sender chain: [CHAIN]
Destination chain: [CHAIN]  
TeleporterMessenger address: [ADDR]
sendCrossChainMessage() TX: [HASH]
Receiver contract: [ADDR]

1. Check if the TX was successful on the source chain
2. Is a relayer running? How do I check if my message has been picked up?
3. Check the receiver contract — does it correctly implement ITeleporterReceiver?
4. Check the receiver — does it verify msg.sender == teleporterMessenger?
5. What's the required gas limit for my message and did I set it correctly?
6. Write me a local test that mocks the full send → relay → receive flow
```

---

## 🌐 FRONTEND / SDK PROMPTS

### Wallet Integration

```
Write a React hook for connecting to Avalanche C-Chain and my custom L1:

Requirements:
- Support MetaMask and Core Wallet
- Auto-switch to Fuji testnet if wrong network
- Show connected address, AVAX balance, and custom token balance
- Handle: not installed, wrong network, user rejected, disconnected
- Use ethers.js v6
- Networks: Fuji (43113) and my L1 (Chain ID: [X], RPC: [URL], symbol: [SYM])
- TypeScript, no any types
- Expose: { address, balance, tokenBalance, connect, disconnect, switchNetwork, isConnected }
```

### ChainKit Event Listener

```
Write a Node.js TypeScript service using @avalanche-sdk/chainkit that:

1. Monitors ERC-20 token [ADDRESS] on Fuji C-Chain for Transfer events
2. Filters transfers over [AMOUNT] tokens
3. On large transfer: logs sender, receiver, amount, tx hash, block number
4. Retries on network error with exponential backoff
5. Graceful shutdown on SIGTERM
6. Includes error handling and structured logging (JSON format)

Use: AVACLOUD_API_KEY from process.env
```

---

## ⚡ QUICK ONE-LINER PROMPTS

### Explain This Contract

```
Explain what this Avalanche smart contract does, line by line.
Identify: what it stores, who can call what, what events it emits,
and any security concerns. [PASTE CONTRACT]
```

### Convert Hardhat → Foundry

```
Convert this Hardhat project to Foundry for Avalanche:
- foundry.toml with evm_version="cancun" 
- Convert all .js test files to .t.sol Foundry tests
- Convert deploy scripts to forge scripts
- Preserve all test assertions and coverage
[PASTE HARDHAT PROJECT STRUCTURE + KEY FILES]
```

### Upgrade Pattern

```
Convert this non-upgradeable Avalanche contract to use UUPS proxy pattern:
- Use OpenZeppelin UUPSUpgradeable + Initializable
- Add _authorizeUpgrade() with onlyOwner
- Convert constructor to initializer
- Preserve all existing logic
- Write tests that test the upgrade path
- Add storage gap to prevent collisions
[PASTE CONTRACT]
```
