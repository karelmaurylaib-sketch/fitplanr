"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import type { Anim } from "@/lib/engine/exercises";

// Short, silent form loops: a side-view figure moving between two key poses.
type P = [number, number];
type Pose = { head: P; neck: P; hip: P; knee: P; ankle: P; elbow: P; wrist: P; knee2?: P; ankle2?: P };

const STAND: Pose = { head: [50, 18], neck: [50, 27], hip: [50, 54], knee: [51, 71], ankle: [50, 88], elbow: [51, 41], wrist: [52, 54] };

const POSES: Record<Anim, { a: Pose; b: Pose; prop?: "bench" | "floor-bench" | "bar"; tool?: "db" | "none" }> = {
  squat: {
    a: { ...STAND, elbow: [55, 38], wrist: [55, 31] },
    b: { head: [47, 40], neck: [48, 48], hip: [37, 67], knee: [59, 68], ankle: [50, 88], elbow: [58, 56], wrist: [58, 50] },
  },
  hinge: {
    a: STAND,
    b: { head: [74, 36], neck: [67, 39], hip: [43, 54], knee: [49, 71], ankle: [48, 88], elbow: [66, 52], wrist: [64, 66] },
  },
  lunge: {
    a: { ...STAND, knee2: [49, 71], ankle2: [48, 88] },
    b: { head: [50, 30], neck: [50, 39], hip: [48, 64], knee: [64, 70], ankle: [64, 88], elbow: [50, 52], wrist: [50, 64], knee2: [40, 84], ankle2: [27, 86] },
  },
  pressFlat: {
    a: { head: [22, 60], neck: [30, 62], hip: [60, 62], knee: [74, 54], ankle: [80, 88], elbow: [31, 46], wrist: [31, 32] },
    b: { head: [22, 60], neck: [30, 62], hip: [60, 62], knee: [74, 54], ankle: [80, 88], elbow: [24, 68], wrist: [31, 54] },
    prop: "bench",
  },
  pressUp: {
    a: { ...STAND, elbow: [58, 36], wrist: [56, 25] },
    b: { ...STAND, elbow: [52, 13], wrist: [51, 2] },
  },
  row: {
    a: { head: [72, 36], neck: [65, 40], hip: [42, 54], knee: [48, 71], ankle: [46, 88], elbow: [65, 54], wrist: [65, 67] },
    b: { head: [72, 36], neck: [65, 40], hip: [42, 54], knee: [48, 71], ankle: [46, 88], elbow: [52, 41], wrist: [58, 53] },
  },
  pulldown: {
    a: { ...STAND, elbow: [53, 12], wrist: [54, 1] },
    b: { ...STAND, elbow: [59, 38], wrist: [58, 25] },
    prop: "bar",
    tool: "none",
  },
  curl: {
    a: STAND,
    b: { ...STAND, wrist: [60, 31] },
  },
  extension: {
    a: { ...STAND, elbow: [55, 8], wrist: [45, 16] },
    b: { ...STAND, elbow: [55, 8], wrist: [56, -4] },
  },
  raise: {
    a: STAND,
    b: { ...STAND, elbow: [62, 33], wrist: [73, 28] },
  },
  pushup: {
    a: { head: [21, 50], neck: [28, 54], hip: [56, 64], knee: [70, 71], ankle: [86, 80], elbow: [29, 69], wrist: [30, 84] },
    b: { head: [21, 69], neck: [28, 72], hip: [56, 75], knee: [70, 77], ankle: [86, 80], elbow: [39, 72], wrist: [30, 84] },
    tool: "none",
  },
  bridge: {
    a: { head: [16, 80], neck: [24, 82], hip: [52, 84], knee: [66, 66], ankle: [74, 86], elbow: [34, 86], wrist: [44, 86] },
    b: { head: [16, 80], neck: [24, 81], hip: [52, 66], knee: [69, 63], ankle: [74, 86], elbow: [34, 86], wrist: [44, 86] },
    tool: "none",
  },
  plank: {
    a: { head: [21, 64], neck: [28, 67], hip: [56, 71], knee: [70, 75], ankle: [86, 82], elbow: [29, 82], wrist: [40, 84] },
    b: { head: [21, 63], neck: [28, 66], hip: [56, 69], knee: [70, 74], ankle: [86, 82], elbow: [29, 82], wrist: [40, 84] },
    tool: "none",
  },
  calf: {
    a: STAND,
    b: { head: [50, 13], neck: [50, 22], hip: [50, 49], knee: [51, 66], ankle: [50, 83], elbow: [51, 36], wrist: [52, 49] },
  },
};

function lerp(a: P, b: P, t: number): P {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function mix(a: Pose, b: Pose, t: number): Pose {
  const out = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => {
    const av = a[k] as P;
    const bv = (b[k] ?? a[k]) as P;
    if (av) out[k] = lerp(av, bv, t);
  });
  return out;
}

export function FormAnim({ anim, className, playing = true, period = 2600 }: { anim: Anim; className?: string; playing?: boolean; period?: number }) {
  const reduce = useReducedMotion();
  const def = POSES[anim] ?? POSES.squat;
  const [t, setT] = useState(0);
  const raf = useRef(0);
  const box = useRef<SVGSVGElement>(null);
  const visible = useInView(box);

  useEffect(() => {
    if (reduce || !playing || !visible) return;
    const start = performance.now();
    const loop = (now: number) => {
      const x = ((now - start) % period) / period;
      // ease in-out, hold a beat at each end
      const s = x < 0.5 ? x * 2 : 2 - x * 2;
      const e = Math.min(1, Math.max(0, (s - 0.1) / 0.8));
      setT(e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [reduce, playing, period, visible]);

  const p = mix(def.a, def.b, reduce ? 0.6 : t);
  const line = (a?: P, b?: P, w = 4.2, color = "var(--fg)") =>
    a && b ? <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={w} strokeLinecap="round" /> : null;
  const tool = def.tool ?? "db";

  return (
    <svg ref={box} viewBox="0 -6 100 100" className={className} role="img" aria-label="Form animation">
      <line x1="6" y1="89.5" x2="94" y2="89.5" stroke="rgb(255 255 255 / 0.12)" strokeWidth="1" />
      {def.prop === "bench" && <rect x="14" y="66" width="52" height="5" rx="2" fill="rgb(255 255 255 / 0.16)" />}
      {def.prop === "bench" && <rect x="36" y="71" width="4" height="18" fill="rgb(255 255 255 / 0.1)" />}
      {def.prop === "bar" && <line x1="30" y1="0" x2="76" y2="0" stroke="rgb(255 255 255 / 0.3)" strokeWidth="2.4" strokeLinecap="round" />}
      {/* back leg */}
      {line(p.hip, p.knee2, 4.2, "rgb(244 245 240 / 0.45)")}
      {line(p.knee2, p.ankle2, 4.2, "rgb(244 245 240 / 0.45)")}
      {/* body */}
      {line(p.neck, p.hip, 5)}
      {line(p.hip, p.knee)}
      {line(p.knee, p.ankle)}
      {line(p.ankle, [p.ankle[0] + 6, p.ankle[1]], 3.6)}
      {line(p.neck, p.elbow, 3.8)}
      {line(p.elbow, p.wrist, 3.8)}
      <circle cx={p.head[0]} cy={p.head[1]} r="5.6" fill="var(--fg)" />
      {tool === "db" && (
        <g transform={`translate(${p.wrist[0]} ${p.wrist[1]})`}>
          <rect x="-5.5" y="-1.6" width="11" height="3.2" rx="1.2" fill="var(--lime)" />
          <rect x="-6.5" y="-3.4" width="3" height="6.8" rx="1" fill="var(--lime)" />
          <rect x="3.5" y="-3.4" width="3" height="6.8" rx="1" fill="var(--lime)" />
        </g>
      )}
      {/* moving joint highlight */}
      <circle cx={anim === "bridge" || anim === "squat" || anim === "hinge" || anim === "lunge" ? p.hip[0] : p.wrist[0]} cy={anim === "bridge" || anim === "squat" || anim === "hinge" || anim === "lunge" ? p.hip[1] : p.wrist[1]} r="2.2" fill="var(--lime)" opacity={tool === "db" && !["bridge", "squat", "hinge", "lunge"].includes(anim) ? 0 : 0.9} />
    </svg>
  );
}
