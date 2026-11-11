import { expect, test } from "@playwright/test";

// The whole funnel as a brand-new visitor. Never pays.
test("landing → sign-up → personal flow → plan builds → locked plan → paywall → checkout sheet → account", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Two dumbbells");
  await expect(page.getByText(/pricing|\$\d/i)).toHaveCount(0); // never a price on the landing page
  await expect(page.getByText("Nutrition Plan")).toBeVisible(); // the feature loop is on the landing page
  await page.getByRole("link", { name: "Build my plan" }).first().click();

  await expect(page).toHaveURL(/\/signup/);
  const email = `e2e+${Date.now()}${Math.floor(Math.random() * 1000)}@fitplanr-test.com`;
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("Test-password-123");
  await page.getByRole("button", { name: "Build my plan" }).click();

  await expect(page).toHaveURL(/\/start/, { timeout: 20_000 });
  for (const answer of ["Build muscle", "Never really", "3 days", "45 minutes"]) {
    // answers appear once the question has typed itself (and the page is interactive)
    await page.waitForFunction(() => Number(getComputedStyle(document.querySelector("main ul")!).opacity) > 0.9);
    await page.getByRole("button", { name: answer }).click();
    await page.waitForTimeout(1500);
  }
  await page.getByRole("button", { name: "Skip" }).click();
  await expect(page.getByText("Pick a starting point")).toBeVisible();
  await page.getByRole("button", { name: "2 dumbbells" }).click();
  await page.getByRole("button", { name: "Build my plan" }).click();

  await expect(page.getByText("Building your plan…")).toBeVisible();
  await expect(page.getByText("Your 4-week plan is ready.").first()).toBeVisible({ timeout: 30_000 });
  await expect(page).toHaveURL(/\/plan/, { timeout: 15_000 });

  // Day 1 in clear, the rest locked
  await expect(page.getByText("Day 1 · Mon")).toBeVisible();
  await expect(page.getByText("Goblet Squat").first()).toBeVisible();

  // paywall opens over the result
  const dialog = page.getByRole("dialog", { name: "Choose your plan" });
  if (!(await dialog.isVisible())) await page.getByRole("button", { name: /Unlock my full plan/ }).last().click();
  await expect(dialog).toBeVisible({ timeout: 10_000 });
  await expect(dialog.getByText("Your 4-week plan is ready.")).toBeVisible();
  await expect(dialog.getByText("Most popular").first()).toBeVisible();
  await dialog.getByRole("button", { name: /^Continue with/ }).first().click();

  // checkout sheet opens inside the page (never pay)
  const checkout = page.getByRole("dialog", { name: "Secure checkout" });
  await expect(checkout).toBeVisible();
  await expect(checkout.locator("#whop-checkout iframe").or(checkout.getByText("Payments open in a moment"))).toBeVisible({ timeout: 20_000 });
  await checkout.getByRole("button", { name: "Close" }).click();
  await expect(checkout).toBeHidden();
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("button", { name: /Unlock my full plan ·/ })).toBeVisible();

  // returning visitor lands on their locked plan
  await page.goto("/");
  await expect(page).toHaveURL(/\/plan/);

  // Nutrition is a paid part: checked on the server, an unpaid account goes back to its locked plan
  await page.goto("/nutrition");
  await expect(page).toHaveURL(/\/plan/);
  const log = await page.request.post("/api/nutrition/log", { data: { eatenOn: "2026-11-11", meal: "lunch", title: "x", items: [{ name: "x", portion: "1", kcal: 1, protein: 1, carbs: 1, fat: 1 }], source: "plan" } });
  expect(log.status()).toBe(402);
  expect((await page.request.post("/api/nutrition/scan")).status()).toBe(404); // the meal photo scan was removed

  await page.goto("/account");
  await expect(page.getByText(email)).toBeVisible();
  expect(errors).toEqual([]);
});
