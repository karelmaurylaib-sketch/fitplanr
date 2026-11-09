// Screenshots of /pricing (monthly, yearly, checkout sheet) and of the /plan paywall, phone + computer.
// Usage: node scripts/pricing-shots.mjs [--paid]  (--paid needs DEV_PAID_EMAIL_SUFFIX on the dev server)
import { chromium } from "playwright";
import fs from "node:fs";
const base = process.env.BASE_URL || "http://localhost:3000";
const paid = process.argv.includes("--paid");
const exe = fs.existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {};
fs.mkdirSync("shots", { recursive: true });
const b = await chromium.launch(exe);
for (const [tag, vp] of [["390", { width: 390, height: 844 }], ["1440", { width: 1440, height: 900 }]]) {
  const p = await b.newPage({ viewport: vp });
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await p.goto(base + "/signup");
  await p.getByLabel("Email").fill(`price${Date.now()}${paid ? ".paidpreview" : ""}@fitplanr-test.com`);
  await p.getByLabel("Password", { exact: true }).fill("Test-password-123");
  await p.getByRole("button", { name: "Build my plan" }).click();
  await p.waitForFunction(() => location.pathname.startsWith("/start"), null, { timeout: 60000 });
  const pre = paid ? "pp" : "p";
  await p.goto(base + "/pricing"); await p.waitForTimeout(2500);
  await p.screenshot({ path: `shots/${pre}-year-${tag}.png`, fullPage: true });
  await p.getByRole("radio", { name: "Monthly" }).click(); await p.waitForTimeout(900);
  await p.screenshot({ path: `shots/${pre}-month-${tag}.png`, fullPage: true });
  const btn = p.getByRole("button", { name: /Unlock my full plan|Choose Elite/ }).first();
  await btn.click(); await p.waitForTimeout(6000);
  await p.screenshot({ path: `shots/${pre}-checkout-${tag}.png` });
  console.log(tag, errs.length ? errs.slice(0, 6) : "no errors");
  await p.close();
}
await b.close();
