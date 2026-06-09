import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const broadcastDir = path.join(root, "broadcast", "Deploy.s.sol", "43113");
const envPath = path.join(root, "frontend", ".env.local");

function extractContractAddress() {
  const file = path.join(broadcastDir, "run-latest.json");
  if (!fs.existsSync(file)) return null;
  const run = JSON.parse(fs.readFileSync(file, "utf8"));
  const created = run.transactions?.find(
    (tx) => tx.transactionType === "CREATE" && tx.contractName === "AvaxQuick",
  );
  return created?.contractAddress ?? null;
}

if (!fs.existsSync(broadcastDir)) {
  console.error("No Fuji broadcast found. Deploy first with --broadcast on chain 43113.");
  process.exit(1);
}

const address = extractContractAddress();
if (!address) {
  console.error("Could not find AvaxQuick address in broadcast/Deploy.s.sol/43113/run-latest.json");
  process.exit(1);
}

let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
if (/^NEXT_PUBLIC_AVAX_QUICK_ADDRESS=.*/m.test(env)) {
  env = env.replace(/^NEXT_PUBLIC_AVAX_QUICK_ADDRESS=.*/m, `NEXT_PUBLIC_AVAX_QUICK_ADDRESS=${address}`);
} else {
  env += `${env.endsWith("\n") || env.length === 0 ? "" : "\n"}NEXT_PUBLIC_AVAX_QUICK_ADDRESS=${address}\n`;
}

fs.writeFileSync(envPath, env);
console.log(`Updated frontend/.env.local → NEXT_PUBLIC_AVAX_QUICK_ADDRESS=${address}`);
