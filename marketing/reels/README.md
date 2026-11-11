# Instagram Reels: batch 1 (Nov 2026)

Three reels, one per format. All are 1080×1920, 30 fps, H.264. They have a silent audio track: add a trending sound in the
Instagram editor (trending audio gets more reach than a baked-in track). Keep the sound low and let the on-screen text carry it.

| File | Format | Length | Goal |
|---|---|---|---|
| `reel1-pov.mp4` | **POV / relatable hook**: kinetic text, problem → solution | 14.5 s | Reach and shares ("that's me") |
| `reel2-demo.mp4` | **Real product demo**: screen recording of the live funnel, sped up, with captions | 24 s | Show it's real, drive "link in bio" taps |
| `reel3-tips.mp4` | **Save-worthy tips**: 3 rules to progress with fixed dumbbells | 25 s | Saves and follows (the algorithm's strongest signal) |

Covers: `*-cover.jpg` (or pick a frame in Instagram).

## Suggested captions

**Reel 1: POV**
> POV: the dumbbells are still in the corner 😅
> Tell FitPlanr the gear you actually own, and it builds your 4-week plan: every move, set and weight.
> Free to try, link in bio.
> #homeworkout #dumbbellworkout #beginnerworkout #workoutplan #gymbeginner #fitnessmotivation

**Reel 2: Demo**
> I asked an app to plan 4 weeks around my 2 dumbbells. This is the real app, sped up.
> 5 taps, pick your gear, Day 1 is ready. Free to try, link in bio.
> #workoutplan #dumbbellsonly #homegym #fitnessapp #strengthtraining #beginnergym

**Reel 3: Tips**
> Only have one pair of dumbbells? Save this 📌
> 1. Add reps before weight (climb 8 → 12)
> 2. Hit 12 on every set? Add a set
> 3. Maxed out? Slow it down: 3 s down, 1 s pause, 1 s up
> FitPlanr does this math for you every session. Link in bio.
> #progressiveoverload #dumbbellworkout #homeworkout #musclebuilding #workouttips #strengthtraining

Post order: tips first (saves build the account), then the POV, then the demo. Pin the demo to the profile grid.

## Truth check
Every number on screen comes from the real engine or the real app: 8–12 rep range for muscle compounds, 3×8 at 25 lb on
Day 1, +1 set at the top of the range, tempo 3-1-1 for a fixed pair, Day 1 of "Full Body A" from a real production run.
No body claims, no before/after, no "AI".

## Rebuild
`src/` holds everything. Each reel page exposes `render(t)`. `render.cjs` screenshots each frame and encodes with ffmpeg:

```
node src/render.cjs src/reel1-pov.html reel1-pov.mp4
NODE_USE_ENV_PROXY=1 node src/record-demo.cjs    # re-records the live funnel (creates an @fitplanr-test.com account)
```
For reel 2, after recording write `demo-meta.js` (`const META=<demo-meta.json>;`) next to the html; the cut points in
`SEG` follow the marks the recorder prints.
