# Canonical Laura completion

Phase 8 closes the story gaps that were intentionally left outside the
Director restoration tagged `legacy-restoration-v1`. It extends the restored
state machine without adding phase 9 time-action/NPC-memory systems or phase 10
case selection.

## Ending knowledge contract

Laura only confesses when Jørgen can present both independent pillars described
on pages 71 and 76–77 of `Legacy/Projektet.pdf`:

| Pillar | Required fact | Provenance |
| --- | --- | --- |
| Motive | `ryan_left_laura` | Sarah letter → Ryan/Laura relationship → Marie's two confidence stages |
| Evidence | `necklace_connects_laura_to_scene` | murder-scene necklace + Barbara's discovery that Laura owned it |

General suspicion, Lauras hidden computer activity, her institution history, or
only one of the two pillars selects a weaker accusation clip and cannot set
`laura_confessed`.

The successful sequence is:

```text
ryan_left_laura
  + necklace_connects_laura_to_scene
  -> Peter-BeskyldLaura3
  -> Laura confession text
  -> laura_confessed + secret_passage_exists
  -> evening-to-morning Director loop
  -> Ryan dismisses Jørgen's warning
  -> C1 book/passage prevention
  -> ryan_was_saved
  -> epilogue
```

Warning Ryan remains insufficient by itself, matching page 70 of the report.
Completing the existing warning clip records
`ryan_dismissed_warning`: Jørgen has learned that an unsupported warning will
not change events. This is permanent protagonist knowledge, not a generalized
NPC disposition or loop-memory system.

## Source classification

### Restored Director material

- `Ryan-Advarsel1` and `Ryan-Advarsel2` remain the two warning stages.
- `Peter-BeskyldLaura1`, `Peter-BeskyldLaura2`, and
  `Peter-BeskyldLaura3` remain the three accusation strengths.
- `Ryan-omSaraOgLaura` supplies Ryan's answer on the Sarah route.
- `Marie-Fortrolighed` and `Marie-Fortrolighed2` supply Marie's two-stage
  revelation.
- The C-room book rectangle and text still represent the physically existing
  passage.
- Director's evening-to-morning transition remains the only mechanism used to
  reach the required later morning.

### Report-backed reconstruction

- The Sarah question is text because the Director runtime has no reachable
  matching Jørgen question, while the report explicitly requires this route.
- The third Laura accusation requires both motive and necklace evidence.
- Laura's response is a text cue because no confession response video exists.
  It states the report's explanation: she used the hidden door behind the
  reading-room bookcase and pushed Ryan from the ledge.
- The confession also reveals `secret_passage_exists`. Randomly finding the
  narrow original book hotspot beforehand remains possible, as the report
  explicitly says the door physically exists throughout the game.

### New minimal connective material

- `prevent_ryans_murder` reuses the C1 book hotspot after the complete case has
  been solved and Ryan's warning has failed. Its short text cue describes
  Jørgen reaching the ledge first and physically intervening.
- The ending view reuses the A1 canteen background, states that Ryan survived,
  and offers a complete reset to the intro.

These two text presentations are new because neither the Director score nor
the supplied media contains a prevention or epilogue sequence. They use the
existing `NarrativeCue` boundary and can later be replaced by still image plus
voice-over without changing game rules.

## Unused-asset decisions

| Asset | Likely function | Phase 8 decision |
| --- | --- | --- |
| `Peter-GangGruppe/Lab/Kantine/Laese` | short live-action navigation clips | Not used. They have no recovered Lingo references and no evidence links them to the ending. |
| `sektorA4-Ryan1/2` | duplicate body/necklace takes | Not used. They duplicate the A3 images and depict the failed timeline. |
| `Peter-BeskyldLaura1/2/3` | escalating accusations | Used as zero, one, and two-pillar accusation variants. Only variant 3 can lead to confession. |
| `Ryan-omSara` | general Sarah answer | Preserved but not selected; it does not establish the Laura relationship required by the report. |
| `Ryan-omSaraOgDavid` | Sarah/David branch | Preserved but not selected; the canonical motive chain concerns Laura. |
| `Ryan-omSaraOgLaura` | Sarah/Laura branch | Used as the report-backed answer for the canonical motive route. |

## State and reset guarantees

- `laura_confessed`, passage knowledge, and all other Jørgen knowledge survive
  the ordinary Director day reset.
- The prevention action exists only in C1, so a confession obtained after the
  murder cannot reach it without wrapping through a new morning during normal
  play.
- The action requires confession, passage knowledge, and the failed-warning
  fact. It cannot be unlocked by early warning alone.
- Completing prevention changes the phase to `ending`; exploration actions are
  then rejected, preventing effects from being applied twice.
- “Spil igen fra introen” dispatches the existing full `RESET_GAME`.

The reducer-level golden path covers intro, all required investigation
branches, confession, another day, warning, prevention, epilogue, and reset.
