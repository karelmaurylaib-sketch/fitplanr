"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarCheck, Dumbbell, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/logo";

/** The unlock moment: 3 short scenes in ~5 s, skippable. */
export function UnlockFilm({ open, planName, onDone }: { open: boolean; planName: string; onDone: () => void }) {
  const reduce = useReducedMotion();
  const [scene, setScene] = useState(0);

  useEffect(() => {
    if (!open) return;
    setScene(0);
    const step = reduce ? 700 : 1700;
    const t1 = setTimeout(() => setScene(1), step);
    const t2 = setTimeout(() => setScene(2), step * 2);
    const t3 = setTimeout(onDone, step * 3);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [open, reduce, onDone]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-label="Your plan is unlocked">
          <div className="dot-grid pointer-events-none absolute inset-0" />
          <motion.div className="pointer-events-none absolute h-[520px] w-[520px] rounded-full bg-lime/20 blur-[120px]" animate={{ scale: [0.8, 1.15, 1] }} transition={{ duration: 3 }} />
          <button onClick={onDone} aria-label="Skip" className="press absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <X size={18} />
          </button>
          <AnimatePresence mode="wait">
            {scene === 0 && (
              <motion.div key="s0" className="relative text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ type: "spring", damping: 16 }}>
                <LogoMark size={72} className="mx-auto" />
                <div className="label mt-8">[ Unlocked ]</div>
                <h2 className="display mt-3 text-[52px] sm:text-[80px]">You&apos;re on {planName}</h2>
              </motion.div>
            )}
            {scene === 1 && (
              <motion.div key="s1" className="relative px-6 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h2 className="display text-[38px] sm:text-[56px]">Now unlocked</h2>
                <div className="mt-8 flex justify-center gap-4 sm:gap-8">
                  {[
                    { i: CalendarCheck, t: "All 4 weeks" },
                    { i: TrendingUp, t: "Auto progression" },
                    { i: Dumbbell, t: "Set logging" },
                  ].map((x, k) => (
                    <motion.div key={x.t} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + k * 0.18, type: "spring", damping: 12 }} className="flex w-24 flex-col items-center gap-3">
                      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lime text-lime-ink"><x.i size={28} /></span>
                      <span className="text-[13px] font-medium text-fg/85">{x.t}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            {scene === 2 && (
              <motion.h2 key="s2" className="display relative text-[72px] text-lime sm:text-[120px]" initial={{ opacity: 0, scale: 1.3 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", damping: 14 }}>
                Let&apos;s go
              </motion.h2>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
