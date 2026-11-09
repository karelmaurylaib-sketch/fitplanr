import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/access";
import { track } from "@/lib/kwop";
import { supabaseAdmin } from "@/lib/supabase/admin";

// A native app registers its push token here. The token is tied to the signed-in account (checked on the server);
// a phone that switches accounts moves its token to the new account.
const Token = z.string().min(32).max(4096).regex(/^[\w\-:.]+$/);
const Register = z.object({ token: Token, platform: z.enum(["ios", "android"]) });
const Update = z.object({ token: Token, reminders: z.boolean() });
const Remove = z.object({ token: Token });

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const p = Register.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { data: existing } = await supabaseAdmin().from("push_devices").select("user_id").eq("token", p.data.token).maybeSingle();
  const { error } = await supabaseAdmin()
    .from("push_devices")
    .upsert({ token: p.data.token, platform: p.data.platform, user_id: user.id, updated_at: new Date().toISOString(), ...(existing?.user_id === user.id ? {} : { reminders: true }) }, { onConflict: "token" });
  if (error) {
    console.error("[push] register", error);
    return NextResponse.json({ error: "save" }, { status: 500 });
  }
  if (existing?.user_id !== user.id) track("feature_used", user.email, "Push reminders");
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const { sb, user } = await getSession();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const p = Update.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { error } = await sb.from("push_devices").update({ reminders: p.data.reminders, updated_at: new Date().toISOString() }).eq("token", p.data.token).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "save" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { sb, user } = await getSession();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const p = Remove.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  await sb.from("push_devices").delete().eq("token", p.data.token).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
