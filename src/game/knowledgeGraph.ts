import type {
  GameEffect,
  GameState,
  KnowledgeId,
} from "../app/types";

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
    requires: [],
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
    nextKnowledge.killer_dropped_necklace &&
    nextKnowledge.laura_owns_polar_bear_necklace &&
    !nextKnowledge.necklace_connects_laura_to_scene
  ) {
    nextKnowledge.necklace_connects_laura_to_scene = true;
    changed = true;
  }

  return changed
    ? {
        ...state,
        knowledge: nextKnowledge,
      }
    : state;
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
