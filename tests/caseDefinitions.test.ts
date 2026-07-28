import { describe, expect, it } from "vitest";
import {
  createInitialGameState,
} from "../src/app/gameState";
import {
  CASE_DEFINITIONS,
  DEFAULT_CASE_ID,
  getCaseDefinition,
  getMysteryCaseIds,
  selectMysteryCaseId,
} from "../src/game/caseDefinitions";
import { reduceGameState } from "../src/game/stateMachine";

describe("phase 10 case boundary", () => {
  it("registers Laura as the playable default without exposing a mystery placeholder", () => {
    expect(DEFAULT_CASE_ID).toBe("laura");
    expect(CASE_DEFINITIONS).toEqual({
      laura: {
        id: "laura",
        selection: "default",
        murderer: "Laura",
        menu: {
          title: "Den oprindelige sag",
          description:
            "Gennemlev den restaurerede historie og find en vej ud af tidsløkken.",
        },
      },
    });
    expect(getCaseDefinition("laura")).toBe(CASE_DEFINITIONS.laura);
    expect(getMysteryCaseIds()).toEqual([]);
    expect(selectMysteryCaseId(0.5)).toBeNull();
  });

  it("starts the selected case only from the menu", () => {
    const menu = createInitialGameState();
    const intro = reduceGameState(menu, {
      type: "START_CASE",
      caseId: "laura",
    });

    expect(intro).toMatchObject({
      version: 2,
      selectedCaseId: "laura",
      phase: "intro",
      loop: 1,
      timeSlot: 1,
    });
    expect(
      reduceGameState(intro, {
        type: "START_CASE",
        caseId: "laura",
      }),
    ).toBe(intro);
  });

  it("preserves the selected case across a day loop and clears it on full reset", () => {
    let state = reduceGameState(createInitialGameState(), {
      type: "START_CASE",
      caseId: "laura",
    });
    state = reduceGameState(state, { type: "INTRO_FINISHED" });
    state = {
      ...state,
      timeSlot: 4,
    };
    state = reduceGameState(state, { type: "WAIT" });
    state = reduceGameState(state, { type: "COMPLETE_TRANSITION" });

    expect(state.selectedCaseId).toBe("laura");
    expect(state.loop).toBe(2);
    expect(state.phase).toBe("exploration");

    expect(
      reduceGameState(state, { type: "RESET_GAME" }),
    ).toEqual(createInitialGameState());
  });
});
