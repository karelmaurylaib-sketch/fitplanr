// Full-page screenshots at phone (390x844) and computer (1440x900) size.
// Usage: node scripts/shot.mjs <path> [name] [--wait=ms]
import { chromium } from "playwright";
import fs from "node:fs";

const path = process.argv[2] || "/";
const name = process.argv[3] || (path.replace(/[^\w]+/g, "_") || "home");
const wait = Number((process.argv.find((a) => a.startsWith("--wait=")) || "--wait=1500").split("=")[1]);
const base = process.env.BASE_URL || "http://localhost:3000";
fs.mkdirSync("shots", { recursive: true });
const browser = await chromium.launch();
for (const [label, vp] of [["390", { width: 390, height: 844 }], ["1440", { width: 1440, height: 900 }]]) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1 });
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(base + path, { waitUntil: "networkidle" });
  // scroll through so reveal animations play
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `shots/${name}-${label}.png`, fullPage: true });
  console.log(`shots/${name}-${label}.png`, errors.length ? `console errors: ${errors.join(" | ")}` : "no console errors");
  await page.close();
}
await browser.close();
