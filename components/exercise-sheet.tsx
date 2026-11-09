"use client";

import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { FormMirror } from "@/components/form-mirror";
import { FormAnim } from "@/components/form-anim";
import { EXERCISE_BY_ID } from "@/lib/engine/exercises";
import type { PlannedExercise } from "@/lib/engine/generate";

export function ExerciseSheet({ exercise, onClose }: { exercise: PlannedExercise | { exId: string; name: string } | null; onClose: () => void }) {
  const ex = exercise ? EXERCISE_BY_ID[exercise.exId] : null;
  const pe = exercise && "sets" in exercise ? exercise : null;
  const [mirror, setMirror] = useState(false);
  useEffect(() => setMirror(false), [exercise]);
  return (
    <>
    <Sheet open={!!ex} onClose={onClose} variant="bottom" label={ex?.name ?? "Exercise"} closeSide="right" z={70}>
      {ex && (
        <div className="overflow-y-auto px-5 pb-8 pt-2 sm:px-7 sm:pt-6">
          <div className="label">[ Form guide ]</div>
          <h2 className="display mt-2 pr-12 text-[32px]">{ex.name}</h2>
          <div className="mt-1 text-[14px] text-muted">{ex.muscles.join(" · ")}</div>
          <div className="mx-auto mt-5 aspect-square w-full max-w-[300px] rounded-[24px] border border-line bg-black/40 p-4">
            <FormAnim anim={ex.anim} className="h-full w-full" />
          </div>
          <button onClick={() => setMirror(true)} className="press mx-auto mt-3 flex h-11 items-center gap-2 rounded-full border border-line-2 bg-white/[0.03] px-5 text-[14px] font-semibold hover:bg-white/[0.07]">
            <Camera size={16} className="text-lime" /> Check my form with the camera
          </button>
          {pe && (
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-white/[0.04] p-3"><div className="font-display text-2xl font-bold">{pe.sets} × {pe.target}</div><div className="text-[12px] text-muted">{pe.unit === "sec" ? "sets × seconds" : "sets × reps"}</div></div>
              <div className="rounded-2xl bg-white/[0.04] p-3"><div className="font-display text-2xl font-bold">{pe.load ? `${pe.load} lb` : "BW"}</div><div className="text-[12px] text-muted">{pe.loadLabel || "load"}</div></div>
              <div className="rounded-2xl bg-white/[0.04] p-3"><div className="font-display text-2xl font-bold">{pe.rest}s</div><div className="text-[12px] text-muted">rest</div></div>
            </div>
          )}
          <ol className="mt-6 space-y-3">
            {ex.cues.map((c, i) => (
              <li key={c} className="flex gap-3 text-[16px]">
                <span className="font-mono text-[13px] text-lime">0{i + 1}</span>
                {c}
              </li>
            ))}
          </ol>
          <p className="mt-6 text-[13px] text-dim">Stop if you feel sharp pain. A little muscle burn is normal; joint pain is not.</p>
        </div>
      )}
    </Sheet>
    {ex && <FormMirror ex={ex} open={mirror} onClose={() => setMirror(false)} />}
    </>
  );
}
