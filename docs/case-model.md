# Phase 10 case model

Status: foundation complete; first alternative narrative not yet authored.

## Boundary

`CaseDefinition` is the smallest current boundary between the stable Laura game
and future curated alternatives. A registered case declares:

- a stable `CaseId`;
- whether it is the default or belongs to the mystery pool;
- the murderer;
- spoiler-free menu copy.

The registry currently contains only `laura`. Existing Laura dialogue,
knowledge, transitions, interactions, confession, prevention, and ending remain
the reference implementation and are unchanged.

The first alternative must extend its definition with the concrete narrative
data it actually needs. It must explicitly define motive, method, access,
alibi, evidence, required knowledge, red herrings, confession, prevention, and
ending before it is added to the playable mystery pool. The boundary should
grow from that authored content rather than from speculative generic fields.

## Selection lifecycle

```text
main menu
  ├─ Start spil ─────> select Laura ─> intro ─> daily loops ─> ending
  └─ Mystisk case ───> select one registered curated case once
                                      │
                                      └─ same case through every day reset
```

`selectedCaseId` lives at the top level of version 2 `GameState`.
`createInitialLoopState()` cannot change it. The evening-to-morning transition
resets only loop-local observations and dialogue memory, while permanent
knowledge and the selected case survive.

`RESET_GAME` returns to the main menu and the default Laura selection. Starting
a case replaces the menu state with a clean intro state for that exact case.

## Mystery-case guard

The main menu exposes **Mystisk case** separately, as required by the product
direction. It is disabled while the mystery registry is empty. Once a complete
curated case is registered, the selector chooses from that pool when the player
starts a new mystery game. The chosen ID is stored immediately; randomness is
never repeated during a daily loop.

This prevents three failure modes:

- silently treating Laura as a “random” mystery case;
- starting unfinished alternative content;
- changing murderer or case facts when the day resets.

## Verification

The regression suite covers:

- Laura as the only registered default case;
- an empty mystery pool returning no selection;
- case start being accepted only from the menu;
- version 2 state carrying `selectedCaseId`;
- selected-case persistence across a new-day transition;
- full reset returning to the menu;
- the complete Laura golden path after menu selection.

Save persistence and migration remain out of scope because the application
still stores no state outside the current browser session.
