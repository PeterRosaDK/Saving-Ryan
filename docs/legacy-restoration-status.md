# Director restoration status

This document separates verified Director parity from the report-backed Laura
completion work and the deferred expansion phases. Its primary sources are
`Legacy/Spillet.dir`, `Legacy/Intro.dir`, the decompiled
`Legacy/Decompiled/DirectorDump.txt`, the supplied media casts, and
`Legacy/Projektet.pdf`.

This parity snapshot is preserved by the annotated tag
`legacy-restoration-v1` at commit `8e79537`. The gaps listed below were closed
after that baseline in phase 8 and are documented separately in
`docs/canonical-laura-completion.md`.

A later working copy was subsequently recovered from old hard disks. It adds
music and interface polish but does not invalidate this tag: the tag remains the
baseline for the originally supplied build. The later comparison and selectively
ported presentation improvements are documented in
`docs/legacy-fresh-audit.md`.

## Restored runtime

### Intro

- At the tagged baseline, the 535-frame, 20 fps `Intro.dir` score is represented
  by the original title,
  cast-credit, and half-character bitmaps.
- The six credit sections begin at their recovered score frames: Barbara/Jane
  61, David/Søren 135, Marie/Bodil 210, Jørgen/Peter 285, Laura/Signe 360, and
  Ryan/Claus 435.
- The embedded `intro` member is reproducibly extracted from the split Director
  `sndH`/`sndS` chunks as a 30.444-second, mono, 44.1 kHz WAV.
- The browser version attempts audible playback immediately. If autoplay is
  rejected, the visual score stays paused until a sound-enabled start gesture;
  skipping performs the same state handoff to A1.

### World, navigation, and waiting

- All 20 A1–E4 scenes render at the original 800×600 logical stage positions.
- Rooms A–D connect to corridor E; E contains the four original room exits.
- All recovered character, inspection, quit, and clock hotspots use the score
  rectangles and rollover/focus feedback.
- All 12 Director film loops use the recovered positions and non-uniform
  87-tick frame changes.
- Every one of the 20 `Vent` branches retains its source scene until the
  narration or special sequence is complete, then advances one time slot.
- The `Vent` copy is the Director wording rather than editorially shortened
  prose.
- Evening wraps to morning in the same location. Permanent knowledge survives;
  the per-loop transition history resets.

### Original scene interactions

| Director action | Restored scenes | Presentation and effect |
| --- | --- | --- |
| Inspect Ryan / necklace | A3, A4 | `sektorA3-Ryan1` → `sektorA3-Ryan2`; necklace evidence |
| Inspect trash / letter | D1–D4 | `sektorD4-Brev1` → `sektorD4-Brev2`; Sarah fact |
| Barbara's computer | B2, B3 | original locked text before `Intruder`, original success text afterward |
| Listen under table | B2 | recovered Director text; Barbara/Ryan conflict |
| Pull the book | C1–C4 | recovered Director text; secret passage |
| Wait in B4 | B4 | `LauraSuspekt` video before loop completion |
| Ask Barbara for help | Barbara dialogue | two dialogue stages followed by `BarbaraHacker` |
| Quit hotspot | A1–A4 | browser confirmation and return to the intro |

Manual hotspots remain replayable, as they were in the score. Replaying them
does not duplicate knowledge.

### Dialogue and media

- The five base subject questions, post-murder alibi/theory/accusation frame,
  conditional topics, Ryan warning stages, and Barbara helper stages are
  represented as typed, declarative choices.
- Conditional topics follow persistent Director links and therefore remain
  available in later loops. The ordinary/post-murder distinction still selects
  the appropriate Ryan wording and clips.
- Original question and answer clips play sequentially through one persistent
  video host, then return to the same dialogue.
- All referenced clip IDs are checked against the closed 81-file MP4 catalogue.
- The original `LauraSuspekt` and `BarbaraHacker` special videos use the same
  playback boundary as dialogue.
- Playback error, browser autoplay rejection, skip, and abort are explicit and
  cannot accidentally apply an unfinished interaction.

## Intentional normalizations already present

These are useful but are not byte-for-byte Director behavior:

- `VedIkk` resolves to the supplied `*-VedIkke` clips.
- The missing `Peter-omMarieOgRyan` member resolves to
  `Peter-omRyanOgMarie`.
- Ryan's self-topic actually invokes playback, correcting the missing Director
  `Dialog()` call.
- The report-backed Sarah route uses a text question plus the existing
  `Ryan-omSaraOgLaura` answer because the Director runtime never exposes a
  matching Sarah question.
- Marie's second confidence clip and the evidence-sensitive Laura accusation
  provide a partial report-backed bridge toward the intended solution.

The last two items belong conceptually to canonical Laura completion, not to
strict runtime parity. They are retained because they were already integrated,
tested, and do not require the deferred time/case abstractions.

## Original assets or behavior still unclear

- The precise per-frame scale/blend tween curves of `Intro.dir` are approximated
  with CSS between the recovered score boundaries. Asset order, placement,
  timing groups, and sound are restored.
- Director's `Smut` marker could terminate the projector. A web page cannot
  reliably close its own tab, so the restored hotspot confirms and resets to the
  intro.
- `videreknap` is preserved in the image catalogue, while accessible DOM buttons
  currently perform its continue/back roles.
- `Peter-GangGruppe`, `Peter-GangLab`, `Peter-GangKantine`, and
  `Peter-GangLaese` exist in the video cast but have no recovered Lingo
  references. Their audio is quiet walking/location production sound, not the
  additional music mentioned in the report.
- The originally supplied Director files contain only the `intro` sound member.
  Eight music masters and a clock sound were later recovered from another
  working copy; the missing historical scene assignment is documented in
  `docs/audio-assets.md`.
- `sektorA4-Ryan1/2`, alternate accusation takes, `Ryan-omSara`, and
  `Ryan-omSaraOgDavid` appear to be unused or unfinished material. The active
  `A Special` score explicitly points at the A3 Ryan stills even when opened
  from A4.
- Chrome has been smoke-tested locally. A final cross-browser pass in current
  Safari and Firefox remains production hardening rather than a known narrative
  defect.

## Gaps in the intended Laura story at the tagged baseline

The supplied Director game never completes the full report design:

- the Sarah motive chain is not reachable in the original dialogue scripts;
- Marie's intended second confidence/revelation stage is not wired by the
  original runtime;
- alternate Laura accusation clips are present but the original script always
  selects the first accusation;
- warning Ryan changes the warning clip but has no prevention effect;
- passage discovery, foreknowledge, and correct positioning never lead to a
  prevention sequence;
- there is no complete confession resolution, saved-Ryan sequence, ending, or
  epilogue in the Director score.

Those gaps are phase 8. The approved time/observation design remains deferred to
phase 9, and `CaseDefinition` plus alternative murderers remain deferred to
phase 10.

## Verification baseline

The restoration suite covers:

- all 20 wait transitions and day rollover;
- exact transition text;
- scene/character/interaction rectangles and film-loop timelines;
- dialogue prerequisites, repeat behavior, clip selection, and dead ends;
- sequential media behavior and manifest/file parity;
- B4 special-sequence completion;
- persistent knowledge and reset behavior;
- an executable Laura investigation path to the current confession boundary.

Baseline verified on 2026-07-27:

- `npm run typecheck`: passed;
- `npm test`: 9 files, 80 tests passed;
- `npm run build`: passed with a production Vite bundle;
- sound extractor target: built and reproduced
  `intro.wav` byte-for-byte (`SHA-256
  72fb5b48484cbc199dc247538efa519aeaeb8b36ee31755e7c7acee35372db7f`);
- local Chrome smoke: intro rendering/handoff, A1, sequential Laura dialogue
  media, B4 `LauraSuspekt` with day reset, D1 letter stills, and B2's locked
  computer response passed.
