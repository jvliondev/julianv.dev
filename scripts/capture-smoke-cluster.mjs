import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve("docs/visual-qa/smoke-cluster-final");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });
const issues = [];
page.on("pageerror", (error) => issues.push(error.message));
page.on("console", (message) => { if (message.type() === "error") issues.push(message.text()); });
await page.goto("http://127.0.0.1:3200", { waitUntil: "load" });
await page.locator(".blacksite-artboard").waitFor();
await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));
await page.evaluate(() => document.fonts.ready);

const capture = async (id) => {
  const bay = page.locator(`.blacksite-bay[data-bay="${id}"]`);
  process.stdout.write(`selecting ${id} from ${await page.locator(".blacksite-artboard").getAttribute("class")}\n`);
  await bay.locator(".blacksite-hotspot").click({ force: true });
  await page.waitForTimeout(400);
  process.stdout.write(`state after click: ${await page.locator(".blacksite-artboard").getAttribute("class")}; bay=${await bay.getAttribute("data-phase")}\n`);
  await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-opening"));
  await page.waitForTimeout(360);
  const current = page.locator(`.blacksite-bay[data-bay="${id}"]`);
  const details = await current.locator(".blacksite-steam").evaluateAll((nodes) => nodes.map((node) => ({
    vent: node.getAttribute("data-vent"),
    angle: node.style.transform,
    width: node.style.width,
    height: node.style.height,
    opacity: getComputedStyle(node).opacity,
  })));
  await page.locator(".facility-stage").screenshot({ path: resolve(output, `${id}-opening.png`) });
  await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-dissipating"));
  await page.waitForTimeout(180);
  await page.locator(".facility-stage").screenshot({ path: resolve(output, `${id}-dissipating.png`) });
  await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-revealed"));
  await page.getByRole("button", { name: /Return to corridor/i }).click();
  await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-sealed"));
  return { chamber: id, phase: "opening+dissipating", activeEmitters: details.length, emitters: details };
};

const captures = [];
captures.push(await capture("squadamp"));
captures.push(await capture("classified"));
captures.push(await capture("xondry"));
await writeFile(resolve(output, "capture-data.json"), `${JSON.stringify({ captures, browserIssues: issues }, null, 2)}\n`);
await browser.close();
process.stdout.write(`Smoke captures saved to ${output}; browser issues: ${issues.length}\n`);
