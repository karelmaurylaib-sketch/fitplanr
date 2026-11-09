"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, ChevronDown, Info, Loader2, Lock, Minus, Pause, Play, Plus, SkipForward, Sparkles, Timer, Trophy, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { PlannedDay, PlannedExercise } from "@/lib/engine/generate";
import type { Target } from "@/lib/engine/progression";
import { EXERCISE_BY_ID } from "@/lib/engine/exercises";
import { FormAnim } from "@/components/form-anim";
import { ExerciseSheet } from "@/components/exercise-sheet";
import { Sheet } from "@/components/ui/sheet";
import { MainButton } from "@/components/ui/button";
import { Ring } from "@/components/ui/motion";
import { useUpgrade } from "@/components/paywall/upgrade";
import { cn } from "@/lib/utils";
import { restFor } from "@/lib/recovery";
import { reportFeature } from "@/components/recovery";

type SetState = { reps: number; load: number | null; done: boolean };

function Stepper({ value, onChange, step, min = 0, suffix, label }: { value: number; onChange: (v: number) => void; step: number; min?: number; suffix?: string; label: string }) {
  return (
    <div className="flex items-center gap-1" aria-label={label}>
      <button aria-label={`Less ${label}`} onClick={() => onChange(Math.max(min, value - step))} className="press flex h-10 w-9 items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.1]"><Minus size={15} /></button>
      <span className="w-[52px] text-center text-[17px] font-semibold tabular-nums">
        {value}
        {suffix && <span className="ml-0.5 text-[11px] font-normal text-muted">{suffix}</span>}
      </span>
      <button aria-label={`More ${label}`} onClick={() => onChange(value + step)} className="press flex h-10 w-9 items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.1]"><Plus size={15} /></button>
    </div>
  );
}

function RestTimer({ seconds, reason, upNext, onClose }: { seconds: number; reason: string; upNext: string | null; onClose: () => void }) {
  const reduce = useReducedMotion();
  // clock from an end time, so the count stays right when the phone locks or the tab sleeps
  const [end, setEnd] = useState(() => Date.now() + seconds * 1000);
  const [total, setTotal] = useState(seconds);
  const [pausedLeft, setPausedLeft] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const left = pausedLeft ?? Math.max(0, Math.ceil((end - now) / 1000));
  const over = left <= 0;
  useEffect(() => {
    if (pausedLeft !== null || over) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [pausedLeft, over]);
  useEffect(() => {
    if (!over) return;
    try {
      navigator.vibrate?.([120, 80, 120]);
    } catch {}
    const t = setTimeout(onClose, 2600);
    return () => clearTimeout(t);
  }, [over, onClose]);
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  const add = (s: number) => {
    if (pausedLeft !== null) setPausedLeft((p) => Math.max(0, (p ?? 0) + s));
    else setEnd((e) => Math.max(Date.now(), e + s * 1000));
    setTotal((t) => Math.max(5, t + s));
  };
  const toggle = () => {
    if (pausedLeft === null) setPausedLeft(left);
    else {
      setEnd(Date.now() + pausedLeft * 1000);
      setNow(Date.now());
      setPausedLeft(null);
    }
  };
  return (
    <motion.div
      initial={reduce ? false : { y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 120, opacity: 0 }}
      transition={{ type: "spring", damping: 26 }}
      className={cn(
        "fixed inset-x-3 bottom-[88px] z-50 mx-auto max-w-[520px] rounded-[24px] border p-3 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)] backdrop-blur-xl transition-colors duration-300 md:bottom-6",
        over ? "border-lime bg-lime text-lime-ink" : "border-line-2 bg-[rgb(18_20_14/0.96)]",
      )}
      role="timer"
      aria-live="polite"
      aria-label="Rest timer"
    >
      <div className="flex items-center gap-3">
        {over ? (
          <motion.span initial={reduce ? false : { scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 10 }} className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-lime-ink text-lime">
            <Check size={28} strokeWidth={3} />
          </motion.span>
        ) : (
          <Ring value={left / total} size={58} stroke={6}>
            <span className="font-display text-[17px] font-bold tabular-nums">{mm}:{ss}</span>
          </Ring>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold">{over ? "Rest done. Go!" : pausedLeft !== null ? "Rest paused" : "Rest"}</div>
          <div className={cn("line-clamp-2 text-[13px] leading-snug", over ? "text-lime-ink/75" : "text-muted")}>{upNext ? `Next: ${upNext}` : reason}</div>
        </div>
        {!over && (
          <div className="hidden items-center gap-2 sm:flex">
            <button onClick={() => add(-15)} aria-label="15 seconds less" className="press h-10 rounded-full bg-white/[0.07] px-3 text-[13px] font-semibold">−15s</button>
            <button onClick={() => add(15)} aria-label="15 seconds more" className="press h-10 rounded-full bg-white/[0.07] px-3 text-[13px] font-semibold">+15s</button>
            <button onClick={toggle} aria-label={pausedLeft !== null ? "Resume" : "Pause"} className="press flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.07]">{pausedLeft !== null ? <Play size={16} /> : <Pause size={16} />}</button>
          </div>
        )}
        <button onClick={onClose} aria-label={over ? "Close" : "Skip rest"} className={cn("press flex h-10 w-10 shrink-0 items-center justify-center rounded-full", over ? "bg-lime-ink text-lime" : "bg-lime text-lime-ink")}>
          {over ? <X size={16} /> : <SkipForward size={16} />}
        </button>
      </div>
      {!over && (
        <div className="mt-2.5 grid grid-cols-3 gap-2 sm:hidden">
          <button onClick={() => add(-15)} aria-label="15 seconds less" className="press h-10 rounded-full bg-white/[0.07] text-[13px] font-semibold">−15s</button>
          <button onClick={() => add(15)} aria-label="15 seconds more" className="press h-10 rounded-full bg-white/[0.07] text-[13px] font-semibold">+15s</button>
          <button onClick={toggle} aria-label={pausedLeft !== null ? "Resume" : "Pause"} className="press flex h-10 items-center justify-center rounded-full bg-white/[0.07]">{pausedLeft !== null ? <Play size={16} /> : <Pause size={16} />}</button>
        </div>
      )}
      {!over && upNext && reason && <p className="mt-2 px-1 text-[12px] leading-snug text-dim">{reason}</p>}
    </motion.div>
  );
}

export function Logger({
  planId,
  week,
  day,
  days,
  next,
  targets,
  last,
  smart,
  quota,
  rebuilt,
  recovery,
}: {
  planId: string;
  week: number;
  day: PlannedDay;
  days: { week: number; day: number; name: string; weekday: string }[][];
  next: { week: number; day: number };
  targets: Record<string, Target> | null;
  last: Record<string, { reps: number; load: number | null }[]>;
  smart: boolean;
  quota: { used: number; max: number };
  rebuilt: boolean;
  recovery?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const { open: openUpgrade } = useUpgrade();
  const key = `fp_draft_${planId}_${week}_${day.day}`;
  const init = useMemo(() => {
    const out: Record<string, SetState[]> = {};
    for (const e of day.exercises) {
      const t = targets?.[e.slot];
      const sets = t?.sets ?? e.sets;
      out[e.slot] = Array.from({ length: sets }, () => ({ reps: t?.target ?? e.target, load: t?.load ?? e.load, done: false }));
    }
    return out;
  }, [day, targets]);
  const [state, setState] = useState<Record<string, SetState[]>>(init);
  const [startedAt] = useState(() => new Date().toISOString());
  const [rest, setRest] = useState<{ id: number; s: number; reason: string; upNext: string | null } | null>(null);
  const [info, setInfo] = useState<PlannedExercise | null>(null);
  const [picker, setPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<null | { sets: number; volume: number; bests: string[] }>(null);
  const [toast, setToast] = useState(rebuilt ? "Your new plan is live." : "");
  const loaded = useRef(false);
  const closeRest = useCallback(() => setRest(null), []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    loaded.current = true;
  }, [key]);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [state, key]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const totalSets = Object.values(state).reduce((n, s) => n + s.length, 0);
  const doneSets = Object.values(state).reduce((n, s) => n + s.filter((x) => x.done).length, 0);

  function update(slot: string, i: number, patch: Partial<SetState>) {
    setState((st) => ({ ...st, [slot]: st[slot].map((s, k) => (k === i ? { ...s, ...patch } : s)) }));
  }
  function toggle(e: PlannedExercise, i: number) {
    const was = state[e.slot][i].done;
    update(e.slot, i, { done: !was });
    if (was) return;
    // smart rest: starts on its own after each logged set
    const sets = state[e.slot];
    const after = sets.findIndex((s, k) => k > i && !s.done);
    const nextOpen = after !== -1 ? after : sets.findIndex((s, k) => k !== i && !s.done);
    const k = day.exercises.findIndex((x) => x.slot === e.slot);
    const nextEx = day.exercises.slice(k + 1).find((x) => (state[x.slot] ?? []).some((s) => !s.done)) ?? null;
    const call = restFor(e, sets[i], { lastSet: nextOpen === -1, next: nextEx });
    if (call.seconds <= 0) return setRest(null);
    const s = nextOpen === -1 ? null : sets[nextOpen];
    const upNext = s ? `Set ${nextOpen + 1} · ${s.load ? `${s.load} lb × ` : ""}${s.reps}${e.unit === "sec" ? " s" : ""}` : nextEx ? nextEx.name : null;
    setRest({ id: Date.now(), s: call.seconds, reason: call.reason, upNext });
    reportFeature("smart_rest");
  }

  async function finish() {
    if (doneSets === 0) return setError("Log at least one set first: tap the square next to a set.");
    if (quota.used >= quota.max) {
      openUpgrade(`You've logged ${quota.max} workouts this month`);
      return;
    }
    setSaving(true);
    setError("");
    const entries = day.exercises.map((e) => ({ slot: e.slot, exId: e.exId, name: e.name, sets: state[e.slot] }));
    try {
      const r = await fetch("/api/workouts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId, week, day: day.day, dayName: day.name, entries, startedAt }) });
      const j = await r.json();
      if (r.status === 402) {
        setSaving(false);
        openUpgrade(`You've logged ${quota.max} workouts this month`);
        return;
      }
      if (!r.ok) throw new Error();
      try {
        localStorage.removeItem(key);
      } catch {}
      setDone({ sets: doneSets, volume: j.volume ?? 0, bests: j.bests ?? [] });
    } catch {
      setError("We couldn't save this workout. Check your connection and try again: your sets are kept.");
    }
    setSaving(false);
  }

  if (done)
    return (
      <div className="flex min-h-[70dvh] flex-col items-center justify-center text-center">
        <motion.div initial={reduce ? false : { scale: 0.3, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 10, stiffness: 160 }} className="flex h-28 w-28 items-center justify-center rounded-full bg-lime text-lime-ink shadow-[0_0_100px_rgb(200_255_61/0.5)]">
          <Check size={56} strokeWidth={3} />
        </motion.div>
        <h1 className="display mt-8 text-[46px] sm:text-[60px]">Workout done</h1>
        <p className="mt-2 text-[16px] text-muted">
          {day.name} · {done.sets} sets{done.volume ? ` · ${done.volume.toLocaleString("en-US")} lb moved` : ""}
        </p>
        {done.bests.length > 0 && (
          <div className="mt-6 w-full max-w-sm rounded-[20px] border border-heat/30 bg-heat/[0.07] p-4 text-left">
            <div className="flex items-center gap-2 text-[15px] font-semibold text-heat"><Trophy size={17} /> New bests</div>
            <ul className="mt-2 space-y-1 text-[14px]">{done.bests.map((b) => <li key={b}>{b}</li>)}</ul>
          </div>
        )}
        <div className="mt-8 flex gap-3">
          <MainButton href="/dashboard">Back to dashboard</MainButton>
        </div>
      </div>
    );

  return (
    <div>
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-x-0 top-4 z-50 mx-auto w-fit rounded-full bg-lime px-5 py-2.5 text-[14px] font-semibold text-lime-ink shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <div className="label">[ Week {week} · Day {day.day} · {day.weekday} ]</div>
          <button onClick={() => setPicker(true)} className="press mt-2 flex items-center gap-2 text-left">
            <h1 className="display text-[40px] sm:text-[52px]">{day.name}</h1>
            <ChevronDown size={22} className="text-muted" />
          </button>
          <div className="mt-1 text-[14px] text-muted">{day.focus} · {day.minutes} min</div>
        </div>
        <Ring value={totalSets ? doneSets / totalSets : 0} size={64} stroke={6}>
          <span className="text-[13px] font-bold tabular-nums">{doneSets}/{totalSets}</span>
        </Ring>
      </div>

      {recovery}

      <div className="space-y-4">
        {day.exercises.map((e) => {
          const ex = EXERCISE_BY_ID[e.exId];
          const t = targets?.[e.slot];
          const sets = state[e.slot] ?? [];
          const prev = last[e.slot];
          return (
            <section key={e.slot} className="rounded-[22px] border border-line bg-card">
              <header className="flex items-center gap-3 p-4">
                <button onClick={() => setInfo(e)} className="press flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-line bg-black/30" aria-label={`How to do ${e.name}`}>
                  {ex && <FormAnim anim={ex.anim} className="h-12 w-12" />}
                </button>
                <div className="min-w-0 flex-1">
                  <button onClick={() => setInfo(e)} className="flex items-center gap-1.5 text-left text-[17px] font-semibold">
                    {e.name} <Info size={14} className="text-muted" />
                  </button>
                  <div className="text-[13px] text-muted">
                    Target {t?.sets ?? e.sets} × {t?.target ?? e.target}{e.unit === "sec" ? " s" : ""}
                    {(t?.load ?? e.load) ? ` · ${t?.load ?? e.load} lb` : e.loadLabel ? ` · ${e.loadLabel}` : ""} <span className="inline-flex items-center gap-0.5"> · <Timer size={12} /> {e.rest}s</span>
                  </div>
                  {prev && prev.length > 0 && <div className="text-[12px] text-dim">Last time: {prev.map((p) => `${p.load ? p.load + "×" : ""}${p.reps}`).join(", ")}</div>}
                </div>
              </header>
              {smart && t && t.change !== "plan" && (
                <div className={cn("mx-4 mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-[13px]", t.change === "up" ? "bg-lime/10 text-lime" : t.change === "down" ? "bg-heat/10 text-heat" : "bg-white/[0.04] text-fg/80")}>
                  {t.change === "up" ? <ArrowUp size={14} /> : t.change === "down" ? <ArrowDown size={14} /> : <Sparkles size={14} />} {t.reason}
                </div>
              )}
              {!smart && e.unit === "reps" && (
                <button onClick={() => openUpgrade("Unlock Smart Progression with Pro", "pro")} className="mx-4 mb-2 flex items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-2 text-[13px] text-muted hover:text-fg">
                  <Lock size={13} /> Auto-adjust from your last session · Pro
                </button>
              )}
              <div className="space-y-1.5 px-2 pb-3 sm:px-4">
                {sets.map((s, i) => (
                  <div key={i} className={cn("flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors", s.done ? "bg-lime/[0.08]" : "")}>
                    <span className="w-9 font-mono text-[12px] text-muted">S{i + 1}</span>
                    <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                      {s.load !== null && <Stepper label="weight" value={s.load} step={5} min={0} suffix="lb" onChange={(v) => update(e.slot, i, { load: v })} />}
                      <Stepper label={e.unit === "sec" ? "seconds" : "reps"} value={s.reps} step={e.unit === "sec" ? 5 : 1} min={0} suffix={e.unit === "sec" ? "s" : "reps"} onChange={(v) => update(e.slot, i, { reps: v })} />
                    </div>
                    <button onClick={() => toggle(e, i)} aria-label={s.done ? `Undo set ${i + 1}` : `Log set ${i + 1}`} aria-pressed={s.done} className={cn("press flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 transition-colors", s.done ? "border-lime bg-lime text-lime-ink" : "border-white/20 hover:border-white/40")}>
                      {s.done && (
                        <motion.span initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}>
                          <Check size={20} strokeWidth={3} />
                        </motion.span>
                      )}
                    </button>
                  </div>
                ))}
                <button onClick={() => setState((st) => ({ ...st, [e.slot]: [...st[e.slot], { ...(st[e.slot].at(-1) ?? { reps: e.target, load: e.load }), done: false }] }))} className="press ml-2 mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] text-muted hover:text-fg">
                  <Plus size={13} /> Add a set
                </button>
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-8">
        {error && <p className="mb-3 text-center text-[14px] text-danger">{error}</p>}
        <button onClick={finish} disabled={saving} className="press flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white text-[16px] font-semibold text-ink hover:bg-[#ececec] disabled:opacity-60">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />} Finish workout
        </button>
        <p className="mt-3 text-center text-[13px] text-dim">{quota.used} of {quota.max} workouts logged this billing month</p>
      </div>

      <AnimatePresence>{rest && <RestTimer key={rest.id} seconds={rest.s} reason={rest.reason} upNext={rest.upNext} onClose={closeRest} />}</AnimatePresence>
      <ExerciseSheet exercise={info} onClose={() => setInfo(null)} />

      <Sheet open={picker} onClose={() => setPicker(false)} variant="bottom" label="Pick a workout" closeSide="right">
        <div className="overflow-y-auto px-5 pb-8 pt-2 sm:px-7 sm:pt-7">
          <h2 className="display pr-12 text-[30px]">Pick a workout</h2>
          <p className="mt-1 text-[14px] text-muted">Up next: Week {next.week}, Day {next.day}.</p>
          <div className="mt-5 space-y-5">
            {days.map((w, wi) => (
              <div key={wi}>
                <div className="label mb-2">Week {wi + 1}</div>
                <div className="grid grid-cols-2 gap-2">
                  {w.map((d) => {
                    const cur = d.week === week && d.day === day.day;
                    const isNext = d.week === next.week && d.day === next.day;
                    return (
                      <Link key={`${d.week}-${d.day}`} href={`/workout?week=${d.week}&day=${d.day}`} onClick={() => setPicker(false)} className={cn("press rounded-2xl border px-3 py-3 text-[14px]", cur ? "border-lime bg-lime/10" : "border-line bg-card hover:border-line-2")}>
                        <div className="font-semibold">{d.name}</div>
                        <div className="text-[12px] text-muted">Day {d.day} · {d.weekday}{isNext ? " · next" : ""}</div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <Link href="/plan" className="mt-6 block text-center text-[14px] text-muted hover:text-fg">See the full plan</Link>
        </div>
      </Sheet>
    </div>
  );
}
