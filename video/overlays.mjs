// Renders the 1080×1920 transparent text overlays, the background and the screen mask with the app's own fonts.
import { chromium } from "playwright";
const BASE = process.env.BASE_URL || "http://localhost:3001";
const OUT = "video/build";
const DEFAULT_TEXTS = {
  t0: { tag: "POV", text: "You have basic gear & want to build muscle fast" },
  t1: { tag: "Step 1", text: "Input your exact gear" },
  t2: { tag: "Step 2", text: "Track progressive sets & reps" },
  t3: { tag: "Step 3", text: "See targeted muscle highlights" },
  t4: { tag: "Step 4", text: "Pick meals that hit your macros" },
};
// node video/overlays.mjs [texts.json out-dir]: render only those texts (background and mask are shared)
const [textsFile, textsOut] = process.argv.slice(2);
const TEXTS = textsFile ? JSON.parse((await import("node:fs")).readFileSync(textsFile, "utf8")) : DEFAULT_TEXTS;
const TEXT_DIR = textsOut || OUT;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto(BASE + "/login");
await p.waitForTimeout(1500);
const css = `html,body{margin:0;background:transparent!important}
.o{position:fixed;left:0;right:0;top:150px;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 70px}
.tag{font-family:var(--font-jetbrains),monospace;font-weight:700;font-size:34px;letter-spacing:.16em;text-transform:uppercase;color:#0A0D02;background:#C8FF3D;padding:8px 22px;border-radius:14px}
.t{margin-top:18px;font-family:var(--font-barlow),sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:-.01em;line-height:.95;font-size:92px;color:#fff;
 text-shadow:0 0 2px #000,0 4px 0 #000,0 0 30px rgba(0,0,0,.9),0 0 60px rgba(0,0,0,.8)}`;
for (const [k, v] of Object.entries(TEXTS)) {
  await p.evaluate(({ css, v }) => {
    document.body.className = "";
    document.body.innerHTML = `<style>${css}</style><div class="o"><span class="tag">${v.tag}</span><div class="t">${v.text.replace(/&/g, "&amp;")}</div></div>`;
  }, { css, v });
  await p.waitForTimeout(200);
  await p.screenshot({ path: `${TEXT_DIR}/${k}.png`, omitBackground: true });
}
if (textsFile) {
  await b.close();
  console.log("overlays done");
  process.exit(0);
}
// background: true black, dot grid, lime glow, a soft outline where the screen sits (108,470 864×1400)
await p.evaluate(() => {
  document.body.innerHTML = `<style>html,body{margin:0;background:#060606!important}</style>
  <div style="position:fixed;inset:0;background:radial-gradient(ellipse 60% 30% at 50% 10%,rgba(200,255,61,.16),transparent 70%),#060606"></div>
  <div style="position:fixed;inset:0;background-image:radial-gradient(rgba(255,255,255,.16) 1.5px,transparent 2px);background-size:33px 33px;mask-image:radial-gradient(ellipse 80% 40% at 50% 14%,#000 20%,transparent 75%);-webkit-mask-image:radial-gradient(ellipse 80% 40% at 50% 14%,#000 20%,transparent 75%)"></div>
  <div style="position:fixed;left:104px;top:466px;width:872px;height:1408px;border-radius:58px;background:rgba(200,255,61,.28);box-shadow:0 0 80px rgba(200,255,61,.18),0 40px 120px rgba(0,0,0,.9)"></div>`;
});
await p.waitForTimeout(200);
await p.screenshot({ path: `${OUT}/bg.png` });
// rounded mask for the 864×1400 screen
await p.setViewportSize({ width: 864, height: 1400 });
await p.evaluate(() => {
  document.body.innerHTML = `<style>html,body{margin:0;background:#000!important}</style><div style="position:fixed;inset:0;border-radius:54px;background:#fff"></div>`;
});
await p.waitForTimeout(200);
await p.screenshot({ path: `${OUT}/mask.png` });
await b.close();
console.log("overlays done");
