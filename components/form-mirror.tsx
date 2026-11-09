"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Camera, CameraOff, Loader2, ShieldCheck, SwitchCamera } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FormAnim } from "@/components/form-anim";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { Exercise } from "@/lib/engine/exercises";

type Phase = "asking" | "live" | "denied" | "none";

/**
 * Form mirror: the phone's camera as a mirror, next to the moving form guide and its cues.
 * Uses the camera of the phone (native app) or the computer (website). Nothing is recorded or uploaded.
 */
export function FormMirror({ ex, open, onClose }: { ex: Exercise; open: boolean; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>("asking");
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [cue, setCue] = useState(0);
  const [tick, setTick] = useState(0);
  const reduce = useReducedMotion();

  const stop = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }, []);

  useEffect(() => {
    if (!open) return;
    let dead = false;
    setPhase("asking");
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) return setPhase("none");
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false });
        if (dead) return s.getTracks().forEach((t) => t.stop());
        stop();
        stream.current = s;
        if (video.current) {
          video.current.srcObject = s;
          await video.current.play().catch(() => {});
        }
        setPhase("live");
      } catch (e) {
        const name = (e as { name?: string }).name;
        setPhase(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "none");
      }
    })();
    return () => {
      dead = true;
      stop();
    };
  }, [open, facing, tick, stop]);

  useEffect(() => {
    if (!open) return;
    fetch("/api/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "feature_used", detail: "Form mirror" }) }).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open || phase !== "live" || ex.cues.length < 2) return;
    const t = setInterval(() => setCue((c) => (c + 1) % ex.cues.length), 4200);
    return () => clearInterval(t);
  }, [open, phase, ex.cues.length]);

  return (
    <Sheet open={open} onClose={onClose} variant="full" label={`Form mirror: ${ex.name}`} closeSide="left" z={90} width={560}>
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-5 pt-16 sm:px-6 sm:pt-6">
        <div className="flex items-end justify-between gap-3 sm:pl-0">
          <div className="sm:pl-14">
            <div className="label">[ Form mirror ]</div>
            <h2 className="display mt-1 text-[28px] leading-none">{ex.name}</h2>
          </div>
          {phase === "live" && (
            <button onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))} aria-label="Switch camera" className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12]">
              <SwitchCamera size={18} />
            </button>
          )}
        </div>

        <div className="relative mt-4 min-h-[300px] flex-1 overflow-hidden rounded-[24px] border border-line bg-black sm:aspect-[4/3] sm:flex-none">
          <video ref={video} playsInline muted autoPlay className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${phase === "live" ? "opacity-100" : "opacity-0"} ${facing === "user" ? "-scale-x-100" : ""}`} />

          {phase === "asking" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-[15px] text-muted">
              <Loader2 size={24} className="animate-spin text-lime" />
              Turning on your camera…
            </div>
          )}
          {(phase === "denied" || phase === "none") && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] text-muted"><CameraOff size={24} /></span>
              <div className="mt-4 text-[17px] font-semibold">{phase === "denied" ? "FitPlanr can't see the camera" : "No camera found"}</div>
              <p className="mt-1 max-w-[300px] text-[14px] text-muted">
                {phase === "denied" ? "Allow the camera for FitPlanr in your phone's Settings, then try again. The form guide still works below." : "Use the form guide and the cues: they show the full movement."}
              </p>
              {phase === "denied" && (
                <Button size="sm" variant="outline" className="mt-4" onClick={() => setTick((t) => t + 1)}>
                  <Camera size={15} /> Try again
                </Button>
              )}
            </div>
          )}

          {/* the guide, as a picture-in-picture over the mirror */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 0.8, 0.24, 1], delay: 0.15 }}
            className={phase === "live" ? "absolute right-3 top-3 w-[34%] max-w-[170px] rounded-2xl border border-white/10 bg-black/60 p-2 backdrop-blur-md" : "absolute bottom-3 right-3 w-[30%] max-w-[150px] rounded-2xl border border-white/10 bg-black/60 p-2"}
          >
            <div className="aspect-square"><FormAnim anim={ex.anim} className="h-full w-full" /></div>
            <div className="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-lime">Match this</div>
          </motion.div>

          {phase === "live" && (
            <div className="absolute inset-x-3 bottom-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={cue}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.22, 0.8, 0.24, 1] }}
                  className="flex gap-3 rounded-2xl bg-black/70 px-4 py-3 text-[15px] backdrop-blur-md"
                >
                  <span className="font-mono text-[13px] text-lime">0{cue + 1}</span>
                  {ex.cues[cue]}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[13px] text-muted">
          <ShieldCheck size={14} className="text-lime" /> Nothing is recorded. The video never leaves your device.
        </p>
      </div>
    </Sheet>
  );
}
