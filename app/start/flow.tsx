"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import { GEAR_LABELS, type Gear } from "@/lib/engine/exercises";
import type { Answers } from "@/lib/engine/generate";
import { cn } from "@/lib/utils";

type A = Partial<Answers>;

type Opt = { v: string | number; label: string; line: string };
type Q =
  | { key: "goal" | "level" | "days" | "minutes"; kind: "single"; text: (a: A) => string; opts: (a: A) => Opt[] }
  | { key: "protect"; kind: "multi"; text: (a: A) => string; opts: (a: A) => Opt[]; optional: true }
  | { key: "gear"; kind: "gear"; text: (a: A) => string };

const GOAL_WORD: Record<string, string> = { muscle: "building muscle", strength: "getting stronger", fatloss: "losing fat and keeping muscle", fit: "getting fit" };

const QUESTIONS: Q[] = [
  {
    key: "goal",
    kind: "single",
    text: () => "What do you want from the gym?",
    opts: () => [
      { v: "muscle", label: "Build muscle", line: "8–12 reps on the big moves: the sweet spot for size." },
      { v: "strength", label: "Get stronger", line: "Heavier sets of 5–8, longer rest between them." },
      { v: "fatloss", label: "Lose fat, keep muscle", line: "Lifting stays in, rest gets shorter. Food does the rest." },
      { v: "fit", label: "Get fit and feel better", line: "Full-body moves, moderate reps, no burnout." },
    ],
  },
  {
    key: "level",
    kind: "single",
    text: (a) => `Got it: ${GOAL_WORD[a.goal ?? "muscle"]}. How much lifting have you done?`,
    opts: () => [
      { v: "new", label: "Never really", line: "Week 1 teaches the moves with light weights." },
      { v: "some", label: "A few months", line: "You'll start a bit heavier, with the same safe ramp." },
      { v: "year", label: "Over a year, on and off", line: "More sets per move, and a faster climb." },
    ],
  },
  {
    key: "days",
    kind: "single",
    text: () => "How many days a week can you train?",
    opts: () => [
      { v: 2, label: "2 days", line: "Two full-body days. Every muscle, twice a week." },
      { v: 3, label: "3 days", line: "Full body, every other day: the classic beginner win." },
      { v: 4, label: "4 days", line: "Upper / lower split, each muscle twice a week." },
      { v: 5, label: "5 days", line: "Push, pull, legs, then upper and lower." },
    ],
  },
  {
    key: "minutes",
    kind: "single",
    text: (a) => `${a.days ?? 3} days it is. How long is one workout?`,
    opts: () => [
      { v: 30, label: "30 minutes", line: "4 moves, no wasted time." },
      { v: 45, label: "45 minutes", line: "5 moves, with proper rest." },
      { v: 60, label: "60 minutes", line: "6 moves, room for arms and core." },
    ],
  },
  {
    key: "protect",
    kind: "multi",
    optional: true,
    text: () => "Anything we should go easy on?",
    opts: () => [
      { v: "back", label: "Lower back", line: "No heavy barbell hinges or bent-over rows." },
      { v: "knees", label: "Knees", line: "No lunges or deep loaded squats: box squats instead." },
      { v: "shoulders", label: "Shoulders", line: "No overhead pressing from a barbell, no dips." },
    ],
  },
  { key: "gear", kind: "gear", text: () => "Last one: what do you have, for real?" },
];

const PRESETS: { label: string; gear: Gear[]; dbMax: number }[] = [
  { label: "2 dumbbells", gear: ["dumbbells"], dbMax: 25 },
  { label: "Home + bench", gear: ["adjustable", "bench"], dbMax: 50 },
  { label: "Full gym", gear: ["dumbbells", "adjustable", "barbell", "rack", "bench", "cables", "machines", "pullup"], dbMax: 80 },
  { label: "Bodyweight only", gear: [], dbMax: 0 },
];
const GEAR_ORDER: Gear[] = ["dumbbells", "adjustable", "bench", "barbell", "rack", "pullup", "bands", "kettlebell", "cables", "machines"];

function Typed({ text, onDone }: { text: string; onDone: () => void }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? text.length : 0);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    if (reduce) {
      done.current();
      return;
    }
    setN(0);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setN(i);
      if (i >= text.length) {
        clearInterval(id);
        done.current();
      }
    }, 18);
    return () => clearInterval(id);
  }, [text, reduce]);
  return (
    <h1 className="display min-h-[2.1em] text-[34px] sm:text-[46px]" aria-label={text}>
      <span aria-hidden className={n < text.length ? "caret" : ""}>{text.slice(0, n)}</span>
    </h1>
  );
}

export function StartFlow({ initial, rebuild = false }: { initial: A; rebuild?: boolean }) {
  const router = useRouter();
  const [a, setA] = useState<A>({ protect: [], gear: ["dumbbells"], dbMax: 25, ...initial });
  const [step, setStep] = useState(() => {
    const first = QUESTIONS.findIndex((q) => (initial as Record<string, unknown>)[q.key] === undefined);
    return first === -1 ? QUESTIONS.length - 1 : first;
  });
  const [typed, setTyped] = useState(false);
  const [picked, setPicked] = useState<string | number | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const q = QUESTIONS[step];
  const text = useMemo(() => q.text(a), [q, a]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function save(patch: A) {
    const next = { ...a, ...patch };
    setA(next);
    fetch("/api/answers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) }).catch(() => {});
    return next;
  }

  function go(to: number) {
    if (timer.current) clearTimeout(timer.current);
    setPicked(null);
    setTyped(false);
    setStep(to);
  }

  function single(v: string | number) {
    if (picked !== null) return;
    setPicked(v);
    save({ [q.key]: v } as A);
    timer.current = setTimeout(() => go(step + 1), 1300);
  }

  async function finish() {
    if (busy) return;
    setBusy(true);
    const gear = (a.gear ?? []) as Gear[];
    const dbMax = gear.includes("dumbbells") || gear.includes("adjustable") ? a.dbMax || 25 : 0;
    await fetch("/api/answers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gear, dbMax, protect: a.protect ?? [] }) }).catch(() => {});
    router.push(rebuild ? "/start/building?rebuild=1" : "/start/building");
  }

  const progress = (step + (picked !== null ? 1 : 0)) / QUESTIONS.length;

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-[620px] flex-col px-5 pb-32 pt-5">
      <div className="flex items-center justify-between">
        <Logo size={24} />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          {step + 1} / {QUESTIONS.length}
        </span>
      </div>
      <div className="mt-5 h-[3px] overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
        <motion.div className="h-full rounded-full bg-lime" animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.5, ease: [0.22, 0.8, 0.24, 1] }} />
      </div>
      <div className="mt-4 h-6">
        {step > 0 && (
          <button onClick={() => go(step - 1)} className="press inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
            <ArrowLeft size={15} /> Previous question
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.section key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3, ease: [0.22, 0.8, 0.24, 1] }} className="mt-8">
          <Typed text={text} onDone={() => setTyped(true)} />

          {q.kind !== "gear" && (
            <motion.ul className="mt-8 space-y-2.5" initial={false} animate={{ opacity: typed ? 1 : 0.0001, y: typed ? 0 : 8 }} transition={{ duration: 0.35 }}>
              {q.opts(a).map((o) => {
                const multi = q.kind === "multi";
                const sel = multi ? (a.protect ?? []).includes(o.v as never) : picked === o.v;
                return (
                  <li key={String(o.v)}>
                    <button
                      onClick={() => {
                        if (!multi) return single(o.v);
                        const cur = new Set(a.protect ?? []);
                        if (cur.has(o.v as never)) cur.delete(o.v as never);
                        else cur.add(o.v as never);
                        save({ protect: [...cur] as Answers["protect"] });
                      }}
                      className={cn(
                        "press w-full rounded-[18px] border px-4 py-4 text-left transition-colors sm:px-5",
                        sel ? "border-lime/70 bg-lime/[0.08]" : "border-line bg-card hover:border-line-2 hover:bg-card-2",
                      )}
                      aria-pressed={sel}
                    >
                      <span className="flex items-center gap-3.5">
                        <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors", sel ? "border-lime bg-lime text-lime-ink" : "border-white/25")}>
                          {sel && <Check size={13} strokeWidth={3.5} />}
                        </span>
                        <span className="text-[17px] font-semibold">{o.label}</span>
                      </span>
                      <AnimatePresence initial={false}>
                        {sel && (
                          <motion.span initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="block overflow-hidden">
                            <span className="block pl-[34px] pt-2 text-[14px] leading-snug text-muted">{o.line}</span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          )}

          {q.kind === "gear" && (
            <motion.div initial={false} animate={{ opacity: typed ? 1 : 0.0001, y: typed ? 0 : 8 }} transition={{ duration: 0.35 }} className="mt-6">
              <p className="text-[15px] text-muted">Pick a starting point, then tap to adjust. Every exercise in your plan will use only this.</p>
              <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5">
                {PRESETS.map((p) => {
                  const on = JSON.stringify([...(a.gear ?? [])].sort()) === JSON.stringify([...p.gear].sort());
                  return (
                    <button key={p.label} onClick={() => save({ gear: p.gear, dbMax: p.dbMax || a.dbMax })} className={cn("press shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold", on ? "border-lime bg-lime text-lime-ink" : "border-line-2 bg-white/[0.03] text-fg hover:bg-white/[0.07]")}>
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {GEAR_ORDER.map((g) => {
                  const on = (a.gear ?? []).includes(g);
                  return (
                    <button
                      key={g}
                      aria-pressed={on}
                      onClick={() => {
                        const cur = new Set(a.gear ?? []);
                        if (on) cur.delete(g);
                        else cur.add(g);
                        save({ gear: [...cur] });
                      }}
                      className={cn("press flex min-h-[56px] items-center gap-3 rounded-[16px] border px-3.5 text-left text-[14px] font-medium leading-tight", on ? "border-lime/70 bg-lime/[0.08] text-fg" : "border-line bg-card text-fg/75 hover:border-line-2")}
                    >
                      <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border", on ? "border-lime bg-lime text-lime-ink" : "border-white/25")}>{on && <Check size={13} strokeWidth={3.5} />}</span>
                      {GEAR_LABELS[g]}
                    </button>
                  );
                })}
              </div>
              {((a.gear ?? []).includes("dumbbells") || (a.gear ?? []).includes("adjustable")) && (
                <div className="mt-4 flex items-center justify-between rounded-[18px] border border-line bg-card px-4 py-3.5">
                  <div>
                    <div className="text-[15px] font-semibold">{(a.gear ?? []).includes("adjustable") ? "Heaviest setting" : "Your dumbbells weigh"}</div>
                    <div className="text-[13px] text-muted">{(a.gear ?? []).includes("adjustable") ? "We never plan above it." : "Each one, in pounds."}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button aria-label="Lighter" onClick={() => save({ dbMax: Math.max(5, (a.dbMax ?? 25) - 5) })} className="press flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.07] hover:bg-white/[0.12]"><Minus size={18} /></button>
                    <span className="w-[74px] text-center font-display text-[28px] font-bold tabular-nums">{a.dbMax ?? 25}<span className="ml-1 text-sm text-muted">lb</span></span>
                    <button aria-label="Heavier" onClick={() => save({ dbMax: Math.min(150, (a.dbMax ?? 25) + 5) })} className="press flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.07] hover:bg-white/[0.12]"><Plus size={18} /></button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.section>
      </AnimatePresence>

      {(q.kind === "multi" || q.kind === "gear") && (
        <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-bg via-bg to-transparent px-5 pt-8">
          <div className="mx-auto flex max-w-[580px] items-center gap-3">
            {q.kind === "multi" && (
              <button onClick={() => { save({ protect: [] }); go(step + 1); }} className="press h-14 rounded-full px-5 text-[15px] font-medium text-muted hover:text-fg">
                Skip
              </button>
            )}
            <button
              onClick={() => (q.kind === "gear" ? finish() : go(step + 1))}
              disabled={busy}
              className="press flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-white text-[16px] font-semibold text-ink hover:bg-[#ececec] disabled:opacity-60"
            >
              {q.kind === "gear" ? "Build my plan" : "Continue"} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
