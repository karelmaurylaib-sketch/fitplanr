import "server-only";
import { cookies } from "next/headers";
import { getSession } from "./access";
import { track } from "./kwop";

/** After sign-up / log-in: store the Kwop link (k), intended plan and source on the profile, once. */
export async function attachProfile(): Promise<boolean> {
  const { sb, user } = await getSession();
  if (!user) return false;
  const jar = await cookies();
  const { data: p } = await sb.from("profiles").select("k, intended_plan, source, created_at").eq("id", user.id).maybeSingle();
  const patch: Record<string, string> = {};
  const k = jar.get("kwop_k")?.value;
  if (k && /^[A-Za-z0-9]{1,12}$/.test(k) && !p?.k) patch.k = k;
  const plan = jar.get("fp_plan")?.value;
  if (plan && !p?.intended_plan) patch.intended_plan = plan.slice(0, 40);
  const src = jar.get("fp_src")?.value;
  if (src && !p?.source) patch.source = src.slice(0, 200);
  if (!p) {
    await sb.from("profiles").insert({ id: user.id, email: user.email, ...patch });
  } else if (Object.keys(patch).length) {
    await sb.from("profiles").update(patch).eq("id", user.id);
  }
  const fresh = !p || Date.now() - new Date(p.created_at).getTime() < 5 * 60_000;
  if (fresh) track("signup", user.email);
  return true;
}
