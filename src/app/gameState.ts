import {
  KNOWLEDGE_IDS,
  type GameState,
  type KnowledgeId,
  type LoopState,
} from "./types";

function createInitialKnowledge(): Record<KnowledgeId, boolean> {
  return Object.fromEntries(
    KNOWLEDGE_IDS.map((id) => [id, false]),
  ) as Record<KnowledgeId, boolean>;
}

export function createInitialLoopState(): LoopState {
  return {
    seenTransitions: [],
    dialogue: {
      askedChoices: [],
      barbaraHelp: "not_requested",
      refusesFurtherDialogue: [],
    },
  };
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
    },
    loopState: createInitialLoopState(),
    pendingTransition: null,
  };
}
