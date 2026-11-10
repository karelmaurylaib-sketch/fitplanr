import { redirect } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import { Apple, Check, Clock, Dumbbell, ListChecks, TrendingUp, Video, X } from "lucide-react";
import { MainButton } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem, CountUp } from "@/components/landing/css-motion";
import { IPhone } from "@/components/iphone";
import { NotificationStack } from "@/components/landing/notifications";
import { PhoneScreen, LazyMount, LazyVSL, LazyGear, LazyProgression, LazyLog, LazyForm, LazyPlanMini, LazyNutrition } from "@/components/landing/lazy";
import { TopBar, StickyCta, Faq, Footer, KwopFlow } from "@/components/landing/chrome";
import { getSession } from "@/lib/access";
import { landingRedirect } from "@/lib/route";
import { publicPlanCount } from "@/lib/stats";

export const dynamic = "force-dynamic";

const FAQ = [
  { q: "I've never lifted. Is this for me?", a: "Yes. Week 1 is built to teach the moves with light weights and 2–3 reps left in the tank. Every exercise has a short form loop and 3 simple cues." },
  { q: "I only have 2 dumbbells. Will it really work?", a: "That's exactly who FitPlanr was built for. With a fixed pair, your plan progresses with reps, sets and slower tempo, so you keep getting stronger without buying more weights." },
  { q: "How does the weight go up?", a: "Your plan adds reps each week, then adds weight once you hit the top of the range on every set. On Pro and Elite, it reads what you actually logged and adjusts your next session." },
  { q: "Is it safe if my knees or back bother me?", a: "Tell FitPlanr what to protect and it swaps out moves that load those joints. It never asks you to test a max. If you have pain or an injury, check with a doctor first." },
  { q: "How long are the workouts?", a: "You choose 30, 45 or 60 minutes. The plan fits the number of exercises, sets and rest to that time." },
  { q: "How much does it cost?", a: "You try it free first. The plans show up once your first 4-week plan is ready." },
];

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { user } = await getSession();
  if (user) redirect(await landingRedirect());

  const sp = await searchParams;
  const keep = new URLSearchParams();
  for (const k of ["plan", "k", "utm_source", "utm_medium", "utm_campaign"]) {
    const v = sp[k];
    if (typeof v === "string") keep.set(k, v);
  }
  const cta = `/signup${keep.toString() ? `?${keep}` : ""}`;
  const hasVideo = fs.existsSync(path.join(process.cwd(), "public", "vsl.mp4"));
  const built = await publicPlanCount();

  return (
    <main className="relative overflow-x-clip">
      <KwopFlow />
      <TopBar cta={cta} />

      {/* ---------- HERO ---------- */}
      <section className="relative pt-[112px] sm:pt-[140px]">
        <div className="dot-grid pointer-events-none absolute inset-0 h-[820px]" />
        <div className="top-glow pointer-events-none absolute inset-0 h-[700px]" />
        <div className="relative mx-auto grid max-w-[1120px] items-center gap-12 px-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6">
          <div>
            <div className="label">[ POV: 2 dumbbells · 3 months ]</div>
            <h1 className="title-xl mt-5">
              <span className="block">Two dumbbells.</span>
              <span className="grad-2 block">A real plan.</span>
            </h1>
            <p className="mt-6 max-w-[520px] text-[18px] leading-relaxed text-fg/80">
              Tell FitPlanr the gear you <b className="font-semibold text-fg">actually have</b>. Get a <b className="font-semibold text-fg">week-by-week</b> plan that adds the weight for you, so you stop guessing at the gym.
            </p>
            <div className="mt-8 flex flex-col items-start gap-4">
              <MainButton href={cta} className="w-full sm:w-auto">
                Build my plan
              </MainButton>
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-muted">Free to try · No card · Ready in 60 seconds</p>
              {built !== null && <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-lime">{built.toLocaleString("en-US")}+ plans built so far</p>}
            </div>
          </div>
          <Reveal delay={0.1} className="flex justify-center lg:justify-end">
            <div className="relative max-sm:h-[540px] max-sm:overflow-hidden max-sm:[mask-image:linear-gradient(to_bottom,#000_78%,transparent)]">
              <div className="absolute -inset-16 max-sm:hidden" style={{ background: "radial-gradient(closest-side, rgb(200 255 61 / 0.12), transparent)" }} />
              <IPhone lockscreen className="relative w-[290px] sm:w-[310px]">
                <div className="mt-6">
                  <div className="hidden sm:block">
                    <NotificationStack visible={3} />
                  </div>
                  <div className="sm:hidden">
                    <NotificationStack visible={2} />
                  </div>
                </div>
              </IPhone>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- VSL ---------- */}
      <section className="mx-auto mt-24 max-w-[1120px] px-5 sm:mt-32">
        <Reveal>
          <div className="label mb-4 text-center">[ 60 seconds · watch how it works ]</div>
          <LazyMount minHeight={480}><LazyVSL video={hasVideo} /></LazyMount>
        </Reveal>
      </section>

      {/* ---------- PROBLEM (light) ---------- */}
      <section className="mt-24 bg-paper py-20 text-ink sm:mt-32 sm:py-28">
        <div className="mx-auto max-w-[1120px] px-5">
          <Reveal>
            <div className="label !text-[#6b6f66]">[ The problem ]</div>
            <h2 className="display mt-4 text-[40px] sm:text-[64px]">
              Too many exercises.
              <span className="block text-[#9a9e93]">No idea what&apos;s next.</span>
            </h2>
          </Reveal>
          <Stagger className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { icon: ListChecks, t: "Overwhelmed", d: "Thousands of exercises online, and none of them start from the two dumbbells in your closet." },
              { icon: TrendingUp, t: "Stuck at the same weight", d: "Same weight, same reps, every week. Without a plan to add a little, nothing changes." },
              { icon: Clock, t: "Wasted time", d: "Twenty minutes scrolling for a workout, then walking around the gym deciding what's next." },
            ].map((x) => (
              <StaggerItem key={x.t} className="rounded-[20px] border border-black/[0.07] bg-white p-6 shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
                <x.icon className="text-ink" size={22} />
                <div className="mt-4 text-[18px] font-semibold">{x.t}</div>
                <p className="mt-2 text-[15px] leading-relaxed text-[#5f635a]">{x.d}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="how" className="mx-auto max-w-[1120px] scroll-mt-24 px-5 py-20 sm:py-32">
        <Reveal>
          <div className="label">[ How it works ]</div>
          <h2 className="display mt-4 text-[40px] sm:text-[64px]">
            Three steps.
            <span className="grad-2 block">Sixty seconds.</span>
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
          {[
            { n: "01", t: "Select your gear", d: "Tap what you have at home or at your gym. Nothing more.", el: <PhoneScreen label="Step 6 of 6" title="Your gear"><LazyGear compact /></PhoneScreen> },
            { n: "02", t: "Get your routine", d: "A weekly split built on your goal, your days and your gear.", el: <PhoneScreen label="3-day muscle builder" title="Your plan"><LazyPlanMini /></PhoneScreen> },
            { n: "03", t: "Track your progress", d: "Log each set in one tap and watch your numbers climb.", el: <PhoneScreen label="Week 1 · Day 1" title="Full Body A"><LazyLog stacked /></PhoneScreen> },
          ].map((s, k) => (
            <Reveal key={s.n} delay={k * 0.06} className="flex flex-col items-center text-center">
              <div className="max-sm:h-[480px] max-sm:overflow-hidden max-sm:[mask-image:linear-gradient(to_bottom,#000_78%,transparent)]"><IPhone className="w-[260px]">{s.el}</IPhone></div>
              <div className="mt-6 font-mono text-sm text-lime">{s.n}</div>
              <div className="display mt-1 text-[28px]">{s.t}</div>
              <p className="mt-2 max-w-[280px] text-[15px] text-muted">{s.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section id="features" className="scroll-mt-24 border-y border-line bg-[#0a0b08] py-20 sm:py-32">
        <div className="mx-auto max-w-[1120px] px-5">
          <Reveal>
            <div className="label">[ In action ]</div>
            <h2 className="display mt-4 text-[40px] sm:text-[64px]">
              Built on your gear.
              <span className="grad-2 block">Gets harder when you do.</span>
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {[
              { icon: Dumbbell, t: "Equipment Sync", d: "Select exactly what you have. Every exercise in your plan uses only that gear.", el: <LazyMount minHeight={200}><LazyGear /></LazyMount> },
              { icon: TrendingUp, t: "Smart Progression", d: "Reps climb each week, then the weight goes up. On Pro, it adjusts from what you really lifted.", el: <LazyMount minHeight={220}><LazyProgression /></LazyMount> },
              { icon: ListChecks, t: "Visual Logs", d: "Tap a set to log it. Rest timer starts on its own. Nothing to type.", el: <LazyMount minHeight={170}><LazyLog /></LazyMount> },
              { icon: Video, t: "Form Library", d: "Short, silent loops of every move with three cues you can read mid-set.", el: <LazyMount minHeight={130}><LazyForm /></LazyMount> },
            ].map((f, k) => (
              <Reveal key={f.t} delay={(k % 2) * 0.06} className="rounded-[22px] border border-line bg-card p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime/10 text-lime">
                    <f.icon size={20} />
                  </span>
                  <div className="text-[20px] font-semibold">{f.t}</div>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{f.d}</p>
                <div className="mt-6">{f.el}</div>
              </Reveal>
            ))}
            <Reveal className="grid gap-6 rounded-[22px] border border-line bg-card p-6 sm:p-8 md:col-span-2 md:grid-cols-[0.8fr_1.2fr] md:items-center md:gap-10">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime/10 text-lime">
                    <Apple size={20} />
                  </span>
                  <div className="text-[20px] font-semibold">Nutrition &amp; Meal Scan</div>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  Calories, protein, carbs and fat for breakfast, lunch and dinner, sized for your goal. Don&apos;t like a food? Swap it: pear for apple, tofu for chicken. Snap your plate and it fills your rings.
                </p>
              </div>
              <LazyMount minHeight={200}><LazyNutrition /></LazyMount>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- WHAT CHANGES (light) ---------- */}
      <section className="bg-paper py-20 text-ink sm:py-28">
        <div className="mx-auto max-w-[1120px] px-5">
          <Reveal>
            <div className="label !text-[#6b6f66]">[ The usual way vs FitPlanr ]</div>
            <h2 className="display mt-4 text-[40px] sm:text-[64px]">
              Stop guessing.
              <span className="block text-[#9a9e93]">Start progressing.</span>
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <Reveal className="rounded-[22px] border border-black/[0.07] bg-white p-6 sm:p-8">
              <div className="text-[18px] font-semibold text-[#5f635a]">The usual way</div>
              <ul className="mt-5 space-y-4 text-[15px]">
                {["Random videos that need gear you don't own", "Same weight for months", "Writing sets in your notes app", "Guessing how long to rest"].map((x) => (
                  <li key={x} className="flex gap-3 text-[#5f635a]">
                    <X size={18} className="mt-0.5 shrink-0 text-[#b0b3aa]" /> {x}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.06} className="rounded-[22px] bg-ink p-6 text-fg sm:p-8">
              <div className="text-[18px] font-semibold">With FitPlanr</div>
              <ul className="mt-5 space-y-4 text-[15px]">
                {["Every move uses only the gear you picked", "A clear target every session: weight × reps", "One tap per set, history kept for you", "A rest timer that starts on its own"].map((x) => (
                  <li key={x} className="flex gap-3">
                    <Check size={18} className="mt-0.5 shrink-0 text-lime" /> {x}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Stagger className="mt-12 grid grid-cols-3 gap-4 text-center">
            {[
              { v: 60, s: " s", l: "to build your plan" },
              { v: 4, s: " weeks", l: "planned set by set" },
              { v: 3, s: " taps", l: "to log a set" },
            ].map((x) => (
              <StaggerItem key={x.l}>
                <div className="display whitespace-nowrap text-[30px] sm:text-[64px]">
                  <CountUp to={x.v} />
                  <span className="ml-1 text-[18px] text-[#6b6f66] sm:text-[32px]">{x.s.trim()}</span>
                </div>
                <div className="mt-1 text-[13px] text-[#5f635a] sm:text-[15px]">{x.l}</div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ---------- QUESTIONS ---------- */}
      <section id="questions" className="mx-auto max-w-[820px] scroll-mt-24 px-5 py-20 sm:py-32">
        <Reveal>
          <div className="label">[ Questions ]</div>
          <h2 className="display mb-10 mt-4 text-[40px] sm:text-[64px]">Before you start</h2>
          <Faq items={FAQ} />
        </Reveal>
      </section>

      {/* ---------- FINAL ---------- */}
      <section className="relative overflow-hidden px-5 pb-24 pt-8 sm:pb-32">
        <div className="top-glow pointer-events-none absolute inset-x-0 top-0 h-[500px] rotate-180 opacity-60" />
        <Reveal className="relative mx-auto max-w-[820px] text-center">
          <h2 className="display text-[44px] sm:text-[80px]">
            Tonight:
            <span className="grad-2 block">your first workout, planned.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[17px] text-muted">Five taps, your gear, your days. Your 4-week plan is ready before your pre-workout kicks in.</p>
          <div className="mt-8 flex justify-center">
            <MainButton href={cta}>Build my plan</MainButton>
          </div>
        </Reveal>
      </section>

      <Footer />
      <StickyCta href={cta} />
    </main>
  );
}
