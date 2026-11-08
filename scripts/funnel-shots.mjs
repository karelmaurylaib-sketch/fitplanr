// Screenshots of every funnel step for a brand-new visitor (never pays).
import { chromium } from "playwright";
import fs from "node:fs";
const base = process.env.BASE_URL || "http://localhost:3000";
const exe = fs.existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {};
fs.mkdirSync("shots", { recursive: true });
const b = await chromium.launch(exe);
for (const [tag, vp] of [["390", { width: 390, height: 844 }], ["1440", { width: 1440, height: 900 }]]) {
  const p = await b.newPage({ viewport: vp });
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  const shot = (n) => p.screenshot({ path: `shots/f-${n}-${tag}.png` });
  await p.goto(base + "/signup"); await p.waitForTimeout(600); await shot("1signup");
  await p.getByLabel("Email").fill(`shot${Date.now()}@fitplanr-test.com`);
  await p.getByLabel("Password", { exact: true }).fill("Test-password-123");
  await p.getByRole("button", { name: "Build my plan" }).click();
  await p.waitForURL(/start/);
  await p.waitForTimeout(1500); await shot("2q1");
  await p.getByRole("button", { name: "Build muscle" }).click(); await p.waitForTimeout(500); await shot("3q1picked");
  await p.waitForTimeout(1200);
  for (const a of ["Never really", "3 days", "45 minutes"]) { await p.getByRole("button", { name: a }).click(); await p.waitForTimeout(1500); }
  await shot("4protect");
  await p.getByRole("button", { name: "Skip" }).click(); await p.waitForTimeout(1800); await shot("5gear");
  await p.getByRole("button", { name: "Build my plan" }).click();
  await p.waitForTimeout(3500); await shot("6building");
  await p.waitForURL(/plan/, { timeout: 30000 }); await p.waitForTimeout(1200); await shot("7plan");
  await p.screenshot({ path: `shots/f-7planfull-${tag}.png`, fullPage: true });
  await p.waitForTimeout(2500); await shot("8paywall");
  const d = p.getByRole("dialog", { name: "Choose your plan" });
  await d.getByRole("button", { name: /^Continue with/ }).first().click();
  await p.waitForTimeout(9000); await shot("9checkout");
  console.log(tag, errs.length ? errs.slice(0, 5) : "no errors");
  await p.close();
}
await b.close();
