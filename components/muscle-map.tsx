"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { MUSCLES, MUSCLE_NAME, heat, type Muscle, type MuscleLoad } from "@/lib/engine/muscles";
import { cn } from "@/lib/utils";

const EASE = [0.22, 0.8, 0.24, 1] as const;
const FILL = ["rgb(255 255 255 / 0.07)", "rgb(200 255 61 / 0.32)", "rgb(200 255 61 / 0.62)", "#C8FF3D"];
const BODY = "rgb(255 255 255 / 0.035)";
const LINE = "rgb(255 255 255 / 0.12)";
const MIRROR = "matrix(-1 0 0 1 120 0)";

export type MapScope = { key: string; label: string; scope: "day" | "week"; load: MuscleLoad };

/** Front + back body; muscles light up by how much the chosen day or week trains them. Tap a muscle (or a row). */
export function MuscleMap({ scopes, className }: { scopes: MapScope[]; className?: string }) {
  const [k, setK] = useState(0);
  const cur = scopes[k];
  const ranked = MUSCLES.slice().sort((a, b) => cur.load[b].sets - cur.load[a].sets);
  const [sel, setSel] = useState<Muscle | null>(null);
  const picked: Muscle = sel ?? ranked[0];
  const max = Math.max(1, ...MUSCLES.map((m) => cur.load[m].sets));
  const missing = cur.scope === "week" ? MUSCLES.filter((m) => cur.load[m].sets < 0.5) : [];

  return (
    <div className={className}>
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1" role="tablist" aria-label="Muscle map scope">
        {scopes.map((s, i) => (
          <button
            key={s.key}
            role="tab"
            aria-selected={i === k}
            onClick={() => (setK(i), setSel(null))}
            className={cn("press h-9 shrink-0 whitespace-nowrap rounded-full px-3.5 text-[13px] font-semibold", i === k ? "bg-lime text-lime-ink" : "bg-white/[0.06] text-muted hover:text-fg")}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid items-center gap-6 sm:grid-cols-[1fr_1fr]">
        <div className="grid grid-cols-2 gap-2">
          {(["front", "back"] as const).map((side) => (
            <figure key={side} className="text-center">
              <Body side={side} load={cur.load} scope={cur.scope} picked={picked} onPick={setSel} />
              <figcaption className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{side}</figcaption>
            </figure>
          ))}
        </div>

        <div>
          <AnimatePresence mode="wait">
            <motion.div key={`${cur.key}-${picked}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }} className="rounded-2xl border border-lime/30 bg-lime/[0.05] p-4" aria-live="polite">
              <div className="flex items-baseline justify-between gap-3">
                <div className="display text-[26px]">{MUSCLE_NAME[picked]}</div>
                <div className="font-display text-[26px] font-bold tabular-nums text-lime">
                  {cur.load[picked].sets}
                  <span className="ml-1 font-sans text-[12px] font-medium text-muted">sets</span>
                </div>
              </div>
              <p className="mt-1 text-[13px] text-muted">{cur.load[picked].moves.length ? cur.load[picked].moves.slice(0, 3).join(" · ") : `Not trained ${cur.scope === "week" ? "this week" : "today"}`}</p>
            </motion.div>
          </AnimatePresence>
          <ul className="mt-3 space-y-1">
            {ranked.map((m) => (
              <li key={m}>
                <button onClick={() => setSel(m)} className={cn("press flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-[13px]", m === picked ? "bg-white/[0.06]" : "hover:bg-white/[0.03]")}>
                  <span className="w-24 shrink-0 truncate">{MUSCLE_NAME[m]}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                    <motion.span className="block h-full rounded-full bg-lime" initial={false} animate={{ width: `${(cur.load[m].sets / max) * 100}%`, opacity: cur.load[m].sets ? 1 : 0 }} transition={{ duration: 0.6, ease: EASE }} />
                  </span>
                  <span className="w-8 shrink-0 text-right tabular-nums text-muted">{cur.load[m].sets}</span>
                </button>
              </li>
            ))}
          </ul>
          {cur.scope === "week" && (
            <p className="mt-3 text-[12px] text-dim">
              {missing.length ? `Not hit this week: ${missing.map((m) => MUSCLE_NAME[m]).join(", ")}.` : "Every muscle group gets work this week."} Beginners grow well on about 6–12 hard sets per muscle a week.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Body({ side, load, scope, picked, onPick }: { side: "front" | "back"; load: MuscleLoad; scope: "day" | "week"; picked: Muscle; onPick: (m: Muscle) => void }) {
  const reduce = useReducedMotion();
  // a plain function (not a component) so fills keep their element and animate between scopes
  const M = ({ m, children, mirror = true }: { m: Muscle; children: React.ReactNode; mirror?: boolean }) => {
    const h = heat(load[m].sets, scope);
    const props = {
      fill: FILL[h],
      stroke: m === picked ? "#F4F5F0" : "rgb(0 0 0 / 0.5)",
      strokeWidth: m === picked ? 1.4 : 0.6,
      style: { transition: "fill .5s cubic-bezier(.22,.8,.24,1), stroke .2s", cursor: "pointer", filter: h === 3 ? "drop-shadow(0 0 4px rgb(200 255 61 / .55))" : undefined },
      onClick: () => onPick(m),
    };
    return (
      <g key={m} role="button" aria-label={`${MUSCLE_NAME[m]}: ${load[m].sets} sets`} tabIndex={-1} {...props}>
        {children}
        {mirror && <g transform={MIRROR}>{children}</g>}
      </g>
    );
  };
  return (
    <motion.svg viewBox="0 0 120 250" className="mx-auto h-auto w-full max-w-[150px]" initial={reduce ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: EASE }} role="img" aria-label={`Muscle map, ${side}`}>
      {/* silhouette */}
      <g fill={BODY} stroke={LINE} strokeWidth="0.8">
        <circle cx="60" cy="17" r="11" />
        <rect x="54.5" y="27" width="11" height="8" rx="3" />
        <path d="M60 34 L40 37 Q30 40 29 52 L25 96 Q24 112 22 122 L30 123 L35 98 L38 72 L42 106 L41 118 Q38 150 41 162 L44 200 L42 232 L52 234 L55 200 L57 162 L59 124 L61 124 L63 162 L65 200 L68 234 L78 232 L76 200 L79 162 Q82 150 79 118 L78 106 L82 72 L85 98 L90 123 L98 122 Q96 112 95 96 L91 52 Q90 40 80 37 Z" />
      </g>
      {side === "front" ? (
        <>
          {M({ m: "shoulders", children: <><ellipse cx="37" cy="45" rx="8" ry="8.5" /></> })}
          {M({ m: "chest", children: <><path d="M59 41 L45 42 Q39 48 41 58 Q48 65 59 61 Z" /></> })}
          {M({ m: "biceps", children: <><ellipse cx="33" cy="64" rx="5" ry="11" /></> })}
          {M({ m: "abs", mirror: false, children: <>
            <rect x="50" y="64" width="20" height="40" rx="6" />
            <path d="M50 77 H70 M50 90 H70 M60 65 V103" stroke="rgb(0 0 0 / .45)" strokeWidth=".8" fill="none" />
          </> })}
          {M({ m: "quads", children: <><path d="M44 112 Q39 136 43 160 L56 160 Q59 136 58 116 Z" /></> })}
        </>
      ) : (
        <>
          {M({ m: "traps", mirror: false, children: <><path d="M60 31 L45 40 L52 50 L60 62 L68 50 L75 40 Z" /></> })}
          {M({ m: "shoulders", children: <><ellipse cx="37" cy="45" rx="8" ry="8.5" /></> })}
          {M({ m: "lats", children: <><path d="M45 47 Q39 60 45 82 L58 80 L58 62 L51 51 Z" /></> })}
          {M({ m: "triceps", children: <><ellipse cx="33" cy="64" rx="5" ry="11" /></> })}
          {M({ m: "lowerback", mirror: false, children: <><rect x="51" y="82" width="18" height="20" rx="5" /></> })}
          {M({ m: "glutes", children: <><ellipse cx="51.5" cy="114" rx="9" ry="10" /></> })}
          {M({ m: "hamstrings", children: <><path d="M43 126 Q40 145 44 162 L56 162 Q59 145 58 126 Z" /></> })}
          {M({ m: "calves", children: <><ellipse cx="50" cy="188" rx="6.5" ry="15" /></> })}
        </>
      )}
    </motion.svg>
  );
}
