import type {
  CharacterId,
  DialogueChoiceId,
  DialogueTopicId,
  GameState,
} from "../app/types";
import {
  getDialogueChoices,
  isConclusiveAccusation,
  type DialogueChoice,
} from "./dialogueData";
import {
  applyKnowledgeEffects,
  hasKnowledge,
} from "./knowledgeGraph";
import { isDirectorsCutCaseId } from "./directorsCutCaseContent";

export type DialogueCompletion = "ended" | "skipped";

export function getDialogueSequenceCompletion(
  questionCompletion: DialogueCompletion,
  answerCompletion?: DialogueCompletion,
): DialogueCompletion {
  return answerCompletion ?? questionCompletion;
}

export interface DialogueTransition {
  state: GameState;
  choice: DialogueChoice | null;
  appliedEffects: boolean;
}

export function getAvailableDialogueChoices(
  state: GameState,
  person: CharacterId,
): readonly DialogueChoice[] {
  return getDialogueChoices(state, person).filter((choice) =>
    hasKnowledge(state, choice.requires),
  );
}

export function hasSeenCurrentDialogueResponse(
  state: Pick<GameState, "loopState">,
  choice: Pick<DialogueChoice, "responseKey">,
): boolean {
  return state.loopState.dialogue.seenResponses.includes(
    choice.responseKey,
  );
}

function advanceBarbaraHelp(
  state: GameState,
  choice: DialogueChoice,
): GameState {
  if (choice.topic !== "ask_barbara_for_help") {
    return state;
  }

  const current = state.loopState.dialogue.barbaraHelp;
  const next =
    state.selectedCaseId === "barbara"
      ? "completed"
      : current === "ready"
      ? "completed"
      : state.knowledge.barbara_forged_grades
        ? "ready"
        : "requested";

  return current === next
    ? state
    : {
        ...state,
        loopState: {
          ...state.loopState,
          dialogue: {
            ...state.loopState.dialogue,
            barbaraHelp: next,
          },
        },
      };
}

function recordInconclusiveAccusation(
  state: GameState,
  choice: DialogueChoice,
): GameState {
  if (
    isDirectorsCutCaseId(state.selectedCaseId) ||
    choice.topic !== "accuse" ||
    isConclusiveAccusation(state, choice.person) ||
    state.loopState.dialogue.refusesFurtherDialogue.includes(
      choice.person,
    )
  ) {
    return state;
  }

  return {
    ...state,
    loopState: {
      ...state.loopState,
      dialogue: {
        ...state.loopState.dialogue,
        refusesFurtherDialogue: [
          ...state.loopState.dialogue.refusesFurtherDialogue,
          choice.person,
        ],
      },
    },
  };
}

function recordAccusationStatistics(
  state: GameState,
  choice: DialogueChoice,
): GameState {
  if (!choice.accusationOutcome) return state;
  const current = state.caseProgress.statistics;
  return {
    ...state,
    caseProgress: {
      ...state.caseProgress,
      statistics: {
        confrontations: current.confrontations + 1,
        wrongAccusations:
          current.wrongAccusations +
          (choice.accusationOutcome === "wrong" ? 1 : 0),
        prematureAccusations:
          current.prematureAccusations +
          (choice.accusationOutcome === "premature" ? 1 : 0),
      },
    },
  };
}

export function executeDialogueChoice(
  state: GameState,
  person: CharacterId,
  topic: DialogueTopicId,
  completion: DialogueCompletion = "ended",
): DialogueTransition {
  const id: DialogueChoiceId = `${person}:${topic}`;
  const choice =
    getAvailableDialogueChoices(state, person).find(
      (candidate) => candidate.id === id,
    ) ?? null;

  if (!choice) {
    return {
      state,
      choice: null,
      appliedEffects: false,
    };
  }

  const askedChoices = state.loopState.dialogue.askedChoices.includes(
    choice.id,
  )
    ? state.loopState.dialogue.askedChoices
    : [...state.loopState.dialogue.askedChoices, choice.id];
  const seenResponses =
    state.loopState.dialogue.seenResponses.includes(choice.responseKey)
      ? state.loopState.dialogue.seenResponses
      : [
          ...state.loopState.dialogue.seenResponses,
          choice.responseKey,
        ];
  let nextState = {
    ...state,
    loopState: {
      ...state.loopState,
      dialogue: {
        ...state.loopState.dialogue,
        askedChoices,
        seenResponses,
      },
    },
  };

  const appliedEffects =
    completion === "ended" || choice.effectsOnSkip;

  if (appliedEffects) {
    nextState = applyKnowledgeEffects(nextState, choice.effects);
    nextState = advanceBarbaraHelp(nextState, choice);
  }
  nextState = recordAccusationStatistics(nextState, choice);
  nextState = recordInconclusiveAccusation(nextState, choice);

  return {
    state: nextState,
    choice,
    appliedEffects,
  };
}
