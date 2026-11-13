# Reels ready to post

12 reels, named by type. Each one is 1080×1920 with the voice-over mixed in (−14 LUFS). There is never more than
0.5 s without words: long pauses were shrunk to 0.4 s, and the visuals fast-forward through them.

| File | Hook | Ending |
|---|---|---|
| **POV 1** | "You bought two dumbbells. Three months ago." | Link in bio |
| **POV 2** | "POV: it's your first day at the gym." | Comment FIT |
| **POV 3** | "POV: you don't own a single weight." | Comment FIT |
| **POV 4** | "POV: same workout. Same weights. For a whole year." | Comment FIT |
| **Demo 1** | "I own two dumbbells. Watch an app plan my next four weeks." | Link in bio |
| **Demo 2** | "I have a full gym. And zero plan." | Comment FIT |
| **Demo 3** | "My knees hate squats." | Comment FIT |
| **Demo 4** | "No gym. No weights. Can an app still plan my workouts?" | Comment FIT |
| **Tips 1** | "Same two dumbbells? You can still get stronger." | Link in bio |
| **Tips 2** | "How long should you rest between sets?" | Comment FIT |
| **Tips 3** | "How heavy should you start?" | Comment FIT |
| **Tips 4** | "How many days a week should you train?" | Comment FIT |

Captions and hashtags: `../batch2/README.md` (POV 2–4, Demo 2–4, Tips 2–4) and `../README.md` (the three "1"s).
Before posting the "Comment FIT" reels, set up the comment → DM automation for the keyword FIT (see `../batch2/README.md`).

Rebuild: `python ../src/voiceover/tighten.py <page.html> <voiceover.wav> "<Name>.mp4"` (needs `../src/render.cjs` with WARP support).
