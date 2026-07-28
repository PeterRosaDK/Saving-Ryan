import {
  openSync,
  readSync,
  readdirSync,
  statSync,
  closeSync,
} from "node:fs";
import { join } from "node:path";
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

  it("serves 81 non-empty files with an MP4 file-type header", () => {
    const videoDirectory = fileURLToPath(
      new URL("../public/Video", import.meta.url),
    );

    for (const fileName of Object.values(VIDEO_FILES)) {
      const filePath = join(videoDirectory, fileName);
      const header = Buffer.alloc(12);
      const descriptor = openSync(filePath, "r");
      try {
        expect(readSync(descriptor, header, 0, header.length, 0)).toBe(
          header.length,
        );
      } finally {
        closeSync(descriptor);
      }

      expect(statSync(filePath).size).toBeGreaterThan(100_000);
      expect(header.subarray(4, 8).toString("ascii")).toBe("ftyp");
    }
  });
});
