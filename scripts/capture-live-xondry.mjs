import { chromium } from "playwright";
import { resolve } from "node:path";

const output = resolve("public/images/projects/xondry-live.jpg");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 900, height: 1000 }, deviceScaleFactor: 1 });
page.on("console", (message) => { if (message.type() === "error") process.stderr.write(`${message.text()}\n`); });
await page.goto("https://xondry.com/", { waitUntil: "domcontentloaded", timeout: 30_000 });
await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
await page.getByRole("button", { name: /decline/i }).click({ timeout: 1_500 }).catch(() => {});
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
await page.screenshot({ path: output, type: "jpeg", quality: 91 });
await browser.close();
process.stdout.write(`Captured live Xondry homepage preview at ${output}\n`);
