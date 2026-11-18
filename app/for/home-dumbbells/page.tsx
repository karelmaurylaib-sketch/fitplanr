import Link from "next/link";
import { SeoShell, CompareTable } from "@/components/seo/shell";
import { ExampleWeek, ExampleProgression, EXAMPLES } from "@/components/seo/example-plan";
import { seoMetadata } from "@/lib/seo/pages";

const PATH = "/for/home-dumbbells";
export const metadata = seoMetadata(PATH);
export const revalidate = 3600;

export default function Page() {
  return (
    <SeoShell
      path={PATH}
      answer={
        <>
          <strong>Yes, one pair of dumbbells is enough to start building muscle at home.</strong> The plan has to fit that exact pair:
          moves that work with its weight, 3 full-body days a week, and a rule for getting harder when the weight can&apos;t go up.
          Below is the real 4-week plan FitPlanr writes for <strong>2 × 25 lb dumbbells, 3 days a week, 45 minutes</strong>.
        </>
      }
    >
      <h2>Week 1 for 2 × 25 lb dumbbells</h2>
      <p>
        These are the answers most people give on their first try: build muscle, new to lifting, 3 days, 45 minutes, nothing to protect,
        one fixed pair of 25 lb dumbbells. This is exactly what the engine returns:
      </p>
      <ExampleWeek answers={EXAMPLES.twoDumbbells} />
      <p>Three things to notice, because they are what most free dumbbell plans online get wrong:</p>
      <ul>
        <li>
          <strong>No move is too heavy for the pair.</strong> 25 lb is a good weight for goblet squats and rows, but far too much for a
          beginner&apos;s lateral raise or standing press. Those moves are left out and replaced with bodyweight moves (pike push-ups, split squats)
          that fit the same slot.
        </li>
        <li>
          <strong>Nothing needs a bench.</strong> Presses are done on the floor, rows with one hand on a chair. If you add a bench, the plan adds
          bench presses, chest-supported rows and hip thrusts.
        </li>
        <li>
          <strong>Three different days.</strong> Day A is built around a squat, day B around a hip hinge, day C around a lunge, so the same muscles
          get trained three times a week without repeating the same session.
        </li>
      </ul>

      <h2>How it keeps getting harder with the same weight</h2>
      <p>
        With adjustable dumbbells, the plan adds 5 lb once you own the top of the rep range. With a fixed pair it can&apos;t, so it uses the
        other levers: reps first, then an extra set and a slower lowering. Here is the goblet squat from day A across the 4 weeks:
      </p>
      <ExampleProgression answers={EXAMPLES.twoDumbbells} />
      <p>
        Week 1 is 3 sets of 8, week 3 is 3 sets of 12, and week 4 adds a fourth set with 3 seconds on the way down. That is roughly twice the work
        of week 1 with the same 25 lb. The full method, with the rules for when to go heavier, is in our guide to{" "}
        <Link href="/guides/progressive-overload-with-dumbbells">progressive overload with dumbbells</Link>.
      </p>

      <h2>What changes with other home setups</h2>
      <p>The same answers with different gear give a different plan. These are the presets in FitPlanr&apos;s gear step:</p>
      <CompareTable
        head={["Your gear", "What the plan does", "How weight goes up"]}
        rows={[
          ["2 fixed dumbbells", "Floor press, one-arm row, goblet squat, RDL, plus bodyweight moves where the pair is too heavy", "Reps, then an extra set and 3-second lowering"],
          ["Adjustable dumbbells + bench", "Bench press, chest-supported row, shoulder press, hip thrust, lateral raises at 5 lb", "+5 lb per dumbbell once every set hits 12"],
          ["Bodyweight only", "Squats, split squats, push-ups, pike push-ups, table rows, glute bridges, planks", "Reps, sets and harder variations"],
        ]}
        caption="From FitPlanr's exercise database: 55 exercises, each tagged with the gear it needs and the joints it loads."
      />
      <p>
        Starting weights for adjustable dumbbells are set low on purpose. For a new lifter the plan starts the goblet squat at 20 lb and the
        bench press at 15 lb per hand, so week 1 is about learning the moves with 2 to 3 reps left in each set.
      </p>
      <ExampleWeek answers={EXAMPLES.homeBench} days={[1]} />

      <h2>A simple weekly schedule</h2>
      <ol>
        <li><strong>Monday:</strong> Full Body A (squat, floor press, row, Romanian deadlift, plank).</li>
        <li><strong>Wednesday:</strong> Full Body B (Romanian deadlift, pike push-up, split squat, overhead extension, glute bridge).</li>
        <li><strong>Friday:</strong> Full Body C (split squat, push-up, inverted row, glute bridge, close-grip push-up).</li>
      </ol>
      <p>
        Rest days in between matter as much as the workouts. If a day slips, do the next session the following day rather than doubling up. Want
        the same idea explained for any gear? Read the <Link href="/guides/3-day-full-body-workout-for-beginners">3-day full body workout for beginners</Link>.
      </p>

      <h2>When to buy heavier dumbbells</h2>
      <p>
        Once you can do every set of a move at the top of its range with slow, clean reps, the pair has done its job for that move. Lower-body
        moves usually get there first. When you rebuild your plan with a heavier pair or adjustable dumbbells, FitPlanr recalculates the starting
        weights and brings back the moves that were too heavy before.
      </p>
      <p>Not medical advice: if you have pain or an injury, check with a doctor before you start.</p>
    </SeoShell>
  );
}
