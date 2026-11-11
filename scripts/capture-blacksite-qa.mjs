import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:3200";
const output = resolve(process.argv[2] ?? "docs/visual-qa/v3-final");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const issues = [];
const watch = (page) => {
  page.on("console", (message) => { if (message.type() === "error") issues.push({ type: "console", text: message.text() }); });
  page.on("pageerror", (error) => issues.push({ type: "pageerror", text: error.message }));
  page.on("requestfailed", (request) => { if (request.failure()?.errorText !== "net::ERR_ABORTED") issues.push({ type: "requestfailed", url: request.url(), error: request.failure()?.errorText }); });
  page.on("response", (response) => { if (response.status() >= 400) issues.push({ type: "http", status: response.status(), url: response.url() }); });
};
const waitForImages = async (page) => {
  await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0), null, { timeout: 10000 });
  await page.evaluate(() => Promise.all([...document.images].map((image) => image.decode().catch(() => undefined))));
};
const setup = async (viewport, reducedMotion = "no-preference") => {
  const context = await browser.newContext({ viewport, reducedMotion });
  const page = await context.newPage();
  watch(page);
  await page.goto(base, { waitUntil: "load" });
  await page.locator(".blacksite-artboard").waitFor();
  await waitForImages(page);
  await page.evaluate(() => document.fonts.ready);
  return { context, page };
};

for (const [width, height] of [[1672, 941], [1440, 900], [1920, 1080], [1024, 768], [390, 844], [360, 800]]) {
  const { context, page } = await setup({ width, height });
  if (width < 761) await page.locator(".blacksite-mobile-selector").screenshot({ path: resolve(output, `selector-${width}x${height}.png`) }).catch(() => {});
  await page.screenshot({ path: resolve(output, `initial-${width}x${height}.png`), fullPage: true });
  process.stdout.write(`captured initial ${width}x${height}\n`);
  if (width === 390 || width === 360) {
    const choice = page.locator(".blacksite-mobile-choice").first();
    await choice.click();
    await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-revealed"));
    await page.screenshot({ path: resolve(output, `chamber-open-${width}x${height}.png`), fullPage: true });
    await page.goto(`${base}/work/xondry`, { waitUntil: "load" });
    await waitForImages(page);
    await page.screenshot({ path: resolve(output, `project-xondry-${width}x${height}.png`), fullPage: true });
  }
  await context.close();
}

const entryCapture = await setup({ width: 1672, height: 941 });
await entryCapture.page.getByRole("button", { name: "Enter the Facility" }).click();
await entryCapture.page.waitForFunction(() => document.querySelector(".facility-stage")?.classList.contains("entry-venting"));
await entryCapture.page.screenshot({ path: resolve(output, "entry-venting.png") });
await entryCapture.page.waitForFunction(() => document.querySelector(".facility-stage")?.classList.contains("entry-opening"));
await entryCapture.page.screenshot({ path: resolve(output, "entry-opening.png") });
await entryCapture.page.getByRole("button", { name: "Skip entry sequence" }).click();
await entryCapture.page.screenshot({ path: resolve(output, "entry-entered.png") });
await entryCapture.context.close();

const { context, page } = await setup({ width: 1672, height: 941 });
await page.locator('.blacksite-mobile-choice').count();
const xondry = page.locator('.blacksite-bay[data-bay="xondry"] .blacksite-hotspot');
await xondry.focus();
await page.screenshot({ path: resolve(output, "keyboard-focus.png") });
await xondry.click();
await page.waitForTimeout(220);
await page.screenshot({ path: resolve(output, "xondry-unlocking.png") });
await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-depressurizing"));
await page.screenshot({ path: resolve(output, "xondry-depressurizing.png") });
await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-opening"));
await page.waitForFunction(() => {
  const plume = document.querySelector(".blacksite-effects-layer .steam-cloud-animation");
  return plume instanceof HTMLVideoElement && plume.readyState >= 2 && plume.videoWidth > 0;
}, null, { timeout: 10_000 });
await page.screenshot({ path: resolve(output, "xondry-venting.png") });
await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-dissipating"));
await page.screenshot({ path: resolve(output, "xondry-dissipating.png") });
await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-revealed"));
await page.waitForTimeout(750);
await page.screenshot({ path: resolve(output, "xondry-open-project.png") });
await xondry.hover({ position: { x: 20, y: 20 } });
await page.screenshot({ path: resolve(output, "xondry-open-hover.png") });
await page.getByRole("button", { name: /Return to corridor/i }).click();
await page.waitForTimeout(550);
for (const [id, name] of [["squadamp", "SquadAMP"], ["atomlang-evolved-sdk", "AtomLang"], ["raeyl", "RAEYL"], ["realball26", "RealBall26"], ["classified", "Classified"]]) {
  await page.locator(`.blacksite-bay[data-bay="${id}"] .blacksite-hotspot`).click({ force: true });
  if (id === "squadamp") {
    await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-opening"));
    await page.waitForFunction(() => {
      const plume = document.querySelector(".blacksite-effects-layer .steam-cloud-animation");
      return plume instanceof HTMLVideoElement && plume.readyState >= 2 && plume.videoWidth > 0;
    }, null, { timeout: 10_000 });
    await page.screenshot({ path: resolve(output, "squadamp-roof-venting.png") });
    await page.waitForTimeout(250);
    await page.screenshot({ path: resolve(output, "squadamp-roof-venting-later.png") });
  }
  await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-revealed"));
  await page.waitForTimeout(750);
  await page.screenshot({ path: resolve(output, `chamber-${id}.png`) });
  await page.getByRole("button", { name: /Return to corridor/i }).click();
  await page.waitForTimeout(540);
  process.stdout.write(`captured chamber ${name}\n`);
}
await page.goto(`${base}/work/realball26`, { waitUntil: "load" });
await waitForImages(page);
await page.screenshot({ path: resolve(output, "realball26-project.png"), fullPage: true });
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${base}/work`, { waitUntil: "load" });
await waitForImages(page);
await page.screenshot({ path: resolve(output, "work-index-1440x900.png"), fullPage: true });
await writeFile(resolve(output, "browser-issues.json"), `${JSON.stringify(issues, null, 2)}\n`);
await context.close();

const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const reducedPage = await reduced.newPage();
watch(reducedPage);
await reducedPage.goto(base, { waitUntil: "load" });
await reducedPage.locator(".blacksite-artboard").waitFor();
await waitForImages(reducedPage);
await reducedPage.locator('.blacksite-bay[data-bay="realball26"] .blacksite-hotspot').click({ force: true });
await reducedPage.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-revealed"));
await reducedPage.screenshot({ path: resolve(output, "reduced-motion-realball26.png") });
await writeFile(resolve(output, "browser-issues.json"), `${JSON.stringify(issues, null, 2)}\n`);
await reduced.close();
await browser.close();
process.stdout.write(`visual captures saved to ${output}; browser issues: ${issues.length}\n`);
