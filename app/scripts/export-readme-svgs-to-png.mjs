import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");

const files = [
  "assets/readme/hero.svg",
  "assets/readme/product-flow.svg",
  "assets/readme/before-after.svg",
  "assets/readme/architecture.svg",
  "assets/readme/copilot-kit.svg",
  "assets/readme/roi-dashboard.svg",
];

for (const relativeFile of files) {
  const input = path.join(repoRoot, relativeFile);

  if (!existsSync(input)) {
    throw new Error(`Missing source SVG: ${relativeFile}`);
  }

  const output = input.replace(/\.svg$/i, ".png");

  await sharp(input, { density: 220 })
    .resize({ width: 1800, withoutEnlargement: false })
    .png({ quality: 95, compressionLevel: 9 })
    .toFile(output);

  console.log(`Exported ${path.relative(repoRoot, output)}`);
}
