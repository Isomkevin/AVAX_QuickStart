#!/usr/bin/env node
/**
 * Deploy AvaxQuick to Fuji and update frontend/.env.local
 * Prerequisites: .env with PRIVATE_KEY, deployer funded on Fuji (~0.003 AVAX min)
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const forge = process.env.FORGE ?? path.join(process.env.USERPROFILE ?? "", ".foundry", "bin", "forge.exe");
const cast = process.env.CAST ?? path.join(process.env.USERPROFILE ?? "", ".foundry", "bin", "cast.exe");
const rpc = process.env.FUJI_RPC_URL ?? "https://api.avax-test.network/ext/bc/C/rpc";

function loadEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) {
    console.error("Missing .env — copy .env.example and set PRIVATE_KEY");
    process.exit(1);
  }
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

loadEnv();
const pk = process.env.PRIVATE_KEY;
if (!pk) {
  console.error("PRIVATE_KEY not set in .env");
  process.exit(1);
}

const deployer = execSync(`"${cast}" wallet address --private-key ${pk}`, { encoding: "utf8" }).trim();
const balance = execSync(`"${cast}" balance ${deployer} --rpc-url ${rpc} --ether`, { encoding: "utf8" }).trim();

console.log(`Deployer: ${deployer}`);
console.log(`Fuji balance: ${balance} AVAX`);

if (parseFloat(balance) < 0.003) {
  console.error("\nInsufficient Fuji AVAX. Fund the deployer first:");
  console.error("  • https://faucet.quicknode.com/avalanche/fuji");
  console.error("  • https://core.app/tools/testnet-faucet (needs mainnet AVAX or coupon)");
  console.error("  • https://faucets.chain.link/fuji");
  process.exit(1);
}

console.log("\nDeploying AvaxQuick to Fuji...");
execSync(
  `"${forge}" script script/Deploy.s.sol --rpc-url ${rpc} --broadcast -vv`,
  { cwd: root, stdio: "inherit", env: process.env },
);

execSync("node scripts/update-frontend-address.mjs", { cwd: root, stdio: "inherit" });
console.log("\nDone. Restart `npm run dev` in frontend/ if it is running.");
