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
| `BetingetLink[16]` | `dialogue.barbaraHelp` |
| `BetingetLink[18]` | `secret_passage_exists` |

Slot 16 is deliberately a multi-step dialogue status, not a boolean fact.
Slots absent from the decompiled handlers have not been given speculative
meanings.

Slots 6 and 18 are now set by their original scene actions: listening under the
table in B2 and pulling the book hotspot in C1–C4. Laura's confession does not
set slot 18; passage discovery remains an independent, physically available
investigation branch as described by the report.

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

Asked choices are recorded but remain repeatable, matching the report's
description of faded yet reusable dialogue options. Knowledge effects are not
applied when playback is skipped unless a choice explicitly opts into that
policy.

## Report-backed completion of the motive route

The Director runtime and the report diverge around Sarah:

- `Spillet.dir` contains no reachable Sarah dialogue option;
- `Video.dir` nevertheless contains `Ryan-omSara`,
  `Ryan-omSaraOgDavid`, and `Ryan-omSaraOgLaura`;
- the report explicitly requires the route
  kærestebrev → Ryan dialogue → Ryan and Laura's former relationship.

The web version therefore follows the report's intended knowledge flow and uses
the existing `Ryan-omSaraOgLaura` answer. Because no matching Jørgen question
clip exists, his question is an explicit text cue. It can later be upgraded to
still image plus voice-over without changing the dialogue rule.

Marie's route is also kept as the report describes it: the first
`Marie-Fortrolighed` exchange earns her confidence, and only a later repeat with
the Ryan/Laura relationship known uses `Marie-Fortrolighed2` and reveals that
Ryan left Laura. Knowing both facts before the first conversation no longer
skips the confidence exchange.
