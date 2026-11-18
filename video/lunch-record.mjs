// "How I plan my lunch" video: records one continuous take of the real Nutrition screen (dev :3001, paid preview).
// A customer has had breakfast, opens Nutrition, looks at lunch, swaps chicken for tofu, taps "Ate it", rings fill.
// Output: video/build/lunch/take (frames + marks). The end card is reused from the 4-step video (video/build/s5).
import { chromium } from "playwright";
import { recorder } from "./recorder.mjs";

const BASE = process.env.BASE_URL || "http://localhost:3001";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const scrollTo = (p, y) => p.evaluate((y) => window.scrollTo({ top: y, behavior: "smooth" }), y);

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));

// setup, off camera: a paid account with a plan, targets set, breakfast already eaten
await p.goto(BASE + "/signup");
await p.getByLabel("Email").fill(`lunch${Date.now()}.paidpreview@fitplanr-test.com`);
await p.getByLabel("Password", { exact: true }).fill("Test-password-123");
await p.getByRole("button", { name: "Build my plan" }).click();
await p.waitForFunction(() => location.pathname.startsWith("/start"), null, { timeout: 60000 });
await p.waitForTimeout(1500);
for (const a of ["Build muscle", "Never really", "3 days", "45 minutes"]) {
  await p.waitForFunction(() => Number(getComputedStyle(document.querySelector("main ul")).opacity) > 0.9);
  await p.getByRole("button", { name: a }).click();
  await p.waitForTimeout(1500);
}
await p.getByRole("button", { name: "Skip" }).click();
await p.getByText("Pick a starting point").waitFor();
await p.getByRole("button", { name: "Build my plan" }).click();
await p.waitForFunction(() => location.pathname === "/plan", null, { timeout: 60000 });
await p.goto(BASE + "/nutrition");
await p.getByRole("button", { name: "Set my targets" }).click();
await p.getByText("Three plates a day").waitFor();
await p.getByRole("article", { name: "Breakfast" }).getByRole("button", { name: "Ate it" }).dispatchEvent("click");
await p.getByRole("article", { name: "Breakfast" }).getByText("Logged today").waitFor();
// reload so the take starts on a calm page (no toast), as the customer opens the tab at noon
await p.goto(BASE + "/nutrition");
await p.getByText("Three plates a day").waitFor();
await p.waitForTimeout(2500);

const lunch = p.getByRole("article", { name: "Lunch" });
const lunchTop = await lunch.evaluate((el) => el.getBoundingClientRect().top + window.scrollY - 10);

const r = await recorder(p, "video/build/lunch/take");
r.mark("start"); // hook: today's rings, breakfast already in
await wait(2200);
r.mark("toLunch");
await scrollTo(p, lunchTop);
await wait(1100);
r.mark("lunch"); // lunch sized to the goal
await wait(1800);
r.mark("swap");
await lunch.getByRole("button", { name: /^Swap Chicken breast/ }).dispatchEvent("click");
await wait(1300);
// tofu makes the re-solve visible: 4 oz chicken → 7 oz tofu, avocado 1 → ⅓
await p.getByRole("dialog", { name: "Swap a food" }).evaluate((d) => d.querySelector(".overflow-y-auto")?.scrollTo({ top: 150, behavior: "smooth" }));
await wait(700);
await p.getByRole("button", { name: /^Firm tofu/ }).dispatchEvent("click");
r.mark("adjust"); // card re-solves the portions
await wait(1900);
r.mark("ate");
await lunch.getByRole("button", { name: "Ate it" }).dispatchEvent("click");
await lunch.getByText("Logged today").waitFor();
await wait(700);
await scrollTo(p, 0);
await wait(2300);
r.mark("end");
await r.stop();
console.log("page errors:", errs.length ? errs : "none");
await ctx.close();
await b.close();
