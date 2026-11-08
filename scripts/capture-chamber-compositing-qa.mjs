import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:3200";
const output = resolve("docs/visual-qa/chamber-compositing-final");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const issues = [];
const captures = [];

async function openPage(width, height, reducedMotion = "no-preference") {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion });
  const page = await context.newPage();
  page.on("pageerror", (error) => issues.push({ viewport: `${width}x${height}`, type: "pageerror", message: error.message }));
  page.on("console", (message) => { if (message.type() === "error") issues.push({ viewport: `${width}x${height}`, type: "console", message: message.text() }); });
  page.on("requestfailed", (request) => { if (request.failure()?.errorText !== "net::ERR_ABORTED") issues.push({ viewport: `${width}x${height}`, type: "requestfailed", url: request.url(), message: request.failure()?.errorText }); });
  await page.goto(base, { waitUntil: "load" });
  await page.locator(".blacksite-artboard").waitFor();
  await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));
  return { context, page };
}

async function chamberLayout(page, id) {
  return page.evaluate((projectId) => {
    const bay = document.querySelector(`.blacksite-bay[data-bay="${projectId}"]`);
    const frame = bay?.querySelector(".blacksite-frame-occluder");
    const exhibit = bay?.querySelector(".blacksite-exhibit");
    const leftDoor = bay?.querySelector(".blacksite-door-leaf.door-left");
    const rightDoor = bay?.querySelector(".blacksite-door-leaf.door-right");
    const rect = (element) => {
      if (!element) return null;
      const value = element.getBoundingClientRect();
      return { x: Math.round(value.x), y: Math.round(value.y), width: Math.round(value.width), height: Math.round(value.height) };
    };
    return {
      phase: document.querySelector(".blacksite-artboard")?.className.match(/phase-[^ ]+/)?.[0],
      doorState: bay?.getAttribute("data-door-state"),
      frame: rect(frame),
      artworkLayer: rect(exhibit),
      leftDoor: rect(leftDoor),
      rightDoor: rect(rightDoor),
      terminal: rect(document.querySelector(".blacksite-terminal")),
    };
  }, id);
}

for (const [width, height] of [[1672, 941], [1440, 900], [1024, 768]]) {
  const { context, page } = await openPage(width, height);
  const suffix = `${width}x${height}`;
  await page.locator(".facility-stage").screenshot({ path: resolve(output, `sealed-${suffix}.png`) });
  const hotspot = page.locator('.blacksite-bay[data-bay="squadamp"] .blacksite-hotspot');
  if (await hotspot.isVisible()) {
    await hotspot.click();
    await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-opening"));
    await page.waitForTimeout(340);
    await page.locator(".facility-stage").screenshot({ path: resolve(output, `opening-${suffix}.png`) });
    const openingLayout = await chamberLayout(page, "squadamp");
    await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-revealed"));
    await page.waitForTimeout(650);
    await page.locator(".facility-stage").screenshot({ path: resolve(output, `open-${suffix}.png`) });
    captures.push({ viewport: suffix, opening: openingLayout, fullyOpen: await chamberLayout(page, "squadamp") });
  } else {
    await page.locator(".blacksite-mobile-choice").nth(1).click();
    await page.locator(".reveal-panel.is-ready").waitFor();
    await page.screenshot({ path: resolve(output, `open-responsive-${suffix}.png`), fullPage: true });
    captures.push({ viewport: suffix, phase: "responsive project overview", horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth) });
  }
  await context.close();
}

{
  const width = 390;
  const height = 844;
  const { context, page } = await openPage(width, height, "reduce");
  await page.screenshot({ path: resolve(output, "sealed-390x844.png"), fullPage: true });
  await page.locator(".blacksite-mobile-choice").first().click();
  await page.locator(".reveal-panel.is-ready").waitFor();
  await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-revealed"));
  await page.screenshot({ path: resolve(output, "open-390x844.png"), fullPage: true });
  captures.push({ viewport: "390x844", phase: "fully-open-responsive-overview", horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth) });
  await context.close();
}

await writeFile(resolve(output, "compositing-layout.json"), `${JSON.stringify({ method: "Visual captures and DOM geometry for the image-driven composite; no pixel-identity claim.", captures, issues }, null, 2)}\n`);
await browser.close();
process.stdout.write(`Chamber compositing captures saved to ${output}; browser issues: ${issues.length}\n`);
