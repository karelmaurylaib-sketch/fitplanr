const { chromium } = require('playwright');
const fs = require('fs');
const CFG = JSON.parse(process.argv[2]); const OUT = __dirname + '/' + CFG.name + '-frames'; fs.rmSync(OUT,{recursive:true,force:true}); fs.mkdirSync(OUT);
(async () => {
  const browser = await chromium.launch({args:['--force-device-scale-factor=2.6666667']});
  const ctx = await browser.newContext({ viewport:{width:405,height:720}, deviceScaleFactor:1080/405, isMobile:true, hasTouch:true });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  const frames = []; const marks = [];
  const t0 = Date.now();
  cdp.on('Page.screencastFrame', async f => {
    const n = frames.length; fs.writeFileSync(`${OUT}/${String(n).padStart(5,'0')}.jpg`, Buffer.from(f.data,'base64'));
    frames.push(Date.now()-t0); cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});
  });
  const mark = (name) => { marks.push([name, Date.now()-t0]); console.log(name, Date.now()-t0); };
  const overlay = async (text) => null && page.evaluate((text) => {
    let el = document.getElementById('__cap');
    if (!el) { el = document.createElement('div'); el.id='__cap';
      el.style.cssText='position:fixed;left:50%;top:92px;transform:translateX(-50%);z-index:2147483647;pointer-events:none;background:#C8FF3D;color:#0A0D02;font:700 26px/1.05 "Barlow Condensed",Inter,sans-serif;text-transform:uppercase;letter-spacing:.3px;padding:9px 16px 8px;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.55);text-align:center;max-width:340px;white-space:pre-line;transition:opacity .2s';
      document.documentElement.appendChild(el); }
    el.textContent = text; el.style.opacity = text ? 1 : 0;
  }, text);
  const tap = async (loc) => {
    await loc.scrollIntoViewIfNeeded(); const b = await loc.boundingBox();
    await page.evaluate(({x,y}) => { const r=document.createElement('div');
      r.style.cssText=`position:fixed;left:${x-22}px;top:${y-22}px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.35);border:2px solid #fff;z-index:2147483646;pointer-events:none;transition:transform .45s ease-out,opacity .45s ease-out`;
      document.documentElement.appendChild(r); requestAnimationFrame(()=>{r.style.transform='scale(1.8)';r.style.opacity='0'}); setTimeout(()=>r.remove(),600); }, {x:b.x+b.width/2,y:b.y+b.height/2});
    await page.waitForTimeout(220); await loc.click();
  };
  const go = async (cap) => { await page.waitForLoadState('domcontentloaded'); await page.waitForTimeout(300); await overlay(cap); };
  await page.goto('https://fitplanr-3.vercel.app/', { waitUntil:'networkidle' });
  await cdp.send('Page.startScreencast',{format:'jpeg',quality:92,maxWidth:1080,maxHeight:1920,everyNthFrame:1});
  mark('landing'); await overlay('I have 2 dumbbells.\nThat\'s it.');
  await page.waitForTimeout(3500);
  await tap(page.getByRole('link',{name:'Build my plan'}).first());
  await page.waitForURL(/signup/); await go(''); mark('signup');
  const email = `e2e+reel${Date.now()}@fitplanr-test.com`;
  await page.getByLabel('Email').fill(email); await page.getByLabel('Password',{exact:true}).fill('Test-password-123');
  await page.waitForTimeout(600);
  await tap(page.getByRole('button',{name:'Build my plan'}));
  await page.waitForURL(/\/start/,{timeout:20000}); await go('5 quick taps'); mark('questions');
  for (const a of CFG.answers) {
    await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('main ul')).opacity) > 0.9);
    await page.waitForTimeout(500);
    await tap(page.getByRole('button',{name:a})); mark('ans '+a); await page.waitForTimeout(1500);
  }
  await page.waitForTimeout(400);
  if (CFG.protect) { await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('main ul')).opacity) > 0.9); await page.waitForTimeout(400);
    await tap(page.getByRole('button',{name:CFG.protect})); mark('protect'); await page.waitForTimeout(1300); await tap(page.getByRole('button',{name:'Continue'})); }
  else await tap(page.getByRole('button',{name:'Skip'}));
  await page.getByText('Pick a starting point').waitFor(); await overlay('Tell it what gear\nyou actually own'); mark('gear');
  await page.waitForTimeout(1500);
  await tap(page.getByRole('button',{name:CFG.preset,exact:true})); await page.waitForTimeout(1600);
  await tap(page.getByRole('button',{name:'Build my plan'}));
  await page.getByText('Building your plan…').waitFor(); await overlay(''); mark('building');
  await page.getByText('Your 4-week plan is ready.').first().waitFor({timeout:30000}); mark('ready');
  await page.waitForURL(/\/plan/,{timeout:15000}); await go('Day 1: every move,\nset & weight'); mark('plan');
  await page.waitForTimeout(1200);
  for (let i=0;i<3;i++){ await page.mouse.wheel(0,150); await page.waitForTimeout(300); }
  const dlg = page.getByRole('dialog',{name:'Choose your plan'});
  await dlg.waitFor({timeout:8000}).catch(()=>{}); mark('paywall');
  if (await dlg.isVisible()) { await page.waitForTimeout(500); await dlg.getByRole('button',{name:'Close'}).click(); await dlg.waitFor({state:'hidden'}); }
  mark('closed'); await page.waitForTimeout(500);
  for (let i=0;i<8;i++){ await page.mouse.wheel(0,160); await page.waitForTimeout(280); }
  await page.waitForTimeout(1500); mark('end');
  await cdp.send('Page.stopScreencast');
  fs.writeFileSync(__dirname+'/'+CFG.name+'-meta.json', JSON.stringify({frames, marks, email}));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
