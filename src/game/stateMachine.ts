import { createInitialGameState } from "../app/gameState";
import type {
  GameAction,
  GameEffect,
  GameState,
  TimeAdvanceCause,
} from "../app/types";
import {
  getNextTimeSlot,
  getScene,
  toSceneId,
} from "./sceneRegistry";
import {
  canPerformSceneInteraction,
  getSceneInteraction,
  getSceneInteractionTimeCost,
  getSceneInteractions,
} from "./sceneInteractions";
import { applyKnowledgeEffects } from "./knowledgeGraph";
import { executeDialogueChoice } from "./dialogueEngine";
import { isCharacterInScene } from "./sceneOccupants";
import { getLocationTransitionEvent } from "./transitionEvents";

function applyEffects(
  state: GameState,
  effects: readonly GameEffect[],
): GameState {
  return applyKnowledgeEffects(state, effects);
}

function applyTriggeredSceneEffects(
  state: GameState,
  sceneId: ReturnType<typeof toSceneId>,
  trigger: "enter",
): GameState {
  return getSceneInteractions(sceneId, trigger).reduce(
    (nextState, interaction) =>
      applyEffects(nextState, interaction.effects),
    state,
  );
}

function canExplore(state: GameState): boolean {
  return state.phase === "exploration" && state.pendingTransition === null;
}

function beginTimeAdvance(
  state: GameState,
  cause: TimeAdvanceCause,
): GameState {
  const sceneId = toSceneId(state.location, state.timeSlot);
  const nextTime = getNextTimeSlot(state.timeSlot);

  return {
    ...state,
    pendingTransition: {
      from: sceneId,
      to: toSceneId(state.location, nextTime),
      cause,
      beginsNewLoop: state.timeSlot === 4,
    },
  };
}

export function reduceGameState(
  state: GameState,
  action: GameAction,
): GameState {
  switch (action.type) {
    case "INTRO_FINISHED":
    case "SKIP_INTRO": {
      if (state.phase !== "intro") {
        return state;
      }

      const postIntroState: GameState = {
        ...state,
        phase: "exploration",
      };

      return applyEffects(postIntroState, [
        {
          type: "LEARN",
          id: "ryan_was_murdered",
        },
      ]);
    }

    case "MOVE_TO_LOCATION": {
      if (!canExplore(state) || action.location === state.location) {
        return state;
      }

      const movedState: GameState = {
        ...state,
        location: action.location,
      };

      return applyTriggeredSceneEffects(
        movedState,
        toSceneId(movedState.location, movedState.timeSlot),
        "enter",
      );
    }

    case "WAIT": {
      if (!canExplore(state)) {
        return state;
      }

      const sceneId = toSceneId(state.location, state.timeSlot);
      const event = getLocationTransitionEvent(sceneId);

      return beginTimeAdvance(state, {
        kind: "clock",
        eventId: event.id,
      });
    }

    case "COMPLETE_TRANSITION": {
      if (
        state.phase !== "exploration" ||
        state.pendingTransition === null
      ) {
        return state;
      }

      const pending = state.pendingTransition;
      const target = getScene(pending.to);
      const sourceEffects =
        pending.cause.kind === "clock"
          ? getLocationTransitionEvent(pending.cause.eventId).effects
          : getSceneInteraction(pending.cause.id).effects;
      const effectState = applyEffects(state, sourceEffects);
      const seenClockEvent =
        pending.cause.kind === "clock"
          ? getLocationTransitionEvent(pending.cause.eventId).scene
          : null;
      const completedState: GameState = {
        ...effectState,
        location: target.location.id,
        timeSlot: target.time.id,
        loop: pending.beginsNewLoop
          ? effectState.loop + 1
          : effectState.loop,
        loopState: {
          seenTransitions: pending.beginsNewLoop
            ? []
            : seenClockEvent
              ? [
                  ...new Set([
                    ...effectState.loopState.seenTransitions,
                    seenClockEvent,
                  ]),
                ]
              : effectState.loopState.seenTransitions,
        },
        pendingTransition: null,
      };

      return applyTriggeredSceneEffects(
        completedState,
        pending.to,
        "enter",
      );
    }

    case "PERFORM_INTERACTION": {
      if (!canExplore(state)) {
        return state;
      }

      const interaction = getSceneInteraction(action.id);
      const sceneId = toSceneId(state.location, state.timeSlot);
      if (
        interaction.trigger !== "manual" ||
        !(interaction.scenes as readonly typeof sceneId[]).includes(sceneId) ||
        !canPerformSceneInteraction(state, interaction)
      ) {
        return state;
      }

      if (getSceneInteractionTimeCost(state, interaction) === 1) {
        if (!interaction.timeAdvanceCue) {
          throw new Error(
            `Timed interaction has no transition cue: ${interaction.id}`,
          );
        }

        return beginTimeAdvance(state, {
          kind: "interaction",
          id: interaction.id,
        });
      }

      const nextState = applyEffects(state, interaction.effects);
      return interaction.concludesStory
        ? {
            ...nextState,
            phase: "ending",
          }
        : nextState;
    }

    case "START_DIALOGUE": {
      if (!canExplore(state)) {
        return state;
      }

      const sceneId = toSceneId(state.location, state.timeSlot);
      if (!isCharacterInScene(sceneId, action.person)) {
        return state;
      }

      return {
        ...state,
        phase: "dialogue",
        dialogue: {
          ...state.dialogue,
          activePerson: action.person,
        },
      };
    }

    case "CLOSE_DIALOGUE": {
      if (
        state.phase !== "dialogue" ||
        state.dialogue.activePerson === null
      ) {
        return state;
      }

      return {
        ...state,
        phase: "exploration",
        dialogue: {
          ...state.dialogue,
          activePerson: null,
        },
      };
    }

    case "COMPLETE_DIALOGUE_CHOICE": {
      if (
        state.phase !== "dialogue" ||
        state.dialogue.activePerson !== action.person
      ) {
        return state;
      }

      return executeDialogueChoice(
        state,
        action.person,
        action.topic,
        action.completion,
      ).state;
    }

    case "RESET_GAME":
      return createInitialGameState();
  }
}
