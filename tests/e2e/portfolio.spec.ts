import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const projects = [
  ["xondry", /xondry/i], ["squadamp", /squadamp/i], ["atomlang-evolved-sdk", /atomlang/i],
  ["raeyl", /raeyl/i], ["realball26", /realball/i], ["classified", /classified/i],
] as const;

async function useExperience(page: import("@playwright/test").Page, motion: "full" | "off" = "off") {
  await page.emulateMedia({ reducedMotion: motion === "off" ? "reduce" : "no-preference" });
}

async function openImmediately(page: import("@playwright/test").Page, id: string) {
  await page.locator(`.blacksite-bay[data-bay="${id}"] .blacksite-hotspot`).click({ force: true });
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".blacksite-artboard")).toHaveClass(/phase-revealed/);
}

test("home always shows the chamber experience and links directly to Work", async ({ page }) => {
  await useExperience(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("BLACK SITE");
  await expect(page.getByRole("link", { name: "Browse Work", exact: true }).first()).toHaveAttribute("href", "/work");
  await expect(page.getByRole("link", { name: "View Work", exact: true })).toHaveCount(0);
  await expect(page.getByText(/product dossier|mission dossier/i)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Contact", exact: true }).first()).toHaveAttribute("href", "/contact");
  await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Work" })).toHaveAttribute("href", "/work");
  await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Vault" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /professional mode|switch to experience/i })).toHaveCount(0);
  await expect(page.locator(".scene-toolbar, .facility-modes, .professional-fallback")).toHaveCount(0);
  await expect(page.locator(".blacksite-artboard")).toBeVisible();
});

test("six real artwork inserts are mapped into accessible chamber controls", async ({ page }) => {
  await useExperience(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".blacksite-exhibit-image")).toHaveCount(6);
  await expect(page.locator(".blacksite-hotspot")).toHaveCount(6);
  await expect(page.locator('.blacksite-bay[data-door-state="closed"]')).toHaveCount(6);
  await expect(page.locator(".blacksite-door-leaf")).toHaveCount(12);
  await expect(page.locator(".blacksite-exhibit-label")).toHaveCount(0);
  const asset = await page.request.get("/blacksite/art/xondry-exhibit.webp");
  expect(asset.status()).toBe(200);
  const hotspot = page.locator('.blacksite-bay[data-bay="xondry"] .blacksite-hotspot');
  const imageFilter = await page.locator('.blacksite-bay[data-bay="xondry"] .blacksite-exhibit-image').evaluate((element) => getComputedStyle(element).filter);
  await hotspot.hover({ position: { x: 10, y: 12 } });
  await expect.poll(() => hotspot.evaluate((element) => getComputedStyle(element).boxShadow)).toBe("none");
  await expect(page.locator('.blacksite-bay[data-bay="xondry"] .blacksite-exhibit-image')).toHaveCSS("filter", imageFilter);
  await hotspot.click();
  await expect(page).toHaveURL(/#bay=xondry$/);
  await openImmediately(page, "xondry");
  await expect(page.getByRole("dialog")).toContainText("Xondry.com");
  await expect(page.getByRole("dialog")).toHaveClass(/reveal-panel-right/);
  await expect(page.locator('.blacksite-bay[data-bay="xondry"]')).toHaveAttribute("data-door-state", "open");
  await hotspot.hover({ position: { x: 10, y: 12 } });
  await expect.poll(() => hotspot.evaluate((element) => getComputedStyle(element).boxShadow)).toBe("none");
  await expect(page.locator('.blacksite-bay[data-bay="xondry"] .blacksite-exhibit-image')).toHaveCSS("transform", "none");
});

test("only one chamber stays open and the project panel moves to the opposite side", async ({ page }) => {
  await useExperience(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await openImmediately(page, "xondry");
  await expect(page.locator('.blacksite-bay[data-door-state="open"]')).toHaveCount(1);
  let previous = "xondry";
  for (const [id, side] of [["squadamp", "right"], ["atomlang-evolved-sdk", "right"], ["raeyl", "left"], ["realball26", "left"], ["classified", "left"]] as const) {
    await openImmediately(page, id);
    await expect(page.locator(`.blacksite-bay[data-bay="${previous}"]`)).toHaveAttribute("data-door-state", "closed");
    await expect(page.locator(`.blacksite-bay[data-bay="${id}"]`)).toHaveAttribute("data-door-state", "open");
    await expect(page.locator('.blacksite-bay[data-door-state="open"]')).toHaveCount(1);
    await expect(page.getByRole("dialog")).toHaveClass(new RegExp(`reveal-panel-${side}`));
    previous = id;
  }
});

test("chamber reveal sequences unlock, vent, slide their doors, and reveal project details", async ({ page }) => {
  await useExperience(page, "full");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.locator('.blacksite-bay[data-bay="xondry"] .blacksite-hotspot').click();
  await expect(page.locator(".blacksite-artboard")).toHaveClass(/phase-unlocking/);
  await expect(page.locator('.blacksite-bay[data-bay="xondry"] .blacksite-door-leaf')).toHaveCount(2);
  await expect(page.locator(".blacksite-artboard")).toHaveClass(/phase-depressurizing/, { timeout: 3_000 });
  await expect(page.locator('.blacksite-bay[data-bay="xondry"] .blacksite-steam')).toHaveCount(0);
  await expect(page.locator(".blacksite-artboard")).toHaveClass(/phase-opening/, { timeout: 3_000 });
  const steam = page.locator('.blacksite-bay[data-bay="xondry"] .blacksite-steam');
  await expect.poll(() => steam.evaluate((element) => Number(getComputedStyle(element).opacity))).toBeGreaterThan(0.1);
  const steamVideo = steam.locator("video.steam-cloud-video");
  await expect(steamVideo).toHaveCount(1);
  await expect.poll(() => steamVideo.evaluate((video) => (video as HTMLVideoElement).readyState)).toBeGreaterThan(1);
  await expect.poll(() => steamVideo.evaluate((video) => (video as HTMLVideoElement).currentTime)).toBeGreaterThan(0);
  const doorTransform = await page.locator('.blacksite-bay[data-bay="xondry"] .door-left').evaluate((element) => getComputedStyle(element).transform);
  expect(doorTransform).not.toBe("none");
  await expect(page.locator(".blacksite-artboard")).toHaveClass(/phase-dissipating/, { timeout: 3_000 });
  const initialFadeOpacity = await steam.evaluate((element) => Number(getComputedStyle(element).opacity));
  await page.waitForTimeout(350);
  const fadedOpacity = await steam.evaluate((element) => Number(getComputedStyle(element).opacity));
  expect(fadedOpacity).toBeLessThan(initialFadeOpacity - 0.2);
  await expect(page.locator(".blacksite-artboard")).toHaveClass(/phase-revealed/, { timeout: 3_000 });
  await expect(steam).toHaveCount(0);
  await expect(page.getByRole("link", { name: "View project", exact: true })).toBeVisible();
});

test("the central entrance lights the vault, advances, and can be skipped", async ({ page }) => {
  await useExperience(page, "full");
  await page.goto("/");
  await page.getByRole("button", { name: "Enter the Facility" }).click();
  await expect(page.locator(".facility-stage")).toHaveClass(/entry-opening/);
  const seamOpacity = await page.locator(".blacksite-vault-seam").evaluate((element) => Number(getComputedStyle(element).opacity));
  expect(seamOpacity).toBeGreaterThan(0.4);
  await page.getByRole("button", { name: "Skip entry sequence" }).click();
  await expect(page.locator(".facility-stage")).toHaveClass(/entry-entered/);
  await expect(page.locator(".blacksite-mobile-choice")).toHaveCount(6);
});

test("project panel closes on Escape, restores focus, and supports browser Back/Forward", async ({ page }) => {
  await useExperience(page);
  await page.goto("/");
  const trigger = page.locator('.blacksite-bay[data-bay="xondry"] .blacksite-hotspot');
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#bay=xondry$/);
  await page.getByRole("button", { name: /Return to corridor/i }).click();
  await expect(page).not.toHaveURL(/#bay=/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.goForward();
  await expect(page.getByRole("heading", { name: "Xondry.com" })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("a shared chamber link and a refreshed link produce usable project details", async ({ page }) => {
  await useExperience(page);
  await page.goto("/#bay=raeyl");
  await expect(page).toHaveURL(/#bay=raeyl$/);
  await expect(page.getByRole("heading", { name: "RAEYL" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "RAEYL" })).toBeVisible();
});

test("switching chambers replaces the previous selection and leaves only the current chamber in history", async ({ page }) => {
  await useExperience(page, "full");
  await page.goto("/");
  await page.locator('.blacksite-bay[data-bay="xondry"] .blacksite-hotspot').click();
  await page.locator('.blacksite-bay[data-bay="atomlang-evolved-sdk"] .blacksite-hotspot').click();
  await expect(page).toHaveURL(/#bay=atomlang-evolved-sdk$/);
  await expect(page.getByRole("heading", { name: "AtomLang Evolved SDK" })).toBeVisible();
  await expect(page.locator('.blacksite-bay[data-bay="xondry"]')).toHaveAttribute("data-door-state", "closed");
  await expect(page.locator('.blacksite-bay[data-door-state="open"]')).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page).not.toHaveURL(/#bay=/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goForward();
  await expect(page).toHaveURL(/#bay=atomlang-evolved-sdk$/);
  await expect(page.getByRole("heading", { name: "AtomLang Evolved SDK" })).toBeVisible();
  await page.goBack();
  await expect(page).not.toHaveURL(/#bay=/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("all six chambers survive repeated open and close cycles", async ({ page }) => {
  test.setTimeout(180_000);
  await useExperience(page);
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/");
  const scene = page.locator(".blacksite-artboard");
  for (let cycle = 0; cycle < 18; cycle++) {
    await page.locator(".blacksite-mobile-choice").nth(cycle % projects.length).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: /Return to corridor/i }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await expect(scene).toBeVisible();
  await expect(page).not.toHaveURL(/#bay=/);
});

test("mobile reflows the artwork into a scene crop and a touch friendly selector", async ({ page }) => {
  await useExperience(page);
  for (const [width, height] of [[1024, 768], [390, 844], [360, 800]]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(page.locator(".blacksite-viewport")).toBeVisible();
    await expect(page.locator(".blacksite-mobile-selector")).toBeVisible();
    await expect(page.locator(".blacksite-mobile-choice")).toHaveCount(6);
    await expect(page.locator(".blacksite-mobile-choice").first()).toHaveCSS("min-height", /5[8-9]|6[0-9]/);
    await expect(page.getByRole("button", { name: /Xondry/i }).last()).toBeVisible();
    await page.locator(".blacksite-mobile-choice").first().click();
    await expect(page.locator(".blacksite-mobile-selected-exhibit img")).toBeVisible();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBeTruthy();
    await page.getByRole("button", { name: /Return to corridor/i }).click();
  }
});

test("reduced motion gives instant chamber access and preserves project details", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await useExperience(page, "off");
  await page.goto("/");
  await openImmediately(page, "realball26");
  await expect(page.getByRole("dialog")).toContainText(/PLAYABLE PROTOTYPE.*IN DEVELOPMENT/i);
  await expect(page.locator('.blacksite-bay[data-bay="realball26"] .blacksite-steam')).toHaveCount(0);
});

test("all six project pages render details and conservative statuses", async ({ page }) => {
  for (const [slug] of projects) {
    await page.goto(`/work/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("CONCEPT ART · NOT A PRODUCT CAPTURE")).toBeVisible();
    await expect(page.getByText(/Current limits/i)).toBeVisible();
  }
  await page.goto("/work/realball26");
  await expect(page.locator("main")).toContainText(/playable prototype.*development/i);
  await expect(page.getByText(/^LIVE$/i)).toHaveCount(0);
  await page.goto("/work/squadamp");
  await expect(page.locator("main")).toContainText("IN DEVELOPMENT");
});

test("the home experience has no serious automated accessibility violations", async ({ page }) => {
  await useExperience(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".blacksite-artboard")).toBeVisible();
  const result = await new AxeBuilder({ page: page as never }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(result.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious")).toEqual([]);
});

test("the work index has no serious automated accessibility violations", async ({ page }) => {
  await page.goto("/work");
  const result = await new AxeBuilder({ page: page as never }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(result.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious")).toEqual([]);
});

test("server rendered links lead to the project index without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /BLACK SITE/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse Work", exact: true }).first()).toHaveAttribute("href", "/work");
  await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
  await page.goto("/work");
  await expect(page.getByRole("heading", { name: "Selected work" })).toBeVisible();
  await expect(page.getByRole("link", { name: "View project" }).first()).toHaveAttribute("href", "/work/xondry");
  await page.goto("/work/xondry");
  await expect(page.getByRole("heading", { name: "Xondry.com" })).toBeVisible();
  await context.close();
});

test("failed environment art leaves the real chamber controls and project details available", async ({ page }) => {
  await useExperience(page);
  await page.route("**/blacksite/art/environment-plate.webp", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".blacksite-hotspot")).toHaveCount(6);
  await page.locator('.blacksite-bay[data-bay="xondry"] .blacksite-hotspot').click({ force: true });
  await expect(page.getByRole("dialog")).toBeVisible();
  const skip = page.getByRole("button", { name: /Skip effects/i });
  if (await skip.isVisible().catch(() => false)) await skip.click();
  await expect(page.getByRole("link", { name: "View project", exact: true })).toBeVisible();
});

test("the experience fits the approved desktop and mobile viewports without horizontal overflow", async ({ page }) => {
  await useExperience(page);
  for (const [width, height] of [[1672, 941], [1440, 900], [1920, 1080], [1024, 768], [390, 844], [360, 800]]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(page.locator(".blacksite-artboard")).toBeVisible();
    const visibleHeading = width <= 760 ? page.getByRole("heading", { level: 1, name: /BLACK SITE/i }) : page.getByRole("heading", { level: 1 });
    await expect(visibleHeading).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBeTruthy();
  }
});
