// Onboarding conversion checks on the dev harness (/dev/funnel, `npm run dev`): progress bar per Equipment Sync step,
// Save Progress on tab close / exit intent / back, Value Preview data, paywall analytics events. Phone + computer.
import { chromium } from "playwright";
import fs from "node:fs";

const base = process.env.BASE_URL || "http://localhost:3000";
const exe = fs.existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {};
const pass = process.env.PASS || "1";
fs.mkdirSync("shots", { recursive: true });
const b = await chromium.launch(exe);
let failed = 0;
const ok = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failed++;
};

for (const [tag, vp, phone] of [["390", { width: 390, height: 844 }, true], ["1440", { width: 1440, height: 900 }, false]]) {
  console.log(`— ${tag} (pass ${pass})`);
  const ctx = await b.newContext({ viewport: vp, isMobile: phone, hasTouch: phone });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  const shot = (n, full = false) => p.screenshot({ path: `shots/o-${n}-${tag}.png`, fullPage: full });
  const bar = () => p.getByRole("progressbar", { name: "Your progress" }).getAttribute("aria-valuenow").then(Number);
  const ready = () => p.waitForFunction(() => { const el = document.querySelector("main section ul, main section > div"); return el && Number(getComputedStyle(el).opacity) > 0.9; });

  // 1. the five questions
  await p.goto(base + "/dev/funnel");
  await ready();
  await shot("1q1");
  const seen = [await bar()];
  for (const a of ["Build muscle", "Never really", "3 days", "45 minutes"]) {
    await ready();
    await p.getByRole("button", { name: a }).click();
    await p.waitForTimeout(1500);
    seen.push(await bar());
  }
  await p.getByRole("button", { name: "Skip" }).click();
  await p.waitForTimeout(400);
  seen.push(await bar());
  ok(seen.every((v, i) => i === 0 || v > seen[i - 1]), `progress climbs on every answer: ${seen.join(" → ")}`);

  // 2. Equipment Sync: setup → gear → weight, progress bar + sub-stepper
  await ready();
  await shot("2sync-setup");
  const s0 = await bar();
  ok((await p.getByTestId("step-count").innerText()).toLowerCase().includes("equipment sync · 1 / 3"), "label reads Equipment Sync · 1 / 3");
  await p.getByRole("button", { name: "Home: 2 dumbbells" }).click();
  await p.waitForTimeout(500);
  await shot("3sync-setup-picked");
  const s1 = await bar();
  ok(s1 > s0, `tap on a setup moves the bar: ${s0} → ${s1}`);
  ok((await p.locator('[aria-label="Equipment Sync steps"] li[data-done="1"]').count()) === 1, "Setup step ticked");
  await p.waitForTimeout(1200);
  await ready();
  ok((await p.getByTestId("step-count").innerText()).toLowerCase().includes("2 / 3"), "label reads 2 / 3");
  const before = await p.locator("main").getByText("exercises fit").locator("..").innerText();
  await p.getByRole("button", { name: "Flat / incline bench" }).click();
  await p.waitForTimeout(500);
  const after = await p.locator("main").getByText("exercises fit").locator("..").innerText();
  ok(parseInt(after) > parseInt(before), `adding a bench grows the exercise count: ${parseInt(before)} → ${parseInt(after)}`);
  await p.getByRole("button", { name: "Flat / incline bench" }).click();
  await shot("4sync-gear");
  const s2 = await bar();
  await p.getByRole("button", { name: "Continue" }).click();
  await p.waitForTimeout(500);
  await ready();
  const s3 = await bar();
  ok(s3 > s2, `Continue moves the bar: ${s2} → ${s3}`);
  ok((await p.getByTestId("step-count").innerText()).toLowerCase().includes("3 / 3"), "label reads 3 / 3");
  ok((await p.locator('[aria-label="Equipment Sync steps"] li[data-done="1"]').count()) === 2, "Setup and Gear ticked");
  await p.getByRole("button", { name: "Heavier" }).click();
  await p.getByRole("button", { name: "Lighter" }).click();
  ok((await p.getByTestId("db-weight").innerText()).startsWith("25"), "weight stepper: 25 lb");
  await shot("5sync-weight");

  // pinned header stays on screen when scrolled
  await p.mouse.wheel(0, 600);
  await p.waitForTimeout(300);
  const top = await p.getByRole("progressbar", { name: "Your progress" }).boundingBox();
  ok(top && top.y >= 0 && top.y < 80, `progress bar pinned at the top (y=${top && Math.round(top.y)})`);
  await p.mouse.wheel(0, -600);

  // 3. Save Progress: tab close (native prompt, then our modal), exit intent / back button
  const dialogs = [];
  let stay = true; // dismiss the Leave site? prompt only for the tab-close check
  ctx.on("dialog", (d) => {
    dialogs.push(d.type());
    (stay ? d.dismiss() : d.accept()).catch(() => {});
  });
  await p.close({ runBeforeUnload: true });
  await p.waitForTimeout(900);
  stay = false;
  ok(dialogs.includes("beforeunload"), "closing the tab shows the browser's Leave site? prompt");
  const save = p.getByRole("dialog", { name: "Save your progress" });
  ok(await save.isVisible(), "staying after the close prompt opens Save Progress");
  await p.waitForTimeout(400);
  await shot("6save-close");
  ok((await save.getByLabel(/Email me a link/).inputValue()) === "you@example.com", "email pre-filled from the account");
  await save.getByLabel(/Email me a link/).fill("someone@else.com");
  await save.getByRole("button", { name: "Email me a link" }).click();
  ok(await save.getByRole("alert").isVisible(), "a different email shows an error");
  await shot("6save-error");
  await save.getByRole("button", { name: "Keep building my plan" }).click();
  await p.waitForTimeout(500);
  ok(!(await save.isVisible()), "Keep building closes it");

  // exit intent / back button: a new visit in a fresh tab (the modal shows once per visit)
  {
    const t = await ctx.newPage();
    t.on("pageerror", (e) => errs.push(String(e)));
    await t.goto(base + "/dev/funnel?at=sync");
    await t.waitForTimeout(1500);
    if (phone) {
      await t.goBack();
    } else {
      await t.mouse.move(700, 300);
      await t.evaluate(() => document.dispatchEvent(new MouseEvent("mouseout", { clientX: 700, clientY: 0, relatedTarget: null, bubbles: true })));
    }
    await t.waitForTimeout(800);
    const s2 = t.getByRole("dialog", { name: "Save your progress" });
    ok(await s2.isVisible(), phone ? "back button opens Save Progress" : "mouse leaving the top opens Save Progress");
    ok(t.url().includes("/dev/funnel"), "still on the flow");
    await t.screenshot({ path: `shots/o-7save-exit-${tag}.png` });
    await s2.getByRole("button", { name: "Close" }).click();
    await t.waitForTimeout(400);
    if (phone) {
      await t.goBack();
      await t.waitForTimeout(800);
      ok(!t.url().includes("/dev/funnel") || !(await s2.isVisible()), "second back press is not trapped");
    }
    await t.close();
  }

  // 4. Value Preview
  await p.getByRole("button", { name: "Build my plan" }).click();
  const vp1 = p.getByRole("dialog", { name: "Your projection" });
  await vp1.waitFor();
  await p.waitForTimeout(250);
  await shot("8preview-loading");
  await p.waitForTimeout(1900);
  await shot("9preview");
  const txt = await vp1.innerText();
  ok(/2 dumbbells \(25 lb\)/.test(txt), "preview names the selected gear: 2 dumbbells (25 lb)");
  ok(/Goblet Squat/.test(txt), "preview shows Day 1's first lift from the engine");
  ok(/25 × 8/.test(txt) && /25 × 12/.test(txt), "fixed pair: same 25 lb, reps climb 8 → 12");
  ok(/\+\d(\.5)?–\d(\.5)?/.test(txt), "muscle range shown");
  await vp1.locator("div.overflow-y-auto").evaluate((el) => el.scrollTo(0, el.scrollHeight));
  await p.waitForTimeout(400);
  await shot("10preview-bottom");
  await vp1.getByRole("button", { name: "Build my plan" }).click();
  await p.waitForURL(/start\/building|signup|login/, { timeout: 15000 });
  ok(true, `Build my plan continues to ${new URL(p.url()).pathname}`);

  // 5. Value Preview with other gear + error state
  await p.goto(base + "/dev/funnel?at=sync&gear=gym");
  await ready();
  await p.getByRole("button", { name: "Full gym" }).click();
  await p.waitForTimeout(1500);
  await ready();
  await p.getByRole("button", { name: "Continue" }).click();
  await p.waitForTimeout(400);
  await ready();
  await p.getByRole("button", { name: "Build my plan" }).click();
  await p.getByRole("dialog", { name: "Your projection" }).waitFor();
  await p.waitForTimeout(2200);
  const gym = await p.getByRole("dialog", { name: "Your projection" }).innerText();
  ok(/a full gym/.test(gym) && !/Goblet Squat/.test(gym), "full gym: preview changes with the gear");
  await shot("11preview-gym");
  await p.goto(base + "/dev/funnel?at=sync&fail=1");
  await ready();
  await p.getByRole("button", { name: "Bodyweight only" }).click();
  await p.waitForTimeout(1500);
  await ready();
  await p.getByRole("button", { name: "Build my plan" }).click();
  await p.getByText("Your projection didn't load.").waitFor();
  await shot("12preview-error");
  ok(true, "error state shows, with Build my plan still available");

  // 6. Paywall: micro-commitment card, Start my plan, events per device
  await p.goto(base + "/dev/funnel?view=plan");
  const pw = p.getByRole("dialog", { name: "Choose your plan" });
  await pw.waitFor({ timeout: 8000 });
  await p.waitForTimeout(900);
  await shot("13paywall");
  await pw.getByRole("button", { name: /I'll train Mon, Wed and Fri/ }).click();
  await p.waitForTimeout(400);
  ok(await pw.getByRole("button", { name: /You're in/ }).isVisible(), "commitment tap flips to You're in");
  await pw.locator("div.overflow-y-auto").first().evaluate((el) => el.scrollTo(0, 560));
  await p.waitForTimeout(400);
  await shot("14paywall-plans");
  await pw.getByRole("button", { name: "Start my plan" }).first().click();
  await p.getByText("Payments open in a moment").waitFor({ timeout: 8000 });
  await shot("15checkout");
  const ev = await p.evaluate(() => window.__fpEvents.filter((e) => e.url === "/api/event").map((e) => `${e.body.type}:${e.body.detail ?? ""}`));
  const dev = phone ? "phone" : "computer";
  ok(ev.includes(`paywall_view:${dev}`), `paywall_view tagged ${dev}`);
  ok(ev.includes(`feature_used:checkout_open ${dev}`), `checkout_open tagged ${dev}`);
  ok(ev.includes("feature_used:paywall_commitment"), "commitment tracked");

  ok(errs.length === 0, `no console errors${errs.length ? ": " + errs.slice(0, 4).join(" | ") : ""}`);
  await ctx.close();
}
await b.close();
console.log(failed ? `${failed} check(s) failed` : "all checks passed");
process.exit(failed ? 1 : 0);
