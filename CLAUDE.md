# FitPlanr — project memory

"Your personal trainer, automated." A web SaaS for US beginners who want to build muscle without hiring a coach:
pick the gear you actually have → get a safe, progressive 4-week plan → log sets and watch the numbers climb.
Built by the Kwop method (PREMIUM build). English only, USD. Phones first (390 px), then desktop.

**RESULT = "your 4-week plan"** (short form: "your plan").
- Main button everywhere: **"Build my plan"**
- Creating screen: "Building your plan…"
- Paywall title: **"Your 4-week plan is ready."**
- Unlock button: **"Unlock my full plan"**

---

## Step 0 — competitor research (US, Nov 2026)

Strong and Hevy are **workout loggers**, not plan generators: you build your own routines and log them. They do not do
FitPlanr's job (gear in → plan out). They stay as the price reference for "tracking"; **Fitbod** replaces them as the
direct competitor and the structural model.

| | Strong | Hevy | Fitbod (model) |
|---|---|---|---|
| Job | Log sets, templates | Log sets, social feed, "Hevy Trainer" add-on | Generates workouts from your equipment + recovery |
| Landing headline | "The simplest way to track your workouts" style: app-store-first site | "Track workouts, get stronger" + social proof | "Your personal trainer in your pocket"-style: AI workouts tailored to you |
| Landing order | Hero + store badges → screenshots → features → reviews | Hero → feature tiles → community → reviews → download | Hero → how it works → equipment/gym profiles → progress → reviews → FAQ → CTA |
| Button | "Download" | "Download for free" | "Get started" / "Try it free" |
| Sign-up | In app, Apple/Google/email | In app, Apple/Google/email | Onboarding quiz FIRST (goal, experience, frequency, gym/equipment), then account |
| First result | Empty log, you create a routine | Empty log / pick a routine | First generated workout right after the quiz |
| Paywall | Soft: hit 3-routine cap | Soft: hit 4-routine cap / graph history | Right after onboarding: trial paywall over the generated plan |
| Plans | Free (3 routines) · PRO $4.99/mo · $29.99/yr · $99.99 lifetime | Free (4 routines, 3 mo graphs) · Pro $2.99/mo · $23.99/yr · $74.99 lifetime | $15.99/mo · $95.99/yr (7-day trial; legacy $12.99/$79.99) |

**Model picked: Fitbod** (quiz → plan generated from equipment → paywall over that plan). FitPlanr applies the Kwop rules on
top: no prices on the landing page, Google sign-up right after the landing page, 4–6 typed one-tap questions, the plan
builds itself with a %, day 1 clear / weeks 2–4 blurred, per-day prices, checkout embedded in a sheet. Never copy any of
their brand, text, images or code.

---

## Step 0b — the blueprint

### Funnel type: PERSONAL FLOW
A plan needs the person's goal, level, days and gear — it cannot be honest in 3 taps without them. So:
landing → "Build my plan" → /signup (Google first) → 5 one-tap questions + Equipment Sync → plan builds (≥6 s) →
Day 1 clear, rest blurred → "Unlock my full plan" → paywall sheet → Whop checkout sheet → unlock film → plan unblurs.

### The hero (first 10 seconds)
- Mono label `[ POV: 2 DUMBBELLS · 3 MONTHS ]`
- Title (≤8 words): **"Two dumbbells. Twelve weeks. A real plan."** — 2nd line grey gradient.
- Sentence: "Tell FitPlanr the gear you **actually have**. Get a **week-by-week** plan that adds weight for you."
- Big pill button "Build my plan →" (breathing glow, nudging arrow).
- True facts line: "Free to try · No card · Ready in 60 seconds"
- Right (under the button on a phone): a CSS iPhone showing FitPlanr's lock-screen notifications sliding in
  (Kwop timings): "Day 1 · Push — 2 dumbbells, 38 min", "+5 lb on Goblet Squat this week", "Week 2 unlocked",
  "4 workouts done · streak 🔥" → no emoji: a flame icon. Example values only.
- Under the hero: the motion VSL (7 scenes, ~60 s).

### Screens, in order, with copy
1. `/` landing — sections: hero → VSL → [ THE PROBLEM ] "Too many exercises. No idea what's next." → [ HOW IT WORKS ]
   Select gear / Get routine / Track progress (animated phone frames) → [ IN ACTION ] 5 feature loops (Equipment Sync,
   Smart Progression, Visual Logs, Form Library, Muscle Map — wide card) → [ THE USUAL WAY vs FITPLANR ] comparison → [ QUESTIONS ] 6 FAQs →
   final block "Tonight: your first workout, already planned." + button → footer with giant faded wordmark.
2. `/signup` — centered card: "Sign up so FitPlanr can build your plan." Google (white, G) / or / email / password
   (show/hide) / "Build my plan" / "Already have an account? Log in" / Terms · Privacy.
3. `/start` — the personal flow, one typed question per screen, thin progress bar, "← Previous question":
   1. "What do you want from the gym?" Build muscle · Get stronger · Lose fat, keep muscle · Get fit and feel better
   2. "How much lifting have you done?" Never really · A few months · Over a year (on and off)
   3. "How many days a week can you train?" 2 · 3 · 4 · 5
   4. "How long is one workout?" 30 min · 45 min · 60 min
   5. "Anything to protect?" (multi, optional, Skip) Lower back · Knees · Shoulders · Nothing
   6. Equipment Sync (the one input): "What do you have, for real?" presets (Home: 2 dumbbells · Home + bench ·
      Full gym · Bodyweight only) + toggle grid (dumbbells, adjustable dumbbells, barbell, rack, bench, cables,
      machines, kettlebell, pull-up bar, bands) + dumbbell max weight. Pre-filled with "2 dumbbells (25 lb)".
   Each answer shows its "line" (drawer) e.g. "3 days → a full-body split, every other day."
4. `/start/building` — "Building your plan…": 5 named steps tick (Reading your gear · Picking your split ·
   Choosing exercises · Setting your starting weights · Planning 4 weeks of progression), % to 99, plan cards assemble
   behind. Real engine runs server-side (deterministic, see below). Then "Your 4-week plan is ready."
5. `/plan` (result) — Week 1 Day 1 fully clear (exercises, sets × reps, starting weight, rest, form tip); the rest of week 1
   and weeks 2–4 blurred with a lock; sticky "Unlock my full plan · $0.xx / day".
6. Paywall sheet (also `/pricing`) — "Your 4-week plan is ready." + personal line
   "3 days a week, 45 minutes, built on 2 dumbbells (25 lb)." → plans → button → Whop sheet.
7. Unlock film → plan unblurs → app.

### Clear vs blurred
Clear: plan name/split, week overview chips, Week 1 Day 1 in full. Blurred: the other days of week 1, weeks 2–4, the
progression chart.

### Sign-up moment
Right after the landing page (before the questions). Answers save to `profiles.answers` at each tap.

### The engine (the real work, no AI key needed)
`lib/engine/` — a deterministic, rule-based program generator (exercise DB with equipment requirements, movement
pattern, joint stress flags, form cues). Split by days (2–3 full body, 4 upper/lower, 5 PPL+UL). Volume by level and
time. Starting load from level + available dumbbell max (conservative, RPE 7). Weekly progression: double progression
(reps up in range, then +5 lb dumbbell / +5–10 lb barbell), week 4 = deload (-40% volume). Safety: beginners never
>20 hard sets per muscle a week, no 1RM testing, joint flags swap exercises (e.g. knees → box squat/glute bridge).
"Smart Progression" = this algorithm reading the user's logged sets: hit the top of the rep range on all sets → next
session +1 step; missed twice → hold; missed 3× → -10%. Shown honestly as "automatic progression", not "AI".

### Plans (Kwop) — owner picked option C (Nov 8, 2026). Saved in Kwop; the app always reads them from GET KWOP_API.
| Plan (Kwop id) | Month | Year (−20%) | Tag | Quotas per billing period |
|---|---|---|---|---|
| Starter (1567) | $4.99 · $0.17/day | $48 · $0.13/day | For 2–3 workouts a week | 12 logged workouts, 2 plan rebuilds, 30 days history, plan targets only (no Smart Progression), form guides for plan exercises only |
| Pro (1568) ★ Most popular | $8.99 · $0.30/day | $86 · $0.24/day | For lifters who never miss a week | 30 logged workouts, 6 rebuilds, Smart Progression, strength charts, full form library, all history |
| Elite (1569) | $12.99 · $0.43/day | $125 · $0.34/day | For serious muscle building | 90 logged workouts, 20 rebuilds, custom split (swap exercises, move days), deload week, CSV export |
Quotas live in `lib/tiers.ts` (tier matched by plan name). The first plan of an account is free (not a rebuild).
Free (unpaid): the plan is built and saved; Week 1 Day 1 is sent in clear, everything else is masked server-side (`lib/teaser.ts`).

### Magic moment on the landing page
The notification iPhone in the hero + the device frames of how-it-works.

### Visual direction (energy)
- Background `#060606` (true black), cards `#0E0F0C`, borders `rgb(255 255 255 / 9%)`, text `#F4F5F0`, muted `#8A8F82`.
- Accent **`#C8FF3D`** (electric lime, the brand color) — buttons, rings, progress; ink on lime `#0A0D02`.
- Secondary warm `#FF7A1A` used only for "PR"/streak moments. Light sections `#FAFAFA` / ink `#0B0C0A`.
- Fonts: **Barlow Condensed** (700, headings, numbers) + **Inter** (body); mono labels **JetBrains Mono**.
- 3 signature elements: (1) progress rings (week completion, %), (2) the rest stopwatch / tempo dial,
  (3) the plate/dumbbell load bar ("25 lb → 30 lb") drawn in SVG.
- Kwop-grade kit: dot grid hero (22 px), top glow, floating top bar card, breathing pill button, mono `[ LABELS ]`,
  reveals 14 px / .5 s cubic-bezier(.22,.8,.24,1) stagger 60 ms, count-ups 1.3 s, reduced motion respected.

---

## Muscle Map & Calorie Burn Estimator (Nov 9, 2026)
Lives in the exercise detail sheet (`components/exercise-sheet.tsx`, opened from Form library, Workout and the plan's
Day 1), directly under the title and the form loop ("video player"): player → [ MUSCLE MAP ] card → [ CALORIE BURN ] card
→ sets → cues. Landing: 5th wide card "Muscle Map" in [ IN ACTION ] (`MuscleLoop` in `components/landing/loops.tsx`,
cycles squat / bench / pulldown, man then woman, example values, no prices).
- Muscles: `lib/engine/muscles.ts`. Primary = regions of the exercise's first listed muscle; secondary = the other listed
  muscles + per-pattern helpers (e.g. hinge → lower back, forearms), with a few per-exercise overrides. 18 regions.
- Body: `components/muscle-map.tsx` — front + back SVG drawn in code (left half mirrored). Man / woman = different build
  (shoulders, waist, hips, limbs, hair), switched instantly in React state. Primary = solid `--muscle` #00FF66 with glow and a
  2.6 s contraction pulse (same period as the form loop); secondary = #00FF66 at 38%. Tap a muscle or its chip to focus it.
- The moving body: `FormAnim` with `sex` draws a solid man/woman figure (ponytail for the woman) whose working segment glows
  green and swells as it contracts. Without `sex` it stays the classic line figure (library cards, landing Form loop).
- One "Man / Woman" state for the page (`useBodyStats` store in `components/body-insights.tsx`): the map toggle and the
  calorie card's Sex field are the same value.
- Calories: corrected-MET method. kcal/min = MET × resting kcal/day ÷ 1440; resting burn from the Schofield equations
  (weight, age band, sex — no height needed). MET by pattern (Compendium: 3.0 calves … 6.0 barbell squat/hinge), rest
  between sets 1.8 MET. Work time = reps × 3 s (or the hold time). Volume = the planned sets × reps and rest when opened from
  the plan/workout, else 3 × 10 with 90 s rest. Shown as an estimate (±20%), never as exact.
- Data: table `body_stats` (user_id PK → auth.users cascade, sex, weight_lb, age; RLS own rows) —
  migration `20261109000000_body_stats.sql`. `GET/PUT /api/body` (session required, zod-validated, saved 0.7 s after a
  valid change). States: skeleton while loading, empty ("Add your weight and age…"), load error banner, "Not saved" note,
  out-of-range field error.
- Free for everyone who can open an exercise (it is a form-guide aid, not a quota item); the library itself stays paid and
  Starter still sees plan exercises only. No AI. Events: `feature_used` "muscle_map" (once per page load, from the browser)
  and "calorie_estimator" (server, when weight/age change). No share image: it is a guide, not a personal result.
- Prices updated Nov 9 to $4.99 / $8.99 / $12.99 (table above, checked against GET KWOP_API); the app never hard-codes
  prices, it reads them from Kwop. Verify: `node scripts/muscle-shots.mjs` (dev server :3001 with
  DEV_PAID_EMAIL_SUFFIX). E2E covers the map + calories on the plan's Day 1.

## Tech
Next.js App Router + TS + Tailwind + shadcn-style components + framer-motion + lucide-react. Supabase Postgres + Auth
(RLS everywhere, SQL in `supabase/migrations`). Vercel. No AI provider: the engine is deterministic (`lib/engine`).

## Kwop API (server only — `KWOP_API` in .env.local / Vercel, never in browser code, never committed)
- `GET KWOP_API` → plans. `POST /checkout {plan, period, email, k?}` → `{embed, ref, fallback_url}` (409 payments_off).
- `POST /confirm {ref}`, `GET /plan?email=` (helper `getPlan(email)` in `lib/kwop.ts`, 60 s cache), `POST /cancel`,
  `POST /event` (signup, onboarding_done, aha, paywall_view, feature_used), `POST /connect {url}`.
- `?k=` → cookie `kwop_k` (30 d) → `profiles.k` → sent in checkout. `?plan=`/utm → cookie → profiles.intended_plan/source.
- Visit tracking script on public pages only: `https://kwop.io/flow.js` data-site `s_dc316cd00c`.

## Verification loop (after every feature)
Run `npm run dev`, `node scripts/shot.mjs <path>` (390×844 and 1440×900), look at every screenshot, zero console
errors, fix, 3 passes, commit. `tests/e2e.spec.ts` covers the whole funnel (never pays).

## Decisions taken without the owner (best practice of the niche)
- No AI provider: the RESULT is computed by a deterministic engine (`lib/engine`), so no Gemini key is needed and it is
  honest ("automatic progression", never "AI"). Form Library = SVG pose loops drawn in code (`components/form-anim.tsx`).
- Dark-only UI (energy direction); light #FAFAFA sections on the landing page for rhythm.
- Units: pounds only (US market). Language: English only.
- Personal-flow funnel ⇒ no anonymous tries, so no per-IP try limiter is needed; every API route requires a session.
- Paywall auto-opens once (2.6 s after the plan first shows), then lives behind the sticky unlock bar.
- Upgrade = checkout of the next plan inside the page, then POST /cancel {email, except_ref} so the old plan stops.
- Share: `/s/<share_id>` public page shows title, summary and Day 1 only, with a next/og image.
- Google button hidden until `NEXT_PUBLIC_GOOGLE_ENABLED=1` (set once Google OAuth is configured in Supabase).

## Map
- `app/page.tsx` landing · `app/signup|login|forgot|reset` auth · `app/start` flow · `app/start/building` the work ·
  `app/plan` RESULT + paywall · `app/(app)/*` dashboard, workout, history, settings, account, library, pricing ·
  `app/api/*` server routes · `lib/kwop.ts` the only Kwop client · `lib/access.ts` session/profile/getAccess.
- Screenshots: `node scripts/shot.mjs / home` (server on :3000). E2E: `npx playwright test` (needs a real Supabase).

## Live setup (Nov 8, 2026)
- Production: https://fitplanr-3.vercel.app (Vercel project `fitplanr-3`, id prj_81MgYf5SabOl9zUdH7nk80MqxZz6).
- Supabase project `fitplanr-3`, ref `ehokzomaenbonjnysvhy`, us-east-1, org "FitPlanr". Email confirmation OFF,
  site_url = production, redirect allow-list = localhost:3000 + production. Migrations run through the Management API
  (`POST /v1/projects/{ref}/database/query`). Keys in `.env.local` (never committed) and in Vercel env.
- Kwop connected (`POST KWOP_API/connect`): https://kwop.io/fitplanr-3/app → the app.
- Google sign-in: not configured yet. When the owner pastes the Google OAuth client id/secret, PATCH
  `/v1/projects/ehokzomaenbonjnysvhy/config/auth` with external_google_enabled/client_id/secret, then set
  `NEXT_PUBLIC_GOOGLE_ENABLED=1` in Vercel and redeploy. Redirect URI: https://ehokzomaenbonjnysvhy.supabase.co/auth/v1/callback
- Deploy from this cloud box: `NODE_USE_ENV_PROXY=1 npx vercel deploy --prod --yes --token <any-placeholder>`
  (the proxy injects the real token). Local server needs `NODE_USE_ENV_PROXY=1` to reach Supabase.
- Paid-app preview in local dev only: `DEV_PAID_EMAIL_SUFFIX=.paidpreview@fitplanr-test.com DEV_PAID_TIER=Pro npx next dev`
  (ignored in production builds). Scripts: `scripts/shot.mjs`, `scripts/funnel-shots.mjs`, `scripts/app-shots.mjs`.
- Verified: e2e 3× phone + 3× computer on production (green), RLS cross-user test (blocked), no secrets in
  `.next/static`, Lighthouse mobile 92–95 perf / 100 a11y / 100 best practices / 100 SEO.
- Test accounts created by e2e use `@fitplanr-test.com` emails.
