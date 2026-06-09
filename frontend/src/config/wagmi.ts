import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { avalancheFuji } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "AvaxQuick",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "REPLACE_ME",
  chains: [avalancheFuji],
  ssr: true,
});
