// Screenshots of the free-trial paywall + checkout for a brand-new visitor (never pays).
// Needs a server where the trial is on (FITPLANR_TRIAL=1 locally, or Kwop reporting trial days).
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
  // third-party payment scripts inside the Whop iframe are blocked by the sandbox network: not ours
  p.on("console", (m) => m.type() === "error" && !/ERR_TUNNEL|ERR_PROXY|whop|stripe|paypal|apple|braintree/i.test(m.text() + (m.location()?.url ?? "")) && errs.push(m.text() + " " + (m.location()?.url ?? "")));
  const shot = (n) => p.screenshot({ path: `shots/t-${n}-${tag}.png` });
  const email = `trial${Date.now()}@fitplanr-test.com`;
  await p.goto(base + "/signup");
  await p.getByLabel("Email").fill(email);
  await p.getByLabel("Password", { exact: true }).fill("Test-password-123");
  await p.getByRole("button", { name: "Build my plan" }).click();
  await p.waitForURL(/start/);
  await p.waitForTimeout(1500);
  for (const a of ["Build muscle", "Never really", "3 days", "45 minutes"]) {
    await p.getByRole("button", { name: a }).click();
    await p.waitForTimeout(1600);
  }
  await p.getByRole("button", { name: "Skip" }).click();
  await p.waitForTimeout(1800);
  await p.getByRole("button", { name: "Build my plan" }).click();
  await p.waitForURL(/plan/, { timeout: 30000 });
  const d = p.getByRole("dialog", { name: "Choose your plan" });
  await d.waitFor({ timeout: 15000 });
  await p.waitForTimeout(900);
  await shot("1paywall");
  await d.getByTestId("trial-callout").first().scrollIntoViewIfNeeded();
  await p.waitForTimeout(900);
  await shot("2callout-pro");
  await d.getByRole("radio", { name: /Elite/ }).first().click();
  await p.waitForTimeout(900);
  await shot("3elite");
  console.log(tag, "elite callout count:", await d.getByTestId("trial-callout").count());
  await d.getByRole("radio", { name: /Starter/ }).first().click();
  await d.getByRole("button", { name: /Yearly/ }).click();
  await p.waitForTimeout(900);
  await shot("4starter-year");
  await d.getByRole("button", { name: "Monthly" }).click();
  await d.getByRole("radio", { name: /Pro/ }).first().click();
  await p.waitForTimeout(400);
  await d.getByRole("button", { name: /^Start my 7 free days/ }).first().click();
  const ck = p.getByRole("dialog", { name: "Secure checkout" });
  await ck.waitFor();
  await p.waitForTimeout(9000);
  await shot("5checkout");
  console.log(tag, email, errs.length ? errs.slice(0, 5) : "no errors");
  await p.close();
}
await b.close();
