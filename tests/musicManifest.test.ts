import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
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
    const expectedHashes = {
      "28": "a9ad847ab0ffab5198cf39f783164fd2c7f30ba401adc69b859a89163f61a0e3",
      "29": "703e04e9346700741b92823607fc6c0a6ed5f13506b1e7ca291783642469af42",
      "31": "1e3e9d9faba120eb69f0281fb07e7cef465758817bd2ccec3f1ecfa0cde511c4",
      "34": "22915cfd4c50f91dc8f335f6da17f87f5161af1888d2caf4728239ecf5e360fe",
      "35": "e4655a73e13f6c457b8c50a299d32219a15fd1f8bee9b2592648af1ed676a3cc",
      "36": "a0c3caae7d08388e0d45f1f886d7f59c5cc35ce12f8f0f4d8659865a3b68bd7c",
      "37": "6f510b4df13ef2ea2f218a9b7abecfa41a042a1ea74a6c2ddd4e6164c7759b54",
      "38": "f3e129a0dfc337b70c53869ca0b118f4a961b328f5c5a59384d52736466ac396",
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
      expect(
        createHash("sha256").update(readFileSync(path)).digest("hex"),
        trackId,
      ).toBe(expectedHashes[trackId]);
    }

    expect(getClockTickUrl()).toBe("/assets/audio/effects/clock_tick.wav");
    const clockPath = fileURLToPath(
      new URL("../public/assets/audio/effects/clock_tick.wav", import.meta.url),
    );
    expect(existsSync(clockPath)).toBe(true);
    expect(statSync(clockPath).size).toBe(212_102);
    expect(
      createHash("sha256").update(readFileSync(clockPath)).digest("hex"),
    ).toBe(
      "bd1c646c4e3fe6309ec7b21f313f9af0049468f41d621696545f2174949cb6a6",
    );
  });
});
