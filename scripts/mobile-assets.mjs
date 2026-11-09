// Renders the source images for the store icons and splash screens (mobile/assets/*.png),
// then `npx capacitor-assets generate` cuts every iOS and Android size from them.
// Usage: node scripts/mobile-assets.mjs && npm run mobile:assets
import { chromium } from "playwright";
import { existsSync, mkdirSync } from "node:fs";

const OUT = "mobile/assets";
mkdirSync(OUT, { recursive: true });

const MARK = (stroke = "#C8FF3D") => `
  <path d="M8 22.5 L14 16.5 L18 19.5 L24.5 11" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <rect x="5.5" y="20" width="4" height="6" rx="1.2" transform="rotate(-45 7.5 23)" fill="${stroke}"/>
  <rect x="22.5" y="7.5" width="4" height="6" rx="1.2" transform="rotate(-45 24.5 10.5)" fill="${stroke}"/>`;

const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&family=JetBrains+Mono:wght@500&display=block" rel="stylesheet">`;

const bg = (glow = 0.22) => `background:#060606;background-image:radial-gradient(ellipse 70% 55% at 50% 38%, rgb(200 255 61 / ${glow}), transparent 70%), linear-gradient(180deg,#121410,#060606 70%);`;

const pages = {
  // App Store / Play Store icon: charcoal, lime mark, soft glow (no transparency, no text).
  "icon-only.png": [1024, `<div style="width:1024px;height:1024px;${bg(0.2)}display:grid;place-items:center">
      <svg width="760" height="760" viewBox="0 0 32 32" style="filter:drop-shadow(0 0 36px rgb(200 255 61 / .45))">${MARK()}</svg></div>`],
  // Android adaptive icon layers: the mark inside the 66% safe zone, and the background.
  "icon-foreground.png": [1024, `<div style="width:1024px;height:1024px;display:grid;place-items:center">
      <svg width="560" height="560" viewBox="0 0 32 32" style="filter:drop-shadow(0 0 26px rgb(200 255 61 / .45))">${MARK()}</svg></div>`],
  "icon-background.png": [1024, `<div style="width:1024px;height:1024px;${bg(0.2)}"></div>`],
  // Splash: the lime app mark + wordmark, kept narrow: phones crop the square to a ~1260 px wide middle.
  "splash.png": [2732, `<div style="width:2732px;height:2732px;${bg(0.12)}display:flex;flex-direction:column;align-items:center;justify-content:center;gap:70px">
      <div style="width:420px;height:420px;border-radius:118px;background:#C8FF3D;display:grid;place-items:center;filter:drop-shadow(0 0 120px rgb(200 255 61 / .4))">
        <svg width="420" height="420" viewBox="0 0 32 32">${MARK("#0A0D02")}</svg></div>
      <div style="font:700 180px/1 'Barlow Condensed';letter-spacing:-2px;color:#F4F5F0;text-transform:uppercase">FitPlanr</div></div>`],
};
pages["splash-dark.png"] = pages["splash.png"];

const browser = await chromium.launch(existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {});
for (const [name, [size, html]] of Object.entries(pages)) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head>${FONTS}<style>html,body{margin:0;background:transparent}</style></head><body>${html}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${OUT}/${name}`, omitBackground: name === "icon-foreground.png" });
  await page.close();
  console.log("wrote", `${OUT}/${name}`);
}
await browser.close();
