import "server-only";

// The only place that talks to Kwop. KWOP_API is a server secret: never import this from client code.

export type KwopPlan = {
  id: number;
  name: string;
  price_cents: number;
  currency: string;
  interval: string;
  per_day: string;
  yearly: { price_cents: number; per_day: string } | null;
};
export type KwopApp = { name: string; checkout: "embedded" | "redirect" | null; plans: KwopPlan[] };
export type KwopAccess = { paid: boolean; plan: { id: number; name: string } | null; status: string | null; until: string | null };

const API = () => {
  const v = process.env.KWOP_API;
  if (!v) throw new Error("KWOP_API is not set");
  return v.replace(/\/$/, "");
};

async function call<T>(path: string, init?: RequestInit & { next?: { revalidate?: number } }): Promise<{ status: number; data: T }> {
  const res = await fetch(API() + path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    signal: AbortSignal.timeout(10_000),
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { status: res.status, data };
}

let appCache: { at: number; value: KwopApp } | null = null;
export async function getApp(): Promise<KwopApp> {
  if (appCache && Date.now() - appCache.at < 120_000) return appCache.value;
  try {
    const { data } = await call<KwopApp>("", { cache: "no-store" });
    if (Array.isArray(data.plans)) {
      appCache = { at: Date.now(), value: data };
      return data;
    }
  } catch (e) {
    console.error("[kwop] GET app failed", e);
  }
  return appCache?.value ?? { name: "FitPlanr", checkout: null, plans: [] };
}

/** Plans for public, cacheable pages (structured data, comparison tables): re-read from Kwop at most once an hour. */
export async function getPlansCached(): Promise<KwopPlan[]> {
  if (!process.env.KWOP_API) return [];
  try {
    const { data } = await call<KwopApp>("", { next: { revalidate: 3600 } });
    return Array.isArray(data.plans) ? data.plans : [];
  } catch (e) {
    console.error("[kwop] GET plans (cached) failed", e);
    return [];
  }
}

const planCache = new Map<string, { at: number; value: KwopAccess }>();
export async function getPlan(email: string | null | undefined, opts: { fresh?: boolean } = {}): Promise<KwopAccess> {
  const none: KwopAccess = { paid: false, plan: null, status: null, until: null };
  if (!email) return none;
  const key = email.toLowerCase();
  // Local development only: lets the owner preview the paid app without paying. Never active in production builds.
  if (process.env.NODE_ENV === "development" && process.env.DEV_PAID_EMAIL_SUFFIX && key.endsWith(process.env.DEV_PAID_EMAIL_SUFFIX)) {
    const tier = process.env.DEV_PAID_TIER || "Pro";
    return { paid: true, plan: { id: 0, name: `FitPlanr ${tier}` }, status: "active", until: new Date(Date.now() + 20 * 86400000).toISOString() };
  }
  const hit = planCache.get(key);
  if (!opts.fresh && hit && Date.now() - hit.at < 60_000) return hit.value;
  try {
    const { status, data } = await call<KwopAccess>(`/plan?email=${encodeURIComponent(key)}`, { cache: "no-store" });
    if (status >= 500) throw new Error(`status ${status}`);
    const value: KwopAccess = { paid: !!data.paid, plan: data.plan ?? null, status: data.status ?? null, until: data.until ?? null };
    planCache.set(key, { at: Date.now(), value });
    return value;
  } catch (e) {
    console.error("[kwop] getPlan failed, keeping last known plan", e);
    return hit?.value ?? none;
  }
}

export async function createCheckout(body: { plan: number; period: "month" | "year"; email: string; k?: string | null }) {
  const payload: Record<string, unknown> = { plan: body.plan, period: body.period, email: body.email };
  if (body.k) payload.k = body.k;
  return call<{ embed?: string | null; ref?: string; fallback_url?: string; error?: string }>("/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function confirmCheckout(ref: string) {
  return call<{ ok?: boolean; paid?: boolean }>("/confirm", { method: "POST", body: JSON.stringify({ ref }) });
}

export async function cancelPlan(email: string, exceptRef?: string) {
  return call<{ message?: string; manage_url?: string }>("/cancel", {
    method: "POST",
    body: JSON.stringify(exceptRef ? { email, except_ref: exceptRef } : { email }),
  });
}

export type KwopEvent = "signup" | "onboarding_done" | "aha" | "paywall_view" | "feature_used";
/** Fire-and-forget: never blocks, never throws. */
export function track(type: KwopEvent, email: string | null | undefined, detail?: string) {
  if (!email || !process.env.KWOP_API) return;
  call("/event", { method: "POST", body: JSON.stringify(detail ? { type, email, detail } : { type, email }) }).catch((e) =>
    console.error("[kwop] event failed", type, e),
  );
}
