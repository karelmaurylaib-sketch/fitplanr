"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";
import { fmtLb, shortDate, type Projection } from "@/lib/projection";
import { sendEvent } from "@/lib/device";
import { cn } from "@/lib/utils";

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function list(days: string[]) {
  if (days.length <= 1) return days.join("");
  return `${days.slice(0, -1).join(", ")} and ${days[days.length - 1]}`;
}

/** The micro-commitment card at the top of the paywall: the journey so far, the first week, one small "yes". */
export function Commitment({ p }: { p: Projection }) {
  const reduce = useReducedMotion();
  const [yes, setYes] = useState(false);
  const journey = [
    { t: "Your gear", done: true },
    { t: "Your plan", done: true },
    { t: "Day 1", done: yes },
  ];
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 0.8, 0.24, 1], delay: 0.1 }}
      className="rounded-[22px] bg-paper p-5 text-ink shadow-[0_20px_60px_-30px_rgb(200_255_61/0.5)]"
    >
      <ol className="flex items-center gap-2" aria-label="Your journey">
        {journey.map((s, k) => (
          <li key={s.t} className="flex flex-1 items-center gap-2 last:flex-none">
            <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300", s.done ? "border-ink bg-ink text-lime" : "border-ink/30")}>
              {s.done && <Check size={11} strokeWidth={3.5} />}
            </span>
            <span className="whitespace-nowrap text-[12px] font-semibold">{s.t}</span>
            {k < journey.length - 1 && <span className={cn("h-[2px] flex-1 rounded-full", journey[k + 1].done || k === 0 ? "bg-ink" : "bg-ink/15")} />}
          </li>
        ))}
      </ol>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/55">Your first week</div>
          {p.day1 && (
            <div className="mt-1 text-[15px] font-semibold">
              Day 1 · {p.weekdays[0]} — {p.day1.name}, {p.day1.minutes} min
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <div className="font-display text-[26px] font-bold leading-none tabular-nums">
            +{fmtLb(p.muscleLo)}–{fmtLb(p.muscleHi)} lb
          </div>
          <div className="text-[11px] text-ink/60">muscle by {shortDate(p.week12)}*</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1.5" aria-label="Training days">
        {WEEK.map((d) => {
          const on = p.weekdays.includes(d);
          return (
            <span key={d} className={cn("flex h-9 items-center justify-center rounded-[10px] text-[12px] font-semibold", on ? "bg-ink text-lime" : "bg-ink/[0.06] text-ink/40")}>
              {d.slice(0, 2)}
            </span>
          );
        })}
      </div>

      <button
        onClick={() => {
          if (!yes) sendEvent("feature_used", "paywall_commitment");
          setYes(!yes);
        }}
        aria-pressed={yes}
        className={cn("press mt-4 flex w-full items-center gap-3 rounded-[16px] border-2 px-4 py-3.5 text-left text-[15px] font-semibold transition-colors", yes ? "border-ink bg-ink text-paper" : "border-ink/15 hover:border-ink/35")}
      >
        <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] border-2 transition-colors", yes ? "border-lime bg-lime text-lime-ink" : "border-ink/30")}>
          {yes && (
            <motion.span initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}>
              <Check size={14} strokeWidth={3.5} />
            </motion.span>
          )}
        </span>
        {yes ? `You're in: ${list(p.weekdays)}.` : `I'll train ${list(p.weekdays)}`}
      </button>
    </motion.div>
  );
}

/** Trial timeline, only shown when the plan really has a trial. */
export function TrialTimeline({ days, price }: { days: number; price: string }) {
  const rows = [
    { t: "Today", d: "Your full plan unlocks. $0 due today." },
    { t: `Day ${days}`, d: `${price} starts. Cancel before and you pay nothing.` },
  ];
  return (
    <ol className="relative space-y-4 rounded-[20px] border border-line bg-card p-5">
      {rows.map((r, k) => (
        <li key={r.t} className="relative flex gap-3.5">
          {k < rows.length - 1 && <span className="absolute -bottom-[18px] left-[7px] top-[20px] w-[2px] rounded-full bg-gradient-to-b from-lime to-white/20" aria-hidden />}
          <span className={cn("z-[1] mt-0.5 h-4 w-4 shrink-0 rounded-full border-2", k === 0 ? "border-lime bg-lime" : "border-white/30 bg-card")} />
          <span>
            <span className="block text-[15px] font-semibold">{r.t}</span>
            <span className="text-[14px] text-muted">{r.d}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
