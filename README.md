# Saving Ryan

Modern HTML5/TypeScript restoration and canonical completion of a Director 8
interactive mystery.

## Current status

The tagged Director restoration is preserved as `legacy-restoration-v1`, the
canonical Laura story is playable from intro to epilogue, phase 9's expanded
time-loop mechanics are complete, and the phase 10 case boundary is ready for
the first authored alternative:

- legacy Director files and the original report are preserved in `Legacy/`;
- converted MP4 files are served from `public/Video/`;
- 90 supplied BMP originals are preserved in `Legacy/Billeder/`;
- 109 web-ready PNG assets are served from `public/assets/images/`;
- eight recovered location-music masters and the original clock sound are served
  from `public/assets/audio/`;
- the A1–E4 location/time model is implemented as a typed state machine;
- a main menu starts the canonical Laura case by default and exposes
  **Mystisk case** separately without enabling unfinished content;
- the selected case is stored at the top level of version 2 game state and
  survives every daily loop unchanged;
- waiting is a two-step transition, so narration and special sequences complete
  before the time slot changes;
- knowledge persists when evening wraps into another morning;
- the first completed murder interval establishes Ryan's death as persistent
  knowledge, so he cannot be warned during the initial morning;
- verified legacy clues use typed, declarative scene interactions;
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
  actual scene and dialogue actions, begins another day, prevents the murder,
  reaches the epilogue, and resets to the main menu;
- question and answer cues play sequentially and update the same tested state
  machine used by exploration;
- all 20 transition narrations use the recovered `Spillet.dir` wording;
- those 20 transitions are now scene-keyed declarative events, with B4's
  `LauraSuspekt` cue and effects isolated from simultaneous locations;
- the first successful search of Barbara's computer visibly costs one interval,
  while locked access and replay remain free;
- characters remember asked questions and multi-stage conversations for the
  current day, while the next morning resets that memory but preserves Jørgens
  knowledge;
- an unsupported accusation makes that character refuse further questions for
  the rest of the day, without creating a hidden relationship score;
- C2 and E2 now contain mutually exclusive, neutral passage observations; after
  seeing both across different loops, Jørgen can spend the murder interval
  watching the bookcase and establish that Laura uses the hidden route;
- the clock hotspot names both the current location and destination time, making
  it explicit that waiting is a choice of place as well as time;
- all 20 original room photographs are rendered at their original 640×480
  position inside the responsive 800×600 stage;
- Director-score rectangles now drive rollover/focus hotspots for doors,
  characters, inspections, and the wait clock;
- all 12 original film loops run as layered bitmap animations using their
  recovered 87-tick Director timelines;
- all 81 Director video members and 109 PNG members are closed, file-validated
  catalogues;
- the two-frame body/necklace and trash/letter still sequences are restored;
- Barbara's computer reproduces both the original locked and unlocked text;
- the later 581-frame intro uses the original title/credit images, the complete
  uncropped recovered group ending, and extracted sound; if audible autoplay is
  blocked, its score waits for an explicit start gesture;
- the later Director interface supplies the blue stage background plus help,
  music, and quit controls;
- recovered music loops per location, ducks during narrative media, and can be
  muted; it also resumes after browser-induced media interruption. The current
  location mapping is accepted as the product mapping, while its incomplete
  historical provenance remains documented;
- the persistent narrative host is isolated from ordinary gameplay rerenders and
  accepts video, Director still sequences, and intentional text-only cues;
- the abort-safe `VideoPlayer` distinguishes completion, skip, autoplay blocking,
  missing media, network/decode failures, and cancellation.

See [roadmap.md](roadmap.md) for the complete migration plan.
The image comparison and provenance notes are in
[docs/image-assets.md](docs/image-assets.md).
Dialogue normalization and conditional-link provenance are in
[docs/dialogue-rules.md](docs/dialogue-rules.md).
The parity boundary, remaining unknowns, and original Laura gaps are in
[docs/legacy-restoration-status.md](docs/legacy-restoration-status.md).
The recovered intro, location music, and clock sound are inventoried in
[docs/audio-assets.md](docs/audio-assets.md).
The complete comparison with the later recovered Director working copy is in
[docs/legacy-fresh-audit.md](docs/legacy-fresh-audit.md).
The phase 8 knowledge gate, reconstructed bridges, ending, and unused-asset
decisions are in
[docs/canonical-laura-completion.md](docs/canonical-laura-completion.md).
The completed phase 9 event matrix, time-action rules, loop-local memory, and
validation boundary are in
[docs/time-observation-design.md](docs/time-observation-design.md).
The phase 10 case registry, selection lifecycle, and alternative-case
readiness boundary are in
[docs/case-model.md](docs/case-model.md).

## Commands

```sh
nvm use
npm ci
npm run dev
npm test
npm run build
```

Node.js 22.16.0 is pinned in `.nvmrc`; Vite also supports the declared Node
22.12–24 range. `npm ci` is the reproducible first install and is only needed
again when dependencies change or `node_modules/` is removed. The generated,
ignored production output is `dist/`.

## Production

The production target is a static Cloudflare Pages site:

- Pages project: `saving-ryan`;
- URL: `https://ryan.petergpt.dk`;
- exposure: private preview through Cloudflare Access;
- build: `npm ci && npm run build`;
- output: `dist/`;
- liveness: `/health/live`;
- readiness: `/health/ready`.

There is no production process, port, database, runtime data, log stream,
environment variable, or Mac Mini dependency. The app uses no analytics or
external application API; Cloudflare Pages and Access are the only external
services and may incur cost according to the owner's plan and usage.

Operational verification, rollback, privacy, and deployment commands are in
[`docs/OPERATIONS.md`](docs/OPERATIONS.md) and
[`deployment/README.md`](deployment/README.md). The production architecture and
security decisions are recorded in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and
[`docs/DECISIONS.md`](docs/DECISIONS.md).

Asset and Director inspection commands are documented under
[`tools/`](tools/). The BMP conversion can be repeated with:

```sh
./tools/assets/convert-bmp-to-png.sh
```

If the uncommitted recovered working copy is present locally, its 16 additional
image derivatives can be reproduced with:

```sh
./tools/assets/convert-legacy-fresh-bmp-to-png.sh
```

## Source layout

```text
Legacy/       original Director movies and project report
public/Video/ browser-ready MP4 files
public/assets/ web-ready image derivatives
public/assets/audio/ extracted Director intro, music, and effects
src/app/      global state and store
src/game/     scene registry, interactions, transitions, and state machine
src/media/    media manifests and compatibility aliases
src/ui/       DOM rendering
tests/        state and manifest tests
tools/        Director inspection and asset conversion utilities
deployment/   Cloudflare Pages production contract
```

The current interface renders the original intro, room photographs, primitive
character animations, score-positioned hotspots, clocks, special stills, and
dialogue portraits. Missing confession, prevention, and epilogue media use
intentional text cues through the same narrative host.
