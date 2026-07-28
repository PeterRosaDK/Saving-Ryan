# Audit of the later Director build

## Scope and provenance

`Legacy Fresh/Spillet/` is a later working copy recovered from old hard disks.
It is treated as read-only primary material during this audit and is deliberately
excluded from Git. The committed web derivatives and this document are sufficient
to retain the conclusions, while the recovered directory itself remains under the
owner's control.

The comparison used `spillet_decompiled.dir` as the readable, authoritative
Fresh source. The old compiled `spillet.dir` was checked only as a structural
control. Specifically, the audit covered:

- `spillet_decompiled.dir`, checked against `spillet.dir`;
- `intro_decompiled.dir`, checked against `intro.dir`;
- the converted `Billeder.dir` and `Video.dir` casts;
- all 105 supplied BMP files and 81 AVI files;
- the nine files under `Spillet/Musik/`;
- the restored web app at commit `766eebe`;
- the tagged legacy baseline `legacy-restoration-v1` at `8e79537`.

The top-level HTML exports were not used. They are unrelated to the Director
runtime.

## Structural comparison

| Area | Earlier supplied build | Later recovered build | Finding |
| --- | ---: | ---: | --- |
| Main movie cast members | 44 | 75 | New interface and audio members |
| Main movie scripts | 19 | 25 | Mostly interface and playback polish |
| Main movie frames | 165 | 170 | Added start/help frames |
| Intro cast members | 24 | 25 | Added `intro-slut` |
| Intro frames | 535 | 581 | Longer final group-image ending |
| Room/video files | 81 AVI members | 81 AVI members | No new footage found |
| Supplied BMP files | 90 | 105 | 89 shared files are byte-identical |

Every later AVI name already exists in the web app's closed 81-clip manifest.
Comparing each AVI with its corresponding MP4 found no duration difference over
80 milliseconds. This is strong evidence that the later build contains no newly
recorded scene.

Of the bitmap files, the only earlier-only source is `videreknap.bmp`. The later
build adds:

- the blue 800×600 `baggrund` behind the centred 640×480 room photograph;
- normal/rollover help, music, quit, and back-button artwork;
- walk, talk, and inspect cursor pairs;
- `intro-slut`, the final group picture and caption.

The 89 shared BMP files are byte-for-byte identical, so the underlying rooms,
portraits, still sequences, and primitive character animations did not change.

## Lingo and gameplay findings

The central dialogue-condition script, `Script Talemuligheder Special`, is
unchanged. The later build therefore does not contain a new solution path or a
different knowledge graph.

The additions are mainly presentation:

- a textured stage background replaces the black 800×600 margins;
- help, music, quit, and back controls appear in a right-side toolbar;
- Return can skip the active question or answer clip;
- music channel 2 fades down before dialogue video and back up afterwards;
- a guard named `SamtaleSkygge` avoids rebuilding unchanged dialogue UI;
- the intro accepts keyboard skip and ends on `intro-slut`;
- the help frame explains the clock, hotspots, video skip, music, and navigation.

The later `BarbaraHilfeVoiceover` script distinguishes two explanatory variants:
without the necklace it connects Laura to an institution and her characteristic
necklace; with the necklace it explicitly states that the found necklace is
identical. The existing web game already represents those semantic facts and the
evidence gate. The voiceover remains a candidate for a later text bridge because
there is no separate recovered voice asset for it.

One apparent later-build regression was deliberately not copied. The earlier
`LauraSuspekt` continuation grants conditional link 13 after the clip, while the
later handler merely returns to B1. The web implementation retains the learned
`laura_hid_computer_activity` fact because it is required by the verified route
and matches the earlier Director behavior.

## Music finding

The later directory contains eight original PCM WAV masters plus the clock sound:

| ID | Duration | Current status |
| --- | ---: | --- |
| `28` | 23.228 s | Provisionally assigned to the canteen |
| `29` | 52.138 s | Provisionally assigned to the computer room |
| `31` | 56.142 s | Provisionally assigned to the reading room |
| `34` | 24.688 s | Provisionally assigned to the group room |
| `35` | 17.164 s | Provisionally assigned to the corridor |
| `36` | 15.611 s | Preserved, not assigned |
| `37` | 16.736 s | Preserved, not assigned |
| `38` | 14.808 s | Preserved, not assigned |
| `clock_tick` | 9.617 s | Clock/wait feedback |

The music members occupy cast slots 81–88 and `clock_tick` slot 89. The recovered
music button controls `sound(2).volume`, and dialogue fades the same channel.
However, neither decompiled Lingo nor the saved score starts a track or retains
a track-to-location reference. The projector is a Director stub and supplies no
additional mapping.

The five location assignments above are therefore a conservative reconstruction
from the first five recovered masters, not claimed historical fact. They live in
one table in `src/media/musicManifest.ts`; changing the table is sufficient to
correct the order. Tracks 36–38 are committed unchanged for listening, future
identification, and Suno-derived work.

## Improvements incorporated

The web app now includes the later build's safe, source-backed improvements:

- blue Director stage background with correctly centred room scene;
- recovered help, music, and quit toolbar at score-derived coordinates;
- Director-style transparent mattes for toolbar and clock derivatives;
- local help overlay based on the recovered Director help text;
- looping location music with mute control;
- music ducking during video, still, and text narrative cues;
- recovered clock sound on the wait action;
- extended 581-frame intro with larger portraits and `intro-slut`;
- the recovered 699×603 placement of `intro-slut`, preserving the complete
  image rather than cropping it to the 800×600 stage;
- all new interface, cursor, and intro bitmaps in the closed image manifest;
- all eight music masters in a closed, file-size-validated audio manifest.

Browser autoplay rules can initially block location music. Clicking the music
button retries playback as a user-initiated action. This is an explicit runtime
state rather than a silent failure.

The same restriction applies to the intro sound. If audible autoplay is
rejected, the web score now remains paused until the player explicitly starts
it with sound, instead of silently running ahead of the recovered audio.

## Deferred or rejected changes

- The provisional music order needs an authoritative listening note.
- Tracks 36–38 need identification before they are used.
- The recovered cursor bitmaps are preserved but not activated because their
  opaque Director-era backgrounds do not translate cleanly to browser cursors;
  hotspot rollover remains clearer and keyboard accessible.
- The dialogue-shadow optimization is unnecessary in the web renderer.
- The `BarbaraHilfeVoiceover` distinction may become a text cue later, but no new
  knowledge effects are needed.
- The later `Tekst-Start` frame has now been restored as a prologue between the
  cinematic intro and A1. Its first sentence, "Intro, der hurtigt gennemløber
  den første dag.", is treated as a production direction rather than
  player-facing copy; the remaining four paragraphs are reproduced faithfully.
- No story mechanics, phase 9 rules, or Laura ending logic were replaced by the
  later build.

## Reproducibility boundary

Collaborators can build and continue the web game from Git without
`Legacy Fresh/`: all runtime images and sounds used by the app are committed, and
the mapping decisions are documented and tested. Repeating the forensic Director
comparison itself still requires the owner's uncommitted recovered directory.
