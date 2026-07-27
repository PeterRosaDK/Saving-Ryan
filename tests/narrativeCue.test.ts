import { describe, expect, it } from "vitest";
import {
  stillsCue,
  textCue,
  videoCue,
} from "../src/media/narrativeCue";

describe("narrative cues", () => {
  it("keeps original video references typed and declarative", () => {
    expect(videoCue("David-omBarbaraOgComputere")).toEqual({
      kind: "video",
      clipId: "David-omBarbaraOgComputere",
    });
  });

  it("supports a text-first fallback without changing dialogue control flow", () => {
    expect(textCue("Midlertidig scene: David tøver.")).toEqual({
      kind: "text",
      text: "Midlertidig scene: David tøver.",
    });
  });

  it("supports the original Director still-image sequences", () => {
    expect(
      stillsCue([
        {
          image: "sektorA3-Ryan1",
          alt: "Ryan ligger på gulvet.",
        },
        {
          image: "sektorA3-Ryan2",
          alt: "Halskæden ses i nærbillede.",
        },
      ]),
    ).toEqual({
      kind: "stills",
      frames: [
        {
          image: "sektorA3-Ryan1",
          alt: "Ryan ligger på gulvet.",
        },
        {
          image: "sektorA3-Ryan2",
          alt: "Halskæden ses i nærbillede.",
        },
      ],
    });
    expect(() => stillsCue([])).toThrow(
      "A still-image cue requires at least one frame.",
    );
  });
});
