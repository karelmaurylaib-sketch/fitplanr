import Link from "next/link";
import { SeoShell, CompareTable, FitPlanrPrices } from "@/components/seo/shell";
import { ExampleWeek, ExampleProgression, EXAMPLES } from "@/components/seo/example-plan";
import { seoMetadata } from "@/lib/seo/pages";
import { CHECKED, COMPETITORS as C } from "@/lib/seo/competitors";

const PATH = "/for/beginners";
export const metadata = seoMetadata(PATH);
export const revalidate = 3600;

export default function Page() {
  return (
    <SeoShell
      path={PATH}
      answer={
        <>
          <strong>As a beginner, you need an app that tells you what to do, not just one that records it.</strong> That means a plan with
          the exercise, sets, reps, starting weight and rest for every session, built on the gear you have, and targets that rise as you get
          stronger. FitPlanr writes that 4-week plan from 5 one-tap questions and your gear.
        </>
      }
    >
      <h2>What a beginner&apos;s app has to do</h2>
      <p>Most people who quit lifting in the first month don&apos;t quit because of effort. They quit because they don&apos;t know what to do next. A good first app answers four questions for you:</p>
      <ol>
        <li><strong>What do I do today?</strong> A named session with 4 to 6 exercises, in order.</li>
        <li><strong>How much and how many?</strong> Sets, a rep range, and a starting weight that fits the gear in front of you.</li>
        <li><strong>How long do I rest?</strong> About 90 seconds on big moves and 60 on small ones.</li>
        <li><strong>What changes next week?</strong> A clear rule: more reps first, then more weight.</li>
      </ol>
      <p>
        Workout loggers like {C.strong.name} and {C.hevy.name} are excellent at recording what you did, but they start with an empty routine: you
        bring the program. Generators like {C.fitbod.name} create a new workout every session. FitPlanr sits in between: it writes one fixed 4-week
        block you can learn, then logs it.
      </p>

      <h2>A real first plan</h2>
      <p>
        Here is week 1 that FitPlanr builds for someone who has never really lifted, wants to build muscle, can train 3 days a week for 60 minutes,
        and goes to a full gym:
      </p>
      <ExampleWeek answers={EXAMPLES.fullGym} />
      <p>
        Even with a barbell and machines available, a new lifter starts mostly on dumbbells: they are easier to learn, and the starting weights
        are light on purpose (15 lb per hand on the bench press, 20 lb on the goblet squat). Someone who answers &ldquo;over a year&rdquo; gets
        the barbell versions and heavier starts instead.
      </p>

      <h2>How the plan moves over 4 weeks</h2>
      <ExampleProgression answers={EXAMPLES.fullGym} exercise={1} />
      <ul>
        <li><strong>Week 1, learn the moves:</strong> bottom of the rep range, stop each set with 2 to 3 reps left.</li>
        <li><strong>Week 2, add reps:</strong> same weight, middle of the range.</li>
        <li><strong>Week 3, top of the range:</strong> same weight, every set at the top.</li>
        <li><strong>Week 4, heavier:</strong> the weight goes up one step and reps reset to the bottom.</li>
      </ul>
      <p>
        That rule is called double progression, and it&apos;s explained with examples in{" "}
        <Link href="/guides/progressive-overload-with-dumbbells">progressive overload with dumbbells</Link>. On Pro and Elite, FitPlanr also reads
        the sets you log: hit the top of the range on all sets and the next session goes up; miss and it holds.
      </p>

      <h2>Built-in safety for new lifters</h2>
      <ul>
        <li>No max testing, ever. Starting loads are set conservatively from your level and your heaviest dumbbell.</li>
        <li>Tell it to protect your knees, lower back or shoulders and it swaps out the moves that load them (for example a box squat instead of a goblet squat for knees).</li>
        <li>Weekly hard sets per muscle stay under 20 for beginners.</li>
        <li>Every exercise has a short form loop and 3 cues you can read mid-set.</li>
      </ul>

      <h2>FitPlanr next to the apps you&apos;ve heard of</h2>
      <CompareTable
        head={["", "FitPlanr", C.strong.name, C.hevy.name, C.fitbod.name]}
        rows={[
          ["What it does", "Writes a 4-week plan from your gear, then logs it", C.strong.job, C.hevy.job, C.fitbod.job],
          ["Your program", "Built for you, fixed for 4 weeks", C.strong.plan, C.hevy.plan, C.fitbod.plan],
          ["Price", <FitPlanrPrices key="p" />, C.strong.price, C.hevy.price, C.fitbod.price],
          ["Runs on", "Any phone or computer browser", C.strong.platforms, C.hevy.platforms, C.fitbod.platforms],
        ]}
        caption={`Competitor prices and features as listed on their own sites in ${CHECKED}; store prices can vary by country. FitPlanr prices are read live.`}
      />
      <p>
        Comparing two loggers? See <Link href="/vs/hevy-vs-strong">Hevy vs Strong</Link>. Weighing a generator? See the{" "}
        <Link href="/alternatives/fitbod">Fitbod alternative</Link> page. Not sure how to start at all? Read{" "}
        <Link href="/guides/how-to-start-lifting-weights">how to start lifting weights</Link>.
      </p>

      <h2>What FitPlanr doesn&apos;t do</h2>
      <p>
        So you can decide fast: there is no native iPhone or Android app (it runs in your browser and can sit on your home screen), no Apple
        Watch app, no social feed, no nutrition tracking, and no recovery or sleep data. Units are pounds only. If you need any of those, one of
        the apps above may suit you better.
      </p>
    </SeoShell>
  );
}
