// Records the FitPlanr scenes for the 4-step video from the real app (local dev server on :3001 with
// DEV_PAID_EMAIL_SUFFIX). Frames come from Chrome's screencast at 1080×1920 (360×640 × DPR 3).
// Output: video/build/<scene>/NNNNN.jpg + frames.json (timestamps) + marks.json.
import { chromium } from "playwright";
import path from "node:path";
import { recorder as rec } from "./recorder.mjs";

const BASE = process.env.BASE_URL || "http://localhost:3001";
const OUT = "video/build";
const VIEW = { width: 360, height: 640 };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const recorder = (page, name) => rec(page, path.join(OUT, name));

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const only = process.argv[2];

// ---------- scene 0: intro (animated dumbbell, drawn in code) + landing hero, logged out ----------
if (only !== "rest") {
  const ctx = await b.newContext({ viewport: VIEW, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto(BASE + "/login");
  await p.waitForTimeout(1500);
  // reuse the app's fonts and colors: replace the page with the intro clip
  await p.evaluate(() => {
    document.body.innerHTML = `
<style>
  body{margin:0;background:#050505;overflow:hidden}
  .stage{position:fixed;inset:0;overflow:hidden;background:radial-gradient(ellipse 70% 50% at 50% 45%,#1d2410 0%,#070806 60%,#030303 100%)}
  .floor{position:absolute;left:-20%;right:-20%;bottom:-8%;height:38%;background:repeating-linear-gradient(90deg,#0d0f0a 0 22px,#11140c 22px 44px);transform:perspective(400px) rotateX(58deg);opacity:.9}
  .db{position:absolute;left:50%;top:50%;width:330px;height:150px;margin:-75px 0 0 -165px;animation:curl 1.2s cubic-bezier(.45,0,.2,1) both;filter:drop-shadow(0 30px 30px rgba(0,0,0,.7))}
  @keyframes curl{0%{transform:translateY(140px) rotate(-14deg) scale(1.55);filter:blur(3px) drop-shadow(0 30px 30px rgba(0,0,0,.7))}35%{filter:blur(0) drop-shadow(0 30px 30px rgba(0,0,0,.7))}100%{transform:translateY(-30px) rotate(6deg) scale(1.15)}}
  .glow{position:absolute;inset:0;background:radial-gradient(circle at 50% 46%,rgba(200,255,61,.22),transparent 45%);animation:pulse 1.2s ease-out both}
  @keyframes pulse{from{opacity:0}to{opacity:1}}
  .flash{position:absolute;inset:0;background:#C8FF3D;opacity:0;animation:flash .35s ease-in 1.05s both}
  @keyframes flash{0%{opacity:0;transform:scaleY(.0)}60%{opacity:1;transform:scaleY(1)}100%{opacity:1}}
  .lines{position:absolute;inset:0;background:repeating-linear-gradient(100deg,transparent 0 40px,rgba(255,255,255,.035) 40px 42px);animation:slide 1.2s linear both}
  @keyframes slide{from{transform:translateX(0)}to{transform:translateX(-120px)}}
</style>
<div class="stage"><div class="lines"></div><div class="floor"></div><div class="glow"></div>
<svg class="db" viewBox="0 0 330 150">
 <defs>
  <linearGradient id="h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f2ea"/><stop offset=".45" stop-color="#8d9087"/><stop offset="1" stop-color="#2a2c27"/></linearGradient>
  <linearGradient id="pl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3d35"/><stop offset=".5" stop-color="#16170f"/><stop offset="1" stop-color="#050505"/></linearGradient>
 </defs>
 <rect x="85" y="64" width="160" height="22" rx="8" fill="url(#h)"/>
 ${[95,115,135,155,175,195,215].map((x) => `<rect x="${x}" y="64" width="3" height="22" fill="#00000040"/>`).join("")}
 <rect x="20" y="10" width="62" height="130" rx="18" fill="url(#pl)"/><rect x="248" y="10" width="62" height="130" rx="18" fill="url(#pl)"/>
 <rect x="20" y="10" width="62" height="130" rx="18" fill="none" stroke="#C8FF3D" stroke-width="4"/><rect x="248" y="10" width="62" height="130" rx="18" fill="none" stroke="#C8FF3D" stroke-width="4"/>
 <text x="51" y="84" fill="#C8FF3D" font-family="var(--font-barlow),sans-serif" font-weight="700" font-size="26" text-anchor="middle">25</text>
 <text x="279" y="84" fill="#C8FF3D" font-family="var(--font-barlow),sans-serif" font-weight="700" font-size="26" text-anchor="middle">25</text>
 <rect x="70" y="40" width="16" height="70" rx="6" fill="#26281f"/><rect x="244" y="40" width="16" height="70" rx="6" fill="#26281f"/>
</svg><div class="flash"></div></div>`;
  });
  const r = await recorder(p, "s0intro");
  r.mark("start");
  await wait(1500);
  r.mark("end");
  await r.stop();

  await p.goto(BASE + "/");
  await p.evaluate(() => document.querySelectorAll("[class*=StickyCta],[data-sticky]").forEach((e) => e.remove()));
  const r2 = await recorder(p, "s0hero");
  r2.mark("start");
  await wait(4200);
  r2.mark("end");
  await r2.stop();
  await ctx.close();
}

// ---------- paid account for scenes 1–4 ----------
const ctx = await b.newContext({ viewport: VIEW, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
await p.goto(BASE + "/signup");
await p.getByLabel("Email").fill(`video${Date.now()}.paidpreview@fitplanr-test.com`);
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
await p.waitForTimeout(1200);

// ---------- scene 1: gear ----------
{
  const r = await recorder(p, "s1");
  r.mark("start");
  await wait(500);
  await p.getByRole("button", { name: "2 dumbbells" }).tap();
  await wait(650);
  const bench = p.getByRole("button", { name: /Flat \/ incline bench/ });
  await bench.scrollIntoViewIfNeeded();
  await wait(250);
  await bench.tap();
  await wait(650);
  await p.getByRole("button", { name: /Pull-up bar/ }).tap();
  await wait(700);
  await p.getByRole("button", { name: "Build my plan" }).tap();
  await wait(1500);
  r.mark("end");
  await r.stop();
}
await p.waitForFunction(() => location.pathname === "/plan", null, { timeout: 60000 });
await p.waitForTimeout(800);

// ---------- scene 2: workout with rest timer ----------
{
  await p.goto(BASE + "/workout");
  await p.getByRole("button", { name: /^Log set 1/ }).first().waitFor();
  await p.waitForTimeout(1200);
  const r = await recorder(p, "s2");
  r.mark("start");
  await wait(400);
  await p.getByRole("button", { name: /^Log set 1/ }).first().tap();
  await wait(1500);
  await p.getByRole("button", { name: "Skip rest" }).last().tap();
  await wait(400);
  await p.getByRole("button", { name: /^Log set 2/ }).first().tap();
  await wait(1400);
  await p.getByRole("button", { name: "Skip rest" }).last().tap();
  await wait(400);
  await p.getByRole("button", { name: /^Log set 3/ }).first().tap();
  await wait(1300);
  r.mark("end");
  await r.stop();
}

// ---------- scene 3: muscle map ----------
{
  await p.goto(BASE + "/dashboard");
  const map = p.getByRole("region", { name: "Muscle map" });
  await map.waitFor();
  await map.evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 12, behavior: "instant" }));
  await p.waitForTimeout(1500);
  const r = await recorder(p, "s3");
  r.mark("start");
  await wait(700);
  // dispatchEvent: tap without Playwright scrolling the page
  await map.getByRole("tab", { name: /^Day 1/ }).dispatchEvent("click");
  await wait(1100);
  await map.getByRole("tab", { name: /^Day 2/ }).dispatchEvent("click");
  await wait(1100);
  await map.getByRole("listitem").filter({ hasText: "Hamstrings" }).getByRole("button").dispatchEvent("click");
  await wait(1300);
  r.mark("end");
  await r.stop();
}

// ---------- scene 4: nutrition plan, swap a food, then "Ate it" fills the rings ----------
{
  await p.goto(BASE + "/nutrition");
  await p.getByRole("button", { name: "Set my targets" }).tap();
  await p.getByText("Three plates a day").waitFor();
  const card = p.getByRole("article", { name: "Breakfast" });
  await card.evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: "instant" }));
  await p.waitForTimeout(1500);
  const r = await recorder(p, "s4");
  r.mark("start");
  await wait(500);
  await p.getByRole("button", { name: /^Swap Blueberries/ }).dispatchEvent("click");
  await wait(1100);
  await p.getByRole("button", { name: /^Pear/ }).dispatchEvent("click");
  await wait(1000);
  r.mark("swapDone");
  await card.getByRole("button", { name: "Ate it" }).dispatchEvent("click");
  await card.getByText("Logged today").waitFor();
  await wait(150);
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await wait(2200);
  r.mark("end");
  await r.stop();
}

// ---------- end card ----------
{
  await p.goto(BASE + "/login");
  await p.waitForTimeout(800);
  await p.evaluate(() => {
    document.body.innerHTML = `
<style>
  body{margin:0;background:#060606;overflow:hidden}
  .s{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#F4F5F0;font-family:var(--font-inter),sans-serif;background:radial-gradient(ellipse 60% 40% at 50% 38%,rgba(200,255,61,.2),transparent 70%),#060606}
  .grid{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.18) 1px,transparent 1.5px);background-size:22px 22px;mask-image:radial-gradient(ellipse 70% 55% at 50% 40%,#000 30%,transparent 75%);-webkit-mask-image:radial-gradient(ellipse 70% 55% at 50% 40%,#000 30%,transparent 75%)}
  .in{opacity:0;transform:translateY(14px);animation:in .5s cubic-bezier(.22,.8,.24,1) both}
  @keyframes in{to{opacity:1;transform:none}}
  .big{font-family:var(--font-barlow),sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:-.02em;line-height:.92;font-size:74px}
  .fit{display:inline-block;margin-top:6px;padding:4px 22px;border-radius:18px;background:#C8FF3D;color:#0A0D02;font-size:96px;animation:in .5s cubic-bezier(.22,.8,.24,1) .15s both,beat 1.2s ease-in-out .8s infinite}
  @keyframes beat{50%{transform:scale(1.06);box-shadow:0 0 50px rgba(200,255,61,.55)}}
  .mono{font-family:var(--font-jetbrains),monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#8A8F82}
</style>
<div class="s"><div class="grid"></div>
 <div class="in" style="position:relative;display:flex;align-items:center;gap:10px">
  <svg width="34" height="34" viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="#C8FF3D"/><path d="M8 22.5 L14 16.5 L18 19.5 L24.5 11" stroke="#0A0D02" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><rect x="5.5" y="20" width="4" height="6" rx="1.2" transform="rotate(-45 7.5 23)" fill="#0A0D02"/><rect x="22.5" y="7.5" width="4" height="6" rx="1.2" transform="rotate(-45 24.5 10.5)" fill="#0A0D02"/></svg>
  <span style="font-family:var(--font-barlow),sans-serif;font-weight:700;font-size:28px;text-transform:uppercase">FitPlanr</span>
 </div>
 <div class="big in" style="position:relative;margin-top:40px;animation-delay:.08s">Comment</div>
 <div class="big" style="position:relative"><span class="fit">FIT</span></div>
 <div class="in" style="position:relative;margin-top:26px;max-width:270px;font-size:19px;line-height:1.35;color:#d9dcd2;animation-delay:.3s">and I'll send you the link to try it out.</div>
 <div class="mono in" style="position:relative;margin-top:34px;animation-delay:.45s">[ Gear in · plan out · meals sized ]</div>
</div>`;
  });
  const r = await recorder(p, "s5");
  r.mark("start");
  await wait(3600);
  r.mark("end");
  await r.stop();
}
console.log("page errors:", errs.length ? errs : "none");
await ctx.close();
await b.close();
