import "server-only";
import { cache } from "react";
import { supabaseAdmin } from "./supabase/admin";
import { validAnswers, type Plan } from "./engine/generate";
import { fmtLb, projectPlan } from "./projection";

/** Public share data: only the title, summary and Day 1. Never the rest of the plan or anything about the person. */
export const getShared = cache(async (id: string) => {
  if (!/^[\w-]{6,16}$/.test(id) || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const { data } = await supabaseAdmin().from("plans").select("data, inputs").eq("share_id", id).maybeSingle();
  if (!data) return null;
  const p = data.data as Plan;
  // the projection is an aggregate estimate (no answers, no personal data): safe to show publicly
  const pr = validAnswers(data.inputs) ? projectPlan(p, data.inputs) : null;
  const projection = pr ? `+${fmtLb(pr.muscleLo)}–${fmtLb(pr.muscleHi)} lb of muscle in 12 weeks (estimate)` : null;
  return { title: p.title, summary: p.summary, split: p.split, days: p.weeks[0].days.length, day1: p.weeks[0].days[0], projection };
});

