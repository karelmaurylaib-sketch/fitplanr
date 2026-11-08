import type { Metadata } from "next";
import { abs } from "./site";

// The keyword map, in code: one public page per search intent (see SEO.md).
// Titles ≤ 60 characters, descriptions ≤ 155, main search inside both. Checked by scripts/seo-check.mjs.

export type SeoKind = "for" | "vs" | "alternative" | "guide";
export type SeoPage = {
  path: string;
  kind: SeoKind;
  keyword: string;
  title: string; // full <title>, brand included
  description: string;
  h1: string;
  label: string; // mono [ LABEL ] above the H1
  link: string; // anchor text used by internal links
  blurb: string; // one line under the link on hub cards
  published: string;
  updated: string;
  faq: { q: string; a: string }[];
  related: string[];
};

export const SEO_PAGES: SeoPage[] = [
  {
    path: "/for/beginners",
    kind: "for",
    keyword: "workout app for beginners",
    title: "Workout App for Beginners Who Want to Build Muscle",
    description: "A workout app for beginners that writes your plan: pick your gear, get 4 weeks of sets, reps and starting weights, and a plan that adds weight for you.",
    h1: "The workout app for beginners who want muscle, not guesswork",
    label: "For beginners",
    link: "FitPlanr for beginners",
    blurb: "What a first plan should look like, and how FitPlanr writes one for you.",
    published: "2026-11-08",
    updated: "2026-11-08",
    faq: [
      { q: "What is the best workout app for a complete beginner?", a: "One that tells you exactly what to do each session (exercise, sets, reps, weight, rest) and changes the targets as you get stronger. Loggers such as Strong and Hevy are great once you already have a program; a beginner usually needs the program first." },
      { q: "How many days a week should a beginner lift?", a: "Two or three full-body days a week is plenty to start building muscle. FitPlanr builds 2- and 3-day plans as full body, 4 days as upper/lower and 5 days as push/pull/legs plus upper/lower." },
      { q: "How heavy should I start?", a: "Lighter than you think. FitPlanr sets week 1 so you stop each set with 2 to 3 reps left in the tank, and it never asks you to test a one-rep max." },
      { q: "Do I need a gym?", a: "No. Plans can be built on 2 dumbbells, adjustable dumbbells and a bench, bands, a pull-up bar, bodyweight only, or a full gym. Every exercise uses only the gear you picked." },
      { q: "Is FitPlanr free?", a: "Building your plan is free and needs no card: you see the plan's split and Week 1 Day 1 in full. Unlocking the whole 4 weeks and the logger needs a paid plan." },
    ],
    related: ["/guides/how-to-start-lifting-weights", "/guides/3-day-full-body-workout-for-beginners", "/alternatives/fitbod"],
  },
  {
    path: "/for/home-dumbbells",
    kind: "for",
    keyword: "dumbbell workout plan at home",
    title: "Dumbbell Workout Plan at Home, Built on the Pair You Own",
    description: "A dumbbell workout plan for home, built on the exact pair you own. See a real 4-week plan for 2 × 25 lb dumbbells and how it keeps getting harder.",
    h1: "A dumbbell workout plan for home, built on the pair you own",
    label: "For home lifters with dumbbells",
    link: "Home dumbbell workout plan",
    blurb: "A real 4-week plan for one fixed pair of 25 lb dumbbells.",
    published: "2026-11-08",
    updated: "2026-11-08",
    faq: [
      { q: "Can you build muscle with only dumbbells at home?", a: "Yes, as long as the work keeps getting harder over time. With a fixed pair that means more reps, then more sets and slower lowering, and later a heavier pair or a harder variation." },
      { q: "What weight dumbbells should a beginner buy?", a: "Many beginners start with a pair between 15 and 30 lb. If you can, adjustable dumbbells are the better buy because the weight can go up in small steps. FitPlanr builds the plan on whatever you already have." },
      { q: "What if my dumbbells are too heavy for some moves?", a: "FitPlanr skips dumbbell moves that would be far too heavy for your pair (for example lateral raises with 25 lb) and uses a bodyweight move for that slot instead." },
      { q: "How long are the workouts?", a: "You choose 30, 45 or 60 minutes. The 3-day, 45-minute plan for 2 × 25 lb dumbbells shown on this page comes out at 33 to 37 minutes per session." },
      { q: "Do I need a bench?", a: "No. Without a bench you get floor presses, one-arm rows supported on a chair, goblet squats and Romanian deadlifts. Add a bench and the plan adds bench presses, chest-supported rows and hip thrusts." },
    ],
    related: ["/guides/progressive-overload-with-dumbbells", "/guides/3-day-full-body-workout-for-beginners", "/for/beginners"],
  },
  {
    path: "/vs/hevy-vs-strong",
    kind: "vs",
    keyword: "hevy vs strong",
    title: "Hevy vs Strong (2026): Price, Free Limits, Who Each Fits",
    description: "Hevy vs Strong, compared on what you can check: prices, free-plan limits, platforms and planning. Plus what to use if you need the plan written for you.",
    h1: "Hevy vs Strong: which workout tracker fits you?",
    label: "Hevy vs Strong",
    link: "Hevy vs Strong",
    blurb: "Two great loggers, compared on facts you can check.",
    published: "2026-11-08",
    updated: "2026-11-08",
    faq: [
      { q: "Is Hevy or Strong better?", a: "Both are excellent manual loggers. Hevy is cheaper and adds a social feed and a paid Trainer add-on; Strong is a minimal, focused logger. Pick on price, free-plan limits and which interface you like." },
      { q: "Which is cheaper, Hevy or Strong?", a: "At the prices listed in November 2026, Hevy Pro ($2.99/month, $23.99/year, $74.99 lifetime) costs less than Strong PRO ($4.99/month, $29.99/year, $99.99 lifetime). Store prices can vary by country." },
      { q: "Do Hevy or Strong create a workout plan for you?", a: "Strong does not: you build your own routines. Hevy offers Hevy Trainer as an add-on. Both are built first for logging a program you already have." },
      { q: "I'm a beginner with no program. Which should I use?", a: "Either works once you have a program to follow. If you don't, start with a plan built for your gear (FitPlanr writes one in about a minute), then log it." },
    ],
    related: ["/alternatives/strong", "/alternatives/fitbod", "/for/beginners"],
  },
  {
    path: "/alternatives/fitbod",
    kind: "alternative",
    keyword: "fitbod alternative",
    title: "Fitbod Alternative for Beginners: FitPlanr, Honestly",
    description: "Looking for a Fitbod alternative? FitPlanr gives you a fixed 4-week plan built on your gear, instead of a new workout each day. Facts, prices, who fits.",
    h1: "A Fitbod alternative for beginners who want one clear plan",
    label: "Fitbod alternative",
    link: "Fitbod alternative",
    blurb: "A fixed 4-week plan instead of a new workout every day.",
    published: "2026-11-08",
    updated: "2026-11-08",
    faq: [
      { q: "What is the main difference between Fitbod and FitPlanr?", a: "Fitbod generates each workout as you go, from your equipment, history and estimated muscle recovery. FitPlanr writes the whole 4-week block up front from your goal, days, time, joints to protect and gear, then progresses it on a fixed rule." },
      { q: "Is FitPlanr cheaper than Fitbod?", a: "Fitbod lists $15.99 a month or $95.99 a year (November 2026). FitPlanr's current prices are shown on this page, read live from our billing system." },
      { q: "Does FitPlanr have a native iPhone app?", a: "No. FitPlanr runs in your phone's browser and can be added to your home screen. Fitbod has native iOS and Android apps and watch support." },
      { q: "Is FitPlanr AI?", a: "No. FitPlanr uses a fixed, rule-based engine: the same answers always give the same plan, and progression follows written rules you can read on our guides." },
    ],
    related: ["/alternatives/strong", "/vs/hevy-vs-strong", "/for/beginners"],
  },
  {
    path: "/alternatives/strong",
    kind: "alternative",
    keyword: "strong app alternative",
    title: "Strong App Alternative That Writes Your Plan for You",
    description: "Strong is a great logger, but it won't tell you what to lift. FitPlanr, a Strong app alternative, builds your 4-week plan from your gear and logs it.",
    h1: "A Strong app alternative that writes the plan for you",
    label: "Strong alternative",
    link: "Strong app alternative",
    blurb: "When you need the program, not just the log.",
    published: "2026-11-08",
    updated: "2026-11-08",
    faq: [
      { q: "Why look for a Strong alternative?", a: "Usually for one of two reasons: you hit the free plan's 3-routine limit, or you don't know what routine to put in it. If it's the first, Hevy is the closest swap. If it's the second, you need an app that writes the plan." },
      { q: "Can I keep using Strong with a FitPlanr plan?", a: "Yes. You can copy the exercises, sets and reps of your FitPlanr plan into a Strong routine. FitPlanr also has its own one-tap logger with a rest timer that starts on its own." },
      { q: "Does FitPlanr track 1-rep maxes like Strong?", a: "FitPlanr never asks you to test a max. On Pro and Elite, strength charts show an estimated 1-rep max worked out from the sets you logged." },
      { q: "How much does Strong cost?", a: "Strong lists PRO at $4.99 a month, $29.99 a year or $99.99 lifetime (November 2026), with a free plan limited to 3 routines." },
    ],
    related: ["/vs/hevy-vs-strong", "/alternatives/fitbod", "/guides/progressive-overload-with-dumbbells"],
  },
  {
    path: "/guides/progressive-overload-with-dumbbells",
    kind: "guide",
    keyword: "progressive overload with dumbbells",
    title: "Progressive Overload With Dumbbells: A 4-Week Example",
    description: "How to use progressive overload with dumbbells, even one fixed pair: the double-progression rule, a real 4-week example, and when to add weight.",
    h1: "Progressive overload with dumbbells, even with one fixed pair",
    label: "Guide · progression",
    link: "Progressive overload with dumbbells",
    blurb: "The double-progression rule, with a real 4-week example.",
    published: "2026-11-08",
    updated: "2026-11-08",
    faq: [
      { q: "What is progressive overload?", a: "Making the work a little harder over time, so your body has a reason to adapt. Weight is one way; more reps, more sets, slower lowering and harder variations are others." },
      { q: "How often should I add weight to dumbbell exercises?", a: "Only when you hit the top of your rep range on every set with clean form. With a range of 8 to 12, that means 12 reps on all sets before going up one step (usually 5 lb per dumbbell)." },
      { q: "What if I can't go heavier?", a: "Add a set, slow the lowering to 3 seconds, shorten rest, or switch to a one-arm or one-leg version. Those keep the work rising with the same pair." },
      { q: "What if I miss reps?", a: "Keep the same weight and own it. FitPlanr's Smart Progression (Pro and Elite) uses this rule: miss the bottom of the range and you hold; miss it three sessions in a row and the weight drops 10% so you can rebuild clean reps." },
    ],
    related: ["/for/home-dumbbells", "/guides/3-day-full-body-workout-for-beginners", "/guides/how-to-start-lifting-weights"],
  },
  {
    path: "/guides/3-day-full-body-workout-for-beginners",
    kind: "guide",
    keyword: "3 day full body workout for beginners",
    title: "3-Day Full Body Workout for Beginners (4-Week Plan)",
    description: "A 3-day full body workout for beginners: three different days (A, B, C), exact sets, reps, rest and starting weights, and how weeks 2 to 4 progress.",
    h1: "A 3-day full body workout for beginners, written out for 4 weeks",
    label: "Guide · 3-day full body",
    link: "3-day full body workout for beginners",
    blurb: "Days A, B and C with sets, reps, rest and weights.",
    published: "2026-11-08",
    updated: "2026-11-08",
    faq: [
      { q: "Is a 3-day full body workout good for beginners?", a: "Yes. Training each muscle on three days a week with rest days in between gives you a lot of practice on the main moves and plenty of recovery." },
      { q: "Which days should I train?", a: "Any three days with a day off between them. Monday, Wednesday and Friday is the classic choice, and it's what FitPlanr schedules by default." },
      { q: "How long should each workout take?", a: "About 35 to 45 minutes for a beginner. The example plans on this page run 33 to 40 minutes, including rest." },
      { q: "Should days A, B and C be different?", a: "It helps. Rotating a squat day, a hinge day and a lunge day spreads the stress and gives you more moves to learn without making any one session long." },
    ],
    related: ["/guides/how-to-start-lifting-weights", "/guides/progressive-overload-with-dumbbells", "/for/beginners"],
  },
  {
    path: "/guides/how-to-start-lifting-weights",
    kind: "guide",
    keyword: "how to start lifting weights",
    title: "How to Start Lifting Weights: Your First 4 Weeks",
    description: "How to start lifting weights as a beginner: what to do in week 1, how heavy to go, how long to rest, how to warm up, and how the next 3 weeks progress.",
    h1: "How to start lifting weights: your first 4 weeks, step by step",
    label: "Guide · getting started",
    link: "How to start lifting weights",
    blurb: "Week 1 to week 4, from the first warm-up set.",
    published: "2026-11-08",
    updated: "2026-11-08",
    faq: [
      { q: "How do I start lifting weights if I've never done it?", a: "Pick 2 or 3 days a week, use 4 to 6 exercises per session that cover squat, hinge, push and pull, start light enough to stop each set with 2 to 3 reps left, and add reps before you add weight." },
      { q: "How long until I see results?", a: "Most beginners feel stronger within the first few weeks as they learn the moves. Visible muscle takes longer and depends on consistency, sleep and food." },
      { q: "Should I be sore after every workout?", a: "No. Some soreness in the first weeks is normal. Soreness is not a sign the workout worked; adding reps or weight over time is." },
      { q: "Do I need supplements?", a: "No. A plan you follow, enough protein and sleep matter far more. Check with a doctor before starting if you have a health condition or injury." },
    ],
    related: ["/guides/3-day-full-body-workout-for-beginners", "/for/beginners", "/for/home-dumbbells"],
  },
];

export const GUIDES_HUB = {
  path: "/guides",
  title: "Strength Training Guides for Beginners | FitPlanr",
  description: "Plain-English strength training guides for beginners: how to start, 3-day full body plans, progressive overload with dumbbells, and app comparisons.",
  h1: "Strength training guides for beginners",
};

export const PAGE_BY_PATH: Record<string, SeoPage> = Object.fromEntries(SEO_PAGES.map((p) => [p.path, p]));

export function seoMetadata(path: string): Metadata {
  const p = PAGE_BY_PATH[path];
  return {
    title: { absolute: p.title },
    description: p.description,
    alternates: { canonical: path },
    openGraph: { type: p.kind === "guide" ? "article" : "website", url: abs(path), title: p.title, description: p.description, siteName: "FitPlanr", images: [{ url: `/og${path}`, width: 1200, height: 630, alt: p.h1 }] },
    twitter: { card: "summary_large_image", title: p.title, description: p.description, images: [`/og${path}`] },
  };
}

export const KIND_NAME: Record<SeoKind, string> = { for: "Who it's for", vs: "Comparisons", alternative: "Alternatives", guide: "Guides" };
