// Account → Billing during a free trial. Local dev only: needs DEV_PAID_EMAIL_SUFFIX=.paidpreview@fitplanr-test.com
// and the Supabase Management API reachable (the proxy injects the token). Inserts the trial row through scripts/trial-sql.mjs.
import { chromium } from "playwright";
import fs from "node:fs";
import { execSync } from "node:child_process";
const base = process.env.BASE_URL || "http://localhost:3000";
const exe = fs.existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {};
fs.mkdirSync("shots", { recursive: true });
const b = await chromium.launch(exe);
const email = `t${Date.now()}.paidpreview@fitplanr-test.com`;
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto(base + "/signup");
await p.getByLabel("Email").fill(email);
await p.getByLabel("Password", { exact: true }).fill("Test-password-123");
await p.getByRole("button", { name: "Build my plan" }).click();
await p.waitForURL(/start/);
// the trial row, as the confirm route would write it (2 days in)
execSync(`node scripts/trial-sql.mjs "${email}"`, { stdio: "inherit" });
for (const [tag, vp] of [["390", { width: 390, height: 844 }], ["1440", { width: 1440, height: 900 }]]) {
  await p.setViewportSize(vp);
  await p.goto(base + "/account");
  await p.waitForTimeout(1500);
  await p.getByTestId("trial-status").scrollIntoViewIfNeeded();
  await p.screenshot({ path: `shots/t-6account-${tag}.png` });
  await p.getByRole("button", { name: "Cancel my free trial" }).click();
  await p.waitForTimeout(800);
  await p.screenshot({ path: `shots/t-7cancel-${tag}.png` });
  await p.keyboard.press("Escape");
}
console.log(email, errs.length ? errs.slice(0, 5) : "no errors");
await b.close();
