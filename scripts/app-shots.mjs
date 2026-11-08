// Screenshots of the paid app (local dev only, with DEV_PAID_EMAIL_SUFFIX set on the dev server).
import { chromium } from "playwright";
import fs from "node:fs";
const base = process.env.BASE_URL || "http://localhost:3001";
const exe = fs.existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {};
const b = await chromium.launch(exe);
for (const [tag, vp] of [["390", { width: 390, height: 844 }], ["1440", { width: 1440, height: 900 }]]) {
  const p = await b.newPage({ viewport: vp });
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => m.type() === "error" && !m.text().includes("TUNNEL") && errs.push(m.text()));
  await p.goto(base + "/signup");
  await p.getByLabel("Email").fill(`app${Date.now()}.paidpreview@fitplanr-test.com`);
  await p.getByLabel("Password", { exact: true }).fill("Test-password-123");
  await p.getByRole("button", { name: "Build my plan" }).click();
  await p.waitForFunction(() => location.pathname.startsWith("/start"), null, { timeout: 60000 }); await p.waitForTimeout(1500);
  for (const a of ["Build muscle", "Never really", "3 days", "45 minutes"]) { await p.getByRole("button", { name: a }).click(); await p.waitForTimeout(1500); }
  await p.getByRole("button", { name: "Skip" }).click(); await p.waitForTimeout(1500);
  await p.getByRole("button", { name: "Build my plan" }).click();
  await p.waitForFunction(() => location.pathname === "/plan", null, { timeout: 60000 }); await p.waitForTimeout(1500);
  await p.screenshot({ path: `shots/a-plan-${tag}.png` });
  await p.goto(base + "/workout"); await p.waitForTimeout(2000);
  const boxes = p.getByRole("button", { name: /^Log set/ });
  await boxes.nth(0).click(); await p.waitForTimeout(800);
  await p.screenshot({ path: `shots/a-workout-${tag}.png` });
  await p.getByRole("button", { name: "Skip rest" }).last().click();
  await boxes.nth(0).click(); await p.getByRole("button", { name: "Skip rest" }).last().click();
  await p.getByRole("button", { name: "Finish workout" }).click(); await p.waitForTimeout(2500);
  await p.screenshot({ path: `shots/a-done-${tag}.png` });
  for (const path of ["dashboard", "history", "settings", "account", "library"]) {
    await p.goto(base + "/" + path); await p.waitForTimeout(2500);
    await p.screenshot({ path: `shots/a-${path}-${tag}.png`, fullPage: true });
  }
  console.log(tag, errs.length ? errs.slice(0, 6) : "no errors");
  await p.close();
}
await b.close();
