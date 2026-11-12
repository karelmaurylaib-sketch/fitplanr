"""Place each VO line at its time, master to -14 LUFS, mux onto the reel.
usage: python -I mix.py <voice> <reels_out_dir> <dest_dir>"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
voice, src, dest = sys.argv[1:4]
os.makedirs(dest, exist_ok=True)
for reel, lines in json.load(open(os.path.join(HERE, "scripts.json"))).items():
    video = os.path.join(src, reel + ".mp4")
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video]))
    args, chains = [], []
    for i, (at, _) in enumerate(lines):
        args += ["-i", f"{HERE}/lines-{voice}/{reel}-{i}.wav"]
        ms = int(at * 1000)
        chains.append(f"[{i}]aresample=48000,adelay={ms}|{ms},apad[a{i}]")
    n = len(lines)
    fc = ";".join(chains) + ";" + "".join(f"[a{i}]" for i in range(n)) + \
        f"amix=inputs={n}:normalize=0:dropout_transition=0,atrim=0:{dur},highpass=f=70," \
        "acompressor=threshold=-20dB:ratio=3:attack=5:release=120,loudnorm=I=-14:TP=-1.5:LRA=7,aresample=48000,aformat=channel_layouts=stereo[vo]"
    vo = os.path.join(dest, f"{reel}-voiceover.wav")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *args, "-filter_complex", fc, "-map", "[vo]", "-ar", "48000", vo], check=True)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", video, "-i", vo, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", os.path.join(dest, f"{reel}-vo.mp4")], check=True)
    print("ok", reel, round(dur, 2))
