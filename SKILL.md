# AVALANCHE BUILDER SKILL

## AI-Accelerated Development on Avalanche — The 10x Builder Playbook

**Version:** 2.0 | **Updated:** June 2026 | **Network:** Post-Etna + Octane + Granite

---

## SKILL IDENTITY

```
name: avalanche-builder
version: 2.0
purpose: >
  This skill turns any AI coding agent (Claude Code, Cursor, Windsurf/Devin Desktop,
  GitHub Copilot) into an expert Avalanche developer. It covers the full build loop:
  environment setup → smart contract development → testing → cross-chain → L1 creation
  → deployment → security → monitoring. When a user asks to build ANYTHING on Avalanche,
  use this skill end-to-end. Do not guess at Avalanche-specific config — follow the
  patterns here exactly.

trigger_on_any_of:
  - "build on Avalanche", "deploy to AVAX", "Avalanche smart contract"
  - "create Avalanche L1", "custom subnet", "AvaCloud"
  - "Fuji testnet", "C-Chain", "Avalanche dApp"
  - "Teleporter", "ICM", "cross-chain Avalanche"
  - "AVAX token", "NFT on Avalanche", "DeFi on Avalanche"
  - "Avalanche gaming", "MapleStory chain", "Beam chain"
  - "Avalanche CLI", "AvalancheGo", "Subnet-EVM"
  - any mention of: AVAX, avalanchego, avax.network, build.avax.network

ai_agent_priority_rules:
  1. ALWAYS set evmVersion to "cancun" — never default (Solidity ≥0.8.30 defaults to
     Pectra which Avalanche does NOT support)
  2. NEVER put private keys in code — always use .env + dotenv
  3. ALWAYS develop on Fuji first, mainnet second
  4. ALWAYS use the Avalanche Starter Kit for new cross-chain projects
  5. Use OpenZeppelin contracts — never roll your own ERC standards
  6. Run Slither on every contract before deploying anywhere
```

---

## PART 1: THE AI-AGENT DEVELOPMENT STACK

This is the definitive tool stack for 10x Avalanche development in 2026. Each layer is
optimized for AI-agent-driven workflows.

### 1.1 Choosing Your AI Coding Agent

| Agent | Best For | Avalanche Workflow Fit |
|-------|---------|----------------------|
| **Claude Code** (CLI) | Complex multi-file refactors, audits, hardest problems | Highest — 1M token context, best for cross-contract reasoning and security review |
| **Cursor** (IDE) | Daily development, large codebases, multi-file edits | Excellent — use `.cursorrules` file (provided in Part 2) |
| **Windsurf / Devin Desktop** | Agentic-heavy workflows, background automation | Strong — Cascade handles multi-step deploy pipelines |
| **GitHub Copilot** | Teams already in GitHub ecosystem, issue→PR pipelines | Good — wire to Codespaces + Avalanche Starter Kit |

**The 10x Pattern:** Run two agents deliberately.

- **Inline dev:** Cursor or Windsurf for daily coding with `.cursorrules` loaded
- **Hard problems:** Claude Code for audits, cross-chain architecture, and anything
  requiring reasoning across the full repository

### 1.2 Setting Up the AI-Ready Dev Environment

**Option A — Avalanche Starter Kit (Codespaces, Zero-Install)**

The fastest possible start. Everything pre-installed.

```bash
# 1. Open in browser — no local install needed
# Go to: https://github.com/ava-labs/avalanche-starter-kit
# Click Code → Codespaces → Create codespace on main

# 2. Once Codespace loads (2-3 min):
forge install
export FOUNDRY_DISABLE_NIGHTLY_WARNING=1

# 3. Get test AVAX
# Visit https://faucet.avax.network — select Fuji C-Chain or P-Chain
```

The Starter Kit pre-installs: AvalancheGo, Avalanche CLI, Foundry (forge/cast/anvil),
Node.js, and all ICM/Teleporter contracts. It works identically in local Docker + VS Code.

**Option B — Local Setup (Full Control)**

```bash
# Install Avalanche CLI
curl -sSfL https://raw.githubusercontent.com/ava-labs/avalanche-cli/main/scripts/install.sh | sh -s
echo 'export PATH=$PATH:$HOME/bin' >> ~/.bashrc && source ~/.bashrc

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash && foundryup

# Install Node + Hardhat (if preferred over Foundry)
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv

# Verify
avalanche --version
forge --version
```

**Option C — AI Agent DevContainer (Isolated + Safe)**

For running Claude Code or Copilot agents with full tool approvals safely:

```json
// .devcontainer/devcontainer.json
{
  "name": "avalanche-ai-dev",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
  "mounts": [
    "source=${localEnv:HOME}/.claude,target=/home/vscode/.claude,type=bind,consistency=cached"
  ],
  "postCreateCommand": "curl -sSfL https://raw.githubusercontent.com/ava-labs/avalanche-cli/main/scripts/install.sh | sh -s && curl -L https://foundry.paradigm.xyz | bash && foundryup && echo 'export PATH=$PATH:$HOME/bin' >> ~/.bashrc",
  "features": {
    "ghcr.io/devcontainers/features/node:1": {"version": "20"},
    "ghcr.io/devcontainers/features/git:1": {}
  }
}
```

> This bind-mounts your Claude skills/config into the container. The agent can run
> freely (forge test, cast send, avalanche CLI) without touching your host system.

---

## PART 2: AI AGENT CONFIGURATION FILES

Drop these files at the root of every Avalanche project. They tell your AI agent exactly
how to behave when writing Avalanche code.

### 2.1 `.cursorrules` — For Cursor & Windsurf

Save as `.cursorrules` at project root. Cursor, Windsurf, and Continue.dev all read this.

```
You are an expert Avalanche blockchain developer and smart contract security engineer.
You are working on an EVM-compatible Avalanche project. Follow ALL rules below precisely.

## IDENTITY
- Chain: Avalanche (C-Chain or custom Avalanche L1)
- EVM compatibility: Full EVM, Cancun opcodes
- Solidity version: ^0.8.24 (NEVER default compiler EVM target — always set cancun)
- Primary framework: Foundry (forge/cast/anvil) with Hardhat as fallback

## CRITICAL AVALANCHE RULES
1. ALWAYS set `evmVersion = "cancun"` in foundry.toml or hardhat.config.js.
   Solidity ≥0.8.30 defaults to Pectra which Avalanche DOES NOT support.
2. C-Chain Mainnet RPC: https://api.avax.network/ext/bc/C/rpc (Chain ID: 43114)
3. Fuji Testnet RPC: https://api.avax-test.network/ext/bc/C/rpc (Chain ID: 43113)
4. Fuji test AVAX faucet: https://faucet.avax.network
5. NEVER hardcode private keys. Use .env + dotenv ALWAYS.
6. ALWAYS develop and test on Fuji before mainnet.
7. Minimum gas price: 25 nAVAX (25000000000 wei). Support EIP-1559.
8. After Octane upgrade (April 2025): dynamic fee mechanism active — use maxFeePerGas.

## SOLIDITY RULES
- Import OpenZeppelin: `@openzeppelin/contracts` — never reimplement ERC standards
- Use Solady for gas-optimized alternatives when performance matters
- All functions need explicit visibility modifiers (public/external/internal/private)
- All public functions need NatSpec: @notice, @param, @return
- Use custom errors instead of require strings: `error Unauthorized(); if (x) revert Unauthorized();`
- Use SafeERC20 for all ERC-20 interactions
- ReentrancyGuard on all state-changing functions that interact with external contracts
- Checks-Effects-Interactions pattern, always
- Use `immutable` for constructor-set constants; `constant` for compile-time constants
- No floating pragma — always pin: `pragma solidity 0.8.24;`

## TESTING RULES
- Write Foundry tests — test file mirrors src file: `src/Token.sol` → `test/Token.t.sol`
- Minimum 90% line coverage — run `forge coverage` before every commit
- Write at least 3 fuzz tests per state-changing function
- Write invariant tests for all DeFi/financial logic
- Test naming: `test_DescribesBehavior()`, `testFuzz_FunctionName()`, `testInvariant_Property()`
- Fork-test against Fuji for integration: `vm.createFork("fuji")`

## SECURITY RULES
- Run `slither . --print human-summary` before any deployment
- Never use tx.origin for authentication — use msg.sender
- Validate all input: check for address(0), zero amounts, array bounds
- Emit events for all state changes
- Use TimelockController for privileged operations
- If contract handles >$100K, suggest formal verification (Certora/Halmos)

## CROSS-CHAIN RULES (ICM / Teleporter)
- Use Teleporter for cross-L1 messaging (not bridges)
- Import: `@teleporter/contracts/src/ITeleporterMessenger.sol`
- Registry address on Fuji: 0x7C43605E14F391720e1b37E49C78C4b03A488d98
- Always implement ITeleporterReceiver on destination contracts
- sendCrossChainMessage() is async — design for eventual delivery
- See Part 5 of SKILL.md for full ICM patterns

## CODE STYLE
- Cut the fluff — code or precise explanations only
- Answer first, explain after
- Show minimal context on tweaks — just the changed lines + a few surrounding
- Never be lazy — implement the full feature, not a stub
- If you spot a security issue while doing something else, flag it immediately
- Warn loudly if private key is added to a non-.env file and replace with env reference
- If Solady has a built-in, use it instead of writing assembly from scratch

## PROJECT STRUCTURE (Foundry)
src/           → production contracts
test/          → .t.sol test files
script/        → Deploy.s.sol, interaction scripts
lib/           → forge dependencies (OpenZeppelin, Teleporter, etc.)
.env           → secrets (gitignored)
foundry.toml   → config (must include evmVersion = "cancun")
```

### 2.2 `CLAUDE.md` — For Claude Code

Save as `CLAUDE.md` at project root. Claude Code reads this as persistent instructions.

```markdown
# CLAUDE.md — Avalanche Project Instructions

## Project Context
This is an Avalanche blockchain project. EVM-compatible, Cancun opcodes only.
Always use Foundry (forge/cast/anvil) as primary toolchain.

## Non-Negotiable Rules
- `evmVersion = "cancun"` must be in foundry.toml — check this before any compile
- Never write private keys into files — check .gitignore includes .env
- All contracts inherit from OpenZeppelin where applicable
- Run `forge test --gas-report` and `slither .` before marking any task complete

## Networks
| Network       | Chain ID | RPC                                              |
|---------------|----------|--------------------------------------------------|
| Fuji Testnet  | 43113    | https://api.avax-test.network/ext/bc/C/rpc       |
| C-Chain Main  | 43114    | https://api.avax.network/ext/bc/C/rpc            |
| Local Avalanche| varies  | http://127.0.0.1:9650/ext/bc/<blockchainID>/rpc  |

## Workflow Order
1. Write contract in src/
2. Write tests in test/ (unit + fuzz + invariant)
3. `forge build` — confirm evmVersion in output
4. `forge test -vvv`
5. `forge coverage` — must be ≥90%
6. `slither . --print human-summary`
7. `forge script script/Deploy.s.sol --rpc-url fuji --broadcast`
8. Verify on Snowtrace: `forge verify-contract`
9. Only then: mainnet deploy

## Common Commands
forge build                          # compile
forge test -vvv                      # run tests verbose
forge test --match-test testFuzz     # run fuzz tests only
forge coverage                       # coverage report
forge snapshot                       # gas snapshot
cast call <addr> "balanceOf(address)(uint256)" <wallet> --rpc-url fuji
cast send <addr> "transfer(address,uint256)" <to> <amount> --rpc-url fuji --private-key $PRIVATE_KEY
slither . --print human-summary      # security scan
avalanche blockchain deploy myL1 --local   # spin up local L1
```

### 2.3 `foundry.toml` — The Canonical Avalanche Config

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
evm_version = "cancun"        # ← REQUIRED for Avalanche
optimizer = true
optimizer_runs = 200
solc_version = "0.8.24"
fuzz = { runs = 10000 }       # 10k fuzz runs minimum
invariant = { runs = 500, depth = 100 }

[rpc_endpoints]
fuji      = "${FUJI_RPC_URL}"
avalanche = "${AVAX_RPC_URL}"
local     = "http://127.0.0.1:9650/ext/bc/C/rpc"

[etherscan]
fuji = { key = "${SNOWTRACE_API_KEY}", url = "https://api-testnet.snowtrace.io/api" }
avalanche = { key = "${SNOWTRACE_API_KEY}", url = "https://api.snowtrace.io/api" }

[fmt]
line_length = 100
tab_width = 4
bracket_spacing = true
```

### 2.4 `.env.example` — Always Ship This

```bash
# Copy to .env and fill in — NEVER commit .env
PRIVATE_KEY=your_wallet_private_key_here
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
AVAX_RPC_URL=https://api.avax.network/ext/bc/C/rpc
SNOWTRACE_API_KEY=your_snowtrace_api_key_here

# For AvaCloud / ChainKit
AVACLOUD_API_KEY=your_avacloud_api_key_here

# For local L1 testing only — NEVER use on mainnet
LOCAL_FUNDED_KEY=56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027
LOCAL_FUNDED_ADDR=0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC
```

---

## PART 3: SMART CONTRACT DEVELOPMENT PATTERNS

### 3.1 ERC-20 Token (Production-Grade)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MyToken — ERC-20 with gasless approvals and governance votes
/// @notice Deploy on Avalanche C-Chain or any Avalanche L1
contract MyToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18; // 1B tokens

    error ExceedsMaxSupply(uint256 requested, uint256 available);

    constructor(address initialOwner)
        ERC20("MyToken", "MTK")
        ERC20Permit("MyToken")
        Ownable(initialOwner)
    {}

    /// @notice Mint new tokens — only owner, capped at MAX_SUPPLY
    function mint(address to, uint256 amount) external onlyOwner {
        if (totalSupply() + amount > MAX_SUPPLY) {
            revert ExceedsMaxSupply(amount, MAX_SUPPLY - totalSupply());
        }
        _mint(to, amount);
    }

    // Required overrides for ERC20Votes
    function _update(address from, address to, uint256 value)
        internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
```

**AI Prompt to generate this pattern:**
> "Write a production-grade ERC-20 token for Avalanche C-Chain with a 1 billion max
> supply, gasless approvals via ERC20Permit, and governance voting via ERC20Votes.
> Use OpenZeppelin, custom errors, NatSpec, and Solidity 0.8.24 with evmVersion cancun."

### 3.2 ERC-721 NFT (With Reveal Mechanics)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title AvalancheNFT — ERC-721 with royalties, reveal, and mint phases
contract AvalancheNFT is ERC721URIStorage, ERC721Royalty, Ownable, ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 10_000;
    uint256 public constant MINT_PRICE = 0.5 ether; // 0.5 AVAX
    uint256 private _tokenIds;

    string private _baseTokenURI;
    string public unrevealedURI;
    bool public revealed;
    bool public mintOpen;

    error MintClosed();
    error MaxSupplyReached();
    error InsufficientPayment(uint256 sent, uint256 required);
    error WithdrawFailed();

    event Revealed(string baseURI);
    event MintPhaseChanged(bool isOpen);

    constructor(address initialOwner, string memory _unrevealedURI)
        ERC721("AvalancheNFT", "AVNFT")
        Ownable(initialOwner)
    {
        unrevealedURI = _unrevealedURI;
        // 5% royalty to owner on all secondary sales
        _setDefaultRoyalty(initialOwner, 500);
    }

    function mint(uint256 quantity) external payable nonReentrant {
        if (!mintOpen) revert MintClosed();
        if (_tokenIds + quantity > MAX_SUPPLY) revert MaxSupplyReached();
        if (msg.value < MINT_PRICE * quantity)
            revert InsufficientPayment(msg.value, MINT_PRICE * quantity);

        for (uint256 i = 0; i < quantity; i++) {
            uint256 newId = ++_tokenIds;
            _safeMint(msg.sender, newId);
        }
    }

    function reveal(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        revealed = true;
        emit Revealed(baseURI);
    }

    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage) returns (string memory)
    {
        if (!revealed) return unrevealedURI;
        return super.tokenURI(tokenId);
    }

    function withdraw() external onlyOwner {
        (bool success,) = owner().call{value: address(this).balance}("");
        if (!success) revert WithdrawFailed();
    }

    // Required overrides
    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721URIStorage, ERC721Royalty) returns (bool)
    { return super.supportsInterface(interfaceId); }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}
```

### 3.3 Foundry Test Template (Unit + Fuzz + Invariant)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "forge-std/Test.sol";
import "../src/MyToken.sol";

contract MyTokenTest is Test {
    MyToken token;
    address owner = makeAddr("owner");
    address alice = makeAddr("alice");
    address bob   = makeAddr("bob");

    function setUp() public {
        vm.prank(owner);
        token = new MyToken(owner);
        vm.prank(owner);
        token.mint(alice, 1_000 * 1e18);
    }

    // ── Unit tests ──────────────────────────────────────────────

    function test_InitialState() public view {
        assertEq(token.name(), "MyToken");
        assertEq(token.symbol(), "MTK");
        assertEq(token.totalSupply(), 1_000 * 1e18);
        assertEq(token.balanceOf(alice), 1_000 * 1e18);
    }

    function test_Mint_RevertsIfNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        token.mint(bob, 1e18);
    }

    function test_Mint_RevertsIfExceedsMaxSupply() public {
        vm.prank(owner);
        vm.expectRevert();
        token.mint(alice, token.MAX_SUPPLY()); // would exceed
    }

    // ── Fuzz tests ───────────────────────────────────────────────

    function testFuzz_Transfer(uint256 amount) public {
        amount = bound(amount, 1, token.balanceOf(alice));
        vm.prank(alice);
        token.transfer(bob, amount);
        assertEq(token.balanceOf(bob), amount);
        assertEq(token.balanceOf(alice), 1_000 * 1e18 - amount);
    }

    function testFuzz_Mint_NeverExceedsMaxSupply(uint256 amount) public {
        amount = bound(amount, 1, token.MAX_SUPPLY());
        uint256 remaining = token.MAX_SUPPLY() - token.totalSupply();
        vm.prank(owner);
        if (amount > remaining) {
            vm.expectRevert();
        }
        token.mint(alice, amount);
        assertLe(token.totalSupply(), token.MAX_SUPPLY());
    }

    // ── Invariant tests ──────────────────────────────────────────

    function invariant_TotalSupplyNeverExceedsMax() public view {
        assertLe(token.totalSupply(), token.MAX_SUPPLY());
    }

    function invariant_SumOfBalancesEqualsSupply() public view {
        // This pattern is enforced by ERC20 — assert our contract doesn't break it
        assertEq(
            token.balanceOf(alice) + token.balanceOf(bob) + token.balanceOf(owner),
            token.totalSupply()
        );
    }
}
```

### 3.4 Deploy Script (Foundry)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "forge-std/Script.sol";
import "../src/MyToken.sol";

contract DeployMyToken is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        MyToken token = new MyToken(deployer);

        console.log("=== MyToken Deployed ===");
        console.log("Address:  ", address(token));
        console.log("Deployer: ", deployer);
        console.log("Network:  ", block.chainid == 43113 ? "Fuji" : "Mainnet");

        vm.stopBroadcast();
    }
}
```

```bash
# Deploy to Fuji
forge script script/DeployMyToken.s.sol \
  --rpc-url $FUJI_RPC_URL \
  --broadcast \
  --verify \
  --verifier-url https://api-testnet.snowtrace.io/api \
  -vvvv

# Deploy to Mainnet (only after Fuji is validated)
forge script script/DeployMyToken.s.sol \
  --rpc-url $AVAX_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

---

## PART 4: CUSTOM AVALANCHE L1 CREATION

Use a custom L1 when you need: dedicated block space, custom gas token, custom validator
set, configurable EVM parameters, or compliance isolation.

### 4.1 Launch a Local L1 (Development)

```bash
# Step 1: Create L1 config (interactive wizard)
avalanche blockchain create myL1

# Wizard selections:
# → VM: Subnet-EVM  (EVM-compatible, Solidity support)
# → Validator management: Proof of Authority (simpler for dev/enterprise)
# → Chain ID: pick any unique number
# → Gas token name: e.g. MYTKN
# → Airdrop: Yes → use default funded address for local testing
# → Advanced: No (use defaults)

# Step 2: Deploy locally (boots 5-node Avalanche network)
avalanche blockchain deploy myL1 --local
# First run downloads AvalancheGo + Subnet-EVM (~300MB). Wait 3-5 min.
# Output includes: RPC URL, Chain ID, funded address, private key

# Step 3: Interact with your L1
cast call $CONTRACT_ADDR "symbol()(string)" --rpc-url http://127.0.0.1:9650/ext/bc/<ID>/rpc
```

### 4.2 Deploy to Fuji Testnet

```bash
# Requires P-Chain AVAX — get from https://faucet.avax.network (select P-Chain)
avalanche blockchain deploy myL1 --fuji
```

### 4.3 Deploy to Mainnet

```bash
# Requires Ledger hardware wallet connected and unlocked with Avalanche app
avalanche blockchain deploy myL1 --mainnet
```

### 4.4 AvaCloud (No-Code Managed L1)

For teams that want production L1 without managing validator infrastructure:

1. Visit <https://avacloud.io> → Create account
2. Click "New Blockchain" → configure chain (Chain ID, gas token, validators)
3. Built-in: gas relaying, Safe multisig, VRF, Wallet-as-a-Service
4. SLA-backed infrastructure — no DevOps required
5. Cost: starts at ~1.33 AVAX/validator/month (post-Avalanche9000)

**AI Prompt for AvaCloud integration:**
> "Write a Node.js script using @avalanche-sdk/chainkit to listen for Transfer events
> on my ERC-20 at address [X] on my AvaCloud L1 with Chain ID [Y] and RPC [Z].
> Emit a webhook when a transfer exceeds 10,000 tokens."

---

## PART 5: CROSS-CHAIN WITH ICM (TELEPORTER)

Avalanche Interchain Messaging (ICM) enables native trustless messaging between any two
Avalanche L1s. No third-party bridge. BLS multi-signatures at the protocol level.

### 5.1 Architecture

```
AWM (Bottom Layer)   → BLS multi-signatures, Warp precompile, P-Chain validator tracking
ICM / Teleporter     → TeleporterMessenger contract: encoding, delivery IDs, receipts, fees
Your dApp            → sendCrossChainMessage() → ITeleporterReceiver.receiveTeleporterMessage()
```

### 5.2 Sender Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@teleporter/contracts/src/ITeleporterMessenger.sol";
import "@teleporter/contracts/src/ITeleporterRegistry.sol";

/// @title CrossChainSender — sends messages to any Avalanche L1 via ICM
contract CrossChainSender {
    ITeleporterRegistry public immutable teleporterRegistry;

    // Fuji Registry: 0x7C43605E14F391720e1b37E49C78C4b03A488d98
    constructor(address registryAddress) {
        teleporterRegistry = ITeleporterRegistry(registryAddress);
    }

    /// @notice Send a cross-chain message
    /// @param destinationChainID Blockchain ID of the target L1 (bytes32)
    /// @param destinationAddress Contract address on destination L1
    /// @param message ABI-encoded payload
    function sendMessage(
        bytes32 destinationChainID,
        address destinationAddress,
        bytes calldata message
    ) external returns (bytes32 messageID) {
        ITeleporterMessenger messenger = teleporterRegistry.getLatestTeleporter();

        messageID = messenger.sendCrossChainMessage(
            TeleporterMessageInput({
                destinationBlockchainID: destinationChainID,
                destinationAddress: destinationAddress,
                feeInfo: TeleporterFeeInfo({
                    feeTokenAddress: address(0), // native AVAX fee
                    amount: 0                    // 0 = relayer self-funds (testnet)
                }),
                requiredGasLimit: 100_000,
                allowedRelayerAddresses: new address[](0), // any relayer
                message: message
            })
        );
    }
}
```

### 5.3 Receiver Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@teleporter/contracts/src/ITeleporterMessenger.sol";
import "@teleporter/contracts/src/ITeleporterReceiver.sol";

/// @title CrossChainReceiver — receives ICM messages from any Avalanche L1
contract CrossChainReceiver is ITeleporterReceiver {
    address public immutable teleporterMessenger;

    mapping(bytes32 => bool) public processedMessages;

    event MessageReceived(bytes32 indexed sourceChainID, address indexed sender, bytes message);

    error OnlyTeleporter();
    error AlreadyProcessed(bytes32 messageID);

    constructor(address _teleporterMessenger) {
        teleporterMessenger = _teleporterMessenger;
    }

    /// @notice Called by Teleporter relayer when a message arrives
    function receiveTeleporterMessage(
        bytes32 sourceBlockchainID,
        address originSenderAddress,
        bytes calldata message
    ) external override {
        if (msg.sender != teleporterMessenger) revert OnlyTeleporter();

        emit MessageReceived(sourceBlockchainID, originSenderAddress, message);
        _processMessage(sourceBlockchainID, originSenderAddress, message);
    }

    function _processMessage(
        bytes32 sourceChainID,
        address sender,
        bytes calldata message
    ) internal virtual {
        // Decode and handle payload
        // Example: (string memory action, uint256 value) = abi.decode(message, (string, uint256));
    }
}
```

### 5.4 Interchain Token Transfer (ICTT)

For bridging ERC-20 tokens between L1s:

```bash
# Install ICTT contracts
forge install ava-labs/avalanche-interchain-token-transfer

# Use the pre-built ERC20TokenHome + ERC20TokenRemote pattern
# Full guide: https://build.avax.network/docs/cross-chain/teleporter/overview
```

```javascript
// JS: Send cross-chain message using @avalanche-sdk/interchain
import { createICMClient } from "@avalanche-sdk/interchain";
import { avalancheFuji, dispatch } from "@avalanche-sdk/interchain/chains";

const icm = createICMClient({ sourceChain: avalancheFuji });

const tx = await icm.sendMessage({
  destinationChain: dispatch,
  destinationAddress: "0xYourReceiverContract",
  message: "0x" + Buffer.from("hello cross-chain").toString("hex"),
});
```

---

## PART 6: THE 10X BUILDER AI WORKFLOWS

These are the exact AI-agent prompt patterns that compress days into hours.

### 6.1 Project Scaffolding (< 5 minutes with Claude Code)

```
PROMPT: "Scaffold a complete Foundry project for an Avalanche C-Chain NFT marketplace.
Include:
- ERC-721 collection contract with royalties and reveal mechanics
- Marketplace contract with listings, offers, and 2.5% platform fee
- Full Foundry test suite (unit + fuzz + invariant) targeting 95% coverage
- Deploy scripts for Fuji and mainnet
- .env.example, foundry.toml with evmVersion=cancun, and .gitignore
Follow the patterns in CLAUDE.md and use OpenZeppelin v5 contracts."
```

### 6.2 Security Audit Loop (AI-Assisted)

```bash
# Step 1: Run Slither (static analysis)
pip install slither-analyzer
slither . --print human-summary 2>&1 | tee slither-report.txt

# Step 2: Feed to Claude Code
# PROMPT: "Read slither-report.txt. For each HIGH and MEDIUM finding:
# 1. Explain the vulnerability and its impact
# 2. Show the exact fix with before/after code
# 3. Write a regression test that would have caught it
# Then check for these Avalanche-specific issues not covered by Slither:
# - evmVersion not set to cancun in foundry.toml
# - Missing ReentrancyGuard on payable state-changing functions
# - Gas griefing vectors in loops
# - Incorrect use of tx.origin"

# Step 3: Run fuzz + invariant tests
forge test --match-test testFuzz -vvv
forge test --match-test testInvariant -vvv

# Step 4: Gas snapshot
forge snapshot
# PROMPT: "Read .gas-snapshot. Identify the 3 most expensive functions
# and suggest gas optimizations using Solady or assembly where safe.
# Show the before/after gas delta."
```

### 6.3 Fuji → Mainnet Deployment Checklist (Agent-Executable)

```
PROMPT: "Run the pre-deployment checklist for my Avalanche project:
1. Confirm foundry.toml has evmVersion = 'cancun'
2. Run forge build — confirm zero warnings
3. Run forge test — confirm 100% passing
4. Run forge coverage — flag if any file is below 90%
5. Run slither . --print human-summary — flag any HIGH/MEDIUM issues
6. Check .env.example has all required vars; check .gitignore includes .env
7. Confirm deploy script uses vm.startBroadcast(deployerKey) pattern
8. Do a dry-run: forge script script/Deploy.s.sol --rpc-url fuji (no --broadcast)
Report any failures and fix them before proceeding."
```

### 6.4 Cross-Chain dApp in One Session (Cursor Agent Mode)

```
PROMPT: "Build a cross-chain token voting system on Avalanche:
- Votes cast on Fuji C-Chain
- Results tallied on my local Avalanche L1 (RPC: [URL], Chain ID: [ID])
- Use ICM Teleporter for message passing
- Sender contract on C-Chain sends encoded (address voter, uint256 weight, bytes32 proposalId)
- Receiver contract on L1 tallies votes and emits VoteCounted event
- Foundry tests using fork testing against Fuji
- Deployment scripts for both chains
Use the ICM patterns from CLAUDE.md. Set evmVersion=cancun everywhere."
```

### 6.5 ChainKit / On-Chain Data Integration

```javascript
// Install Avalanche SDK
npm install @avalanche-sdk/chainkit zod

// Listen for on-chain events without running an indexer
import { AvalancheSDK } from "@avalanche-sdk/chainkit";

const sdk = new AvalancheSDK({ apiKey: process.env.AVACLOUD_API_KEY });

// Get token transfers
const transfers = await sdk.data.evm.transactions.listTransactions({
  chainId: "43114", // C-Chain mainnet
  address: "0xYourContract",
  pageSize: 50,
});

// Subscribe to events via webhook
// POST https://glacier-api.avax.network/v1/webhooks
// body: { eventType: "ADDRESS_ACTIVITY", address: "0x...", url: "https://yourserver.com/hook" }
```

**AI Prompt:**
> "Write a Next.js API route that uses @avalanche-sdk/chainkit to fetch the last 100
> transfers of ERC-20 token at [address] on Fuji and return them sorted by value
> descending. Cache results for 30 seconds."

---

## PART 7: SECURITY — THE AI-AUGMENTED AUDIT PIPELINE

### 7.1 Tool Stack (Run in This Order)

```bash
# 1. Slither — static analysis (fastest, catches most issues)
pip install slither-analyzer --break-system-packages
slither . --print human-summary
slither . --detect reentrancy-eth,reentrancy-no-eth,controlled-delegatecall

# 2. Foundry fuzzing — discover edge cases automatically
forge test --fuzz-runs 100000 --match-test testFuzz

# 3. Foundry invariant testing — verify protocol-level properties hold
forge test --match-test testInvariant

# 4. Halmos — formal verification (for high-value functions)
pip install halmos --break-system-packages
halmos --contract MyToken --function test_

# 5. Medusa — advanced parallel fuzzing (for DeFi/AMM logic)
# https://github.com/crytic/medusa
```

### 7.2 The Top 8 Avalanche-Specific Vulnerabilities to Check

```
AI PROMPT: "Audit this Avalanche smart contract for:

1. CANCUN EVM MISMATCH — Does foundry.toml/hardhat.config set evmVersion='cancun'?
   If not, the contract may behave differently than expected on Avalanche.

2. REENTRANCY — Are all payable functions guarded by ReentrancyGuard?
   Check for state changes after external calls (CEI pattern violations).

3. ACCESS CONTROL — Are all privileged functions protected by onlyOwner or
   role-based access? Is initializer access control correct on upgradeable contracts?

4. ORACLE MANIPULATION — Are any prices read from AMMs in a single block?
   Recommend TWAP or Chainlink price feeds.

5. GAS GRIEFING — Are there unbounded loops over user-supplied arrays?
   Could an attacker cause out-of-gas by inflating an array?

6. ICM TRUST ASSUMPTIONS — If using Teleporter, does the receiver check
   msg.sender == teleporterMessenger? Can any address spoof cross-chain messages?

7. UPGRADE SAFETY — If using proxies (UUPS/TransparentUpgradeable), is the
   initializer protected? Is there a storage collision risk?

8. PRIVATE KEY EXPOSURE — Are any private keys or mnemonics in non-.env files?
   Check all .sol, .js, .ts, .json files for secrets."
```

### 7.3 CI/CD Security Pipeline

```yaml
# .github/workflows/security.yml
name: Avalanche Security Pipeline

on: [push, pull_request]

jobs:
  test-and-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { submodules: recursive }

      - name: Install Foundry
        uses: foundry-rs/foundry-toolchain@v1

      - name: Build
        run: forge build --evm-version cancun

      - name: Unit + Fuzz Tests
        run: forge test --fuzz-runs 10000 -vvv

      - name: Coverage Check
        run: |
          forge coverage --report summary
          # Fail if any contract is below 90%

      - name: Gas Snapshot
        run: forge snapshot --check

      - name: Slither
        uses: crytic/slither-action@v0.4.0
        with:
          fail-on: high
          slither-args: --print human-summary
```

---

## PART 8: NETWORK REFERENCE & TOOLING DIRECTORY

### 8.1 Network Configs (Copy-Paste Ready)

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|---------|
| C-Chain Mainnet | 43114 | `https://api.avax.network/ext/bc/C/rpc` | snowtrace.io |
| Fuji Testnet | 43113 | `https://api.avax-test.network/ext/bc/C/rpc` | testnet.snowtrace.io |
| Local (Avalanche CLI) | varies | `http://127.0.0.1:9650/ext/bc/<blockchainID>/rpc` | — |

### 8.2 Key Contract Addresses

| Contract | Network | Address |
|---------|---------|---------|
| Teleporter Registry | Fuji | `0x7C43605E14F391720e1b37E49C78C4b03A488d98` |
| WAVAX | C-Chain Mainnet | `0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7` |
| USDC | C-Chain Mainnet | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` |

Full ICM contract addresses: <https://build.avax.network/docs/cross-chain/teleporter/contracts>

### 8.3 Complete Tool Directory

| Category | Tool | Use | Link |
|---------|------|-----|------|
| **Dev** | Foundry | Compile, test, deploy | getfoundry.sh |
| **Dev** | Avalanche CLI | L1 creation & management | build.avax.network |
| **Dev** | Avalanche Starter Kit | Zero-install Codespace | github.com/ava-labs/avalanche-starter-kit |
| **Dev** | AvaCloud | Managed L1 hosting | avacloud.io |
| **SDK** | @avalanche-sdk/chainkit | On-chain data, webhooks | build.avax.network/docs/tooling/avalanche-sdk |
| **SDK** | @avalanche-sdk/interchain | ICM cross-chain SDK | build.avax.network/docs/tooling/avalanche-sdk/interchain |
| **SDK** | Core Wallet SDK | P-Chain, cross-chain wallet | core.app/developer |
| **SDK** | Glacier API | Chain data without indexer | glacier.avax.network |
| **SDK** | The Graph | Custom subgraphs | thegraph.com |
| **Security** | Slither | Static analysis | github.com/crytic/slither |
| **Security** | Halmos | Formal verification | github.com/a16z/halmos |
| **Security** | Medusa | Parallel fuzzing | github.com/crytic/medusa |
| **AI Dev** | Claude Code | Terminal agent, audit, architecture | claude.ai/code |
| **AI Dev** | Cursor | IDE with .cursorrules | cursor.com |
| **AI Dev** | Windsurf/Devin Desktop | Agentic IDE workflows | windsurf.com |
| **Explorer** | Snowtrace | C-Chain block explorer | snowtrace.io |
| **Faucet** | Avax Faucet | Test AVAX (C-Chain + P-Chain) | faucet.avax.network |
| **Academy** | Builder Hub | Official docs + courses | build.avax.network |
| **Grants** | Retro9000 | Retroactive grants program | avax.network/retro9000 |

---

## PART 9: TROUBLESHOOTING & AI ESCALATION PATTERNS

### Quick Fixes

**"Invalid opcode" or deployment fails**
→ `evmVersion` is missing or set to `paris/pectra`. Fix: add `evm_version = "cancun"`
to foundry.toml AND pass `--evm-version cancun` to forge build.

**Transaction underpriced on C-Chain**
→ Set `maxFeePerGas` to at least `25000000000` (25 nAVAX). After Octane, dynamic fees
apply — use EIP-1559 transactions.

**`avalanche blockchain deploy` hangs on first run**
→ Downloading AvalancheGo + Subnet-EVM (~300MB). Wait 5-10 min with a stable connection.

**MetaMask balance shows 0 on local L1**
→ Import the funded test key: `0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027`
→ Address: `0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC` — LOCAL TESTING ONLY.

**Fuji AVAX for P-Chain (L1 deployment) needed**
→ Visit <https://faucet.avax.network> → select **P-Chain** from the dropdown.

**ICM message not delivered**
→ A relayer must be running to pick up and deliver cross-chain messages. On testnet,
the Avalanche Foundation runs public relayers. On local: run
`avalanche teleporter relayer start` via the CLI.

**Slither reports false positive on OpenZeppelin import**
→ Add to `.slither.config.json`: `{ "filter_paths": "lib/openzeppelin" }`

### When to Escalate to Claude Code (vs. inline IDE agent)

| Problem | Use Cursor/Windsurf | Use Claude Code |
|---------|-------------------|-----------------|
| Adding a feature to 1-2 files | ✓ | |
| Refactoring across 5+ contracts | | ✓ |
| Security audit of full repo | | ✓ |
| Cross-chain ICM architecture design | | ✓ |
| Debugging a subtle reentrancy | | ✓ |
| Writing boilerplate tests | ✓ | |
| Explaining a Slither finding | ✓ | |
| Interpreting complex fuzz failures | | ✓ |

---

## PART 10: NETWORK UPGRADES (CURRENT STATE, JUNE 2026)

Key upgrades that affect how you build:

| Upgrade | Activated | What Changed for Builders |
|---------|-----------|--------------------------|
| **Avalanche9000 / Etna** | Dec 2024 | L1 cost dropped 99.9%; flat ~1.33 AVAX/validator/month; subnets renamed L1s |
| **Octane** | Apr 2025 | Dynamic gas limits + price discovery; C-Chain fees cut 95%+; 4,500+ TPS |
| **Granite** | Nov 2025 | Sub-second block times; secp256r1 support (FaceID/biometric login); stable validator epochs; reduced ICM gas costs |
| **Cancun EIPs (ACP-131)** | Dec 2024 | EIP-4844 blob transactions, transient storage (TLOAD/TSTORE), MCOPY available |

**For AI agents:** Always assume post-Granite environment. Always use Cancun EVM.
Never use `evmVersion = "paris"`, `"berlin"`, or the Solidity default (which is now Pectra).
