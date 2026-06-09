import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const artifactPath = path.resolve(__dirname, "../../out/AvaxQuick.sol/AvaxQuick.json");
const outPath = path.resolve(__dirname, "../src/abi/AvaxQuick.ts");

if (!fs.existsSync(artifactPath)) {
  console.error("Missing artifact. Run `forge build` from the repo root first.");
  process.exit(1);
}

const { abi } = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(
  outPath,
  `// Auto-generated from out/AvaxQuick.sol/AvaxQuick.json — run npm run sync-abi\nexport const avaxQuickAbi = ${JSON.stringify(abi, null, 2)} as const;\n`,
);
console.log(`Wrote ${outPath}`);
