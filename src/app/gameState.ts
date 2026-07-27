import type { GameState, KnowledgeId, KnowledgeStatus } from "./types";

export const KNOWLEDGE_IDS = [
  "barbara_is_computer_expert",
  "barbara_hacker_alias_intruder",
  "barbara_forged_grades",
  "ryan_has_girlfriend_sarah",
  "ryan_bullied_marie",
  "laura_hid_computer_activity",
  "ryan_and_laura_were_together",
  "ryan_left_laura",
  "secret_passage_exists",
  "laura_was_in_institution",
  "laura_owns_polar_bear_necklace",
  "ryan_was_murdered",
  "killer_dropped_necklace",
  "necklace_connects_laura_to_scene",
  "laura_confessed",
] as const satisfies readonly KnowledgeId[];

function createInitialKnowledge(): Record<KnowledgeId, KnowledgeStatus> {
  return Object.fromEntries(
    KNOWLEDGE_IDS.map((id) => [id, "unknown"]),
  ) as Record<KnowledgeId, KnowledgeStatus>;
}

export function createInitialGameState(): GameState {
  return {
    version: 1,
    phase: "intro",
    location: "A",
    timeSlot: 1,
    loop: 1,
    knowledge: createInitialKnowledge(),
    loopState: {
      seenTransitions: [],
    },
    dialogue: {
      person: null,
      returnScene: null,
      askedTopics: [],
    },
    lastTransition: null,
  };
}
