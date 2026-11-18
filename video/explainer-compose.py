#!/usr/bin/env python3
"""Assembles the "How the nutrition plan works" explainer (1080x1920, 30 fps, ~60 s, no voiceover)."""
import os

from vidlib import B, load, render, run

E = f"{B}/explain"
segs = []


def seg(scene, pieces, overlay=None, framed=True):
    out = f"{E}/seg{len(segs):02d}.mp4"
    render(f"explain/{scene}", pieces, out, framed=framed, overlay=f"explain/{overlay}" if overlay else None)
    segs.append(out)


_, _, i = load("explain/intro")
_, _, o = load("explain/open")
_, _, m = load("explain/flow")
_, _, z = load("explain/outro")
H = lambda t, s: (t, t, s)  # hold one moment on screen (reading time)

seg("intro", [(i["start"], i["start"] + 3.0, 3.0)], framed=False)
seg("open", [(o["start"], o["end"], 4.0)], "e1")
seg("flow", [(m["setup"], m["targets"], 4.5)], "e2")
seg("flow", [(m["targets"], m["explain"], 3.0), H(m["explain"], 1.0)], "e3")
seg("flow", [(m["explain"], m["meals"], 4.5)], "e4")
seg("flow", [(m["meals"], m["swap"], 5.0)], "e5")
seg("flow", [(m["swap"], m["pick"], 3.6), H(m["pick"], 0.4)], "e6")
seg("flow", [(m["pick"], m["ate"], 4.5)], "e6b")
seg("flow", [(m["ate"], m["rings"], 3.5)], "e7")
seg("flow", [(m["rings"], m["undo"], 4.5)], "e8")
seg("flow", [(m["undo"], m["edit"], 4.0)], "e8b")
seg("flow", [(m["edit"], m["newTargets"], 4.5)], "e9")
seg("flow", [(m["newTargets"], m["end"], 4.5)], "e9b")
seg("outro", [(z["start"], z["end"], 5.5)], framed=False)

with open(f"{E}/segs.txt", "w") as f:
    for s in segs:
        f.write(f"file '{os.path.abspath(s)}'\n")
run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", f"{E}/segs.txt", "-c", "copy", f"{E}/video_only.mp4"])
os.makedirs("video/out", exist_ok=True)
# silent stereo track: some players and apps reject video with no audio stream
run(["ffmpeg", "-y", "-i", f"{E}/video_only.mp4", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "64k", "-shortest", "-movflags", "+faststart", "video/out/fitplanr-nutrition-explained.mp4"])
print("done video/out/fitplanr-nutrition-explained.mp4")
