# Reels ready to post

15 reels, named by type. Each one is 1080×1920 with the female voice-over mixed in (−14 LUFS). There is never more
than 0.5 s without words: long pauses were shrunk to 0.4 s, and the visuals fast-forward through them. The POV reels say
"P-O-V" letter by letter. The demos have no speed badge.

| File | Hook | Ending |
|---|---|---|
| **POV 1** | "P-O-V: You bought two dumbbells. Three months ago." | Link in bio |
| **POV 2** | "P-O-V: it's your first day at the gym." | Comment FIT |
| **POV 3** | "P-O-V: you don't own a single weight." | Comment FIT |
| **POV 4** | "P-O-V: same workout. Same weights. For a whole year." | Comment FIT |
| **POV 5** 🥗 | "P-O-V: you train hard, then eat whatever's in the fridge." | Comment FIT |
| **Demo 1** | "I own two dumbbells. Watch an app plan my next four weeks." | Link in bio |
| **Demo 2** | "I have a full gym. And zero plan." | Comment FIT |
| **Demo 3** | "My knees hate squats." | Comment FIT |
| **Demo 4** | "No gym. No weights. Can an app still plan my workouts?" | Comment FIT |
| **Demo 5** 🥗 | "I train three days a week. My food? A total guess." | Comment FIT |
| **Tips 1** | "Same two dumbbells? You can still get stronger." | Link in bio |
| **Tips 2** | "How long should you rest between sets?" | Comment FIT |
| **Tips 3** | "How heavy should you start?" | Comment FIT |
| **Tips 4** | "How many days a week should you train?" | Comment FIT |
| **Tips 5** 🥗 | "How much protein do you actually need?" | Comment FIT |

🥗 = nutrition feature (paid app, `/nutrition`).

## Captions for the nutrition reels
- **POV 5:** Training hard, eating cereal for dinner? Your plan can set your food too: daily calories, protein and 3 meals sized for you. Comment FIT and I'll send you the link. #mealplan #highprotein #gymnutrition #macros #musclebuilding
- **Demo 5:** 4 numbers → daily targets → 3 meals, already sized. Swap chicken for tofu and the meal re-sizes itself. Comment FIT for the link. #mealprep #macrotracking #fitnessapp #nutritionplan #highproteinmeals
- **Tips 5:** Save this 📌 About 0.8 g of protein per lb, 1 g per lb on a cut, split across your meals. Comment FIT for the link. #protein #howmuchprotein #gymtips #nutritiontips #musclebuilding

The other captions are in `../batch2/README.md` (POV/Demo/Tips 2–4) and `../README.md` (the "1"s). Before posting the
"Comment FIT" reels, set up the comment → DM automation for the keyword FIT (see `../batch2/README.md`).

## Truth check (nutrition)
Numbers come from the app's nutrition engine (`lib/nutrition/plan.ts` on branch `claude/nutrition-meal-scan-1yc4sk`, live
on production) for its default example body, shown on screen: man, 28, 5′10″, 170 lb, building muscle, 3 workouts a week
→ 2,790 kcal, P 136 g · C 373 g · F 84 g; breakfast 824 / lunch 992 / dinner 858 kcal. Lunch with chicken: 53 g protein;
swapping to tofu re-sizes lunch to 931 kcal. Protein rules: 0.8 g/lb (1 g/lb on a cut); meals split 30/35/35 % → 41/48/48 g.
Demo 5 is a screen recording of the real paid app (local preview of that branch, test account `…paidpreview@fitplanr-test.com`).

## Rebuild
Sources: `../src/` (renderer with WARP), `../src/batch2/`, `../src/batch3/` (nutrition pages + `record-nutrition.cjs`),
`../src/voiceover/` (scripts `scripts.json`, `batch2.json`, `batch3.json`; `vo.py`, `vo2.py <batch>`, `mix*.py`, `tighten.py`).
