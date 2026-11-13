# Instagram Reels: batch 1 (Nov 2026)

> **Final videos are in `Ready to post/`** (renamed POV 1–4, Demo 1–4, Tips 1–4, with silences over 0.5 s removed).
> This file keeps the captions, voice-over lines and notes; file names below refer to the old drafts.

Three reels, one per format. All are 1080×1920, 30 fps, H.264.

- `*-vo.mp4`: **post these.** Voice-over mixed in, mastered to −14 LUFS (Instagram's loudness).
  In the Instagram editor, add a trending sound under it at about 10–20 % volume.
- `*.mp4`: the same reels with a silent track (for music-only posts).
- `*-voiceover.wav`: the voice alone, timed to the reel (for CapCut or Instagram's own editor).

| File | Format | Length | Goal |
|---|---|---|---|
| `reel1-pov.mp4` | **POV / relatable hook**: kinetic text, problem → solution | 17 s | Reach and shares ("that's me") |
| `reel2-demo.mp4` | **Real product demo**: screen recording of the live funnel, sped up, with captions | 24 s | Show it's real, drive "link in bio" taps |
| `reel3-tips.mp4` | **Save-worthy tips**: 3 rules to progress with fixed dumbbells | 25.8 s | Saves and follows (the algorithm's strongest signal) |

Covers: `*-cover.jpg` (or pick a frame in Instagram).

## Voice-over

Voice: Kokoro TTS (open-weight model, Apache-2.0, free for commercial use), voice `af_heart`, US English, speed 1.05.
The brand is written "Fit Planner" in the script so it is spoken right. Lines (start time → text):

**Reel 1: POV**
- 0.15 s: You bought two dumbbells. Three months ago.
- 2.75 s: Still no idea what to do with them.
- 5.65 s: So I told an app what I actually own.
- 8.0 s: It planned every set and every weight. Then it adds reps, week by week.
- 12.3 s: Fit Planner. Your four-week plan in sixty seconds. Link in bio.

**Reel 2: Demo**
- 0.15 s: I own two dumbbells. Watch an app plan my next four weeks.
- 3.5 s: Sign up free. Then five quick taps: goal, level, days, time.
- 8.1 s: Now pick the gear you actually own.
- 11.2 s: And it builds four weeks around that gear.
- 15.5 s: Day one: every move, set and weight.
- 18.3 s: Weeks two to four add reps for you.
- 21.15 s: Build yours free. Link in bio.

**Reel 3: Tips**
- 0.15 s: Same two dumbbells? You can still get stronger.
- 3.5 s: Rule one: add reps before weight. Pick a range, like eight to twelve, and climb it.
- 9.5 s: Rule two: hit twelve on every set? Add a set.
- 14.7 s: Rule three: maxed out? Slow it down. Three seconds down, one second pause, one second up.
- 20.45 s: Or let Fit Planner do the math, every session.
- 23.1 s: Save this for your next workout.

To re-voice (other voice, e.g. `am_michael`, or edited lines in `src/voiceover/scripts.json`): put `kokoro-v1.0.onnx` and
`voices-v1.0.bin` (GitHub release `thewh1teagle/kokoro-onnx` model-files-v1.0) next to the scripts, `pip install kokoro-onnx soundfile`, then
`python src/voiceover/vo.py af_heart 1.05` and `python src/voiceover/mix.py af_heart <dir with the silent mp4s> <dest>`.

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
