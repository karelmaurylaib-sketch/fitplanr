import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getAccess, getActivePlan, getProfile, getSession } from "@/lib/access";
import { generatePlan, validAnswers } from "@/lib/engine/generate";
import { track } from "@/lib/kwop";
import { nextTier } from "@/lib/tiers";

export async function POST(req: Request) {
  const { sb, user } = await getSession();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { rebuild?: boolean };
  const [profile, active] = await Promise.all([getProfile(), getActivePlan()]);
  const answers = profile?.answers;
  if (!validAnswers(answers)) return NextResponse.json({ error: "answers", message: "A few answers are missing." }, { status: 400 });

  if (active && !body.rebuild) return NextResponse.json({ id: active.id, existing: true });

  if (active && body.rebuild) {
    const access = await getAccess();
    if (!access.kwop.paid || !access.quota) return NextResponse.json({ error: "paywall" }, { status: 402 });
    if (access.usage.rebuilds >= access.quota.rebuilds) {
      return NextResponse.json({ error: "quota", kind: "rebuilds", next: nextTier(access.tier) }, { status: 402 });
    }
  }

  const access = active ? await getAccess() : null;
  const options = { deload: !!(access?.quota?.deload && (active?.options as { deload?: boolean } | undefined)?.deload) };
  const plan = generatePlan(answers, options);
  if (active) await sb.from("plans").update({ is_active: false }).eq("user_id", user.id).eq("is_active", true);
  const { data, error } = await sb
    .from("plans")
    .insert({ user_id: user.id, inputs: answers, options, data: plan, is_active: true, share_id: randomBytes(6).toString("base64url") })
    .select("id")
    .single();
  if (error?.code === "23505") {
    // a parallel request already created the plan: return that one
    const again = await getActivePlan();
    if (again) return NextResponse.json({ id: again.id, existing: true });
  }
  if (error || !data) return NextResponse.json({ error: "save", message: "We couldn't save your plan." }, { status: 500 });
  await sb.from("profiles").update({ onboarded: true }).eq("id", user.id);
  if (active) track("feature_used", user.email, "plan_rebuild");
  else track("onboarding_done", user.email);
  return NextResponse.json({ id: data.id });
}
