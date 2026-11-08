import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:3200";
const output = resolve("docs/screenshots");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });

for (const [width, height] of [[1672, 941], [1440, 900], [1024, 768], [390, 844], [320, 720]]) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".blacksite-artboard").waitFor();
  await page.screenshot({ path: resolve(output, `home-${width}x${height}.png`) });
  await context.close();
}

const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
await page.goto(base, { waitUntil: "networkidle" });
await page.locator('.blacksite-bay[data-bay="xondry"] .blacksite-hotspot').click({ force: true });
await page.getByRole("dialog").waitFor();
await page.screenshot({ path: resolve(output, "chamber-xondry.png") });
await page.goto(`${base}/work/xondry`, { waitUntil: "networkidle" });
await page.screenshot({ path: resolve(output, "project-xondry.png"), fullPage: true });
await page.goto(`${base}/work`, { waitUntil: "networkidle" });
await page.screenshot({ path: resolve(output, "work-index.png"), fullPage: true });
await context.close();
await browser.close();
process.stdout.write(`Captured five chamber viewports, the Xondry reveal, and the Xondry project page in ${output}\n`);
