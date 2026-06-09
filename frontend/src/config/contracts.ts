import { isAddress } from "viem";

const raw = process.env.NEXT_PUBLIC_AVAX_QUICK_ADDRESS;

export const avaxQuickAddress =
  raw && isAddress(raw) ? (raw as `0x${string}`) : undefined;

export const isContractConfigured = avaxQuickAddress !== undefined;
