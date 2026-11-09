"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell, BellRing, Loader2, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { enablePush, nativeInfo, savedPushToken, setReminders, type NativeInfo } from "@/lib/native";
import { cn } from "@/lib/utils";

const ON_KEY = "fp_push_reminders";
const DISMISS_KEY = "fp_push_prompt_dismissed";
const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};

function useNative() {
  const [info, setInfo] = useState<NativeInfo | null>(null);
  useEffect(() => setInfo(nativeInfo()), []);
  return info;
}

const IOS_URL = process.env.NEXT_PUBLIC_APP_STORE_URL;
const ANDROID_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL;

/** Settings → "On your phone": the reminder switch inside the app; store links on the website once the apps are live. */
export function RemindersCard() {
  const info = useNative();
  const [on, setOn] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "denied" | "error" | "tested" | "test-off">("idle");

  useEffect(() => {
    if (info?.push) setOn(!!savedPushToken() && read(ON_KEY) !== "0");
  }, [info]);

  if (!info) return null;
  if (!info.native) {
    if (!IOS_URL && !ANDROID_URL) return null;
    return (
      <section className="rounded-[20px] border border-line bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2 text-[18px] font-semibold"><Smartphone size={18} className="text-lime" /> FitPlanr on your phone</div>
        <p className="mt-1 text-[14px] text-muted">Same account, same plan. Reminders on training days and your workouts offline.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {IOS_URL && <a href={IOS_URL} className="press inline-flex h-11 items-center rounded-full bg-white px-5 text-[14px] font-semibold text-ink">App Store</a>}
          {ANDROID_URL && <a href={ANDROID_URL} className="press inline-flex h-11 items-center rounded-full bg-white px-5 text-[14px] font-semibold text-ink">Google Play</a>}
        </div>
      </section>
    );
  }
  if (!info.push) return null;

  async function toggle() {
    setState("busy");
    if (!on) {
      const r = await enablePush();
      if (r === "on") {
        write(ON_KEY, "1");
        await setReminders(true);
        setOn(true);
        return setState("idle");
      }
      return setState(r === "denied" ? "denied" : "error");
    }
    const ok = await setReminders(false);
    if (ok) {
      write(ON_KEY, "0");
      setOn(false);
    }
    setState(ok ? "idle" : "error");
  }

  async function test() {
    setState("busy");
    const r = await fetch("/api/push/test", { method: "POST" }).catch(() => null);
    setState(r?.ok ? "tested" : r?.status === 503 ? "test-off" : "error");
  }

  return (
    <section className="rounded-[20px] border border-line bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <span>
          <span className="flex items-center gap-2 text-[18px] font-semibold"><Bell size={18} className="text-lime" /> Workout reminders</span>
          <span className="mt-1 block text-[14px] text-muted">One nudge when your next workout is due. Never more than one a day.</span>
        </span>
        <button type="button" role="switch" aria-checked={on} aria-label="Workout reminders" disabled={state === "busy"} onClick={toggle} className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", on ? "bg-lime" : "bg-white/15")}>
          <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white transition-all", on ? "left-6" : "left-1")} />
        </button>
      </div>
      {on && (
        <Button size="sm" variant="outline" className="mt-4" onClick={test} disabled={state === "busy"}>
          {state === "busy" ? <Loader2 size={15} className="animate-spin" /> : <BellRing size={15} />} Send me a test
        </Button>
      )}
      {state === "tested" && <p className="mt-3 text-[14px] text-lime">Sent. It should land in a few seconds.</p>}
      {state === "test-off" && <p className="mt-3 text-[14px] text-muted">Your phone is set. Reminders start as soon as FitPlanr turns them on for everyone.</p>}
      {state === "denied" && <p className="mt-3 text-[14px] text-muted">Notifications are off for FitPlanr. Turn them on in your phone&apos;s Settings, then try again.</p>}
      {state === "error" && <p className="mt-3 text-[14px] text-danger">That didn&apos;t work. Check your connection and try again.</p>}
    </section>
  );
}

/** Dashboard, inside the app only, once: ask at a good moment (after the plan is unlocked), never on launch. */
export function RemindersPrompt() {
  const info = useNative();
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (info?.push && !savedPushToken() && !read(DISMISS_KEY)) setShow(true);
  }, [info]);

  const close = () => {
    write(DISMISS_KEY, "1");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 0.8, 0.24, 1] }}
          className="mb-4 overflow-hidden rounded-[20px] border border-lime/25 bg-lime/[0.06] p-5"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime text-lime-ink"><BellRing size={18} /></span>
            <div className="min-w-0 flex-1">
              <div className="text-[16px] font-semibold">Never miss a training day</div>
              <p className="mt-0.5 text-[14px] text-muted">One nudge when your next workout is due. Turn it off anytime in Settings.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    const r = await enablePush();
                    if (r === "on") write(ON_KEY, "1");
                    setBusy(false);
                    close();
                  }}
                >
                  {busy && <Loader2 size={15} className="animate-spin" />} Turn on reminders
                </Button>
                <Button size="sm" variant="ghost" onClick={close}>Not now</Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
