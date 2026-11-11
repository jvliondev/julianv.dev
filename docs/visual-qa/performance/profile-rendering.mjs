import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:3200";
const output = resolve(process.env.PROFILE_OUT ?? "docs/visual-qa/performance/latest.json");
const cpuRate = Number(process.env.PROFILE_CPU_RATE ?? 1);
const variant = process.env.PROFILE_VARIANT ?? "default";
await mkdir(dirname(output), { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
await page.addInitScript(() => {
  const profile = { active: null, frames: {}, longTasks: {}, lastFrame: 0 };
  window.__renderProfile = profile;
  new PerformanceObserver((list) => {
    for (const task of list.getEntries()) {
      if (profile.active) (profile.longTasks[profile.active] ??= []).push(task.duration);
    }
  }).observe({ type: "longtask", buffered: true });
  const tick = (now) => {
    if (profile.lastFrame && profile.active) (profile.frames[profile.active] ??= []).push(now - profile.lastFrame);
    profile.lastFrame = now;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
const cdp = await context.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpuRate });
await page.goto(base, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
if (variant === "no-mask") {
  await page.addStyleTag({ content: ".blacksite-camera.has-exposed-edge .blacksite-artboard{mask-image:none!important;-webkit-mask-image:none!important}" });
}
if (variant === "no-light-system") {
  await page.addStyleTag({ content: ".blacksite-environment-light-system{display:none!important}" });
}
if (variant === "no-ambient-units") {
  await page.addStyleTag({ content: ".blacksite-background-light-unit:not(.mode-sequence){display:none!important}" });
}
if (variant === "no-smoke") {
  await page.addStyleTag({ content: ".blacksite-effects-layer{display:none!important}" });
}
await page.locator(".blacksite-bay[data-bay='xondry'] .blacksite-hotspot").waitFor();

const percentile = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] ?? null;
async function sample(name, ms) {
  await page.evaluate((label) => {
    window.__renderProfile.frames[label] = [];
    window.__renderProfile.longTasks[label] = [];
    window.__renderProfile.active = label;
  }, name);
  await page.waitForTimeout(ms);
  const raw = await page.evaluate((label) => {
    window.__renderProfile.active = null;
    return { frames: window.__renderProfile.frames[label], tasks: window.__renderProfile.longTasks[label] };
  }, name);
  const frames = raw.frames.sort((a, b) => a - b);
  const tasks = raw.tasks;
  const mean = frames.length ? frames.reduce((sum, value) => sum + value, 0) / frames.length : null;
  return {
    durationMs: Math.round(frames.reduce((sum, value) => sum + value, 0)),
    frameSamples: frames.length,
    fpsFromMeanFrameInterval: mean ? Math.round(1000 / mean) : null,
    frameIntervalMs: { median: percentile(frames, .5), p95: percentile(frames, .95), max: frames.at(-1) ?? null },
    framesOver24ms: frames.filter((value) => value > 24).length,
    framesOver34ms: frames.filter((value) => value > 34).length,
    longTaskCount: tasks.length,
    longTaskTotalMs: Math.round(tasks.reduce((sum, value) => sum + value, 0)),
    longTaskMaxMs: tasks.length ? Math.round(Math.max(...tasks)) : 0,
  };
}

const samples = { idle: await sample("idle", 5000) };
const states = [
  ["unlocking", 1500],
  ["depressurizing", 2200],
  ["opening", 1800],
  ["dissipating", 1500],
  ["revealed", 2000],
];
await page.locator(".blacksite-bay[data-bay='xondry'] .blacksite-hotspot").click({ force: true });
for (const [phase, duration] of states) {
  await page.waitForFunction((name) => document.querySelector(".blacksite-artboard")?.classList.contains(`phase-${name}`), phase, { timeout: 20_000 });
  if (variant === "no-smoke") await page.evaluate(() => document.querySelectorAll("video").forEach((video) => video.pause()));
  samples[phase] = await sample(phase, duration);
}
const pageSummary = await page.evaluate(() => {
  const resources = performance.getEntriesByType("resource");
  const images = resources.filter((entry) => /\.(?:png|jpe?g|webp|avif|gif)(?:\?|$)/i.test(entry.name));
  const activeAnimations = document.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length;
  return {
    domElements: document.querySelectorAll("*").length,
    imagesLoaded: document.images.length,
    imageTransferBytes: images.reduce((sum, entry) => sum + (entry.transferSize || entry.encodedBodySize || 0), 0),
    activeCssAnimations: activeAnimations,
  };
});
const result = {
  context: `Production static export, Chromium, 1440x900, CPU throttled ${cpuRate}x, variant ${variant}; requestAnimationFrame cadence is a rendering proxy, not a measured user INP.`,
  url: base,
  measuredAt: new Date().toISOString(),
  pageSummary,
  samples,
};
await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
await browser.close();
