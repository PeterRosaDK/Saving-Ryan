import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  INTRO_DURATION_MILLISECONDS,
  INTRO_SCORE,
  START_PROLOGUE_PARAGRAPHS,
} from "../src/game/introPresentation";
import {
  LOCATION_TRANSITION_EVENTS,
  TRANSITION_TEXT,
} from "../src/game/transitionEvents";
import { getWaitActionLabel } from "../src/game/sceneRegistry";
import { getIntroAudioUrl } from "../src/media/audioManifest";

describe("Director presentation parity", () => {
  it("contains all 20 original Vent transitions with Director wording", () => {
    expect(TRANSITION_TEXT).toEqual({
      A1: "Laura rejser sig og går ud mod gangen.",
      A2: "Pludselig hører du Ryans stemme råbe et eller andet, og sekundet efter kommer hans korpus svævende ned fra himlen og splatter ud.",
      A3: "Laura går over mod gangen. David kommer og sætter sig.",
      A4: "I ankommer til universitet. Efter et kort møde går folk hver til sit. Laura bliver siddende.",
      B1: "Barbara sidder og skriver på sin computer. Ryan kommer ind i lokalet. Han kalder Barbara over til sig i hjørnet. De to begynder at diskutere.",
      B2: "Ryan og Barbara går ud af rummet. Et par minutter efter hører du et skrig fra kantinen.",
      B3: "Laura og Marie kommer ind i rummet.",
      B4: "Marie forlader lokalet. Du venter lidt og går så hen til Laura.",
      C1: "Ryan rejser sig og går ud i gangen.",
      C2: "Du går ud i gangen og holder en pause. På vejen derud møder du Ryan, der går ind i læsesalen. Lidt efter går også David derind. Pludselig høres et skrig fra kantinen!",
      C3: "David forlader læsesalen. Barbara kommer ind.",
      C4: "I ankommer til universitet. Efter et kort møde går folk hver til sit. Du går med Ryan ind i læsesalen.",
      D1: "David rejser sig og går ud i gangen.",
      D2: "Marie forlader lokalet. Nogle minutter senere høres et skrig fra kantinen!",
      D3: "Barbara går ud. Marie går med.",
      D4: "I ankommer til universitet. Efter et kort møde går folk hver til sit. Du går med Marie og David ind i grupperummet.",
      E1: "David kommer ud fra grupperummet. Laura kommer fra kantinen og snakker med ham. Imens begynder Ryan at mobbe Marie.",
      E2: "David og Laura holder op med at tale. David går ind i læsesalen, og Laura er pludselig væk.",
      E3: "Du står og keder dig. Der sker intet som helst.",
      E4: "I ankommer til universitet. Efter et kort møde går folk hver til sit. Du går ud i gangen.",
    });
  });

  it("defines one location event per scene with the B4 special isolated from E4", () => {
    expect(Object.keys(LOCATION_TRANSITION_EVENTS)).toHaveLength(20);
    for (const [scene, event] of Object.entries(
      LOCATION_TRANSITION_EVENTS,
    )) {
      expect(event.id).toBe(scene);
      expect(event.scene).toBe(scene);
      expect(event.cue.kind).toBe("text");
    }

    expect(LOCATION_TRANSITION_EVENTS.B4).toMatchObject({
      specialCue: {
        kind: "video",
        clipId: "LauraSuspekt",
      },
      effects: [
        {
          type: "LEARN",
          id: "laura_hid_computer_activity",
        },
      ],
    });
    expect(LOCATION_TRANSITION_EVENTS.E4.specialCue).toBeUndefined();
    expect(LOCATION_TRANSITION_EVENTS.E4.effects).toEqual([]);
    expect(LOCATION_TRANSITION_EVENTS.C2).toMatchObject({
      specialCue: { kind: "text" },
      effects: [
        {
          type: "LEARN",
          id: "heard_scraping_behind_bookcase",
        },
      ],
    });
    expect(LOCATION_TRANSITION_EVENTS.E2).toMatchObject({
      specialCue: { kind: "text" },
      effects: [
        {
          type: "LEARN",
          id: "noticed_laura_disappear_near_reading_room",
        },
      ],
    });
  });

  it("names both observation location and destination time on the clock", () => {
    expect(getWaitActionLabel("C", 2)).toBe(
      "Vent i læsesalen til eftermiddag",
    );
    expect(getWaitActionLabel("E", 4)).toBe(
      "Vent i gangarealet til næste morgen",
    );
  });

  it("models the later 581-frame, 20 fps Director intro score", () => {
    expect(INTRO_SCORE.frames).toBe(581);
    expect(INTRO_SCORE.millisecondsPerFrame).toBe(50);
    expect(INTRO_DURATION_MILLISECONDS).toBe(29_050);
    expect(INTRO_SCORE.title.map(({ image }) => image)).toEqual([
      "titel-saving",
      "titel-ryan",
    ]);
    expect(
      INTRO_SCORE.credits.map(
        ({ character, actor, startsAtFrame }) => ({
          character,
          actor,
          startsAtFrame,
        }),
      ),
    ).toEqual([
      { character: "Barbara", actor: "Jane", startsAtFrame: 61 },
      { character: "David", actor: "Søren", startsAtFrame: 135 },
      { character: "Marie", actor: "Bodil", startsAtFrame: 210 },
      { character: "Jørgen", actor: "Peter", startsAtFrame: 285 },
      { character: "Laura", actor: "Signe", startsAtFrame: 360 },
      { character: "Ryan", actor: "Claus", startsAtFrame: 435 },
    ]);
    expect(INTRO_SCORE.final).toMatchObject({
      image: "intro-slut",
      startsAtFrame: 523,
      fullyVisibleAtFrame: 574,
      rect: {
        centerX: 400,
        centerY: 300,
        width: 800,
        height: 600,
      },
    });
  });

  it("restores the later Tekst-Start prologue without its production note", () => {
    expect(START_PROLOGUE_PARAGRAPHS).toHaveLength(4);
    expect(START_PROLOGUE_PARAGRAPHS.join(" ")).toContain(
      "De seks studerende er sneet inde på universitetet",
    );
    expect(START_PROLOGUE_PARAGRAPHS.join(" ")).toContain(
      "gennemleve dagen igen og igen",
    );
    expect(START_PROLOGUE_PARAGRAPHS.join(" ")).not.toContain(
      "Intro, der hurtigt gennemløber",
    );
  });

  it("serves the extracted original intro sound", () => {
    expect(getIntroAudioUrl("/saving-ryan/")).toBe(
      "/saving-ryan/assets/audio/intro.wav",
    );
    const audioPath = fileURLToPath(
      new URL(
        "../public/assets/audio/intro.wav",
        import.meta.url,
      ),
    );
    expect(existsSync(audioPath)).toBe(true);
    expect(statSync(audioPath).size).toBe(2_685_244);
  });
});
