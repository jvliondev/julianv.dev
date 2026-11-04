import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const stage = process.argv[2] ?? "baseline";
const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:3200";
const output = resolve("docs/visual-qa", stage);
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const issues = [];
const monitor = (page) => {
  page.on("console", (message) => { if (message.type() === "error") issues.push({ type: "console", text: message.text() }); });
  page.on("pageerror", (error) => issues.push({ type: "pageerror", text: error.message }));
  page.on("requestfailed", (request) => {
    const error = request.failure()?.errorText;
    if (error !== "net::ERR_ABORTED") issues.push({ type: "requestfailed", url: request.url(), error });
  });
  page.on("response", (response) => { if (response.status() >= 400) issues.push({ type: "http", status: response.status(), url: response.url() }); });
};
for (const [width, height] of [[1672, 941], [1440, 900], [1024, 768], [390, 844], [320, 720]]) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "no-preference" });
  const page = await context.newPage();
  monitor(page);
  await page.goto(base, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  if (width <= 760) {
    await page.locator(".facility-modes.mode-professional .professional-fallback:not([hidden])").waitFor();
    await page.screenshot({ path: resolve(output, `home-${width}x${height}.png`) });
    await page.getByRole("button", { name: "Switch to Experience" }).click();
    await page.waitForFunction(() => Boolean(document.querySelector(".facility-stage.scene-online")), null, { timeout: 12000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: resolve(output, `home-experience-${width}x${height}.png`) });
    process.stdout.write(`responsive professional and experience ${width}x${height} captured\n`);
    await context.close();
    continue;
  }
  else {
    await page.waitForFunction(() => Boolean(document.querySelector(".facility-stage.scene-online")), null, { timeout: 15000 });
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: resolve(output, `home-${width}x${height}.png`) });
  process.stdout.write(`viewport ${width}x${height} captured\n`);
  await context.close();
}

const context = await browser.newContext({ viewport: { width: 1672, height: 941 }, reducedMotion: "no-preference" });
const page = await context.newPage();
monitor(page);
await page.goto(base, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => Boolean(document.querySelector(".facility-stage.scene-online")), null, { timeout: 15000 });
await page.waitForTimeout(500);
await page.getByRole("button", { name: /Enter the Facility/i }).click();
process.stdout.write("entry start clicked\n");
await page.waitForTimeout(720);
await page.screenshot({ path: resolve(output, "entry-entering.png") });
const entryState = await page.locator(".scene-canvas").evaluate((canvas) => ({ stage: canvas.closest(".facility-stage")?.className, vaultOpen: canvas.getAttribute("data-vault-open"), vaporOpacity: canvas.getAttribute("data-vapor-opacity") }));
process.stdout.write(`entry motion captured ${JSON.stringify(entryState)}\n`);
await context.close();

const readyContext = await browser.newContext({ viewport: { width: 1672, height: 941 }, reducedMotion: "no-preference" });
const readyPage = await readyContext.newPage();
monitor(readyPage);
await readyPage.addInitScript(() => { sessionStorage.setItem("jv-mode", "experience"); sessionStorage.setItem("jv-motion", "off"); });
await readyPage.goto(base, { waitUntil: "load" });
await readyPage.evaluate(() => document.fonts.ready);
await readyPage.waitForFunction(() => Boolean(document.querySelector(".facility-stage.scene-online")), null, { timeout: 15000 });
await readyPage.getByRole("button", { name: "Enter the Facility" }).click();
await readyPage.waitForFunction(() => Number(document.querySelector(".scene-canvas")?.getAttribute("data-vault-open")) >= .98, null, { timeout: 15000 });
await readyPage.screenshot({ path: resolve(output, "entry-ready.png") });

const reveal = async (name, file) => {
  await readyPage.getByRole("button", { name: new RegExp(name, "i") }).first().click();
  process.stdout.write(`${name} selected\n`);
  const skip = readyPage.getByRole("button", { name: /Skip effects/i });
  await skip.waitFor({ state: "visible" }).catch(() => {});
  await skip.evaluate((element) => (element instanceof HTMLButtonElement ? element.click() : undefined)).catch(() => {});
  await readyPage.getByRole("dialog").waitFor();
  await readyPage.screenshot({ path: resolve(output, file) });
  process.stdout.write(`${name} reveal captured\n`);
  await readyPage.getByRole("button", { name: /Return to corridor/i }).click();
  await readyPage.waitForTimeout(100);
};

await reveal("Xondry", "chamber-xondry-open.png");
await reveal("AtomLang", "chamber-atomlang-open.png");
await reveal("Classified", "chamber-classified-open.png");
await readyPage.goto(`${base}/work/xondry`, { waitUntil: "load" });
await readyPage.screenshot({ path: resolve(output, "dossier-xondry.png"), fullPage: true });
await writeFile(resolve(output, "browser-issues.json"), `${JSON.stringify(issues, null, 2)}\n`);
await readyContext.close();
await browser.close();
process.stdout.write(`Captured responsive entrance states, three chamber reveals and the Xondry dossier in ${output}; browser issues: ${issues.length}\n`);
