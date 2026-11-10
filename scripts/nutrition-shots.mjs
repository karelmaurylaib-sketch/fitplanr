// Screenshots of Nutrition & Meal Scan (local dev only, DEV_PAID_EMAIL_SUFFIX set on the dev server).
// The browser gets a fake camera, so the viewfinder and shutter work headless.
import { chromium } from "playwright";
import fs from "node:fs";
const base = process.env.BASE_URL || "http://localhost:3001";
const exe = fs.existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {};
const b = await chromium.launch({ ...exe, args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] });
fs.mkdirSync("shots", { recursive: true });
const sizes = process.argv[2] ? [process.argv[2]] : ["390", "1440"];
for (const tag of sizes) {
  const vp = tag === "390" ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const ctx = await b.newContext({ viewport: vp, permissions: ["camera"] });
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

  await p.getByRole("button", { name: "Scan a meal" }).first().click(); await p.waitForTimeout(1800);
  await p.screenshot({ path: `shots/n-camera-${tag}.png` });
  await p.getByRole("button", { name: "Take photo" }).click(); await p.waitForTimeout(900);
  await p.screenshot({ path: `shots/n-reading-${tag}.png` });
  await p.getByRole("region", { name: "Meal breakdown" }).waitFor({ timeout: 20000 }); await p.waitForTimeout(600);
  const chips = p.getByRole("region", { name: "Meal breakdown" });
  await chips.getByRole("button", { name: "Chicken breast" }).click();
  await chips.getByRole("button", { name: "Brown rice" }).click();
  await chips.getByRole("button", { name: "Broccoli" }).click();
  await chips.getByRole("button", { name: "Done" }).click();
  await chips.getByRole("button", { name: "More Chicken breast" }).click();
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `shots/n-result-${tag}.png` });
  await chips.getByRole("button", { name: "Add to today" }).click();
  await p.getByRole("status").waitFor(); await p.waitForTimeout(1400);
  const k2 = await p.getByTestId("kcal-eaten").innerText();
  await p.screenshot({ path: `shots/n-after-${tag}.png`, fullPage: true });

  // upload path
  const img = await p.screenshot({ type: "jpeg", clip: { x: 0, y: 0, width: 300, height: 300 } });
  await p.getByRole("button", { name: "Upload a photo" }).first().click(); await p.waitForTimeout(600);
  await p.getByTestId("meal-file").setInputFiles({ name: "plate.jpg", mimeType: "image/jpeg", buffer: img });
  await p.getByRole("region", { name: "Meal breakdown" }).waitFor({ timeout: 20000 }); await p.waitForTimeout(800);
  await p.screenshot({ path: `shots/n-upload-${tag}.png` });
  await p.keyboard.press("Escape"); await p.waitForTimeout(500);

  await p.goto(base + "/");
  console.log(tag, "kcal", k1, "→", k2, errs.length ? errs.slice(0, 6) : "no errors");
  await ctx.close();
}
await b.close();
