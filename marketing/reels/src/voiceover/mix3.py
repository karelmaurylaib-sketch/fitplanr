"""Batch 2: place each VO line at its time, master to -14 LUFS, mux onto the reel.
usage: python -I mix2.py <silent_reels_dir> <dest_dir>"""
import json, os, subprocess, sys
H = os.path.dirname(os.path.abspath(__file__))
src, dest = sys.argv[1:3]
os.makedirs(dest, exist_ok=True)
FILES = {"pov-nutrition": "reel13-pov-nutrition", "tips-protein": "reel14-tips-protein", "demo-nutrition": "reel15-demo-nutrition"}
for key, lines in json.load(open(f"{H}/batch3-placed.json")).items():
    name = FILES[key]; video = f"{src}/{name}.mp4"
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video]))
    args, chains = [], []
    for i, (at, text, d) in enumerate(lines):
        assert at + d <= dur + 0.01, (key, i, at + d, dur)
        args += ["-i", f"{H}/lines-batch3/{key}-{i}.wav"]; ms = int(at * 1000)
        chains.append(f"[{i}]aresample=48000,adelay={ms}|{ms},apad[a{i}]")
    n = len(lines)
    fc = ";".join(chains) + ";" + "".join(f"[a{i}]" for i in range(n)) + \
        f"amix=inputs={n}:normalize=0:dropout_transition=0,atrim=0:{dur},highpass=f=70," \
        "acompressor=threshold=-20dB:ratio=3:attack=5:release=120,loudnorm=I=-14:TP=-1.5:LRA=7,aresample=48000,aformat=channel_layouts=stereo[vo]"
    vo = f"{dest}/{name}-voiceover.wav"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *args, "-filter_complex", fc, "-map", "[vo]", "-ar", "48000", vo], check=True)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", video, "-i", vo, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", f"{dest}/{name}-vo.mp4"], check=True)
    print("ok", name, round(dur, 2))
