import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const slugs = ["xondry", "squadamp", "atomlang-evolved-sdk", "raeyl", "realball26", "classified"];

test("home offers direct professional access and real navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /browse products/i })).toHaveAttribute("href", "/work");
  await expect(page.getByRole("link", { name: "Contact", exact: true })).toHaveAttribute("href", "/contact");
  await expect(page.getByRole("link", { name: "Vault" })).toHaveAttribute("href", "/vault");
});

test("all dossiers render truthful project detail", async ({ page }) => {
  for (const slug of slugs) {
    await page.goto(`/work/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("CONCEPT VISUALIZATION")).toBeVisible();
    await expect(page.getByText(/Current limits/i)).toBeVisible();
  }
});

test("RealBall is presented as a basketball prototype, not LIVE", async ({ page }) => {
  await page.goto("/work/realball26");
  await expect(page.locator("main")).toContainText(/basketball/i);
  await expect(page.locator("main")).toContainText(/playable prototype.*development/i);
  await expect(page.getByText(/^LIVE$/i)).toHaveCount(0);
});

test("a chamber reveals, supports skip, closes with Escape, and follows back/forward", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /xondry/i }).first().click();
  await expect(page).toHaveURL(/#bay=xondry$/);
  await page.getByRole("button", { name: /skip effects/i }).click();
  await expect(page.getByRole("link", { name: /open dossier/i })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("button", { name: /xondry/i }).first()).toBeFocused();
  await page.goForward();
  await expect(page.getByRole("heading", { name: "Xondry.com" })).toBeVisible();
});

test("a dossier is a deep link and browser back restores its open chamber", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /xondry/i }).first().click();
  await page.getByRole("button", { name: /skip effects/i }).click();
  await page.getByRole("link", { name: /open dossier/i }).click();
  await expect(page).toHaveURL(/\/work\/xondry$/);
  await expect(page.getByRole("heading", { name: "Xondry.com" })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/#bay=xondry$/);
  await expect(page.getByRole("heading", { name: "Xondry.com" })).toBeVisible();
});

test("the user can skip the mechanical entrance sequence", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Enter the Facility" }).click();
  await page.getByRole("button", { name: "Skip entry sequence" }).click();
  await expect(page.locator(".facility")).toHaveClass(/entry-entered/);
  await expect(page.getByText("SELECT A RESEARCH BAY")).toBeVisible();
});

test("reduced motion defaults to professional browsing and chambers reveal immediately", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Product dossiers" })).toBeVisible();
  await page.getByRole("button", { name: "Switch to Experience" }).click();
  await page.getByRole("button", { name: /raeyl/i }).first().click();
  await expect(page.getByRole("link", { name: /open dossier/i })).toBeVisible();
});

test("mobile layouts have no horizontal overflow and retain all projects", async ({ page }) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 720 });
    await page.goto("/work");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBeTruthy();
    for (const slug of slugs) await expect(page.locator(`a[href="/work/${slug}"]`)).toBeVisible();
  }
});

test("the entrance fits the five required reference viewports", async ({ page }) => {
  for (const [width, height] of [[1672, 941], [1440, 900], [1024, 768], [390, 844], [320, 720]]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBeTruthy();
  }
});

test("the main work index has no serious automated accessibility violations", async ({ page }) => {
  await page.goto("/work");
  const result = await new AxeBuilder({ page: page as never }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(result.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);
});

test("the home page has no serious automated accessibility violations", async ({ page }) => {
  await page.goto("/");
  const result = await new AxeBuilder({ page: page as never }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(result.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);
});
