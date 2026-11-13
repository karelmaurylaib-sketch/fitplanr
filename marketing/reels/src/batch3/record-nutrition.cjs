// Records the paid Nutrition flow on a local dev server (paid preview). Output: nutri-frames/*.jpg + nutri-meta.json
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.env.BASE_URL || 'http://localhost:3001';
const OUT = __dirname + '/nutri-frames'; fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT);
(async () => {
  const browser = await chromium.launch({ args: ['--force-device-scale-factor=2.6666667'] });
  const ctx = await browser.newContext({ viewport: { width: 405, height: 720 }, deviceScaleFactor: 1080 / 405, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  // hide the Next.js dev-mode indicator so it never shows in the recording
  await ctx.addInitScript(() => { const st = document.createElement('style'); st.textContent = 'nextjs-portal{display:none!important}';
    document.addEventListener('DOMContentLoaded', () => document.head.appendChild(st)); });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  // ---- off camera: paid preview account + a plan (build muscle, 3 days) ----
  const email = `reel${Date.now()}.paidpreview@fitplanr-test.com`;
  await page.goto(BASE + '/signup');
  await page.getByLabel('Email').fill(email); await page.getByLabel('Password', { exact: true }).fill('Test-password-123');
  await page.getByRole('button', { name: 'Build my plan' }).click();
  await page.waitForFunction(() => location.pathname.startsWith('/start'), null, { timeout: 90000 });
  await page.waitForTimeout(1500);
  for (const a of ['Build muscle', 'Never really', '3 days', '45 minutes']) {
    await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('main ul')).opacity) > 0.9);
    await page.getByRole('button', { name: a }).click(); await page.waitForTimeout(1500);
  }
  await page.getByRole('button', { name: 'Skip' }).click();
  await page.getByText('Pick a starting point').waitFor();
  await page.getByRole('button', { name: 'Build my plan' }).click();
  await page.waitForFunction(() => location.pathname === '/plan', null, { timeout: 90000 });
  await page.goto(BASE + '/dashboard'); await page.waitForTimeout(4000);
  // ---- on camera ----
  const cdp = await ctx.newCDPSession(page);
  const frames = [], marks = []; const t0 = Date.now();
  cdp.on('Page.screencastFrame', async f => {
    fs.writeFileSync(`${OUT}/${String(frames.length).padStart(5, '0')}.jpg`, Buffer.from(f.data, 'base64'));
    frames.push(Date.now() - t0); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  const mark = n => { marks.push([n, Date.now() - t0]); console.log(n, Date.now() - t0); };
  const smooth = y => page.evaluate(y => window.scrollTo({ top: y, behavior: 'smooth' }), y);
  const topOf = (loc, off = 10) => loc.evaluate((el, o) => el.getBoundingClientRect().top + window.scrollY - o, off);
  const tap = async (loc) => {
    const b = await loc.boundingBox();
    await page.evaluate(({ x, y }) => { const r = document.createElement('div');
      r.style.cssText = `position:fixed;left:${x - 22}px;top:${y - 22}px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.35);border:2px solid #fff;z-index:2147483646;pointer-events:none;transition:transform .45s ease-out,opacity .45s ease-out`;
      document.documentElement.appendChild(r); requestAnimationFrame(() => { r.style.transform = 'scale(1.8)'; r.style.opacity = '0'; }); setTimeout(() => r.remove(), 600); },
      { x: b.x + b.width / 2, y: b.y + b.height / 2 });
    await page.waitForTimeout(220); await loc.dispatchEvent('click');
  };
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1080, maxHeight: 1920, everyNthFrame: 1 });
  mark('dash'); await page.waitForTimeout(1500);
  mark('tap'); await tap(page.getByRole('navigation', { name: 'App' }).last().getByRole('link', { name: 'Nutrition' }));
  await page.getByRole('button', { name: 'Set my targets' }).waitFor({ timeout: 60000 }); mark('setup');
  await page.waitForTimeout(1800);
  await tap(page.getByRole('button', { name: 'Set my targets' }));
  await page.getByText('Three plates a day').waitFor({ timeout: 60000 }); mark('targets');
  await page.waitForTimeout(2600);
  const lunch = page.getByRole('article', { name: 'Lunch' });
  mark('meals'); await smooth(await topOf(page.getByText('Three plates a day'), 70)); await page.waitForTimeout(1800);
  await smooth(await topOf(lunch)); await page.waitForTimeout(1500);
  mark('swap'); await tap(lunch.getByRole('button', { name: /^Swap Chicken breast/ })); await page.waitForTimeout(2200);
  mark('pick'); await tap(page.getByRole('button', { name: /^Firm tofu/ })); await page.waitForTimeout(2400);
  mark('ate'); await tap(lunch.getByRole('button', { name: 'Ate it' }));
  await lunch.getByText('Logged today').waitFor(); await page.waitForTimeout(1400);
  mark('rings'); await smooth(0); await page.waitForTimeout(3000);
  mark('end');
  await cdp.send('Page.stopScreencast');
  fs.writeFileSync(__dirname + '/nutri-meta.json', JSON.stringify({ frames, marks, email }));
  if (errs.length) console.log('PAGE ERRORS', errs.slice(0, 3));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
