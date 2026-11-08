import sharp from "sharp";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve(process.argv[2] ?? "docs/visual-qa/header-footer-final");
const beforePath = resolve("docs/visual-qa/smoke-loop-final/initial-1672x941.png");
const afterPath = resolve(output, "initial-1672x941.png");
const beforeCopy = resolve(output, "before-home-1672x941.png");
const comparison = resolve(output, "before-after-home-1672x941.png");

await mkdir(output, { recursive: true });
await copyFile(beforePath, beforeCopy);
await sharp({ create: { width: 3344, height: 941, channels: 3, background: "#061018" } })
  .composite([
    { input: beforeCopy, left: 0, top: 0 },
    { input: afterPath, left: 1672, top: 0 },
  ])
  .png()
  .toFile(comparison);

await writeFile(resolve(output, "comparison-metadata.json"), `${JSON.stringify({
  method: "Full-page 1672 x 941 captures shown at 1:1 scale, before on the left and after on the right.",
  before: "../smoke-loop-final/initial-1672x941.png",
  after: "initial-1672x941.png",
  changes: ["Transparent home header over the scene", "Angular cyan primary and access buttons", "Compact identity and verified contact-link footer", "Smaller vent-aligned chamber vapor"],
  limitations: ["The email displayed in the approved raster is marked illustrative in the content-truth source, so the footer uses the site's Contact route instead."],
}, null, 2)}\n`);

process.stdout.write(`Shell comparison saved to ${comparison}\n`);
