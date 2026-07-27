import type { SceneId } from "../app/types";

const IMAGE_ROOT = "/assets/images";

export type DirectorFilmLoopName =
  | "LoopA1"
  | "LoopA3"
  | "LoopA4"
  | "LoopB1"
  | "LoopB2"
  | "LoopB4"
  | "LoopC1"
  | "LoopC3"
  | "LoopC4"
  | "LoopD1"
  | "LoopD2"
  | "LoopE2";

export function getImageUrl(memberName: string): string {
  return `${IMAGE_ROOT}/${encodeURIComponent(memberName)}.png`;
}

export function getSceneBackgroundUrl(sceneId: SceneId): string {
  return getImageUrl(`sektor${sceneId}`);
}

// These members were missing from the supplied BMP collection and were decoded
// directly from the Director casts.
export const DIRECTOR_EXTRACTED_MEMBERS = [
  "BlankPortrait",
  "titel-ryan",
  "titel-saving",
] as const;

// The frame associations are inferred from cast names and ordering. Their exact
// placement and timing will be verified against the Director score.
export const FILM_LOOP_FRAMES: Readonly<
  Record<DirectorFilmLoopName, readonly string[]>
> = {
  LoopA1: ["sektorA1-Laura1", "sektorA1-Laura2", "sektorA1-Laura3"],
  LoopA3: ["sektorA3-Laura1", "sektorA3-Laura2", "sektorA3-Laura3"],
  LoopA4: ["sektorA4-David1", "sektorA4-David2", "sektorA4-David3"],
  LoopB1: [
    "sektorB1-Barbara1",
    "sektorB1-Barbara2",
    "sektorB1-Barbara3",
  ],
  LoopB2: [
    "sektorB2-RyanBarbara1",
    "sektorB2-RyanBarbara2",
    "sektorB2-RyanBarbara3",
  ],
  LoopB4: [
    "sektorB4-LauraMarie1",
    "sektorB4-LauraMarie2",
    "sektorB4-LauraMarie3",
  ],
  LoopC1: ["sektorC1-Ryan1", "sektorC1-Ryan2", "sektorC1-Ryan3"],
  LoopC3: ["sektorC3-David1", "sektorC3-David2", "sektorC3-David3"],
  LoopC4: ["sektorC4-Barbara1", "sektorC4-Barbara2"],
  LoopD1: [
    "sektorD1-DavidMarie1",
    "sektorD1-DavidMarie2",
    "sektorD1-DavidMarie3",
  ],
  LoopD2: ["sektorD2-Marie1", "sektorD2-Marie2", "sektorD2-Marie3"],
  LoopE2: [
    "sektorE2-LauraDavid1",
    "sektorE2-LauraDavid2",
    "sektorE2-LauraDavid3",
  ],
};
