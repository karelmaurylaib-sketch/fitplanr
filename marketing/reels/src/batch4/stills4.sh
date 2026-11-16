#!/bin/bash
# stills4.sh key...  -> chk/s4-<key>.jpg (one frame late in each scene)
S=/tmp/claude-0/-home-user-fitplanr/1c6bf208-b265-5176-8f8d-3afa24465bb6/scratchpad
cd $S/reels
for k in "$@"; do
  T=$(node -e 'const t=require("'$S'/tts/batch4-timing.json")["'$k'"];const s=t.S.concat([t.DURATION]);console.log(t.S.map((a,i)=>(a+(s[i+1]-a)*0.75).toFixed(2)).join(","))')
  ONLY=$T node render.cjs r4-$k.html x.mp4 > /dev/null 2>chk/err-$k.txt
  ./sheet.sh frames-r4-$k chk/s4-$k.jpg
  grep -h ERRORS chk/err-$k.txt
done
