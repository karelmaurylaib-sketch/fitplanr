const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const seg=(t,a,b)=>clamp((t-a)/(b-a));
const eo=x=>1-Math.pow(1-x,3.2);                    // ease-out like cubic-bezier(.22,.8,.24,1)
const eio=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const back=x=>{const c=1.70158,c3=c+1;return 1+c3*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
// reveal: fade+rise in at [a,a+d], optional out at [o,o+od]
function rv(el,t,a,d=.5,rise=40,o=null,od=.3){ if(typeof el==='string') el=$(el); if(!el) return;
  let p=eo(seg(t,a,a+d)); let q=o==null?0:eio(seg(t,o,o+od));
  el.style.opacity=p*(1-q); el.style.transform=`translateY(${(1-p)*rise - q*30}px)`; }
const LOGO=`<svg viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="#C8FF3D"/><path d="M8 22.5 L14 16.5 L18 19.5 L24.5 11" stroke="#0A0D02" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><rect x="5.5" y="20" width="4" height="6" rx="1.2" transform="rotate(-45 7.5 23)" fill="#0A0D02"/><rect x="22.5" y="7.5" width="4" height="6" rx="1.2" transform="rotate(-45 24.5 10.5)" fill="#0A0D02"/></svg>`;
const ARROW=`<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const DUMBBELL=`<svg viewBox="0 0 120 48"><rect x="4" y="10" width="14" height="28" rx="4" fill="currentColor"/><rect x="18" y="4" width="14" height="40" rx="4" fill="currentColor"/><rect x="32" y="20" width="56" height="8" rx="3" fill="currentColor"/><rect x="88" y="4" width="14" height="40" rx="4" fill="currentColor"/><rect x="102" y="10" width="14" height="28" rx="4" fill="currentColor"/></svg>`;
function endCard(){ return `<div id="end" class="abs" style="inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:64px;opacity:0;padding-bottom:160px;transform-origin:50% 45%">
  <div style="display:flex;align-items:center;gap:26px"><div style="width:108px;height:108px">${LOGO}</div><div class="disp" style="font-size:104px">FitPlanr</div></div>
  <div class="disp" style="font-size:104px;text-align:center;line-height:.98">Your 4-week plan<br><span class="lime">in 60 seconds.</span></div>
  <div class="pill" id="endpill">Build my plan <span class="arr">${ARROW}</span></div>
  <div class="mono muted" style="font-size:30px">Free to try · No card · Link in bio</div></div>`; }
function renderEnd(t,a){ const e=$('#end'); const p=eo(seg(t,a,a+.6)); e.style.opacity=p; e.style.transform=`scale(${.94+.06*p})`;
  const pl=$('#endpill'); const br=Math.sin((t-a)*3.2)*.5+.5; pl.style.boxShadow=`0 0 ${50+50*br}px rgb(200 255 61/${.3+.3*br})`; pl.querySelector('.arr').style.transform=`translateX(${Math.sin((t-a)*5)*6}px)`; }
