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

function advanceBarbaraHelp(
  state: GameState,
  choice: DialogueChoice,
): GameState {
  if (choice.topic !== "ask_barbara_for_help") {
    return state;
  }

  const current = state.loopState.dialogue.barbaraHelp;
  const next =
    current === "ready"
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
  let nextState =
    askedChoices === state.loopState.dialogue.askedChoices
      ? state
      : {
          ...state,
          loopState: {
            ...state.loopState,
            dialogue: {
              ...state.loopState.dialogue,
              askedChoices,
            },
          },
        };

  const appliedEffects =
    completion === "ended" || choice.effectsOnSkip;

  if (appliedEffects) {
    nextState = applyKnowledgeEffects(nextState, choice.effects);
    nextState = advanceBarbaraHelp(nextState, choice);
  }
  nextState = recordInconclusiveAccusation(nextState, choice);

  return {
    state: nextState,
    choice,
    appliedEffects,
  };
}
