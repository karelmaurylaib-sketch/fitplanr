"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 0.8, 0.24, 1] as const;

/** Estimated lean mass, week 0 → 12: a lime line over a soft band (the low–high range). */
export function ProjectionChart({ curve, lo, hi, labels, className, height = 132 }: { curve: number[]; lo: number; hi: number; labels: [string, string, string]; className?: string; height?: number }) {
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, "");
  // drawn at its real size (no SVG scaling), so the line's draw-in animation stays exact at any width
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(320);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(120, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = height;
  const pad = 8;
  const max = hi * 1.08 || 1;
  const n = curve.length - 1;
  const x = (i: number) => pad + (i / n) * (W - pad * 2);
  const y = (v: number) => H - pad - (v / max) * (H - pad * 2);
  const mid = curve[n] || 1;
  const pts = curve.map((v, i) => [x(i), y(v)] as const);
  const line = pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
  const top = curve.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y((v * hi) / mid).toFixed(1)}`).join(" ");
  const bottom = [...curve].reverse().map((v, k) => `L${x(n - k).toFixed(1)},${y((v * lo) / mid).toFixed(1)}`).join(" ");
  const [ex, ey] = pts[n];
  const w4 = x(4);

  return (
    <div ref={box} className={cn("relative", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="block overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={`band-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c8ff3d" stopOpacity="0.28" />
            <stop offset="1" stopColor="#c8ff3d" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={pad} x2={W - pad} y1={pad + g * (H - pad * 2)} y2={pad + g * (H - pad * 2)} stroke="rgb(255 255 255 / 0.06)" strokeDasharray="2 4" />
        ))}
        <line x1={w4} x2={w4} y1={pad} y2={H - pad} stroke="rgb(255 255 255 / 0.16)" strokeDasharray="3 3" />
        <motion.path d={`${top} ${bottom} Z`} fill={`url(#band-${id})`} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }} />
        <motion.path
          d={line}
          fill="none"
          stroke="#c8ff3d"
          strokeWidth={2.5}
          strokeLinecap="round"
         
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.3, ease: EASE, delay: 0.15 }}
        />
      </svg>
      <motion.span
        className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime shadow-[0_0_0_5px_rgb(200_255_61/0.18),0_0_24px_rgb(200_255_61/0.7)]"
        style={{ left: ex, top: ey }}
        initial={reduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12, delay: 1.35 }}
      />
      <div className="relative mt-2 h-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        <span className="absolute left-0">{labels[0]}</span>
        <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: w4 }}>{labels[1]}</span>
        <span className="absolute right-0 text-lime">{labels[2]}</span>
      </div>
    </div>
  );
}

/** One dumbbell, drawn: the plates grow with the load. */
export function Bell({ lb, max, lit }: { lb: number; max: number; lit?: boolean }) {
  const h = 18 + Math.min(1, lb / Math.max(max, 1)) * 22;
  const c = lit ? "#c8ff3d" : "rgb(255 255 255 / 0.55)";
  return (
    <svg viewBox="0 0 72 44" className="h-11 w-[72px]" aria-hidden>
      <rect x="14" y="20" width="44" height="4" rx="2" fill={c} opacity="0.7" />
      <rect x={8} y={22 - h / 2} width="8" height={h} rx="2.5" fill={c} />
      <rect x={56} y={22 - h / 2} width="8" height={h} rx="2.5" fill={c} />
      <rect x={3} y={22 - h / 2 + 4} width="5" height={h - 8} rx="2" fill={c} opacity="0.75" />
      <rect x={64} y={22 - h / 2 + 4} width="5" height={h - 8} rx="2" fill={c} opacity="0.75" />
    </svg>
  );
}

/** "25 lb → 30 lb": the plate/dumbbell load bar. */
export function LoadBar({ from, to, fromLabel, toLabel }: { from: number; to: number; fromLabel: string; toLabel: string }) {
  const reduce = useReducedMotion();
  const max = Math.max(from, to, 1);
  const up = to > from;
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center">
        <Bell lb={from} max={max} />
        <span className="mt-1 font-display text-[22px] font-bold tabular-nums">{fromLabel}</span>
      </div>
      <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
        <motion.div className="absolute inset-y-0 left-0 rounded-full bg-lime" initial={reduce ? false : { width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.1, ease: EASE, delay: 0.3 }} />
      </div>
      <div className="flex flex-col items-center">
        <Bell lb={to} max={max} lit />
        <span className={cn("mt-1 font-display text-[22px] font-bold tabular-nums", up && "text-lime")}>{toLabel}</span>
      </div>
    </div>
  );
}
