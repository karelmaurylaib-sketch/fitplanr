import { NextResponse } from "next/server";
import { getSession } from "@/lib/access";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  // profiles, plans and workout_logs cascade from auth.users
  const { error } = await supabaseAdmin().auth.admin.deleteUser(user.id);
  if (error) {
    console.error("[delete] failed", error);
    return NextResponse.json({ error: "delete" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
