# Dialogue and knowledge provenance

Phase 2 translates the runtime rules in `Legacy/Spillet.dir` and the intended
solution graph documented on pages 11–13 and 68–77 of
`Legacy/Projektet.pdf`. The two sources do not always use the same conditional
link numbers, so the decompiled Director runtime is authoritative for existing
behavior and the report is authoritative for the intended motive/evidence
chain.

## Runtime link mapping

The numeric Director slots observed in `DirectorDump.txt` are represented by
semantic state instead of array indexes:

| Director slot | Web state |
| --- | --- |
| `BetingetLink[2]` | `ryan_has_girlfriend_sarah` |
| `BetingetLink[3]` | `ryan_bullied_marie` |
| `BetingetLink[4]` | `barbara_is_computer_expert` |
| `BetingetLink[6]` | `barbara_and_ryan_argued` |
| `BetingetLink[7]` | `laura_acknowledged_barbara_and_ryan` |
| `BetingetLink[11]` | `barbara_hacker_alias_intruder` |
| `BetingetLink[12]` | `barbara_forged_grades` |
| `BetingetLink[13]` | `laura_hid_computer_activity` |
| `BetingetLink[14]` | `killer_dropped_necklace` |
| `BetingetLink[16]` | `loopState.dialogue.barbaraHelp` |
| `BetingetLink[18]` | `secret_passage_exists` |

Slot 16 is deliberately a multi-step dialogue status, not a boolean fact.
Slots absent from the decompiled handlers have not been given speculative
meanings.

Slots 6 and 18 are set by their original scene actions: listening under the
table in B2 and pulling the book hotspot in C1–C4. Passage discovery remains an
independent, physically available investigation branch as described by the
report. Phase 8 additionally lets the successful Laura confession reveal the
same passage fact, because the report says her explanation is how Jørgen learns
the murder route.

## Normalized Director defects

- The missing `Dialog()` call in Ryan's self-topic no longer suppresses the
  choice.
- The missing member `Peter-omMarieOgRyan` resolves to the existing
  `Peter-omRyanOgMarie` clip.
- The truncated `VedIkk` member name resolves to the closed `*-VedIkke`
  catalogue.
- Marie's two confidence clips are explicit stages: the second can reveal the
  breakup only after Jørgen knows both that Ryan bullied Marie and that Ryan
  and Laura were together.
- Barbara's help keeps the legacy request/ready/completed sequence and only
  applies its discoveries after the hacker sequence completes.

Asked choices are recorded in loop-local dialogue state but remain repeatable,
matching the report's description of faded yet reusable dialogue options. They
and Barbara's helper stage reset the next morning; knowledge gained from a
completed choice does not. Knowledge effects are not applied when playback is
skipped unless a choice explicitly opts into that policy.

The Director uses post-murder dialogue frames for alibi, theory, and accusation.
Other conditional topics unlocked through `BetingetLink` remain available after
an evening-to-morning loop because those links are not reset. The web rules
retain that distinction: time selects the ordinary/post-murder dialogue frame
and Ryan clips, while knowledge-unlocked topics remain permanent.

## Report-backed completion of the motive route

The Director runtime and the report diverge around Sarah:

- `Spillet.dir` contains no reachable Sarah dialogue option;
- `Video.dir` nevertheless contains `Ryan-omSara`,
  `Ryan-omSaraOgDavid`, and `Ryan-omSaraOgLaura`;
- the report explicitly requires the route
  kærestebrev → Ryan dialogue → Ryan and Laura's former relationship.

The web version therefore follows the report's intended knowledge flow and uses
the existing `Ryan-omSaraOgLaura` answer. Because no matching Jørgen question
clip exists, his question is explicit text presented over Ryan's recovered
portrait before the original answer clip. It can later be upgraded with
voice-over without changing the dialogue rule.

Marie's route is also kept as the report describes it: the first
`Marie-Fortrolighed` exchange earns her confidence, and only a later repeat with
the Ryan/Laura relationship known uses `Marie-Fortrolighed2` and reveals that
Ryan left Laura. Knowing both facts before the first conversation no longer
skips the confidence exchange.

## Phase 8 accusation and warning gates

The three existing Laura accusation clips are selected by the strength of the
case:

- `Peter-BeskyldLaura1`: neither motive nor strong evidence;
- `Peter-BeskyldLaura2`: one of the two pillars;
- `Peter-BeskyldLaura3`: both `ryan_left_laura` and
  `necklace_connects_laura_to_scene`.

Only the third variant receives the report-backed text confession and applies
`laura_confessed` plus `secret_passage_exists`. Warning Ryan records that he
dismissed the warning, but is not itself a solution. The warning is hidden until
Jørgen has experienced Ryan's death; it is therefore first useful on a later
morning. For a two-cue choice, skipping Jørgen's question does not discard an
answer that the player subsequently completes; only the final answer cue decides
whether answer-backed effects are applied. The complete continuation is
documented in `docs/canonical-laura-completion.md`.

## Phase 9 same-day accusation consequence

The Director only played `Peter-Beskyld<Person>1` for its accusation option and
recorded no reaction. The first phase 9 extension therefore uses a deliberately
small text-backed rule: after an inconclusive accusation, that character refuses
further questions for the remainder of the day. Other characters remain
available, and the refusal resets with loop-local dialogue state the next
morning.

Laura's accusation is conclusive only when both canonical case pillars are
known. An early accusation therefore also closes Laura's dialogue until the
next loop, but never removes Jørgen's permanent knowledge or makes the case
unwinnable. No trust score, anger scale, departure, or cross-character warning
is inferred from the legacy material.
