# CLAUDE.md — Avalanche Project Instructions
# Drop this file at project root. Claude Code reads it as persistent context.

## Project Type
Avalanche blockchain project — EVM-compatible, Cancun opcodes, Foundry toolchain.

## The One Rule That Must Never Be Broken
`evm_version = "cancun"` must exist in foundry.toml before ANYTHING is compiled.
Solidity ≥0.8.30 defaults to Pectra EVM. Avalanche does not support Pectra.
This is a silent failure — contracts deploy but behave incorrectly.
CHECK THIS FIRST on every task. If missing, fix it before proceeding.

## Networks

| Network         | Chain ID | RPC                                             |
|-----------------|----------|-------------------------------------------------|
| Fuji Testnet    | 43113    | https://api.avax-test.network/ext/bc/C/rpc      |
| C-Chain Mainnet | 43114    | https://api.avax.network/ext/bc/C/rpc           |
| Local L1        | varies   | http://127.0.0.1:9650/ext/bc/<blockchainID>/rpc |

Local funded address (TEST ONLY — never mainnet):
- Address: 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC
- Key: 0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027

## Standard Workflow (Follow This Order)

1. `forge build` — confirm evm_version in compile output
2. Write/update tests in test/*.t.sol
3. `forge test -vvv`
4. `forge coverage` — flag files below 90%
5. `slither . --print human-summary`
6. Fix all HIGH/MEDIUM slither findings
7. `forge script script/Deploy.s.sol --rpc-url fuji` (dry-run, no --broadcast)
8. `forge script script/Deploy.s.sol --rpc-url fuji --broadcast --verify`
9. Validate on Fuji Snowtrace: https://testnet.snowtrace.io
10. Only then: repeat steps 7-9 with `--rpc-url avalanche` for mainnet

## Common Cast Commands

```bash
# Read contract state
cast call <addr> "symbol()(string)" --rpc-url $FUJI_RPC_URL
cast call <addr> "balanceOf(address)(uint256)" <wallet> --rpc-url $FUJI_RPC_URL

# Send transaction
cast send <addr> "transfer(address,uint256)" <to> <amt> \
  --rpc-url $FUJI_RPC_URL --private-key $PRIVATE_KEY

# Decode calldata
cast decode-calldata "transfer(address,uint256)" <hex>

# Get block info
cast block latest --rpc-url $FUJI_RPC_URL

# Estimate gas
cast estimate <addr> "mint(address,uint256)" <to> <amt> --rpc-url $FUJI_RPC_URL
```

## Common Forge Commands

```bash
forge build                                  # compile
forge test -vvv                              # run all tests verbose
forge test --match-test testFuzz -vvv        # fuzz tests only
forge test --match-contract TokenTest -vvv   # one test file
forge coverage --report lcov                 # coverage report
forge snapshot                               # gas snapshot
forge snapshot --check                       # fail if gas regressed
forge verify-contract <addr> src/MyToken.sol:MyToken \
  --chain-id 43113 --verifier-url https://api-testnet.snowtrace.io/api
```

## Avalanche CLI Commands

```bash
avalanche blockchain create myL1            # create L1 config
avalanche blockchain deploy myL1 --local    # deploy to local 5-node network
avalanche blockchain deploy myL1 --fuji     # deploy to Fuji testnet
avalanche blockchain deploy myL1 --mainnet  # deploy to mainnet (needs Ledger)
avalanche blockchain list                   # list all L1s
avalanche network start                     # start local Avalanche network
avalanche network stop                      # stop local network
avalanche network status                    # check network status
avalanche teleporter relayer start          # start ICM relayer (local testing)
```

## Security Scan Commands

```bash
# Install once
pip install slither-analyzer halmos --break-system-packages

# Run slither
slither . --print human-summary
slither . --detect reentrancy-eth,controlled-delegatecall

# Run halmos (formal verification)
halmos --contract MyToken --function test_

# Run with 100k fuzz iterations
forge test --fuzz-runs 100000 --match-test testFuzz
```

## Key Contract Addresses

| Contract             | Network  | Address                                      |
|----------------------|----------|----------------------------------------------|
| Teleporter Registry  | Fuji     | 0x7C43605E14F391720e1b37E49C78C4b03A488d98   |
| WAVAX                | Mainnet  | 0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7   |
| USDC                 | Mainnet  | 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E   |

Full addresses: https://build.avax.network/docs/cross-chain/teleporter/contracts

## What to Always Check When I Hand You Code

1. Is `evm_version = "cancun"` set?
2. Are there any private keys outside of .env?
3. Are all ERC-20 interactions using SafeERC20?
4. Are state-changing external-call functions protected by ReentrancyGuard?
5. Does any ICM receiver check msg.sender == teleporterMessenger?
6. Is .env in .gitignore?

If any of these are missing, fix them before doing anything else I asked for.
