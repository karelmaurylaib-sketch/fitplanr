"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Ring } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MIN_MS = 6500;

export function Building({ steps, rebuild }: { steps: string[]; rebuild: boolean }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [pct, setPct] = useState(0);
  const [state, setState] = useState<"work" | "ready" | "error" | "quota">("work");
  const [attempt, setAttempt] = useState(0);
  const result = useRef<{ id?: string; error?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    result.current = null;
    setPct(0);
    setState("work");
    const t0 = performance.now();

    const call = async (tries: number): Promise<void> => {
      try {
        const r = await fetch("/api/plan/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rebuild }) });
        const j = await r.json();
        if (r.status === 402 && j.error === "quota") {
          result.current = { error: "quota" };
          return;
        }
        if (r.status === 400 && j.error === "answers") {
          router.replace(rebuild ? "/start?rebuild=1" : "/start");
          return;
        }
        if (!r.ok || !j.id) throw new Error(j.error || "failed");
        result.current = { id: j.id };
      } catch {
        if (tries > 0) return call(tries - 1);
        result.current = { error: "failed" };
      }
    };
    call(1);

    let raf = 0;
    const loop = (now: number) => {
      if (cancelled) return;
      const e = now - t0;
      const target = Math.min(99, (e / MIN_MS) * 100);
      setPct((p) => Math.max(p, target));
      const r = result.current;
      if (r && e >= MIN_MS) {
        if (r.id) {
          setPct(100);
          setState("ready");
          setTimeout(() => router.replace(rebuild ? "/workout?rebuilt=1" : "/plan"), reduce ? 400 : 1700);
          return;
        }
        setState(r.error === "quota" ? "quota" : "error");
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [attempt, rebuild, router, reduce]);

  const doneSteps = Math.min(steps.length, Math.floor((pct / 100) * (steps.length + 0.2)));

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-[560px] flex-col justify-center px-5 py-12">
      <div className="top-glow pointer-events-none absolute inset-0" />
      {/* the plan assembling softly behind */}
      <div className="pointer-events-none absolute inset-x-5 top-16 grid grid-cols-4 gap-2 opacity-[0.16]" aria-hidden>
        {[0, 1, 2, 3].map((w) => (
          <motion.div key={w} initial={{ opacity: 0, y: 20 }} animate={{ opacity: pct > 20 + w * 18 ? 1 : 0, y: pct > 20 + w * 18 ? 0 : 20 }} transition={{ duration: 0.6 }} className="space-y-1.5 rounded-xl border border-white/20 p-2">
            <div className="h-2 w-1/2 rounded bg-lime" />
            {[0, 1, 2, 3].map((r) => (
              <div key={r} className="h-1.5 rounded bg-white/40" style={{ width: `${55 + ((w + r * 3) % 4) * 11}%` }} />
            ))}
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {state === "work" && (
          <motion.div key="work" exit={{ opacity: 0, y: -10 }} className="relative">
            <div className="label">[ Building your plan ]</div>
            <div className="mt-6 flex items-center gap-6">
              <Ring value={pct / 100} size={112} stroke={9}>
                <span className="font-display text-[34px] font-bold tabular-nums">{Math.floor(pct)}%</span>
              </Ring>
              <h1 className="display text-[34px] sm:text-[44px]">Building your plan…</h1>
            </div>
            <ul className="mt-10 space-y-3">
              {steps.map((s, i) => {
                const done = i < doneSteps;
                const active = i === doneSteps;
                return (
                  <motion.li key={s} initial={{ opacity: 0, x: -8 }} animate={{ opacity: done || active ? 1 : 0.4, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3.5 text-[16px]">
                    <span className={cn("flex h-7 w-7 items-center justify-center rounded-full border transition-colors duration-300", done ? "border-lime bg-lime text-lime-ink" : "border-white/20")}>
                      {done ? (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}>
                          <Check size={15} strokeWidth={3.5} />
                        </motion.span>
                      ) : active ? (
                        <Loader2 size={14} className="animate-spin text-lime" />
                      ) : null}
                    </span>
                    <span className={done ? "text-fg" : "text-fg/70"}>{s}</span>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
        {state === "ready" && (
          <motion.div key="ready" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", damping: 16 }} className="relative text-center">
            <motion.div initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 10, stiffness: 180 }} className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-lime text-lime-ink shadow-[0_0_80px_rgb(200_255_61/0.5)]">
              <Check size={46} strokeWidth={3} />
            </motion.div>
            <h1 className="display mt-8 text-[40px] sm:text-[52px]">Your 4-week plan is ready.</h1>
          </motion.div>
        )}
        {(state === "error" || state === "quota") && (
          <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
            <h1 className="display text-[34px]">{state === "quota" ? "You've used this month's rebuilds." : "That didn't work this time."}</h1>
            <p className="mt-3 text-[16px] text-muted">
              {state === "quota" ? "Your current plan is still here. A bigger plan gives you more rebuilds every month." : "Your answers are saved. Give it another try."}
            </p>
            <div className="mt-6 flex gap-3">
              {state === "quota" ? (
                <Link href="/account?upgrade=1" className="press inline-flex h-12 items-center rounded-full bg-lime px-6 font-semibold text-lime-ink">See what's next</Link>
              ) : (
                <Button onClick={() => setAttempt((x) => x + 1)}>Try again</Button>
              )}
              <Link href="/" className="press inline-flex h-12 items-center rounded-full px-5 text-muted hover:text-fg">Back</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
