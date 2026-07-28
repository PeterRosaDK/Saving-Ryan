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
    version: 2,
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
  };
}

export function createInitialGameState(): GameState {
  return createBaseGameState(DEFAULT_CASE_ID, "menu");
}

export function createCaseGameState(caseId: CaseId): GameState {
  return createBaseGameState(caseId, "intro");
}
