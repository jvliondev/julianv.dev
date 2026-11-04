import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const dossiers = ["xondry", "squadamp", "atomlang-evolved-sdk", "raeyl", "realball26", "classified"];
const chamberNames = [/xondry/i, /squadamp/i, /atomlang/i, /raeyl/i, /realball/i, /classified/i];

async function useImmediateFacility(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem("jv-mode", "experience");
    sessionStorage.setItem("jv-motion", "off");
  });
}

async function triggerSkipEffects(page: import("@playwright/test").Page) {
  const button = page.locator(".skip-effects");
  await button.waitFor({ state: "visible" });
  await button.evaluate((element) => (element as HTMLButtonElement).click());
}

async function triggerEntrySkip(page: import("@playwright/test").Page) {
  const button = page.getByRole("button", { name: "Skip entry sequence" });
  await button.waitFor({ state: "visible" });
  await button.evaluate((element) => (element as HTMLButtonElement).click());
}

test("home provides direct product access, experience controls, and working navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("BLACK SITE");
  await expect(page.getByRole("link", { name: "Browse Products", exact: true })).toHaveAttribute("href", "/work");
  await expect(page.getByRole("link", { name: "Contact", exact: true }).first()).toHaveAttribute("href", "/contact");
  await expect(page.getByRole("link", { name: "Vault" })).toHaveAttribute("href", "/vault");
  await expect(page.getByRole("button", { name: "Professional Mode" })).toBeVisible();
  await expect(page.getByLabel("Motion")).toBeVisible();
});

test("all six dossier routes render project details and truthful statuses", async ({ page }) => {
  for (const slug of dossiers) {
    await page.goto(`/work/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("CONCEPT VISUALIZATION")).toBeVisible();
    await expect(page.getByText(/Current limits/i)).toBeVisible();
  }
});

test("RealBall is a basketball prototype in development, never presented as live", async ({ page }) => {
  await page.goto("/work/realball26");
  await expect(page.locator("main")).toContainText(/basketball/i);
  await expect(page.locator("main")).toContainText(/playable prototype.*development/i);
  await expect(page.getByText(/^LIVE$/i)).toHaveCount(0);
});

test("chamber reveals, skips its effects, closes on Escape, and restores browser history", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("jv-mode", "experience"));
  await page.goto("/");
  await page.waitForFunction(() => Boolean(document.querySelector(".scene-viewport.scene-ready")));
  await page.clock.install();
  const xondry = page.getByRole("button", { name: /xondry/i }).first();
  await xondry.click();
  await expect(page).toHaveURL(/#bay=xondry$/);
  await triggerSkipEffects(page);
  await expect(page.getByRole("link", { name: "Open dossier", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/$/);
  await page.clock.fastForward(1_000);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /xondry/i }).first()).toBeFocused();
  await page.goForward();
  await expect(page.getByRole("heading", { name: "Xondry.com" })).toBeVisible();
});

test("a dossier deep link preserves the open chamber when the user returns", async ({ page }) => {
  await useImmediateFacility(page);
  await page.goto("/");
  await page.getByRole("button", { name: /xondry/i }).first().click();
  await expect(page.getByRole("link", { name: "Open dossier", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Open dossier", exact: true }).click();
  await expect(page).toHaveURL(/\/work\/xondry$/);
  await expect(page.getByRole("heading", { name: "Xondry.com" })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/#bay=xondry$/);
  await expect(page.getByRole("heading", { name: "Xondry.com" })).toBeVisible();
});

test("the pressure door can be entered or opened immediately with Skip", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("jv-mode", "experience"));
  await page.goto("/");
  await expect(page.locator(".scene-canvas")).toHaveAttribute("data-draw-calls", /\d+/);
  await page.getByRole("button", { name: "Enter the Facility" }).click();
  await triggerEntrySkip(page);
  await expect(page.locator(".facility-stage")).toHaveClass(/entry-entered/);
  await expect(page.getByText("SELECT A BAY")).toBeVisible();
  await page.waitForFunction(() => Number(document.querySelector(".scene-canvas")?.getAttribute("data-vault-open")) >= .98, null, { timeout: 15_000 });
  await expect(page.locator(".scene-canvas")).toHaveAttribute("data-draw-calls", /\d+/);
});

test("all six chambers survive 20 successive open and close cycles", async ({ page }) => {
  test.setTimeout(240_000);
  await useImmediateFacility(page);
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/");
  await page.waitForFunction(() => Boolean(document.querySelector(".scene-viewport.scene-ready")));
  const canvas = page.locator(".scene-canvas");
  await expect(canvas).toHaveAttribute("data-rock-texture", /^(ready|fallback)$/);
  const startMetrics = await canvas.evaluate((element) => ({ geometries: element.getAttribute("data-geometries"), textures: element.getAttribute("data-textures") }));
  await expect(canvas).toHaveAttribute("data-geometries", startMetrics.geometries!);
  await expect(canvas).toHaveAttribute("data-textures", startMetrics.textures!);
  for (let cycle = 0; cycle < 20; cycle++) {
    await page.locator(".scene-hotspot").nth(cycle % chamberNames.length).click({ force: true });
    expect(page.url()).toMatch(/#bay=/);
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.locator(".panel-actions button").click({ force: true });
    await page.waitForFunction(() => !location.hash.startsWith("#bay="));
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toHaveAttribute("data-geometries", startMetrics.geometries!);
  await expect(canvas).toHaveAttribute("data-textures", startMetrics.textures!);
});

test("rapid chamber switching and Escape interrupt an in-progress reveal cleanly", async ({ page }) => {
  await useImmediateFacility(page);
  await page.goto("/");
  await page.getByRole("button", { name: /xondry/i }).first().click();
  await page.getByRole("button", { name: /atomlang/i }).first().click();
  await expect(page).toHaveURL(/#bay=atomlang-evolved-sdk$/);
  await expect(page.getByRole("heading", { name: "AtomLang Evolved SDK" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/#bay=xondry$/);
  await page.keyboard.press("Escape");
  await expect(page).not.toHaveURL(/#bay=/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("reduced motion selects Professional Mode and reveals selected dossiers immediately", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Product dossiers" })).toBeVisible();
  await page.getByRole("button", { name: "Switch to Experience" }).click();
  await page.getByRole("button", { name: /raeyl/i }).first().click();
  await expect(page.getByRole("link", { name: "Open dossier", exact: true })).toBeVisible();
});

test("a WebGL startup failure leaves the architectural fallback and controls usable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value: () => null,
    });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("BLACK SITE");
  await expect(page.locator(".scene-fallback")).toHaveCSS("opacity", "1");
  await page.getByRole("button", { name: /xondry/i }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("server-rendered navigation and product index remain available without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Product dossiers" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open dossier", exact: true }).first()).toHaveAttribute("href", "/work/xondry");
  await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
  await page.screenshot({ path: "docs/visual-qa/final/no-js-professional.png" });
  await page.goto("/work/xondry");
  await expect(page.getByRole("heading", { name: "Xondry.com" })).toBeVisible();
  await context.close();
});

test("responsive professional and experience layouts avoid horizontal overflow", async ({ page }) => {
  await page.addInitScript(() => { sessionStorage.removeItem("jv-mode"); sessionStorage.removeItem("jv-motion"); });
  for (const [width, height] of [[390, 844], [320, 720]]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Product dossiers" })).toBeVisible();
    const proWidth = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
    expect(proWidth).toBeTruthy();
    await page.getByRole("button", { name: "Switch to Experience" }).click();
    await expect(page.locator(".scene-viewport.scene-ready")).toBeVisible();
    const experienceWidth = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
    expect(experienceWidth).toBeTruthy();
    for (const chamberName of chamberNames) await expect(page.getByRole("button", { name: chamberName }).first()).toBeVisible();
  }
});

test("the main work index has no serious automated accessibility violations", async ({ page }) => {
  await page.goto("/work");
  const result = await new AxeBuilder({ page: page as never }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(result.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious")).toEqual([]);
});

test("the interactive facility has no serious automated accessibility violations", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const result = await new AxeBuilder({ page: page as never }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(result.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious")).toEqual([]);
});

test("the entrance fits the five supplied reference widths", async ({ page }) => {
  await page.addInitScript(() => { sessionStorage.removeItem("jv-mode"); sessionStorage.removeItem("jv-motion"); });
  for (const [width, height] of [[1672, 941], [1440, 900], [1024, 768], [390, 844], [320, 720]]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    const heading = width <= 767 ? page.getByRole("heading", { name: "Product dossiers" }) : page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBeTruthy();
  }
});
