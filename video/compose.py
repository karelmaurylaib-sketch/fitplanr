#!/usr/bin/env python3
"""Assembles the 4-step FitPlanr video (1080x1920, 30 fps) from the recorded scenes, overlays and voiceover."""
import json, os, subprocess

B = "video/build"
FPS = 30
TEMPO = 1.2
# voiceover lines in vo.wav (seconds, from silencedetect), spoken at 1.2x
# (file, start, end). Line 4 is a re-recorded take (vo4c.wav, the pause after "Step four:" tightened):
# the photo-scan sentence was removed from the video.
VO4_LEN = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"{B}/vo4c.wav"], capture_output=True, text=True).stdout)
VO = [("vo.wav", 0.40, 4.80), ("vo.wav", 5.55, 9.55), ("vo.wav", 10.12, 15.30), ("vo.wav", 16.10, 21.35), ("vo4c.wav", 0.0, VO4_LEN), ("vo.wav", 28.97, 31.95)]
PAD = 0.35


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def load(scene):
    d = os.path.join(B, scene)
    return d, json.load(open(os.path.join(d, "frames.json"))), json.load(open(os.path.join(d, "marks.json")))


def frame_at(frames, t):
    lo = 0
    for i, f in enumerate(frames):
        if f["t"] <= t:
            lo = i
        else:
            break
    return frames[lo]["file"]


def render(scene, pieces, out, framed=True, overlay=None):
    """pieces: list of (t_from, t_to, out_seconds) in recording wall-clock time; time is remapped linearly per piece."""
    d, frames, _ = load(scene)
    lst = []
    for a, z, secs in pieces:
        n = max(1, round(secs * FPS))
        for i in range(n):
            lst.append(os.path.abspath(os.path.join(d, frame_at(frames, a + (z - a) * i / n))))
    txt = out + ".txt"
    with open(txt, "w") as f:
        for p in lst:
            f.write(f"file '{p}'\nduration {1 / FPS:.6f}\n")
        f.write(f"file '{lst[-1]}'\n")
    inputs = ["-f", "concat", "-safe", "0", "-i", txt]
    if framed:
        inputs += ["-i", f"{B}/bg.png", "-i", f"{B}/mask.png"]
        fc = (
            f"[0:v]fps={FPS},scale=864:1536:flags=lanczos,crop=864:1400:0:0,format=rgba[app];"
            "[2:v]format=gray[m];[app][m]alphamerge[appm];"
            "[1:v][appm]overlay=108:470[v]"
        )
        last = "[v]"
    else:
        fc = f"[0:v]fps={FPS},scale=1080:1920:flags=lanczos[v]"
        last = "[v]"
    if overlay:
        inputs += ["-i", f"{B}/{overlay}.png"]
        idx = 3 if framed else 1
        fc += f";{last}[{idx}:v]overlay=0:0[vo]"
        last = "[vo]"
    run(["ffmpeg", "-y", *inputs, "-filter_complex", fc, "-map", last, "-r", str(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", out])
    return len(lst) / FPS


def scaled(pieces, total):
    """pieces with relative weights → seconds summing to total."""
    w = sum(p[2] for p in pieces)
    return [(a, z, s * total / w) for a, z, s in pieces]


vo_len = [(z - a) / TEMPO for _, a, z in VO]
D = [l + PAD for l in vo_len]
D[5] = vo_len[5] + 1.1
print("segments", [round(x, 2) for x in D], "total", round(sum(D), 2))

segs = []
# scene 0: dumbbell intro (real time) then the landing hero, POV text on both
_, _, mi = load("s0intro")
_, _, mh = load("s0hero")
intro = 1.25
segs.append(("s0a", render("s0intro", [(mi["start"], mi["start"] + intro, intro)], f"{B}/seg0a.mp4", framed=False, overlay="t0")))
segs.append(("s0b", render("s0hero", [(mh["start"] + 0.2, mh["start"] + 0.2 + (D[0] - intro), D[0] - intro)], f"{B}/seg0b.mp4", overlay="t0")))

_, _, m = load("s1")
segs.append(("s1", render("s1", [(m["start"], m["end"], D[1])], f"{B}/seg1.mp4", overlay="t1")))
_, _, m = load("s2")
segs.append(("s2", render("s2", [(m["start"], m["end"], D[2])], f"{B}/seg2.mp4", overlay="t2")))
_, _, m = load("s3")
segs.append(("s3", render("s3", [(m["start"], m["end"], D[3])], f"{B}/seg3.mp4", overlay="t3")))
_, _, m = load("s4")
p4 = scaled(
    [
        (m["start"] + 0.3, m["swapDone"], 1.0),  # swap: blueberries → pear
        (m["swapDone"], m["end"], 1.0),  # "Ate it" → scroll up, rings filled
    ],
    D[4],
)
segs.append(("s4", render("s4", p4, f"{B}/seg4.mp4", overlay="t4")))
_, _, m = load("s5")
segs.append(("s5", render("s5", [(m["start"], m["start"] + D[5], D[5])], f"{B}/seg5.mp4", framed=False)))

# concat video
with open(f"{B}/segs.txt", "w") as f:
    for name, _ in segs:
        f.write(f"file '{os.path.abspath(B)}/seg{name[1:]}.mp4'\n")
run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", f"{B}/segs.txt", "-c", "copy", f"{B}/video_only.mp4"])

# voiceover: each line trimmed, sped up 1.2x, placed at its segment start + 0.12 s
starts = [0.0]
for x in D[:-1]:
    starts.append(starts[-1] + x)
parts, labels = [], []
for i, ((src, a, z), st) in enumerate(zip(VO, starts)):
    parts.append(f"[{0 if src == 'vo.wav' else 1}:a]atrim={a}:{z},asetpts=PTS-STARTPTS,atempo={TEMPO},adelay={int((st + 0.12) * 1000)}|{int((st + 0.12) * 1000)}[a{i}]")
    labels.append(f"[a{i}]")
total = sum(D)
fc = ";".join(parts) + f";{''.join(labels)}amix=inputs={len(labels)}:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=7,apad,atrim=0:{total:.3f}[a]"
run(["ffmpeg", "-y", "-i", f"{B}/vo.wav", "-i", f"{B}/vo4c.wav", "-filter_complex", fc, "-map", "[a]", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", f"{B}/vo_mix.m4a"])
os.makedirs("video/out", exist_ok=True)
run(["ffmpeg", "-y", "-i", f"{B}/video_only.mp4", "-i", f"{B}/vo_mix.m4a", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "copy", "-shortest", "-movflags", "+faststart", "video/out/fitplanr-4-step.mp4"])
print("done video/out/fitplanr-4-step.mp4")
