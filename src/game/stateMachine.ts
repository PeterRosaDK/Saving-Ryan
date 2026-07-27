import { createInitialGameState } from "../app/gameState";
import type {
  GameAction,
  GameEffect,
  GameState,
  TimeSlot,
} from "../app/types";
import { getScene, toSceneId } from "./sceneRegistry";
import {
  getSceneInteraction,
  getSceneInteractions,
} from "./sceneInteractions";

const NEXT_TIME: Readonly<Record<TimeSlot, TimeSlot>> = {
  1: 2,
  2: 3,
  3: 4,
  4: 1,
};

function applyEffect(state: GameState, effect: GameEffect): GameState {
  switch (effect.type) {
    case "LEARN":
      if (state.knowledge[effect.id]) {
        return state;
      }

      return {
        ...state,
        knowledge: {
          ...state.knowledge,
          [effect.id]: true,
        },
      };
  }
}

function applyEffects(
  state: GameState,
  effects: readonly GameEffect[],
): GameState {
  return effects.reduce(applyEffect, state);
}

function applyTriggeredSceneEffects(
  state: GameState,
  sceneId: ReturnType<typeof toSceneId>,
  trigger: "enter" | "wait",
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

      return applyEffect(postIntroState, {
        type: "LEARN",
        id: "ryan_was_murdered",
      });
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
      const nextTime = NEXT_TIME[state.timeSlot];
      const nextSceneId = toSceneId(state.location, nextTime);
      const beginsNewLoop = state.timeSlot === 4;
      const specialSequence = getSceneInteractions(sceneId, "wait").find(
        ({ specialSequence: sequence }) => sequence !== undefined,
      )?.specialSequence;

      return {
        ...state,
        pendingTransition: {
          from: sceneId,
          to: nextSceneId,
          transitionId: sceneId,
          specialSequence,
          beginsNewLoop,
        },
      };
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
      let completedState: GameState = {
        ...state,
        location: target.location.id,
        timeSlot: target.time.id,
        loop: pending.beginsNewLoop ? state.loop + 1 : state.loop,
        loopState: {
          seenTransitions: pending.beginsNewLoop
            ? []
            : [
                ...new Set([
                  ...state.loopState.seenTransitions,
                  pending.transitionId,
                ]),
              ],
        },
        pendingTransition: null,
      };

      completedState = applyTriggeredSceneEffects(
        completedState,
        pending.from,
        "wait",
      );
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
        interaction.scene !== sceneId
      ) {
        return state;
      }

      return applyEffects(state, interaction.effects);
    }

    case "RESET_GAME":
      return createInitialGameState();
  }
}
