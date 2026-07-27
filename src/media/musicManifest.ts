import type { LocationId } from "../app/types";
import { getPublicUrl } from "./publicUrl";

export const LEGACY_MUSIC_TRACK_IDS = [
  "28",
  "29",
  "31",
  "34",
  "35",
  "36",
  "37",
  "38",
] as const;

export type LegacyMusicTrackId = (typeof LEGACY_MUSIC_TRACK_IDS)[number];

/*
 * Legacy Fresh contains the eight masters and music-control Lingo, but neither
 * spillet_decompiled.dir nor its score retains a track-to-frame assignment.
 * Keep this provisional reconstruction in one declarative table so it can be
 * corrected after an authoritative listening note or older score is found.
 */
export const LOCATION_MUSIC_TRACKS = {
  A: "28",
  B: "29",
  C: "31",
  D: "34",
  E: "35",
} as const satisfies Record<LocationId, LegacyMusicTrackId>;

export const UNMAPPED_LEGACY_MUSIC_TRACKS = [
  "36",
  "37",
  "38",
] as const satisfies readonly LegacyMusicTrackId[];

export function getMusicTrackUrl(
  trackId: LegacyMusicTrackId,
  baseUrl?: string,
): string {
  return getPublicUrl(`assets/audio/music/${trackId}.wav`, baseUrl);
}

export function getLocationMusicUrl(
  location: LocationId,
  baseUrl?: string,
): string {
  return getMusicTrackUrl(LOCATION_MUSIC_TRACKS[location], baseUrl);
}

export function getClockTickUrl(baseUrl?: string): string {
  return getPublicUrl("assets/audio/effects/clock_tick.wav", baseUrl);
}
