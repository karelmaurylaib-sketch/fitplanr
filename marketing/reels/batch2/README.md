# Instagram Reels: batch 2 (Nov 12, 2026)

> **Final videos are in `Ready to post/`** (renamed POV 1–4, Demo 1–4, Tips 1–4, with silences over 0.5 s removed).
> This file keeps the captions, voice-over lines and notes; file names below refer to the old drafts.

Nine reels: three more of each format from batch 1. All are 1080×1920, 30 fps, with the same female voice-over as batch 1
(Kokoro `af_heart`, speed 1.05), mastered to −14 LUFS. Every reel ends on **"Comment FIT and I'll send you the link"**, both on
screen and in the voice. The end card shows a comment box typing "FIT", then "✓ Link on its way to your DMs".

- `*-vo.mp4`: post these. Add a trending sound under the voice at about 10–20 %.
- `*-voiceover.m4a`: the voice alone, timed to the reel (for CapCut).

| # | File | Format | Length | Hook |
|---|---|---|---|---|
| 4 | `reel4-pov-firstgym-vo.mp4` | POV | 17 s | "POV: it's your first day at the gym." |
| 5 | `reel5-demo-fullgym-vo.mp4` | Demo (live app) | 24.8 s | "I have a full gym. And zero plan." |
| 6 | `reel6-tips-rest-vo.mp4` | Tips | 22 s | "How long should you rest between sets?" |
| 7 | `reel7-pov-noequipment-vo.mp4` | POV | 18 s | "POV: you don't own a single weight." |
| 8 | `reel8-demo-knees-vo.mp4` | Demo (live app) | 24.5 s | "My knees hate squats." |
| 9 | `reel9-tips-startweight-vo.mp4` | Tips | 20.4 s | "How heavy should you start?" |
| 10 | `reel10-pov-sameweight-vo.mp4` | POV | 17.7 s | "POV: same workout. Same weights. For a whole year." |
| 11 | `reel11-demo-noequipment-vo.mp4` | Demo (live app) | 24.1 s | "No gym. No weights. Can an app still plan my workouts?" |
| 12 | `reel12-tips-days-vo.mp4` | Tips | 24.2 s | "How many days a week should you train?" |

The numbering continues batch 1, and posting in that order rotates the formats.

## Before posting: set up the "FIT" auto-DM
"Comment FIT" only works if something answers. Set up a comment-keyword automation (e.g. ManyChat's Instagram
"comment → DM" flow, or Instagram's own automated replies) for the keyword **FIT** on every reel, and have it DM the link
https://fitplanr-3.vercel.app (add `?utm_source=instagram&utm_content=reelN` to see which reel converts).
Pin a comment: "Comment FIT 👇 and I'll DM you the link".

## Suggested captions
- **4 · First day:** First day at the gym? Walk in with a plan, not a question mark. Comment FIT and I'll send you the link. #gymbeginner #firstdayatthegym #beginnerworkout #gymanxiety #workoutplan
- **5 · Full gym:** Full gym, 4 days, 60 min: a real upper/lower split in a minute. Comment FIT for the link. #strengthtraining #upperlowersplit #gymplan #workoutplan #getstronger
- **6 · Rest times:** Save this for your next session 📌 90 s for big moves, 60 s for small ones, 2.5 min for heavy sets of 5–8. Comment FIT for the link. #resttime #gymtips #strengthtraining #workouttips #beginnergym
- **7 · No equipment:** No weights? Still a real plan, and it gets harder every week. Comment FIT for the link. #homeworkout #noequipmentworkout #bodyweightworkout #calisthenicsbeginner #workoutplan
- **8 · Knees:** Bad knees? It swaps the moves: box squats, no lunges, no deep loaded squats. Comment FIT for the link. #kneefriendly #kneepain #lowimpactworkout #dumbbellworkout #workoutplan
- **9 · Starting weight:** Save this 📌 Leave 2–3 reps in the tank, learn the moves in week 1, add reps before weight. Comment FIT for the link. #beginnerworkout #progressiveoverload #gymtips #howmuchweight #strengthtraining
- **10 · Same weight:** Same weights for a year? Reps first, then weight: 30 lb → 35 lb by week 4. Comment FIT for the link. #progressiveoverload #plateau #dumbbellworkout #gymprogress #musclebuilding
- **11 · Bodyweight demo:** 2 days a week, 30 minutes, zero equipment. Comment FIT for the link. #bodyweightworkout #homeworkout #noequipment #fitnessapp #beginnerworkout
- **12 · Days a week:** Save this 📌 2–3 days full body, 4 days upper/lower, 5 days push/pull/legs + upper/lower. Comment FIT for the link. #workoutsplit #gymtips #pushpulllegs #upperlowersplit #beginnergym

## Truth check
- **Engine numbers.** Every number comes from the real engine (`lib/engine`): rest 90 s compound / 60 s isolation / 150 s
  compound for strength; starting loads (Goblet Squat 20 lb, Bench 15 lb, Row 20 lb, Lateral Raise 5 lb for a first-timer on
  a full gym); 30 → 35 lb in week 4 on adjustable dumbbells; bodyweight 3×8 → 3×12 → 3×15 → 4×15 with 3 s down; splits
  by days (2: Mon/Thu, 3: Mon/Wed/Fri, 4: Mon Tue Thu Fri upper/lower, 5: push/pull/legs/upper/lower).
- **Demo footage.** The three demos are screen recordings of production with those exact answers. Each run created a test
  account with an `@fitplanr-test.com` email.

## Rebuild
Sources are in `../src/batch2/` (pages, `demo2.js` compositor, `record-scenario.cjs` recorder) and `../src/voiceover/`
(`batch2.json` script, `vo2.py`, `mix2.py`). Render each page with `node ../src/render.cjs <page>.html <out>.mp4`.
