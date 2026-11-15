// node shot-story.cjs page.html out.png [query]
const { chromium } = require('playwright'); const path = require('path');
(async () => { const [html, out, q] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.resolve(html) + (q ? '?' + q : '')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  await p.evaluate(() => window.render(0)); await p.screenshot({ path: out }); await b.close(); })();
