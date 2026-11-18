import Link from "next/link";
import { SeoShell, CompareTable } from "@/components/seo/shell";
import { ExampleWeek, ExampleProgression, EXAMPLES } from "@/components/seo/example-plan";
import { seoMetadata } from "@/lib/seo/pages";

const PATH = "/guides/3-day-full-body-workout-for-beginners";
export const metadata = seoMetadata(PATH);
export const revalidate = 86400;

export default function Page() {
  return (
    <SeoShell
      path={PATH}
      answer={
        <>
          <strong>Train Monday, Wednesday and Friday, with a different full-body session each day:</strong> A built around a squat, B around a
          hip hinge, C around a lunge. Each day has a push, a pull and 4 to 6 moves in total, 3 sets of 8 to 12 on the big moves, and 60 to 90
          seconds of rest. Below is a complete week, then how weeks 2 to 4 progress.
        </>
      }
    >
      <h2>The structure of a good 3-day week</h2>
      <CompareTable
        head={["Day", "Main leg move", "Upper-body push", "Upper-body pull", "Extras"]}
        rows={[
          ["A · Monday", "Squat", "Horizontal press", "Row", "Hinge, shoulders, core"],
          ["B · Wednesday", "Hip hinge (RDL)", "Overhead press", "Pull-down or pullover", "Lunge, triceps, glutes"],
          ["C · Friday", "Lunge", "Horizontal press", "Row", "Glutes, biceps, triceps"],
        ]}
        caption="The day templates FitPlanr uses for 3-day plans. The exact exercises depend on your gear."
      />
      <p>
        Why three different days? Each muscle still gets trained three times a week, but the stress moves around: your knees get the squat on
        Monday and a lighter lunge on Friday, your lower back gets one main hinge on Wednesday. You also learn more moves without any session
        getting long.
      </p>

      <h2>A full example week (gym)</h2>
      <p>For a beginner who wants to build muscle, has a full gym, and has 60 minutes, FitPlanr writes this week 1:</p>
      <ExampleWeek answers={EXAMPLES.fullGym} />
      <p>
        Sessions come out at about 37 to 40 minutes including rest, which leaves time to warm up. Notice how light the starts are: 15 lb per hand
        on the bench press, 10 lb on the shoulder press. Week 1 is for learning the moves, stopping each set with 2 to 3 reps in the tank.
      </p>

      <h2>The same week at home</h2>
      <p>With one pair of 25 lb dumbbells and no bench, the same 3-day structure looks like this:</p>
      <ExampleWeek answers={EXAMPLES.twoDumbbells} />
      <p>
        Where the pair is too heavy for a move (a 25 lb shoulder press is a lot for a beginner), a bodyweight move takes the slot. More on that
        on the <Link href="/for/home-dumbbells">home dumbbell workout plan</Link> page.
      </p>

      <h2>Weeks 2 to 4</h2>
      <ExampleProgression answers={EXAMPLES.fullGym} />
      <ol>
        <li><strong>Week 2:</strong> same weights, a couple more reps per set.</li>
        <li><strong>Week 3:</strong> same weights, every set at the top of the range.</li>
        <li><strong>Week 4:</strong> one weight step up (5 lb per dumbbell), reps back to the bottom of the range.</li>
      </ol>
      <p>
        After week 4, start a new block from your week-4 weights. The thinking behind it is in{" "}
        <Link href="/guides/progressive-overload-with-dumbbells">progressive overload with dumbbells</Link>.
      </p>

      <h2>How to run each session</h2>
      <ul>
        <li><strong>Warm up 5 minutes:</strong> easy cardio, then 1 or 2 light sets of the first move.</li>
        <li><strong>Do the moves in order.</strong> The big ones come first while you&apos;re fresh.</li>
        <li><strong>Rest 90 seconds</strong> after big moves and 60 after small ones. Use a timer.</li>
        <li><strong>Log every set:</strong> weight and reps. Next week you&apos;ll need them.</li>
      </ul>

      <h2>Common questions about 3-day plans</h2>
      <h3>Can I do it on back-to-back days?</h3>
      <p>It&apos;s better not to. If your week only allows it, put day B (the hinge day) between A and C, and keep the weights light.</p>
      <h3>What if I can only do 2 days?</h3>
      <p>Use two full-body days, A and B, on Monday and Thursday. FitPlanr builds 2-day plans this way.</p>
      <h3>When should I move to 4 days?</h3>
      <p>
        When you can reliably train 4 days and want more volume. FitPlanr then switches you to an upper/lower split. If you&apos;re just starting,
        read <Link href="/guides/how-to-start-lifting-weights">how to start lifting weights</Link> first.
      </p>
    </SeoShell>
  );
}
