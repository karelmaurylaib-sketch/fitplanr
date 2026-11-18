import Link from "next/link";
import { SeoShell, CompareTable } from "@/components/seo/shell";
import { ExampleProgression, EXAMPLES } from "@/components/seo/example-plan";
import { seoMetadata } from "@/lib/seo/pages";

const PATH = "/guides/progressive-overload-with-dumbbells";
export const metadata = seoMetadata(PATH);
export const revalidate = 86400;

export default function Page() {
  return (
    <SeoShell
      path={PATH}
      answer={
        <>
          <strong>Use double progression: pick a rep range (say 8 to 12), add reps each session at the same weight, and only go heavier once
          every set reaches the top of the range.</strong> Then drop back to the bottom of the range with the new weight and climb again. With a
          fixed pair that can&apos;t go heavier, add a set, slow the lowering to 3 seconds, or switch to a one-arm or one-leg version.
        </>
      }
    >
      <h2>The rule in one table</h2>
      <CompareTable
        head={["What happened last session", "What you do next session"]}
        rows={[
          ["Every set hit the top of the range (e.g. 3 × 12)", "Go up one step: +5 lb per dumbbell. Reps reset to the bottom (3 × 8)."],
          ["Every set hit today's target, not yet the top", "Same weight, one more rep on each set."],
          ["Missed the bottom of the range on a set", "Same weight. Own it before moving on."],
          ["Missed the bottom of the range 3 sessions in a row", "Drop the weight about 10% and rebuild clean reps."],
          ["Top of the range, but you can't go heavier", "Add one set, or slow the lowering to 3 seconds."],
        ]}
        caption="FitPlanr's Smart Progression applies these rules to the sets you log (Pro and Elite). The slower lowering is written into week 4 of fixed-pair plans."
      />

      <h2>Example 1: adjustable dumbbells</h2>
      <p>
        A beginner with adjustable dumbbells up to 50 lb and a bench, 3 days a week. The goblet squat starts at 20 lb. Three weeks of adding
        reps, then the weight goes up:
      </p>
      <ExampleProgression answers={EXAMPLES.homeBench} />
      <p>
        From 3 × 8 at 20 lb in week 1 to 3 × 8 at 25 lb in week 4, with 3 × 12 at 20 lb in between. That&apos;s 50% more total reps by week 3,
        and then a heavier dumbbell. Small, boring steps are the point: they add up over months.
      </p>

      <h2>Example 2: one fixed pair of 25 lb dumbbells</h2>
      <p>Same goal and days, but the only weights are one pair of 25 lb dumbbells. The weight can&apos;t go up, so something else does:</p>
      <ExampleProgression answers={EXAMPLES.twoDumbbells} />
      <p>
        Week 4 adds a fourth set and a 3-1-1 tempo: 3 seconds down, 1 second pause, 1 second up. Total reps double from week 1 (24) to week 4
        (48), and each rep takes longer. For a full home plan built this way, see the{" "}
        <Link href="/for/home-dumbbells">dumbbell workout plan for home</Link>.
      </p>

      <h2>Six ways to add overload without heavier weights</h2>
      <ol>
        <li><strong>More reps</strong> at the same weight, up to the top of your range.</li>
        <li><strong>More sets:</strong> go from 3 to 4 on the main move.</li>
        <li><strong>Slower lowering:</strong> 3 seconds down makes any weight heavier.</li>
        <li><strong>A pause</strong> at the hardest point, such as the bottom of a squat.</li>
        <li><strong>One side at a time:</strong> a one-arm row or a split squat doubles the load on each side.</li>
        <li><strong>Less rest,</strong> with care: shorter rest makes the next set harder, but don&apos;t cut it so far that your reps fall apart.</li>
      </ol>

      <h2>How big should each jump be?</h2>
      <p>
        For dumbbells, one step is usually 5 lb per hand, because that&apos;s how most fixed sets and adjustable dumbbells go up. For a barbell,
        FitPlanr uses 10 lb on squats and Romanian deadlifts and 5 lb on presses and rows. On machines, one plate on the stack (usually 10 lb).
        On light moves like lateral raises, a 5 lb jump is big: stay at the top of the range longer before you take it.
      </p>

      <h2>Mistakes that stall beginners</h2>
      <ul>
        <li><strong>Going heavier every week no matter what.</strong> If reps drop below the range, the weight was too heavy.</li>
        <li><strong>Never going heavier.</strong> Same weight and same reps for months means no new reason to adapt.</li>
        <li><strong>Not writing it down.</strong> You can&apos;t beat last week if you don&apos;t know what last week was. Log every set.</li>
        <li><strong>Grinding ugly reps.</strong> A rep only counts if it looks like the first one. Stop with 1 or 2 reps left early on.</li>
        <li><strong>No easier weeks.</strong> Every few weeks, a lighter week (a deload) helps you come back stronger.</li>
      </ul>
      <p>
        Want this worked out for your own gear? FitPlanr writes the 4 weeks for you and does the math each session. Or read how to set up the
        whole week in the <Link href="/guides/3-day-full-body-workout-for-beginners">3-day full body workout for beginners</Link>.
      </p>
    </SeoShell>
  );
}
