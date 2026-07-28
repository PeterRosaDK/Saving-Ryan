import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/app/gameState";
import {
  SCENE_INTERACTIONS,
  canPerformSceneInteraction,
  getSceneInteraction,
  getSceneInteractionTimeCost,
} from "../src/game/sceneInteractions";
import { getSceneOccupants } from "../src/game/sceneOccupants";
import {
  DIRECTOR_STAGE,
  directorHotspotRectStyle,
  directorRectStyle,
  getScenePresentation,
} from "../src/game/scenePresentation";
import { getLocationTransitionEvent } from "../src/game/transitionEvents";
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
      rect: { x: 382, y: 186, width: 89, height: 157 },
    });
    expect(getScenePresentation("B1").navigation).toEqual([
      {
        target: "E",
        rect: { x: 606, y: 364, width: 114, height: 174 },
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
    expect(
      directorHotspotRectStyle({
        x: 382,
        y: 186,
        width: 89,
        height: 157,
      }),
    ).toBe("left:47.75%;top:31%;width:11.125%;height:26.166666666666664%");
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

  it("places the remaining special hotspots at their Director coordinates", () => {
    for (const sceneId of ["A3", "A4"] as const) {
      expect(getScenePresentation(sceneId).interactions).toContainEqual({
        interactionId: "inspect_ryans_body_and_necklace",
        rect: { x: 158, y: 383, width: 413, height: 119 },
      });
    }
    expect(getScenePresentation("B2").interactions).toContainEqual({
      interactionId: "eavesdrop_barbara_and_ryan",
      rect: { x: 445, y: 235, width: 146, height: 118 },
    });
    for (const sceneId of ["C1", "C2", "C3", "C4"] as const) {
      expect(getScenePresentation(sceneId).interactions).toContainEqual({
        interactionId: "inspect_secret_passage_book",
        rect: { x: 117, y: 294, width: 14, height: 46 },
      });
    }
    expect(getScenePresentation("C1").interactions).toContainEqual({
      interactionId: "prevent_ryans_murder",
      rect: { x: 117, y: 294, width: 14, height: 46 },
    });
    expect(getScenePresentation("C2").interactions).toContainEqual({
      interactionId: "watch_secret_passage",
      rect: { x: 117, y: 294, width: 14, height: 46 },
    });
    for (const sceneId of ["D1", "D2", "D3", "D4"] as const) {
      expect(getScenePresentation(sceneId).interactions).toContainEqual({
        interactionId: "inspect_girlfriend_letter",
        rect: { x: 148, y: 384, width: 62, height: 24 },
      });
    }
  });

  it("restores Director's two-frame body and letter sequences", () => {
    expect(
      getSceneInteraction("inspect_ryans_body_and_necklace").cue,
    ).toEqual({
      kind: "stills",
      frames: [
        {
          image: "sektorA3-Ryan1",
          alt: "Ryan ligger livløs på kantinens gulv.",
        },
        {
          image: "sektorA3-Ryan2",
          alt: "Et nærbillede af halskæden ved Ryans hånd.",
          text:
            "I Ryans hånd ligger en isbjørnehalskæde. Den må være revet af morderen under faldet.",
        },
      ],
    });
    expect(getSceneInteraction("inspect_girlfriend_letter").cue).toEqual({
      kind: "stills",
      frames: [
        {
          image: "sektorD4-Brev1",
          alt: "Et brev stikker op af papirkurven i grupperummet.",
        },
        {
          image: "sektorD4-Brev2",
          alt: "Kærestebrevet til Ryan er foldet ud.",
          text:
            "I papirkurven ligger et kærestebrev til Ryan. Det er underskrevet Sarah.",
        },
      ],
    });
  });

  it("presents Director's locked and unlocked computer text over the room still", () => {
    expect(getSceneInteraction("inspect_barbaras_computer").cue).toEqual({
      kind: "stills",
      frames: [
        {
          image: "sektorB3",
          alt: "Barbaras computer i computerrummet.",
          text:
            "Du kaster et blik på Barbaras computer. Der er adgangskontrol på, så du prøver at bruge det navn, David fortalte dig. Det lykkes! Du kan se, at Barbara er inde i universitetets ellers utilgængelige filsystem over karakterer, og du kan desuden se, at hun tilsyneladende er inde under sit eget stamblad!",
        },
      ],
    });
    expect(
      getSceneInteraction("inspect_barbaras_computer").blockedCue,
    ).toEqual({
      kind: "stills",
      frames: [
        {
          image: "sektorB3",
          alt: "Barbaras computer i computerrummet.",
          text:
            "Du kaster et blik på Barbaras computer. Desværre er der adgangskontrol på, og du kender ikke brugernavnet.",
        },
      ],
    });
  });

  it("keeps Director's text-only listen and book interactions", () => {
    expect(getSceneInteraction("eavesdrop_barbara_and_ryan").cue).toEqual({
      kind: "text",
      text: "Du kravler ind under bordet og overværer et skænderi mellem Ryan og Barbara. Det lyder, som om Ryan afpresser Barbara.",
    });
    expect(getSceneInteraction("inspect_secret_passage_book").cue).toEqual({
      kind: "text",
      text: "Du hiver i bogen og opdager pludselig, at den i virkeligheden er en mystisk kontakt, der aktiverer en hemmelig dørmekanisme. En skydedør glider til side.",
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

  it("declares one interval for the first successful computer search and zero for replay", () => {
    const interaction = getSceneInteraction("inspect_barbaras_computer");
    const initial = createInitialGameState();
    const unlocked = learnKnowledge(initial, [
      "barbara_hacker_alias_intruder",
    ]);
    const completed = learnKnowledge(unlocked, [
      "barbara_forged_grades",
    ]);

    expect(interaction.timeCost).toBe(1);
    expect(interaction.timeAdvanceCue).toEqual({
      kind: "text",
      text: "Det tager resten af tidsintervallet at gennemgå Barbaras filer grundigt.",
    });
    expect(getSceneInteractionTimeCost(unlocked, interaction)).toBe(1);
    expect(getSceneInteractionTimeCost(completed, interaction)).toBe(0);
  });

  it("requires both mutually exclusive observations before passage surveillance", () => {
    const interaction = getSceneInteraction("watch_secret_passage");
    const initial = createInitialGameState();
    const oneObservation = learnKnowledge(initial, [
      "heard_scraping_behind_bookcase",
    ]);
    const bothObservations = learnKnowledge(oneObservation, [
      "noticed_laura_disappear_near_reading_room",
    ]);
    const completed = learnKnowledge(bothObservations, [
      "secret_passage_exists",
      "laura_used_secret_passage",
    ]);

    expect(canPerformSceneInteraction(initial, interaction)).toBe(false);
    expect(canPerformSceneInteraction(oneObservation, interaction)).toBe(
      false,
    );
    expect(canPerformSceneInteraction(bothObservations, interaction)).toBe(
      true,
    );
    expect(getSceneInteractionTimeCost(bothObservations, interaction)).toBe(
      1,
    );
    expect(getSceneInteractionTimeCost(completed, interaction)).toBe(0);
  });

  it("gives every timed interaction an elapsed-time cue", () => {
    for (const interaction of Object.values(SCENE_INTERACTIONS)) {
      if (interaction.timeCost === 1) {
        expect(interaction.timeAdvanceCue?.kind).toBe("text");
      }
    }
  });

  it("only makes the passage a prevention route after the complete case and warning", () => {
    const interaction = getSceneInteraction("prevent_ryans_murder");
    const initial = createInitialGameState();

    expect(interaction).toMatchObject({
      scenes: ["C1"],
      replaces: ["inspect_secret_passage_book"],
      concludesStory: true,
    });
    expect(canPerformSceneInteraction(initial, interaction)).toBe(false);
    expect(
      canPerformSceneInteraction(
        learnKnowledge(initial, [
          "laura_confessed",
          "secret_passage_exists",
        ]),
        interaction,
      ),
    ).toBe(false);
    expect(
      canPerformSceneInteraction(
        learnKnowledge(initial, [
          "laura_confessed",
          "secret_passage_exists",
          "ryan_dismissed_warning",
        ]),
        interaction,
      ),
    ).toBe(true);
  });

  it("uses the original Laura Suspekt video for the B4 special sequence", () => {
    expect(getLocationTransitionEvent("B4").specialCue).toEqual({
      kind: "video",
      clipId: "LauraSuspekt",
    });
  });

  it("restores the Director quit hotspot in all four canteen scenes", () => {
    for (const sceneId of ["A1", "A2", "A3", "A4"] as const) {
      expect(getScenePresentation(sceneId).quit).toEqual({
        x: 641,
        y: 120,
        width: 80,
        height: 111,
      });
    }
    expect(getScenePresentation("B1").quit).toBeUndefined();
  });
});
