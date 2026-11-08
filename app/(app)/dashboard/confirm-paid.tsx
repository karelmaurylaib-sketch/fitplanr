"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { UnlockFilm } from "@/components/unlock-film";
import { Button } from "@/components/ui/button";

/** A buyer back from the fallback checkout page: confirm, then play the unlock moment. */
export function ConfirmPaid({ refId, upgrade }: { refId: string; upgrade: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "film" | "pending">("checking");
  const [plan, setPlan] = useState("your plan");

  useEffect(() => {
    let tries = 0;
    let stop = false;
    const go = async () => {
      tries++;
      try {
        const r = await fetch("/api/checkout/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ref: refId, upgrade }) });
        const j = await r.json();
        if (j.paid) {
          setPlan(j.plan?.name ?? "your plan");
          setState("film");
          return;
        }
      } catch {}
      if (stop) return;
      if (tries < 6) setTimeout(go, 2500);
      else setState("pending");
    };
    go();
    return () => {
      stop = true;
    };
  }, [refId, upgrade]);

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center text-center">
      {state === "checking" && (
        <>
          <Loader2 className="animate-spin text-lime" size={30} />
          <p className="mt-4 text-[16px] text-muted">Confirming your payment…</p>
        </>
      )}
      {state === "pending" && (
        <>
          <h1 className="display text-[32px]">Your payment is on its way.</h1>
          <p className="mt-2 max-w-sm text-muted">It can take a minute to arrive. Your plan unlocks as soon as it does.</p>
          <Button className="mt-6" onClick={() => location.reload()}>Check again</Button>
        </>
      )}
      <UnlockFilm
        open={state === "film"}
        planName={plan}
        onDone={() => {
          try {
            sessionStorage.removeItem("fp_ref");
          } catch {}
          router.replace("/dashboard");
          router.refresh();
        }}
      />
    </div>
  );
}
