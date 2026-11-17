"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { MainButton } from "@/components/ui/button";
import { Ring } from "@/components/ui/motion";
import { device } from "@/lib/device";

export type ExitTrigger = "close" | "exit" | "back";

/**
 * Watches for someone about to leave the setup flow.
 * - tab / window close or reload: the browser's own "Leave site?" prompt, and if they stay, our Save Progress modal.
 * - computer: the mouse leaves through the top of the window (towards the tabs / address bar).
 * - phone and computer: the browser back button (one history entry is kept as a guard).
 * The modal opens once per visit; the close prompt stays on until they save or finish.
 */
export function useExitIntent(armed: boolean, onExit: (t: ExitTrigger) => void) {
  const armedRef = useRef(armed);
  const cb = useRef(onExit);
  const shown = useRef(false);
  armedRef.current = armed;
  cb.current = onExit;

  useEffect(() => {
    try {
      shown.current = sessionStorage.getItem("fp_save_shown") === "1";
    } catch {}
    const fire = (t: ExitTrigger) => {
      if (!armedRef.current) return;
      if (shown.current && t !== "close") return;
      shown.current = true;
      try {
        sessionStorage.setItem("fp_save_shown", "1");
      } catch {}
      cb.current(t);
    };

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!armedRef.current) return;
      e.preventDefault();
      e.returnValue = "";
      // only runs if they chose to stay on the page
      setTimeout(() => fire("close"), 60);
    };
    const onMouseOut = (e: MouseEvent) => {
      if (e.relatedTarget || e.clientY > 8 || device() === "phone") return;
      fire("exit");
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("mouseout", onMouseOut);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, []);

  // back-button guard, set up once the flow is armed
  useEffect(() => {
    if (!armed) return;
    if (!(history.state && history.state.fpGuard)) history.pushState({ ...(history.state ?? {}), fpGuard: true }, "");
    const onPop = (e: PopStateEvent) => {
      if (e.state && e.state.fpGuard) return;
      if (shown.current || !armedRef.current) return; // second back: let them go
      shown.current = true;
      try {
        sessionStorage.setItem("fp_save_shown", "1");
      } catch {}
      history.pushState({ ...(history.state ?? {}), fpGuard: true }, "");
      cb.current("back");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [armed]);
}

export function SaveProgress({
  open,
  onStay,
  onSaved,
  trigger,
  email,
  step,
  total,
}: {
  open: boolean;
  onStay: () => void;
  onSaved: () => void;
  trigger: ExitTrigger;
  email: string;
  step: number;
  total: number;
  }) {
  const [value, setValue] = useState(email);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");
  const done = Math.max(0, step - 1);
  const left = Math.max(1, total - done);

  useEffect(() => {
    if (open) {
      setState((s) => (s === "sent" ? s : "idle"));
      setValue((v) => v || email);
    }
  }, [open, email]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(v)) {
      setState("error");
      return setMsg("That email doesn't look right.");
    }
    if (email && v !== email.toLowerCase()) {
      setState("error");
      return setMsg(`Use the email you signed up with (${email}): the link opens your account.`);
    }
    setState("sending");
    try {
      // loaded on demand: keeps the Supabase client out of the flow's first load
      const { supabaseBrowser } = await import("@/lib/supabase/client");
      const { error } = await supabaseBrowser().auth.signInWithOtp({ email: v, options: { shouldCreateUser: false, emailRedirectTo: `${location.origin}/auth/callback?next=/start` } });
      if (error) throw error;
      fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: v, step, total, trigger, device: device() }) }).catch(() => {});
      setState("sent");
      onSaved();
    } catch (err) {
      setState("error");
      const m = err instanceof Error ? err.message : "";
      setMsg(/rate|seconds/i.test(m) ? "A link was sent a moment ago. Check your inbox, or try again in a minute." : "The email didn't go out. Check your connection and try again. Your answers are saved either way.");
    }
  }

  return (
    <Sheet open={open} onClose={onStay} label="Save your progress" variant="bottom" closeSide="right" z={70} width={460}>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-3 sm:px-7 sm:pt-7">
        <div className="flex items-center gap-4 pr-12">
          <Ring value={done / total} size={68} stroke={6}>
            <span className="font-display text-[19px] font-bold tabular-nums">{Math.round((done / total) * 100)}%</span>
          </Ring>
          <div>
            <div className="label">[ Save your progress ]</div>
            <h2 className="display mt-1.5 text-[30px] sm:text-[34px]">{left === 1 ? "One tap from your plan." : `${left} taps from your plan.`}</h2>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {state === "sent" ? (
            <motion.div key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mt-5">
              <div className="flex gap-3 rounded-[18px] border border-lime/40 bg-lime/[0.07] p-4 text-[15px]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime text-lime-ink">
                  <Check size={15} strokeWidth={3.5} />
                </span>
                <span>
                  <span className="block font-semibold">Link sent to {value}.</span>
                  <span className="text-muted">Open it on this device: it brings you back to question {step} of {total}, with every answer in place.</span>
                </span>
              </div>
              <MainButton className="mt-5 w-full" onClick={onStay}>
                Keep building my plan
              </MainButton>
            </motion.div>
          ) : (
            <motion.div key="form" initial={false} exit={{ opacity: 0, y: -6 }} className="mt-4">
              <p className="text-[15px] leading-relaxed text-muted">Every answer is saved to your account. Finish now and your plan is ready in about a minute.</p>
              <MainButton className="mt-5 w-full" onClick={onStay}>
                Keep building my plan
              </MainButton>
              <div className="my-5 flex items-center gap-3 text-[12px] uppercase tracking-[0.16em] text-dim">
                <span className="h-px flex-1 bg-line" /> or finish later <span className="h-px flex-1 bg-line" />
              </div>
              <form onSubmit={send} noValidate>
                <label htmlFor="save-email" className="text-[13px] font-medium text-fg/80">
                  Email me a link back to question {step}
                </label>
                <div className="mt-2 flex gap-2 max-sm:flex-col">
                  <input
                    id="save-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      if (state === "error") setState("idle");
                    }}
                    className="h-12 w-full min-w-0 rounded-full sm:flex-1 border border-line-2 bg-white/[0.03] px-5 text-[15px] outline-none focus:border-lime/60"
                  />
                  <button type="submit" disabled={state === "sending"} className="press inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-[15px] font-semibold text-ink hover:bg-[#ececec] disabled:opacity-60">
                    {state === "sending" ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />} Email me a link
                  </button>
                </div>
                {state === "error" && (
                  <p role="alert" className="mt-2 text-[13px] text-danger">
                    {msg}
                  </p>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Sheet>
  );
}
