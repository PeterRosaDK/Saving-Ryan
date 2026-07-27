# Saving Ryan

Modern HTML5/TypeScript restoration of a Director 8 interactive mystery.

## Current status

The first conversion slice is underway:

- legacy Director files and the original report are preserved in `Legacy/`;
- converted MP4 files are served from `public/Video/`;
- 90 supplied BMP originals are preserved in `Legacy/Billeder/`;
- 93 web-ready PNG assets are served from `public/assets/images/`;
- the A1–E4 location/time model is implemented as a typed state machine;
- waiting is a two-step transition, so narration and special sequences complete
  before the time slot changes;
- knowledge persists when evening wraps into another morning;
- intro completion establishes the murder knowledge required by the investigation;
- the first five legacy clues use typed, declarative scene interactions;
- Director dialogue choices are a closed, typed catalogue with prerequisites,
  time-sensitive clips, repeat history, and explicit dead ends;
- the intended Laura motive/evidence route is an executable semantic knowledge
  graph, including Barbara's multi-step help sequence;
- the first playable dialogue slice connects Barbara in B1 and David/Marie in D1
  through portraits and repeatable topic choices;
- report-backed talk placements now expose the Sarah → Ryan → Marie motive route;
- the Barbara route continues through the protected `Intruder` computer
  interaction, the original `LauraSuspekt` and `BarbaraHacker` sequences, and
  the necklace evidence;
- a reducer-level golden-path test now reaches Lauras confession through the
  actual scene and dialogue actions;
- question and answer cues play sequentially and update the same tested state
  machine used by exploration;
- transition narration recovered from `Spillet.dir` is wired into a runnable UI;
- all 20 original room photographs are rendered at their original 640×480
  position inside the responsive 800×600 stage;
- Director-score rectangles now drive rollover/focus hotspots for doors,
  characters, inspections, and the wait clock;
- all 12 original film loops run as layered bitmap animations using their
  recovered 87-tick Director timelines;
- all 81 Director video members and 93 PNG members are closed, file-validated
  catalogues;
- the persistent narrative host is isolated from ordinary gameplay rerenders and
  accepts both original video and intentional text-only fallback cues;
- the abort-safe `VideoPlayer` distinguishes completion, skip, autoplay blocking,
  missing media, network/decode failures, and cancellation.

See [roadmap.md](roadmap.md) for the complete migration plan.
The image comparison and provenance notes are in
[docs/image-assets.md](docs/image-assets.md).
Dialogue normalization and conditional-link provenance are in
[docs/dialogue-rules.md](docs/dialogue-rules.md).

## Commands

```sh
npm install
npm run dev
npm test
npm run build
```

Asset and Director inspection commands are documented under
[`tools/`](tools/). The BMP conversion can be repeated with:

```sh
./tools/assets/convert-bmp-to-png.sh
```

## Source layout

```text
Legacy/       original Director movies and project report
public/Video/ browser-ready MP4 files
public/assets/ web-ready image derivatives
src/app/      global state and store
src/game/     scene registry, interactions, transitions, and state machine
src/media/    media manifests and compatibility aliases
src/ui/       DOM rendering
tests/        state and manifest tests
tools/        Director inspection and asset conversion utilities
```

The current interface renders the original room photographs, primitive character
animations, score-positioned hotspots, clocks, and dialogue portraits. The next
scene-restoration work is to connect the still-unmodelled legacy special hotspots,
including listening under the table and the book/secret passage.
