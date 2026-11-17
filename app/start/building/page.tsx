import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfile, getSession } from "@/lib/access";
import { gearLine, type Answers } from "@/lib/engine/generate";
import { Building } from "./building";

export const metadata: Metadata = { title: "Building your plan", robots: { index: false, follow: false } };

export default async function BuildingPage({ searchParams }: { searchParams: Promise<{ rebuild?: string }> }) {
  const { user } = await getSession();
  if (!user) redirect("/signup");
  const { rebuild } = await searchParams;
  const p = await getProfile();
  const a = (p?.answers ?? {}) as Partial<Answers>;
  const gear = a.gear ? gearLine(a as Answers) : "your gear";
  const steps = [
    `Reading your gear: ${gear}`,
    `Picking your split: ${a.days ?? 3} days a week`,
    "Choosing exercises that fit your body",
    "Setting safe starting weights",
    "Planning 4 weeks of progression",
  ];
  return <Building steps={steps} rebuild={!!rebuild} />;
}
