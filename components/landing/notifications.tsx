"use client";

import { useEffect, useState } from "react";
import { LogoMark } from "@/components/logo";

// Example values only: what FitPlanr's own notifications look like.
const NOTES = [
  { title: "Day 1 · Full Body A", body: "Built on your 2 dumbbells. 38 min, 5 moves." },
  { title: "Goblet Squat: +5 lb", body: "You hit 12 reps on every set. 30 lb next time." },
  { title: "Week 2 unlocked", body: "Same weights, 2 more reps. You've got this." },
  { title: "Rest timer · 90 s", body: "Next: Dumbbell Row, 3 × 10 at 25 lb." },
  { title: "4 workouts in a row", body: "Your streak is on. Day 5 is ready." },
  { title: "Floor Press: new best", body: "3 × 12 at 25 lb, up from 3 × 8." },
];

type Item = { id: number; n: (typeof NOTES)[number] };

export function NotificationStack({ visible = 3 }: { visible?: number }) {
  const [reduce, setReduce] = useState(false);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduce(true);
      setItems(NOTES.slice(0, 3).map((n, i) => ({ id: i, n })));
      return;
    }
    let i = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const push = () => {
      const id = i++;
      setItems((prev) => [{ id, n: NOTES[id % NOTES.length] }, ...prev].slice(0, visible + 1));
    };
    timers.push(setTimeout(push, 0), setTimeout(push, 900), setTimeout(push, 1800));
    let iv: ReturnType<typeof setInterval> | undefined;
    timers.push(setTimeout(() => (iv = setInterval(push, 2600)), 1800));
    return () => {
      timers.forEach(clearTimeout);
      if (iv) clearInterval(iv);
    };
  }, [reduce, visible]);

  return (
    <div className="flex flex-col gap-2 px-3" aria-label="Example FitPlanr notifications">
      {items.slice(0, visible).map((it, idx) => {
          return (
            <div
              key={it.id}
              style={{ opacity: idx === 0 ? 1 : idx === 1 ? 0.82 : 0.6, transition: "opacity .4s" }}
              className={`flex items-start gap-3 rounded-[20px] border border-white/10 bg-[rgb(36_38_32/0.92)] p-3 ${reduce ? "" : "note-in"}`}
            >
              <LogoMark size={34} className="mt-0.5 shrink-0 rounded-[9px]" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-white/60">FitPlanr</span>
                  <span className="text-[11px] text-white/50">{idx === 0 ? "now" : `${idx}m ago`}</span>
                </div>
                <div className="truncate text-[14px] font-semibold text-white">{it.n.title}</div>
                <div className="text-[13px] leading-snug text-white/75">{it.n.body}</div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
