// Shared compositor for batch-2 demo reels. Page sets window.CFG = {name, opts, caps:[7 captions]} and loads <name>-meta.js.
document.querySelector('.stage').insertAdjacentHTML('beforeend', `
<div id="caps"></div><div id="phone"><img id="scr"></div><div id="speed" class="mono"></div><div id="endwrap"></div>`);
const { S: SEG, END } = CFG.segs ? segsFromList(CFG.segs) : buildSegs(META, CFG.opts || {});
window.DURATION = END + 3.4;
$('#caps').innerHTML = CFG.caps.map((c, i) => `<div class="cap disp" id="k${i}">${c}</div>`).join('');
$('#endwrap').innerHTML = endCardFit();
const F = META.frames; const idx = ms => { let lo = 0, hi = F.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (F[m] <= ms) lo = m; else hi = m - 1; } return lo; };
const img = $('#scr'); let cur = -1;
window.render = async (t) => {
  const tt = Math.min(t, END - 1e-3); const s = SEG.find(s => tt >= s.o0 && tt < s.o1) || SEG[SEG.length - 1];
  const i = idx((s[0] + (tt - s.o0) * s[2]) * 1000);
  if (i !== cur) { cur = i; img.src = CFG.name + '-frames/' + String(i).padStart(5, '0') + '.jpg'; await img.decode(); }
  SEG.forEach((q, k) => { const o = k == SEG.length - 1 ? END : q.o1; rv('#k' + k, t, q.o0, .35, 40, o - .18, .18); });
  const sp = s[2] >= 1.5 && t < END; const sb = $('#speed'); sb.textContent = '▶▶ ' + (+s[2].toFixed(1)) + '×'; sb.style.display='none';
  const ph = $('#phone'); const ep = eio(seg(t, END, END + .5)); const ip = eo(seg(t, 0, .5));
  ph.style.transform = `translateY(${(1 - ip) * 120 + ep * 500}px) scale(${1 - .05 * ep})`; ph.style.opacity = ip * (1 - ep);
  if (t >= END) renderEndFit(t, END + .1); else $('#endf').style.opacity = 0;
};
