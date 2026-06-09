# Claude Code — Frontend Instructions

Read **`AGENTS.md`** in this directory for all frontend development rules.

## Quick reference

- **Stack:** Next.js 16, wagmi 2, viem 2, RainbowKit 2, Tailwind 4
- **Chain:** Avalanche Fuji (43113) by default
- **Contract ABI:** `npm run sync-abi` after `forge build` — never edit `src/abi/AvaxQuick.ts`
- **Env:** `frontend/.env.local` — see `.env.local.example`
- **Parent docs:** [../HOW_TO.md](../HOW_TO.md), [../CLAUDE.md](../CLAUDE.md)

When changing smart contracts, work from the repo root first (`forge test`), then sync ABI and update the frontend.
