// Draws the meal plate the fake camera "sees" (no photo generation available), saved as a PNG.
import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: 960, height: 960 } });
await p.setContent(`<html><body style="margin:0;background:#2a1d14">
<svg width="960" height="960" viewBox="0 0 960 960" xmlns="http://www.w3.org/2000/svg">
<defs>
 <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0.3">
  <stop offset="0" stop-color="#3b2a1d"/><stop offset=".5" stop-color="#4a3424"/><stop offset="1" stop-color="#2f2118"/></linearGradient>
 <radialGradient id="plate" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#fbfaf6"/><stop offset=".8" stop-color="#e9e6de"/><stop offset="1" stop-color="#cfcabf"/></radialGradient>
 <radialGradient id="rim" cx=".5" cy=".5" r=".5"><stop offset=".86" stop-color="#00000000"/><stop offset=".93" stop-color="#0000001f"/><stop offset="1" stop-color="#00000000"/></radialGradient>
 <linearGradient id="chick" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3b57a"/><stop offset=".5" stop-color="#c98e4f"/><stop offset="1" stop-color="#a8703a"/></linearGradient>
 <radialGradient id="rice" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#d9c29c"/><stop offset="1" stop-color="#a98a5e"/></radialGradient>
 <radialGradient id="broc" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#7cc25a"/><stop offset=".6" stop-color="#3f8a2e"/><stop offset="1" stop-color="#245a1b"/></radialGradient>
 <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="10" dy="16" stdDeviation="18" flood-opacity=".45"/></filter>
 <filter id="soft"><feGaussianBlur stdDeviation="1.2"/></filter>
 <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .08 0"/></filter>
</defs>
<rect width="960" height="960" fill="url(#wood)"/>
${Array.from({length:14},(_,i)=>`<path d="M0 ${i*72+20} C 300 ${i*72+40}, 600 ${i*72}, 960 ${i*72+30}" stroke="#00000022" stroke-width="3" fill="none"/>`).join("")}
<circle cx="480" cy="485" r="370" fill="url(#plate)" filter="url(#sh)"/>
<circle cx="480" cy="485" r="370" fill="url(#rim)"/>
<circle cx="480" cy="485" r="300" fill="none" stroke="#00000010" stroke-width="3"/>
<g filter="url(#soft)">
 <!-- rice -->
 <ellipse cx="610" cy="600" rx="175" ry="140" fill="url(#rice)"/>
 ${Array.from({length:260},(_,i)=>{const a=i*2.399,r=Math.sqrt(i/260)*150;const x=610+Math.cos(a)*r*1.15,y=600+Math.sin(a)*r*.9;return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="9" ry="4" transform="rotate(${(i*37)%180} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${i%3?'#e8d6b3':'#c7a979'}" opacity=".9"/>`}).join("")}
 <!-- chicken slices -->
 ${[0,1,2,3,4].map(i=>`<g transform="rotate(${-28+i*4} 360 330) translate(${i*62} ${i*14})"><rect x="230" y="230" width="70" height="230" rx="30" fill="url(#chick)"/><path d="M245 260 L285 300 M245 320 L285 360 M245 380 L285 420" stroke="#7a4a1f" stroke-width="9" stroke-linecap="round" opacity=".55"/></g>`).join("")}
 <!-- broccoli -->
 ${[[330,640],[260,560],[400,720],[300,730],[230,660]].map(([x,y],k)=>`<g><rect x="${x-10}" y="${y+20}" width="22" height="55" rx="9" fill="#8fbf5f" transform="rotate(${k*25-30} ${x} ${y+40})"/>${Array.from({length:9},(_,j)=>{const a=j*0.7,r=20+(j%3)*12;return `<circle cx="${(x+Math.cos(a)*r).toFixed(1)}" cy="${(y+Math.sin(a)*r*.8).toFixed(1)}" r="${22-(j%3)*3}" fill="url(#broc)"/>`}).join("")}</g>`).join("")}
</g>
<rect width="960" height="960" filter="url(#grain)"/>
</svg></body></html>`);
await p.screenshot({ path: "video/build/plate.png" });
await b.close();
