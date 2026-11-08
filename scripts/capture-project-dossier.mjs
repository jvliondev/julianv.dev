import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve("docs/visual-qa/project-dossier-final");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });
const issues = [];
page.on("pageerror", (error) => issues.push(error.message));
page.on("console", (message) => { if (message.type() === "error") issues.push(message.text()); });
await page.goto("http://127.0.0.1:3200", { waitUntil: "load" });
await page.locator(".blacksite-artboard").waitFor();
await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));
const ambientLightTiming = await page.locator('.blacksite-background-light-unit.mode-pulse,.blacksite-background-light-unit.mode-flash,.blacksite-background-light-unit.mode-flicker').evaluateAll((nodes) => nodes.slice(0, 6).map((node) => ({
  id: node.getAttribute("data-emitter"),
  animation: getComputedStyle(node).animationName,
  duration: getComputedStyle(node).animationDuration,
})));
await page.locator(".facility-stage").screenshot({ path: resolve(output, "sealed.png") });
await page.locator('.blacksite-bay[data-bay="squadamp"] .blacksite-hotspot').click({ force: true });
await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-depressurizing"));
await page.waitForTimeout(180);
const walkwaySequence = await page.locator(".blacksite-background-light-unit.mode-sequence").evaluateAll((nodes) => nodes.map((node) => {
  const unit = node;
  const image = unit.querySelector(".blacksite-background-emitter");
  const dimmer = unit.querySelector(".blacksite-background-dimmer");
  return {
    id: unit.getAttribute("data-emitter"),
    opacity: getComputedStyle(unit).opacity,
    animation: getComputedStyle(unit).animationName,
    delay: image ? getComputedStyle(image).animationDelay : getComputedStyle(unit).animationDelay,
    emitterOpacity: image ? getComputedStyle(image).opacity : "missing emitter",
    emitterAnimation: image ? getComputedStyle(image).animationName : "missing emitter",
    emitterFilter: image ? getComputedStyle(image).filter : "missing emitter",
    dimmerOpacity: dimmer ? getComputedStyle(dimmer).opacity : "missing dimmer",
    dimmerMask: dimmer ? getComputedStyle(dimmer).maskImage : "missing mask",
  };
}));
const spotlight = await page.locator(".blacksite-cinematic-focus").evaluate((node) => ({
  opacity: getComputedStyle(node).opacity,
  position: getComputedStyle(node).backgroundImage,
  project: node.getAttribute("data-focus-project"),
}));
await page.locator(".facility-stage").screenshot({ path: resolve(output, "squadamp-walkway-sequence.png") });
await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-opening"));
await page.waitForTimeout(360);
const cameraPush = await page.locator(".blacksite-camera").evaluate((node) => ({
  zoom: node.getAttribute("data-camera-zoom"),
  transform: getComputedStyle(node).transform,
}));
const gatePulse = await page.locator('.blacksite-background-light-unit[data-emitter^="arch-warning-"]').evaluateAll((nodes) => nodes.map((node) => ({
  id: node.getAttribute("data-emitter"),
  animation: getComputedStyle(node).animationName,
  delay: getComputedStyle(node).animationDelay,
  opacity: getComputedStyle(node).opacity,
})));
await page.locator(".facility-stage").screenshot({ path: resolve(output, "squadamp-push-in.png") });
await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-dissipating"));
await page.waitForTimeout(180);
await page.locator(".facility-stage").screenshot({ path: resolve(output, "squadamp-pullback.png") });
await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-revealed"));
await page.waitForTimeout(800);
await page.locator(".facility-stage").screenshot({ path: resolve(output, "squadamp-open.png") });
const overviewCard = await page.locator(".reveal-panel.is-ready").evaluate((node) => {
  const rect = node.getBoundingClientRect();
  return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) };
});
await page.getByRole("button", { name: /Return to corridor/i }).click();
await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-sealed"));
await page.waitForTimeout(200);
await page.locator(".facility-stage").screenshot({ path: resolve(output, "squadamp-reset.png") });
await page.locator('.blacksite-bay[data-bay="xondry"] .blacksite-hotspot').click({ force: true });
await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-opening"));
await page.waitForTimeout(360);
await page.locator(".facility-stage").screenshot({ path: resolve(output, "xondry-push-in.png") });
await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-revealed"));
await page.waitForTimeout(800);
await page.locator(".facility-stage").screenshot({ path: resolve(output, "xondry-open.png") });
await page.getByRole("button", { name: /Return to corridor/i }).click();
await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-sealed"));
await page.locator('.blacksite-bay[data-bay="classified"] .blacksite-hotspot').click({ force: true });
await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-opening"));
await page.waitForTimeout(360);
await page.locator(".facility-stage").screenshot({ path: resolve(output, "classified-push-in.png") });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:3200", { waitUntil: "load" });
await page.locator(".blacksite-mobile-choice").first().click();
await page.locator(".reveal-panel.is-ready").waitFor();
await page.waitForTimeout(700);
await page.screenshot({ path: resolve(output, "mobile-xondry-overview.png"), fullPage: true });
await writeFile(resolve(output, "walkway-light-sequence.json"), `${JSON.stringify(walkwaySequence, null, 2)}\n`);
await writeFile(resolve(output, "background-light-timing.json"), `${JSON.stringify(ambientLightTiming, null, 2)}\n`);
await writeFile(resolve(output, "gate-light-pulse.json"), `${JSON.stringify(gatePulse, null, 2)}\n`);
await writeFile(resolve(output, "spotlight-focus.json"), `${JSON.stringify(spotlight, null, 2)}\n`);
await writeFile(resolve(output, "camera-push-in.json"), `${JSON.stringify(cameraPush, null, 2)}\n`);
await writeFile(resolve(output, "overview-card-position.json"), `${JSON.stringify(overviewCard, null, 2)}\n`);
await writeFile(resolve(output, "browser-issues.json"), `${JSON.stringify(issues, null, 2)}\n`);
await browser.close();
process.stdout.write(`Project reveal captures saved to ${output}; browser issues: ${issues.length}\n`);
