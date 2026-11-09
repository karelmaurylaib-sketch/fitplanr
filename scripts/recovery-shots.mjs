// Screenshots of the landing (overview → plans) and the paid workout: smart rest timer + muscle recovery.
// Local dev only (paid part needs DEV_PAID_EMAIL_SUFFIX on the dev server). Usage: BASE_URL=http://localhost:3001 node scripts/recovery-shots.mjs
import { chromium } from "playwright";
import fs from "node:fs";
const base = process.env.BASE_URL || "http://localhost:3001";
const pass = process.env.PASS || "1";
const exe = fs.existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {};
fs.mkdirSync("shots", { recursive: true });
const b = await chromium.launch(exe);
async function onboard(p, email) {
  await p.goto(base + "/signup");
  await p.getByLabel("Email").fill(email);
  await p.getByLabel("Password", { exact: true }).fill("Test-password-123");
  await p.getByRole("button", { name: "Build my plan" }).click();
  await p.waitForFunction(() => location.pathname.startsWith("/start"), null, { timeout: 60000 });
  for (const a of ["Build muscle", "Never really", "3 days", "45 minutes"]) {
    await p.waitForFunction(() => Number(getComputedStyle(document.querySelector("main ul")).opacity) > 0.9);
    await p.getByRole("button", { name: a }).click();
    await p.waitForTimeout(1500);
  }
  await p.getByRole("button", { name: "Skip" }).click();
  await p.waitForTimeout(1200);
  await p.getByRole("button", { name: "Build my plan" }).click();
  await p.waitForFunction(() => location.pathname === "/plan", null, { timeout: 60000 });
  await p.waitForTimeout(1500);
}
for (const [tag, vp] of [["390", { width: 390, height: 844 }], ["1440", { width: 1440, height: 900 }]]) {
  const errs = [];
  const watch = (p) => {
    p.on("pageerror", (e) => errs.push(String(e)));
    p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  };
  // 1. landing as a stranger
  let p = await b.newPage({ viewport: vp });
  watch(p);
  await p.goto(base + "/", { waitUntil: "networkidle" });
  await p.screenshot({ path: `shots/r${pass}-landing-top-${tag}.png` });
  for (const id of ["features", "plans"]) {
    await p.evaluate((id) => document.getElementById(id).scrollIntoView(), id);
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `shots/r${pass}-landing-${id}-${tag}.png` });
  }
  if (await p.getByText(/pricing|\$\d/i).count()) errs.push("PRICE ON LANDING");
  await p.close();

  // 2. unpaid: locked plan with plan cards under it, and the landing as a signed-in visitor
  const ctx = await b.newContext({ viewport: vp });
  p = await ctx.newPage();
  watch(p);
  await onboard(p, `rshot${Date.now()}@fitplanr-test.com`);
  await p.getByRole("dialog", { name: "Choose your plan" }).waitFor({ timeout: 10000 }).catch(() => {});
  await p.screenshot({ path: `shots/r${pass}-plan-paywall-${tag}.png` });
  await p.getByRole("dialog", { name: "Choose your plan" }).getByRole("button", { name: "Close" }).click().catch(() => {});
  await p.getByRole("region", { name: "Plans" }).scrollIntoViewIfNeeded();
  await p.waitForTimeout(800);
  await p.screenshot({ path: `shots/r${pass}-plan-cards-${tag}.png` });
  await p.getByRole("button", { name: /Elite/ }).first().click();
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `shots/r${pass}-plan-elite-picked-${tag}.png` });
  await p.goto(base + "/", { waitUntil: "networkidle" });
  await p.screenshot({ path: `shots/r${pass}-landing-signedin-${tag}.png` });
  await ctx.close();

  // 3. paid: workout with rest timer, finish, then recovery
  p = await b.newPage({ viewport: vp });
  watch(p);
  await onboard(p, `rshot${Date.now()}.paidpreview@fitplanr-test.com`);
  await p.goto(base + "/workout");
  await p.waitForTimeout(2000);
  await p.screenshot({ path: `shots/r${pass}-workout-fresh-${tag}.png`, fullPage: true });
  const boxes = p.getByRole("button", { name: /^Log set/ });
  await boxes.nth(0).click();
  await p.waitForTimeout(1800);
  await p.screenshot({ path: `shots/r${pass}-rest-running-${tag}.png` });
  for (let k = 0; k < 8; k++) await p.getByRole("button", { name: "15 seconds less" }).filter({ visible: true }).first().click({ timeout: 2000 }).catch(() => {});
  await p.getByText("Rest done. Go!").waitFor({ timeout: 5000 }).catch(() => errs.push("rest did not finish"));
  await p.screenshot({ path: `shots/r${pass}-rest-done-${tag}.png` });
  await p.waitForTimeout(3000);
  // log everything else quickly
  const n = await boxes.count();
  for (let k = 0; k < n; k++) {
    await boxes.first().click();
    await p.getByRole("button", { name: "Skip rest" }).click({ timeout: 1500 }).catch(() => {});
  }
  await p.getByRole("button", { name: "Close" }).click({ timeout: 1000 }).catch(() => {});
  await p.getByRole("button", { name: "Finish workout" }).click();
  await p.getByText("Workout done").waitFor({ timeout: 15000 }).catch(() => errs.push("workout not saved"));
  await p.screenshot({ path: `shots/r${pass}-done-${tag}.png` });
  await p.goto(base + "/workout?week=1&day=1");
  await p.waitForTimeout(2000);
  await p.screenshot({ path: `shots/r${pass}-workout-recovering-${tag}.png` });
  await p.goto(base + "/dashboard");
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `shots/r${pass}-dashboard-${tag}.png`, fullPage: true });
  await p.close();
  console.log(tag, errs.length ? errs.slice(0, 8) : "no console errors");
}
await b.close();
