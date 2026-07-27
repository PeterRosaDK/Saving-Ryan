#!/usr/bin/env bash

set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source_dir="${project_root}/Legacy/Billeder"
output_dir="${project_root}/public/assets/images"

if [[ ! -d "${source_dir}" ]]; then
  echo "Missing BMP source directory: ${source_dir}" >&2
  exit 1
fi

mkdir -p "${output_dir}"

convert_with_sips() {
  local input="$1"
  local output="$2"
  sips -s format png "${input}" --out "${output}" >/dev/null
}

convert_with_magick() {
  local input="$1"
  local output="$2"
  magick "${input}" "${output}"
}

if command -v sips >/dev/null 2>&1; then
  converter=convert_with_sips
elif command -v magick >/dev/null 2>&1; then
  converter=convert_with_magick
else
  echo "Install ImageMagick, or run this script on macOS with sips." >&2
  exit 1
fi

converted=0
while IFS= read -r -d '' input; do
  base_name="$(basename "${input}" .bmp)"
  "${converter}" "${input}" "${output_dir}/${base_name}.png"
  converted=$((converted + 1))
done < <(find "${source_dir}" -maxdepth 1 -type f -iname '*.bmp' -print0 | sort -z)

if command -v ffmpeg >/dev/null 2>&1; then
  matte_dir="$(mktemp -d /private/tmp/saving-ryan-clock-matte.XXXXXX)"
  for clock_name in ur1 ur2 ur3 ur4; do
    ffmpeg \
      -hide_banner \
      -loglevel error \
      -y \
      -i "${output_dir}/${clock_name}.png" \
      -vf 'colorkey=black:0.025:0.015' \
      -frames:v 1 \
      "${matte_dir}/${clock_name}.png"
    mv "${matte_dir}/${clock_name}.png" "${output_dir}/${clock_name}.png"
  done
  rmdir "${matte_dir}"
else
  echo "Warning: ffmpeg is unavailable; clock mattes remain opaque." >&2
fi

echo "Converted ${converted} BMP files into ${output_dir}"
echo "Director-only members must still be copied from the bitmap extractor output."
