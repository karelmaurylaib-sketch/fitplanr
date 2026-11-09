import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/access";
import { cancelPlan, confirmCheckout, getPlan, track } from "@/lib/kwop";
import { shortPlanName } from "@/lib/utils";
import { startTrial } from "@/lib/trial";

const Body = z.object({ ref: z.string().min(4).max(128).regex(/^[\w\-:.]+$/), upgrade: z.boolean().optional() });

export async function POST(req: Request) {
  const { sb, user } = await getSession();
  if (!user?.email) return NextResponse.json({ error: "auth" }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    const before = parsed.data.upgrade ? await getPlan(user.email, { fresh: true }) : null;
    const { data } = await confirmCheckout(parsed.data.ref);
    const access = await getPlan(user.email, { fresh: true });
    if (!access.paid) return NextResponse.json({ paid: false, ok: !!data.ok });
    if (parsed.data.upgrade && before?.paid && before.plan?.id !== access.plan?.id) {
      // never two plans billed: the old one stops at the end of its period
      cancelPlan(user.email, parsed.data.ref).catch((e) => console.error("[upgrade] cancel old failed", e));
    }
    if (await startTrial(user.id, parsed.data.ref)) track("feature_used", user.email, "free_trial");
    const { data: p } = await sb.from("profiles").select("unlocked_seen").eq("id", user.id).maybeSingle();
    if (!p?.unlocked_seen) {
      await sb.from("profiles").update({ unlocked_seen: true }).eq("id", user.id);
      track("aha", user.email);
    }
    return NextResponse.json({ paid: true, plan: access.plan ? { id: access.plan.id, name: shortPlanName(access.plan.name) } : null });
  } catch (e) {
    console.error("[confirm] failed", e);
    return NextResponse.json({ error: "confirm" }, { status: 502 });
  }
}
