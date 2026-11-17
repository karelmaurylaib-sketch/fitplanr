import { expect, test } from "@playwright/test";

// The whole funnel as a brand-new visitor. Never pays.
test("landing → sign-up → personal flow → plan builds → locked plan → paywall → checkout sheet → account", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Two dumbbells");
  await expect(page.getByText(/pricing|\$\d/i)).toHaveCount(0); // never a price on the landing page
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

  // Equipment Sync: setup → gear → weight, under a pinned progress bar
  const bar = page.getByRole("progressbar", { name: "Your progress" });
  await expect(page.getByTestId("step-count")).toContainText(/Equipment Sync · 1 \/ 3/i);
  const p0 = Number(await bar.getAttribute("aria-valuenow"));
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector("main ul")!).opacity) > 0.9);
  await page.getByRole("button", { name: "Home: 2 dumbbells" }).click();
  await expect.poll(async () => Number(await bar.getAttribute("aria-valuenow"))).toBeGreaterThan(p0);
  await expect(page.getByTestId("step-count")).toContainText(/2 \/ 3/, { timeout: 5000 });
  await expect(page.getByText("exercises fit")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByTestId("step-count")).toContainText(/3 \/ 3/);
  await expect(page.getByTestId("db-weight")).toContainText("25");
  await page.getByRole("button", { name: "Build my plan" }).click();

  // Value Preview: personal projection from the engine, before the plan builds
  const preview = page.getByRole("dialog", { name: "Your projection" });
  await expect(preview.getByText("Goblet Squat")).toBeVisible({ timeout: 15_000 });
  await expect(preview.getByText(/2 dumbbells \(25 lb\)/)).toBeVisible();
  await preview.getByRole("button", { name: "Build my plan" }).click();

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
  await dialog.getByRole("button", { name: /I'll train/ }).click();
  await expect(dialog.getByRole("button", { name: /You're in/ })).toBeVisible();
  await dialog.getByRole("button", { name: "Start my plan" }).first().click();

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

  await page.goto("/account");
  await expect(page.getByText(email)).toBeVisible();
  expect(errors).toEqual([]);
});
