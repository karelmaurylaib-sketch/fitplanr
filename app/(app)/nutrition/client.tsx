"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftRight, Camera, Check, ImageUp, Minus, Pencil, Plus, ScanLine, Trash2, UtensilsCrossed } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageTitle } from "@/components/app-shell";
import { Button, MainButton } from "@/components/ui/button";
import { Ring } from "@/components/ui/motion";
import { Sheet } from "@/components/ui/sheet";
import { ShareButton } from "@/components/share-button";
import { useUpgrade } from "@/components/paywall/upgrade";
import { buildNutrition, DEFAULT_BODY, MEALS, SLOTS, swapOptions, type Body, type MealKey, type PlannedMeal } from "@/lib/nutrition/plan";
import type { FoodLog } from "@/lib/nutrition/server";
import type { Goal } from "@/lib/engine/generate";
import { cn } from "@/lib/utils";
import { MACRO_COLORS, localDay } from "./shared";
import { MealScanner } from "./scanner";

type Props = {
  initialBody: Body | null;
  initialChoices: Record<string, string>;
  goal: Goal;
  days: number;
  initialLogs: FoodLog[];
  scans: { used: number; max: number };
  ai: boolean;
};

const EASE = [0.22, 0.8, 0.24, 1] as const;
const MEAL_NAME: Record<string, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack" };

export function NutritionClient({ initialBody, initialChoices, goal, days, initialLogs, scans, ai }: Props) {
  const [body, setBody] = useState<Body | null>(initialBody);
  const [choices, setChoices] = useState(initialChoices);
  const [logs, setLogs] = useState(initialLogs);
  const [used, setUsed] = useState(scans.used);
  const [today, setToday] = useState<string | null>(null);
  const [editBody, setEditBody] = useState(false);
  const [swap, setSwap] = useState<{ meal: MealKey; slot: string } | null>(null);
  const [scanner, setScanner] = useState<null | "camera" | "upload">(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { open: openUpgrade } = useUpgrade();

  useEffect(() => setToday(localDay()), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const plan = useMemo(() => (body ? buildNutrition(body, goal, days, choices) : null), [body, goal, days, choices]);
  const todays = logs.filter((l) => l.eaten_on === today);
  const eaten = todays.reduce((a, l) => ({ kcal: a.kcal + l.kcal, p: a.p + l.protein, c: a.c + l.carbs, f: a.f + l.fat }), { kcal: 0, p: 0, c: 0, f: 0 });

  async function saveSwap(meal: MealKey, slot: string, food: string) {
    const prev = choices;
    setChoices({ ...choices, [`${meal}.${slot}`]: food });
    setSwap(null);
    const r = await fetch("/api/nutrition/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ swap: { meal, slot, food } }) }).catch(() => null);
    if (!r || !r.ok) {
      setChoices(prev);
      setError("That swap didn't save. Check your connection and try again.");
    }
  }

  async function logPlanned(m: PlannedMeal) {
    if (!today) return;
    const r = await fetch("/api/nutrition/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eatenOn: today,
        meal: m.key,
        title: `Planned ${m.name.toLowerCase()}`,
        source: "plan",
        items: m.items.map((i) => ({ name: i.name, portion: i.amountLabel, kcal: i.kcal, protein: i.p, carbs: i.c, fat: i.f })),
      }),
    }).catch(() => null);
    if (!r || !r.ok) return setError("Couldn't add that meal. Try again.");
    const j = await r.json();
    setLogs((l) => [...l, j.log]);
    setToast(`${m.name} added · +${m.total.kcal} kcal`);
  }

  async function remove(id: string) {
    const prev = logs;
    setLogs((l) => l.filter((x) => x.id !== id));
    const r = await fetch(`/api/nutrition/log?id=${id}`, { method: "DELETE" }).catch(() => null);
    if (!r || !r.ok) {
      setLogs(prev);
      setError("Couldn't remove it. Try again.");
    }
  }

  function startScan(kind: "camera" | "upload") {
    if (ai && used >= scans.max) return openUpgrade(`You've used your ${scans.max} meal scans this month`);
    setScanner(kind);
  }

  if (!body || !plan)
    return (
      <div>
        <PageTitle label="Nutrition" title="Eat to grow" />
        <section className="relative overflow-hidden rounded-[24px] border border-line-2 bg-card p-5 sm:p-8">
          <div className="top-glow pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime/10 text-lime">
              <UtensilsCrossed size={22} />
            </div>
            <h2 className="display mt-5 text-[30px] sm:text-[38px]">Four numbers to your targets</h2>
            <p className="mt-2 max-w-[520px] text-[15px] text-muted">
              Your calories, protein, carbs and fat for breakfast, lunch and dinner, built on your {days}-day plan. Takes 20 seconds.
            </p>
            <BodyForm initial={DEFAULT_BODY} cta="Set my targets" onSaved={(b) => (setBody(b), setToast("Your targets are ready"))} />
          </div>
        </section>
        <Toast text={toast} />
      </div>
    );

  const kcalLeft = plan.daily.kcal - eaten.kcal;

  return (
    <div>
      <PageTitle label="Nutrition" title="Eat to grow">
        <div className="hidden sm:block">
          <MainButton size="sm" onClick={() => startScan("camera")}>Scan a meal</MainButton>
        </div>
      </PageTitle>

      {/* ---------- today ---------- */}
      <section className="relative overflow-hidden rounded-[24px] border border-line-2 bg-card p-5 sm:p-7" aria-label="Today">
        <div className="top-glow pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
          <div className="flex items-center gap-5">
            <Ring value={eaten.kcal / plan.daily.kcal} size={148} stroke={12} color={eaten.kcal > plan.daily.kcal * 1.05 ? "var(--heat)" : "var(--lime)"}>
              <div className="text-center">
                <div className="font-display text-[38px] font-bold leading-none tabular-nums" data-testid="kcal-eaten">{eaten.kcal.toLocaleString("en-US")}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">of {plan.daily.kcal.toLocaleString("en-US")} kcal</div>
              </div>
            </Ring>
            <div className="sm:hidden">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-lime">Today</div>
              <div className="display mt-1 text-[28px]">{kcalLeft >= 0 ? `${kcalLeft.toLocaleString("en-US")} left` : `${(-kcalLeft).toLocaleString("en-US")} over`}</div>
              <div className="text-[13px] text-muted">{todays.length ? `${todays.length} meal${todays.length > 1 ? "s" : ""} logged` : "Nothing logged yet"}</div>
            </div>
          </div>
          <div className="flex-1">
            <div className="hidden sm:block">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-lime">Today</div>
              <div className="display mt-1 text-[32px]">{kcalLeft >= 0 ? `${kcalLeft.toLocaleString("en-US")} kcal left` : `${(-kcalLeft).toLocaleString("en-US")} kcal over`}</div>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:mt-4">
              {(
                [
                  ["Protein", eaten.p, plan.daily.p, MACRO_COLORS.p],
                  ["Carbs", eaten.c, plan.daily.c, MACRO_COLORS.c],
                  ["Fat", eaten.f, plan.daily.f, MACRO_COLORS.f],
                ] as const
              ).map(([label, v, max, color]) => (
                <div key={label} className="flex flex-col items-center rounded-2xl border border-line bg-white/[0.02] p-3 text-center sm:flex-row sm:gap-3 sm:text-left">
                  <Ring value={v / max} size={54} stroke={6} color={color}>
                    <span className="text-[11px] font-semibold tabular-nums">{Math.min(999, Math.round((v / max) * 100))}%</span>
                  </Ring>
                  <div className="mt-2 sm:mt-0">
                    <div className="text-[13px] font-semibold">{label}</div>
                    <div className="text-[12px] tabular-nums text-muted" data-testid={`macro-${label.toLowerCase()}`}>
                      {v} / {max} g
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="relative mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <MainButton className="w-full sm:hidden" onClick={() => startScan("camera")}>Scan a meal</MainButton>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => startScan("upload")}>
            <ImageUp size={17} /> Upload a photo
          </Button>
          <p className="text-center text-[13px] text-dim sm:ml-auto sm:text-right">
            {ai ? `${Math.max(0, scans.max - used)} of ${scans.max} scans left this month` : "Snap or upload your plate, then tap what's on it"}
          </p>
        </div>
      </section>

      {error && (
        <div role="alert" className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-[14px]">
          {error}
          <button className="text-[13px] font-semibold underline" onClick={() => setError(null)}>OK</button>
        </div>
      )}

      {/* ---------- planned meals ---------- */}
      <div className="mb-4 mt-10 flex items-end justify-between gap-4">
        <div>
          <div className="label">[ Your meals ]</div>
          <h2 className="display mt-2 text-[30px]">Three plates a day</h2>
        </div>
        <p className="hidden max-w-[300px] text-right text-[13px] text-muted sm:block">Tap any food to swap it. Portions adjust so the meal stays on target.</p>
      </div>
      <p className="-mt-2 mb-4 text-[13px] text-muted sm:hidden">Tap any food to swap it. Portions adjust so the meal stays on target.</p>
      <div className="grid gap-4 lg:grid-cols-3">
        {plan.meals.map((m, k) => (
          <MealCard
            key={m.key}
            meal={m}
            index={k}
            logged={todays.some((l) => l.meal === m.key && l.source === "plan")}
            onSwap={(slot) => setSwap({ meal: m.key, slot })}
            onAte={() => logPlanned(m)}
          />
        ))}
      </div>

      {/* ---------- today's log ---------- */}
      <section className="mt-10 rounded-[20px] border border-line bg-card p-5 sm:p-6" aria-label="Today's food">
        <div className="flex items-center justify-between">
          <div className="text-[16px] font-semibold">Today&apos;s food</div>
          <button onClick={() => startScan("camera")} className="press flex items-center gap-1.5 text-[13px] text-muted hover:text-fg">
            <ScanLine size={15} /> Scan
          </button>
        </div>
        {todays.length === 0 ? (
          <div className="mt-4 flex items-center gap-4 rounded-2xl border border-dashed border-line-2 p-5">
            <Camera size={22} className="shrink-0 text-muted" />
            <p className="text-[14px] text-muted">Nothing yet today. Snap your next plate or tap &ldquo;Ate it&rdquo; on a planned meal: your rings fill as you go.</p>
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            <AnimatePresence initial={false}>
              {todays
                .slice()
                .reverse()
                .map((l) => (
                  <motion.li key={l.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: EASE }} className="flex items-center gap-3 py-3">
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", l.source === "scan" ? "bg-lime/10 text-lime" : "bg-white/[0.06] text-fg")}>
                      {l.source === "scan" ? <Camera size={18} /> : l.source === "plan" ? <Check size={18} /> : <UtensilsCrossed size={17} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-semibold">{l.title}</div>
                      <div className="text-[12px] text-muted">
                        {MEAL_NAME[l.meal]} · P {l.protein} · C {l.carbs} · F {l.fat}
                      </div>
                    </div>
                    <div className="text-right font-display text-[20px] font-bold tabular-nums">{l.kcal}<span className="ml-0.5 text-[11px] font-normal text-muted">kcal</span></div>
                    {l.share_id && <ShareButton path={`/m/${l.share_id}`} title={l.title} text="My meal, scanned with FitPlanr." iconOnly />}
                    <button aria-label={`Remove ${l.title}`} onClick={() => remove(l.id)} className="press flex h-9 w-9 items-center justify-center rounded-full text-dim hover:bg-white/[0.06] hover:text-fg">
                      <Trash2 size={16} />
                    </button>
                  </motion.li>
                ))}
            </AnimatePresence>
          </ul>
        )}
      </section>

      {/* ---------- why these numbers ---------- */}
      <section className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[20px] border border-line bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="text-[16px] font-semibold">How your targets are set</div>
            <button onClick={() => setEditBody(true)} className="press flex items-center gap-1.5 text-[13px] text-muted hover:text-fg">
              <Pencil size={14} /> Edit
            </button>
          </div>
          <ul className="mt-3 space-y-2 text-[14px] text-muted">
            <li>
              You burn about <b className="text-fg">{plan.daily.tdee.toLocaleString("en-US")} kcal</b> a day ({body.sex === "m" ? "man" : "woman"}, {body.age}, {Math.floor(body.heightIn / 12)}′{body.heightIn % 12}″, {body.weightLb} lb, {days} workouts a week).
            </li>
            <li>{plan.goalLine}</li>
            <li>
              Protein <b className="text-fg">{plan.daily.p} g</b> ({goal === "fatloss" ? "1" : "0.8"} g per lb) to build and keep muscle; fat about 27% of calories; carbs fill the rest to fuel your sets.
            </li>
          </ul>
        </div>
        <div className="rounded-[20px] border border-line bg-card p-5 sm:p-6">
          <div className="text-[16px] font-semibold">Rules that matter most</div>
          <ul className="mt-3 space-y-2 text-[14px] text-muted">
            {["Hit your protein every day: it matters more than the exact calories.", "Spread protein over 3 meals, about 30–50 g each.", "Weigh in once a week: up 0.25–0.5 lb a week is lean muscle pace.", "Drink water through the day, more on training days."].map((t) => (
              <li key={t} className="flex gap-2.5">
                <Check size={16} className="mt-0.5 shrink-0 text-lime" /> {t}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12px] text-dim">Estimates for healthy adults, not medical advice. If you have a medical condition, check with your doctor.</p>
        </div>
      </section>

      <SwapSheet
        swap={swap}
        onClose={() => setSwap(null)}
        body={body}
        goal={goal}
        days={days}
        choices={choices}
        onPick={(food) => swap && saveSwap(swap.meal, swap.slot, food)}
      />

      <Sheet open={editBody} onClose={() => setEditBody(false)} variant="bottom" label="Edit your body numbers" closeSide="right">
        <div className="overflow-y-auto px-5 pb-8 pt-4 sm:px-7 sm:pt-7">
          <div className="label">[ Your numbers ]</div>
          <h2 className="display mt-2 text-[30px]">Update your targets</h2>
          <BodyForm initial={body} cta="Save my targets" onSaved={(b) => (setBody(b), setEditBody(false), setToast("Targets updated"))} />
        </div>
      </Sheet>

      <MealScanner
        mode={scanner}
        ai={ai}
        today={today}
        onClose={() => setScanner(null)}
        onQuota={() => (setScanner(null), openUpgrade(`You've used your ${scans.max} meal scans this month`))}
        onScanned={() => setUsed((u) => u + 1)}
        onSaved={(log) => {
          setLogs((l) => [...l, log]);
          setScanner(null);
          setToast(`${MEAL_NAME[log.meal]} added · +${log.kcal} kcal`);
        }}
      />
      <Toast text={toast} />
    </div>
  );
}

function MealCard({ meal, index, logged, onSwap, onAte }: { meal: PlannedMeal; index: number; logged: boolean; onSwap: (slot: string) => void; onAte: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay: index * 0.06 }}
      className="flex flex-col rounded-[20px] border border-line bg-card p-5"
      aria-label={meal.name}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{meal.time}</div>
          <h3 className="display mt-1 text-[26px]">{meal.name}</h3>
        </div>
        <div className="text-right">
          <div className="font-display text-[26px] font-bold leading-none tabular-nums">{meal.total.kcal}</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">kcal</div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        {(
          [
            ["P", meal.total.p, meal.target.p, MACRO_COLORS.p],
            ["C", meal.total.c, meal.target.c, MACRO_COLORS.c],
            ["F", meal.total.f, meal.target.f, MACRO_COLORS.f],
          ] as const
        ).map(([k, v, t, color]) => (
          <div key={k} className="flex-1 rounded-xl bg-white/[0.04] px-2.5 py-2">
            <div className="flex items-baseline justify-between text-[12px]">
              <span className="font-semibold" style={{ color }}>{k}</span>
              <span className="tabular-nums text-fg">{v} g</span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.08]">
              <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${Math.min(100, (v / Math.max(1, t)) * 100)}%` }} transition={{ duration: 0.8, ease: EASE }} />
            </div>
          </div>
        ))}
      </div>
      <ul className="mt-4 flex-1 space-y-1.5">
        {meal.items.map((i) => (
          <li key={i.slot}>
            <button
              onClick={() => onSwap(i.slot)}
              aria-label={`Swap ${i.name} (${i.label.toLowerCase()})`}
              className="press group flex w-full items-center gap-3 rounded-xl border border-line bg-white/[0.02] px-3 py-2.5 text-left hover:border-lime/40 hover:bg-lime/[0.04]"
            >
              <motion.span key={i.foodId} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, ease: EASE }} className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="text-[14px] font-semibold leading-snug">{i.name}</span>
                  <span className="shrink-0 rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[12px] font-semibold tabular-nums">{i.amountLabel}</span>
                </span>
                <span className="mt-0.5 block text-[12px] text-muted">
                  {i.kcal} kcal · <span style={{ color: MACRO_COLORS.p }}>{i.p} g</span> protein
                </span>
              </motion.span>
              <ArrowLeftRight size={15} className="shrink-0 text-dim transition-colors group-hover:text-lime" />
            </button>
          </li>
        ))}
      </ul>
      <button
        disabled={logged || busy}
        onClick={async () => {
          setBusy(true);
          await onAte();
          setBusy(false);
        }}
        className={cn(
          "press mt-4 flex h-11 items-center justify-center gap-2 rounded-full text-[14px] font-semibold",
          logged ? "bg-lime/10 text-lime" : "border border-line-2 hover:bg-white/[0.06]",
        )}
      >
        {logged ? <><Check size={16} /> Logged today</> : busy ? "Adding…" : <><Plus size={16} /> Ate it</>}
      </button>
    </motion.article>
  );
}

function SwapSheet({ swap, onClose, body, goal, days, choices, onPick }: { swap: { meal: MealKey; slot: string } | null; onClose: () => void; body: Body; goal: Goal; days: number; choices: Record<string, string>; onPick: (food: string) => void }) {
  const opts = swap ? swapOptions(body, goal, days, choices, swap.meal, swap.slot) : [];
  const slot = swap ? SLOTS[swap.meal].find((s) => s.slot === swap.slot) : null;
  const current = swap ? choices[`${swap.meal}.${swap.slot}`] ?? slot?.options[0] : null;
  const mealName = swap ? MEALS.find((m) => m.key === swap.meal)!.name : "";
  return (
    <Sheet open={!!swap} onClose={onClose} variant="bottom" label="Swap a food" closeSide="right">
      <div className="overflow-y-auto px-5 pb-8 pt-3 sm:px-7 sm:pt-7">
        <div className="label">[ {mealName} · {slot?.label} ]</div>
        <h2 className="display mt-2 text-[30px]">Pick what you like</h2>
        <p className="mt-1 text-[14px] text-muted">Same goal, different food. The amount is already worked out for you.</p>
        <ul className="mt-5 space-y-2">
          {opts.map((o, k) => {
            const on = o.id === current;
            return (
              <motion.li key={o.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: k * 0.05 }}>
                <button
                  onClick={() => (on ? onClose() : onPick(o.id))}
                  aria-pressed={on}
                  className={cn("press flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left", on ? "border-lime/60 bg-lime/[0.07]" : "border-line bg-white/[0.02] hover:bg-white/[0.05]")}
                >
                  <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", on ? "border-lime bg-lime text-lime-ink" : "border-white/25")}>{on && <Check size={12} strokeWidth={3.5} />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold">{o.item.name}</span>
                    <span className="block text-[12px] text-muted">
                      {o.item.kcal} kcal · P {o.item.p} · C {o.item.c} · F {o.item.f}
                      {o.item.tip ? ` · ${o.item.tip}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-white/[0.06] px-2.5 py-1 text-[12px] font-semibold tabular-nums">{o.item.amountLabel}</span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </Sheet>
  );
}

function Stepper({ label, value, onChange, min, max, step = 1, fmt }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; fmt?: (v: number) => string }) {
  return (
    <div className="rounded-2xl border border-line bg-white/[0.02] p-3">
      <div className="text-[12px] text-muted">{label}</div>
      <div className="mt-1 flex items-center justify-between">
        <button type="button" aria-label={`Less ${label.toLowerCase()}`} onClick={() => onChange(Math.max(min, value - step))} className="press flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.1]">
          <Minus size={15} />
        </button>
        <span className="whitespace-nowrap font-display text-[22px] font-bold tabular-nums">{fmt ? fmt(value) : value}</span>
        <button type="button" aria-label={`More ${label.toLowerCase()}`} onClick={() => onChange(Math.min(max, value + step))} className="press flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.1]">
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}

function BodyForm({ initial, cta, onSaved }: { initial: Body; cta: string; onSaved: (b: Body) => void }) {
  const [b, setB] = useState<Body>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function save() {
    setBusy(true);
    setErr(null);
    const r = await fetch("/api/nutrition/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: b }) }).catch(() => null);
    setBusy(false);
    if (!r || !r.ok) return setErr("Couldn't save. Check your connection and try again.");
    onSaved(b);
  }
  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Sex">
        {(["m", "f"] as const).map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={b.sex === s}
            onClick={() => setB({ ...b, sex: s })}
            className={cn("press h-12 rounded-2xl border text-[15px] font-semibold", b.sex === s ? "border-lime/60 bg-lime/10 text-fg" : "border-line bg-white/[0.02] text-muted")}
          >
            {s === "m" ? "Man" : "Woman"}
          </button>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stepper label="Weight" value={b.weightLb} onChange={(v) => setB({ ...b, weightLb: v })} min={80} max={450} step={5} fmt={(v) => `${v} lb`} />
        <Stepper label="Height" value={b.heightIn} onChange={(v) => setB({ ...b, heightIn: v })} min={52} max={90} fmt={(v) => `${Math.floor(v / 12)}′${v % 12}″`} />
        <div className="col-span-2 sm:col-span-1">
          <Stepper label="Age" value={b.age} onChange={(v) => setB({ ...b, age: v })} min={16} max={90} />
        </div>
      </div>
      {err && <p role="alert" className="mt-3 text-[14px] text-danger">{err}</p>}
      <div className="mt-6">
        <MainButton className="w-full sm:w-auto" onClick={save} disabled={busy}>
          {busy ? "Saving…" : cta}
        </MainButton>
      </div>
    </div>
  );
}

function Toast({ text }: { text: string | null }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20, x: "-50%" }}
          transition={{ duration: 0.4, ease: EASE }}
          className="fixed bottom-[96px] left-1/2 z-[80] flex items-center gap-2 whitespace-nowrap rounded-full border border-lime/40 bg-[#10130a] px-4 py-2.5 text-[14px] font-semibold shadow-[0_20px_60px_-10px_rgb(0_0_0/0.8)] md:bottom-8"
        >
          <Check size={16} className="text-lime" /> {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

