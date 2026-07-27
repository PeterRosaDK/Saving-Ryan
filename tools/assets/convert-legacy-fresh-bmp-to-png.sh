#!/usr/bin/env bash

set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source_dir="${project_root}/Legacy Fresh/Spillet/Billeder"
output_dir="${project_root}/public/assets/images"

if [[ ! -d "${source_dir}" ]]; then
  echo "Missing optional Fresh BMP source directory: ${source_dir}" >&2
  exit 1
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required to reproduce the Director transparent mattes." >&2
  exit 1
fi

if command -v sips >/dev/null 2>&1; then
  convert_bitmap() {
    sips -s format png "$1" --out "$2" >/dev/null
  }
elif command -v magick >/dev/null 2>&1; then
  convert_bitmap() {
    magick "$1" "$2"
  }
else
  echo "Install ImageMagick, or run this script on macOS with sips." >&2
  exit 1
fi

fresh_members=(
  baggrund
  cursor-look1
  cursor-look2
  cursor-snak1
  cursor-snak2
  cursor-walk1
  cursor-walk2
  intro-slut
  tegn-afslut
  tegn-afslut2
  tegn-musik
  tegn-musik2
  tegn-pil
  tegn-pil2
  tegn-sp
  tegn-sp2
)

mkdir -p "${output_dir}"
matte_dir="$(mktemp -d /private/tmp/saving-ryan-fresh-matte.XXXXXX)"

for member_name in "${fresh_members[@]}"; do
  source_path="${source_dir}/${member_name}.bmp"
  output_path="${output_dir}/${member_name}.png"
  if [[ ! -f "${source_path}" ]]; then
    echo "Missing Fresh bitmap: ${source_path}" >&2
    exit 1
  fi
  convert_bitmap "${source_path}" "${output_path}"

  case "${member_name}" in
    cursor-*|tegn-*)
      ffmpeg \
        -hide_banner \
        -loglevel error \
        -y \
        -i "${output_path}" \
        -vf 'colorkey=black:0.06:0.04' \
        -frames:v 1 \
        "${matte_dir}/${member_name}.png"
      mv "${matte_dir}/${member_name}.png" "${output_path}"
      ;;
  esac
done

rmdir "${matte_dir}"
echo "Converted ${#fresh_members[@]} later-build BMP files into ${output_dir}"
