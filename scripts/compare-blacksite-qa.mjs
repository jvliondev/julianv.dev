import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve("docs/visual-qa");
const output = resolve(root, "v3-final");
await mkdir(output, { recursive: true });
const referencePath = resolve(root, "reference/approved_black_site_1672x941.png");
const beforePath = resolve(root, "v3-before/home-1672x941.png");
const finalPath = resolve(output, "home-1672x941.png");
const scene = { left: 0, width: 1672, height: 781 };

const cropScene = async (path, top) => sharp(path)
  .extract({ left: scene.left, top, width: scene.width, height: top === 100 ? 771 : scene.height })
  .resize(scene.width, scene.height, { fit: "fill" }).png().toBuffer();

const reference = await cropScene(referencePath, 100);
const before = await cropScene(beforePath, 76);
const after = await cropScene(finalPath, 76);
const sideBySide = async (left, right, name) => sharp({ create: { width: scene.width * 2, height: scene.height, channels: 3, background: "#071018" } })
  .composite([{ input: left, left: 0, top: 0 }, { input: right, left: scene.width, top: 0 }])
  .png().toFile(resolve(output, name));

await sideBySide(reference, after, "reference-vs-final-scene.png");
await sideBySide(before, after, "before-vs-after-scene.png");
await sharp(reference).composite([{ input: after, blend: "over", opacity: 0.5 }]).png().toFile(resolve(output, "reference-final-overlay-50.png"));
await sharp(reference).composite([{ input: after, blend: "difference" }]).png().toFile(resolve(output, "reference-final-difference.png"));
await sharp(reference).toFile(resolve(output, "reference-scene-crop.png"));
await sharp(before).toFile(resolve(output, "before-scene-crop.png"));
await sharp(after).toFile(resolve(output, "final-scene-crop.png"));

const [referenceMetadata, beforeMetadata, finalMetadata] = await Promise.all([
  sharp(referencePath).metadata(), sharp(beforePath).metadata(), sharp(finalPath).metadata(),
]);
await writeFile(resolve(output, "comparison-metadata.json"), `${JSON.stringify({
  method: "Direct scene crops aligned to the artwork stage; no similarity score is calculated.",
  sourceReference: { file: "../reference/approved_black_site_1672x941.png", width: referenceMetadata.width, height: referenceMetadata.height, crop: { x: 0, y: 100, width: 1672, height: 771 }, resizeTo: { width: 1672, height: 781 } },
  previous3DImplementation: { file: "../v3-before/home-1672x941.png", width: beforeMetadata.width, height: beforeMetadata.height, crop: { x: 0, y: 76, width: 1672, height: 781 } },
  imageDrivenFinal: { file: "home-1672x941.png", width: finalMetadata.width, height: finalMetadata.height, crop: { x: 0, y: 76, width: 1672, height: 781 } },
  excludedFromComparison: ["Reference browser chrome", "Global site header", "Footer", "No claims of pixel identity; text and navigation are live DOM in the implementation."],
}, null, 2)}\n`);
process.stdout.write(`Scene comparisons saved to ${output}\n`);
