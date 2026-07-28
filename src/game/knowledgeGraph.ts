import type {
  GameEffect,
  GameState,
  KnowledgeId,
} from "../app/types";
import {
  DAVID_CORE_CONCLUSIONS,
  deriveDavidLead,
} from "./davidCase";
import {
  BARBARA_CORE_CONCLUSIONS,
  deriveBarbaraLead,
} from "./barbaraCase";
import {
  MARIE_CORE_CONCLUSIONS,
  deriveMarieLead,
} from "./marieCase";
import {
  JORGEN_CORE_CONCLUSIONS,
  deriveJorgenLead,
} from "./jorgenCase";

export const INVESTIGATION_STEP_IDS = [
  "observe_barbara_programming",
  "ask_david_about_barbara",
  "inspect_barbara_files",
  "read_sarah_letter",
  "ask_ryan_about_sarah",
  "witness_ryan_bullying_marie",
  "eavesdrop_barbara_and_ryan",
  "hear_bookcase_scrape",
  "notice_laura_disappearance",
  "watch_secret_passage",
  "discover_secret_passage",
  "earn_maries_confidence",
  "observe_laura_at_computer",
  "get_barbaras_help",
  "inspect_murder_necklace",
  "warn_ryan",
  "accuse_laura",
  "prevent_ryans_murder",
] as const;

export type InvestigationStepId = (typeof INVESTIGATION_STEP_IDS)[number];

export interface InvestigationStep {
  id: InvestigationStepId;
  requires: readonly KnowledgeId[];
  effects: readonly KnowledgeId[];
}

/*
 * This contains the semantic counterpart to the legacy BetingetLink chains
 * described on pages 68–77 of the project report plus explicitly documented
 * later knowledge routes. Scene placement and presentation remain owned by the
 * scene layer; this graph only describes deterministic knowledge progression.
 */
export const INVESTIGATION_STEPS = {
  observe_barbara_programming: {
    id: "observe_barbara_programming",
    requires: [],
    effects: ["barbara_is_computer_expert"],
  },
  ask_david_about_barbara: {
    id: "ask_david_about_barbara",
    requires: ["barbara_is_computer_expert"],
    effects: ["barbara_hacker_alias_intruder"],
  },
  inspect_barbara_files: {
    id: "inspect_barbara_files",
    requires: ["barbara_hacker_alias_intruder"],
    effects: ["barbara_forged_grades"],
  },
  read_sarah_letter: {
    id: "read_sarah_letter",
    requires: [],
    effects: ["ryan_has_girlfriend_sarah"],
  },
  ask_ryan_about_sarah: {
    id: "ask_ryan_about_sarah",
    requires: ["ryan_has_girlfriend_sarah"],
    effects: ["ryan_and_laura_were_together"],
  },
  witness_ryan_bullying_marie: {
    id: "witness_ryan_bullying_marie",
    requires: [],
    effects: ["ryan_bullied_marie"],
  },
  eavesdrop_barbara_and_ryan: {
    id: "eavesdrop_barbara_and_ryan",
    requires: [],
    effects: ["barbara_and_ryan_argued"],
  },
  hear_bookcase_scrape: {
    id: "hear_bookcase_scrape",
    requires: [],
    effects: ["heard_scraping_behind_bookcase"],
  },
  notice_laura_disappearance: {
    id: "notice_laura_disappearance",
    requires: [],
    effects: ["noticed_laura_disappear_near_reading_room"],
  },
  watch_secret_passage: {
    id: "watch_secret_passage",
    requires: [
      "heard_scraping_behind_bookcase",
      "noticed_laura_disappear_near_reading_room",
    ],
    effects: ["secret_passage_exists", "laura_used_secret_passage"],
  },
  discover_secret_passage: {
    id: "discover_secret_passage",
    requires: [],
    effects: ["secret_passage_exists"],
  },
  earn_maries_confidence: {
    id: "earn_maries_confidence",
    requires: [
      "ryan_bullied_marie",
      "ryan_and_laura_were_together",
    ],
    effects: ["ryan_left_laura"],
  },
  observe_laura_at_computer: {
    id: "observe_laura_at_computer",
    requires: [],
    effects: ["laura_hid_computer_activity"],
  },
  get_barbaras_help: {
    id: "get_barbaras_help",
    requires: [
      "barbara_is_computer_expert",
      "barbara_forged_grades",
      "laura_hid_computer_activity",
    ],
    effects: [
      "laura_was_in_institution",
      "laura_owns_polar_bear_necklace",
    ],
  },
  inspect_murder_necklace: {
    id: "inspect_murder_necklace",
    requires: [],
    effects: ["killer_dropped_necklace"],
  },
  warn_ryan: {
    id: "warn_ryan",
    requires: ["ryan_was_murdered"],
    effects: ["ryan_dismissed_warning"],
  },
  accuse_laura: {
    id: "accuse_laura",
    requires: ["ryan_left_laura", "necklace_connects_laura_to_scene"],
    effects: ["laura_confessed", "secret_passage_exists"],
  },
  prevent_ryans_murder: {
    id: "prevent_ryans_murder",
    requires: [
      "laura_confessed",
      "secret_passage_exists",
      "ryan_dismissed_warning",
    ],
    effects: ["ryan_was_saved"],
  },
} as const satisfies Record<InvestigationStepId, InvestigationStep>;

export function hasKnowledge(
  state: Pick<GameState, "knowledge">,
  requires: readonly KnowledgeId[],
): boolean {
  return requires.every((id) => state.knowledge[id]);
}

export function applyKnowledgeEffects(
  state: GameState,
  effects: readonly GameEffect[],
): GameState {
  const learned = effects
    .filter((effect) => effect.type === "LEARN")
    .map((effect) => effect.id);

  return learnKnowledge(state, learned);
}

export function learnKnowledge(
  state: GameState,
  ids: readonly KnowledgeId[],
): GameState {
  const nextKnowledge = { ...state.knowledge };
  let changed = false;

  for (const id of ids) {
    if (!nextKnowledge[id]) {
      nextKnowledge[id] = true;
      changed = true;
    }
  }

  if (
    state.selectedCaseId === "laura" &&
    nextKnowledge.killer_dropped_necklace &&
    nextKnowledge.laura_owns_polar_bear_necklace &&
    !nextKnowledge.necklace_connects_laura_to_scene
  ) {
    nextKnowledge.necklace_connects_laura_to_scene = true;
    changed = true;
  }

  if (state.selectedCaseId === "david") {
    if (
      nextKnowledge.sarah_left_david_for_ryan &&
      !nextKnowledge.david_motive_conclusion
    ) {
      nextKnowledge.david_motive_conclusion = true;
      changed = true;
    }
    if (
      nextKnowledge.david_picked_up_necklace &&
      nextKnowledge.necklace_found_in_ryans_hand &&
      !nextKnowledge.david_necklace_possession_conclusion
    ) {
      nextKnowledge.david_necklace_possession_conclusion = true;
      changed = true;
    }
    if (
      nextKnowledge.david_followed_ryan &&
      !nextKnowledge.david_opportunity_conclusion
    ) {
      nextKnowledge.david_opportunity_conclusion = true;
      changed = true;
    }
  }

  if (state.selectedCaseId === "barbara") {
    if (
      nextKnowledge.barbara_forged_grades &&
      nextKnowledge.barbara_blackmailed_by_ryan &&
      !nextKnowledge.barbara_motive_conclusion
    ) {
      nextKnowledge.barbara_motive_conclusion = true;
      changed = true;
    }
    if (
      nextKnowledge.barbara_left_with_ryan &&
      nextKnowledge.barbara_alibi_gap &&
      !nextKnowledge.barbara_opportunity_conclusion
    ) {
      nextKnowledge.barbara_opportunity_conclusion = true;
      changed = true;
    }
    if (
      nextKnowledge.barbara_opened_plans_before_murder &&
      nextKnowledge.building_plans_show_passage &&
      !nextKnowledge.barbara_passage_conclusion
    ) {
      nextKnowledge.barbara_passage_conclusion = true;
      changed = true;
    }
    if (
      nextKnowledge.laura_put_necklace_in_bag &&
      nextKnowledge.necklace_missing_from_laura_bag &&
      nextKnowledge.barbara_had_access_to_laura_bag &&
      nextKnowledge.barbara_saved_necklace_image_before_murder &&
      nextKnowledge.necklace_found_in_ryans_hand &&
      nextKnowledge.barbara_presented_image_as_new &&
      nextKnowledge.barbara_timestamps_compared &&
      !nextKnowledge.barbara_staging_conclusion
    ) {
      nextKnowledge.barbara_staging_conclusion = true;
      changed = true;
    }
  }

  if (state.selectedCaseId === "marie") {
    if (
      nextKnowledge.marie_wrote_report &&
      nextKnowledge.ryan_threatened_remove_marie_credit &&
      nextKnowledge.ryan_threatened_laura &&
      !nextKnowledge.marie_motive_conclusion
    ) {
      nextKnowledge.marie_motive_conclusion = true;
      changed = true;
    }
    if (
      nextKnowledge.marie_left_group_before_scream &&
      nextKnowledge.marie_claimed_no_absence &&
      !nextKnowledge.marie_alibi_conclusion
    ) {
      nextKnowledge.marie_alibi_conclusion = true;
      changed = true;
    }
    if (
      nextKnowledge.marie_discovered_passage &&
      nextKnowledge.secret_passage_exists &&
      !nextKnowledge.marie_passage_conclusion
    ) {
      nextKnowledge.marie_passage_conclusion = true;
      changed = true;
    }
    if (
      nextKnowledge.marie_fragment_in_ryan_hand &&
      nextKnowledge.marie_fragment_has_edits &&
      nextKnowledge.marie_torn_page_in_folder &&
      !nextKnowledge.marie_physical_conclusion
    ) {
      nextKnowledge.marie_physical_conclusion = true;
      changed = true;
    }
  }

  if (state.selectedCaseId === "jorgen") {
    if (
      nextKnowledge.jorgen_prior_loop_reference_ready &&
      nextKnowledge.jorgen_note_references_previous_loop &&
      !nextKnowledge.jorgen_other_remembers_conclusion
    ) {
      nextKnowledge.jorgen_other_remembers_conclusion = true;
      changed = true;
    }
    if (
      nextKnowledge.jorgen_login_used &&
      nextKnowledge.jorgen_lookalike_seen &&
      nextKnowledge.jorgen_player_alibi &&
      !nextKnowledge.jorgen_identity_used_conclusion
    ) {
      nextKnowledge.jorgen_identity_used_conclusion = true;
      changed = true;
    }
    if (
      nextKnowledge.jorgen_passage_marker_survived &&
      nextKnowledge.jorgen_outside_control_reset &&
      nextKnowledge.secret_passage_exists &&
      !nextKnowledge.jorgen_passage_persistence_conclusion
    ) {
      nextKnowledge.jorgen_passage_persistence_conclusion = true;
      changed = true;
    }
    if (
      nextKnowledge.jorgen_fragment_in_ryan_hand &&
      nextKnowledge.jorgen_fragment_handwriting &&
      nextKnowledge.jorgen_current_page_intact &&
      nextKnowledge.jorgen_fragment_future_knowledge &&
      !nextKnowledge.jorgen_fragment_from_future_conclusion
    ) {
      nextKnowledge.jorgen_fragment_from_future_conclusion = true;
      changed = true;
    }
    if (
      nextKnowledge.jorgen_passage_persistence_conclusion &&
      nextKnowledge.jorgen_identity_used_conclusion &&
      nextKnowledge.jorgen_fragment_future_knowledge &&
      nextKnowledge.jorgen_unknown_in_passage_at_reset &&
      !nextKnowledge.jorgen_later_self_exists_conclusion
    ) {
      nextKnowledge.jorgen_later_self_exists_conclusion = true;
      changed = true;
    }
    if (
      nextKnowledge.jorgen_fragment_from_future_conclusion &&
      nextKnowledge.jorgen_later_self_exists_conclusion &&
      nextKnowledge.jorgen_ryan_called_with_fragment &&
      !nextKnowledge.jorgen_future_self_murderer_conclusion
    ) {
      nextKnowledge.jorgen_future_self_murderer_conclusion = true;
      changed = true;
    }
  }

  if (!changed) return state;

  const caseConclusions =
    state.selectedCaseId === "david"
      ? DAVID_CORE_CONCLUSIONS
      : state.selectedCaseId === "barbara"
        ? BARBARA_CORE_CONCLUSIONS
        : state.selectedCaseId === "marie"
          ? MARIE_CORE_CONCLUSIONS
          : state.selectedCaseId === "jorgen"
            ? JORGEN_CORE_CONCLUSIONS
        : [];
  const newlyDerived = caseConclusions.filter(
    (id) => nextKnowledge[id] && !state.knowledge[id],
  );
  const knowledgeState: GameState = {
    ...state,
    knowledge: nextKnowledge,
    caseProgress: {
      ...state.caseProgress,
      pendingInsights: [
        ...new Set([
          ...state.caseProgress.pendingInsights,
          ...newlyDerived,
        ]),
      ],
    },
  };
  return state.selectedCaseId === "david"
    ? {
        ...knowledgeState,
        caseProgress: {
          ...knowledgeState.caseProgress,
          currentLead: deriveDavidLead(knowledgeState),
        },
      }
      : state.selectedCaseId === "barbara"
      ? {
          ...knowledgeState,
          caseProgress: {
            ...knowledgeState.caseProgress,
            currentLead: deriveBarbaraLead(knowledgeState),
          },
        }
      : state.selectedCaseId === "marie"
        ? {
            ...knowledgeState,
            caseProgress: {
              ...knowledgeState.caseProgress,
              currentLead: deriveMarieLead(knowledgeState),
            },
          }
        : state.selectedCaseId === "jorgen"
          ? {
              ...knowledgeState,
              caseProgress: {
                ...knowledgeState.caseProgress,
                currentLead: deriveJorgenLead(knowledgeState),
              },
            }
      : knowledgeState;
}

export function executeInvestigationStep(
  state: GameState,
  stepId: InvestigationStepId,
): GameState {
  const step = INVESTIGATION_STEPS[stepId];
  if (!hasKnowledge(state, step.requires)) {
    return state;
  }

  return learnKnowledge(state, step.effects);
}

export function getReachableKnowledge(
  initiallyKnown: readonly KnowledgeId[] = [],
): ReadonlySet<KnowledgeId> {
  const reachable = new Set(initiallyKnown);
  let changed = true;

  while (changed) {
    changed = false;

    for (const step of Object.values(INVESTIGATION_STEPS)) {
      if (!step.requires.every((id) => reachable.has(id))) {
        continue;
      }

      for (const effect of step.effects) {
        if (!reachable.has(effect)) {
          reachable.add(effect);
          changed = true;
        }
      }

      if (
        reachable.has("killer_dropped_necklace") &&
        reachable.has("laura_owns_polar_bear_necklace") &&
        !reachable.has("necklace_connects_laura_to_scene")
      ) {
        reachable.add("necklace_connects_laura_to_scene");
        changed = true;
      }
    }
  }

  return reachable;
}
