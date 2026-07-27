import type { SceneId } from "../app/types";
import { getPublicUrl } from "./publicUrl";

export const IMAGE_MEMBERS = [
  "BlankPortrait",
  "blankvideo",
  "halv-Barbara",
  "halv-David",
  "halv-Laura",
  "halv-Marie",
  "halv-Peter",
  "halv-Ryan",
  "portrait-Barbara",
  "portrait-David",
  "portrait-Laura",
  "portrait-Marie",
  "portrait-Ryan",
  "sektorA1",
  "sektorA1-Laura1",
  "sektorA1-Laura2",
  "sektorA1-Laura3",
  "sektorA2",
  "sektorA3",
  "sektorA3-Laura1",
  "sektorA3-Laura2",
  "sektorA3-Laura3",
  "sektorA3-Ryan1",
  "sektorA3-Ryan2",
  "sektorA4",
  "sektorA4-David1",
  "sektorA4-David2",
  "sektorA4-David3",
  "sektorA4-Ryan1",
  "sektorA4-Ryan2",
  "sektorB1",
  "sektorB1-Barbara1",
  "sektorB1-Barbara2",
  "sektorB1-Barbara3",
  "sektorB2",
  "sektorB2-RyanBarbara1",
  "sektorB2-RyanBarbara2",
  "sektorB2-RyanBarbara3",
  "sektorB3",
  "sektorB4",
  "sektorB4-LauraMarie1",
  "sektorB4-LauraMarie2",
  "sektorB4-LauraMarie3",
  "sektorC1",
  "sektorC1-Ryan1",
  "sektorC1-Ryan2",
  "sektorC1-Ryan3",
  "sektorC2",
  "sektorC3",
  "sektorC3-David1",
  "sektorC3-David2",
  "sektorC3-David3",
  "sektorC4",
  "sektorC4-Barbara1",
  "sektorC4-Barbara2",
  "sektorD1",
  "sektorD1-DavidMarie1",
  "sektorD1-DavidMarie2",
  "sektorD1-DavidMarie3",
  "sektorD2",
  "sektorD2-Marie1",
  "sektorD2-Marie2",
  "sektorD2-Marie3",
  "sektorD3",
  "sektorD4",
  "sektorD4-Brev1",
  "sektorD4-Brev2",
  "sektorE1",
  "sektorE2",
  "sektorE2-LauraDavid1",
  "sektorE2-LauraDavid2",
  "sektorE2-LauraDavid3",
  "sektorE3",
  "sektorE4",
  "titel-bodil1",
  "titel-bodil2",
  "titel-claus1",
  "titel-claus2",
  "titel-jane1",
  "titel-jane2",
  "titel-peter1",
  "titel-peter2",
  "titel-ryan",
  "titel-saving",
  "titel-signe1",
  "titel-signe2",
  "titel-soren1",
  "titel-soren2",
  "ur1",
  "ur2",
  "ur3",
  "ur4",
  "videreknap",
] as const;

export type ImageMemberName = (typeof IMAGE_MEMBERS)[number];

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

const SCENE_BACKGROUND_MEMBERS = {
  A1: "sektorA1",
  A2: "sektorA2",
  A3: "sektorA3",
  A4: "sektorA4",
  B1: "sektorB1",
  B2: "sektorB2",
  B3: "sektorB3",
  B4: "sektorB4",
  C1: "sektorC1",
  C2: "sektorC2",
  C3: "sektorC3",
  C4: "sektorC4",
  D1: "sektorD1",
  D2: "sektorD2",
  D3: "sektorD3",
  D4: "sektorD4",
  E1: "sektorE1",
  E2: "sektorE2",
  E3: "sektorE3",
  E4: "sektorE4",
} as const satisfies Record<SceneId, ImageMemberName>;

export function getImageUrl(
  memberName: ImageMemberName,
  baseUrl?: string,
): string {
  return getPublicUrl(
    `assets/images/${encodeURIComponent(memberName)}.png`,
    baseUrl,
  );
}

export function getSceneBackgroundUrl(
  sceneId: SceneId,
  baseUrl?: string,
): string {
  return getImageUrl(SCENE_BACKGROUND_MEMBERS[sceneId], baseUrl);
}

// These members were missing from the supplied BMP collection and were decoded
// directly from the Director casts.
export const DIRECTOR_EXTRACTED_MEMBERS = [
  "BlankPortrait",
  "titel-ryan",
  "titel-saving",
] as const satisfies readonly ImageMemberName[];

// The frame associations are inferred from cast names and ordering. Their exact
// placement and timing will be verified against the Director score.
export const FILM_LOOP_FRAMES = {
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
} as const satisfies Record<
  DirectorFilmLoopName,
  readonly ImageMemberName[]
>;
