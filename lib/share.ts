import "server-only";
import { cache } from "react";
import { supabaseAdmin } from "./supabase/admin";
import type { Plan } from "./engine/generate";

/** Public share data: only the title, summary and Day 1. Never the rest of the plan or anything about the person. */
export const getShared = cache(async (id: string) => {
  if (!/^[\w-]{6,16}$/.test(id) || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const { data } = await supabaseAdmin().from("plans").select("data").eq("share_id", id).maybeSingle();
  if (!data) return null;
  const p = data.data as Plan;
  return { title: p.title, summary: p.summary, split: p.split, days: p.weeks[0].days.length, day1: p.weeks[0].days[0] };
});
