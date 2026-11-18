import Link from "next/link";
import { SeoShell, CompareTable, FitPlanrPrices } from "@/components/seo/shell";
import { ExampleProgression, ExampleWeek, EXAMPLES } from "@/components/seo/example-plan";
import { seoMetadata } from "@/lib/seo/pages";
import { CHECKED, COMPETITORS as C } from "@/lib/seo/competitors";

const PATH = "/alternatives/hevy";
export const metadata = seoMetadata(PATH);
export const revalidate = 3600;

export default function Page() {
  return (
    <SeoShell
      path={PATH}
      answer={
        <>
          <strong>Hevy is an excellent workout logger, and its free plan is generous. What it expects is that you bring the program.</strong>{" "}
          If you want a different logger, Strong is the closest swap. If your real problem is not knowing what to lift, FitPlanr is the alternative:
          it writes your 4-week plan from the gear you have (exercises, sets, reps, starting weights, rest), then logs it with one tap per set.
        </>
      }
    >
      <h2>Why people look for a Hevy alternative</h2>
      <p>The reason matters, because each one has a different best answer:</p>
      <CompareTable
        head={["Your reason", "Best fit"]}
        rows={[
          ["The free plan's 4 routines or 3 months of graphs feel tight", <>Hevy Pro is cheap; or compare loggers on <Link href="/vs/hevy-vs-strong" className="text-lime underline">Hevy vs Strong</Link>.</>],
          ["You don't want a social feed", "Strong, a private, minimal logger"],
          ["You open the app and don't know what to put in a routine", "An app that writes the program: FitPlanr (fixed 4-week plan) or Fitbod (new workout each session)"],
          ["You never know when to go heavier", "A plan with the progression written in, like FitPlanr's double progression"],
        ]}
      />

      <h2>Hevy vs FitPlanr</h2>
      <CompareTable
        head={["", "FitPlanr", C.hevy.name]}
        rows={[
          ["What it is", "A plan builder with a logger: 5 questions + your gear, then a full 4-week plan", C.hevy.job],
          ["Who writes the program", "FitPlanr, from your goal, days, time, joints to protect and gear", C.hevy.plan],
          ["Starting weights", "Set per exercise, light on purpose (2–3 reps left in week 1)", "You decide"],
          ["Next week's targets", "Already in the plan; on Pro and Elite, adjusted from what you logged", "Shows your previous numbers; you decide"],
          ["Logging", "One tap per set, rest timer starts on its own", "Fast manual logging, rest timer, supersets"],
          ["Social", "None", "Feed, followers, likes and comments"],
          ["Price", <FitPlanrPrices key="p" />, C.hevy.price],
          ["Free plan", "Plan built free, Day 1 in full", C.hevy.free],
          ["Runs on", "Any phone or computer browser", C.hevy.platforms],
        ]}
        caption={
          <>
            Hevy facts as listed on <a href={C.hevy.site} rel="nofollow noopener" target="_blank" className="underline">hevy.com</a> and its app-store pages in {CHECKED}. FitPlanr prices are read live from our billing system.
          </>
        }
      />

      <h2>What you get instead of an empty routine</h2>
      <p>
        Many Hevy users train in a commercial gym, so here is day 1 that FitPlanr writes for a beginner with a full gym, 3 days a week, 60 minutes.
        Nothing is typed by hand: this is the engine&apos;s output for those answers.
      </p>
      <ExampleWeek answers={EXAMPLES.fullGym} days={[1]} />
      <p>
        Days 2 and 3 cover the same muscles with different moves, so a full week hits everything three times without repeating one session. The
        first exercise then moves like this over 4 weeks:
      </p>
      <ExampleProgression answers={EXAMPLES.fullGym} />
      <p>
        That is the part a logger leaves to you: reps climb through the range, and the weight goes up only after you&apos;ve hit the top of it.
        The rule is spelled out in our <Link href="/guides/progressive-overload-with-dumbbells">progressive overload guide</Link>.
      </p>

      <h2>What about Hevy Trainer?</h2>
      <p>
        Hevy Pro includes Hevy Trainer, which builds a routine from your goals and equipment. If you already pay for Hevy Pro and like the app,
        try Trainer before you switch anything. FitPlanr does one job only: a fixed 4-week block you can learn, with starting weights for your exact
        gear (down to one fixed pair of dumbbells), swaps for knees, lower back or shoulders, and a deload or heavier week 4.
      </p>

      <h2>What you give up</h2>
      <p>
        Hevy has native iPhone and Android apps, watch apps, a big exercise library, kilograms as well as pounds, and a community many people
        love. FitPlanr runs in your browser, has no watch app and no feed, uses pounds only, and only logs its own plans. If you already follow a
        program and the feed keeps you going, Hevy is still a great choice.
      </p>

      <h2>Use both, if you like</h2>
      <p>
        You can build your plan on FitPlanr and copy each day into a Hevy routine. A 2-, 3- or 4-day plan fits in Hevy&apos;s 4 free routines. You lose
        FitPlanr&apos;s automatic targets, but you keep your friends and your history in one place.
      </p>
      <p>
        Starting from zero? Read <Link href="/guides/how-to-start-lifting-weights">how to start lifting weights</Link>, or see the{" "}
        <Link href="/guides/3-day-full-body-workout-for-beginners">3-day full body workout for beginners</Link>.
      </p>
      <p className="text-[14px] text-muted">FitPlanr is not affiliated with Hevy. The name is used only to describe and compare products.</p>
    </SeoShell>
  );
}
