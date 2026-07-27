import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/app/gameState";
import type { GameState } from "../src/app/types";
import { SCENES, toSceneId } from "../src/game/sceneRegistry";
import { reduceGameState } from "../src/game/stateMachine";

describe("legacy game state", () => {
  it("starts at the intro with the A1 scene ready", () => {
    const state = createInitialGameState();

    expect(state.phase).toBe("intro");
    expect(toSceneId(state.location, state.timeSlot)).toBe("A1");
    expect(state.loop).toBe(1);
    expect(Object.values(state.knowledge).every((value) => value === "unknown")).toBe(true);
  });

  it("contains the complete five-location by four-time scene grid", () => {
    expect(SCENES).toHaveLength(20);
    expect(new Set(SCENES.map(({ id }) => id)).size).toBe(20);
    expect(SCENES.at(0)?.id).toBe("A1");
    expect(SCENES.at(-1)?.id).toBe("E4");
  });

  it("starts exploration without changing scene or knowledge", () => {
    const initial = createInitialGameState();
    const started = reduceGameState(initial, { type: "START_GAME" });

    expect(started.phase).toBe("exploration");
    expect(toSceneId(started.location, started.timeSlot)).toBe("A1");
    expect(started.knowledge).toEqual(initial.knowledge);
  });

  it("moves between locations without advancing time", () => {
    const initial = {
      ...createInitialGameState(),
      phase: "exploration" as const,
      timeSlot: 3 as const,
    };
    const moved = reduceGameState(initial, {
      type: "MOVE_TO_LOCATION",
      location: "E",
    });

    expect(toSceneId(moved.location, moved.timeSlot)).toBe("E3");
    expect(moved.loop).toBe(1);
  });

  it("waits in place and advances one time slot", () => {
    const initial = {
      ...createInitialGameState(),
      phase: "exploration" as const,
      location: "B" as const,
      timeSlot: 2 as const,
    };
    const waited = reduceGameState(initial, { type: "WAIT" });

    expect(toSceneId(waited.location, waited.timeSlot)).toBe("B3");
    expect(waited.loop).toBe(1);
    expect(waited.loopState.seenTransitions).toContain("B2");
    expect(waited.lastTransition).toContain("Ryan og Barbara");
  });

  it("wraps evening to morning, increments the loop, and preserves knowledge", () => {
    let state: GameState = {
      ...createInitialGameState(),
      phase: "exploration",
      location: "C",
      timeSlot: 4,
      loopState: {
        seenTransitions: ["A1", "C3"],
      },
    };

    state = reduceGameState(state, {
      type: "SET_KNOWLEDGE",
      id: "ryan_bullied_marie",
      status: "confirmed",
    });
    const nextDay = reduceGameState(state, { type: "WAIT" });

    expect(toSceneId(nextDay.location, nextDay.timeSlot)).toBe("C1");
    expect(nextDay.loop).toBe(2);
    expect(nextDay.knowledge.ryan_bullied_marie).toBe("confirmed");
    expect(nextDay.loopState.seenTransitions).toEqual([]);
  });

  it("can reset the entire game to its initial contract", () => {
    const changed = reduceGameState(
      {
        ...createInitialGameState(),
        phase: "exploration",
        loop: 7,
      },
      {
        type: "SET_KNOWLEDGE",
        id: "laura_confessed",
        status: "confirmed",
      },
    );
    const reset = reduceGameState(changed, { type: "RESET_GAME" });

    expect(reset).toEqual(createInitialGameState());
  });
});
