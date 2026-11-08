import { NextResponse } from "next/server";
import { getSession } from "@/lib/access";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sb, user } = await getSession();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!/^[0-9a-f-]{36}$/.test(id)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { error } = await sb.from("workout_logs").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "delete" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
