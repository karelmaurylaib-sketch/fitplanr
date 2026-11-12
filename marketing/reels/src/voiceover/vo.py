"""Synthesize the voice-over lines for each reel with Kokoro, one wav per line.
usage: venv/bin/python -I vo.py <voice> [speed]"""
import json, sys, os
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPTS = json.load(open(os.path.join(HERE, "scripts.json")))
voice = sys.argv[1] if len(sys.argv) > 1 else "af_heart"
speed = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
k = Kokoro(os.path.join(HERE, "kokoro-v1.0.onnx"), os.path.join(HERE, "voices-v1.0.bin"))
out = os.path.join(HERE, "lines-" + voice); os.makedirs(out, exist_ok=True)
report = {}
for reel, lines in SCRIPTS.items():
    for i, (at, text) in enumerate(lines):
        s, sr = k.create(text, voice=voice, speed=speed, lang="en-us")
        p = f"{out}/{reel}-{i}.wav"; sf.write(p, s, sr)
        report.setdefault(reel, []).append([at, round(len(s) / sr, 2), text])
for reel, r in report.items():
    print(reel)
    for at, d, text in r:
        print(f"  {at:5.2f} → {at + d:5.2f}  ({d:.2f}s)  {text}")
