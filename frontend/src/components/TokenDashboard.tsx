"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import {
  formatEther,
  isAddress,
  parseEther,
} from "viem";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { avaxQuickAbi } from "@/abi/AvaxQuick";
import { avaxQuickAddress, isContractConfigured } from "@/config/contracts";

export function TokenDashboard() {
  const { address, isConnected, chain } = useAccount();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [burnAmount, setBurnAmount] = useState("");

  const onFuji = chain?.id === avalancheFuji.id;

  const { data: avaxBalance } = useBalance({ address });

  const { data: tokenBalance, refetch: refetchToken } = useReadContract({
    address: avaxQuickAddress,
    abi: avaxQuickAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && isContractConfigured },
  });

  const { data: totalSupply } = useReadContract({
    address: avaxQuickAddress,
    abi: avaxQuickAbi,
    functionName: "totalSupply",
    query: { enabled: isContractConfigured },
  });

  const { data: tokenName } = useReadContract({
    address: avaxQuickAddress,
    abi: avaxQuickAbi,
    functionName: "name",
    query: { enabled: isContractConfigured },
  });

  const { data: tokenSymbol } = useReadContract({
    address: avaxQuickAddress,
    abi: avaxQuickAbi,
    functionName: "symbol",
    query: { enabled: isContractConfigured },
  });

  const {
    writeContract,
    data: txHash,
    isPending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess) {
      void refetchToken();
      setRecipient("");
      setAmount("");
      setBurnAmount("");
      resetWrite();
    }
  }, [isSuccess, refetchToken, resetWrite]);

  const busy = isPending || isConfirming;
  const symbol = tokenSymbol ?? "AXQ";

  const onTransfer = () => {
    if (!avaxQuickAddress || !isAddress(recipient) || !amount) return;
    writeContract({
      address: avaxQuickAddress,
      abi: avaxQuickAbi,
      functionName: "transfer",
      args: [recipient as `0x${string}`, parseEther(amount)],
    });
  };

  const onBurn = () => {
    if (!avaxQuickAddress || !burnAmount) return;
    writeContract({
      address: avaxQuickAddress,
      abi: avaxQuickAbi,
      functionName: "burn",
      args: [parseEther(burnAmount)],
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {tokenName ?? "AvaxQuick"}{" "}
            <span className="text-red-400">{symbol}</span>
          </h1>
          <p className="text-xs text-zinc-500">Avalanche Fuji · ERC-20</p>
        </div>
        <ConnectButton />
      </header>

      <div className="mx-auto max-w-lg space-y-6 p-6">
        {!isContractConfigured && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
            Set <code className="font-mono">NEXT_PUBLIC_AVAX_QUICK_ADDRESS</code> in{" "}
            <code className="font-mono">frontend/.env.local</code> after deploying to Fuji.
          </div>
        )}

        {!isConnected ? (
          <p className="text-zinc-400">
            Connect MetaMask or Core Wallet to interact with {symbol} on Fuji testnet.
          </p>
        ) : !onFuji ? (
          <p className="text-amber-400">
            Switch to Avalanche Fuji (chain ID {avalancheFuji.id}) using the wallet menu.
          </p>
        ) : (
          <>
            <section className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-sm text-zinc-400">Your wallet</p>
              <p className="truncate font-mono text-sm">{address}</p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
                <div>
                  <p className="text-zinc-500">AVAX</p>
                  <p className="font-medium">
                    {avaxBalance ? formatEther(avaxBalance.value) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">{symbol}</p>
                  <p className="font-medium">
                    {tokenBalance !== undefined ? formatEther(tokenBalance) : "—"}
                  </p>
                </div>
              </div>
              {totalSupply !== undefined && (
                <p className="border-t border-zinc-800 pt-3 text-xs text-zinc-500">
                  Total supply: {formatEther(totalSupply)} {symbol}
                </p>
              )}
            </section>

            <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <h2 className="font-medium">Transfer {symbol}</h2>
              <input
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-red-500"
                placeholder="Recipient 0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
              <input
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-red-500"
                placeholder="Amount"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button
                type="button"
                onClick={onTransfer}
                disabled={busy || !recipient || !amount || !isContractConfigured}
                className="w-full rounded-lg bg-red-600 py-2.5 font-medium transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "Confirm in wallet…" : "Send"}
              </button>
            </section>

            <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <h2 className="font-medium">Burn {symbol}</h2>
              <input
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-red-500"
                placeholder="Amount to burn"
                inputMode="decimal"
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
              />
              <button
                type="button"
                onClick={onBurn}
                disabled={busy || !burnAmount || !isContractConfigured}
                className="w-full rounded-lg border border-zinc-600 py-2.5 font-medium transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "Confirm in wallet…" : "Burn"}
              </button>
            </section>

            {(writeError || receiptError) && (
              <p className="text-sm text-red-400">
                {(writeError ?? receiptError)?.message}
              </p>
            )}
            {isSuccess && (
              <p className="text-sm text-green-400">Transaction confirmed.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
