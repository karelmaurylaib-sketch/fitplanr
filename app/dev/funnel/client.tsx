"use client";

import { useState } from "react";
import { StartFlow } from "@/app/start/flow";
import { PlanResult } from "@/app/plan/result";
import type { Plan } from "@/lib/engine/generate";
import type { Projection } from "@/lib/projection";
import type { PublicPlan } from "@/lib/pricing";

type Props = { view: "flow" | "plan"; fail: boolean; atSync?: boolean; projection: Projection; plan: Plan; plans: PublicPlan[]; personal: string };

declare global {
  interface Window {
    __fpEvents?: { url: string; body: unknown }[];
  }
}

/** Mocks the /api routes in the browser before the children mount (development only). */
function useMockApi(p: Props) {
  useState(() => {
    if (typeof window === "undefined") return 0;
    const real = window.fetch.bind(window);
    window.__fpEvents = [];
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.pathname : input.url;
      if (!url.startsWith("/api/")) return real(input, init);
      let body: unknown = null;
      try {
        body = init?.body ? JSON.parse(String(init.body)) : null;
      } catch {}
      window.__fpEvents!.push({ url, body });
      const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
      await new Promise((r) => setTimeout(r, 350));
      if (url.startsWith("/api/plan/preview")) return p.fail ? json({ error: "preview" }, 500) : json({ projection: p.projection });
      if (url.startsWith("/api/checkout")) return json({ error: "payments_off" }, 409);
      return json({ ok: true });
    };
    return 1;
  });
}

export function DevFunnel(p: Props) {
  useMockApi(p);
  if (p.view === "plan") return <PlanResult plan={p.plan} locked plans={p.plans} preselect={null} shareId={null} personal={p.personal} projection={p.projection} />;
  // ?at=sync: the first five answers are already saved, so the flow resumes at Equipment Sync
  return <StartFlow initial={p.atSync ? { goal: "muscle", level: "new", days: 3, minutes: 45, protect: [] } : {}} email="you@example.com" />;
}
