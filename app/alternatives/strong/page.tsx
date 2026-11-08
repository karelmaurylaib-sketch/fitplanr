import Link from "next/link";
import { SeoShell, CompareTable, FitPlanrPrices } from "@/components/seo/shell";
import { ExampleWeek, EXAMPLES } from "@/components/seo/example-plan";
import { seoMetadata } from "@/lib/seo/pages";
import { CHECKED, COMPETITORS as C } from "@/lib/seo/competitors";

const PATH = "/alternatives/strong";
export const metadata = seoMetadata(PATH);
export const revalidate = 3600;

export default function Page() {
  return (
    <SeoShell
      path={PATH}
      answer={
        <>
          <strong>Strong is one of the best workout loggers there is, but it doesn&apos;t tell you what to lift.</strong> If you only want a
          cheaper logger, Hevy is the closest swap. If your real problem is an empty routine, FitPlanr is the alternative: it writes your 4-week
          plan from your gear, then logs it with one tap per set.
        </>
      }
    >
      <h2>Why people look for a Strong alternative</h2>
      <p>In practice it comes down to one of three reasons, and each has a different answer:</p>
      <CompareTable
        head={["Your reason", "Best fit"]}
        rows={[
          ["You hit the free plan's 3-routine limit", <>A logger with a different free plan or price, such as Hevy. See <Link href="/vs/hevy-vs-strong" className="text-lime underline">Hevy vs Strong</Link>.</>],
          ["You don't know what to put in your routines", "An app that writes the program: FitPlanr (fixed 4-week plan) or Fitbod (new workout each session)"],
          ["You want weights to go up without doing the math", "A plan with a progression rule built in, like FitPlanr's double progression"],
        ]}
      />

      <h2>Strong vs FitPlanr</h2>
      <CompareTable
        head={["", "FitPlanr", C.strong.name]}
        rows={[
          ["Starts with", "5 questions + your gear, then a full plan", "An empty routine you fill in"],
          ["Sets, reps, starting weight", "Written for you, per exercise", "You decide"],
          ["Next week's targets", "Already in the plan; on Pro and Elite, adjusted from what you logged", "You decide"],
          ["Logging", "One tap per set, rest timer starts on its own", "Fast manual logging, rest timer"],
          ["Price", <FitPlanrPrices key="p" />, C.strong.price],
          ["Free plan", "Plan built free, Day 1 in full", C.strong.free],
          ["Runs on", "Any phone or computer browser", C.strong.platforms],
        ]}
        caption={
          <>
            Strong facts as listed on <a href={C.strong.site} rel="nofollow noopener" target="_blank" className="underline">strong.app</a> in {CHECKED}. FitPlanr prices are read live from our billing system.
          </>
        }
      />

      <h2>What you get instead of an empty routine</h2>
      <p>
        This is day 1 that FitPlanr writes for a beginner with only a pair of 25 lb dumbbells, training 3 days a week for 45 minutes. Every row
        has the sets, the rep range, the weight to start with and the rest:
      </p>
      <ExampleWeek answers={EXAMPLES.twoDumbbells} days={[1]} />
      <p>
        Days 2 and 3 use different moves for the same muscles, and weeks 2 to 4 raise the reps, then the sets or the weight. The full week is on
        the <Link href="/for/home-dumbbells">home dumbbell plan</Link> page.
      </p>

      <h2>What you give up</h2>
      <p>
        Strong has native iPhone and Android apps, an Apple Watch app, and years of polish as a logger. FitPlanr runs in your browser, has no watch
        app, uses pounds only, and is built around its own plans rather than any routine you type. If you already follow a program you love and
        only want to log it, Strong is still a great choice.
      </p>

      <h2>Use both, if you like</h2>
      <p>
        Nothing stops you from building your plan on FitPlanr and copying the exercises, sets and reps into Strong routines. You lose
        FitPlanr&apos;s automatic targets, but you keep the app you know.
      </p>
      <p>
        New to lifting? Start with <Link href="/guides/how-to-start-lifting-weights">how to start lifting weights</Link> and the{" "}
        <Link href="/guides/3-day-full-body-workout-for-beginners">3-day full body workout for beginners</Link>.
      </p>
      <p className="text-[14px] text-muted">FitPlanr is not affiliated with Strong. The name is used only to describe and compare products.</p>
    </SeoShell>
  );
}
