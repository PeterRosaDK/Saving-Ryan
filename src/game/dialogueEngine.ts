import type {
  CharacterId,
  DialogueChoiceId,
  DialogueTopicId,
  GameState,
} from "../app/types";
import {
  getDialogueChoices,
  type DialogueChoice,
} from "./dialogueData";
import {
  applyKnowledgeEffects,
  hasKnowledge,
} from "./knowledgeGraph";

export type DialogueCompletion = "ended" | "skipped";

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

  const current = state.dialogue.barbaraHelp;
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
        dialogue: {
          ...state.dialogue,
          barbaraHelp: next,
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

  const askedChoices = state.dialogue.askedChoices.includes(choice.id)
    ? state.dialogue.askedChoices
    : [...state.dialogue.askedChoices, choice.id];
  let nextState =
    askedChoices === state.dialogue.askedChoices
      ? state
      : {
          ...state,
          dialogue: {
            ...state.dialogue,
            askedChoices,
          },
        };

  const appliedEffects =
    completion === "ended" || choice.effectsOnSkip;

  if (appliedEffects) {
    nextState = applyKnowledgeEffects(nextState, choice.effects);
    nextState = advanceBarbaraHelp(nextState, choice);
  }

  return {
    state: nextState,
    choice,
    appliedEffects,
  };
}
