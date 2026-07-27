import { describe, expect, it } from "vitest";
import {
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
});
