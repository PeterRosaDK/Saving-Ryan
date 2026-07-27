import { createInitialGameState } from "./gameState";
import type { GameAction, GameState } from "./types";
import { reduceGameState } from "../game/stateMachine";

type Subscriber = (state: GameState) => void;

export interface GameStore {
  getState(): GameState;
  dispatch(action: GameAction): void;
  subscribe(subscriber: Subscriber): () => void;
}

export function createGameStore(
  initialState: GameState = createInitialGameState(),
): GameStore {
  let state = initialState;
  const subscribers = new Set<Subscriber>();

  return {
    getState() {
      return state;
    },

    dispatch(action) {
      state = reduceGameState(state, action);
      subscribers.forEach((subscriber) => subscriber(state));
    },

    subscribe(subscriber) {
      subscribers.add(subscriber);
      subscriber(state);

      return () => {
        subscribers.delete(subscriber);
      };
    },
  };
}
