// "How Nutrition works" explainer (no voiceover): records the real app step by step (dev :3001, paid preview).
// Output: video/build/explain/{intro,open,flow,outro} frames + marks.
import { chromium } from "playwright";
import { recorder } from "./recorder.mjs";

const BASE = process.env.BASE_URL || "http://localhost:3001";
const OUT = "video/build/explain";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const smooth = (p, y) => p.evaluate((y) => window.scrollTo({ top: y, behavior: "smooth" }), y);
const topOf = (loc, offset = 10) => loc.evaluate((el, o) => el.getBoundingClientRect().top + window.scrollY - o, offset);

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));

// a title card in the app's own fonts and colors
async function card(name, html, ms) {
  await p.goto(BASE + "/login");
  await p.waitForTimeout(700);
  await p.evaluate((html) => {
    document.body.innerHTML = `<style>
  body{margin:0;background:#060606;overflow:hidden}
  .s{position:fixed;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 30px;color:#F4F5F0;font-family:var(--font-inter),sans-serif;background:radial-gradient(ellipse 70% 40% at 50% 30%,rgba(200,255,61,.18),transparent 70%),#060606}
  .grid{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.16) 1px,transparent 1.5px);background-size:22px 22px;mask-image:radial-gradient(ellipse 70% 50% at 50% 35%,#000 30%,transparent 75%);-webkit-mask-image:radial-gradient(ellipse 70% 50% at 50% 35%,#000 30%,transparent 75%)}
  .in{position:relative;opacity:0;transform:translateY(14px);animation:in .5s cubic-bezier(.22,.8,.24,1) both}
  @keyframes in{to{opacity:1;transform:none}}
  .mono{font-family:var(--font-jetbrains),monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#C8FF3D}
  .big{font-family:var(--font-barlow),sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:-.02em;line-height:.92;font-size:58px}
  .grey{background:linear-gradient(180deg,#f4f5f0,#7d8275);-webkit-background-clip:text;background-clip:text;color:transparent}
  .row{display:flex;gap:12px;align-items:flex-start;margin-top:14px;font-size:16px;line-height:1.35;color:#d9dcd2}
  .n{flex:none;width:26px;height:26px;border-radius:8px;background:#C8FF3D;color:#0A0D02;font-family:var(--font-barlow),sans-serif;font-weight:700;font-size:17px;display:flex;align-items:center;justify-content:center}
</style><div class="s"><div class="grid"></div>${html}</div>`;
  }, html);
  const r = await recorder(p, `${OUT}/${name}`);
  r.mark("start");
  await wait(ms);
  r.mark("end");
  await r.stop();
}

const logo = `<div class="in" style="display:flex;align-items:center;gap:10px"><svg width="30" height="30" viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="#C8FF3D"/><path d="M8 22.5 L14 16.5 L18 19.5 L24.5 11" stroke="#0A0D02" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><rect x="5.5" y="20" width="4" height="6" rx="1.2" transform="rotate(-45 7.5 23)" fill="#0A0D02"/><rect x="22.5" y="7.5" width="4" height="6" rx="1.2" transform="rotate(-45 24.5 10.5)" fill="#0A0D02"/></svg><span style="font-family:var(--font-barlow),sans-serif;font-weight:700;font-size:24px;text-transform:uppercase">FitPlanr</span></div>`;
await card(
  "intro",
  `${logo}
   <div class="mono in" style="margin-top:46px;animation-delay:.1s">[ Nutrition · explained ]</div>
   <div class="big in" style="margin-top:12px;animation-delay:.18s">How the<span class="grey" style="display:block">nutrition plan works</span></div>
   <div class="in" style="margin-top:18px;font-size:17px;line-height:1.4;color:#d9dcd2;animation-delay:.3s">One member's day, step by step. Real app, real numbers: a man, 28, 5′10″, 170 lb, building muscle on 3 workouts a week.</div>`,
  3800,
);

// setup off camera: paid account + plan (3 days, build muscle), then the dashboard
await p.goto(BASE + "/signup");
await p.getByLabel("Email").fill(`explain${Date.now()}.paidpreview@fitplanr-test.com`);
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
await p.goto(BASE + "/dashboard");
await p.getByText("Muscle map").first().waitFor();
await p.waitForTimeout(2000);

// ---------- 1: open the tab (the recorder follows the page across the navigation) ----------
{
  const r = await recorder(p, `${OUT}/open`);
  r.mark("start");
  await wait(1500);
  r.mark("tap");
  await p.getByRole("navigation", { name: "App" }).last().getByRole("link", { name: "Nutrition" }).tap();
  await p.getByRole("button", { name: "Set my targets" }).waitFor();
  r.mark("loaded");
  await wait(1200);
  r.mark("end");
  await r.stop();
}

// ---------- 2–9: one continuous take on /nutrition ----------
const r = await recorder(p, `${OUT}/flow`);
r.mark("setup"); // the 4 numbers, pre-filled
await wait(1800);
await p.getByRole("radio", { name: "Man", exact: true }).dispatchEvent("click");
await wait(500);
r.mark("save");
await p.getByRole("button", { name: "Set my targets" }).dispatchEvent("click");
await p.getByText("Three plates a day").waitFor();
r.mark("targets"); // rings at 0 of the daily target
await wait(3000);

const how = p.getByText("How your targets are set");
r.mark("explain");
await smooth(p, await topOf(how, 220));
await wait(3400);

const breakfast = p.getByRole("article", { name: "Breakfast" });
const lunch = p.getByRole("article", { name: "Lunch" });
const dinner = p.getByRole("article", { name: "Dinner" });
r.mark("meals");
await smooth(p, await topOf(p.getByText("Three plates a day"), 70));
await wait(1600);
await smooth(p, await topOf(lunch));
await wait(1600);
await smooth(p, await topOf(dinner));
await wait(1600);
await smooth(p, await topOf(lunch));
await wait(1200);

r.mark("swap");
await lunch.getByRole("button", { name: /^Swap Chicken breast/ }).dispatchEvent("click");
await wait(2600);
r.mark("pick");
await p.getByRole("button", { name: /^Firm tofu/ }).dispatchEvent("click");
await wait(400);
r.mark("adjusted"); // lunch card re-solved
await wait(3000);

r.mark("ate");
await lunch.getByRole("button", { name: "Ate it" }).dispatchEvent("click");
await lunch.getByText("Logged today").waitFor();
await wait(1600);

r.mark("rings");
await smooth(p, 0);
await wait(2600);
const todays = p.getByRole("region", { name: "Today's food" });
await smooth(p, await topOf(todays, 160));
await wait(2000);

r.mark("undo");
await todays.getByRole("button", { name: /^Remove/ }).first().dispatchEvent("click");
await wait(1200);
await smooth(p, 0);
await wait(2000);

r.mark("edit");
await smooth(p, await topOf(how, 220));
await wait(900);
await p.getByRole("button", { name: "Edit" }).dispatchEvent("click");
await wait(1300);
const sheet = p.getByRole("dialog", { name: "Edit your body numbers" });
for (let i = 0; i < 3; i++) {
  await sheet.getByRole("button", { name: "More weight" }).dispatchEvent("click");
  await wait(450);
}
await wait(500);
await sheet.getByRole("button", { name: "Save my targets" }).dispatchEvent("click");
await p.getByRole("status").waitFor();
await wait(600);
r.mark("newTargets");
await smooth(p, 0);
await wait(1400);
await smooth(p, await topOf(lunch));
await wait(2200);
r.mark("end");
await r.stop();

await card(
  "outro",
  `${logo}
   <div class="mono in" style="margin-top:34px;animation-delay:.08s">[ Recap ]</div>
   <div class="big in" style="margin-top:10px;font-size:46px;animation-delay:.14s">Nutrition<span class="grey" style="display:block">in 4 lines</span></div>
   <div class="row in" style="animation-delay:.25s"><span class="n">1</span><span>4 body numbers + the training plan → <b style="color:#F4F5F0">daily calories and macros</b>.</span></div>
   <div class="row in" style="animation-delay:.35s"><span class="n">2</span><span>3 meals, each food <b style="color:#F4F5F0">swappable</b>; portions re-adjust to stay on target.</span></div>
   <div class="row in" style="animation-delay:.45s"><span class="n">3</span><span><b style="color:#F4F5F0">“Ate it”</b> fills the day's rings; the bin undoes it.</span></div>
   <div class="row in" style="animation-delay:.55s"><span class="n">4</span><span>On <b style="color:#F4F5F0">every paid plan</b>, no monthly limit. No AI, no camera: the same rules for everyone.</span></div>`,
  6500,
);

console.log("page errors:", errs.length ? errs : "none");
await ctx.close();
await b.close();
