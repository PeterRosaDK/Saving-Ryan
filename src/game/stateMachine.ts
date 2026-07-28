import {
  createCaseGameState,
  createInitialGameState,
  createInitialLoopState,
} from "../app/gameState";
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
  return getSceneInteractions(state, sceneId, trigger).reduce(
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
    case "START_CASE": {
      if (state.phase !== "menu") {
        return state;
      }

      return createCaseGameState(action.caseId);
    }

    case "INTRO_FINISHED":
    case "SKIP_INTRO": {
      if (state.phase !== "intro") {
        return state;
      }

      return {
        ...state,
        phase: "exploration",
      };
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
      const event = getLocationTransitionEvent(
        sceneId,
        state.selectedCaseId,
      );

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
          ? getLocationTransitionEvent(
              pending.cause.eventId,
              state.selectedCaseId,
            ).effects
          : getSceneInteraction(pending.cause.id, state).effects;
      const sourceScene = getScene(pending.from);
      const sourceEffectState = applyEffects(state, sourceEffects);
      const effectState =
        sourceScene.time.id === 2 && target.time.id === 3
          ? applyEffects(sourceEffectState, [
              {
                type: "LEARN",
                id: "ryan_was_murdered",
              },
            ])
          : sourceEffectState;
      const seenClockEvent =
        pending.cause.kind === "clock"
          ? getLocationTransitionEvent(
              pending.cause.eventId,
              state.selectedCaseId,
            ).scene
          : null;
      const completedState: GameState = {
        ...effectState,
        location: target.location.id,
        timeSlot: target.time.id,
        loop: pending.beginsNewLoop
          ? effectState.loop + 1
          : effectState.loop,
        loopState: pending.beginsNewLoop
          ? createInitialLoopState()
          : {
              ...effectState.loopState,
              seenTransitions: seenClockEvent
                ? [
                    ...new Set([
                      ...effectState.loopState.seenTransitions,
                      seenClockEvent,
                    ]),
                  ]
                : effectState.loopState.seenTransitions,
            },
        pendingTransition: null,
        phase:
          pending.beginsNewLoop &&
          effectState.selectedCaseId === "david" &&
          effectState.knowledge.david_confessed &&
          !effectState.caseProgress.reconstructionCompleted
            ? "reconstruction"
            : effectState.phase,
        caseProgress: {
          ...effectState.caseProgress,
          reconstructionAvailable:
            effectState.caseProgress.reconstructionAvailable ||
            (pending.beginsNewLoop &&
              effectState.selectedCaseId === "david" &&
              effectState.knowledge.david_confessed),
        },
      };

      return completedState.phase === "exploration"
        ? applyTriggeredSceneEffects(completedState, pending.to, "enter")
        : completedState;
    }

    case "PERFORM_INTERACTION": {
      if (!canExplore(state)) {
        return state;
      }

      const interaction = getSceneInteraction(action.id, state);
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

    case "DISMISS_INSIGHTS":
      return state.caseProgress.pendingInsights.length === 0
        ? state
        : {
            ...state,
            caseProgress: {
              ...state.caseProgress,
              pendingInsights: [],
            },
          };

    case "COMPLETE_RECONSTRUCTION": {
      if (
        state.phase !== "reconstruction" ||
        state.selectedCaseId !== "david"
      ) {
        return state;
      }
      const recorded = applyEffects(state, [
        { type: "LEARN", id: "david_reconstruction_recorded" },
      ]);
      return {
        ...recorded,
        phase: "exploration",
        caseProgress: {
          ...recorded.caseProgress,
          reconstructionAvailable: true,
          reconstructionCompleted: true,
          currentLead:
            "Vær i læsesalen ved middag og stop David.",
        },
      };
    }

    case "RESET_GAME":
      return createInitialGameState();
  }
}
