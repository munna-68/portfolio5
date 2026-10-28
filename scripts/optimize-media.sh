#!/usr/bin/env bash
# Optimise raw project media for the web.
#
#   npm run media -- <project-slug>          # processes media-src/<slug>/*
#   npm run media -- <project-slug> --force  # re-encode even if outputs exist
#
# Input : media-src/<slug>/   (raw .mov/.mp4/.m4v/.webm videos, .jpg/.jpeg/.png/.webp/.tif images)
# Output: public/media/projects/<slug>/
#   video  <name>.mp4 (H.264, ≤1600px wide, no audio, faststart)
#          <name>.webm (VP9, smaller, served first to browsers that support it)
#          <name>-poster.webp (first frame, shown before the video plays)
#   image  <name>-800.webp, <name>-1600.webp, <name>-2400.webp (only sizes ≤ the source width)
#
# Name files by role before running: cover.mov, gallery-1.jpg, gallery-2.mp4, …
# Requires ffmpeg (brew install ffmpeg). Uses cwebp if present (brew install webp), else ffmpeg's libwebp.
set -euo pipefail

slug="${1:-}"
force="${2:-}"
if [[ -z "$slug" ]]; then
  echo "usage: npm run media -- <project-slug> [--force]" >&2
  exit 1
fi

root="$(cd "$(dirname "$0")/.." && pwd)"
src="$root/media-src/$slug"
out="$root/public/media/projects/$slug"
[[ -d "$src" ]] || { echo "No folder $src: put the raw files there first." >&2; exit 1; }
command -v ffmpeg >/dev/null || { echo "ffmpeg not found: brew install ffmpeg" >&2; exit 1; }
mkdir -p "$out"

VIDEO_W=1600     # card + detail hero never render wider than ~1100 CSS px; 1600 covers 1.5x DPR
MP4_CRF=26       # lower = better quality / bigger file. 23–28 is the useful range
WEBM_CRF=36      # VP9 scale: 31–40 is the useful range
MAX_FPS=30
WEBP_Q=80

skip() { [[ -f "$1" && "$force" != "--force" ]]; }
has_ffmpeg_webp() { ffmpeg -hide_banner -encoders 2>/dev/null | grep -q libwebp; }
# to_webp <input> <output.webp> [max-width]  (cwebp preferred; ffmpeg libwebp as fallback)
to_webp() {
  local in="$1" target="$2" w="${3:-0}" iw
  if command -v cwebp >/dev/null; then
    iw="$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$in")"
    [[ "$w" -eq 0 || "$iw" -lt "$w" ]] && w="$iw"
    if [[ "${in##*.}" =~ ^([Hh][Ee][Ii][Cc]|[Tt][Ii][Ff]+)$ ]]; then
      local tmp; tmp="$(mktemp -t skmedia).png"
      ffmpeg -loglevel error -y -i "$in" "$tmp" && in="$tmp"
    fi
    cwebp -quiet -q $WEBP_Q -m 6 -metadata none -resize "$w" 0 "$in" -o "$target"
  elif has_ffmpeg_webp; then
    local vf="null"; [[ "$w" -gt 0 ]] && vf="scale='min($w,iw)':-2:flags=lanczos"
    ffmpeg -loglevel error -y -i "$in" -vf "$vf" -c:v libwebp -quality $WEBP_Q "$target"
  else
    echo "Need cwebp (brew install webp) or an ffmpeg built with libwebp" >&2; return 1
  fi
}
size() { du -h "$1" | cut -f1; }

shopt -s nullglob nocaseglob
for f in "$src"/*; do
  name="$(basename "${f%.*}")"
  ext="${f##*.}"
  ext="$(echo "$ext" | tr '[:upper:]' '[:lower:]')"

  case "$ext" in
    mov|mp4|m4v|webm|mkv)
      vf="scale='min($VIDEO_W,iw)':-2:flags=lanczos,fps='min($MAX_FPS,source_fps)',format=yuv420p"
      if ! skip "$out/$name.mp4"; then
        echo "→ $name.mp4"
        ffmpeg -loglevel error -y -i "$f" -an -vf "$vf" -c:v libx264 -preset slow -crf $MP4_CRF \
          -profile:v high -movflags +faststart "$out/$name.mp4"
      fi
      if ! skip "$out/$name.webm"; then
        echo "→ $name.webm"
        ffmpeg -loglevel error -y -i "$f" -an -vf "$vf" -c:v libvpx-vp9 -b:v 0 -crf $WEBM_CRF \
          -row-mt 1 -deadline good -cpu-used 2 "$out/$name.webm"
      fi
      if ! skip "$out/$name-poster.webp"; then
        echo "→ $name-poster.webp"
        frame="$(mktemp -t skposter).png"
        ffmpeg -loglevel error -y -i "$out/$name.mp4" -frames:v 1 "$frame"
        to_webp "$frame" "$out/$name-poster.webp"
        rm -f "$frame"
      fi
      echo "  $name: mp4 $(size "$out/$name.mp4"), webm $(size "$out/$name.webm"), poster $(size "$out/$name-poster.webp")"
      ;;
    jpg|jpeg|png|webp|tif|tiff|heic)
      width="$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$f")"
      for w in 800 1600 2400; do
        # always make 800; larger sizes only if the source is at least that wide
        if [[ $w -gt 800 && $width -lt $w ]]; then continue; fi
        target="$out/$name-$w.webp"
        skip "$target" && continue
        echo "→ $name-$w.webp"
        to_webp "$f" "$target" "$w"
      done
      echo "  $name: $(ls "$out"/"$name"-*.webp | xargs -n1 basename | tr '\n' ' ')"
      ;;
    *)
      echo "  skipping $(basename "$f") (unknown type)"
      ;;
  esac
done

echo
echo "Done → public/media/projects/$slug/"
ls -lh "$out" | awk 'NR>1 {print "  " $5 "\t" $9}'
