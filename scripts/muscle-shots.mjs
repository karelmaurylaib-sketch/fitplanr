// Muscle Map & Calorie Burn Estimator, used like a user (local dev with DEV_PAID_EMAIL_SUFFIX).
// Usage: node scripts/muscle-shots.mjs [pass]
import { chromium } from "playwright";
import fs from "node:fs";
const base = process.env.BASE_URL || "http://localhost:3001";
const pass = process.argv[2] || "1";
fs.mkdirSync("shots", { recursive: true });
const exe = fs.existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {};
const b = await chromium.launch(exe);
for (const [tag, vp] of [["390", { width: 390, height: 844, mobile: true }], ["1440", { width: 1440, height: 900 }]]) {
  const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await p.goto(base + "/signup");
  await p.getByLabel("Email").fill(`mm${Date.now()}.paidpreview@fitplanr-test.com`);
  await p.getByLabel("Password", { exact: true }).fill("Test-password-123");
  await p.getByRole("button", { name: "Build my plan" }).click();
  await p.waitForFunction(() => location.pathname.startsWith("/start"), null, { timeout: 60000 });
  for (const a of ["Build muscle", "Never really", "3 days", "45 minutes"]) {
    await p.waitForFunction(() => Number(getComputedStyle(document.querySelector("main ul")).opacity) > 0.9);
    await p.getByRole("button", { name: a }).click();
    await p.waitForTimeout(1500);
  }
  await p.getByRole("button", { name: "Skip" }).click(); await p.waitForTimeout(1500);
  await p.getByRole("button", { name: "Build my plan" }).click();
  await p.waitForFunction(() => location.pathname === "/plan", null, { timeout: 60000 });
  await p.goto(base + "/library"); await p.waitForTimeout(1500);
  await p.getByRole("button", { name: /Goblet Squat/ }).first().click();
  const sheet = p.getByRole("dialog", { name: "Goblet Squat" });
  await sheet.getByText("Muscles worked").waitFor();
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `shots/mm${pass}-sheet-${tag}.png` });
  // empty state, then numbers
  const kcalEmpty = await sheet.getByText("Add your weight and age to see your burn.").isVisible();
  await sheet.getByLabel("Body weight").fill("180");
  await sheet.getByLabel("Age").fill("30");
  await p.waitForTimeout(900);
  const k1 = await sheet.getByTestId("kcal").innerText();
  await sheet.getByRole("radio", { name: "Woman" }).first().click();
  await p.waitForTimeout(900);
  const k2 = await sheet.getByTestId("kcal").innerText();
  await sheet.getByLabel("Age").fill("65");
  await p.waitForTimeout(900);
  const k3 = await sheet.getByTestId("kcal").innerText();
  // scroll the sheet to the map and the calorie card
  await sheet.getByLabel("Muscle map").scrollIntoViewIfNeeded();
  await p.screenshot({ path: `shots/mm${pass}-map-woman-${tag}.png` });
  await sheet.getByLabel("Calorie burn estimator").scrollIntoViewIfNeeded();
  await p.screenshot({ path: `shots/mm${pass}-kcal-${tag}.png` });
  await sheet.getByRole("button", { name: "Inner thighs" }).click();
  await sheet.getByLabel("Muscle map").scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
  await p.screenshot({ path: `shots/mm${pass}-focus-${tag}.png` });
  await p.keyboard.press("Escape"); await p.waitForTimeout(600);
  // saved: reload, another exercise keeps the numbers
  await p.reload(); await p.waitForTimeout(1500);
  await p.getByRole("button", { name: /^All \d+/ }).click();
  await p.getByPlaceholder(/Search/).fill("bench press");
  await p.getByRole("button", { name: /Dumbbell Bench Press/ }).first().click();
  const s2 = p.getByRole("dialog", { name: "Dumbbell Bench Press" });
  await s2.getByTestId("kcal").waitFor({ timeout: 8000 });
  await p.waitForTimeout(1200);
  const k4 = await s2.getByTestId("kcal").innerText();
  await s2.getByLabel("Muscle map").scrollIntoViewIfNeeded();
  await p.screenshot({ path: `shots/mm${pass}-bench-${tag}.png` });
  await s2.getByRole("radio", { name: "Man" }).first().click();
  await p.waitForTimeout(500);
  await p.screenshot({ path: `shots/mm${pass}-bench-man-${tag}.png` });
  console.log(tag, { kcalEmpty, man30: k1, woman30: k2, woman65: k3, benchSaved: k4 }, errs.length ? errs.slice(0, 6) : "no console errors");
  await ctx.close();
}
await b.close();
