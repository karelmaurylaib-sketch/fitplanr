"""Shared helpers for the FitPlanr videos: recorded screencast frames → framed 1080x1920 segments with text overlays."""
import json
import os
import subprocess

B = "video/build"
FPS = 30


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
