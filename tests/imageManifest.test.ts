import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { SCENES } from "../src/game/sceneRegistry";
import {
  DIRECTOR_EXTRACTED_MEMBERS,
  FILM_LOOP_FRAMES,
  getCharacterPortraitUrl,
  getImageUrl,
  getSceneBackgroundUrl,
  IMAGE_MEMBERS,
} from "../src/media/imageManifest";

describe("image asset manifest", () => {
  it("maps all 20 scenes to stable background URLs", () => {
    const urls = SCENES.map(({ id }) => getSceneBackgroundUrl(id));

    expect(urls).toHaveLength(20);
    expect(new Set(urls).size).toBe(20);
    expect(urls.at(0)).toBe("/assets/images/sektorA1.png");
    expect(urls.at(-1)).toBe("/assets/images/sektorE4.png");
  });

  it("keeps Director cast names intact and respects the app base path", () => {
    expect(getImageUrl("sektorB2-RyanBarbara1")).toBe(
      "/assets/images/sektorB2-RyanBarbara1.png",
    );
    expect(getImageUrl("sektorB2-RyanBarbara1", "/saving-ryan/")).toBe(
      "/saving-ryan/assets/images/sektorB2-RyanBarbara1.png",
    );
    expect(getCharacterPortraitUrl("David")).toBe(
      "/assets/images/portrait-David.png",
    );
  });

  it("records the three assets extracted because BMP sources were absent", () => {
    expect(DIRECTOR_EXTRACTED_MEMBERS).toEqual([
      "BlankPortrait",
      "titel-ryan",
      "titel-saving",
    ]);
  });

  it("records all 12 legacy film loops with typed component frames", () => {
    expect(Object.keys(FILM_LOOP_FRAMES)).toHaveLength(12);
    expect(FILM_LOOP_FRAMES.LoopA1).toEqual([
      "sektorA1-Laura1",
      "sektorA1-Laura2",
      "sektorA1-Laura3",
    ]);
    expect(FILM_LOOP_FRAMES.LoopC4).toHaveLength(2);
  });

  it("matches the complete PNG directory without missing or unused files", () => {
    const imageDirectory = fileURLToPath(
      new URL("../public/assets/images", import.meta.url),
    );
    const actualMembers = readdirSync(imageDirectory)
      .filter((fileName) => fileName.endsWith(".png"))
      .map((fileName) => fileName.replace(/\.png$/, ""))
      .sort();

    expect(IMAGE_MEMBERS).toHaveLength(109);
    expect(new Set(IMAGE_MEMBERS).size).toBe(109);
    expect([...IMAGE_MEMBERS].sort()).toEqual(actualMembers);
  });

  it("preserves Director transparent mattes on toolbar and clock art", () => {
    const imageDirectory = fileURLToPath(
      new URL("../public/assets/images", import.meta.url),
    );
    for (const member of ["tegn-musik", "tegn-sp", "tegn-afslut", "ur1"]) {
      const png = readFileSync(`${imageDirectory}/${member}.png`);
      // PNG IHDR color type 6 is truecolour with an alpha channel.
      expect(png[25], member).toBe(6);
    }
  });
});
