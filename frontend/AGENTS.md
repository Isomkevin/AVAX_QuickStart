# Frontend Agent Instructions — AvaxQuick

Rules for AI coding agents working in `frontend/`. Read this before editing any file in this directory.

## Project Context

This is the **AvaxQuick** dApp frontend — a Next.js 16 App Router app that connects to the `AvaxQuick` ERC-20 contract on **Avalanche Fuji** (chain ID `43113`).

- Parent repo: Foundry smart contracts in `../src/`, `../test/`, `../script/`
- Contract ABI: auto-generated at `src/abi/AvaxQuick.ts` via `npm run sync-abi`
- Wallet stack: wagmi 2 + viem 2 + RainbowKit 2 + TanStack Query 5
- Styling: Tailwind CSS 4

## Next.js Version Note

<!-- BEGIN:nextjs-agent-rules -->
This is NOT the Next.js you know from training data. Next.js 16 in this project may have APIs, conventions, and file structure that differ from older versions. Read relevant guides in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Critical Rules

1. **Never hardcode private keys** — wallet signing happens in the user's browser via RainbowKit
2. **Never commit** `.env.local` — use `.env.local.example` for templates
3. **Contract address from env** — read via `src/config/contracts.ts`, never hardcode deployed addresses
4. **ABI from sync script** — do not hand-edit `src/abi/AvaxQuick.ts`; run `npm run sync-abi` after contract changes
5. **Fuji first** — default chain is `avalancheFuji`; mainnet requires explicit config change
6. **Client components** — any file using wagmi/RainbowKit hooks must have `"use client"` directive
7. **TypeScript strict** — no `any` types; use viem's `Address`, `parseEther`, `formatEther`, `isAddress`

## File Conventions

| Path | Purpose | Edit when |
|------|---------|-----------|
| `src/app/layout.tsx` | Root layout, metadata | Changing app title, global providers |
| `src/app/page.tsx` | Home page entry | Adding new top-level routes (prefer new route files) |
| `src/components/Providers.tsx` | Wallet providers | Adding chains, changing RainbowKit config |
| `src/components/TokenDashboard.tsx` | Main dashboard UI | Adding transfer/burn features, balance displays |
| `src/config/wagmi.ts` | wagmi/RainbowKit config | Adding networks, changing app name |
| `src/config/contracts.ts` | Contract address resolution | Adding multi-chain address support |
| `src/abi/AvaxQuick.ts` | Generated ABI | **Never edit** — run `npm run sync-abi` |

## Adding New Contract Interactions

1. Ensure the function exists in `../src/AvaxQuick.sol`
2. Run `forge build` from repo root
3. Run `npm run sync-abi` in `frontend/`
4. Use `useReadContract` for view/pure functions
5. Use `useWriteContract` + `useWaitForTransactionReceipt` for state-changing functions
6. Parse amounts with `parseEther` / display with `formatEther` (18 decimals)
7. Disable buttons while `isPending || isConfirming`
8. Refetch balances on `isSuccess`

Example write pattern (match existing `TokenDashboard.tsx`):

```typescript
const { writeContract, data: txHash, isPending, reset } = useWriteContract();
const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

writeContract({
  address: avaxQuickAddress,
  abi: avaxQuickAbi,
  functionName: "transfer",
  args: [recipient, parseEther(amount)],
});
```

## Environment Variables

Only `NEXT_PUBLIC_*` vars are available in the browser:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — required for RainbowKit
- `NEXT_PUBLIC_AVAX_QUICK_ADDRESS` — deployed contract on Fuji

Add new public env vars to `.env.local.example` with comments.

## Testing Changes

```bash
npm run lint          # ESLint
npm run build         # catches TypeScript and Next.js errors
npm run dev           # manual test with MetaMask/Core on Fuji
```

There is no automated frontend test suite yet. Verify manually:

- [ ] Connect wallet works
- [ ] Wrong network shows switch prompt
- [ ] Balances load when contract address is set
- [ ] Transfer and burn succeed on Fuji
- [ ] Error states display wallet rejection messages

## Styling Guidelines

- Dark theme: `bg-zinc-950`, `bg-zinc-900`, `border-zinc-800`
- Accent: `red-600` / `red-400` (Avalanche brand alignment)
- Use Tailwind utility classes; avoid inline styles
- Keep mobile-friendly layouts (`max-w-lg`, full-width inputs)

## Common Tasks

### Add a new page

Create `src/app/<route>/page.tsx`. Wrap wallet-dependent content in a client component.

### Add mainnet

Update `wagmi.ts` chains array, `contracts.ts` for chain-specific addresses, and `TokenDashboard.tsx` network guard.

### Display new contract data

Add `useReadContract` call in `TokenDashboard.tsx` with `query: { enabled: isContractConfigured }`.

### After Solidity contract changes

Always: `forge build` → `npm run sync-abi` → verify TypeScript compiles.

## Security

- Frontend never holds or transmits private keys
- Validate user input with `isAddress()` before contract calls
- Do not fetch arbitrary RPC URLs from user input
- Sanitize error messages — show `error.message`, not full stack traces in production

## Parent Repo Rules

Smart contract work follows root `.cursorrules` / `CLAUDE.md`:

- `evm_version = "cancun"` in `foundry.toml`
- OpenZeppelin v5, Solidity 0.8.24
- Foundry tests before deploy

See [../HOW_TO.md](../HOW_TO.md) and [../SKILL.md](../SKILL.md) for full Avalanche guidance.
