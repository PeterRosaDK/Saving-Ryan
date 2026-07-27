import {
  KNOWLEDGE_IDS,
  type GameState,
  type KnowledgeId,
} from "./types";

function createInitialKnowledge(): Record<KnowledgeId, boolean> {
  return Object.fromEntries(
    KNOWLEDGE_IDS.map((id) => [id, false]),
  ) as Record<KnowledgeId, boolean>;
}

export function createInitialGameState(): GameState {
  return {
    version: 1,
    phase: "intro",
    location: "A",
    timeSlot: 1,
    loop: 1,
    knowledge: createInitialKnowledge(),
    dialogue: {
      activePerson: null,
      askedChoices: [],
      barbaraHelp: "not_requested",
    },
    loopState: {
      seenTransitions: [],
    },
    pendingTransition: null,
  };
}
