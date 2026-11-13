// Build time-remapped segments from recorder marks. Shared by the compositor page and node.
function buildSegs(meta, o) {
  const m = Object.fromEntries(meta.marks.map(([k, v]) => [k, v / 1000]));
  const L = m.landing, Q = m.questions, G = m.gear, B = m.building, P = m.plan, C = m.closed, E = m.end;
  const S = [
    [L, L + 3.8, 1.6], [L + 3.8, Q, 4], [Q, G, o.qSpeed || 2.6], [G, B + 0.2, 1.5],
    [B + 0.2, P, 2], [P + (o.planIn || 0.9), P + 2.6, 1], [C + 0.1, E, 1.25],
  ];
  let acc = 0; S.forEach(s => { s.o0 = acc; acc += (s[1] - s[0]) / s[2]; s.o1 = acc; });
  return { S, END: acc };
}
// explicit segments: [[srcStart, srcEnd, speed], ...]
function segsFromList(list) {
  const S = list.map(x => x.slice()); let acc = 0;
  S.forEach(s => { s.o0 = acc; acc += (s[1] - s[0]) / s[2]; s.o1 = acc; });
  return { S, END: acc };
}
if (typeof module !== 'undefined') module.exports = { buildSegs };
