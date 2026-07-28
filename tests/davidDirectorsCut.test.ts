import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/app/gameState";
import {
  KNOWLEDGE_IDS,
  type GameState,
  type KnowledgeId,
} from "../src/app/types";
import {
  getAvailableDialogueChoices,
  executeDialogueChoice,
} from "../src/game/dialogueEngine";
import {
  DAVID_CORE_CONCLUSIONS,
  hasAllDavidConclusions,
} from "../src/game/davidCase";
import { learnKnowledge } from "../src/game/knowledgeGraph";
import {
  getSceneInteraction,
  getSceneInteractions,
} from "../src/game/sceneInteractions";
import { reduceGameState } from "../src/game/stateMachine";
import { getLocationTransitionEvent } from "../src/game/transitionEvents";
import {
  DIRECTORS_CUT_ASSET_MANIFEST,
  hasDirectorsCutAsset,
} from "../src/media/directorsCutAssetManifest";

function davidState(overrides: Partial<GameState> = {}): GameState {
  let state = reduceGameState(createInitialGameState(), {
    type: "START_CASE",
    caseId: "david",
  });
  state = reduceGameState(state, { type: "SKIP_INTRO" });
  return { ...state, ...overrides };
}

describe("Director's Cut: David", () => {
  it("completes the reducer-level two-day golden path", () => {
    let state = davidState({ location: "E" });
    const wait = (): void => {
      state = reduceGameState(state, { type: "WAIT" });
      state = reduceGameState(state, { type: "COMPLETE_TRANSITION" });
    };

    wait();
    expect(state.timeSlot).toBe(2);
    expect(state.knowledge.david_picked_up_necklace).toBe(true);

    state = reduceGameState(state, {
      type: "MOVE_TO_LOCATION",
      location: "D",
    });
    state = reduceGameState(state, {
      type: "PERFORM_INTERACTION",
      id: "inspect_girlfriend_letter",
    });
    state = reduceGameState(state, {
      type: "MOVE_TO_LOCATION",
      location: "B",
    });
    state = reduceGameState(state, {
      type: "START_DIALOGUE",
      person: "Ryan",
    });
    state = reduceGameState(state, {
      type: "COMPLETE_DIALOGUE_CHOICE",
      person: "Ryan",
      topic: "about_sarah",
      completion: "skipped",
    });
    state = reduceGameState(state, { type: "CLOSE_DIALOGUE" });
    expect(state.knowledge.david_motive_conclusion).toBe(true);

    state = reduceGameState(state, {
      type: "MOVE_TO_LOCATION",
      location: "C",
    });
    wait();
    expect(state.timeSlot).toBe(3);
    expect(state.knowledge.david_opportunity_conclusion).toBe(true);

    state = reduceGameState(state, {
      type: "MOVE_TO_LOCATION",
      location: "A",
    });
    state = reduceGameState(state, {
      type: "PERFORM_INTERACTION",
      id: "inspect_ryans_body_and_necklace",
    });
    expect(
      state.knowledge.david_necklace_possession_conclusion,
    ).toBe(true);

    state = reduceGameState(state, {
      type: "MOVE_TO_LOCATION",
      location: "C",
    });
    state = reduceGameState(state, {
      type: "START_DIALOGUE",
      person: "David",
    });
    state = reduceGameState(state, {
      type: "COMPLETE_DIALOGUE_CHOICE",
      person: "David",
      topic: "accuse",
      completion: "skipped",
    });
    state = reduceGameState(state, { type: "CLOSE_DIALOGUE" });
    expect(state.knowledge.david_confessed).toBe(true);
    expect(state.phase).toBe("exploration");

    wait();
    wait();
    expect(state).toMatchObject({
      loop: 2,
      timeSlot: 1,
      phase: "reconstruction",
    });
    state = reduceGameState(state, {
      type: "COMPLETE_RECONSTRUCTION",
    });
    wait();
    state = reduceGameState(state, {
      type: "PERFORM_INTERACTION",
      id: "prevent_david_murder",
    });
    expect(state).toMatchObject({
      loop: 2,
      timeSlot: 2,
      phase: "ending",
      knowledge: { ryan_was_saved: true },
    });
  });

  it.each([
    [
      ["david_picked_up_necklace"],
      ["necklace_found_in_ryans_hand"],
    ],
    [
      ["necklace_found_in_ryans_hand"],
      ["david_picked_up_necklace"],
    ],
  ] as const)(
    "derives possession regardless of discovery order",
    (first, second) => {
      let state = learnKnowledge(davidState(), first);
      expect(
        state.knowledge.david_necklace_possession_conclusion,
      ).toBe(false);
      state = learnKnowledge(state, second);
      expect(
        state.knowledge.david_necklace_possession_conclusion,
      ).toBe(true);
    },
  );

  it("derives all three conclusions declaratively and never blames Laura from ownership", () => {
    let state = learnKnowledge(davidState(), [
      "laura_owns_polar_bear_necklace",
      "killer_dropped_necklace",
    ]);
    expect(state.knowledge.necklace_connects_laura_to_scene).toBe(
      false,
    );
    state = learnKnowledge(state, [
      "sarah_left_david_for_ryan",
      "david_picked_up_necklace",
      "necklace_found_in_ryans_hand",
      "david_followed_ryan",
    ]);
    expect(hasAllDavidConclusions(state)).toBe(true);
    expect(
      DAVID_CORE_CONCLUSIONS.every((id) => state.knowledge[id]),
    ).toBe(true);
    expect(state.caseProgress.pendingInsights).toEqual(
      DAVID_CORE_CONCLUSIONS,
    );
  });

  it("uses case-specific E1/C2 facts and a neutral body observation", () => {
    expect(
      getLocationTransitionEvent("E1", "david").effects,
    ).toEqual([
      { type: "LEARN", id: "laura_dropped_necklace" },
      { type: "LEARN", id: "david_picked_up_necklace" },
    ]);
    expect(
      getLocationTransitionEvent("C2", "david").effects,
    ).toEqual([{ type: "LEARN", id: "david_followed_ryan" }]);
    expect(
      getSceneInteraction(
        "inspect_ryans_body_and_necklace",
        davidState(),
      ).effects,
    ).toEqual([
      { type: "LEARN", id: "necklace_found_in_ryans_hand" },
    ]);
    expect(
      getLocationTransitionEvent("E1", "laura").effects,
    ).toEqual([{ type: "LEARN", id: "ryan_bullied_marie" }]);
  });

  it("counts wrong and premature accusations without a softlock", () => {
    const afterMurder = davidState({ timeSlot: 3 });
    const wrong = executeDialogueChoice(
      afterMurder,
      "Laura",
      "accuse",
    ).state;
    expect(wrong.caseProgress.statistics).toMatchObject({
      confrontations: 1,
      wrongAccusations: 1,
      prematureAccusations: 0,
    });
    expect(
      getAvailableDialogueChoices(wrong, "Laura").length,
    ).toBeGreaterThan(0);

    const premature = executeDialogueChoice(
      wrong,
      "David",
      "accuse",
    ).state;
    expect(premature.caseProgress.statistics).toMatchObject({
      confrontations: 2,
      wrongAccusations: 1,
      prematureAccusations: 1,
    });
    expect(premature.knowledge.david_confessed).toBe(false);
    expect(
      premature.loopState.dialogue.refusesFurtherDialogue,
    ).toEqual([]);
  });

  it("corrects the Laura necklace fallacy and points back to possession", () => {
    const suspicion = learnKnowledge(davidState({ timeSlot: 3 }), [
      "ryan_was_murdered",
      "necklace_found_in_ryans_hand",
      "laura_owns_polar_bear_necklace",
    ]);
    expect(suspicion.caseProgress.currentLead).toBe(
      "Se nærmere på, hvad der sker i gangen før middag.",
    );
    const accusation = executeDialogueChoice(
      suspicion,
      "Laura",
      "accuse",
    );
    expect(accusation.choice?.answerCue).toMatchObject({
      kind: "text-sequence",
      placeholderAssetId: "dc-david-laura-wrong-accusation",
    });
    const answerCue = accusation.choice?.answerCue;
    expect(
      answerCue?.kind === "text-sequence"
        ? answerCue.cards.join(" ")
        : "",
    ).toContain(
      "ejerskab er ikke det samme som besiddelse på mordtidspunktet",
    );
    expect(accusation.state.caseProgress.currentLead).toBe(
      "Se nærmere på, hvad der sker i gangen før middag.",
    );
    expect(accusation.state.knowledge.necklace_connects_laura_to_scene).toBe(
      false,
    );
  });

  it("confesses only with all conclusions, applies effects on skip, and does not win", () => {
    const documented = learnKnowledge(davidState({ timeSlot: 3 }), [
      "sarah_left_david_for_ryan",
      "david_picked_up_necklace",
      "necklace_found_in_ryans_hand",
      "david_followed_ryan",
    ]);
    const result = executeDialogueChoice(
      documented,
      "David",
      "accuse",
      "skipped",
    );
    expect(result.choice?.accusationOutcome).toBe("conclusive");
    expect(result.state.knowledge).toMatchObject({
      david_confessed: true,
      secret_passage_exists: true,
      david_murder_method_known: true,
      david_prevention_plan: true,
      ryan_was_saved: false,
    });
    expect(result.state.phase).toBe("exploration");
  });

  it("starts the rereadable reconstruction next morning", () => {
    let state = learnKnowledge(davidState({ timeSlot: 4 }), [
      "david_confessed",
      "david_prevention_plan",
    ]);
    state = reduceGameState(state, { type: "WAIT" });
    state = reduceGameState(state, { type: "COMPLETE_TRANSITION" });
    expect(state.phase).toBe("reconstruction");
    expect(state.caseProgress.reconstructionAvailable).toBe(true);
    state = reduceGameState(state, {
      type: "COMPLETE_RECONSTRUCTION",
    });
    expect(state).toMatchObject({
      phase: "exploration",
      caseProgress: {
        reconstructionAvailable: true,
        reconstructionCompleted: true,
        currentLead: "Vær i læsesalen ved middag og stop David.",
      },
    });
    expect(state.knowledge.david_reconstruction_recorded).toBe(true);
  });

  it("offers prevention only in David C2 and preserves the plan if missed", () => {
    const ready = learnKnowledge(
      davidState({ location: "C", timeSlot: 2 }),
      ["david_prevention_plan", "david_reconstruction_recorded"],
    );
    expect(
      getSceneInteractions(ready, "C2", "manual").map(({ id }) => id),
    ).toContain("prevent_david_murder");
    expect(
      getSceneInteractions(ready, "C1", "manual").map(({ id }) => id),
    ).not.toContain("prevent_david_murder");
    expect(
      getSceneInteractions(
        { ...ready, selectedCaseId: "laura" },
        "C2",
        "manual",
      ).map(({ id }) => id),
    ).not.toContain("prevent_david_murder");

    let missed = reduceGameState(ready, { type: "WAIT" });
    missed = reduceGameState(missed, { type: "COMPLETE_TRANSITION" });
    expect(missed.knowledge.david_prevention_plan).toBe(true);
    expect(missed.knowledge.ryan_was_murdered).toBe(true);

    const won = reduceGameState(ready, {
      type: "PERFORM_INTERACTION",
      id: "prevent_david_murder",
    });
    expect(won.phase).toBe("ending");
    expect(won.knowledge.ryan_was_saved).toBe(true);
  });

  it("resets all Director's Cut knowledge and statistics for a new game", () => {
    const dirty = {
      ...learnKnowledge(davidState(), KNOWLEDGE_IDS),
      caseProgress: {
        ...davidState().caseProgress,
        statistics: {
          confrontations: 4,
          wrongAccusations: 2,
          prematureAccusations: 1,
        },
      },
    };
    const reset = reduceGameState(dirty, { type: "RESET_GAME" });
    expect(Object.values(reset.knowledge).every((known) => !known)).toBe(
      true,
    );
    expect(reset.caseProgress.statistics).toEqual({
      confrontations: 0,
      wrongAccusations: 0,
      prematureAccusations: 0,
    });
  });

  it("keeps every placeholder traceable to the machine-readable manifest", () => {
    expect(DIRECTORS_CUT_ASSET_MANIFEST.length).toBeGreaterThanOrEqual(
      12,
    );
    const placeholderIds = new Set<string>();
    for (const timeSlot of [1, 2, 3] as const) {
      const known = learnKnowledge(davidState({ timeSlot }), [
        "ryan_has_girlfriend_sarah",
        "necklace_found_in_ryans_hand",
        "david_followed_ryan",
        "sarah_left_david_for_ryan",
        "david_picked_up_necklace",
      ] as KnowledgeId[]);
      for (const person of [
        "Barbara",
        "David",
        "Laura",
        "Marie",
        "Ryan",
      ] as const) {
        for (const choice of getAvailableDialogueChoices(known, person)) {
          for (const cue of [choice.questionCue, choice.answerCue]) {
            if (
              cue &&
              "placeholderAssetId" in cue &&
              cue.placeholderAssetId
            ) {
              placeholderIds.add(cue.placeholderAssetId);
            }
          }
        }
      }
    }
    for (const id of placeholderIds) {
      expect(hasDirectorsCutAsset(id)).toBe(true);
    }
  });
});
