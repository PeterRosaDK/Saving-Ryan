import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  getClockTickUrl,
  getLocationMusicUrl,
  getMusicTrackUrl,
  LEGACY_MUSIC_TRACK_IDS,
  LOCATION_MUSIC_TRACKS,
  UNMAPPED_LEGACY_MUSIC_TRACKS,
} from "../src/media/musicManifest";

describe("Legacy Fresh music manifest", () => {
  it("keeps the provisional location mapping explicit and replaceable", () => {
    expect(LOCATION_MUSIC_TRACKS).toEqual({
      A: "28",
      B: "29",
      C: "31",
      D: "34",
      E: "35",
    });
    expect(UNMAPPED_LEGACY_MUSIC_TRACKS).toEqual(["36", "37", "38"]);
    expect(getLocationMusicUrl("C", "/saving-ryan/")).toBe(
      "/saving-ryan/assets/audio/music/31.wav",
    );
  });

  it("serves all eight recovered masters and the clock sound", () => {
    const expectedSizes = {
      "28": 2_048_778,
      "29": 4_598_572,
      "31": 4_951_802,
      "34": 2_177_488,
      "35": 1_513_940,
      "36": 1_376_932,
      "37": 1_476_146,
      "38": 1_306_084,
    } as const;

    for (const trackId of LEGACY_MUSIC_TRACK_IDS) {
      const path = fileURLToPath(
        new URL(
          `../public${getMusicTrackUrl(trackId)}`,
          import.meta.url,
        ),
      );
      expect(existsSync(path), trackId).toBe(true);
      expect(statSync(path).size, trackId).toBe(expectedSizes[trackId]);
    }

    expect(getClockTickUrl()).toBe("/assets/audio/effects/clock_tick.wav");
    const clockPath = fileURLToPath(
      new URL("../public/assets/audio/effects/clock_tick.wav", import.meta.url),
    );
    expect(existsSync(clockPath)).toBe(true);
    expect(statSync(clockPath).size).toBe(212_102);
  });
});
