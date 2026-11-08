import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { chromium } from "playwright";

const execFileAsync = promisify(execFile);
const root = resolve("public/blacksite");
const input = resolve(root, "art/steam-plume.webp");
const output = resolve(root, "art/steam-loop.webp");
const frameDir = await mkdtemp(join(tmpdir(), "jv-blacksite-smoke-"));
const frameDirResolved = resolve(frameDir);
const tempRoot = resolve(tmpdir());
if (!frameDirResolved.startsWith(`${tempRoot}${sep}`)) throw new Error("Frame output escaped the system temp directory.");

const width = 384;
const height = 256;
const fps = 18;
const duration = 4;
const frameCount = fps * duration;
const plumeData = (await readFile(input)).toString("base64");
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head><style>*{box-sizing:border-box}html,body{width:100%;height:100%;margin:0;overflow:hidden;background:transparent}svg{display:block;width:100%;height:100%;background:transparent}</style></head><body>
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs><filter id="smoke" x="-20%" y="-30%" width="140%" height="160%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.018" numOctaves="3" seed="14" result="noise">
          <animate attributeName="baseFrequency" dur="${duration}s" values="0.008 0.018;0.018 0.036;0.01 0.022;0.008 0.018" repeatCount="indefinite"/>
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="42" xChannelSelector="R" yChannelSelector="G">
          <animate attributeName="scale" dur="${duration}s" values="32;56;40;32" repeatCount="indefinite"/>
        </feDisplacementMap>
      </filter></defs>
      <image href="data:image/webp;base64,${plumeData}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="none" filter="url(#smoke)">
        <animateTransform attributeName="transform" type="translate" dur="${duration}s" values="0 0;2 -8;7 -17;3 -24;0 0" repeatCount="indefinite"/>
      </image>
    </svg></body></html>`, { waitUntil: "load" });
  await page.waitForFunction(() => {
    const image = document.querySelector("svg image");
    return image instanceof SVGImageElement && image.getBBox().width > 0;
  });

  for (let frame = 0; frame < frameCount; frame += 1) {
    await page.evaluate((seconds) => document.querySelector("svg")?.setCurrentTime(seconds), frame / fps);
    const filename = join(frameDir, `frame-${String(frame).padStart(4, "0")}.png`);
    await page.screenshot({ path: filename, animations: "allow", omitBackground: true });
  }
  await page.close();

  const ffmpeg = process.env.FFMPEG_PATH ?? "ffmpeg";
  await execFileAsync(ffmpeg, [
    "-hide_banner", "-loglevel", "error", "-y", "-framerate", String(fps),
    "-i", join(frameDir, "frame-%04d.png"), "-frames:v", String(frameCount), "-an",
    "-c:v", "libwebp_anim", "-quality", "72", "-preset", "photo", "-loop", "0",
    "-pix_fmt", "bgra", output,
  ], { maxBuffer: 4 * 1024 * 1024 });
  const { size } = await stat(output);
  process.stdout.write(`Generated ${duration}s ${width}x${height} alpha smoke animation (${Math.round(size / 1024)} KB): ${output}\n`);
} finally {
  await browser.close();
  await rm(frameDirResolved, { recursive: true, force: true });
}
