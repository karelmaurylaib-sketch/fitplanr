import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/access";
import { track } from "@/lib/kwop";

// Save Progress: records that the person asked for a resume link (the link itself is a Supabase magic link,
// sent from the browser like the password reset). The answers are already saved on every tap.
const Body = z.object({
  email: z.string().email().max(200),
  step: z.number().int().min(1).max(20),
  total: z.number().int().min(1).max(20),
  trigger: z.enum(["close", "exit", "back"]),
  device: z.enum(["phone", "computer"]),
});

export async function POST(req: Request) {
  const { sb, user } = await getSession();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { email, step, total, trigger, device } = parsed.data;
  const { error } = await sb.from("progress_saves").insert({ user_id: user.id, email: email.toLowerCase(), step, total, trigger, device });
  if (error) console.error("[progress] save failed", error.message);
  track("feature_used", user.email, `save_progress ${trigger} ${device}`);
  return NextResponse.json({ ok: true });
}
