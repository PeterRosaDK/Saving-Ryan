# Image asset audit

## Sources

The image migration currently has two source types:

1. `Legacy/Billeder/*.bmp` — 90 source BMP files supplied separately.
2. Director cast members decoded from `Legacy/Billeder.dir` and
   `Legacy/Intro.dir`.

Original BMP files remain unchanged. Web-ready derivatives live in
`public/assets/images/`.

## Coverage

`Legacy/Billeder.dir` contains 86 cast members:

- 74 bitmap members;
- 12 Director film loops.

The supplied BMP collection covers 73 of the 74 bitmap members. The missing
`BlankPortrait` member was decoded directly from `Billeder.dir`.

Seventeen supplied BMP files are not bitmap members in `Billeder.dir`; they belong
to the intro:

- `halv-Barbara`
- `halv-David`
- `halv-Laura`
- `halv-Marie`
- `halv-Ryan`
- the twelve `titel-<name>1/2` credit images

`halv-Peter` occurs in both the image cast and intro cast.

Two intro bitmap members were not present in the supplied collection and were
decoded from `Intro.dir`:

- `titel-ryan`
- `titel-saving`

The resulting web collection contains 93 PNG files: 90 conversions from supplied
BMP originals and three Director extractions.

## Source preference

The supplied BMP files are preferred where available. Although dimensions match
for the shared `Billeder.dir` assets, Director re-encoded most imported images with
minor color loss. Sample comparisons were approximately 38–39 dB PSNR.

Of the 73 shared images:

- 9 are pixel-identical to their Director-decoded equivalents;
- 64 have small pixel-level differences caused by the Director import;
- 1 Director bitmap, `BlankPortrait`, had no supplied BMP.

The nine exact matches are:

- `blankvideo`
- `halv-Peter`
- `portrait-Marie`
- `sektorD3`
- `ur1`
- `ur2`
- `ur3`
- `ur4`
- `videreknap`

## Exact duplicate source files

The following source BMP files are byte-for-byte duplicates. They remain separate
because their cast names express different timeline roles:

- `sektorA3-Ryan1` = `sektorA4-Ryan1`
- `sektorA3-Ryan2` = `sektorA4-Ryan2`
- `sektorE1` = `sektorE3` = `sektorE4`

## Film loops

The 12 film loops are not standalone bitmaps. They refer to sequences of the
supplied character/scene patches:

- `LoopA1`
- `LoopA3`
- `LoopA4`
- `LoopB1`
- `LoopB2`
- `LoopB4`
- `LoopC1`
- `LoopC3`
- `LoopC4`
- `LoopD1`
- `LoopD2`
- `LoopE2`

The frame associations are recorded in `src/media/imageManifest.ts`. Their
positions and frame changes were recovered from the linked film-loop scores and
are recorded in `src/game/scenePresentation.ts`.

Each loop lasts 87 Director ticks. The main movie runs at 25 fps, so one cycle is
3.48 seconds. The timelines are intentionally non-uniform: for example,
`LoopB1` changes frames at ticks 0, 10, 14, 57, and 61 instead of cycling evenly.
The web renderer preserves these changes while honoring reduced-motion
preferences.

The score also confirms the composition model:

- the stage is 800×600;
- every 640×480 room photograph is centred at `(400, 300)`, leaving a 80-pixel
  horizontal and 60-pixel vertical stage margin;
- film-loop members are replacement image patches laid over the room photograph,
  not transparent full-stage sprites;
- sprite coordinates are stored as centre points and are converted to responsive
  percentage rectangles by `directorRectStyle()`.

The original bitmap ordering maps the linked-score member numbers to the named
frame assets. Director ink/blend behavior for the animation patches is currently
rendered as an ordinary replacement layer; visual comparison in the browser is
still required before declaring pixel-level parity.
