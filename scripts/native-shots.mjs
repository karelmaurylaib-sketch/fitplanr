// The native apps, simulated in Chromium: the app's user agent + a stand-in Capacitor bridge, so the web app
// takes its in-app paths (safe areas, Google hidden, reminders, checkout in the in-app browser).
// Also the camera (Form mirror) with Chromium's fake camera, and the offline page.
// Local dev only (paid preview): DEV_PAID_EMAIL_SUFFIX=.paidpreview@fitplanr-test.com npx next dev -p 3001
// Usage: node scripts/native-shots.mjs [ios|android|web] [390|1440]
import { chromium } from "playwright";
import fs from "node:fs";

const base = process.env.BASE_URL || "http://localhost:3001";
const platform = process.argv[2] || "ios";
const width = Number(process.argv[3] || 390);
const vp = width === 390 ? { width: 390, height: 844 } : { width: 1440, height: 900 };
fs.mkdirSync("shots", { recursive: true });
const exe = fs.existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {};
const b = await chromium.launch({ ...exe, args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] });
const ua =
  platform === "web"
    ? undefined
    : `Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36 FitPlanrApp/1.0 (${platform}; push)`;
const ctx = await b.newContext({ viewport: vp, userAgent: ua, permissions: ["camera"] });
if (platform !== "web") {
  await ctx.addInitScript((p) => {
    // stand-in for the native bridge: plugin calls go nowhere, like a phone with nothing to report
    if (p === "ios") window.webkit = { messageHandlers: { bridge: { postMessage() {} } } };
    else window.androidBridge = { postMessage() {} };
    window.Capacitor = { PluginHeaders: ["PushNotifications", "SplashScreen", "App", "Browser", "Haptics"].map((name) => ({ name, methods: [] })) };
    // stand in for a 47 px notch (iOS gives it through env(safe-area-inset-top))
    document.addEventListener("DOMContentLoaded", () => {
      const st = document.createElement("style");
      st.textContent = ":root{--safe-area-inset-top:47px}";
      document.head.appendChild(st);
    });
  }, platform);
}
// Next.js's dev-only overlay badge would sit over the page (it reports the stand-in bridge's missing native side)
await ctx.addInitScript(() => document.addEventListener("DOMContentLoaded", () => {
  const st = document.createElement("style");
  st.textContent = "nextjs-portal{display:none!important}";
  document.head.appendChild(st);
}));
const p = await ctx.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
const tag = `${platform}-${width}`;
const shot = (n, full = false) => p.screenshot({ path: `shots/n-${n}-${tag}.png`, fullPage: full });

await p.goto(base + "/app");
await p.waitForTimeout(2500);
await shot("start");
await p.getByRole("link", { name: "Build my plan" }).click();
await p.waitForURL(/\/signup/);
await p.waitForTimeout(1000);
await shot("signup");
await p.getByLabel("Email").fill(`native${Date.now()}.paidpreview@fitplanr-test.com`);
await p.getByLabel("Password", { exact: true }).fill("Test-password-123");
await p.getByRole("button", { name: "Build my plan" }).click();
await p.waitForFunction(() => location.pathname.startsWith("/start"), null, { timeout: 60000 });
await p.waitForTimeout(1500);
for (const a of ["Build muscle", "Never really", "3 days", "45 minutes"]) {
  await p.getByRole("button", { name: a }).click();
  await p.waitForTimeout(1500);
}
await p.getByRole("button", { name: "Skip" }).click({ timeout: 15000 }).catch(async (e) => { await shot("fail"); throw e; });
await p.waitForTimeout(1500);
await p.getByRole("button", { name: "Build my plan" }).click();
await p.waitForFunction(() => location.pathname === "/plan", null, { timeout: 60000 });
await p.waitForTimeout(1500);
await shot("plan");

await p.goto(base + "/dashboard");
await p.waitForTimeout(3000);
await shot("dashboard");
await p.goto(base + "/settings");
await p.waitForTimeout(2500);
await shot("settings", true);

// Form Library → exercise → camera mirror
await p.goto(base + "/library");
await p.waitForTimeout(2500);
await p.locator("main button, button").filter({ hasText: /Squat|Press|Row/ }).first().click();
await p.waitForTimeout(1200);
await shot("exercise");
await p.getByRole("button", { name: /Check my form with the camera/ }).click();
await p.waitForTimeout(3500);
await shot("mirror");
const live = await p.evaluate(() => !!document.querySelector("video")?.srcObject);
await p.keyboard.press("Escape");

// workout: log a set (haptic path) then go offline and finish
await p.goto(base + "/workout");
await p.waitForTimeout(2500);
await p.getByRole("button", { name: /^Log set/ }).nth(0).click();
await p.getByRole("button", { name: "Skip rest" }).last().click();
await ctx.setOffline(true);
await p.getByRole("button", { name: "Finish workout" }).click();
await p.waitForTimeout(800);
await shot("workout-offline");
await ctx.setOffline(false);
await p.waitForTimeout(3000);
const saved = await p.getByText("Workout done").isVisible().catch(() => false);
await shot("workout-back-online");

// expected: no network while offline, and the stand-in bridge has no native side to answer plugin calls
const offErrs = errs.filter((e) => !/ERR_INTERNET_DISCONNECTED|Failed to fetch|net::|is not implemented on (ios|android)/.test(e));
console.log(tag, { cameraLive: live, savedAfterReconnect: saved }, offErrs.length ? offErrs.slice(0, 8) : "no console errors");
await b.close();
