import { describe, expect, it } from "vitest";
import { SCENES } from "../src/game/sceneRegistry";
import {
  DIRECTOR_EXTRACTED_MEMBERS,
  FILM_LOOP_FRAMES,
  getImageUrl,
  getSceneBackgroundUrl,
} from "../src/media/imageManifest";

describe("image asset manifest", () => {
  it("maps all 20 scenes to stable background URLs", () => {
    const urls = SCENES.map(({ id }) => getSceneBackgroundUrl(id));

    expect(urls).toHaveLength(20);
    expect(new Set(urls).size).toBe(20);
    expect(urls.at(0)).toBe("/assets/images/sektorA1.png");
    expect(urls.at(-1)).toBe("/assets/images/sektorE4.png");
  });

  it("keeps Director cast names intact in URLs", () => {
    expect(getImageUrl("sektorB2-RyanBarbara1")).toBe(
      "/assets/images/sektorB2-RyanBarbara1.png",
    );
  });

  it("records the three assets extracted because BMP sources were absent", () => {
    expect(DIRECTOR_EXTRACTED_MEMBERS).toEqual([
      "BlankPortrait",
      "titel-ryan",
      "titel-saving",
    ]);
  });

  it("records all 12 legacy film loops and their component frames", () => {
    expect(Object.keys(FILM_LOOP_FRAMES)).toHaveLength(12);
    expect(FILM_LOOP_FRAMES.LoopA1).toEqual([
      "sektorA1-Laura1",
      "sektorA1-Laura2",
      "sektorA1-Laura3",
    ]);
    expect(FILM_LOOP_FRAMES.LoopC4).toHaveLength(2);
  });
});
