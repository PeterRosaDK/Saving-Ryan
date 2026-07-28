# Phase 9 time and observation mechanics

Status: completed. Director restoration and canonical Laura completion remain
the foundation; phase 9 adds the approved time, observation, and loop-local
memory mechanics without introducing case selection.

This document records the implemented design, validation boundary, and features
deliberately deferred until later case content needs them.

## Product order

1. Restore the existing Director game as faithfully as possible.
2. Close the gaps in the intended but unfinished canonical Laura story.
3. Add expanded time, observation, and loop-local character memory.
4. Add curated alternative cases one at a time.

The following were explicitly out of scope during restoration:

- a `transitionEvents` refactor;
- `timeCost`;
- NPC loop memory, disposition, and false-accusation consequences;
- new C2/E2 observations;
- `caseId`, `CaseDefinition`, and alternative murderers.

## Core design principle

Movement, orientation, notebook reading, and short interactions remain free.
When Jørgen deliberately spends meaningful time, the day advances, and his
location determines which simultaneous part of the story he can experience.
There is no deadline or maximum number of loops.

## Current-state audit

The existing `WAIT` action already preserves the source scene in
`pendingTransition`, derives the next time in the same location, blocks other
exploration actions, and advances only after the transition presentation
completes. All 20 Director `Vent` descriptions are selected by source `SceneId`,
so location-dependent observation is already present in a basic form.

Current time-triggered knowledge is limited to:

- every midday-to-afternoon advance: learning that Ryan has been murdered;
- E1: witnessing Ryan bully Marie;
- B4: playing `LauraSuspekt` and learning about Laura's hidden computer
  activity;
- C2: hearing a neutral scraping sound behind the bookcase;
- E2: noticing that Laura vanished without using a hallway door.

Other investigation effects come from scene entry, manual inspection, dialogue,
or the `BarbaraHacker` special sequence. The first timed investigation action
is now the successful initial search of Barbara's computer.

`pendingTransition` records whether time was advanced by the clock or an
interaction. Basic loop-local conversation memory is separated from permanent
knowledge. General NPC disposition, timed dialogue, and case-specific event
resolution are deliberately absent because the current Laura case has no
concrete use that justifies those additional states.

Source-scene event effects are now applied before a new-day `loopState` reset,
so later loop-local effects cannot be written into the wrong day.

## Implemented architecture

The implementation extends the existing declarative model:

```ts
interface LocationTransitionEvent {
  id: TransitionEventId;
  scene: SceneId;
  cue: Extract<NarrativeCue, { kind: "text" }>;
  specialCue?: NarrativeCue;
  effects: readonly GameEffect[];
}

type TimeAdvanceCause =
  | { kind: "clock"; eventId: TransitionEventId }
  | { kind: "interaction"; id: SceneInteractionId };
```

`SceneId` already encodes location and source time, so it should remain the
event lookup key. Only one reducer gateway may calculate a time advance. A
transition event never consumes an additional interval. An action may produce
multiple effects while consuming at most one interval.

`timeCost: 0 | 1` is explicit on every scene interaction. All current dialogue
choices are deliberately free, so no unused dialogue time field or dialogue
transition cause has been added. A time-consuming interaction does not also
grant the ordinary wait/observation event.

Permanent player history and loop-local NPC memory are separate.
`loopState.dialogue` contains asked choices, Barbara's helper stage, and
same-day accusation refusals, while permanent knowledge survives reset. A
future selected case belongs at top-level state and must never be regenerated
by the daily reset; that state is intentionally not introduced before phase 10.

## Canonical Laura event matrix

Legend:

- **K**: existing Director canon;
- **U**: proposed later extension;
- **★**: mutually exclusive with the other locations in that time transition.

| Time transition | Location | Observed event | Existing asset/presentation | Effect | Status |
| --- | --- | --- | --- | --- | --- |
| Morning → midday | A canteen | Laura gets up and leaves | Text + `LoopA1` | None | K ★ |
| Morning → midday | B computer room | Barbara works; Ryan starts an argument | Text + `LoopB1` | Expertise is currently learned on entry | K ★ |
| Morning → midday | C reading room | Ryan leaves | Text + `LoopC1` | None | K ★ |
| Morning → midday | D group room | David leaves | Text + `LoopD1` | None | K ★ |
| Morning → midday | E corridor | David/Laura talk while Ryan bullies Marie | Text | `ryan_bullied_marie` | K ★ |
| Midday → afternoon | A canteen | Jørgen hears Ryan and sees the fall | Text | Possible later neutral fall observation | K + U ★ |
| Midday → afternoon | B computer room | Ryan and Barbara leave; a scream is heard | Text + `LoopB2` | None from waiting; eavesdropping is separate | K ★ |
| Midday → afternoon | C reading room | Ryan and David enter; a scream is heard; Jørgen hears the bookcase scrape | Legacy text + phase 9 text over `sektorC2` | `heard_scraping_behind_bookcase` | K + implemented phase 9 ★ |
| Midday → afternoon | D group room | Marie leaves; a scream is heard | Text + `LoopD2` | None | K ★ |
| Midday → afternoon | E corridor | David enters the reading room; Laura vanishes without using a door | Legacy text + `LoopE2` + phase 9 text | `noticed_laura_disappear_near_reading_room` | K + implemented phase 9 ★ |
| Afternoon → evening | A canteen | Laura leaves; David sits down | Text + `LoopA3` | None; body inspection is separate | K ★ |
| Afternoon → evening | B computer room | Laura and Marie enter | Text | None | K ★ |
| Afternoon → evening | C reading room | David leaves; Barbara enters | Text + `LoopC3` | None | K ★ |
| Afternoon → evening | D group room | Barbara and Marie leave | Text | None | K ★ |
| Afternoon → evening | E corridor | Nothing happens | Text | None | K ★ |
| Evening → morning | A canteen | New day; Laura remains seated | Text + `LoopA4` | None | K ★ |
| Evening → morning | B computer room | Marie leaves; Jørgen approaches Laura | Text + `LauraSuspekt` | `laura_hid_computer_activity` | K ★ |
| Evening → morning | C reading room | New day; Jørgen follows Ryan to the room | Text + `LoopC4` | None; targeted surveillance occurs in C2 | K ★ |
| Evening → morning | D group room | New day with Marie and David | Text | None; letter is separate | K ★ |
| Evening → morning | E corridor | New day in the corridor | Text | None | K ★ |

The A2/C2/E2 observation set now has two added neutral branches: the sound at
the passage and Laura's disappearance. Neither identifies the murderer alone.
Completing any midday-to-afternoon advance establishes the shared world fact
that Ryan has been murdered, including when a timed interaction occupies the
interval. A2 additionally preserves Director's direct view of the fall, so a
second A2-only death fact is not required. A richer visual perspective remains
optional later content.

## UX direction

- Keep the Director clock as the wait hotspot.
- Its focus/rollover label states both destination time and current observation
  location.
- Mark `timeCost: 1` actions with a small clock and a sentence naming the next
  time slot.
- Do not confirm ordinary clock use or free dialogue replay.
- Timed actions expose their cost before selection and use the transition panel
  afterward, without an additional confirmation click.
- Reuse the transition and narrative-cue panels for elapsed-time copy; learned
  facts then appear in the notebook.

## Initial vertical slice

The initial slice used B4 versus E4 without adding new story content:

- B4 wait: transition copy → `LauraSuspekt` → Laura knowledge → one advance →
  new day in B1.
- E4 wait: corridor transition copy → no Laura cue/effect → one advance → new
  day in E1.

This proved event selection, idempotent completion, reset behavior, and
location-dependent observation before the first genuinely time-consuming
action was introduced.

### Implemented

The 20 restored `Vent` branches now live in one declarative
`LOCATION_TRANSITION_EVENTS` registry keyed by source `SceneId`. Each entry
owns its text cue, optional special cue, and effects.

- B4 owns the `LauraSuspekt` cue and
  `laura_hid_computer_activity` effect.
- E4 owns only its corridor/new-day text and has no Laura effect.
- E1 owns the existing `ryan_bullied_marie` effect.
- `pendingTransition` stores the time-advance cause and target transition.
- One reducer gateway applies the event once, advances one interval, resets the
  loop when appropriate, and then applies target-scene entry effects.
- Source-event effects are applied before the new-day `loopState` reset. This
  prevents later loop-local effects from leaking from the previous day.

Tests cover all 20 event definitions, B4 versus E4 selection, B4 special media,
knowledge effects, new-day reset, and idempotent completion.

## Timed-action slice

`inspect_barbaras_computer` is the first explicit `timeCost: 1` action:

- the time marker appears only when the Intruder clue makes the action usable;
- hover, focus, and accessible labels name the destination time;
- the successful search cue plays before a dedicated elapsed-time panel;
- effects and the one-interval advance complete through the same reducer
  gateway as clock use;
- the ordinary B2/B3 wait event is not observed or recorded;
- locked access consumes no time;
- after `barbara_forged_grades` is known, replay consumes no time.

All current scene interactions declare `timeCost: 0 | 1`, and tests require
every timed interaction to provide an elapsed-time cue.

## Loop-local memory slice

Conversation progress now belongs to `loopState.dialogue`:

- asked choice IDs remain available for faded/repeat UI and same-day responses;
- Ryan uses his second warning clip only after being warned earlier that day;
- Barbara's request/ready/completed help state is local to the day;
- a character inconclusively accused by Jørgen refuses further questions until
  the next morning.

Ordinary time changes preserve this state. Evening-to-morning uses one
`createInitialLoopState()` boundary to reset conversation history and transition
history together. Permanent facts learned from those conversations remain in
`knowledge`. This includes Marie's earned trust, so discovering the Ryan/Laura
relationship in a later loop immediately exposes her follow-up topic. Ryan may
forget the warning while Jørgen remembers that warning alone was ineffective.

No trust score, anger scale, departure, or cross-character warning is included.
Tests cover same-day retention, new-day reset, Marie's permanent story trust,
Ryan's warning restart, the minimal accusation refusal, permanent knowledge,
and the complete Laura path.

## Observation loopback slice

The restored C2 and E2 transition text remains unchanged. Each transition now
continues with one phase 9 observation; C2 uses the recovered room still to
make the added text visibly intentional, while E2 remains text-only:

- C2 records a scraping sound behind the bookcase;
- E2 records that Laura disappeared without using a visible hallway door.

Because both observations occur during the same midday-to-afternoon transition,
they cannot be collected in one loop. Once both are permanent knowledge,
the existing C2 book hotspot offers the more purposeful **Hold øje med
bogreolen** action in a later loop. It costs the murder interval, uses the
shared pending-transition gateway, and establishes both that the passage exists
and that Laura uses it. The ordinary C2 wait event is not also applied.

This route is currently supporting evidence, not a replacement for the
canonical confession threshold. It reveals access but not motive, the necklace
connection, or the complete murder method. The original freely discoverable
book interaction remains available until the surveillance action is unlocked,
preserving the restored Director behavior.

## Phase 9 validation

- All 20 location events are closed, typed definitions with valid cues.
- Clock use and timed interactions advance at most once through the shared
  pending-transition gateway.
- Transition presentation never consumes another interval.
- Passage surveillance applies multiple effects for one interval and is
  idempotent after completion.
- NPC conversation memory survives same-day time changes and resets at the next
  morning.
- Permanent knowledge survives the same reset.
- Ordinary navigation, short dialogue, and repeated dialogue remain free.
- Ten consecutive day loops complete without a deadline state.
- Central Laura knowledge and the intro-to-epilogue golden path remain
  reachable.
- The mutually exclusive C2/E2 observations and later surveillance are covered
  as an executable multi-loop reducer test.

Phase 10 now supplies the selected-case boundary and covers this acceptance
criterion: `selectedCaseId` survives the evening-to-morning reset while a full
game reset returns to the case menu. See
[`case-model.md`](case-model.md).

## Deliberately deferred beyond phase 9

- A richer A2 fall perspective, if later narrative content needs a distinct
  observation beyond the restored Director text.
- General trust/anger scores, departures, and warnings between characters.
  The current explicit same-day accusation refusal is sufficient for Laura.
- Timed dialogue. Every current dialogue remains short and free; the field and
  transition cause should be added only with the first authored conversation
  that genuinely occupies an interval.
- `caseId`, `CaseDefinition`, case-specific transition resolution, and
  alternative murderers.
- Save migrations while IDs and future case data remain in motion.
