// ---- batch 2 additions: "Comment FIT" end card, day card ----
function endCardFit(){ return `<div id="endf" class="abs" style="inset:0;opacity:0;display:flex;flex-direction:column;align-items:center;padding-top:290px">
  <div style="display:flex;align-items:center;gap:20px"><div style="width:76px;height:76px">${LOGO}</div><div class="disp" style="font-size:72px">FitPlanr</div></div>
  <div class="disp" style="font-size:150px;margin-top:70px;text-align:center;line-height:.9">Comment</div>
  <div id="fitword" class="disp lime" style="font-size:330px;line-height:.86">FIT</div>
  <div class="disp" style="font-size:78px;text-align:center;line-height:1;margin-top:18px">and I'll send<br>you the link</div>
  <div id="cbox" class="card" style="margin-top:70px;width:820px;display:flex;align-items:center;gap:24px;padding:26px 30px;border-radius:999px">
    <div style="width:74px;height:74px;border-radius:50%;background:linear-gradient(135deg,#C8FF3D,#5f7d12);flex:none"></div>
    <div style="flex:1;font:500 44px Inter;color:var(--muted)"><span id="ctyped" style="color:var(--text);font-weight:600"></span><span id="caret" style="color:var(--lime)">|</span><span id="cph">Add a comment…</span></div>
    <div id="csend" style="font:700 38px Inter;color:var(--lime);opacity:.35">Post</div></div>
  <div id="sent" class="mono" style="margin-top:34px;font-size:30px;color:var(--lime);opacity:0">✓ Link on its way to your DMs</div>
</div>`; }
function renderEndFit(t,a){ const e=$('#endf'); const p=eo(seg(t,a,a+.55)); e.style.opacity=p; e.style.transform=`translateY(${(1-p)*60}px)`;
  const w=$('#fitword'); const pop=back(seg(t,a+.15,a+.6)); const br=Math.sin((t-a)*3.2)*.5+.5;
  w.style.transform=`scale(${.6+.4*pop})`; w.style.textShadow=`0 0 ${50+60*br}px rgb(200 255 61/${.3+.3*br})`;
  const n=Math.max(0,Math.min(3,Math.floor((t-a-1.0)/.16)+1)); const typed=t>a+1.0?'FIT'.slice(0,n):'';
  $('#ctyped').textContent=typed; $('#cph').style.display=typed?'none':'';
  const posted=t>a+1.9; $('#caret').style.opacity=posted?0:((Math.floor(t*2.4)%2)?1:0);
  $('#csend').style.opacity=typed.length===3?1:.35; $('#cbox').style.borderColor=posted?'#C8FF3D':'';
  $('#cbox').style.transform=`scale(${1+.04*Math.sin(seg(t,a+1.85,a+2.15)*Math.PI)})`; rv('#sent',t,a+2.0,.4,16); }

function dayCard(id,day,name,mins,rows,top){ const inner=DUMBBELL.replace(/<svg[^>]*>|<\/svg>/g,'');
  return `<div id="${id}" class="abs card" style="left:60px;right:60px;top:${top}px;padding:40px 46px 14px;opacity:0">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px"><div><div class="mono lime" style="font-size:28px">${day}</div><div class="disp" style="font-size:80px;margin-top:8px">${name}</div></div>
  <div class="mono muted" style="font-size:28px;border:2px solid var(--line);border-radius:999px;padding:12px 20px">${mins}</div></div>
  ${rows.map((r,i)=>`<div class="xrow" style="display:flex;align-items:center;gap:28px;padding:22px 0;border-top:2px solid var(--line);opacity:0">
   <div style="width:80px;height:80px;border-radius:22px;background:#171a13;display:grid;place-items:center;color:var(--lime);flex:none"><svg width="48" viewBox="0 0 120 48">${inner}</svg></div>
   <div style="flex:1"><div style="font:600 38px Inter">${r[0]}</div><div style="font:500 31px Inter;color:var(--muted);margin-top:6px"><b style="color:var(--lime)">${r[1]}</b> · ${r[2]}</div></div>
   <div class="mono muted" style="font-size:26px">${r[3]}</div></div>`).join('')}</div>`; }
function renderDayCard(id,t,a,out){ rv('#'+id,t,a,.6,80,out); $$(`#${id} .xrow`).forEach((r,i)=>rv(r,t,a+.3+i*.28,.45,30)); }

// generic headline helper: <div class="h disp" id=..> lines </div>, reveal lines staggered
function heads(t,id,a,out){ $$(`#${id}>div`).forEach((d,i)=>rv(d,t,a+i*.12,.5,50,out,.3)); }
