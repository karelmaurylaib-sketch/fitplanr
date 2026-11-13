"""Shrink every silence > 0.5 s in a reel's voice-over to 0.4 s, and fast-forward the visuals through it.
usage: python -I tighten.py <page.html> <voiceover.wav> <out.mp4>
Speech plays at 1x; each long gap [s, e] keeps 0.2 s of silence on each side in the audio, and its visuals are
re-rendered sped up to fit 0.4 s (render.cjs WARP)."""
import json, os, re, subprocess, sys
html, vo, out = sys.argv[1:4]
KEEP, MIN = 0.4, 0.5
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "reels")
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", vo]))
log = subprocess.run(["ffmpeg", "-hide_banner", "-i", vo, "-af", f"silencedetect=n=-45dB:d={MIN}", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
gaps = [(s, e) for s, e in zip(starts, ends + [dur] * (len(starts) - len(ends))) if e - s > MIN]
warp, apieces, cur = [], [], 0.0
for s, e in gaps:
    if s > cur: warp.append([cur, s, s - cur]); apieces.append((cur, s))
    warp.append([s, e, KEEP]); apieces += [(s, s + KEEP / 2), (e - KEEP / 2, e)]
    cur = e
if cur < dur: warp.append([cur, dur, dur - cur]); apieces.append((cur, dur))
base = os.path.splitext(out)[0]
json.dump(warp, open(base + ".warp.json", "w"))
# audio: concatenate the kept pieces
fc = "".join(f"[0:a]atrim={a:.4f}:{b:.4f},asetpts=PTS-STARTPTS[p{i}];" for i, (a, b) in enumerate(apieces))
fc += "".join(f"[p{i}]" for i in range(len(apieces))) + f"concat=n={len(apieces)}:v=0:a=1[a]"
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", vo, "-filter_complex", fc, "-map", "[a]", base + ".vo.wav"], check=True)
# video: re-render with the warp
silent = base + ".silent.mp4"
subprocess.run(["node", os.path.join(R, "render.cjs"), html, silent], check=True, cwd=R, env={**os.environ, "WARP": base + ".warp.json"})
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", silent, "-i", base + ".vo.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out], check=True)
print(f"{os.path.basename(out)}: {dur:.2f}s -> {sum(w[2] for w in warp):.2f}s, {len(gaps)} gaps shrunk")
