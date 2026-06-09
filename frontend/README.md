# AvaxQuick Frontend

Next.js dashboard for interacting with the **AvaxQuick (AXQ)** ERC-20 token on Avalanche Fuji testnet. Connect a wallet, view balances, transfer tokens, and burn your own supply.

## Stack

| Package | Version | Role |
|---------|---------|------|
| Next.js | 16.x | App Router, SSR-compatible wallet providers |
| React | 19.x | UI |
| wagmi | 2.x | React hooks for Ethereum/Avalanche RPC |
| viem | 2.x | Low-level ABI encoding and types |
| RainbowKit | 2.x | Wallet connection UI (MetaMask, Core, WalletConnect) |
| TanStack Query | 5.x | Async state for contract reads |
| Tailwind CSS | 4.x | Styling |

## Prerequisites

- Node.js 20+
- Deployed `AvaxQuick` contract on Fuji (see root [HOW_TO.md](../HOW_TO.md))
- [WalletConnect Cloud](https://cloud.walletconnect.com) project ID
- Fuji test AVAX in your wallet ([faucet](https://faucet.avax.network))

## Quick Start

```bash
# From repo root — build contract first
forge build

# Frontend setup
cd frontend
cp .env.local.example .env.local
# Edit .env.local (see Environment Variables below)

npm install
npm run sync-abi    # copy ABI from ../out/AvaxQuick.sol/AvaxQuick.json
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `frontend/.env.local` from `.env.local.example`:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes | WalletConnect Cloud project ID for RainbowKit |
| `NEXT_PUBLIC_AVAX_QUICK_ADDRESS` | Yes (after deploy) | Checksummed `AvaxQuick` contract address on Fuji |

Example:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=abc123def456
NEXT_PUBLIC_AVAX_QUICK_ADDRESS=0xYourDeployedContractAddress
```

`.env.local` is gitignored. Never commit wallet keys or secrets here.

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout, metadata, Providers wrapper
│   │   ├── page.tsx         # Home — renders TokenDashboard
│   │   └── globals.css      # Tailwind base styles
│   ├── components/
│   │   ├── Providers.tsx    # WagmiProvider + QueryClient + RainbowKit
│   │   └── TokenDashboard.tsx  # Main UI: connect, balances, transfer, burn
│   ├── config/
│   │   ├── wagmi.ts         # Chain config (Fuji only by default)
│   │   └── contracts.ts     # Reads NEXT_PUBLIC_AVAX_QUICK_ADDRESS
│   └── abi/
│       └── AvaxQuick.ts     # Auto-generated — do not edit manually
├── scripts/
│   └── sync-abi.mjs         # Copies ABI from Foundry build output
├── public/                  # Static assets
├── .env.local.example
├── next.config.ts
└── package.json
```

## How It Works

### Wallet connection

`Providers.tsx` wraps the app with:

- `WagmiProvider` — configured for Avalanche Fuji (`chain ID 43113`)
- `QueryClientProvider` — caches contract read results
- `RainbowKitProvider` — connect button and wallet modal

Users must connect and be on Fuji to interact. Wrong network shows a prompt to switch.

### Contract reads

`TokenDashboard.tsx` uses wagmi hooks:

- `useBalance` — native AVAX balance
- `useReadContract` — `balanceOf`, `totalSupply`, `name`, `symbol`

Reads are disabled until `NEXT_PUBLIC_AVAX_QUICK_ADDRESS` is a valid address (`isContractConfigured`).

### Contract writes

- `transfer(address, uint256)` — send AXQ to another address
- `burn(uint256)` — destroy tokens from caller's balance

`useWriteContract` + `useWaitForTransactionReceipt` handle submission and confirmation. Balances refetch on success.

### ABI sync workflow

When the Solidity contract changes:

```bash
# From repo root
forge build

# From frontend/
npm run sync-abi
```

`sync-abi.mjs` reads `../out/AvaxQuick.sol/AvaxQuick.json` and regenerates `src/abi/AvaxQuick.ts`. Commit the updated ABI if contract interfaces changed.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |
| `npm run sync-abi` | Regenerate TypeScript ABI from Foundry artifact |

## Adding Mainnet Support

By default the app targets Fuji only. To add C-Chain mainnet:

1. Import `avalanche` from `wagmi/chains` in `src/config/wagmi.ts`
2. Add it to the `chains` array in `getDefaultConfig`
3. Set a mainnet contract address (separate env var or chain-aware config in `contracts.ts`)
4. Update `TokenDashboard.tsx` network checks to accept mainnet chain ID `43114`

Always validate on Fuji first.

## Deployment

### Vercel (recommended)

1. Connect the GitHub repo to [Vercel](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - `NEXT_PUBLIC_AVAX_QUICK_ADDRESS`
4. Deploy

### Static export

This app uses client-side wallet hooks and requires a Node server (`next start`). Do not use `output: 'export'` without refactoring wallet providers.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Amber banner about contract address | Set valid `NEXT_PUBLIC_AVAX_QUICK_ADDRESS` in `.env.local`, restart dev server |
| `sync-abi` fails | Run `forge build` from repo root first |
| WalletConnect errors | Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set and valid |
| Wrong network warning | Switch wallet to Avalanche Fuji (43113) |
| Transaction reverts | Ensure sufficient AXQ balance and Fuji AVAX for gas |
| Stale ABI after contract change | `forge build && npm run sync-abi` |

## AI Agent Development

See [AGENTS.md](./AGENTS.md) for rules when editing this frontend with Cursor, Claude Code, or other agents.

## Related Documentation

- [Root README](../README.md) — full project overview
- [HOW_TO.md](../HOW_TO.md) — deploy contract and connect frontend
- [CLAUDE.md](../CLAUDE.md) — Claude Code workflow for the monorepo
