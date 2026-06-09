# How To — AvaxQuick End-to-End Guide

This guide walks you from a fresh clone to a running dApp on Avalanche Fuji testnet: contracts compiled, tested, deployed, verified, and connected to the Next.js frontend.

## Table of Contents

1. [Overview](#overview)
2. [Install tools](#install-tools)
3. [Configure secrets](#configure-secrets)
4. [Build and test contracts](#build-and-test-contracts)
5. [Deploy to Fuji](#deploy-to-fuji)
6. [Run the frontend](#run-the-frontend)
7. [Use the dashboard](#use-the-dashboard)
8. [Deploy to mainnet](#deploy-to-mainnet)
9. [Use AI agents effectively](#use-ai-agents-effectively)
10. [Troubleshooting](#troubleshooting)

---

## Overview

AvaxQuick is a full-stack Avalanche starter, not just config templates:

- **Contract** — `src/AvaxQuick.sol`: ERC-20 with permit, votes, capped supply, role-based minting
- **Tests** — unit, fuzz, and invariant tests in `test/`
- **Deploy** — `script/Deploy.s.sol` for Fuji and mainnet
- **Frontend** — Next.js dashboard in `frontend/` with RainbowKit + wagmi
- **CI** — GitHub Actions pipeline in `.github/workflows/avalanche-ci.yml`
- **AI config** — `.cursorrules`, `CLAUDE.md`, `SKILL.md`, `AI-PROMPT-LIBRARY.md`

### The one rule every file emphasizes

```toml
evm_version = "cancun"
```

Avalanche supports **Cancun** opcodes. Solidity ≥0.8.30 defaults to **Pectra**, which Avalanche does **not** support. Contracts may deploy but behave incorrectly without `evm_version = "cancun"` in `foundry.toml`.

---

## Install tools

### Foundry (required)

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
forge --version
```

### Node.js 20+ (for frontend)

```bash
node --version   # should be v20+
```

### Clone and install project deps

```bash
git clone <your-repo-url>
cd AVAX_QuickStart

# Solidity dependencies (OpenZeppelin, forge-std)
forge install

# Frontend packages
cd frontend
npm install
cd ..
```

### Optional: Avalanche CLI (for L1 / local network work)

```bash
curl -sSfL https://raw.githubusercontent.com/ava-labs/avalanche-cli/main/scripts/install.sh | sh -s
avalanche --version
```

### Optional: Slither (security analysis)

```bash
pip install slither-analyzer --break-system-packages
```

---

## Configure secrets

### Root `.env` (deployment)

```bash
cp .env.example .env
```

Edit `.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | Yes (deploy) | Deployer wallet private key — **never commit** |
| `FUJI_RPC_URL` | Yes | Default: `https://api.avax-test.network/ext/bc/C/rpc` |
| `AVAX_RPC_URL` | Mainnet only | Default: `https://api.avax.network/ext/bc/C/rpc` |
| `SNOWTRACE_API_KEY` | Verify | From [snowtrace.io/myapikey](https://snowtrace.io/myapikey) |
| `AVACLOUD_API_KEY` | Optional | For AvaCloud / ChainKit integrations |
| `LOCAL_FUNDED_KEY` | Local only | Pre-funded local test key — **never mainnet** |

Fund your deployer wallet with Fuji C-Chain AVAX: [faucet.avax.network](https://faucet.avax.network)

### Frontend `.env.local`

```bash
cp frontend/.env.local.example frontend/.env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes | From [cloud.walletconnect.com](https://cloud.walletconnect.com) |
| `NEXT_PUBLIC_AVAX_QUICK_ADDRESS` | After deploy | Deployed `AvaxQuick` contract address on Fuji |

Both `.env` and `frontend/.env.local` are gitignored. Never commit them.

---

## Build and test contracts

### Compile

```bash
forge build
```

Verify the build log references Cancun EVM. If `evm_version` is missing from `foundry.toml`, fix it before proceeding.

### Run tests

```bash
# All tests (verbose)
forge test -vvv

# Fuzz tests only
forge test --match-test testFuzz -vvv

# Invariant tests only
forge test --match-test testInvariant -vvv
```

### Coverage

```bash
forge coverage --report summary
```

Target ≥90% line coverage on `src/AvaxQuick.sol` before deploying.

### Security scan

```bash
slither . --print human-summary --filter-paths "lib/"
```

Resolve all HIGH and MEDIUM findings before broadcast.

### Gas snapshot (optional)

```bash
forge snapshot
forge snapshot --check   # fails CI if gas regressed
```

---

## Deploy to Fuji

Follow this order every time:

### Step 1 — Dry-run (no on-chain transaction)

```bash
forge script script/Deploy.s.sol --rpc-url fuji -vvvv
```

Review the simulated output. The script:

1. Deploys `AvaxQuick` with deployer as admin + minter
2. Mints 100,000,000 AXQ (10% of max supply) to deployer

### Step 2 — Broadcast

```bash
forge script script/Deploy.s.sol \
  --rpc-url fuji \
  --broadcast \
  -vvvv
```

### Step 3 — Verify on Snowtrace

```bash
forge script script/Deploy.s.sol \
  --rpc-url fuji \
  --broadcast \
  --verify \
  -vvvv
```

Or verify manually:

```bash
forge verify-contract <DEPLOYED_ADDRESS> \
  src/AvaxQuick.sol:AvaxQuick \
  --chain-id 43113 \
  --verifier-url https://api-testnet.snowtrace.io/api \
  --etherscan-api-key $SNOWTRACE_API_KEY \
  --constructor-args $(cast abi-encode "constructor(address)" <DEPLOYER_ADDRESS>)
```

Confirm on [testnet.snowtrace.io](https://testnet.snowtrace.io).

### Step 4 — Record the address

Copy the deployed contract address into `frontend/.env.local`:

```env
NEXT_PUBLIC_AVAX_QUICK_ADDRESS=0x...
```

---

## Run the frontend

### Sync the contract ABI

After any contract change, rebuild and sync:

```bash
forge build
cd frontend
npm run sync-abi
```

This reads `out/AvaxQuick.sol/AvaxQuick.json` and writes `frontend/src/abi/AvaxQuick.ts`.

### Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build (optional)

```bash
npm run build
npm run start
```

---

## Use the dashboard

1. **Connect wallet** — Click Connect in the header (MetaMask, Core Wallet, or WalletConnect)
2. **Switch network** — Must be on **Avalanche Fuji** (chain ID `43113`). Use the wallet network switcher if prompted
3. **View balances** — AVAX and AXQ balances, total supply, connected address
4. **Transfer** — Enter recipient `0x...` address and amount, click Send, confirm in wallet
5. **Burn** — Enter amount to burn from your own balance, confirm in wallet

If you see the amber banner about `NEXT_PUBLIC_AVAX_QUICK_ADDRESS`, the contract address is not set or invalid in `.env.local`.

---

## Deploy to mainnet

Only after Fuji is fully validated:

```bash
# Dry-run
forge script script/Deploy.s.sol --rpc-url avalanche -vvvv

# Broadcast + verify
forge script script/Deploy.s.sol \
  --rpc-url avalanche \
  --broadcast \
  --verify \
  -vvvv
```

Mainnet checklist:

- [ ] Fuji deployment tested with frontend
- [ ] Slither clean
- [ ] Coverage ≥90%
- [ ] Deployer wallet funded with mainnet AVAX
- [ ] EIP-1559 gas (`maxFeePerGas` ≥ 25 gwei)
- [ ] Snowtrace verification succeeded
- [ ] Update frontend env for mainnet (change wagmi chain in `frontend/src/config/wagmi.ts`)

---

## Use AI agents effectively

### Cursor

Open the project in Cursor. `.cursorrules` loads automatically. Use Agent mode for multi-file changes.

Example prompts (see `AI-PROMPT-LIBRARY.md` for more):

```
Add a faucet page to the frontend that lets MINTER_ROLE holders mint to any address.
Follow .cursorrules — evm_version cancun, SafeERC20, ReentrancyGuard where needed.
```

### Claude Code

Place `CLAUDE.md` at project root (already present). Claude reads it as persistent context.

Workflow order from `CLAUDE.md`:

1. `forge build` → 2. write tests → 3. `forge test` → 4. coverage → 5. Slither → 6. Fuji dry-run → 7. broadcast → 8. verify → 9. mainnet

### Copying this kit into another project

If starting fresh elsewhere, copy these files to the new project root:

| File | Purpose |
|------|---------|
| `.cursorrules` | Cursor agent rules |
| `CLAUDE.md` | Claude Code instructions |
| `foundry.toml` | Avalanche Foundry config (or merge `evm_version = "cancun"`) |
| `SKILL.md` | Full builder playbook |
| `AI-PROMPT-LIBRARY.md` | Prompt templates |
| `.github/workflows/avalanche-ci.yml` | CI pipeline |

---

## Troubleshooting

### "Invalid opcode" or deployment fails silently

**Cause:** Wrong EVM version (Pectra/Paris instead of Cancun).

**Fix:** Ensure `foundry.toml` contains `evm_version = "cancun"`, then `forge clean && forge build`.

### Transaction underpriced on C-Chain

**Cause:** Gas below Avalanche minimum after Octane upgrade.

**Fix:** Use EIP-1559 with `maxFeePerGas` ≥ `25000000000` (25 gwei).

### Frontend shows "Set NEXT_PUBLIC_AVAX_QUICK_ADDRESS"

**Cause:** Missing or invalid contract address in `frontend/.env.local`.

**Fix:** Deploy to Fuji, copy address, restart `npm run dev`.

### `npm run sync-abi` fails

**Cause:** Foundry artifact not built.

**Fix:** Run `forge build` from repo root, then retry `npm run sync-abi`.

### Wallet on wrong network

**Cause:** Connected to Ethereum mainnet or another chain.

**Fix:** Switch to Avalanche Fuji (43113) via RainbowKit / wallet UI.

### Slither false positives on OpenZeppelin

**Fix:** Add `.slither.config.json`:

```json
{ "filter_paths": "lib/" }
```

### CI dry-run deploy fails

**Cause:** Missing `FUJI_DEPLOY_KEY` GitHub secret on the repository.

**Fix:** Add the secret in GitHub → Settings → Secrets → Actions.

### Need more help?

- Full Avalanche playbook: [SKILL.md](./SKILL.md)
- Network reference and tooling: SKILL.md Part 8
- AI prompts: [AI-PROMPT-LIBRARY.md](./AI-PROMPT-LIBRARY.md)
- Official docs: [build.avax.network](https://build.avax.network)
