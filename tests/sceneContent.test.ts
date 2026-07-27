import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/app/gameState";
import {
  canPerformSceneInteraction,
  getSceneInteraction,
} from "../src/game/sceneInteractions";
import { getSceneOccupants } from "../src/game/sceneOccupants";
import { getSpecialSequenceCue } from "../src/game/specialSequenceCues";
import { learnKnowledge } from "../src/game/knowledgeGraph";

describe("verified scene content", () => {
  it("maps the report-backed motive-route occupants without making the body talkable", () => {
    expect(getSceneOccupants("C1")).toContain("Ryan");
    expect(getSceneOccupants("D2")).toContain("Marie");
    expect(getSceneOccupants("A3")).toEqual(["Laura"]);
  });

  it("represents unfinished inspect scenes as text cues", () => {
    expect(getSceneInteraction("inspect_girlfriend_letter").cue).toEqual({
      kind: "text",
      text: "I papirkurven ligger et kærestebrev til Ryan. Det er underskrevet Sarah.",
    });
    expect(getSceneInteraction("inspect_barbaras_computer").cue).toEqual({
      kind: "text",
      text: "Koden Intruder virker. I Barbaras filer finder du ændrede eksamenskarakterer.",
    });
  });

  it("requires the Intruder clue before Barbara's computer is usable", () => {
    const interaction = getSceneInteraction("inspect_barbaras_computer");
    const initial = createInitialGameState();

    expect(canPerformSceneInteraction(initial, interaction)).toBe(false);
    expect(
      canPerformSceneInteraction(
        learnKnowledge(initial, ["barbara_hacker_alias_intruder"]),
        interaction,
      ),
    ).toBe(true);
  });

  it("uses the original Laura Suspekt video for the B4 special sequence", () => {
    expect(getSpecialSequenceCue("laura_suspect")).toEqual({
      kind: "video",
      clipId: "LauraSuspekt",
    });
  });
});
