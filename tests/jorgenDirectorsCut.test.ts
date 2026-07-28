import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/app/gameState";
import {
  KNOWLEDGE_IDS,
  type GameState,
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
import {
  getDirectorsCutCaseContent,
} from "../src/game/directorsCutCaseContent";
import {
  JORGEN_CORE_CONCLUSIONS,
  hasAllJorgenConclusions,
} from "../src/game/jorgenCase";
import { learnKnowledge } from "../src/game/knowledgeGraph";
import {
  canPerformSceneInteraction,
  getSceneInteraction,
  getSceneInteractions,
} from "../src/game/sceneInteractions";
import { reduceGameState } from "../src/game/stateMachine";
import {
  DIRECTORS_CUT_ASSET_MANIFEST,
  hasDirectorsCutAsset,
} from "../src/media/directorsCutAssetManifest";
import { renderKnowledge } from "../src/ui/App";

function jorgenState(overrides: Partial<GameState> = {}): GameState {
  let state = reduceGameState(createInitialGameState(), {
    type: "START_CASE",
    caseId: "jorgen",
  });
  state = reduceGameState(state, { type: "SKIP_INTRO" });
  return { ...state, ...overrides };
}

function completeWait(state: GameState): GameState {
  const pending = reduceGameState(state, { type: "WAIT" });
  return reduceGameState(pending, { type: "COMPLETE_TRANSITION" });
}

describe("Director's Cut: Jørgen", () => {
  it("registers all four cases, supports ?dcCase=jorgen, and preserves Original", () => {
    expect(getMysteryCaseIds()).toEqual([
      "david",
      "barbara",
      "marie",
      "jorgen",
    ]);
    expect(
      selectDirectorsCutCase({
        requestedCaseId: getDirectorsCutCaseOverride(
          "?dcCase=jorgen",
        ),
        randomValue: 0,
      }),
    ).toEqual({
      caseId: "jorgen",
      source: "qa",
      requestedCaseId: "jorgen",
    });
    expect(
      selectDirectorsCutCase({ requestedCaseId: "david" }).caseId,
    ).toBe("david");
    expect(
      selectDirectorsCutCase({ requestedCaseId: "barbara" }).caseId,
    ).toBe("barbara");
    expect(
      selectDirectorsCutCase({ requestedCaseId: "marie" }).caseId,
    ).toBe("marie");
    expect(selectDirectorsCutCase({ randomValue: 0 }).caseId).toBe(
      "david",
    );
    expect(selectDirectorsCutCase({ randomValue: 0.3 }).caseId).toBe(
      "barbara",
    );
    expect(selectDirectorsCutCase({ randomValue: 0.6 }).caseId).toBe(
      "marie",
    );
    expect(selectDirectorsCutCase({ randomValue: 0.999 }).caseId).toBe(
      "jorgen",
    );
    const original = reduceGameState(createInitialGameState(), {
      type: "START_CASE",
      caseId: DEFAULT_CASE_ID,
    });
    expect(original.selectedCaseId).toBe("laura");
  });

  it("completes the reducer-level four-day paradox golden path", () => {
    let state = jorgenState();
    const move = (location: LocationId): void => {
      state = reduceGameState(state, {
        type: "MOVE_TO_LOCATION",
        location,
      });
    };
    const wait = (): void => {
      state = completeWait(state);
    };
    const interact = (
      id:
        | "inspect_ryans_body_and_necklace"
        | "inspect_jorgen_anonymous_note"
        | "inspect_jorgen_login_audit"
        | "inspect_secret_passage_book"
        | "place_jorgen_passage_test"
        | "inspect_jorgen_passage_test"
        | "compare_jorgen_notebook"
        | "confront_later_jorgen"
        | "plant_jorgen_decoy"
        | "prevent_jorgen_murder",
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

    wait();
    wait();
    expect(state).toMatchObject({
      timeSlot: 3,
      knowledge: {
        ryan_was_murdered: true,
        jorgen_ryan_called_with_fragment: true,
      },
    });
    interact("inspect_ryans_body_and_necklace");
    wait();
    wait();
    expect(state).toMatchObject({
      loop: 2,
      timeSlot: 1,
      selectedCaseId: "jorgen",
      knowledge: { jorgen_prior_loop_reference_ready: true },
    });
    expect(state.caseProgress.previousLoopTransitions).toEqual([
      "A1",
      "A2",
      "A3",
      "A4",
    ]);

    move("D");
    interact("inspect_jorgen_anonymous_note");
    expect(state.knowledge.jorgen_other_remembers_conclusion).toBe(
      true,
    );
    move("B");
    interact("inspect_jorgen_login_audit");
    move("D");
    state = reduceGameState(state, {
      type: "START_DIALOGUE",
      person: "Marie",
    });
    state = reduceGameState(state, {
      type: "COMPLETE_DIALOGUE_CHOICE",
      person: "Marie",
      topic: "jorgen_sighting",
      completion: "skipped",
    });
    state = reduceGameState(state, { type: "CLOSE_DIALOGUE" });
    expect(state.knowledge.jorgen_identity_used_conclusion).toBe(true);

    move("C");
    interact("inspect_secret_passage_book");
    interact("place_jorgen_passage_test");
    expect(state.knowledge.jorgen_passage_test_placed).toBe(true);
    wait();
    wait();
    wait();
    wait();
    expect(state).toMatchObject({
      loop: 3,
      timeSlot: 1,
      knowledge: {
        jorgen_passage_marker_survived: true,
        jorgen_outside_control_reset: true,
        jorgen_passage_persistence_conclusion: true,
      },
    });

    interact("inspect_jorgen_passage_test");
    wait();
    wait();
    move("D");
    interact("compare_jorgen_notebook");
    expect(state.knowledge).toMatchObject({
      jorgen_fragment_from_future_conclusion: true,
      jorgen_later_self_exists_conclusion: true,
      jorgen_future_self_murderer_conclusion: true,
    });
    expect(hasAllJorgenConclusions(state)).toBe(true);
    expect(renderKnowledge(state)).toContain(
      "Morderen er mig — men ikke endnu.",
    );

    wait();
    move("C");
    interact("confront_later_jorgen");
    expect(state).toMatchObject({
      loop: 4,
      timeSlot: 1,
      phase: "reconstruction",
      knowledge: {
        jorgen_revelation_completed: true,
        jorgen_prevention_plan: true,
      },
    });

    state = reduceGameState(state, {
      type: "COMPLETE_RECONSTRUCTION",
    });
    move("D");
    interact("plant_jorgen_decoy");
    move("C");
    wait();
    interact("prevent_jorgen_murder");
    expect(state).toMatchObject({
      loop: 4,
      timeSlot: 2,
      phase: "ending",
      selectedCaseId: "jorgen",
      knowledge: {
        ryan_was_saved: true,
        jorgen_later_self_dissolved: true,
        jorgen_paradox_broken: true,
        jorgen_reconstruction_recorded: true,
      },
    });
  });

  it("requires an actual prior-loop reference before another-memory can be concluded", () => {
    const bareNote = learnKnowledge(jorgenState(), [
      "jorgen_note_references_previous_loop",
    ]);
    expect(bareNote.knowledge.jorgen_other_remembers_conclusion).toBe(
      false,
    );

    let looped = jorgenState();
    looped = completeWait(looped);
    looped = { ...looped, timeSlot: 4 };
    looped = completeWait(looped);
    expect(looped.knowledge.jorgen_prior_loop_reference_ready).toBe(
      true,
    );
    const documented = learnKnowledge(looped, [
      "jorgen_note_references_previous_loop",
    ]);
    expect(documented.knowledge.jorgen_other_remembers_conclusion).toBe(
      true,
    );
  });

  it("does not expose a normal self-accusation or the final line in layer one", () => {
    const layerOne = learnKnowledge(jorgenState({ timeSlot: 3 }), [
      "jorgen_prior_loop_reference_ready",
      "jorgen_note_references_previous_loop",
    ]);
    expect(layerOne.knowledge.jorgen_other_remembers_conclusion).toBe(
      true,
    );
    expect(
      layerOne.knowledge.jorgen_future_self_murderer_conclusion,
    ).toBe(false);
    expect(renderKnowledge(layerOne)).not.toContain(
      "Morderen er mig — men ikke endnu.",
    );
    for (const person of [
      "Barbara",
      "David",
      "Laura",
      "Marie",
    ] as const) {
      const choices = getAvailableDialogueChoices(layerOne, person);
      expect(
        choices.some(
          ({ person: accused, topic }) =>
            topic === "accuse" && accused === ("Jørgen" as never),
        ),
      ).toBe(false);
    }
  });

  it("requires login, witness and the played Jørgen's alibi for identity", () => {
    for (const fact of [
      "jorgen_login_used",
      "jorgen_lookalike_seen",
      "jorgen_player_alibi",
    ] as const) {
      const state = learnKnowledge(jorgenState(), [fact]);
      expect(state.knowledge.jorgen_identity_used_conclusion).toBe(
        false,
      );
    }
    const two = learnKnowledge(jorgenState(), [
      "jorgen_login_used",
      "jorgen_lookalike_seen",
    ]);
    expect(two.knowledge.jorgen_identity_used_conclusion).toBe(false);
    const all = learnKnowledge(two, ["jorgen_player_alibi"]);
    expect(all.knowledge.jorgen_identity_used_conclusion).toBe(true);
  });

  it("verifies passage persistence only after reset and only in Jørgen", () => {
    let placed = learnKnowledge(
      jorgenState({ location: "C", timeSlot: 2 }),
      [
        "jorgen_passage_test_placed",
        "secret_passage_exists",
      ],
    );
    expect(placed.knowledge.jorgen_passage_marker_survived).toBe(false);
    placed = completeWait(placed);
    expect(placed.timeSlot).toBe(3);
    expect(placed.knowledge.jorgen_passage_marker_survived).toBe(false);
    placed = { ...placed, timeSlot: 4 };
    const reset = completeWait(placed);
    expect(reset.knowledge).toMatchObject({
      jorgen_passage_marker_survived: true,
      jorgen_outside_control_reset: true,
    });

    const foreign = {
      ...placed,
      selectedCaseId: "marie" as const,
    };
    const foreignReset = completeWait({
      ...foreign,
      timeSlot: 4,
    });
    expect(foreignReset.knowledge.jorgen_passage_marker_survived).toBe(
      false,
    );
    expect(foreignReset.knowledge.jorgen_outside_control_reset).toBe(
      false,
    );
  });

  it("requires reset control facts for the passage conclusion", () => {
    const markerOnly = learnKnowledge(jorgenState(), [
      "jorgen_passage_marker_survived",
      "secret_passage_exists",
    ]);
    expect(
      markerOnly.knowledge.jorgen_passage_persistence_conclusion,
    ).toBe(false);
    const complete = learnKnowledge(markerOnly, [
      "jorgen_outside_control_reset",
    ]);
    expect(
      complete.knowledge.jorgen_passage_persistence_conclusion,
    ).toBe(true);
  });

  it("gates the future fragment behind intact-page and future-knowledge proof", () => {
    const fragment = learnKnowledge(jorgenState(), [
      "jorgen_fragment_in_ryan_hand",
      "jorgen_fragment_handwriting",
    ]);
    expect(
      fragment.knowledge.jorgen_fragment_from_future_conclusion,
    ).toBe(false);
    const noFutureKnowledge = learnKnowledge(fragment, [
      "jorgen_current_page_intact",
    ]);
    expect(
      noFutureKnowledge.knowledge.jorgen_fragment_from_future_conclusion,
    ).toBe(false);
    const complete = learnKnowledge(noFutureKnowledge, [
      "jorgen_fragment_future_knowledge",
    ]);
    expect(
      complete.knowledge.jorgen_fragment_from_future_conclusion,
    ).toBe(true);
  });

  it("cannot reach the murderer conclusion from the fragment without identity and passage", () => {
    const fragmentOnly = learnKnowledge(jorgenState(), [
      "jorgen_fragment_in_ryan_hand",
      "jorgen_fragment_handwriting",
      "jorgen_current_page_intact",
      "jorgen_fragment_future_knowledge",
      "jorgen_ryan_called_with_fragment",
    ]);
    expect(
      fragmentOnly.knowledge.jorgen_fragment_from_future_conclusion,
    ).toBe(true);
    expect(
      fragmentOnly.knowledge.jorgen_later_self_exists_conclusion,
    ).toBe(false);
    expect(
      fragmentOnly.knowledge.jorgen_future_self_murderer_conclusion,
    ).toBe(false);
  });

  it("opens the special revelation only after E and never uses NPC confession", () => {
    const content = getDirectorsCutCaseContent("jorgen");
    expect(content.finaleKind).toBe("special-revelation");
    expect(content.finaleKnowledgeId).toBe(
      "jorgen_revelation_completed",
    );

    const early = jorgenState({ location: "C", timeSlot: 4 });
    const interaction = getSceneInteractions(
      early,
      "C4",
      "manual",
    ).find(({ id }) => id === "confront_later_jorgen");
    expect(interaction).toBeDefined();
    expect(canPerformSceneInteraction(early, interaction!)).toBe(false);

    const ready = learnKnowledge(early, [
      "jorgen_future_self_murderer_conclusion",
    ]);
    const readyInteraction = getSceneInteraction(
      "confront_later_jorgen",
      ready,
    );
    expect(canPerformSceneInteraction(ready, readyInteraction)).toBe(
      true,
    );
    expect(readyInteraction.cue).toMatchObject({
      kind: "text-sequence",
      placeholderAssetId: "dc-jorgen-special-revelation",
    });
    expect(
      readyInteraction.effects.map(({ id }) => id),
    ).toEqual([
      "jorgen_revelation_completed",
      "jorgen_prevention_plan",
    ]);
  });

  it("applies special revelation effects through text fallback and starts rereadable reconstruction", () => {
    let state = learnKnowledge(
      jorgenState({ location: "C", timeSlot: 4 }),
      ["jorgen_future_self_murderer_conclusion"],
    );
    state = reduceGameState(state, {
      type: "PERFORM_INTERACTION",
      id: "confront_later_jorgen",
    });
    expect(state.pendingTransition).not.toBeNull();
    state = reduceGameState(state, { type: "COMPLETE_TRANSITION" });
    expect(state).toMatchObject({
      loop: 2,
      phase: "reconstruction",
      knowledge: {
        jorgen_revelation_completed: true,
        jorgen_prevention_plan: true,
      },
    });
    state = reduceGameState(state, {
      type: "COMPLETE_RECONSTRUCTION",
    });
    expect(state).toMatchObject({
      phase: "exploration",
      caseProgress: {
        reconstructionAvailable: true,
        reconstructionCompleted: true,
      },
      knowledge: {
        jorgen_reconstruction_recorded: true,
      },
    });
    expect(renderKnowledge(state)).toContain(
      "Læs den private rekonstruktion igen",
    );
  });

  it("counts normal NPC accusations without softlock", () => {
    let state = jorgenState({ timeSlot: 3 });
    for (const person of [
      "Laura",
      "David",
      "Barbara",
      "Marie",
    ] as const) {
      state = executeDialogueChoice(
        state,
        person,
        "accuse",
        "skipped",
      ).state;
    }
    expect(state.caseProgress.statistics).toEqual({
      confrontations: 4,
      wrongAccusations: 4,
      prematureAccusations: 0,
    });
    expect(state.loopState.dialogue.refusesFurtherDialogue).toEqual([]);
  });

  it("requires both decoy and correct C2 timing for prevention", () => {
    const reconstructed = learnKnowledge(
      jorgenState({ location: "C", timeSlot: 2 }),
      ["jorgen_prevention_plan", "jorgen_reconstruction_recorded"],
    );
    const prevention = getSceneInteraction(
      "prevent_jorgen_murder",
      reconstructed,
    );
    expect(
      canPerformSceneInteraction(reconstructed, prevention),
    ).toBe(false);
    expect(
      reduceGameState(reconstructed, {
        type: "PERFORM_INTERACTION",
        id: "prevent_jorgen_murder",
      }),
    ).toBe(reconstructed);

    const ready = learnKnowledge(reconstructed, [
      "jorgen_decoy_planted",
    ]);
    const won = reduceGameState(ready, {
      type: "PERFORM_INTERACTION",
      id: "prevent_jorgen_murder",
    });
    expect(won).toMatchObject({
      phase: "ending",
      knowledge: {
        ryan_was_saved: true,
        jorgen_later_self_dissolved: true,
        jorgen_paradox_broken: true,
      },
    });
    expect(
      getSceneInteractions(
        { ...ready, selectedCaseId: "marie" },
        "C2",
        "manual",
      ).map(({ id }) => id),
    ).not.toContain("prevent_jorgen_murder");
  });

  it("resets every Jørgen anomaly, history item, statistic and finale value for a new game", () => {
    const dirty = {
      ...learnKnowledge(jorgenState(), KNOWLEDGE_IDS),
      caseProgress: {
        ...jorgenState().caseProgress,
        previousLoopTransitions: [
          "A1",
          "C2",
        ] as GameState["caseProgress"]["previousLoopTransitions"],
        statistics: {
          confrontations: 5,
          wrongAccusations: 4,
          prematureAccusations: 1,
        },
        reconstructionAvailable: true,
        reconstructionCompleted: true,
      },
    };
    const reset = reduceGameState(dirty, { type: "RESET_GAME" });
    expect(Object.values(reset.knowledge).every((known) => !known)).toBe(
      true,
    );
    expect(reset.caseProgress).toMatchObject({
      previousLoopTransitions: [],
      statistics: {
        confrontations: 0,
        wrongAccusations: 0,
        prematureAccusations: 0,
      },
      reconstructionAvailable: false,
      reconstructionCompleted: false,
    });
  });

  it("keeps Jørgen knowledge isolated from normal cases", () => {
    for (const selectedCaseId of [
      "laura",
      "david",
      "barbara",
      "marie",
    ] as const) {
      const state = learnKnowledge(
        { ...jorgenState(), selectedCaseId },
        [
          "jorgen_login_used",
          "jorgen_lookalike_seen",
          "jorgen_player_alibi",
          "jorgen_passage_marker_survived",
          "jorgen_outside_control_reset",
          "secret_passage_exists",
        ],
      );
      expect(state.knowledge.jorgen_identity_used_conclusion).toBe(
        false,
      );
      expect(
        state.knowledge.jorgen_passage_persistence_conclusion,
      ).toBe(false);
    }
  });

  it("renders dry case-specific result metadata without changing other cases", () => {
    const content = getDirectorsCutCaseContent("jorgen");
    expect(content.result).toEqual({
      murdererLabel: "Jørgen (senere)",
      topRating: "Kronologisk umulig",
      extraStatistics: [
        { label: "Registrerede Jørgener", value: "2" },
        { label: "Tidsmæssige selvmodsigelser", value: "1" },
      ],
    });
    expect(getDirectorsCutCaseContent("marie").result).toBeUndefined();
    expect(getDirectorsCutCaseContent("david").finaleKind).toBe(
      "npc-confession",
    );
  });

  it("keeps every Jørgen placeholder traceable and every manifest id unique", () => {
    const ids = DIRECTORS_CUT_ASSET_MANIFEST.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
    const assets = DIRECTORS_CUT_ASSET_MANIFEST.filter(
      ({ caseId }) => caseId === "jorgen",
    );
    expect(assets.length).toBeGreaterThanOrEqual(18);
    expect(
      assets.every(
        (asset) =>
          asset.status === "placeholder" &&
          asset.exactContent.length > 0 &&
          asset.delivery.length > 0 &&
          asset.before.length > 0 &&
          asset.after.length > 0,
      ),
    ).toBe(true);

    const state = learnKnowledge(
      jorgenState({ timeSlot: 3 }),
      KNOWLEDGE_IDS,
    );
    for (const person of [
      "Barbara",
      "David",
      "Laura",
      "Marie",
    ] as const) {
      for (const choice of getAvailableDialogueChoices(state, person)) {
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

  it("initializes every new conclusion as false and keeps core order explicit", () => {
    const state = jorgenState();
    expect(Object.keys(state.knowledge)).toEqual([...KNOWLEDGE_IDS]);
    expect(
      JORGEN_CORE_CONCLUSIONS.every(
        (id) => state.knowledge[id] === false,
      ),
    ).toBe(true);
    expect(JORGEN_CORE_CONCLUSIONS).toEqual([
      "jorgen_other_remembers_conclusion",
      "jorgen_identity_used_conclusion",
      "jorgen_passage_persistence_conclusion",
      "jorgen_later_self_exists_conclusion",
      "jorgen_future_self_murderer_conclusion",
    ]);
  });
});
