import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/app/gameState";
import {
  KNOWLEDGE_IDS,
  type GameState,
  type KnowledgeId,
  type LocationId,
} from "../src/app/types";
import {
  BARBARA_CORE_CONCLUSIONS,
  hasAllBarbaraConclusions,
} from "../src/game/barbaraCase";
import { calculateCaseScore } from "../src/game/caseDefinitions";
import {
  executeDialogueChoice,
  getAvailableDialogueChoices,
} from "../src/game/dialogueEngine";
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

function barbaraState(overrides: Partial<GameState> = {}): GameState {
  let state = reduceGameState(createInitialGameState(), {
    type: "START_CASE",
    caseId: "barbara",
  });
  state = reduceGameState(state, { type: "SKIP_INTRO" });
  return { ...state, ...overrides };
}

describe("Director's Cut: Barbara", () => {
  it("completes the reducer-level three-day golden path", () => {
    let state = barbaraState();
    const move = (location: LocationId): void => {
      state = reduceGameState(state, {
        type: "MOVE_TO_LOCATION",
        location,
      });
    };
    const wait = (): void => {
      state = reduceGameState(state, { type: "WAIT" });
      state = reduceGameState(state, { type: "COMPLETE_TRANSITION" });
    };
    const interact = (
      id:
        | "eavesdrop_barbara_and_ryan"
        | "inspect_barbaras_computer"
        | "inspect_barbara_building_plans"
        | "compare_barbara_timestamps"
        | "inspect_ryans_body_and_necklace"
        | "prevent_barbara_murder",
    ): void => {
      state = reduceGameState(state, {
        type: "PERFORM_INTERACTION",
        id,
      });
      if (state.pendingTransition) {
        state = reduceGameState(state, {
          type: "COMPLETE_TRANSITION",
        });
      }
    };
    const talk = (
      person: "Barbara" | "David" | "Laura",
      topic:
        | "alibi"
        | "accuse"
        | "ask_barbara_for_help"
        | "barbara_and_computers"
        | "laura_necklace_bag",
    ): void => {
      state = reduceGameState(state, {
        type: "START_DIALOGUE",
        person,
      });
      state = reduceGameState(state, {
        type: "COMPLETE_DIALOGUE_CHOICE",
        person,
        topic,
        completion: "skipped",
      });
      state = reduceGameState(state, { type: "CLOSE_DIALOGUE" });
    };

    move("B");
    expect(state.knowledge.barbara_is_computer_expert).toBe(true);
    move("A");
    wait();
    expect(state.knowledge.laura_put_necklace_in_bag).toBe(true);

    move("E");
    talk("Laura", "laura_necklace_bag");
    move("B");
    interact("eavesdrop_barbara_and_ryan");
    wait();
    expect(state.knowledge).toMatchObject({
      ryan_was_murdered: true,
      barbara_left_with_ryan: true,
      barbara_blackmailed_by_ryan: true,
    });

    move("A");
    interact("inspect_ryans_body_and_necklace");
    move("D");
    talk("Barbara", "alibi");
    wait();
    move("B");
    wait();
    expect(state).toMatchObject({ loop: 2, timeSlot: 1 });
    expect(state.knowledge.laura_hid_computer_activity).toBe(true);

    move("D");
    talk("David", "barbara_and_computers");
    move("B");
    wait();
    interact("inspect_barbaras_computer");
    expect(state.timeSlot).toBe(3);
    interact("inspect_barbara_building_plans");

    move("D");
    talk("Barbara", "ask_barbara_for_help");
    move("B");
    interact("compare_barbara_timestamps");
    expect(hasAllBarbaraConclusions(state)).toBe(true);

    move("D");
    talk("Barbara", "accuse");
    expect(state.knowledge).toMatchObject({
      barbara_confessed: true,
      barbara_murder_method_known: true,
      barbara_prevention_plan: true,
      ryan_was_saved: false,
    });
    expect(state.phase).toBe("exploration");

    wait();
    wait();
    expect(state).toMatchObject({
      loop: 3,
      timeSlot: 1,
      phase: "reconstruction",
    });
    state = reduceGameState(state, {
      type: "COMPLETE_RECONSTRUCTION",
    });
    move("C");
    wait();
    interact("prevent_barbara_murder");
    expect(state).toMatchObject({
      loop: 3,
      timeSlot: 2,
      phase: "ending",
      knowledge: {
        ryan_was_saved: true,
        barbara_reconstruction_recorded: true,
      },
    });
  });

  it.each([
    [
      [
        "laura_put_necklace_in_bag",
        "necklace_missing_from_laura_bag",
        "barbara_had_access_to_laura_bag",
        "barbara_saved_necklace_image_before_murder",
      ],
      [
        "necklace_found_in_ryans_hand",
        "barbara_presented_image_as_new",
        "barbara_timestamps_compared",
      ],
    ],
    [
      [
        "barbara_presented_image_as_new",
        "barbara_timestamps_compared",
        "necklace_found_in_ryans_hand",
      ],
      [
        "barbara_had_access_to_laura_bag",
        "necklace_missing_from_laura_bag",
        "laura_put_necklace_in_bag",
        "barbara_saved_necklace_image_before_murder",
      ],
    ],
  ] as const)(
    "derives staging regardless of evidence order",
    (first, second) => {
      let state = learnKnowledge(barbaraState(), first);
      expect(state.knowledge.barbara_staging_conclusion).toBe(false);
      state = learnKnowledge(state, second);
      expect(state.knowledge.barbara_staging_conclusion).toBe(true);
    },
  );

  it("derives four declarative conclusions without treating Laura's health as guilt", () => {
    const state = learnKnowledge(barbaraState(), [
      "barbara_forged_grades",
      "barbara_blackmailed_by_ryan",
      "barbara_left_with_ryan",
      "barbara_alibi_gap",
      "barbara_opened_plans_before_murder",
      "building_plans_show_passage",
      "laura_put_necklace_in_bag",
      "necklace_missing_from_laura_bag",
      "barbara_had_access_to_laura_bag",
      "barbara_saved_necklace_image_before_murder",
      "necklace_found_in_ryans_hand",
      "barbara_presented_image_as_new",
      "barbara_timestamps_compared",
      "laura_was_in_institution",
    ]);
    expect(hasAllBarbaraConclusions(state)).toBe(true);
    expect(
      BARBARA_CORE_CONCLUSIONS.every((id) => state.knowledge[id]),
    ).toBe(true);
    expect(state.knowledge.necklace_connects_laura_to_scene).toBe(false);
  });

  it("counts accusations correctly, never softlocks, and requires all four conclusions", () => {
    const afterMurder = barbaraState({ timeSlot: 3 });
    const wrongLaura = executeDialogueChoice(
      afterMurder,
      "Laura",
      "accuse",
    ).state;
    const wrongDavid = executeDialogueChoice(
      wrongLaura,
      "David",
      "accuse",
    ).state;
    const premature = executeDialogueChoice(
      wrongDavid,
      "Barbara",
      "accuse",
    ).state;
    expect(premature.caseProgress.statistics).toEqual({
      confrontations: 3,
      wrongAccusations: 2,
      prematureAccusations: 1,
    });
    expect(premature.loopState.dialogue.refusesFurtherDialogue).toEqual(
      [],
    );
    expect(premature.knowledge.barbara_confessed).toBe(false);

    const documented = learnKnowledge(premature, [
      "barbara_forged_grades",
      "barbara_blackmailed_by_ryan",
      "barbara_left_with_ryan",
      "barbara_alibi_gap",
      "barbara_opened_plans_before_murder",
      "building_plans_show_passage",
      "laura_put_necklace_in_bag",
      "necklace_missing_from_laura_bag",
      "barbara_had_access_to_laura_bag",
      "barbara_saved_necklace_image_before_murder",
      "necklace_found_in_ryans_hand",
      "barbara_presented_image_as_new",
      "barbara_timestamps_compared",
    ]);
    const confession = executeDialogueChoice(
      documented,
      "Barbara",
      "accuse",
      "skipped",
    );
    expect(confession.choice?.accusationOutcome).toBe("conclusive");
    expect(confession.state.knowledge.barbara_confessed).toBe(true);
    expect(confession.state.knowledge.ryan_was_saved).toBe(false);
  });

  it("isolates Barbara, David and Laura case-specific scenes and actions", () => {
    expect(getLocationTransitionEvent("E1", "barbara").effects).toEqual(
      [{ type: "LEARN", id: "ryan_bullied_marie" }],
    );
    expect(getLocationTransitionEvent("C2", "barbara").effects).toEqual(
      [],
    );
    expect(
      getSceneInteraction(
        "inspect_ryans_body_and_necklace",
        barbaraState(),
      ).effects,
    ).toEqual([
      { type: "LEARN", id: "necklace_found_in_ryans_hand" },
    ]);

    const ready = learnKnowledge(
      barbaraState({ location: "C", timeSlot: 2 }),
      ["barbara_prevention_plan", "barbara_reconstruction_recorded"],
    );
    const barbaraActions = getSceneInteractions(
      ready,
      "C2",
      "manual",
    ).map(({ id }) => id);
    expect(barbaraActions).toContain("prevent_barbara_murder");
    expect(barbaraActions).not.toContain("prevent_david_murder");
    expect(barbaraActions).not.toContain("watch_secret_passage");

    const davidActions = getSceneInteractions(
      { ...ready, selectedCaseId: "david" },
      "C2",
      "manual",
    ).map(({ id }) => id);
    expect(davidActions).not.toContain("prevent_barbara_murder");
    expect(
      getAvailableDialogueChoices(
        learnKnowledge(barbaraState(), KNOWLEDGE_IDS),
        "Ryan",
      ).some(({ topic }) => topic === "about_sarah"),
    ).toBe(false);

    const foreignAction = reduceGameState(ready, {
      type: "PERFORM_INTERACTION",
      id: "prevent_david_murder",
    });
    expect(foreignAction).toBe(ready);
  });

  it("preserves knowledge and a missed prevention plan across loops", () => {
    let state = learnKnowledge(
      barbaraState({ location: "C", timeSlot: 2 }),
      [
        "barbara_prevention_plan",
        "barbara_reconstruction_recorded",
        "barbara_motive_conclusion",
      ],
    );
    state = reduceGameState(state, { type: "WAIT" });
    state = reduceGameState(state, { type: "COMPLETE_TRANSITION" });
    expect(state.knowledge).toMatchObject({
      barbara_prevention_plan: true,
      barbara_reconstruction_recorded: true,
      barbara_motive_conclusion: true,
      ryan_was_murdered: true,
    });
    state = { ...state, timeSlot: 4 };
    state = reduceGameState(state, { type: "WAIT" });
    state = reduceGameState(state, { type: "COMPLETE_TRANSITION" });
    expect(state.loop).toBe(2);
    expect(state.knowledge.barbara_prevention_plan).toBe(true);
    expect(state.loopState.dialogue.askedChoices).toEqual([]);
  });

  it("calculates Barbara's configured score deterministically", () => {
    const state = learnKnowledge(
      {
        ...barbaraState(),
        loop: 4,
        caseProgress: {
          ...barbaraState().caseProgress,
          statistics: {
            confrontations: 2,
            wrongAccusations: 1,
            prematureAccusations: 1,
          },
        },
      },
      ["marie_saw_barbara_by_bag"],
    );
    expect(calculateCaseScore(state)).toBe(775);
  });

  it("keeps every Barbara placeholder traceable to the central manifest", () => {
    const known = learnKnowledge(barbaraState({ timeSlot: 3 }), [
      ...KNOWLEDGE_IDS,
    ] as KnowledgeId[]);
    const placeholderIds = new Set<string>();
    for (const person of [
      "Barbara",
      "David",
      "Laura",
      "Marie",
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
    for (const id of placeholderIds) {
      expect(hasDirectorsCutAsset(id)).toBe(true);
    }
    expect(
      DIRECTORS_CUT_ASSET_MANIFEST.filter(
        ({ caseId }) => caseId === "barbara",
      ).length,
    ).toBeGreaterThanOrEqual(15);
  });
});
