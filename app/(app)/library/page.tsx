import type { Metadata } from "next";
import { PageTitle } from "@/components/app-shell";
import { requirePaid } from "@/lib/guard";
import { EXERCISES } from "@/lib/engine/exercises";
import { LibraryClient } from "./client";

export const metadata: Metadata = { title: "Form library", robots: { index: false, follow: false } };

export default async function LibraryPage() {
  const { access, plan } = await requirePaid();
  const inPlan = new Set(plan.data.weeks.flatMap((w) => w.days.flatMap((d) => d.exercises.map((e) => e.exId))));
  const list = EXERCISES.map((e) => ({ id: e.id, name: e.name, pattern: e.pattern, muscles: e.muscles, anim: e.anim, inPlan: inPlan.has(e.id) }));
  return (
    <div>
      <PageTitle label="Form library" title="Every move, shown" />
      <LibraryClient list={list} full={access.quota.fullLibrary} />
    </div>
  );
}
