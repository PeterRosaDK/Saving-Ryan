import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/app/gameState";
import {
  KNOWLEDGE_IDS,
  type GameState,
  type KnowledgeId,
  type LocationId,
} from "../src/app/types";
import {
  DEFAULT_CASE_ID,
  getDirectorsCutCaseOverride,
  getMysteryCaseIds,
  selectDirectorsCutCase,
} from "../src/game/caseDefinitions";
import {
  executeDialogueChoice,
  getAvailableDialogueChoices,
} from "../src/game/dialogueEngine";
import { learnKnowledge } from "../src/game/knowledgeGraph";
import {
  MARIE_CORE_CONCLUSIONS,
  hasAllMarieConclusions,
} from "../src/game/marieCase";
import {
  canPerformSceneInteraction,
  getSceneInteraction,
  getSceneInteractions,
} from "../src/game/sceneInteractions";
import { reduceGameState } from "../src/game/stateMachine";
import { getLocationTransitionEvent } from "../src/game/transitionEvents";
import {
  DIRECTORS_CUT_ASSET_MANIFEST,
  hasDirectorsCutAsset,
} from "../src/media/directorsCutAssetManifest";
import { renderKnowledge } from "../src/ui/App";

function marieState(overrides: Partial<GameState> = {}): GameState {
  let state = reduceGameState(createInitialGameState(), {
    type: "START_CASE",
    caseId: "marie",
  });
  state = reduceGameState(state, { type: "SKIP_INTRO" });
  return { ...state, ...overrides };
}

const MARIE_FACTS = [
  "marie_wrote_report",
  "ryan_threatened_remove_marie_credit",
  "ryan_threatened_laura",
  "marie_left_group_before_scream",
  "marie_claimed_no_absence",
  "marie_discovered_passage",
  "secret_passage_exists",
  "marie_fragment_in_ryan_hand",
  "marie_fragment_has_edits",
  "marie_torn_page_in_folder",
] as const satisfies readonly KnowledgeId[];

describe("Director's Cut: Marie", () => {
  it("registers Marie for uniform selection, supports QA, and never overrides Original", () => {
    expect(getMysteryCaseIds()).toEqual([
      "david",
      "barbara",
      "marie",
      "jorgen",
    ]);
    expect(
      selectDirectorsCutCase({
        requestedCaseId: getDirectorsCutCaseOverride(
          "?dcCase=marie",
        ),
        randomValue: 0,
      }),
    ).toEqual({
      caseId: "marie",
      source: "qa",
      requestedCaseId: "marie",
    });
    expect(selectDirectorsCutCase({ randomValue: 0 }).caseId).toBe(
      "david",
    );
    expect(selectDirectorsCutCase({ randomValue: 0.3 }).caseId).toBe(
      "barbara",
    );
    expect(selectDirectorsCutCase({ randomValue: 0.6 }).caseId).toBe(
      "marie",
    );
    const original = reduceGameState(createInitialGameState(), {
      type: "START_CASE",
      caseId: DEFAULT_CASE_ID,
    });
    expect(original.selectedCaseId).toBe("laura");
  });

  it("completes the reducer-level two-day golden path", () => {
    let state = marieState({ location: "E" });
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
        | "inspect_marie_folder"
        | "inspect_ryans_body_and_necklace"
        | "inspect_marie_torn_page"
        | "inspect_marie_passage_trace"
        | "secure_marie_work"
        | "prevent_marie_murder",
    ): void => {
      state = reduceGameState(state, {
        type: "PERFORM_INTERACTION",
        id,
      });
    };
    const talk = (
      person: "Laura" | "Marie",
      topic:
        | "marie_threat"
        | "alibi"
        | "marie_location"
        | "accuse",
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

    wait();
    expect(state.knowledge).toMatchObject({
      ryan_claimed_marie_work: true,
      ryan_threatened_remove_marie_credit: true,
    });
    move("D");
    interact("inspect_marie_folder");
    talk("Marie", "marie_threat");
    expect(state.knowledge.marie_motive_conclusion).toBe(true);

    wait();
    expect(state.knowledge).toMatchObject({
      ryan_was_murdered: true,
      marie_left_group_before_scream: true,
    });
    talk("Marie", "alibi");
    expect(state.knowledge.marie_alibi_conclusion).toBe(true);

    move("A");
    interact("inspect_ryans_body_and_necklace");
    talk("Laura", "marie_location");
    move("D");
    interact("inspect_marie_torn_page");
    expect(state.knowledge.marie_physical_conclusion).toBe(true);
    move("C");
    interact("inspect_marie_passage_trace");
    expect(hasAllMarieConclusions(state)).toBe(true);

    move("D");
    talk("Marie", "accuse");
    expect(state.knowledge).toMatchObject({
      marie_confessed: true,
      marie_murder_method_known: true,
      marie_prevention_plan: true,
      ryan_was_saved: false,
    });

    wait();
    wait();
    expect(state).toMatchObject({
      loop: 2,
      timeSlot: 1,
      phase: "reconstruction",
      selectedCaseId: "marie",
    });
    state = reduceGameState(state, {
      type: "COMPLETE_RECONSTRUCTION",
    });
    interact("secure_marie_work");
    expect(state.knowledge.marie_work_secured).toBe(true);
    move("C");
    wait();
    interact("prevent_marie_murder");
    expect(state).toMatchObject({
      loop: 2,
      timeSlot: 2,
      phase: "ending",
      selectedCaseId: "marie",
      knowledge: {
        ryan_was_saved: true,
        marie_reconstruction_recorded: true,
      },
    });
  });

  it.each([
    [
      [
        "marie_wrote_report",
        "ryan_threatened_remove_marie_credit",
      ],
      ["ryan_threatened_laura"],
      "marie_motive_conclusion",
    ],
    [
      ["marie_claimed_no_absence"],
      ["marie_left_group_before_scream"],
      "marie_alibi_conclusion",
    ],
    [
      ["secret_passage_exists"],
      ["marie_discovered_passage"],
      "marie_passage_conclusion",
    ],
    [
      [
        "marie_torn_page_in_folder",
        "marie_fragment_has_edits",
      ],
      ["marie_fragment_in_ryan_hand"],
      "marie_physical_conclusion",
    ],
  ] as const)(
    "derives %s facts in either order",
    (first, second, conclusion) => {
      let state = learnKnowledge(marieState(), first);
      expect(state.knowledge[conclusion]).toBe(false);
      state = learnKnowledge(state, second);
      expect(state.knowledge[conclusion]).toBe(true);

      let reversed = learnKnowledge(marieState(), second);
      expect(reversed.knowledge[conclusion]).toBe(false);
      reversed = learnKnowledge(reversed, first);
      expect(reversed.knowledge[conclusion]).toBe(true);
    },
  );

  it("keeps isolated evidence neutral until each full conclusion is supported", () => {
    const fragment = learnKnowledge(marieState(), [
      "marie_fragment_in_ryan_hand",
      "marie_fragment_has_edits",
    ]);
    expect(fragment.knowledge.marie_physical_conclusion).toBe(false);
    expect(fragment.knowledge.marie_motive_conclusion).toBe(false);

    const motivePart = learnKnowledge(marieState(), [
      "marie_wrote_report",
      "ryan_threatened_remove_marie_credit",
    ]);
    expect(motivePart.knowledge.marie_motive_conclusion).toBe(false);
    expect(hasAllMarieConclusions(motivePart)).toBe(false);

    const passage = learnKnowledge(marieState(), [
      "marie_discovered_passage",
      "secret_passage_exists",
    ]);
    expect(passage.knowledge.marie_passage_conclusion).toBe(true);
    expect(hasAllMarieConclusions(passage)).toBe(false);
  });

  it("counts early and wrong accusations, gives a useful lead, and never softlocks", () => {
    const afterMurder = learnKnowledge(
      marieState({ timeSlot: 3 }),
      [
        "marie_wrote_report",
        "ryan_threatened_remove_marie_credit",
        "ryan_threatened_laura",
      ],
    );
    const wrong = executeDialogueChoice(
      afterMurder,
      "David",
      "accuse",
      "skipped",
    ).state;
    const premature = executeDialogueChoice(
      wrong,
      "Marie",
      "accuse",
      "skipped",
    );
    expect(premature.state.caseProgress.statistics).toEqual({
      confrontations: 2,
      wrongAccusations: 1,
      prematureAccusations: 1,
    });
    expect(premature.choice?.answerCue).toMatchObject({
      kind: "text",
      text: "Marie: Du ved ikke engang, hvor jeg var.",
    });
    expect(premature.state.caseProgress.currentLead).toBe(
      "Undersøg, hvor Marie befandt sig lige før skriget.",
    );
    expect(
      premature.state.loopState.dialogue.refusesFurtherDialogue,
    ).toEqual([]);
    expect(
      getAvailableDialogueChoices(premature.state, "Marie").length,
    ).toBeGreaterThan(0);
  });

  it("opens confession only with A-D and applies identical effects on end or skip", () => {
    const incomplete = learnKnowledge(
      marieState({ timeSlot: 3 }),
      MARIE_FACTS.slice(0, -1),
    );
    expect(
      executeDialogueChoice(incomplete, "Marie", "accuse").choice
        ?.accusationOutcome,
    ).toBe("premature");

    const documented = learnKnowledge(
      marieState({ timeSlot: 3 }),
      MARIE_FACTS,
    );
    const ended = executeDialogueChoice(
      documented,
      "Marie",
      "accuse",
      "ended",
    ).state;
    const skipped = executeDialogueChoice(
      documented,
      "Marie",
      "accuse",
      "skipped",
    ).state;
    for (const id of [
      "marie_confessed",
      "secret_passage_exists",
      "marie_murder_method_known",
      "marie_prevention_plan",
    ] as const) {
      expect(ended.knowledge[id]).toBe(true);
      expect(skipped.knowledge[id]).toBe(true);
    }
    expect(skipped.phase).toBe("exploration");
  });

  it("preserves Marie through loops and resets every case-local value for a new game", () => {
    let looped = learnKnowledge(
      marieState({ timeSlot: 4 }),
      MARIE_FACTS,
    );
    looped = {
      ...looped,
      caseProgress: {
        ...looped.caseProgress,
        statistics: {
          confrontations: 3,
          wrongAccusations: 1,
          prematureAccusations: 1,
        },
      },
    };
    looped = reduceGameState(looped, { type: "WAIT" });
    looped = reduceGameState(looped, {
      type: "COMPLETE_TRANSITION",
    });
    expect(looped).toMatchObject({
      selectedCaseId: "marie",
      loop: 2,
    });
    expect(looped.knowledge.marie_motive_conclusion).toBe(true);

    const reset = reduceGameState(looped, { type: "RESET_GAME" });
    expect(Object.values(reset.knowledge).every((known) => !known)).toBe(
      true,
    );
    expect(reset.caseProgress.statistics).toEqual({
      confrontations: 0,
      wrongAccusations: 0,
      prematureAccusations: 0,
    });
    expect(reset.caseProgress.reconstructionCompleted).toBe(false);
  });

  it("requires both preparation steps and rejects foreign prevention actions", () => {
    const reconstructed = learnKnowledge(
      marieState({ location: "C", timeSlot: 2 }),
      ["marie_prevention_plan", "marie_reconstruction_recorded"],
    );
    const prematurePrevention = getSceneInteractions(
      reconstructed,
      "C2",
      "manual",
    ).find(({ id }) => id === "prevent_marie_murder");
    expect(prematurePrevention).toBeDefined();
    expect(
      canPerformSceneInteraction(
        reconstructed,
        prematurePrevention!,
      ),
    ).toBe(false);

    const ready = learnKnowledge(reconstructed, [
      "marie_work_secured",
    ]);
    const readyPrevention = getSceneInteractions(
      ready,
      "C2",
      "manual",
    ).find(({ id }) => id === "prevent_marie_murder");
    expect(
      canPerformSceneInteraction(ready, readyPrevention!),
    ).toBe(true);
    expect(
      reduceGameState(reconstructed, {
        type: "PERFORM_INTERACTION",
        id: "prevent_marie_murder",
      }),
    ).toBe(reconstructed);
    expect(
      getSceneInteractions(
        { ...ready, selectedCaseId: "david" },
        "C2",
        "manual",
      ).map(({ id }) => id),
    ).not.toContain("prevent_marie_murder");
  });

  it("uses Marie-specific legacy geography without changing Laura, David or Barbara", () => {
    expect(
      getLocationTransitionEvent("D2", "marie").effects,
    ).toEqual([
      { type: "LEARN", id: "marie_left_group_before_scream" },
    ]);
    expect(
      getLocationTransitionEvent("E1", "marie").effects,
    ).toContainEqual({
      type: "LEARN",
      id: "ryan_threatened_remove_marie_credit",
    });
    expect(
      getLocationTransitionEvent("E1", "laura").effects,
    ).toEqual([{ type: "LEARN", id: "ryan_bullied_marie" }]);
    expect(
      getSceneInteraction(
        "inspect_ryans_body_and_necklace",
        marieState(),
      ).effects,
    ).toEqual([
      { type: "LEARN", id: "marie_fragment_in_ryan_hand" },
      { type: "LEARN", id: "marie_fragment_has_edits" },
    ]);
  });

  it("keeps every Marie placeholder machine-readable and all manifest ids unique", () => {
    const ids = DIRECTORS_CUT_ASSET_MANIFEST.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
    const marieAssets = DIRECTORS_CUT_ASSET_MANIFEST.filter(
      ({ caseId }) => caseId === "marie",
    );
    expect(marieAssets.length).toBeGreaterThanOrEqual(16);
    expect(
      marieAssets.every(
        (asset) =>
          asset.status === "placeholder" &&
          asset.exactContent.length > 0 &&
          asset.before.length > 0 &&
          asset.after.length > 0,
      ),
    ).toBe(true);

    const known = learnKnowledge(
      marieState({ timeSlot: 3 }),
      KNOWLEDGE_IDS,
    );
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
            expect(hasDirectorsCutAsset(cue.placeholderAssetId)).toBe(
              true,
            );
          }
        }
      }
    }
  });

  it("keeps all declared knowledge ids initialized", () => {
    const state = marieState();
    expect(Object.keys(state.knowledge)).toEqual([...KNOWLEDGE_IDS]);
    expect(
      MARIE_CORE_CONCLUSIONS.every(
        (id) => state.knowledge[id] === false,
      ),
    ).toBe(true);
  });

  it("shows the Director's Cut start lead before the first fact", () => {
    const notebook = renderKnowledge(marieState());
    expect(notebook).toContain("Aktuelt lead");
    expect(notebook).toContain(
      "Find ud af, hvad Ryan truede Marie med",
    );
  });
});
