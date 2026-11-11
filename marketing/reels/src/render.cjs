// usage: node render.cjs page.html out.mp4 [fps]
const { chromium } = require('playwright'); const fs=require('fs'); const path=require('path'); const {execFileSync}=require('child_process');
(async()=>{
  const [html,out,fpsArg]=process.argv.slice(2); const fps=+fpsArg||30;
  const dir=path.join(__dirname,'frames-'+path.basename(html,'.html')); fs.rmSync(dir,{recursive:true,force:true}); fs.mkdirSync(dir);
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1080,height:1920}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('file://'+path.resolve(html)); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(500);
  const dur=await p.evaluate(()=>window.DURATION); const n=Math.round(dur*fps);
  const only=process.env.ONLY? process.env.ONLY.split(',').map(Number):null;
  for(let i=0;i<n;i++){ const t=i/fps; if(only && !only.some(o=>Math.abs(o-t)<0.5/fps)) continue;
    await p.evaluate(async t=>{ await window.render(t) },t);
    await p.screenshot({path:`${dir}/${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:93}); }
  await b.close(); if(errs.length) console.log('ERRORS',errs.slice(0,5));
  if(only){ console.log('stills in',dir); return; }
  execFileSync('ffmpeg',['-loglevel','error','-y','-framerate',String(fps),'-i',`${dir}/%05d.jpg`,'-f','lavfi','-i','anullsrc=r=44100:cl=stereo','-shortest','-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-profile:v','high','-r',String(fps),'-c:a','aac','-b:a','128k','-movflags','+faststart',out]);
  console.log('wrote',out,n,'frames');
})();
