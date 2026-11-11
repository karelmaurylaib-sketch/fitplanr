#!/bin/bash
# sheet.sh <dir> <out>
d="$1"; out="$2"; args=(); n=0
for f in "$d"/*.jpg; do args+=(-i "$f"); n=$((n+1)); done
ffmpeg -loglevel error -y "${args[@]}" -filter_complex "hstack=inputs=$n,scale=2400:-1" "$out"
