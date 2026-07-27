import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  getVideoUrl,
  resolveVideoMember,
  VIDEO_CLIP_IDS,
  VIDEO_FILES,
} from "../src/media/videoManifest";

describe("Director video manifest", () => {
  it("contains all 81 Director video members", () => {
    expect(VIDEO_CLIP_IDS).toHaveLength(81);
    expect(new Set(VIDEO_CLIP_IDS).size).toBe(81);
  });

  it("keeps matching member names unchanged", () => {
    expect(resolveVideoMember("LauraSuspekt")).toBe("LauraSuspekt");
    expect(getVideoUrl("LauraSuspekt")).toBe("/Video/LauraSuspekt.mp4");
  });

  it.each([
    ["Peter-BeskyldDavid1", "Peter-BeskyldDavid"],
    ["Peter-BeskyldMarie1", "Peter-BeskyldMarie"],
    ["Peter-omRyanDie", "Peter-omRyanDatid"],
  ] as const)("maps %s to its converted MP4 filename", (member, expected) => {
    expect(resolveVideoMember(member)).toBe(expected);
  });

  it("uses the configured application base path", () => {
    expect(getVideoUrl("LauraSuspekt", "/saving-ryan/")).toBe(
      "/saving-ryan/Video/LauraSuspekt.mp4",
    );
  });

  it("matches the complete MP4 directory without missing or unused files", () => {
    const videoDirectory = fileURLToPath(
      new URL("../public/Video", import.meta.url),
    );
    const actualFiles = readdirSync(videoDirectory)
      .filter((fileName) => fileName.endsWith(".mp4"))
      .sort();
    const manifestFiles = Object.values(VIDEO_FILES).sort();

    expect(manifestFiles).toHaveLength(81);
    expect(new Set(manifestFiles).size).toBe(81);
    expect(manifestFiles).toEqual(actualFiles);
  });
});
