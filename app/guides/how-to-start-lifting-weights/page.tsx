import Link from "next/link";
import { SeoShell, CompareTable } from "@/components/seo/shell";
import { ExampleWeek, EXAMPLES } from "@/components/seo/example-plan";
import { seoMetadata } from "@/lib/seo/pages";

const PATH = "/guides/how-to-start-lifting-weights";
export const metadata = seoMetadata(PATH);
export const revalidate = 86400;

export default function Page() {
  return (
    <SeoShell
      path={PATH}
      answer={
        <>
          <strong>Start with 2 or 3 full-body sessions a week, 4 to 6 exercises each, covering a squat, a hip hinge, a push and a pull.</strong>{" "}
          Use weights light enough to stop every set with 2 to 3 reps left, rest 60 to 90 seconds, write down every set, and add reps before
          you add weight. Here is what your first 4 weeks look like, step by step.
        </>
      }
    >
      <h2>Before your first session</h2>
      <ol>
        <li><strong>Pick your days.</strong> Two or three days a week with a rest day between them. Put them in your calendar like appointments.</li>
        <li><strong>Pick a length you can keep.</strong> 30, 45 or 60 minutes. A 35-minute workout you do beats a 90-minute one you skip.</li>
        <li><strong>List your gear, honestly.</strong> A gym, a bench and adjustable dumbbells, one pair of dumbbells, or nothing. The plan has to fit what&apos;s there.</li>
        <li><strong>Note anything that hurts.</strong> Knees, lower back, shoulders. Choose moves that don&apos;t load them, and see a doctor if it&apos;s real pain.</li>
      </ol>

      <h2>The 4 movements every beginner plan needs</h2>
      <CompareTable
        head={["Movement", "What it trains", "Beginner-friendly versions"]}
        rows={[
          ["Squat", "Quads, glutes", "Goblet squat, box squat, leg press, bodyweight squat"],
          ["Hip hinge", "Hamstrings, glutes, back", "Dumbbell Romanian deadlift, kettlebell deadlift, glute bridge"],
          ["Push", "Chest, shoulders, triceps", "Dumbbell bench or floor press, push-up, machine chest press"],
          ["Pull", "Back, biceps", "One-arm dumbbell row, lat pulldown, seated cable row, table row"],
        ]}
        caption="From FitPlanr's exercise database. Each one comes with a short form loop and 3 cues."
      />
      <p>Add one or two small moves (lateral raises, curls, a plank) if you have time. They&apos;re the extras, not the base.</p>

      <h2>Week 1: learn the moves</h2>
      <p>
        Your only job in week 1 is to do each move well. Use the bottom of the rep range and a weight that feels easy to moderate. Here&apos;s a real
        week 1 for a complete beginner with adjustable dumbbells and a bench, 3 days a week, 45 minutes:
      </p>
      <ExampleWeek answers={EXAMPLES.homeBench} />

      <h2>How heavy should you go?</h2>
      <p>
        Pick a weight you could lift 2 or 3 more times when you stop the set. If the last rep slows down a lot or your form changes, it&apos;s too
        heavy. If you could do 6 more, go up next session. Don&apos;t test your max: as a beginner it tells you little and carries the most risk.
        FitPlanr starts a new lifter at 20 lb per hand for goblet squats, rows and Romanian deadlifts, 15 lb for the bench press and 10 lb for
        the shoulder press.
      </p>

      <h2>Warming up</h2>
      <ul>
        <li>5 minutes of easy movement: a brisk walk, a bike, jumping jacks.</li>
        <li>Then 1 or 2 light sets of your first exercise, with about half the weight.</li>
        <li>That&apos;s it. Long stretching routines before lifting are optional.</li>
      </ul>

      <h2>Weeks 2 to 4</h2>
      <ol>
        <li><strong>Week 2: add reps.</strong> Same weights, a couple more reps per set.</li>
        <li><strong>Week 3: reach the top.</strong> Same weights, every set at the top of the range.</li>
        <li><strong>Week 4: go heavier.</strong> One step up (usually 5 lb per dumbbell), reps back to the bottom.</li>
      </ol>
      <p>
        This is called double progression. It&apos;s explained with numbers in{" "}
        <Link href="/guides/progressive-overload-with-dumbbells">progressive overload with dumbbells</Link>, and laid out as a full week in the{" "}
        <Link href="/guides/3-day-full-body-workout-for-beginners">3-day full body workout for beginners</Link>.
      </p>

      <h2>Rest, sleep and food</h2>
      <p>
        Muscle is built between sessions. Keep at least one day off between full-body days, aim for a regular sleep schedule, and eat enough
        protein through the day. You don&apos;t need supplements to start.
      </p>

      <h2>Signs you&apos;re on track</h2>
      <ul>
        <li>Your logged reps or weights go up most weeks.</li>
        <li>The moves feel smoother than in week 1.</li>
        <li>You did most of your planned sessions. Consistency is the main result of month 1.</li>
      </ul>
      <p>
        Want the 4 weeks written for your days, time and gear? That&apos;s what FitPlanr does. See <Link href="/for/beginners">FitPlanr for beginners</Link>.
      </p>
      <p className="text-[14px] text-muted">Not medical advice. If you have a health condition, pain or an injury, check with a doctor before you start a new program.</p>
    </SeoShell>
  );
}
