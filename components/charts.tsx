"use client";

import { motion, useReducedMotion } from "framer-motion";

/** A minimal line chart: lime line, soft area, last value labelled. */
export function LineChart({ points, unit = "lb", height = 140 }: { points: { x: string; y: number }[]; unit?: string; height?: number }) {
  const reduce = useReducedMotion();
  if (points.length < 2)
    return <div className="flex h-[140px] items-center justify-center rounded-2xl border border-dashed border-line text-[14px] text-muted">Log 2 workouts to see your line climb.</div>;
  const W = 600;
  const H = height;
  const pad = { t: 16, r: 44, b: 22, l: 8 };
  const ys = points.map((p) => p.y);
  const min = Math.min(...ys) * 0.95;
  const max = Math.max(...ys) * 1.05 || 1;
  const sx = (i: number) => pad.l + (i / (points.length - 1)) * (W - pad.l - pad.r);
  const sy = (v: number) => pad.t + (1 - (v - min) / (max - min || 1)) * (H - pad.t - pad.b);
  const d = points.map((p, i) => `${i ? "L" : "M"}${sx(i).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");
  const area = `${d} L${sx(points.length - 1)},${H - pad.b} L${sx(0)},${H - pad.b} Z`;
  const last = points[points.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Trend, latest ${last.y} ${unit}`}>
      <defs>
        <linearGradient id="fp-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#C8FF3D" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#C8FF3D" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={pad.l} x2={W - pad.r} y1={pad.t + g * (H - pad.t - pad.b)} y2={pad.t + g * (H - pad.t - pad.b)} stroke="rgb(255 255 255 / 0.06)" />
      ))}
      <path d={area} fill="url(#fp-area)" />
      <motion.path d={d} fill="none" stroke="#C8FF3D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: [0.22, 0.8, 0.24, 1] }} />
      <circle cx={sx(points.length - 1)} cy={sy(last.y)} r="5" fill="#C8FF3D" />
      <text x={sx(points.length - 1) + 9} y={sy(last.y) + 4} fill="#F4F5F0" fontSize="13" fontWeight="600">
        {last.y}
      </text>
      <text x={pad.l} y={H - 4} fill="#8A8F82" fontSize="11">{points[0].x}</text>
      <text x={W - pad.r} y={H - 4} fill="#8A8F82" fontSize="11" textAnchor="end">{last.x}</text>
    </svg>
  );
}
