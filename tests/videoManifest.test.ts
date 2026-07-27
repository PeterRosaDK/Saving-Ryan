import { describe, expect, it } from "vitest";
import {
  getVideoUrl,
  resolveVideoMember,
} from "../src/media/videoManifest";

describe("Director video member aliases", () => {
  it("keeps matching member names unchanged", () => {
    expect(resolveVideoMember("LauraSuspekt")).toBe("LauraSuspekt");
    expect(getVideoUrl("LauraSuspekt")).toBe("/Video/LauraSuspekt.mp4");
  });

  it.each([
    ["Peter-BeskyldDavid1", "Peter-BeskyldDavid"],
    ["Peter-BeskyldMarie1", "Peter-BeskyldMarie"],
    ["Peter-omRyanDie", "Peter-omRyanDatid"],
  ])("maps %s to its converted MP4 filename", (member, expected) => {
    expect(resolveVideoMember(member)).toBe(expected);
  });
});
