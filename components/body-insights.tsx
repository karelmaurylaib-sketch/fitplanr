"use client";

import { animate, useReducedMotion } from "framer-motion";
import { AlertCircle, Flame } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BodyDiagram } from "@/components/muscle-map";
import { DEFAULT_VOLUME, LIMITS, REGION_LABEL, estimateBurn, musclesFor, type Region, type Sex, type Volume } from "@/lib/engine/muscles";
import { cn } from "@/lib/utils";

// ---------- Shared body stats (one store for the page, saved to /api/body) ----------
type Stats = { sex: Sex; weightLb: number | null; age: number | null };
type Store = { status: "loading" | "ready" | "error" | "anon"; saved: "idle" | "saving" | "error"; stats: Stats };

let store: Store = { status: "loading", saved: "idle", stats: { sex: "male", weightLb: null, age: null } };
const subs = new Set<() => void>();
let loaded = false;
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let tracked = false;

function set(next: Partial<Store>) {
  store = { ...store, ...next };
  subs.forEach((f) => f());
}
function load() {
  if (loaded) return;
  loaded = true;
  fetch("/api/body")
    .then(async (r) => {
      if (r.status === 401) return set({ status: "anon" });
      if (!r.ok) throw new Error(String(r.status));
      const { stats } = (await r.json()) as { stats: Stats | null };
      set({ status: "ready", stats: stats ?? store.stats });
    })
    .catch(() => {
      loaded = false; // try again next time the sheet opens
      set({ status: "error" });
    });
}
function save() {
  if (store.status === "anon") return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    set({ saved: "saving" });
    fetch("/api/body", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(store.stats) })
      .then((r) => set({ saved: r.ok ? "idle" : "error" }))
      .catch(() => set({ saved: "error" }));
  }, 700);
}

export function useBodyStats() {
  const s = useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => store,
    () => store,
  );
  useEffect(load, []);
  const update = useCallback((patch: Partial<Stats>) => {
    set({ stats: { ...store.stats, ...patch } });
    const { weightLb, age } = store.stats;
    // save the body model at once; numbers only once they are valid
    const ok = (weightLb === null || (weightLb >= LIMITS.weight[0] && weightLb <= LIMITS.weight[1])) && (age === null || (age >= LIMITS.age[0] && age <= LIMITS.age[1]));
    if (ok) save();
  }, []);
  return { ...s, update };
}

function trackOnce() {
  if (tracked) return;
  tracked = true;
  fetch("/api/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "feature_used", detail: "muscle_map" }) }).catch(() => {});
}

// ---------- UI ----------
export function SexToggle({ value, onChange, className }: { value: Sex; onChange: (s: Sex) => void; className?: string }) {
  return (
    <div role="radiogroup" aria-label="Body model" className={cn("flex rounded-full border border-line bg-black/40 p-1 text-[14px]", className)}>
      {(["male", "female"] as const).map((s) => (
        <button
          key={s}
          role="radio"
          aria-checked={value === s}
          onClick={() => onChange(s)}
          className={cn("press min-h-10 flex-1 rounded-full px-4 font-semibold transition-colors", value === s ? "bg-white text-ink" : "text-muted hover:text-fg")}
        >
          {s === "male" ? "Man" : "Woman"}
        </button>
      ))}
    </div>
  );
}

/** Front + back body with the exercise's muscles in green (primary solid, secondary soft). */
export function MuscleMap({ exId, sex, onSex }: { exId: string; sex: Sex; onSex: (s: Sex) => void }) {
  const { primary, secondary } = musclesFor(exId);
  const [focus, setFocus] = useState<Region | null>(null);
  useEffect(() => setFocus(null), [exId]);
  useEffect(trackOnce, []);
  const pick = (r: Region) => setFocus((f) => (f === r ? null : r));
  return (
    <section aria-label="Muscle map" className="rounded-[22px] border border-line bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="label">[ Muscle map ]</div>
          <div className="mt-1 text-[16px] font-semibold">Muscles worked</div>
        </div>
        <SexToggle value={sex} onChange={onSex} className="w-[168px]" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {(["front", "back"] as const).map((side) => (
          <figure key={side} className="rounded-2xl bg-black/30 px-2 pb-2 pt-3">
            <BodyDiagram side={side} sex={sex} primary={primary} secondary={secondary} focus={focus} onPick={pick} className="mx-auto h-[290px] w-full sm:h-[330px]" />
            <figcaption className="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{side}</figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-4 space-y-2.5">
        {[
          { k: "Primary", list: primary, dot: "bg-muscle shadow-[0_0_10px_var(--muscle)]" },
          { k: "Secondary", list: secondary, dot: "bg-muscle/40" },
        ].map(
          (g) =>
            g.list.length > 0 && (
              <div key={g.k} className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 flex w-[86px] items-center gap-2 text-[12px] text-muted">
                  <span className={cn("h-2.5 w-2.5 rounded-full", g.dot)} />
                  {g.k}
                </span>
                {g.list.map((r) => (
                  <button
                    key={r}
                    onClick={() => pick(r)}
                    aria-pressed={focus === r}
                    className={cn(
                      "press min-h-8 rounded-full border px-3 text-[13px] transition-colors",
                      focus === r ? "border-muscle bg-muscle/15 text-fg" : "border-line bg-white/[0.03] text-fg/85 hover:border-line-2",
                    )}
                  >
                    {REGION_LABEL[r]}
                  </button>
                ))}
              </div>
            ),
        )}
      </div>
    </section>
  );
}

function useTween(value: number | null) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(value ?? 0);
  const from = useRef(value ?? 0);
  useEffect(() => {
    if (value === null) return;
    if (reduce) return setV(value);
    const c = animate(from.current, value, { duration: 0.6, ease: [0.22, 0.8, 0.24, 1], onUpdate: (x) => ((from.current = x), setV(x)) });
    return () => c.stop();
  }, [value, reduce]);
  return v;
}

function NumField({ label, unit, value, onChange, min, max, id }: { label: string; unit: string; value: number | null; onChange: (n: number | null) => void; min: number; max: number; id: string }) {
  const [text, setText] = useState(value === null ? "" : String(value));
  useEffect(() => {
    setText((t) => (Number(t) === value ? t : value === null ? "" : String(value)));
  }, [value]);
  const n = text === "" ? null : Number(text);
  const bad = n !== null && (!Number.isFinite(n) || n < min || n > max);
  return (
    <label htmlFor={id} className="block">
      <span className="text-[12px] text-muted">{label}</span>
      <div className={cn("mt-1 flex h-12 items-center rounded-2xl border bg-black/40 pr-3 transition-colors focus-within:border-lime/60", bad ? "border-danger/70" : "border-line-2")}>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          value={text}
          placeholder="—"
          onChange={(e) => {
            const t = e.target.value.replace(/[^\d.]/g, "").slice(0, 5);
            setText(t);
            const v = t === "" ? null : Number(t);
            if (v === null) onChange(null);
            else if (Number.isFinite(v) && v >= min && v <= max) onChange(label === "Age" ? Math.round(v) : v);
          }}
          aria-invalid={bad}
          className="h-full w-full min-w-0 bg-transparent pl-4 font-display text-[22px] font-bold tabular-nums outline-none placeholder:text-dim"
        />
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{unit}</span>
      </div>
      {bad && <span className="mt-1 block text-[12px] text-danger">{min}–{max} {unit}</span>}
    </label>
  );
}

/** Calories for this exercise from the person's weight, age and sex. */
export function CalorieCard({ exId, volume }: { exId: string; volume?: Volume }) {
  const { status, saved, stats, update } = useBodyStats();
  const vol = volume ?? DEFAULT_VOLUME;
  const burn = stats.weightLb !== null && stats.age !== null ? estimateBurn(exId, { sex: stats.sex, weightLb: stats.weightLb, age: stats.age }, vol) : null;
  const shown = useTween(burn ? burn.total : null);
  const loading = status === "loading";
  return (
    <section aria-label="Calorie burn estimator" className="rounded-[22px] border border-line bg-card p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-heat/10 text-heat">
          <Flame size={17} />
        </span>
        <div>
          <div className="label">[ Calorie burn ]</div>
          <div className="text-[16px] font-semibold">What this exercise burns</div>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 space-y-3" aria-busy="true" aria-label="Loading your numbers">
          <div className="grid grid-cols-2 gap-2">
            <div className="skeleton h-[68px]" />
            <div className="skeleton h-[68px]" />
          </div>
          <div className="skeleton h-12" />
          <div className="skeleton h-[92px]" />
        </div>
      ) : (
        <>
          {status === "error" && (
            <p className="mt-3 flex items-center gap-2 rounded-xl bg-danger/10 px-3 py-2 text-[13px] text-danger">
              <AlertCircle size={15} /> Couldn’t load your saved numbers. Type them here.
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <NumField id={`w-${exId}`} label="Body weight" unit="lb" value={stats.weightLb} onChange={(weightLb) => update({ weightLb })} min={LIMITS.weight[0]} max={LIMITS.weight[1]} />
            <NumField id={`a-${exId}`} label="Age" unit="yrs" value={stats.age} onChange={(age) => update({ age })} min={LIMITS.age[0]} max={LIMITS.age[1]} />
          </div>
          <div className="mt-3">
            <span className="text-[12px] text-muted">Sex</span>
            <SexToggle value={stats.sex} onChange={(sex) => update({ sex })} className="mt-1" />
          </div>
          <div className="mt-4 rounded-2xl border border-line-2 bg-black/40 p-4" aria-live="polite">
            {burn ? (
              <>
                <div className="flex items-end gap-2">
                  <span className="font-display text-[56px] font-bold leading-[0.85] tabular-nums text-fg" data-testid="kcal">
                    {Math.round(shown)}
                  </span>
                  <span className="pb-1 font-display text-[22px] font-bold uppercase text-heat">kcal</span>
                </div>
                <p className="mt-2 text-[13px] leading-snug text-muted">
                  For {vol.sets} × {vol.target}
                  {vol.unit === "sec" ? " s" : ""} with {vol.rest} s rest (about {Math.max(1, Math.round(burn.minutes))} min) ·{" "}
                  <span className="text-fg">{burn.perMin.toFixed(1)} kcal</span> a minute while you lift
                </p>
              </>
            ) : (
              <>
                <div className="font-display text-[56px] font-bold leading-[0.85] text-dim">—</div>
                <p className="mt-2 text-[13px] text-muted">Add your weight and age to see your burn.</p>
              </>
            )}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-dim">
            Estimate from the exercise’s MET value × your resting burn (Schofield equation: weight, age, sex). Real burn varies about ±20%.
            {saved === "error" && <span className="text-danger"> Not saved — still calculated here.</span>}
            {status === "anon" && " Sign in to keep your numbers."}
          </p>
        </>
      )}
    </section>
  );
}
