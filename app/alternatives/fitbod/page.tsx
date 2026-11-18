import Link from "next/link";
import { SeoShell, CompareTable, FitPlanrPrices } from "@/components/seo/shell";
import { ExampleWeek, ExampleProgression, EXAMPLES } from "@/components/seo/example-plan";
import { seoMetadata } from "@/lib/seo/pages";
import { CHECKED, COMPETITORS as C } from "@/lib/seo/competitors";

const PATH = "/alternatives/fitbod";
export const metadata = seoMetadata(PATH);
export const revalidate = 3600;

export default function Page() {
  return (
    <SeoShell
      path={PATH}
      answer={
        <>
          <strong>If you like Fitbod&apos;s idea (tell it your gear, it decides the workout) but want one clear plan you can learn, FitPlanr is
          the alternative.</strong> Fitbod creates a new workout each session. FitPlanr writes your whole 4-week block up front, so the same
          moves come back and you can see the weight go up week by week.
        </>
      }
    >
      <h2>Fitbod vs FitPlanr: the honest difference</h2>
      <p>
        Both start from the equipment you have. The difference is when the decisions are made. Fitbod generates each workout as you go, using
        your training history and its estimate of how recovered each muscle is. FitPlanr asks 5 questions once (goal, experience, days per week,
        workout length, joints to protect) plus your gear, and writes 4 weeks in advance with a fixed progression rule.
      </p>
      <p>Neither approach is wrong. They suit different people:</p>
      <ul>
        <li><strong>Fitbod suits</strong> people who enjoy variety, train on irregular days, and want an app that reacts to whatever they did yesterday.</li>
        <li><strong>FitPlanr suits</strong> beginners who want to repeat the same moves long enough to learn them, and want to know on Monday what Friday looks like.</li>
      </ul>

      <h2>Side by side</h2>
      <CompareTable
        head={["", "FitPlanr", C.fitbod.name]}
        rows={[
          ["How workouts are made", "One 4-week plan, written up front from your answers and gear", C.fitbod.job],
          ["Progression", "Written rule: reps up through the range, then +1 weight step; week 4 heavier or one extra set", "Adjusts targets from your logged history"],
          ["Joints", "Protect knees, lower back or shoulders: moves that load them are swapped out", "Lets you exclude exercises"],
          ["Price", <FitPlanrPrices key="p" />, C.fitbod.price],
          ["Try first", "Build your plan and see Day 1 free, no card", C.fitbod.free],
          ["Runs on", "Any phone or computer browser (add to home screen)", C.fitbod.platforms],
          ["Recovery data", "No", "Estimates muscle recovery from your workouts"],
        ]}
        caption={
          <>
            Fitbod facts as listed on <a href={C.fitbod.site} rel="nofollow noopener" target="_blank" className="underline">fitbod.me</a> in {CHECKED}. FitPlanr prices are read live from our billing system.
          </>
        }
      />

      <h2>What a FitPlanr plan looks like</h2>
      <p>For a beginner with adjustable dumbbells up to 50 lb and a bench, 3 days a week, 45 minutes, this is week 1 exactly as the engine writes it:</p>
      <ExampleWeek answers={EXAMPLES.homeBench} />
      <p>And this is how the first exercise moves over the 4 weeks. The weight goes up only after you&apos;ve owned the top of the range:</p>
      <ExampleProgression answers={EXAMPLES.homeBench} />

      <h2>Where Fitbod is stronger</h2>
      <p>
        Being fair matters here. Fitbod has native iPhone and Android apps with watch support, a larger exercise video library, recovery tracking,
        and a long track record. FitPlanr has 55 exercises with drawn form loops, runs in the browser, uses pounds only, and has no recovery or
        sleep data. If those features are why you use Fitbod, stay with it.
      </p>

      <h2>Where FitPlanr is different</h2>
      <ul>
        <li><strong>The plan doesn&apos;t move under you.</strong> Same answers, same plan. You learn 10 to 15 moves well instead of seeing new ones every week.</li>
        <li><strong>Built for a fixed pair of dumbbells.</strong> If your heaviest pair is too heavy for a move, it&apos;s replaced, and progression switches to reps, sets and tempo (see the <Link href="/for/home-dumbbells">home dumbbell plan</Link>).</li>
        <li><strong>Beginner limits on purpose.</strong> No max testing, light starts, and fewer than 20 hard sets per muscle a week.</li>
        <li><strong>Honest about how it works.</strong> It&apos;s a rule-based engine, not AI; every rule is written out in our <Link href="/guides/progressive-overload-with-dumbbells">progressive overload guide</Link>.</li>
      </ul>

      <h2>Switching from Fitbod</h2>
      <ol>
        <li>Note your current working weights for 3 or 4 main moves.</li>
        <li>Build your plan on FitPlanr and pick the gear you use in Fitbod.</li>
        <li>If you&apos;ve trained for over a year, answer that honestly: starting weights go up and barbell moves come in.</li>
        <li>Cancel Fitbod from the store where you subscribed once you&apos;re happy.</li>
      </ol>
      <p className="text-[14px] text-muted">FitPlanr is not affiliated with Fitbod. The name is used only to describe and compare products.</p>
    </SeoShell>
  );
}
