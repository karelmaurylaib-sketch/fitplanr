"use client";

import { Lock, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { FormAnim } from "@/components/form-anim";
import { ExerciseSheet } from "@/components/exercise-sheet";
import { useUpgrade } from "@/components/paywall/upgrade";
import type { Anim } from "@/lib/engine/exercises";
import { cn } from "@/lib/utils";

type Item = { id: string; name: string; pattern: string; muscles: string[]; anim: Anim; inPlan: boolean };

export function LibraryClient({ list, full }: { list: Item[]; full: boolean }) {
  const { open: upgrade } = useUpgrade();
  const [q, setQ] = useState("");
  const [onlyPlan, setOnlyPlan] = useState(!full);
  const [sel, setSel] = useState<{ exId: string; name: string } | null>(null);
  const shown = useMemo(() => list.filter((x) => (!onlyPlan || x.inPlan) && (x.name + " " + x.muscles.join(" ")).toLowerCase().includes(q.toLowerCase())).sort((a, b) => Number(b.inPlan) - Number(a.inPlan)), [list, q, onlyPlan]);
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: squat, chest, biceps…" className="h-12 w-full rounded-full border border-line-2 bg-black/40 pl-11 pr-4 text-[15px] outline-none focus:border-lime/60" aria-label="Search exercises" />
        </label>
        <div className="flex rounded-full border border-line bg-card p-1 text-[14px]">
          <button onClick={() => setOnlyPlan(true)} className={cn("press rounded-full px-4 py-2", onlyPlan ? "bg-white text-ink" : "text-muted")}>In my plan</button>
          <button onClick={() => (full ? setOnlyPlan(false) : upgrade("Unlock the full form library with Pro", "pro"))} className={cn("press flex items-center gap-1.5 rounded-full px-4 py-2", !onlyPlan ? "bg-white text-ink" : "text-muted")}>{!full && <Lock size={13} />} All {list.length}</button>
        </div>
      </div>
      {shown.length === 0 ? (
        <p className="mt-10 text-center text-[15px] text-muted">No exercise matches “{q}”.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {shown.map((x) => (
            <button key={x.id} onClick={() => setSel({ exId: x.id, name: x.name })} className="press rounded-[20px] border border-line bg-card p-3 text-left hover:border-line-2">
              <div className="aspect-square rounded-2xl bg-black/30 p-2"><FormAnim anim={x.anim} className="h-full w-full" /></div>
              <div className="mt-3 text-[15px] font-semibold leading-tight">{x.name}</div>
              <div className="mt-0.5 text-[12px] text-muted">{x.muscles.join(" · ")}</div>
              {x.inPlan && <div className="mt-2 inline-block rounded-full bg-lime/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-lime">In your plan</div>}
            </button>
          ))}
        </div>
      )}
      <ExerciseSheet exercise={sel} onClose={() => setSel(null)} />
    </div>
  );
}
