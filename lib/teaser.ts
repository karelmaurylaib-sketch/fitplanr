import type { Plan } from "./engine/generate";

/** What a person who has not paid receives: Week 1 Day 1 in full, everything else masked (never sent to the browser). */
export function teaserPlan(plan: Plan): Plan {
  return {
    ...plan,
    weeks: plan.weeks.map((w) => ({
      ...w,
      days: w.days.map((d) =>
        w.week === 1 && d.day === 1
          ? d
          : {
              ...d,
              exercises: d.exercises.map((e, i) => ({
                ...e,
                exId: "locked",
                name: ["Compound lift", "Press", "Row", "Accessory", "Core", "Finisher"][i % 6],
                load: null,
                loadLabel: "",
                note: undefined,
                tempo: undefined,
              })),
            },
      ),
    })),
  };
}
