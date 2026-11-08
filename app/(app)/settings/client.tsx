"use client";

import { ArrowDown, ArrowUp, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LockedPart, useUpgrade } from "@/components/paywall/upgrade";
import { cn } from "@/lib/utils";

type Day = { index: number; name: string; exercises: { slot: string; exId: string; name: string; options: { id: string; name: string }[] }[] };

export function SettingsClient({ setup, rebuilds, swapsAllowed, deloadAllowed, days, initial }: { setup: { k: string; v: string }[]; rebuilds: { used: number; max: number }; swapsAllowed: boolean; deloadAllowed: boolean; days: Day[]; initial: { swaps: Record<string, string>; dayOrder: number[]; deload: boolean } }) {
  const router = useRouter();
  const { open: upgrade } = useUpgrade();
  const [swaps, setSwaps] = useState(initial.swaps);
  const [order, setOrder] = useState(initial.dayOrder);
  const [deload, setDeload] = useState(initial.deload);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const left = rebuilds.max - rebuilds.used;

  function rebuild() {
    if (left <= 0) return upgrade(`You've used your ${rebuilds.max} rebuilds this month`);
    router.push("/start?rebuild=1");
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const n = [...order];
    [n[i], n[j]] = [n[j], n[i]];
    setOrder(n);
    setState("idle");
  }
  async function save() {
    setState("saving");
    const r = await fetch("/api/plan/customize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ swaps, dayOrder: order, deload }) }).catch(() => null);
    if (!r || !r.ok) return setState("error");
    setState("saved");
    router.refresh();
  }

  const custom = (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="text-[14px] font-semibold text-fg/80">Training day order</div>
        {order.map((bi, i) => (
          <div key={bi} className="flex items-center justify-between rounded-2xl border border-line bg-black/20 px-4 py-3">
            <span className="text-[15px]"><span className="mr-2 font-mono text-[12px] text-lime">Day {i + 1}</span>{days[bi].name}</span>
            <span className="flex gap-1">
              <button aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0} className="press flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] disabled:opacity-30"><ArrowUp size={15} /></button>
              <button aria-label="Move down" onClick={() => move(i, 1)} disabled={i === order.length - 1} className="press flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] disabled:opacity-30"><ArrowDown size={15} /></button>
            </span>
          </div>
        ))}
      </div>
      {days.map((d) => (
        <div key={d.index} className="space-y-2">
          <div className="text-[14px] font-semibold text-fg/80">{d.name}: swap exercises</div>
          {d.exercises.map((e) => (
            <label key={e.slot} className="flex flex-col gap-1.5 rounded-2xl border border-line bg-black/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[14px] text-muted">{e.name}</span>
              <select
                value={swaps[e.slot] ?? ""}
                onChange={(ev) => {
                  const v = ev.target.value;
                  setSwaps((s) => {
                    const n = { ...s };
                    if (v) n[e.slot] = v;
                    else delete n[e.slot];
                    return n;
                  });
                  setState("idle");
                }}
                className="h-10 rounded-full border border-line-2 bg-black/40 px-3 text-[14px] outline-none focus:border-lime/60"
                disabled={e.options.length === 0 && !swaps[e.slot]}
              >
                <option value="">{swaps[e.slot] ? "Back to the original" : e.options.length ? "Keep it" : "No swap for your gear"}</option>
                {e.options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </label>
          ))}
        </div>
      ))}
      <label className="flex items-center justify-between rounded-2xl border border-line bg-black/20 px-4 py-3.5">
        <span>
          <span className="block text-[15px] font-semibold">Deload week 4</span>
          <span className="block text-[13px] text-muted">A lighter week so your body catches up.</span>
        </span>
        <button type="button" role="switch" aria-checked={deload} disabled={!deloadAllowed} onClick={() => { setDeload((x) => !x); setState("idle"); }} className={cn("relative h-7 w-12 rounded-full transition-colors", deload ? "bg-lime" : "bg-white/15")}>
          <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white transition-all", deload ? "left-6" : "left-1")} />
        </button>
      </label>
      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={state === "saving"}>{state === "saving" ? <Loader2 size={16} className="animate-spin" /> : null} Save my split</Button>
        {state === "saved" && <span className="text-[14px] text-lime">Saved. Your plan is updated.</span>}
        {state === "error" && <span className="text-[14px] text-danger">That didn&apos;t save. Try again.</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <section className="rounded-[20px] border border-line bg-card p-5 sm:p-6">
        <dl className="divide-y divide-line">
          {setup.map((s) => (
            <div key={s.k} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:justify-between sm:gap-6">
              <dt className="text-[14px] text-muted">{s.k}</dt>
              <dd className="text-[15px] sm:text-right">{s.v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={rebuild}><RefreshCw size={16} /> Rebuild my plan</Button>
          <span className="text-[13px] text-muted">{Math.max(0, left)} of {rebuilds.max} rebuilds left this month. Change your gear or goal, get a new plan.</span>
        </div>
      </section>

      <section className="rounded-[20px] border border-line bg-card p-5 sm:p-6">
        <div className="text-[18px] font-semibold">Custom split</div>
        <p className="mt-1 text-[14px] text-muted">Swap any exercise for one that fits your gear, move your training days, add a deload week.</p>
        <div className="mt-5">{swapsAllowed ? custom : <LockedPart label="Unlock custom splits with Elite" target="elite">{custom}</LockedPart>}</div>
      </section>
    </div>
  );
}
