import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/app/gameState";
import {
  canPerformSceneInteraction,
  getSceneInteraction,
} from "../src/game/sceneInteractions";
import { getSceneOccupants } from "../src/game/sceneOccupants";
import {
  DIRECTOR_STAGE,
  directorRectStyle,
  getScenePresentation,
} from "../src/game/scenePresentation";
import { getSpecialSequenceCue } from "../src/game/specialSequenceCues";
import { learnKnowledge } from "../src/game/knowledgeGraph";

describe("verified scene content", () => {
  it("maps the report-backed motive-route occupants without making the body talkable", () => {
    expect(getSceneOccupants("C1")).toContain("Ryan");
    expect(getSceneOccupants("D2")).toContain("Marie");
    expect(getSceneOccupants("A3")).toEqual(["Laura"]);
  });

  it("maps Director score characters and exits to interactive stage rectangles", () => {
    expect(getSceneOccupants("A4")).toEqual(["David"]);
    expect(getSceneOccupants("C4")).toEqual(["Barbara"]);
    expect(getScenePresentation("A1").characters).toContainEqual({
      person: "Laura",
      rect: { centerX: 382, centerY: 186, width: 89, height: 157 },
    });
    expect(getScenePresentation("B1").navigation).toEqual([
      {
        target: "E",
        rect: { centerX: 606, centerY: 364, width: 114, height: 174 },
      },
    ]);
    expect(getScenePresentation("E1").navigation.map(({ target }) => target))
      .toEqual(["A", "B", "C", "D"]);
  });

  it("preserves the Director stage and the non-uniform film-loop timeline", () => {
    expect(DIRECTOR_STAGE).toMatchObject({
      width: 800,
      height: 600,
      tickMilliseconds: 40,
    });
    expect(directorRectStyle(DIRECTOR_STAGE.background)).toBe(
      "left:10%;top:10%;width:80%;height:80%",
    );
    expect(getScenePresentation("B1").filmLoop).toMatchObject({
      name: "LoopB1",
      ticks: 87,
      timeline: [
        { tick: 0, frameIndex: 0 },
        { tick: 10, frameIndex: 1 },
        { tick: 14, frameIndex: 0 },
        { tick: 57, frameIndex: 1 },
        { tick: 61, frameIndex: 2 },
      ],
    });
  });

  it("places Barbara's computer only in the Director scenes that contain its hotspot", () => {
    expect(getSceneInteraction("inspect_barbaras_computer").scenes).toEqual([
      "B2",
      "B3",
    ]);
    expect(
      getScenePresentation("B2").interactions.map(
        ({ interactionId }) => interactionId,
      ),
    ).toContain("inspect_barbaras_computer");
    expect(getScenePresentation("B1").interactions).toEqual([]);
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
