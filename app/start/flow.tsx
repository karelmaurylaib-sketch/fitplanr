"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import { Bell } from "@/components/onboarding/projection-chart";
import { SaveProgress, useExitIntent, type ExitTrigger } from "@/components/onboarding/save-progress";
import { ValuePreview } from "@/components/onboarding/value-preview";
import { EXERCISES, GEAR_LABELS, hasGear, type Gear } from "@/lib/engine/exercises";
import type { Answers } from "@/lib/engine/generate";
import { sendEvent } from "@/lib/device";
import { cn } from "@/lib/utils";

type A = Partial<Answers>;

type Opt = { v: string | number; label: string; line: string };
type Q =
  | { key: "goal" | "level" | "days" | "minutes"; kind: "single"; text: (a: A) => string; opts: (a: A) => Opt[] }
  | { key: "protect"; kind: "multi"; text: (a: A) => string; opts: (a: A) => Opt[]; optional: true }
  | { key: "setup"; kind: "setup"; text: (a: A) => string; opts: (a: A) => Opt[] }
  | { key: "gear"; kind: "gear"; text: (a: A) => string }
  | { key: "dbMax"; kind: "weight"; text: (a: A) => string; when: (a: A) => boolean };

const GOAL_WORD: Record<string, string> = { muscle: "building muscle", strength: "getting stronger", fatloss: "losing fat and keeping muscle", fit: "getting fit" };

const PRESETS: { label: string; gear: Gear[]; dbMax: number; line: string }[] = [
  { label: "Home: 2 dumbbells", gear: ["dumbbells"], dbMax: 25, line: "One pair does it all: reps and sets climb, week after week." },
  { label: "Home + bench", gear: ["adjustable", "bench"], dbMax: 50, line: "Bench presses, rows and step-ups join your plan." },
  { label: "Full gym", gear: ["dumbbells", "adjustable", "barbell", "rack", "bench", "cables", "machines", "pullup"], dbMax: 80, line: "Barbell, cables and machines: the whole menu." },
  { label: "Bodyweight only", gear: [], dbMax: 0, line: "Push-ups, lunges and holds that get harder every week." },
];
const GEAR_ORDER: Gear[] = ["dumbbells", "adjustable", "bench", "barbell", "rack", "pullup", "bands", "kettlebell", "cables", "machines"];
const hasDb = (a: A) => (a.gear ?? []).includes("dumbbells") || (a.gear ?? []).includes("adjustable");
const sameGear = (x: Gear[], y: Gear[]) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());

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
  // ---------- Equipment Sync: three one-tap steps ----------
  { key: "setup", kind: "setup", text: () => "Now your gear. Where do you train?", opts: () => PRESETS.map((p, i) => ({ v: i, label: p.label, line: p.line })) },
  { key: "gear", kind: "gear", text: () => "Tap to fix it. What's really there?" },
  { key: "dbMax", kind: "weight", when: hasDb, text: (a) => ((a.gear ?? []).includes("adjustable") ? "Last one: the heaviest setting?" : "Last one: how heavy is each dumbbell?") },
];
const SYNC_STEPS = ["Setup", "Gear", "Weight"];

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

/** How many exercises of the library fit this gear and these joints: the live "it works with my stuff" signal. */
function fitCount(a: A) {
  const gear = (a.gear ?? []) as Gear[];
  const protect = a.protect ?? [];
  return EXERCISES.filter((e) => hasGear(gear, e) && !e.stresses.some((j) => protect.includes(j))).length;
}

export function StartFlow({ initial, rebuild = false, email = "" }: { initial: A; rebuild?: boolean; email?: string }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [a, setA] = useState<A>({ protect: [], gear: ["dumbbells"], dbMax: 25, ...initial });
  const visible = useMemo(() => QUESTIONS.filter((q) => q.kind !== "weight" || q.when(a)), [a]);
  const [step, setStep] = useState(() => {
    const init = initial as Record<string, unknown>;
    const first = QUESTIONS.findIndex((q) => init[q.key === "setup" ? "gear" : q.key] === undefined);
    return first === -1 ? QUESTIONS.length - 1 : first;
  });
  const idx = Math.min(step, visible.length - 1);
  const [typed, setTyped] = useState(false);
  const [picked, setPicked] = useState<string | number | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [leaving, setLeaving] = useState<ExitTrigger | null>(null);
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const q = visible[idx];
  const text = useMemo(() => q.text(a), [q, a]);
  const total = visible.length;
  const syncStart = visible.findIndex((x) => x.kind === "setup");
  const inSync = idx >= syncStart;
  const syncIdx = idx - syncStart;
  const syncTotal = total - syncStart;

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // funnel analytics: which question people reach (Kwop feature_used), once per visit
  useEffect(() => {
    const key = `fp_step_${q.key}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    sendEvent("feature_used", `onboarding_step ${idx + 1} ${q.key}`);
  }, [q.key, idx]);

  const armed = !rebuild && !saved && !busy && (idx > 0 || picked !== null);
  const onExit = useCallback((t: ExitTrigger) => {
    setPreview(false);
    setLeaving(t);
  }, []);
  useExitIntent(armed, onExit);

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
    if (q.kind === "setup") {
      const p = PRESETS[v as number];
      save({ gear: p.gear, dbMax: p.dbMax || a.dbMax || 25 });
    } else save({ [q.key]: v } as A);
    timer.current = setTimeout(() => go(idx + 1), 1300);
  }

  async function finish() {
    if (busy) return;
    setBusy(true);
    const gear = (a.gear ?? []) as Gear[];
    const dbMax = hasDb(a) ? a.dbMax || 25 : 0;
    await fetch("/api/answers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gear, dbMax, protect: a.protect ?? [] }) }).catch(() => {});
    if (rebuild) return router.push("/start/building?rebuild=1");
    setBusy(false);
    setPreview(true);
  }

  function build() {
    setBusy(true);
    router.push("/start/building");
  }

  const last = idx === total - 1;
  const progress = Math.min(1, (idx + (picked !== null ? 1 : 0)) / total);
  const presetOn = PRESETS.findIndex((p) => sameGear(a.gear ?? [], p.gear));
  const count = fitCount(a);

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-[620px] flex-col px-5 pb-32">
      {/* pinned progress: always visible, on phone and computer */}
      <header className="sticky top-0 z-30 -mx-5 border-b border-transparent bg-[rgb(6_6_6/0.82)] px-5 pb-3 pt-[max(16px,env(safe-area-inset-top))] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <Logo size={24} />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted" data-testid="step-count">
            {inSync ? (
              <>
                <span className="text-lime">Equipment Sync</span> · {syncIdx + 1} / {syncTotal}
              </>
            ) : (
              <>
                {idx + 1} / {total}
              </>
            )}
          </span>
        </div>
        <div className="mt-4 h-[4px] overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Your progress" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <motion.div className="h-full rounded-full bg-lime shadow-[0_0_12px_rgb(200_255_61/0.6)]" initial={false} animate={{ width: `${Math.max(3, progress * 100)}%` }} transition={{ duration: 0.5, ease: [0.22, 0.8, 0.24, 1] }} />
        </div>
        <AnimatePresence initial={false}>
          {inSync && (
            <motion.ol
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex gap-2 overflow-hidden pt-3"
              aria-label="Equipment Sync steps"
            >
              {SYNC_STEPS.slice(0, syncTotal).map((s, k) => {
                const done = k < syncIdx || (k === syncIdx && picked !== null);
                const active = k === syncIdx && !done;
                return (
                  <li key={s} className="flex flex-1 items-center gap-2" aria-current={active ? "step" : undefined} data-done={done ? "1" : "0"}>
                    <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-colors duration-300", done ? "border-lime bg-lime text-lime-ink" : active ? "border-lime text-lime" : "border-white/20 text-muted")}>
                      {done ? <Check size={11} strokeWidth={3.5} /> : k + 1}
                    </span>
                    <span className={cn("text-[12px] font-medium transition-colors", done || active ? "text-fg" : "text-muted")}>{s}</span>
                    {k < syncTotal - 1 && <span className={cn("h-px flex-1 transition-colors duration-500", done ? "bg-lime/60" : "bg-white/10")} />}
                  </li>
                );
              })}
            </motion.ol>
          )}
        </AnimatePresence>
      </header>

      <div className="mt-3 h-6">
        {idx > 0 && (
          <button onClick={() => go(idx - 1)} className="press inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
            <ArrowLeft size={15} /> Previous question
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.section key={q.key} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3, ease: [0.22, 0.8, 0.24, 1] }} className="mt-6">
          <Typed text={text} onDone={() => setTyped(true)} />

          {(q.kind === "single" || q.kind === "multi" || q.kind === "setup") && (
            <motion.ul className="mt-8 space-y-2.5" initial={false} animate={{ opacity: typed ? 1 : 0.0001, y: typed ? 0 : 8 }} transition={{ duration: 0.35 }}>
              {q.opts(a).map((o) => {
                const multi = q.kind === "multi";
                const sel = multi ? (a.protect ?? []).includes(o.v as never) : picked === o.v || (q.kind === "setup" && picked === null && presetOn === o.v && initial.gear !== undefined);
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
              <div className="flex items-center justify-between gap-3 rounded-[16px] border border-lime/25 bg-lime/[0.05] px-4 py-3" aria-live="polite">
                <span className="text-[14px] text-fg/85">Every exercise in your plan uses only this.</span>
                <span className="shrink-0 text-right">
                  <motion.span key={count} initial={reduce ? false : { scale: 1.25, color: "#c8ff3d" }} animate={{ scale: 1, color: "#f4f5f0" }} transition={{ duration: 0.4 }} className="inline-block font-display text-[26px] font-bold leading-none tabular-nums">
                    {count}
                  </motion.span>
                  <span className="block text-[11px] text-muted">exercises fit</span>
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
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
            </motion.div>
          )}

          {q.kind === "weight" && (
            <motion.div initial={false} animate={{ opacity: typed ? 1 : 0.0001, y: typed ? 0 : 8 }} transition={{ duration: 0.35 }} className="mt-6">
              <div className="rounded-[22px] border border-line bg-card px-5 py-6">
                <div className="flex items-center justify-between">
                  <button aria-label="Lighter" onClick={() => save({ dbMax: Math.max(5, (a.dbMax ?? 25) - 5) })} className="press flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.07] hover:bg-white/[0.12]">
                    <Minus size={20} />
                  </button>
                  <div className="flex flex-col items-center">
                    <motion.div key={a.dbMax} initial={reduce ? false : { scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 14 }}>
                      <Bell lb={a.dbMax ?? 25} max={80} lit />
                    </motion.div>
                    <span className="mt-1 font-display text-[56px] font-bold leading-none tabular-nums" data-testid="db-weight">
                      {a.dbMax ?? 25}
                      <span className="ml-1 text-[20px] text-muted">lb</span>
                    </span>
                  </div>
                  <button aria-label="Heavier" onClick={() => save({ dbMax: Math.min(150, (a.dbMax ?? 25) + 5) })} className="press flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.07] hover:bg-white/[0.12]">
                    <Plus size={20} />
                  </button>
                </div>
                <div className="mt-5 grid grid-cols-7 gap-1.5" aria-label="Common weights, in pounds">
                  {[10, 15, 20, 25, 30, 40, 50].map((w) => (
                    <button key={w} onClick={() => save({ dbMax: w })} aria-label={`${w} lb`} className={cn("press h-10 rounded-full border text-[13px] font-semibold tabular-nums", a.dbMax === w ? "border-lime bg-lime text-lime-ink" : "border-line-2 text-fg/80 hover:bg-white/[0.06]")}>
                      {w}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-[14px] leading-snug text-muted">
                {(a.gear ?? []).includes("adjustable") ? "Each hand. We start you lighter and never plan above it." : "Each one. Every dumbbell move uses this pair: reps and sets do the climbing."}
              </p>
            </motion.div>
          )}
        </motion.section>
      </AnimatePresence>

      {(q.kind === "multi" || q.kind === "gear" || q.kind === "weight") && (
        <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-bg via-bg to-transparent px-5 pt-8">
          <div className="mx-auto flex max-w-[580px] items-center gap-3">
            {q.kind === "multi" && (
              <button
                onClick={() => {
                  save({ protect: [] });
                  go(idx + 1);
                }}
                className="press h-14 rounded-full px-5 text-[15px] font-medium text-muted hover:text-fg"
              >
                Skip
              </button>
            )}
            <button
              onClick={() => (last ? finish() : go(idx + 1))}
              disabled={busy}
              className={cn(
                "press flex h-14 flex-1 items-center justify-center gap-2 rounded-full text-[16px] font-semibold disabled:opacity-60",
                last ? "bg-lime text-lime-ink hover:bg-[#d4ff63]" : "bg-white text-ink hover:bg-[#ececec]",
              )}
            >
              {last ? "Build my plan" : "Continue"} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      <ValuePreview open={preview} onClose={() => setPreview(false)} onContinue={build} busy={busy} />
      <SaveProgress
        open={leaving !== null}
        trigger={leaving ?? "exit"}
        onStay={() => setLeaving(null)}
        onSaved={() => setSaved(true)}
        email={email}
        step={idx + 1}
        total={total}
      />
    </main>
  );
}
