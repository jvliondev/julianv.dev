import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:3200";
const output = resolve("docs/visual-qa/cinematic-timing-final");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const issues = [];
const observations = [];
const context = await browser.newContext({ viewport: { width: 1672, height: 941 }, reducedMotion: "no-preference" });
const page = await context.newPage();
page.on("pageerror", (error) => issues.push({ type: "pageerror", message: error.message }));
page.on("console", (message) => { if (message.type() === "error") issues.push({ type: "console", message: message.text() }); });
page.on("requestfailed", (request) => { if (request.failure()?.errorText !== "net::ERR_ABORTED") issues.push({ type: "requestfailed", url: request.url(), message: request.failure()?.errorText }); });
await page.goto(base, { waitUntil: "load" });
await page.locator(".blacksite-artboard").waitFor();
await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));

async function capture(name) {
  const state = await page.evaluate(() => {
    const artboard = document.querySelector(".blacksite-artboard");
    const camera = document.querySelector(".blacksite-camera");
    const door = document.querySelector(".blacksite-bay.is-active .blacksite-door-leaf");
    const walkway = document.querySelector('.blacksite-background-light-unit[data-emitter="walkway-left-2"] .blacksite-background-emitter');
    const flash = document.querySelector('.blacksite-background-light-unit[data-emitter="amber-beacon-left"]');
    const css = (element) => element ? getComputedStyle(element) : null;
    return {
      phase: artboard?.className.match(/phase-[^ ]+/)?.[0] ?? "unknown",
      cameraWaypoint: camera?.getAttribute("data-camera-waypoint"),
      cameraZoom: camera?.getAttribute("data-camera-zoom"),
      cameraTransition: css(camera)?.transitionDuration,
      doorTransition: css(door)?.transitionDuration,
      walkwayAnimation: css(walkway)?.animationDuration,
      ambientFlashAnimation: css(flash)?.animationDuration,
      overviewVisible: Boolean(document.querySelector(".reveal-panel.is-ready")),
      cameraTransform: camera?.style.transform,
    };
  });
  observations.push({ capture: name, ...state });
  await page.screenshot({ path: resolve(output, `${name}.png`) });
}

await page.locator('.blacksite-bay[data-bay="squadamp"] .blacksite-hotspot').click({ force: true });
await page.waitForFunction(() => document.querySelector(".blacksite-camera")?.getAttribute("data-camera-waypoint") === "walkway-mid-1");
await capture("01-following-walkway-lights");
await page.waitForFunction(() => document.querySelector(".blacksite-camera")?.getAttribute("data-camera-waypoint") === "gate-approach");
await capture("02-following-lights-to-gate");
await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-depressurizing"));
await page.waitForFunction(() => document.querySelector(".blacksite-camera")?.getAttribute("data-camera-waypoint") === "warning-lights");
await capture("03-panning-up-to-warning-lights");
await page.waitForFunction(() => document.querySelector(".blacksite-camera")?.getAttribute("data-camera-waypoint") === "chamber");
await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-depressurizing"));
await capture("04-chamber-focus-before-doors");
await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-opening"));
await page.waitForTimeout(900);
await capture("05-doors-opening");
await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-dissipating"));
await page.waitForFunction(() => document.querySelector(".blacksite-camera")?.getAttribute("data-camera-waypoint") === "pullback");
await page.waitForTimeout(700);
await capture("06-pullback");
await page.waitForFunction(() => document.querySelector(".blacksite-artboard")?.classList.contains("phase-revealed"));
await page.waitForFunction(() => document.querySelector(".blacksite-camera")?.getAttribute("data-camera-waypoint") === "corridor");
await page.waitForTimeout(800);
await capture("07-showcase-after-pullback");
await writeFile(resolve(output, "sequence-observations.json"), `${JSON.stringify({ viewport: "1672x941", observations, issues }, null, 2)}\n`);
await context.close();
await browser.close();
process.stdout.write(`Cinematic sequence captures saved to ${output}; browser issues: ${issues.length}\n`);
