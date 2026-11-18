#!/usr/bin/env python3
"""Assembles the "how I plan my lunch" video (1080x1920, 30 fps) from video/build/lunch/take + the shared end card."""
import os

from vidlib import B, load, render, run

L = f"{B}/lunch"
TEMPO = 1.1
PAD = 0.35
# voiceover lines in lunch/vo.wav (seconds, from silencedetect)
VO = [(0.90, 3.45), (4.20, 6.25), (7.10, 9.25), (10.22, 11.60), (12.30, 15.66), (16.45, 18.35)]
vo_len = [(z - a) / TEMPO for a, z in VO]
D = [x + PAD for x in vo_len]
D[5] = vo_len[5] + 1.0
print("segments", [round(x, 2) for x in D], "total", round(sum(D), 2))

_, _, m = load("lunch/take")
cuts = [
    (m["start"], m["toLunch"]),  # today: rings, breakfast in
    (m["toLunch"], m["swap"] - 0.6),  # scroll to lunch, its macros
    (m["swap"] - 0.6, m["adjust"] + 0.2),  # tap chicken → swap sheet → turkey
    (m["adjust"] + 0.2, m["ate"]),  # portions re-solved
    (m["ate"], m["end"]),  # Ate it → back up, rings filled
]
segs = []
for i, (a, z) in enumerate(cuts):
    segs.append(render("lunch/take", [(a, z, D[i])], f"{L}/seg{i}.mp4", overlay=f"lunch/l{i}"))
_, _, e = load("s5")  # end card from the 4-step video
render("s5", [(e["start"], e["start"] + D[5], D[5])], f"{L}/seg5.mp4", framed=False)

with open(f"{L}/segs.txt", "w") as f:
    for i in range(6):
        f.write(f"file '{os.path.abspath(L)}/seg{i}.mp4'\n")
run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", f"{L}/segs.txt", "-c", "copy", f"{L}/video_only.mp4"])

starts = [0.0]
for x in D[:-1]:
    starts.append(starts[-1] + x)
parts, labels = [], []
for i, ((a, z), st) in enumerate(zip(VO, starts)):
    ms = int((st + 0.12) * 1000)
    parts.append(f"[0:a]atrim={a}:{z},asetpts=PTS-STARTPTS,atempo={TEMPO},adelay={ms}|{ms}[a{i}]")
    labels.append(f"[a{i}]")
total = sum(D)
fc = ";".join(parts) + f";{''.join(labels)}amix=inputs={len(labels)}:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=7,apad,atrim=0:{total:.3f}[a]"
run(["ffmpeg", "-y", "-i", f"{L}/vo.wav", "-filter_complex", fc, "-map", "[a]", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", f"{L}/vo_mix.m4a"])
os.makedirs("video/out", exist_ok=True)
run(["ffmpeg", "-y", "-i", f"{L}/video_only.mp4", "-i", f"{L}/vo_mix.m4a", "-map", "0:v", "-map", "1:a", "-c", "copy", "-shortest", "-movflags", "+faststart", "video/out/fitplanr-lunch.mp4"])
print("done video/out/fitplanr-lunch.mp4")
