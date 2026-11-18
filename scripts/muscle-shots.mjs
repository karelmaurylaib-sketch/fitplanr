// Screenshots of the dashboard muscle map (local dev, DEV_PAID_EMAIL_SUFFIX on the dev server).
import { chromium } from "playwright";
import fs from "node:fs";
const base = process.env.BASE_URL || "http://localhost:3001";
const b = await chromium.launch(fs.existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {});
for (const tag of process.argv[2] ? [process.argv[2]] : ["390", "1440"]) {
  const p = await b.newPage({ viewport: tag === "390" ? { width: 390, height: 844 } : { width: 1440, height: 900 } });
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => m.type() === "error" && !m.text().includes("[kwop]") && errs.push(m.text().slice(0, 300)));
  await p.goto(base + "/signup");
  await p.getByLabel("Email").fill(`mus${Date.now()}.paidpreview@fitplanr-test.com`);
  await p.getByLabel("Password", { exact: true }).fill("Test-password-123");
  await p.getByRole("button", { name: "Build my plan" }).click();
  await p.waitForFunction(() => location.pathname.startsWith("/start"), null, { timeout: 60000 }); await p.waitForTimeout(1500);
  for (const a of ["Build muscle", "Never really", "3 days", "45 minutes"]) { await p.getByRole("button", { name: a }).click(); await p.waitForTimeout(1500); }
  await p.getByRole("button", { name: "Skip" }).click(); await p.waitForTimeout(1500);
  await p.getByRole("button", { name: "Build my plan" }).click();
  await p.waitForFunction(() => location.pathname === "/plan", null, { timeout: 60000 }); await p.waitForTimeout(1000);
  await p.goto(base + "/dashboard"); await p.waitForTimeout(2500);
  const map = p.getByRole("region", { name: "Muscle map" });
  await map.scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
  await map.screenshot({ path: `shots/m-week-${tag}.png` });
  await map.getByRole("tab", { name: /^Day 2/ }).click(); await p.waitForTimeout(700);
  await map.getByRole("listitem").filter({ hasText: "Hamstrings" }).getByRole("button").click(); await p.waitForTimeout(700);
  await map.screenshot({ path: `shots/m-day-${tag}.png` });
  console.log(tag, errs.length ? errs : "no errors");
  await p.close();
}
await b.close();
