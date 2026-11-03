import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:3200";
const output = resolve("docs/screenshots");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });

for (const [width, height] of [[1672, 941], [1440, 900], [1024, 768], [390, 844], [320, 720]]) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  if (width <= 760) await page.locator(".professional-fallback").waitFor();
  await page.screenshot({ path: resolve(output, `home-${width}x${height}.png`) });
  await context.close();
}

const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
await page.goto(base, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /xondry/i }).first().click();
await page.getByRole("button", { name: /skip effects/i }).click();
await page.screenshot({ path: resolve(output, "chamber-xondry.png") });
await page.goto(`${base}/work/xondry`, { waitUntil: "networkidle" });
await page.screenshot({ path: resolve(output, "dossier-xondry.png"), fullPage: true });
await context.close();
await browser.close();
process.stdout.write(`Captured five entrance viewports, the Xondry reveal, and the Xondry dossier in ${output}\n`);
