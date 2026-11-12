"""Synthesize batch-2 lines (af_heart, 1.05), compute scene starts for text-only reels, write timing.
usage: venv/bin/python -I vo2.py"""
import json, os
import soundfile as sf
from kokoro_onnx import Kokoro
H = os.path.dirname(os.path.abspath(__file__))
B = json.load(open(f"{H}/batch2.json"))
k = Kokoro(f"{H}/kokoro-v1.0.onnx", f"{H}/voices-v1.0.bin")
out = f"{H}/lines2"; os.makedirs(out, exist_ok=True)
final, timing = {}, {}
for reel, lines in B.items():
    placed, starts, t = [], [], 0.0
    for i, ln in enumerate(lines):
        text = ln[1] if isinstance(ln, list) else ln
        s, sr = k.create(text, voice="af_heart", speed=1.05, lang="en-us")
        sf.write(f"{out}/{reel}-{i}.wav", s, sr); d = len(s) / sr
        if isinstance(ln, list):
            at = ln[0]
        else:
            starts.append(round(t, 2)); at = t + 0.25; t = at + d + 0.4
        placed.append([round(at, 2), text, round(d, 2)])
    final[reel] = placed
    if starts: timing[reel] = {"S": starts, "DURATION": round(t + 1.2, 2)}
json.dump(final, open(f"{H}/batch2-placed.json", "w"), indent=1)
json.dump(timing, open(f"{H}/batch2-timing.json", "w"), indent=1)
for reel, p in final.items():
    print(reel, timing.get(reel, {}).get("DURATION", ""))
    for at, text, d in p: print(f"   {at:5.2f} → {at+d:5.2f}  {text}")
