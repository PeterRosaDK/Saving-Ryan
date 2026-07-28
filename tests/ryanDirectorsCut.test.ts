import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/app/gameState";
import {
  KNOWLEDGE_IDS,
  type CaseId,
  type GameState,
  type KnowledgeId,
  type LocationId,
} from "../src/app/types";
import {
  DEFAULT_CASE_ID,
  calculateCaseScore,
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
import { learnKnowledge } from "../src/game/knowledgeGraph";
import {
  RYAN_CORE_CONCLUSIONS,
  hasAllRyanConclusions,
  hasRyanPartialAdmissionEvidence,
} from "../src/game/ryanCase";
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

function ryanState(overrides: Partial<GameState> = {}): GameState {
  let state = reduceGameState(createInitialGameState(), {
    type: "START_CASE",
    caseId: "ryan",
  });
  state = reduceGameState(state, { type: "SKIP_INTRO" });
  return { ...state, ...overrides };
}

function completeWait(state: GameState): GameState {
  const pending = reduceGameState(state, { type: "WAIT" });
  return reduceGameState(pending, { type: "COMPLETE_TRANSITION" });
}

const PARTIAL_ADMISSION_EVIDENCE = [
  "ryan_laura_on_ledge",
  "ryan_necklace_in_hand",
  "ryan_necklace_torn_clasp",
  "ryan_laura_owns_necklace",
  "ryan_laura_neck_injury",
] as const satisfies readonly KnowledgeId[];

const RYAN_COMPLETE_FACTS = [
  ...PARTIAL_ADMISSION_EVIDENCE,
  "ryan_laura_pushed",
  "ryan_laura_says_attacked_first",
  "ryan_laura_partial_admission",
  "ryan_laura_dossier",
  "ryan_knew_dossier",
  "ryan_used_private_history_to_control",
  "ryan_sent_meeting_message",
  "ryan_message_before_murder",
  "ryan_planned_alone",
  "ryan_knew_passage_before_meeting",
  "ryan_institution_research",
  "ryan_false_suicide_draft",
  "ryan_research_deleted",
  "ryan_premeditation_timestamp",
] as const satisfies readonly KnowledgeId[];

describe("Director's Cut: Ryan", () => {
  it("registers five active cases, supports ?dcCase=ryan, and preserves Original", () => {
    expect(getMysteryCaseIds()).toEqual([
      "david",
      "barbara",
      "marie",
      "jorgen",
      "ryan",
    ]);
    expect(
      selectDirectorsCutCase({
        requestedCaseId: getDirectorsCutCaseOverride(
          "?dcCase=ryan",
        ),
        randomValue: 0,
      }),
    ).toEqual({
      caseId: "ryan",
      source: "qa",
      requestedCaseId: "ryan",
    });
    expect(selectDirectorsCutCase({ randomValue: 0 }).caseId).toBe(
      "david",
    );
    expect(selectDirectorsCutCase({ randomValue: 0.3 }).caseId).toBe(
      "barbara",
    );
    expect(selectDirectorsCutCase({ randomValue: 0.5 }).caseId).toBe(
      "marie",
    );
    expect(selectDirectorsCutCase({ randomValue: 0.7 }).caseId).toBe(
      "jorgen",
    );
    expect(selectDirectorsCutCase({ randomValue: 0.999 }).caseId).toBe(
      "ryan",
    );
    const original = reduceGameState(createInitialGameState(), {
      type: "START_CASE",
      caseId: DEFAULT_CASE_ID,
    });
    expect(original.selectedCaseId).toBe("laura");

    const warnings: string[] = [];
    expect(
      selectDirectorsCutCase({
        requestedCaseId: "ukendt",
        randomValue: 0,
        warn: (message) => warnings.push(message),
      }).caseId,
    ).toBe("david");
    expect(warnings).toHaveLength(1);
  });

  it("completes the reducer-level two-day reverse-case golden path", () => {
    let state = ryanState();
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
        | "inspect_ryan_lure_message"
        | "inspect_laura_ryan_dossier"
        | "inspect_ryan_passage_plan"
        | "inspect_ryan_research_cache"
        | "inspect_ryan_deleted_draft"
        | "compare_ryan_premeditation_timestamps"
        | "secure_ryan_evidence"
        | "prevent_ryan_attack",
    ): void => {
      state = reduceGameState(state, {
        type: "PERFORM_INTERACTION",
        id,
      });
    };
    const talk = (
      person: "Laura",
      topic: "necklace" | "accuse" | "ryan_warning",
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
    wait();
    expect(state).toMatchObject({
      location: "A",
      timeSlot: 3,
      knowledge: {
        ryan_was_murdered: true,
        ryan_laura_on_ledge: true,
        ryan_fall_caused_death: true,
      },
    });
    expect(renderKnowledge(state)).toContain(
      "Ryan døde efter faldet fra afsatsen",
    );
    expect(renderKnowledge(state)).not.toContain("Ryan bliver myrdet");
    interact("inspect_ryans_body_and_necklace");
    talk("Laura", "necklace");
    expect(hasRyanPartialAdmissionEvidence(state)).toBe(true);
    talk("Laura", "accuse");
    expect(state).toMatchObject({
      phase: "exploration",
      knowledge: {
        ryan_laura_pushed: true,
        ryan_laura_says_attacked_first: true,
        ryan_laura_partial_admission: true,
        ryan_physical_action_open_conclusion: true,
        ryan_responsibility_conclusion: false,
      },
    });

    move("D");
    interact("inspect_ryan_lure_message");
    interact("inspect_laura_ryan_dossier");
    move("C");
    interact("inspect_ryan_passage_plan");
    move("B");
    interact("inspect_ryan_research_cache");
    interact("inspect_ryan_deleted_draft");
    interact("compare_ryan_premeditation_timestamps");
    expect(hasAllRyanConclusions(state)).toBe(true);
    expect(state.knowledge.ryan_responsibility_conclusion).toBe(true);

    wait();
    wait();
    expect(state).toMatchObject({
      loop: 2,
      timeSlot: 1,
      phase: "reconstruction",
      selectedCaseId: "ryan",
    });
    state = reduceGameState(state, {
      type: "COMPLETE_RECONSTRUCTION",
    });
    expect(state.knowledge).toMatchObject({
      ryan_reconstruction_recorded: true,
      ryan_prevention_plan: true,
    });
    interact("secure_ryan_evidence");
    move("E");
    wait();
    talk("Laura", "ryan_warning");
    move("C");
    interact("prevent_ryan_attack");
    expect(state).toMatchObject({
      loop: 2,
      timeSlot: 2,
      phase: "ending",
      selectedCaseId: "ryan",
      knowledge: {
        ryan_was_saved: true,
        ryan_attack_prevented: true,
        ryan_laura_saved: true,
        ryan_ryan_saved: true,
      },
    });
  });

  it("does not turn necklace ownership or ledge presence into a solved case", () => {
    const necklaceOnly = learnKnowledge(ryanState(), [
      "ryan_laura_owns_necklace",
    ]);
    const presenceOnly = learnKnowledge(ryanState(), [
      "ryan_laura_on_ledge",
    ]);
    expect(hasAllRyanConclusions(necklaceOnly)).toBe(false);
    expect(hasAllRyanConclusions(presenceOnly)).toBe(false);
    expect(necklaceOnly.knowledge.ryan_responsibility_conclusion).toBe(
      false,
    );
    expect(presenceOnly.knowledge.ryan_responsibility_conclusion).toBe(
      false,
    );
  });

  it("keeps the true partial admission non-conclusive on end and skip", () => {
    const ready = learnKnowledge(
      ryanState({ timeSlot: 3 }),
      PARTIAL_ADMISSION_EVIDENCE,
    );
    const ended = executeDialogueChoice(
      ready,
      "Laura",
      "accuse",
      "ended",
    );
    const skipped = executeDialogueChoice(
      ready,
      "Laura",
      "accuse",
      "skipped",
    );
    expect(ended.choice?.accusationOutcome).toBe("partial");
    expect(skipped.choice?.effectsOnSkip).toBe(true);
    for (const result of [ended.state, skipped.state]) {
      expect(result.phase).toBe("exploration");
      expect(result.knowledge).toMatchObject({
        ryan_laura_pushed: true,
        ryan_laura_says_attacked_first: true,
        ryan_laura_partial_admission: true,
        ryan_responsibility_conclusion: false,
      });
      expect(result.caseProgress.statistics).toEqual({
        confrontations: 1,
        wrongAccusations: 0,
        prematureAccusations: 0,
      });
      expect(result.loopState.dialogue.refusesFurtherDialogue).toEqual(
        [],
      );
    }
  });

  it("renders the open responsibility question after Laura admits the push", () => {
    const admitted = learnKnowledge(
      ryanState({ timeSlot: 3 }),
      [
        ...PARTIAL_ADMISSION_EVIDENCE,
        "ryan_laura_pushed",
        "ryan_laura_says_attacked_first",
        "ryan_laura_partial_admission",
      ],
    );
    const notebook = renderKnowledge(admitted);
    expect(notebook).toContain("Laura skubbede Ryan");
    expect(notebook).toContain("hvem der angreb først");
    expect(notebook).toContain("Undersøg Ryans handlinger før mødet");
    expect(notebook).not.toContain("Laura er morderen");
    expect(
      getAvailableDialogueChoices(admitted, "Laura").length,
    ).toBeGreaterThan(0);
  });

  it.each([
    [
      [
        "ryan_laura_dossier",
        "ryan_knew_dossier",
      ],
      ["ryan_used_private_history_to_control"],
      "ryan_silencing_motive_conclusion",
    ],
    [
      [
        "ryan_sent_meeting_message",
        "ryan_message_before_murder",
      ],
      [
        "ryan_planned_alone",
        "ryan_knew_passage_before_meeting",
      ],
      "ryan_arranged_ledge_meeting_conclusion",
    ],
    [
      [
        "ryan_institution_research",
        "ryan_false_suicide_draft",
      ],
      [
        "ryan_research_deleted",
        "ryan_premeditation_timestamp",
      ],
      "ryan_false_suicide_plan_conclusion",
    ],
  ] as const)(
    "derives a Ryan conclusion independent of evidence order",
    (first, second, conclusion) => {
      let forward = learnKnowledge(ryanState(), first);
      expect(forward.knowledge[conclusion]).toBe(false);
      forward = learnKnowledge(forward, second);
      expect(forward.knowledge[conclusion]).toBe(true);

      let reverse = learnKnowledge(ryanState(), second);
      expect(reverse.knowledge[conclusion]).toBe(false);
      reverse = learnKnowledge(reverse, first);
      expect(reverse.knowledge[conclusion]).toBe(true);
    },
  );

  it("requires the physical chain and premeditated plan for self-defense", () => {
    const noPlan = learnKnowledge(ryanState(), [
      "ryan_laura_partial_admission",
      "ryan_laura_says_attacked_first",
      "ryan_necklace_in_hand",
      "ryan_necklace_torn_clasp",
      "ryan_laura_neck_injury",
    ]);
    expect(noPlan.knowledge.ryan_self_defense_conclusion).toBe(false);
    const documented = learnKnowledge(noPlan, [
      "ryan_institution_research",
      "ryan_false_suicide_draft",
      "ryan_research_deleted",
      "ryan_premeditation_timestamp",
    ]);
    expect(documented.knowledge.ryan_self_defense_conclusion).toBe(true);
  });

  it.each([
    "ryan_silencing_motive_conclusion",
    "ryan_arranged_ledge_meeting_conclusion",
    "ryan_false_suicide_plan_conclusion",
    "ryan_self_defense_conclusion",
    "ryan_laura_partial_admission",
  ] as const)("does not derive F without %s", (missing) => {
    const state = learnKnowledge(
      ryanState(),
      [
        "ryan_silencing_motive_conclusion",
        "ryan_arranged_ledge_meeting_conclusion",
        "ryan_false_suicide_plan_conclusion",
        "ryan_self_defense_conclusion",
        "ryan_laura_partial_admission",
      ].filter((id) => id !== missing) as KnowledgeId[],
    );
    expect(state.knowledge.ryan_responsibility_conclusion).toBe(false);
  });

  it("does not let motive, message, research or broken necklace solve the case alone", () => {
    for (const facts of [
      [
        "ryan_laura_dossier",
        "ryan_knew_dossier",
        "ryan_used_private_history_to_control",
      ],
      [
        "ryan_sent_meeting_message",
        "ryan_message_before_murder",
        "ryan_planned_alone",
      ],
      ["ryan_institution_research"],
      ["ryan_necklace_torn_clasp"],
    ] as const) {
      const state = learnKnowledge(ryanState(), facts);
      expect(state.knowledge.ryan_responsibility_conclusion).toBe(
        false,
      );
    }
  });

  it("requires a pre-murder timestamp for the false-suicide conclusion", () => {
    const withoutTimestamp = learnKnowledge(ryanState(), [
      "ryan_institution_research",
      "ryan_false_suicide_draft",
      "ryan_research_deleted",
    ]);
    expect(
      withoutTimestamp.knowledge.ryan_false_suicide_plan_conclusion,
    ).toBe(false);
    const complete = learnKnowledge(withoutTimestamp, [
      "ryan_premeditation_timestamp",
    ]);
    expect(
      complete.knowledge.ryan_false_suicide_plan_conclusion,
    ).toBe(true);
  });

  it("keeps a living Ryan's denial manipulative but non-final", () => {
    const early = learnKnowledge(
      ryanState({ location: "C", timeSlot: 1 }),
      ["ryan_laura_partial_admission"],
    );
    const confrontation = executeDialogueChoice(
      early,
      "Ryan",
      "accuse",
      "skipped",
    );
    expect(confrontation.choice).toMatchObject({
      accusationOutcome: "premature",
      effectsOnSkip: true,
    });
    expect(confrontation.choice?.answerCue).toMatchObject({
      kind: "text-sequence",
      placeholderAssetId: "dc-ryan-manipulative-denial",
    });
    expect(confrontation.state).toMatchObject({
      phase: "exploration",
      knowledge: {
        ryan_manipulative_denial: true,
        ryan_responsibility_conclusion: false,
      },
    });
  });

  it("counts wrong NPC accusations without softlock", () => {
    let state = ryanState({ timeSlot: 3 });
    for (const person of ["David", "Barbara", "Marie"] as const) {
      state = executeDialogueChoice(
        state,
        person,
        "accuse",
        "skipped",
      ).state;
    }
    expect(state.caseProgress.statistics).toEqual({
      confrontations: 3,
      wrongAccusations: 3,
      prematureAccusations: 0,
    });
    expect(state.loopState.dialogue.refusesFurtherDialogue).toEqual([]);
  });

  it("records both reconstruction and prevention plan for special finales", () => {
    let state = learnKnowledge(
      ryanState({ timeSlot: 4 }),
      ["ryan_responsibility_conclusion"],
    );
    state = completeWait(state);
    expect(state.phase).toBe("reconstruction");
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
        ryan_reconstruction_recorded: true,
        ryan_prevention_plan: true,
      },
    });
    expect(renderKnowledge(state)).toContain(
      "Læs den private rekonstruktion igen",
    );
  });

  it("requires two secured evidence classes, warning and C2 timing for prevention", () => {
    const base = learnKnowledge(
      ryanState({ location: "C", timeSlot: 2 }),
      [
        "ryan_responsibility_conclusion",
        "ryan_prevention_plan",
        "ryan_reconstruction_recorded",
      ],
    );
    const prevention = getSceneInteraction(
      "prevent_ryan_attack",
      base,
    );
    expect(canPerformSceneInteraction(base, prevention)).toBe(false);

    const onlyWarning = learnKnowledge(base, ["ryan_laura_warned"]);
    expect(
      canPerformSceneInteraction(onlyWarning, prevention),
    ).toBe(false);
    const oneEvidenceClass = learnKnowledge(onlyWarning, [
      "ryan_message_copy_secured",
    ]);
    expect(
      canPerformSceneInteraction(oneEvidenceClass, prevention),
    ).toBe(false);
    const ready = learnKnowledge(oneEvidenceClass, [
      "ryan_plan_files_secured",
    ]);
    expect(canPerformSceneInteraction(ready, prevention)).toBe(true);
    expect(
      reduceGameState(base, {
        type: "PERFORM_INTERACTION",
        id: "prevent_ryan_attack",
      }),
    ).toBe(base);
    const won = reduceGameState(ready, {
      type: "PERFORM_INTERACTION",
      id: "prevent_ryan_attack",
    });
    expect(won).toMatchObject({
      phase: "ending",
      knowledge: {
        ryan_laura_saved: true,
        ryan_ryan_saved: true,
      },
    });
  });

  it("preserves Ryan through loops and fully resets case-local progress", () => {
    let looped = learnKnowledge(
      ryanState({ timeSlot: 4 }),
      RYAN_COMPLETE_FACTS,
    );
    looped = {
      ...looped,
      caseProgress: {
        ...looped.caseProgress,
        statistics: {
          confrontations: 4,
          wrongAccusations: 2,
          prematureAccusations: 1,
        },
      },
    };
    looped = completeWait(looped);
    expect(looped).toMatchObject({
      selectedCaseId: "ryan",
      loop: 2,
    });
    const reset = reduceGameState(looped, { type: "RESET_GAME" });
    expect(Object.values(reset.knowledge).every((known) => !known)).toBe(
      true,
    );
    expect(reset.caseProgress).toMatchObject({
      statistics: {
        confrontations: 0,
        wrongAccusations: 0,
        prematureAccusations: 0,
      },
      reconstructionAvailable: false,
      reconstructionCompleted: false,
    });
  });

  it("keeps every Ryan conclusion and interaction isolated from prior stories", () => {
    for (const selectedCaseId of [
      "laura",
      "david",
      "barbara",
      "marie",
      "jorgen",
    ] as const satisfies readonly CaseId[]) {
      const foreign = learnKnowledge(
        { ...ryanState(), selectedCaseId },
        RYAN_COMPLETE_FACTS,
      );
      expect(foreign.knowledge.ryan_responsibility_conclusion).toBe(
        false,
      );
      expect(
        getSceneInteractions(foreign, "C2", "manual").map(
          ({ id }) => id,
        ),
      ).not.toContain("prevent_ryan_attack");
    }
  });

  it("uses Ryan-specific legacy geography without changing other cases", () => {
    expect(
      getLocationTransitionEvent("A2", "ryan").effects,
    ).toContainEqual({
      type: "LEARN",
      id: "ryan_laura_on_ledge",
    });
    expect(
      getLocationTransitionEvent("A2", "laura").effects,
    ).toEqual([]);
    expect(
      getSceneInteraction(
        "inspect_ryans_body_and_necklace",
        ryanState(),
      ).effects,
    ).toContainEqual({
      type: "LEARN",
      id: "ryan_necklace_torn_clasp",
    });
  });

  it("renders responsibility, self-defense and sober case statistics", () => {
    const content = getDirectorsCutCaseContent("ryan");
    expect(content.finaleKind).toBe("special-revelation");
    expect(content.finaleKnowledgeId).toBe(
      "ryan_responsibility_conclusion",
    );
    expect(content.result).toEqual({
      responsiblePartyLabel: "Ryan",
      topRating: "Den omvendte sag",
      resolutionDetails: [
        { label: "Planlagt offer", value: "Laura" },
        {
          label: "Fysisk skub i det tidligere loop",
          value: "Laura skubbede Ryan væk",
        },
        {
          label: "Fysisk dødsårsag i det tidligere loop",
          value: "Fald under selvforsvar",
        },
        { label: "Vurdering", value: "Selvforsvar" },
      ],
      extraStatistics: [
        { label: "Reddede personer", value: "2" },
        {
          label: "Falske selvmordsfortællinger afsløret",
          value: "1",
        },
      ],
    });
    const perfect = learnKnowledge(
      ryanState({ loop: 2 }),
      RYAN_OPTIONAL_FACTS,
    );
    expect(calculateCaseScore(perfect)).toBe(1050);
  });

  it("keeps all Ryan placeholders machine-readable and manifest ids unique", () => {
    const ids = DIRECTORS_CUT_ASSET_MANIFEST.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
    const assets = DIRECTORS_CUT_ASSET_MANIFEST.filter(
      ({ caseId }) => caseId === "ryan",
    );
    expect(assets).toHaveLength(17);
    expect(
      assets.every(
        (asset) =>
          asset.status === "placeholder" &&
          asset.exactContent.length > 0 &&
          asset.fallbackText.length > 0 &&
          asset.delivery.length > 0 &&
          asset.before.length > 0 &&
          asset.after.length > 0,
      ),
    ).toBe(true);

    const known = learnKnowledge(
      ryanState({ timeSlot: 3 }),
      KNOWLEDGE_IDS,
    );
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
            expect(hasDirectorsCutAsset(cue.placeholderAssetId)).toBe(
              true,
            );
          }
        }
      }
    }
  });

  it("initializes all Ryan conclusions as false and keeps A-F explicit", () => {
    const state = ryanState();
    expect(Object.keys(state.knowledge)).toEqual([...KNOWLEDGE_IDS]);
    expect(
      RYAN_CORE_CONCLUSIONS.every(
        (id) => state.knowledge[id] === false,
      ),
    ).toBe(true);
    expect(RYAN_CORE_CONCLUSIONS).toEqual([
      "ryan_physical_action_open_conclusion",
      "ryan_silencing_motive_conclusion",
      "ryan_arranged_ledge_meeting_conclusion",
      "ryan_false_suicide_plan_conclusion",
      "ryan_self_defense_conclusion",
      "ryan_responsibility_conclusion",
    ]);
  });
});

const RYAN_OPTIONAL_FACTS = [
  "ryan_group_manipulation_pattern",
  "ryan_manipulative_denial",
] as const satisfies readonly KnowledgeId[];
