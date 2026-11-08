import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:3200";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  window.__interactionSamples = [];
  try {
    window.__latestLcp = null;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__latestLcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
  } catch { /* Largest Contentful Paint is not available in every browser build. */ }
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "event" && entry.interactionId) {
          window.__interactionSamples.push({ id: entry.interactionId, type: entry.name, duration: entry.duration });
        }
      }
    }).observe({ type: "event", buffered: true, durationThreshold: 0 });
  } catch { /* Event Timing is not available in every browser build. */ }
});
await page.goto(base, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
const navigation = await page.evaluate(() => {
  const lcp = window.__latestLcp ?? performance.getEntriesByType("largest-contentful-paint").at(-1)?.startTime ?? null;
  const shifts = performance.getEntriesByType("layout-shift");
  const cls = shifts.filter((entry) => !entry.hadRecentInput).reduce((sum, entry) => sum + entry.value, 0);
  return { lcpMs: lcp, cls, viewport: { width: innerWidth, height: innerHeight } };
});
await page.getByRole("button", { name: /Open Xondry\.com project/i }).click();
await page.getByRole("link", { name: "View project", exact: true }).waitFor();
await page.waitForTimeout(150);
const interaction = await page.evaluate(() => {
  const samples = window.__interactionSamples;
  const grouped = new Map();
  for (const sample of samples) grouped.set(sample.id, Math.max(grouped.get(sample.id) ?? 0, sample.duration));
  return { samples: samples.length, interactionCount: grouped.size, maxInteractionEventDurationMs: grouped.size ? Math.max(...grouped.values()) : null };
});
const result = {
  context: "local production static export, headless Chromium, desktop viewport, unthrottled browser",
  url: base,
  measuredAt: new Date().toISOString(),
  navigation,
  interaction,
  note: "maxInteractionEventDurationMs is a scripted Event Timing proxy. It is not field INP, a p75 Core Web Vital, or a substitute for real-user measurement."
};
await writeFile(resolve("docs/local-vitals.json"), `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
await browser.close();
