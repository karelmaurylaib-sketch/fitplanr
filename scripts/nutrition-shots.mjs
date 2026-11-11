// Screenshots of the Nutrition plan (local dev only, DEV_PAID_EMAIL_SUFFIX set on the dev server).
import { chromium } from "playwright";
import fs from "node:fs";
const base = process.env.BASE_URL || "http://localhost:3001";
const exe = fs.existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {};
const b = await chromium.launch(exe);
fs.mkdirSync("shots", { recursive: true });
const sizes = process.argv[2] ? [process.argv[2]] : ["390", "1440"];
for (const tag of sizes) {
  const vp = tag === "390" ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const ctx = await b.newContext({ viewport: vp });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  // "[kwop]" lines are server logs replayed by next dev: KWOP_API is not set on this box (production has it)
  p.on("console", (m) => m.type() === "error" && !m.text().includes("[kwop]") && errs.push(m.text().slice(0, 300)));
  await p.goto(base + "/signup");
  await p.getByLabel("Email").fill(`nut${Date.now()}.paidpreview@fitplanr-test.com`);
  await p.getByLabel("Password", { exact: true }).fill("Test-password-123");
  await p.getByRole("button", { name: "Build my plan" }).click();
  await p.waitForFunction(() => location.pathname.startsWith("/start"), null, { timeout: 60000 }); await p.waitForTimeout(1500);
  for (const a of ["Build muscle", "Never really", "3 days", "45 minutes"]) { await p.getByRole("button", { name: a }).click(); await p.waitForTimeout(1500); }
  await p.getByRole("button", { name: "Skip" }).click(); await p.waitForTimeout(1500);
  await p.getByRole("button", { name: "Build my plan" }).click();
  await p.waitForFunction(() => location.pathname === "/plan", null, { timeout: 60000 }); await p.waitForTimeout(1500);

  await p.goto(base + "/nutrition"); await p.waitForTimeout(2500);
  await p.screenshot({ path: `shots/n-empty-${tag}.png` });
  if (process.env.SHOW_ISSUE && (await p.getByText(/\d Issue/).first().isVisible().catch(() => false))) {
    await p.getByText(/\d Issue/).first().click(); await p.waitForTimeout(1200);
    await p.screenshot({ path: `shots/n-issue-${tag}.png` }); await p.keyboard.press("Escape");
  }
  await p.getByRole("button", { name: "More weight" }).click();
  await p.getByRole("button", { name: "Set my targets" }).click();
  await p.getByText("Three plates a day").waitFor(); await p.waitForTimeout(1500);
  await p.screenshot({ path: `shots/n-plan-${tag}.png`, fullPage: true });

  await p.getByRole("button", { name: /^Swap Blueberries/ }).click(); await p.waitForTimeout(900);
  await p.screenshot({ path: `shots/n-swap-${tag}.png` });
  await p.getByRole("button", { name: /^Pear/ }).click(); await p.waitForTimeout(900);
  await p.getByRole("button", { name: /^Swap Pear/ }).waitFor();

  await p.getByRole("article", { name: "Breakfast" }).getByRole("button", { name: "Ate it" }).click();
  await p.getByRole("article", { name: "Breakfast" }).getByText("Logged today").waitFor();
  await p.waitForTimeout(1300);
  const k1 = await p.getByTestId("kcal-eaten").innerText();

  await p.getByRole("article", { name: "Lunch" }).getByRole("button", { name: "Ate it" }).click();
  await p.getByRole("article", { name: "Lunch" }).getByText("Logged today").waitFor();
  await p.waitForTimeout(1400);
  const k2 = await p.getByTestId("kcal-eaten").innerText();
  const scanButtons = await p.getByRole("button", { name: /Scan|Upload a photo/ }).count();
  if (scanButtons) errs.push(`meal scan controls still on the page: ${scanButtons}`);
  await p.screenshot({ path: `shots/n-after-${tag}.png`, fullPage: true });

  await p.goto(base + "/");
  console.log(tag, "kcal", k1, "→", k2, errs.length ? errs.slice(0, 6) : "no errors");
  await ctx.close();
}
await b.close();
