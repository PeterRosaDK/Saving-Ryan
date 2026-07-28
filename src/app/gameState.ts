import {
  KNOWLEDGE_IDS,
  type CaseId,
  type GameState,
  type KnowledgeId,
  type LoopState,
} from "./types";
import { DEFAULT_CASE_ID } from "../game/caseDefinitions";

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

function createBaseGameState(
  selectedCaseId: CaseId,
  phase: GameState["phase"],
): GameState {
  return {
    version: 3,
    selectedCaseId,
    phase,
    location: "A",
    timeSlot: 1,
    loop: 1,
    knowledge: createInitialKnowledge(),
    dialogue: {
      activePerson: null,
    },
    loopState: createInitialLoopState(),
    pendingTransition: null,
    caseProgress: {
      currentLead:
        selectedCaseId === "david"
          ? "Find ud af, hvilke konflikter Ryan har skabt i gruppen."
          : "",
      pendingInsights: [],
      statistics: {
        confrontations: 0,
        wrongAccusations: 0,
        prematureAccusations: 0,
      },
      reconstructionAvailable: false,
      reconstructionCompleted: false,
    },
  };
}

export function createInitialGameState(): GameState {
  return createBaseGameState(DEFAULT_CASE_ID, "menu");
}

export function createCaseGameState(caseId: CaseId): GameState {
  return createBaseGameState(caseId, "intro");
}
