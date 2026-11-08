# FitPlanr — SEO playbook

Goal: rank at the top of Google (US, English) for what beginners who want muscle without a coach really search, and stay there.
Written Nov 8, 2026. Re-check competitor facts every quarter (`lib/seo/competitors.ts`, `CHECKED`).

---

## 1. The 10 rules (where the best sources agree)

Sources read for this (Nov 2026):
- Google Search Central — *SEO Starter Guide* (developers.google.com/search/docs/fundamentals/seo-starter-guide), and the reporting on its
  shorter rewrite ([Search Engine Roundtable](https://www.seroundtable.com/google-seo-starter-guide-cut-in-half-36788.html)).
- Google Search Central — *Creating helpful, reliable, people-first content* (developers.google.com/search/docs/fundamentals/creating-helpful-content),
  and its 2026 "main content" revision ([Search Engine Journal](https://www.searchenginejournal.com/google-changed-its-helpful-content-guidelines-to-emphasize-good-main-content/),
  [PPC Land on fake author profiles](https://ppc.land/google-says-fake-author-profiles-signal-a-low-quality-page/)).
- Ahrefs — [low-competition keywords](https://ahrefs.com/blog/low-competition-keywords) (KD filter, check who ranks, internal links pass PageRank).
- Backlinko / Brian Dean — search intent as the biggest change in SEO ([Semrush Academy course](https://www.semrush.com/academy/courses/content-led-seo-course-with-brian-dean),
  [Rocket.net interview](https://rocket.net/blog/future-of-seo-brian-dean/)).
- Edward Sturm — bottom-of-funnel "compact keywords" for low-authority sites ([The Edward Show](https://pocketcasts.com/podcast/the-edward-show/4a3893e0-2ef4-013c-f681-0acc26574db2/how-i-find-low-competition-keywords-that-actually-convert/50b4a861-1524-440c-bfeb-dc24004e6e0b),
  [Predictable B2B Success](https://pod.co/predictable-b2b-success/how-to-optimize-for-the-search-experience-not-just-results-to-drive-growth)).
- Top SEO YouTube channels this year: Matt Diggity, Nathan Gotch, Semrush, Ahrefs ([Awisee list](https://awisee.com/blog/seo-youtube-channels/), [Rank Math list](https://rankmath.com/blog/best-seo-youtube-channels/)).
- SaaS SEO playbooks 2026 ([Seobility](https://www.seobility.net/en/blog/saas-seo-guide/), [Growtika](https://growtika.com/blog/saas-seo-guide)) — vendor sources, used only where they agree with the above.

| # | Rule | Who says it |
|---|---|---|
| 1 | **People first.** Write each page to fully answer one person's question; content made to rank instead of help is demoted. | Google helpful-content guide; Dean; Gotch |
| 2 | **One page per search intent.** Match what the searcher wants (a list, a comparison, a how-to, a tool) — never two pages for the same intent. | Google starter guide (avoid duplicate content); Dean; Ahrefs |
| 3 | **Start at the bottom of the funnel.** A new site with little authority wins first on low-volume, high-intent searches: "X alternative", "X vs Y", "app for <who>". | Sturm; Ahrefs; SaaS playbooks |
| 4 | **Pick fights you can win.** Low difficulty is not enough: check the 3 pages ranking today; if they're thin vendor pages, you can beat them; if they're huge brands, wait. | Ahrefs; Diggity; Gotch |
| 5 | **Show first-hand experience.** Real examples, real product output, original data. Generic rewrites of what already ranks add nothing. | Google helpful-content (E-E-A-T, "original information"); Dean |
| 6 | **Answer first.** Put the answer and the result at the top of the page (the "main content"), then the detail. | Google 2026 main-content revision; AI-overview era advice (Sturm) |
| 7 | **Be honest and verifiable.** No invented reviews, numbers, quotes or authors; fake author profiles are a low-quality signal. Date pages and say when facts were checked. | Google helpful-content; PPC Land report |
| 8 | **Clean technical basics.** Descriptive URL, a unique title and meta description per page, one H1, canonical, sitemap, structured data, fast on a phone. Meta keywords and word count do not matter. | Google starter guide; SEJ (meta keywords, word count) |
| 9 | **Link pages together.** Hub → spoke internal links with descriptive anchor text help Google find pages and understand topics. | Google starter guide (links); Ahrefs (internal links pass PageRank) |
| 10 | **Publish steadily, then improve what's working.** One solid page a week beats bursts; after 4–8 weeks, improve pages sitting in positions 5–20 in Search Console. | Ahrefs; Gotch; SaaS playbooks |

---

## 2. Keyword map — one page per intent

There is no paid keyword tool on this account, so **demand** and **competition** are estimates from the live results pages
(who ranks, how strong they are, how many ads/listicles). Replace with Search Console impressions after 4–8 weeks.
Demand: ●●● high · ●● medium · ● low. Competition: what ranks today (weak = thin vendor pages, strong = big publishers).

| # | Search (main keyword) | Intent | Demand | Competition | Page | Status |
|---|---|---|---|---|---|---|
| 1 | workout plan app / workout planner app | product | ●●● | strong (app stores, big brands) | `/` | live, improved |
| 2 | best workout app for beginners (to build muscle) | best-for-who | ●●● | medium (Fortune, vendor blogs) | `/for/beginners` | **new** |
| 3 | dumbbell workout plan at home | problem / plan | ●●● | medium (Fit&Well, T3, Coachweb) | `/for/home-dumbbells` | **new** |
| 4 | hevy vs strong | competitor vs | ●● | weak (vendor blogs) | `/vs/hevy-vs-strong` | **new** |
| 5 | fitbod alternative | competitor alternative | ●● | weak (vendor listicles) | `/alternatives/fitbod` | **new** |
| 6 | strong app alternative | competitor alternative | ●● | weak–medium (AlternativeTo, Boostcamp) | `/alternatives/strong` | **new** |
| 7 | progressive overload with dumbbells | how to | ●● | weak–medium (blogs, CUNY pressbook) | `/guides/progressive-overload-with-dumbbells` | **new** |
| 8 | 3 day full body workout for beginners | how to / plan | ●●● | medium (Muscle & Strength, StrengthLog) | `/guides/3-day-full-body-workout-for-beginners` | **new** |
| 9 | how to start lifting weights | how to | ●●● | medium–strong (GoodRx, Nike, Garage Gym Reviews) | `/guides/how-to-start-lifting-weights` | **new** |
| 10 | hevy alternative | competitor alternative | ●● | weak (vendor pages) | `/alternatives/hevy` | week 1 |
| 11 | workout plan generator (based on equipment) | tool | ●● | weak–medium (Vondy, Gymkee, workout.lol) | `/workout-plan-generator` | week 2 |
| 12 | workout plan for bad knees (beginner) | problem / plan | ●● | medium (blogs, WeShape) | `/for/bad-knees` | week 3 |
| 13 | deload week (how and when) | how to | ●● | medium (StrengthLog, Stronger by Science) | `/guides/deload-week` | week 4 |
| 14 | bodyweight workout plan for beginners at home | problem / plan | ●●● | medium–strong | `/for/bodyweight` | backlog |
| 15 | fitbod vs hevy / fitbod vs strong | competitor vs | ● | weak | `/vs/fitbod-vs-hevy` | backlog |
| 16 | how many sets per week to build muscle (beginner) | how to | ●● | strong (science sites) | `/guides/sets-per-week` | backlog |

### What ranks today and what it misses (top 3, Nov 2026)

- **fitbod alternative** — sensai.fit/blog/best-fitbod-alternatives-2026 · arvo.guru/fitbod-alternative · lilachbullock.com/fitbod-alternatives.
  All are listicles by apps promoting themselves. **Miss:** nobody shows what you'd actually train instead; no honest "where Fitbod is better".
- **hevy vs strong** — sensai.fit/blog/hevy-vs-strong-2026 · setgraph.app/articles/hevy-vs-strong-app-comparison-2026 · repreturn.com/strong-app-vs-hevy.
  Cover prices and free limits, but disagree with each other on the free tiers. **Miss:** the beginner with no program — both apps assume you have one.
- **strong app alternative** — alternativeto.net/software/strong · boostcamp.app/alternatives/strong · setgraph.app best Strong alternatives.
  **Miss:** they don't separate *why* you're leaving (price/limits vs. "I don't know what to lift").
- **best workout app for beginners** — fortune.com/article/best-workout-apps · alphaprogression.com/en/blog/best-beginner-strength-training-apps · indiehackers "I tested 7 apps".
  **Miss:** no sample of what a beginner's week looks like; little on gear limits or joint safety.
- **dumbbell workout plan at home** — fitandwell.com beginner plan · t3.com 4-week dumbbell plan · coachweb.com dumbbell plan.
  Assume heavier or adjustable dumbbells. **Miss:** what to do with ONE fixed pair that's too heavy for some moves and too light for others.
- **progressive overload with dumbbells** — pressbooks.cuny.edu home-fitness chapter · fitbod.me blog · 1upnutrition.com.
  List levers (reps, tempo, rest). **Miss:** a concrete week-by-week example with numbers and a rule for when to go heavier.
- **3 day full body workout for beginners** — muscleandstrength.com 3-day routine · bonytobeastly.com · strengthlog.com.
  Gym-only, often A/B alternation. **Miss:** a home version, starting weights, and what weeks 2–4 look like.
- **how to start lifting weights** — garagegymreviews.com · goodrx.com · greatist.com / nike.com.
  General tips. **Miss:** an actual first week with weights, and the progression for the following 3 weeks.
- **workout plan generator** (for week 2) — gymkee.com/tools/ai-workout-generator · workout.lol · vondy.com generators.
  **Miss:** they regenerate random workouts (no progression); no safety for joints.
- **hevy alternative** (for week 1) — boostcamp.app/alternatives/hevy · lyfta.app/hevy-alternatives · lastlift / fitly vendor pages.
- **workout plan for bad knees** (for week 3) — weshape.com · boxrox.com · darebee.com. **Miss:** plans that still build legs with real load.

How each FitPlanr page beats them: the answer in the first box, **real engine output** (`components/seo/example-plan.tsx` renders
`lib/engine` live — never typed by hand), honest comparison tables with the date facts were checked, a 4–5 question FAQ, the main button.

---

## 3. Technical — checked and fixed (Nov 8, 2026)

| Item | State |
|---|---|
| Title ≤ 60 / description ≤ 155 with the main search, per page | ✅ all public pages (checked by `scripts/seo-check.mjs`) |
| One H1 per page | ✅ |
| Canonical URL on every public page | ✅ (`alternates.canonical`) |
| `sitemap.xml` | ✅ 14 URLs: home, /guides, 8 keyword pages, signup, login, terms, privacy |
| `robots.txt` | ✅ crawl all, block `/api/` only. Private screens use `noindex` meta instead of `Disallow` (a disallow hides the noindex from Google) |
| Private screens noindex | ✅ /plan, /start, /start/building, /forgot, /reset, app pages, share links `/s/*` (personal, near-duplicate) |
| Clean URLs | ✅ `/for/…`, `/vs/…`, `/alternatives/…`, `/guides/…` |
| Open Graph images | ✅ root image + one per keyword page at `/og/<path>` (static, built at deploy) |
| Structured data | ✅ Organization, WebSite, SoftwareApplication (offers read from GET KWOP_API, cached 1 h, never hardcoded), FAQPage, BreadcrumbList, Article (guides), CollectionPage (/guides) |
| Speed (Lighthouse mobile, local `next start`) | landing 93 perf / 100 SEO; keyword pages 91–93 / 100. JetBrains Mono no longer preloaded |
| Images sized, with alt text | ✅ no raster images in pages; OG images have alt; icons are inline SVG |
| Internal links | ✅ top bar "Guides", footer Guides + Compare columns, landing "Read next", in-text links, "Keep reading" cards, /guides hub |
| Real 404 | ✅ returns HTTP 404, noindex, links to popular pages |
| IndexNow | ✅ key file `public/2d74ddb9fd6087440e78c2c7f4404395.txt`, `node scripts/indexnow.mjs` (Bing/Yandex; Google uses the sitemap) |

Note: no `aggregateRating` in the SoftwareApplication data on purpose — FitPlanr has no public reviews yet, and invented ratings are against
Google's rules. Add it only when real reviews exist.

---

## 4. Plan for the next 4 weeks (one page a week, in this order)

1. **Week 1 — `/alternatives/hevy`** ("hevy alternative"): same honest frame as the Strong page; Hevy's free limits (routines, custom
   exercises), Hevy Trainer vs a fixed 4-week plan.
2. **Week 2 — `/workout-plan-generator`** ("workout plan generator based on equipment"): the tool intent — show the gear presets and
   3 real plans side by side (2 dumbbells / home + bench / full gym); explain why random regeneration stalls progress.
3. **Week 3 — `/for/bad-knees`** ("workout plan for bad knees"): real engine output with *protect: knees* (box squat, leg press, hip
   thrust instead of goblet squats and lunges); clear "see a doctor or PT" boundaries.
4. **Week 4 — `/guides/deload-week`** ("deload week"): what it is, when, how much to cut (FitPlanr: −1 set, ~−10% load), example
   from the engine with `deload: true`.

Then: improve whatever sits in positions 5–20 in Search Console before writing more.

## 5. How to write the next page ("next SEO page")

1. Search the keyword; read the top 3; note what they cover and miss (add to section 2).
2. Add the entry to `lib/seo/pages.ts` (title ≤ 60, description ≤ 155, H1, FAQ 4–5, 3 related pages). The sitemap, OG image,
   breadcrumbs and JSON-LD follow automatically.
3. Create `app/<section>/<slug>/page.tsx` using `SeoShell`: answer first, real engine output (`ExampleWeek`/`ExampleProgression`),
   honest tables (`CompareTable`, facts from `lib/seo/competitors.ts`), links to 2–3 sibling pages, no invented numbers or quotes.
4. Link to it from 2+ existing pages (and the footer if it's a main page).
5. `npm run build && npx next start`, `node scripts/seo-check.mjs` (add the path to `PUBLIC`), screenshots at 390/1440, deploy,
   `BASE_URL=https://fitplanr-3.vercel.app node scripts/seo-check.mjs`, `node scripts/indexnow.mjs <url>`, then "Request indexing" in Search Console.
