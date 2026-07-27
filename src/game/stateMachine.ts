import { createInitialGameState } from "../app/gameState";
import type {
  GameAction,
  GameState,
  KnowledgeStatus,
  TimeSlot,
} from "../app/types";
import { toSceneId } from "./sceneRegistry";
import { TRANSITION_TEXT } from "./transitionText";

const NEXT_TIME: Readonly<Record<TimeSlot, TimeSlot>> = {
  1: 2,
  2: 3,
  3: 4,
  4: 1,
};

export function reduceGameState(
  state: GameState,
  action: GameAction,
): GameState {
  switch (action.type) {
    case "START_GAME":
      return {
        ...state,
        phase: "exploration",
      };

    case "MOVE_TO_LOCATION":
      return {
        ...state,
        location: action.location,
        lastTransition: null,
      };

    case "WAIT": {
      const sceneId = toSceneId(state.location, state.timeSlot);
      const beginsNewLoop = state.timeSlot === 4;

      return {
        ...state,
        timeSlot: NEXT_TIME[state.timeSlot],
        loop: beginsNewLoop ? state.loop + 1 : state.loop,
        loopState: {
          seenTransitions: beginsNewLoop
            ? []
            : [...new Set([...state.loopState.seenTransitions, sceneId])],
        },
        lastTransition: TRANSITION_TEXT[sceneId],
      };
    }

    case "SET_KNOWLEDGE": {
      const status: KnowledgeStatus = action.status ?? "discovered";

      return {
        ...state,
        knowledge: {
          ...state.knowledge,
          [action.id]: status,
        },
      };
    }

    case "DISMISS_TRANSITION":
      return {
        ...state,
        lastTransition: null,
      };

    case "RESET_GAME":
      return createInitialGameState();
  }
}
