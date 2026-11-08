import "server-only";
import { supabaseAdmin } from "./supabase/admin";

let cached: { at: number; v: number | null } | null = null;

/** A TRUE count from the database, shown only once it is worth showing (100+). */
export async function publicPlanCount(): Promise<number | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  if (cached && Date.now() - cached.at < 10 * 60_000) return cached.v;
  try {
    const { count } = await supabaseAdmin().from("plans").select("id", { count: "exact", head: true });
    const v = count && count >= 100 ? Math.floor(count / 10) * 10 : null;
    cached = { at: Date.now(), v };
    return v;
  } catch {
    return null;
  }
}
