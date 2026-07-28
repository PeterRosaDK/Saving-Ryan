import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/app/gameState";
import {
  CASE_DEFINITIONS,
  DEFAULT_CASE_ID,
  calculateCaseScore,
  getDirectorsCutCaseOverride,
  getMysteryCaseIds,
  isDirectorsCutQaMenuEnabled,
  selectDirectorsCutCase,
  selectMysteryCaseId,
} from "../src/game/caseDefinitions";
import { reduceGameState } from "../src/game/stateMachine";

describe("case registry and story modes", () => {
  it("offers an isolated original mode and an enabled Director's Cut pool", () => {
    expect(DEFAULT_CASE_ID).toBe("laura");
    expect(CASE_DEFINITIONS.laura).toMatchObject({
      mode: "original",
      enabled: true,
      murderer: "Laura",
      menu: {
        title: "Original historie",
        description:
          "Spil den oprindelige fortælling som et særskilt, kanonisk forløb.",
      },
    });
    expect(CASE_DEFINITIONS.david).toMatchObject({
      mode: "directors_cut",
      enabled: true,
      murderer: "David",
      menu: {
        title: "Director’s Cut",
        description:
          "Spil en alternativ version, hvor morderen vælges tilfældigt blandt de tilgængelige Director’s Cut-sager.",
      },
    });
    expect(CASE_DEFINITIONS.barbara).toMatchObject({
      mode: "directors_cut",
      enabled: true,
      murderer: "Barbara",
      menu: CASE_DEFINITIONS.david.menu,
    });
    expect(getMysteryCaseIds()).toEqual(["david", "barbara"]);
  });

  it("selects Director's Cut deterministically and keeps the id through loops", () => {
    expect(selectMysteryCaseId(0)).toBe("david");
    expect(selectMysteryCaseId(0.999)).toBe("barbara");
    let state = reduceGameState(createInitialGameState(), {
      type: "START_CASE",
      caseId: selectMysteryCaseId(0.42)!,
    });
    state = reduceGameState(state, { type: "INTRO_FINISHED" });
    state = { ...state, timeSlot: 4 };
    state = reduceGameState(state, { type: "WAIT" });
    state = reduceGameState(state, { type: "COMPLETE_TRANSITION" });
    expect(state).toMatchObject({
      version: 3,
      selectedCaseId: "david",
      loop: 2,
    });
  });

  it("parses and applies a generic ?dcCase selector through the active registry", () => {
    expect(getDirectorsCutCaseOverride("?dcCase=david")).toBe("david");
    expect(
      selectDirectorsCutCase({
        requestedCaseId: getDirectorsCutCaseOverride(
          "?foo=bar&dcCase=david",
        ),
        randomValue: 0.99,
      }),
    ).toEqual({
      caseId: "david",
      source: "qa",
      requestedCaseId: "david",
    });
    expect(
      getMysteryCaseIds().every((caseId) => {
        const definition = CASE_DEFINITIONS[caseId];
        return definition.mode === "directors_cut" && definition.enabled;
      }),
    ).toBe(true);
    expect(
      selectDirectorsCutCase({
        requestedCaseId: getDirectorsCutCaseOverride(
          "?dcCase=barbara",
        ),
        randomValue: 0,
      }),
    ).toEqual({
      caseId: "barbara",
      source: "qa",
      requestedCaseId: "barbara",
    });
  });

  it("shows the hidden registry-driven QA picker only for ?qa=1", () => {
    expect(isDirectorsCutQaMenuEnabled("?qa=1")).toBe(true);
    expect(
      isDirectorsCutQaMenuEnabled("?foo=bar&qa=1&dcCase=barbara"),
    ).toBe(true);
    expect(isDirectorsCutQaMenuEnabled("")).toBe(false);
    expect(isDirectorsCutQaMenuEnabled("?qa=0")).toBe(false);
    expect(isDirectorsCutQaMenuEnabled("?qa=true")).toBe(false);
  });

  it("falls back to normal registry selection for an unknown override", () => {
    const warnings: string[] = [];
    expect(
      selectDirectorsCutCase({
        requestedCaseId: "ukendt",
        randomValue: 0.25,
        warn: (message) => warnings.push(message),
      }),
    ).toEqual({
      caseId: "david",
      source: "random",
      requestedCaseId: "ukendt",
    });
    expect(warnings).toEqual([
      expect.stringContaining("Ukendt eller inaktiv"),
    ]);
  });

  it("uses normal registry selection without an override and selects anew for each new game", () => {
    const firstGame = selectDirectorsCutCase({ randomValue: 0 });
    const secondGame = selectDirectorsCutCase({ randomValue: 0.999 });
    expect(firstGame).toEqual({
      caseId: "david",
      source: "random",
      requestedCaseId: null,
    });
    expect(secondGame).toEqual({
      caseId: "barbara",
      source: "random",
      requestedCaseId: null,
    });
    expect(firstGame).not.toBe(secondGame);
  });

  it("keeps Original historie on Laura regardless of a QA override", () => {
    const override = getDirectorsCutCaseOverride("?dcCase=david");
    expect(override).toBe("david");
    const original = reduceGameState(createInitialGameState(), {
      type: "START_CASE",
      caseId: DEFAULT_CASE_ID,
    });
    expect(original.selectedCaseId).toBe("laura");
  });

  it("starts only from the menu and fully resets case-local state", () => {
    const menu = createInitialGameState();
    const intro = reduceGameState(menu, {
      type: "START_CASE",
      caseId: "david",
    });
    expect(
      reduceGameState(intro, {
        type: "START_CASE",
        caseId: "laura",
      }),
    ).toBe(intro);
    expect(reduceGameState(intro, { type: "RESET_GAME" })).toEqual(
      createInitialGameState(),
    );
  });

  it("calculates the configured deterministic score", () => {
    const state = {
      ...createInitialGameState(),
      selectedCaseId: "david" as const,
      loop: 4,
      knowledge: {
        ...createInitialGameState().knowledge,
        marie_says_david_was_hurt: true,
      },
      caseProgress: {
        ...createInitialGameState().caseProgress,
        statistics: {
          confrontations: 3,
          wrongAccusations: 1,
          prematureAccusations: 1,
        },
      },
    };
    expect(calculateCaseScore(state)).toBe(675);
  });
});
