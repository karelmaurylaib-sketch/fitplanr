"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Check, Dumbbell, Pause, Play, RotateCcw, Timer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/logo";

const SCENE_MS = 8500; // 7 scenes ≈ 60 s
const EASE = [0.22, 0.8, 0.24, 1] as const;

const SCENES = [
  { label: "The problem", caption: ["Two dumbbells.", "Four hundred saved workout videos."] },
  { label: "The problem", caption: ["Every session:", "guess the moves, guess the weight."] },
  { label: "The click", caption: ["What if your plan started", "from what you actually own?"] },
  { label: "FitPlanr", caption: ["Pick your gear.", "Answer five taps."] },
  { label: "Your plan", caption: ["Your 4-week plan,", "built in 60 seconds."] },
  { label: "What changes", caption: ["Week 1: 25 lb × 8.", "Week 4: more reps, more sets. Same dumbbells."] },
  { label: "Your move", caption: ["Stop guessing.", "Start tonight."] },
];

const CHAOS = ["Bulgarian split squat?", "5×5 or 3×12?", "Arm day again?", "Is 25 lb enough?", "Push/pull/legs?", "Rest 30 s or 3 min?", "Leg day… skip?", "Which app?", "More weight or more reps?"];

function SceneArt({ i }: { i: number }) {
  if (i === 0)
    return (
      <div className="relative h-full w-full overflow-hidden">
        {CHAOS.map((t, k) => (
          <motion.span
            key={t}
            className={`absolute whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/60 sm:text-sm ${k >= 7 ? "hidden sm:block" : ""}`}
            style={{ left: `${[4, 50, 22, 56, 6, 44, 14, 66, 36][k]}%`, top: `${[4, 14, 28, 40, 52, 64, 78, 20, 88][k]}%` }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 0.7], y: [10, 0, -6] }}
            transition={{ duration: 3, delay: k * 0.25, ease: EASE }}
          >
            {t}
          </motion.span>
        ))}
      </div>
    );
  if (i === 1)
    return (
      <div className="flex h-full items-center justify-center gap-8">
        <motion.div animate={{ rotate: [0, -8, 8, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <Dumbbell className="h-16 w-16 text-white/80 sm:h-24 sm:w-24" strokeWidth={1.5} />
        </motion.div>
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/15 sm:h-32 sm:w-32">
          <motion.div className="absolute left-1/2 top-1/2 h-[42%] w-[3px] origin-bottom rounded bg-heat" style={{ translateX: "-50%", translateY: "-100%" }} animate={{ rotate: 360 }} transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }} />
          <Timer className="h-6 w-6 text-white/40" />
        </div>
        <motion.span className="font-display text-6xl font-bold text-white/30 sm:text-8xl" animate={{ opacity: [0.2, 0.7, 0.2] }} transition={{ duration: 1.4, repeat: Infinity }}>
          ?
        </motion.span>
      </div>
    );
  if (i === 2 || i === 3) {
    const gear = ["2 dumbbells", "Bench", "Pull-up bar", "Bands", "Kettlebell", "Full gym"];
    const on = i === 2 ? [0] : [0, 1];
    return (
      <div className="flex h-full flex-wrap content-center justify-center gap-2 px-6 sm:gap-3">
        {gear.map((g, k) => {
          const active = on.includes(k);
          return (
            <motion.span
              key={g}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, backgroundColor: active ? "rgb(200 255 61)" : "rgb(255 255 255 / 0.04)", color: active ? "#0a0d02" : "rgb(244 245 240 / 0.7)" }}
              transition={{ delay: 0.2 + k * 0.12 + (active ? 0.9 : 0), duration: 0.45, ease: EASE }}
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-semibold sm:text-base"
            >
              {active && <Check size={16} strokeWidth={3} />} {g}
            </motion.span>
          );
        })}
      </div>
    );
  }
  if (i === 4)
    return (
      <div className="grid h-full grid-cols-4 content-center gap-2 px-6 sm:gap-3 sm:px-14">
        {[1, 2, 3, 4].map((w) => (
          <motion.div key={w} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + w * 0.35, ease: EASE, duration: 0.5 }} className="rounded-2xl border border-white/10 bg-white/[0.03] p-2 sm:p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-lime">Week {w}</div>
            {[0, 1, 2].map((d) => (
              <motion.div key={d} className="mt-2 h-2 rounded-full bg-white/15" initial={{ width: 0 }} animate={{ width: `${60 + ((w * 13 + d * 17) % 40)}%` }} transition={{ delay: 0.6 + w * 0.35 + d * 0.1, duration: 0.5 }} />
            ))}
          </motion.div>
        ))}
      </div>
    );
  if (i === 5)
    return (
      <div className="flex h-full items-end justify-center gap-3 px-8 pb-8 sm:gap-5">
        {[8, 10, 12, 12].map((reps, k) => (
          <div key={k} className="flex flex-col items-center gap-2">
            <span className="font-display text-xl font-bold text-white sm:text-2xl">{k === 3 ? "4×12" : `3×${reps}`}</span>
            <motion.div className="w-10 rounded-t-xl bg-lime sm:w-14" initial={{ height: 0 }} animate={{ height: [36, 60, 84, 112][k] }} transition={{ delay: 0.3 + k * 0.35, duration: 0.7, ease: EASE }} style={{ opacity: 0.45 + k * 0.18 }} />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">Wk {k + 1}</span>
          </div>
        ))}
      </div>
    );
  return (
    <div className="flex h-full items-center justify-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 14 }}>
        <LogoMark size={96} />
      </motion.div>
    </div>
  );
}

export function VSL({ video }: { video?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (video || reduce || !inView || !playing || done) return;
    const start = performance.now() - elapsed;
    const id = setInterval(() => {
      const e = performance.now() - start;
      if (e >= SCENES.length * SCENE_MS) {
        clearInterval(id);
        setDone(true);
        setScene(SCENES.length - 1);
        setElapsed(SCENES.length * SCENE_MS);
        return;
      }
      setElapsed(e);
      setScene(Math.floor(e / SCENE_MS));
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, playing, done, reduce, video]);

  const replay = () => {
    setElapsed(0);
    setScene(0);
    setDone(false);
    setPlaying(true);
  };

  if (video)
    return (
      <div className="overflow-hidden rounded-[28px] border border-line bg-black">
        <video src="/vsl.mp4" muted autoPlay playsInline controls loop={false} className="aspect-video w-full" />
      </div>
    );

  const s = SCENES[scene];
  return (
    <div ref={ref} className="relative overflow-hidden rounded-[28px] border border-line bg-[#090a07]">
      <div className="pointer-events-none absolute inset-0 top-glow opacity-70" />
      <div className="relative flex aspect-[4/5] flex-col sm:aspect-video">
        {/* progress */}
        <div className="flex gap-1 px-4 pt-4 sm:px-6 sm:pt-5">
          {SCENES.map((_, k) => (
            <div key={k} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-lime" style={{ transition: "width 100ms linear", width: `${k < scene ? 100 : k > scene ? 0 : Math.min(100, ((elapsed - k * SCENE_MS) / SCENE_MS) * 100)}%` }} />
            </div>
          ))}
        </div>
        <div className="label px-4 pt-3 sm:px-6">[ {s.label} ]</div>
        <div className="relative min-h-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={scene} className="absolute inset-0" initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5, ease: EASE }}>
              <SceneArt i={scene} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="relative px-5 pb-6 sm:px-10 sm:pb-9">
          <AnimatePresence mode="wait">
            <motion.p key={scene} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45, ease: EASE }} className="display text-[30px] sm:text-[52px]">
              <span className="block">{s.caption[0]}</span>
              <span className="grad-2 block">{s.caption[1]}</span>
            </motion.p>
          </AnimatePresence>
          {scene === SCENES.length - 1 && (
            <Link href="/signup" className="press mt-4 inline-flex h-11 items-center rounded-full bg-lime px-5 text-sm font-semibold text-lime-ink">
              Build my plan
            </Link>
          )}
        </div>
        <div className="absolute right-3 top-8 flex gap-2 sm:bottom-6 sm:right-6 sm:top-auto">
          {!done && !reduce && (
            <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause the film" : "Play the film"} className="press flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}
          <button onClick={replay} aria-label="Replay the film" className="press flex h-10 items-center gap-2 rounded-full bg-white/10 px-3.5 text-sm font-medium text-white hover:bg-white/20 max-sm:h-9">
            <RotateCcw size={15} /> Replay
          </button>
        </div>
      </div>
    </div>
  );
}
