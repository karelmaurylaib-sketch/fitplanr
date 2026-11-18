import Link from "next/link";
import { SeoShell, CompareTable } from "@/components/seo/shell";
import { ExampleWeek, EXAMPLES } from "@/components/seo/example-plan";
import { seoMetadata } from "@/lib/seo/pages";
import { CHECKED, COMPETITORS as C } from "@/lib/seo/competitors";

const PATH = "/vs/hevy-vs-strong";
export const metadata = seoMetadata(PATH);
export const revalidate = 3600;

export default function Page() {
  return (
    <SeoShell
      path={PATH}
      answer={
        <>
          <strong>Short answer: choose Hevy if you want the lower price, more room on the free plan and a social feed; choose Strong if you want
          the most minimal logger.</strong> Both are manual trackers: you bring the program, they record it. If what you&apos;re missing is the
          program itself, neither one will write it for you by default.
        </>
      }
    >
      <h2>Hevy vs Strong at a glance</h2>
      <CompareTable
        head={["", C.hevy.name, C.strong.name]}
        rows={[
          ["What it is", C.hevy.job, C.strong.job],
          ["Paid plan", C.hevy.price, C.strong.price],
          ["Free plan", C.hevy.free, C.strong.free],
          ["Who writes the program", C.hevy.plan, C.strong.plan],
          ["Platforms", C.hevy.platforms, C.strong.platforms],
          ["Social", "Feed, followers, likes and comments", "None: private log"],
        ]}
        caption={
          <>
            Prices and limits as listed on <a href={C.hevy.site} rel="nofollow noopener" target="_blank" className="underline">hevy.com</a> and{" "}
            <a href={C.strong.site} rel="nofollow noopener" target="_blank" className="underline">strong.app</a> in {CHECKED}. App-store prices can vary by country and platform; check before you buy.
          </>
        }
      />

      <h2>Price: Hevy is cheaper at every level</h2>
      <p>
        Hevy Pro lists at $2.99 a month, $23.99 a year or $74.99 for life. Strong PRO lists at $4.99 a month, $29.99 a year or $99.99 for life. Over
        a year, the gap is $6; over a lifetime license, $25. If price decides it, Hevy wins.
      </p>

      <h2>Free plan: both cap your routines</h2>
      <p>
        Strong&apos;s free plan lets you log as much as you like but keeps only 3 saved routines. Hevy&apos;s free plan also caps routines and
        limits how far back your graphs go. If you run a simple 3-day program (one routine per day), Strong&apos;s free plan fits it exactly; a 4- or
        5-day split pushes you to pay on either app.
      </p>

      <h2>Logging feel: minimal vs social</h2>
      <p>
        Both log a set in a couple of taps, remember your last numbers, and run a rest timer. Strong is built to stay out of your way: no feed, no
        followers. Hevy adds a social layer where friends can see and react to your workouts, which some people find motivating and others
        switch off.
      </p>

      <h2>Programming: the gap both share</h2>
      <p>
        Strong does not create programs: you type your routines in. Hevy sells Hevy Trainer as an add-on. In both cases the core app assumes you
        already know what to lift, how many sets, and when to go heavier. That&apos;s fine if you follow a program from a coach or a book. It&apos;s
        the hard part if you&apos;re starting out.
      </p>

      <h2>If you don&apos;t have a program yet</h2>
      <p>
        That&apos;s the job FitPlanr does. You answer 5 one-tap questions and pick your gear, and it writes 4 weeks of sessions with sets, reps,
        starting weights and rest. Here is day 1 for a beginner training at home with adjustable dumbbells and a bench:
      </p>
      <ExampleWeek answers={EXAMPLES.homeBench} days={[1]} />
      <p>
        You can log it in FitPlanr&apos;s own one-tap logger, or copy it into Hevy or Strong if you prefer their apps. More on that choice on
        the <Link href="/alternatives/strong">Strong app alternative</Link> page, and on generators in the{" "}
        <Link href="/alternatives/fitbod">Fitbod alternative</Link> page.
      </p>

      <h2>Verdict</h2>
      <ul>
        <li><strong>Pick Hevy</strong> if you want the lowest price or a feed with friends.</li>
        <li><strong>Pick Strong</strong> if you want a quiet, minimal log and you run 3 routines or fewer.</li>
        <li><strong>Pick a plan first</strong> if you&apos;re a beginner without a program, then log it in whichever app you like.</li>
      </ul>
      <p className="text-[14px] text-muted">FitPlanr is not affiliated with Hevy or Strong. Their names are used only to describe and compare their products.</p>
    </SeoShell>
  );
}
