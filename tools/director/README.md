# Director inspection tools

These small C++ utilities reproduce the inspection work used during the migration.
They are intentionally separate from the web application and depend on an external
[LibreShockwave](https://github.com/Quackster/LibreShockwave) source checkout.

## Build

```sh
cmake \
  -S tools/director \
  -B /tmp/saving-ryan-director-tools \
  -DLIBRESHOCKWAVE_SOURCE_DIR=/path/to/LibreShockwave

cmake \
  --build /tmp/saving-ryan-director-tools \
  --target saving_ryan_director_dump saving_ryan_extract_bitmaps \
    saving_ryan_extract_sounds \
  --parallel
```

Requirements:

- CMake 3.20+
- a C++20 compiler
- zlib development files
- a compatible LibreShockwave checkout

## Dump cast metadata and Lingo

```sh
/tmp/saving-ryan-director-tools/saving_ryan_director_dump \
  Legacy/Intro.dir \
  Legacy/Spillet.dir \
  Legacy/Video.dir \
  Legacy/Billeder.dir
```

The dump includes cast slot numbers, score-chunk summaries, and both Director
sound-channel references when the score version is supported. Those fields are
useful when checking whether a recovered sound cast is actually assigned in the
saved movie rather than merely present as imported masters.

For the later recovered build, inspect the readable decompiled movie directly:

```sh
/tmp/saving-ryan-director-tools/saving_ryan_director_dump \
  "Legacy Fresh/Spillet/spillet_decompiled.dir"
```

The adjacent compiled `spillet.dir` is a control, not the primary source for
Lingo interpretation.

## Extract bitmap cast members

```sh
/tmp/saving-ryan-director-tools/saving_ryan_extract_bitmaps \
  Legacy/Billeder.dir \
  /tmp/saving-ryan-billeder
```

The extractor writes RGBA PNG files and retains Director cast names where possible.
The separately supplied BMP files remain the preferred source because Director
introduced minor color loss during import.

## Extract embedded sounds

```sh
/tmp/saving-ryan-director-tools/saving_ryan_extract_sounds \
  Legacy/Intro.dir \
  public/assets/audio
```

The extractor preserves MP3 streams and converts Director PCM/ADPCM members to
browser-compatible WAV files.

To audit the complete supplied project, run it once for each Director file:

```sh
for movie in Intro Spillet Video Billeder; do
  /tmp/saving-ryan-director-tools/saving_ryan_extract_sounds \
    "Legacy/${movie}.dir" \
    "/tmp/saving-ryan-audio/${movie}"
done
```

For the originally supplied `Legacy/` set, the expected result is one member
named `intro` from `Intro.dir` and zero sound members from each of the other
three files. A later working copy supplied standalone music WAV files; see
[`docs/audio-assets.md`](../../docs/audio-assets.md) for provenance and the
missing score-assignment finding.
