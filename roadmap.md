# Saving Ryan — Director-to-Web Migration Roadmap

## Goal

Rebuild the four Adobe Director movies as one maintainable HTML5 application while
preserving the existing story, time loop, investigation logic, dialogue, video, and
visual identity. Conversion comes first; unfinished game content and new features
belong to a later phase.

## What the legacy project actually contains

The four `.dir` files are binary Director 8 RIFX/XFIR containers, not text source
directories. Their casts, markers, and compiled Lingo were inspected directly.

| Legacy file | Confirmed responsibility | Contents found |
| --- | --- | --- |
| `Legacy/Intro.dir` | Opening timeline and handoff to the game | 800×600, 535 frames, 24 cast members, 3 scripts, intro sound, title/character bitmaps |
| `Legacy/Spillet.dir` | Main controller, navigation, dialogue, state, and special scenes | 800×600, 165 frames, 44 cast members, 19 scripts, 30 frame markers, external references to the video and image casts |
| `Legacy/Video.dir` | Video cast/catalogue | 81 named video members; no Lingo and no score |
| `Legacy/Billeder.dir` | Image and animation cast | 86 members: room images, portraits, clocks, buttons, and Director film loops; no Lingo |

The project report confirms the same design:

- five locations × four times of day = 20 explorable scenes;
- the player explicitly advances time;
- time wraps from evening back to morning while acquired knowledge persists;
- progression is based on knowledge rather than inventory;
- dialogue choices are unlocked by conditional links;
- the original target stage is 800×600;
- dialogue video is 352×288;
- the game was knowingly delivered unfinished, with `[meta]` text standing in for
  missing scenes.

Relevant report sections are pages 11–13, 18–28, 65–78, and 93–105 of
`Legacy/Projektet.pdf`.

## Confirmed legacy runtime flow

```text
Intro.dir
  title/character timeline
  click handler: go(1, "spillet")
        |
        v
Spillet.dir
  startMovie -> initialize global BetingetLink
  Start marker -> jump to A1
        |
        +--> Billeder.dir: room images, portraits, film loops, UI art
        |
        +--> Video.dir: named dialogue/cutscene media
        |
        v
20 scene markers A1..E4
  move: change A..E and retain 1..4
  wait: retain the source scene while narration/special sequences run
  complete transition: retain A..E and advance 1..4
  4 -> 1: begin another day, retain investigation knowledge
```

Locations are:

| Code | Location |
| --- | --- |
| A | Kantinen (canteen) |
| B | Computerrummet (computer room) |
| C | Læsesalen (reading room) |
| D | Grupperummet (group room) |
| E | Gangarealet (corridor) |

The four time slots are morning, midday, afternoon, and evening.

## Which file to translate first

Translate **`Spillet.dir` first**, beginning with the movie script named
**`Script Startmovie`**.

That script creates `BetingetLink`, the global list used by navigation, dialogue,
computer investigation, necklace discovery, Barbara's help, and special scenes.
This is the legacy source of truth for global game state.

`Intro.dir` must run first at runtime, but it should be translated after the state
contract is defined. Its main behavioral responsibility is only to play/hold its
timeline and hand control to `Spillet.dir`.

The first translation deliverable should therefore be a typed state model and pure
transition functions, not a visual recreation of the intro.

## Proposed web architecture

Use a modular monolith: one Vite/TypeScript web application, one HTML entry point,
one authoritative store, and small framework-independent services. TypeScript keeps
the JavaScript output while making the reverse-engineered rules safer to translate.

```text
index.html
src/
  main.ts                    application bootstrap
  app/
    AppController.ts         phase changes: intro, game, dialogue, cutscene, ending
    gameState.ts             the only authoritative state shape
    gameStore.ts             dispatch, subscribe, serialize, reset
    actions.ts               typed player and system actions
    selectors.ts             derived availability and UI state
  intro/
    IntroController.ts       recreates Intro.dir and dispatches INTRO_FINISHED
  game/
    stateMachine.ts          core phase/location/time transitions
    sceneRegistry.ts         A1..E4 data and occupants
    knowledgeGraph.ts        semantic replacement for BetingetLink
    dialogueEngine.ts        topics, prerequisites, questions, answers, effects
    hotspotEngine.ts         move, inspect, talk, wait, and special actions
    endingEngine.ts          accusation, confession, prevention, epilogue
  media/
    assetManifest.ts         stable IDs -> extracted image URLs
    videoManifest.ts         stable IDs -> /Video/*.mp4
    VideoPlayer.ts           Promise-based sequential HTML5 video playback
    audio.ts
  render/
    Stage.ts                 responsive 800×600 coordinate system
    SceneRenderer.ts         background and animated character layers
    DialogueView.ts          portrait, video, choices, captions
    HotspotLayer.ts          DOM buttons positioned over the stage
    CursorController.ts      walk, inspect, and talk cursors
  content/
    scenes.ts
    dialogue.ts
    transitions.ts
    introTimeline.ts
  styles/
    app.css
public/
  assets/
    images/
    audio/
  Video/                     existing MP4 files
tests/
  stateMachine.test.ts
  knowledgeGraph.test.ts
  dialogueEngine.test.ts
  videoManifest.test.ts
```

### Rendering decision

Start with layered DOM elements rather than committing the whole game to a canvas:

- room images and character layers can be absolutely positioned inside a responsive
  800×600 stage;
- hotspots can be real buttons, providing keyboard access, focus, and testability;
- dialogue text, captions, and controls remain accessible DOM;
- `<video>` remains a native media element;
- canvas can still be added for a specific visual effect, but should not own game
  logic or accessibility.

## Current global state contract

The old globals should be replaced by explicit, serializable state. The exact names
can evolve, but the separation between permanent knowledge and per-loop state is
essential.

```ts
interface GameState {
  version: 1;
  phase: AppPhase;
  location: LocationId;
  timeSlot: TimeSlot;
  loop: number;

  // Simple known/unknown facts persist across loops.
  knowledge: Record<KnowledgeId, boolean>;

  loopState: {
    seenTransitions: SceneId[];
  };

  // The source scene remains active until narration and any special sequence
  // have completed.
  pendingTransition: PendingTransition | null;
}
```

Dialogue progress and transient media state are deliberately not speculated into
this contract yet. The dialogue phase will introduce typed option IDs and explicit
repeat rules. Runtime media state will not be serialized as durable game progress.

Use semantic knowledge IDs such as:

- `barbara_is_computer_expert`
- `barbara_hacker_alias_intruder`
- `barbara_forged_grades`
- `ryan_has_girlfriend_sarah`
- `ryan_bullied_marie`
- `laura_hid_computer_activity`
- `ryan_and_laura_were_together`
- `ryan_left_laura`
- `secret_passage_exists`
- `laura_was_in_institution`
- `laura_owns_polar_bear_necklace`
- `ryan_was_murdered`
- `killer_dropped_necklace`
- `necklace_connects_laura_to_scene`
- `laura_confessed`

Do not carry forward `"Nej"`, `"Ah"`, and `"Ok"` as magic strings. Simple facts are
booleans. Barbara's legacy `"Ah"` helper state is a specific multi-step sequence
and will be modelled separately rather than generalized to all knowledge.

## Legacy Lingo-to-web mapping

| Director construct | Web replacement |
| --- | --- |
| `BetingetLink[n]` | semantic `knowledge` entry |
| frame marker such as `B3` | `SceneId` and scene data |
| `go("A" & char 2 of frameLabel)` | `MOVE_TO_LOCATION` action |
| `go("Vent")` | `WAIT` action and transition resolver |
| `Husk` | `returnScene` |
| `Person` | `dialogue.person` |
| `question` / `Answer` | declarative dialogue node |
| `sprite(...).blendLevel` | CSS class/state |
| `sprite(...).member` | asset/video manifest lookup |
| `movieTime < duration` loops | `await video.play()` / `ended` event |
| `go(the frame)` | stable application state, not a busy timeline loop |
| Director film loop | CSS/JS frame animation using extracted stills |

## Video migration

`Video.dir` is a catalogue, not a controller: the actual playback orchestration is
in `Spillet.dir`'s `Dialog`, `Laura Suspekt`, and `BarbaraHilfe` scripts.

Implement one `VideoPlayer` service that:

1. resolves a semantic clip ID through `videoManifest.ts`;
2. assigns `/Video/<filename>.mp4` to one reusable `<video>` element;
3. awaits `loadedmetadata` and `play()`;
4. resolves on `ended`;
5. supports skip, subtitles, error display, and cleanup;
6. can play question and answer clips sequentially;
7. restores the portrait/dialogue state after playback.

Current foundation:

- one persistent `<video>` element lives outside ordinary gameplay rerenders;
- `VideoPlayer` uses a per-playback token, removes old listeners, and aborts a
  previous session before starting another;
- loading, playing, ended, skipped, autoplay-blocked, missing-media,
  network-error, decode-error, and aborted are explicit states;
- ended and skipped are distinct results, so dialogue data can define whether a
  skipped clip still applies its effects;
- sequential question/answer orchestration and the dialogue UI are not connected
  yet.

Media audit results:

- 81 MP4 files are present;
- the manifest is a closed `VideoClipId` catalogue and tests it against the
  complete directory;
- all 81 contain H.264 video at 352×288 with `yuv420p`;
- all contain mono AAC audio;
- 79 use 32 kHz audio and 2 use 44.1 kHz audio;
- every Director video member has a likely MP4 counterpart, but three naming pairs
  require explicit aliases:

| Director member | Existing MP4 |
| --- | --- |
| `Peter-BeskyldDavid1` | `Peter-BeskyldDavid.mp4` |
| `Peter-BeskyldMarie1` | `Peter-BeskyldMarie.mp4` |
| `Peter-omRyanDie` | `Peter-omRyanDatid.mp4` |

Do not rename the original media during the first pass. Record these aliases in the
manifest so provenance remains clear.

## Image migration

Extract `Billeder.dir` members to lossless PNG files while preserving their cast
names. The cast contains:

- 20 base scene slots, with some photographs reused or composed as layers;
- character portraits;
- three-frame character variations;
- film loops such as `LoopA1`, `LoopB1`, and `LoopC3`;
- clock images `ur1` through `ur4`;
- UI art such as `videreknap` and `blankvideo`.

Create an extraction inventory containing:

- original cast name and chunk/member identity;
- exported filename;
- dimensions and transparency;
- base image versus animation frame;
- every scene or dialogue that references it.

The responsive web stage should retain the original 4:3 composition and scale as a
unit with `aspect-ratio: 4 / 3`; hotspot coordinates must use the same logical
800×600 coordinate space.

Current extraction status:

- 90 separately supplied BMP originals are preserved under `Legacy/Billeder/`;
- they cover 73 of the 74 bitmap members in `Billeder.dir`;
- `BlankPortrait`, `titel-ryan`, and `titel-saving` were decoded from the Director
  casts because BMP sources were absent;
- 93 PNG derivatives are available under `public/assets/images/`;
- the PNG manifest is closed and file-validated, including typed film-loop frames;
- all 20 A1–E4 background photographs are connected to the exploration stage;
- the 12 film-loop frame groups are identified, while placement and timing still
  await score translation.

## Step-by-step conversion plan

### Phase 0 — Preserve and inventory

1. Initialize Git and commit the untouched legacy inputs plus this roadmap.
2. Record checksums for all `.dir`, PDF, and MP4 inputs.
3. Keep original binaries in a read-only `legacy/` area once the app scaffold exists.
4. Export a machine-readable cast/script/marker inventory.
5. Extract all image and audio members without altering the originals.

Exit criterion: every legacy member has an identity and every generated file can be
traced back to its source.

### Phase 1 — Translate `Spillet.dir` state before UI

1. Define `GameState`, `KnowledgeId`, `SceneId`, actions, and reset rules.
2. Translate `Script Startmovie` into `createInitialGameState()`.
3. Translate A1–E4 movement and the wait/time-wrap behavior into pure functions.
4. Separate persistent knowledge from loop-local character/transition state.
5. Add unit tests for movement, waiting, day rollover, and knowledge persistence.

Exit criterion: the complete 5×4 world and time loop run in tests without DOM or
media.

### Phase 2 — Translate investigation and dialogue rules

1. Replace numeric conditional links with semantic knowledge IDs.
2. Translate `Script Talemuligheder` and `Script Talemuligheder Special` into data.
3. Translate `Script Samtaler` into dialogue availability selectors.
4. Translate each dialogue choice into:
   `requires`, `questionClip`, `answerClip`, and `effects`.
5. Preserve repeatable questions and record which topics were previously asked.
6. Add graph tests proving that required evidence/motive paths are reachable.

Exit criterion: the Laura solution path and every known dead-end topic can be
executed as deterministic state transitions.

Current completion:

- the five base subjects and all recovered special topics are typed dialogue
  data with closed manifest clip IDs;
- availability observes acquired knowledge and whether the murder has occurred
  in the characters' current day;
- asked choices remain repeatable and skip effects follow an explicit per-choice
  policy;
- Director's missing `Dialog()` call, `VedIkk` typo, and missing
  `Peter-omMarieOgRyan` member are normalized explicitly;
- Barbara's helper link is a request/ready/completed state rather than a magic
  string;
- the report's Laura motive/evidence chain is executable as a semantic knowledge
  graph and covered by reachability and dead-end tests.

### Phase 3 — Build the application shell and intro

1. Scaffold Vite + TypeScript with a single `index.html`.
2. Build the responsive 800×600 stage and phase controller.
3. Translate the `Intro.dir` timeline and sound behavior.
4. Replace `go(1, "spillet")` with an `INTRO_FINISHED` action.
5. Provide a skip-intro control that performs the same state transition.

Exit criterion: launch → intro → initialized A1 game scene works reliably.

### Phase 4 — Restore scenes and interactions

1. Populate the 20-scene registry from A1–E4 markers.
2. Render extracted backgrounds and animation layers.
3. Translate navigation hotspots, talk hotspots, inspect hotspots, and the wait
   clock.
4. Add walk/talk/inspect cursor feedback and rollover/focus states.
5. Translate the 20 transition descriptions currently stored in `Script Vent`.

Exit criterion: the user can explore every room at every time and repeat the day.

### Phase 5 — Integrate video

1. Create and validate `videoManifest.ts` against all MP4 files.
2. Implement sequential question/answer playback.
3. Translate the Laura-computer and Barbara-hacking cutscenes.
4. Add skip, captions/transcripts, loading, and failure states.
5. Test media playback in current Chromium, Firefox, and Safari.

Exit criterion: no gameplay code refers to a physical filename directly, and every
referenced clip either plays or produces an actionable missing-media error.

### Phase 6 — Translate special scenes and current ending path

1. Restore letter/trash, body/necklace, listening-under-table, book/passage, and
   Barbara-computer interactions.
2. Implement accusation prerequisites: motive plus necklace evidence.
3. Implement confession, passage discovery, next-loop prevention, and the current
   ending/epilogue boundary.
4. Mark genuinely unimplemented legacy content as explicit TODO data, not hidden
   control-flow gaps.

Exit criterion: the existing intended solution described in the report is playable
from intro to its current endpoint.

### Phase 7 — Conversion hardening

1. Add save/resume through versioned `localStorage` serialization, but keep it
   optional so the time-loop design remains intact.
2. Add keyboard controls, focus states, captions, reduced-motion support, and audio
   controls.
3. Add responsive behavior without changing logical coordinates.
4. Add end-to-end tests for the critical story path and a full-day rollover.
5. Create a production build and static-host deployment configuration.

Exit criterion: the converted legacy scope is stable, testable, and deployable.

### Later phase — Finish and expand the game

Only after conversion parity:

- replace `[meta]` transition text with new scenes or intentional prose;
- complete missing intro/cutscene material;
- improve sound and music;
- broaden dialogue and alternative investigations;
- decide whether to keep Laura fixed as the murderer or add replay variants;
- commission or generate new assets with a documented art direction.

## Known legacy defects and migration risks

1. `Script Startmovie` creates 17 conditional-link values, but another script writes
   `BetingetLink[18]`. The web model must not reproduce this out-of-range defect.
2. Several Lingo branches contain likely typos or incomplete IDs, including
   `VedIkk`, `Peter-omMarieOgRyan`, and legacy/member filename differences.
3. The report says the secret passage should be physically available from the start
   but nearly impossible to discover without knowledge. This should become an
   explicit design rule, not an accidental tiny hotspot.
4. `Video.dir` and `Billeder.dir` are referenced by old absolute Windows `.cst`
   paths. The web app must use manifests and relative URLs only.
5. The Director score reports a very large channel count due to old-format parsing;
   migration should rely on actual used sprite/marker behavior, not raw channel
   counts.
6. Director's synchronous video polling must not be copied; browser media playback
   is asynchronous and can be rejected until initiated by a user gesture.
7. Some source material is deliberately unfinished. Conversion parity and new
   design work must be tracked separately to avoid inventing behavior during the
   port.

## Conversion definition of done

The conversion phase is complete when:

- the web app starts with the intro and hands off to A1;
- all 20 location/time scenes are navigable;
- waiting advances time and evening wraps to a new morning;
- investigation knowledge persists through the loop;
- dialogue availability follows the translated knowledge graph;
- all existing MP4 dialogue and cutscene files are manifest-driven;
- all required legacy image members have been exported and rendered;
- special interactions and the intended Laura solution path work;
- missing original content is visibly and accurately tracked;
- state-machine, knowledge-graph, manifest, and critical-path tests pass;
- a static production build works without Director, Shockwave, Xtras, or absolute
  local file paths.
