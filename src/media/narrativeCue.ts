import type { VideoClipId } from "./videoManifest";
import type { ImageMemberName } from "./imageManifest";
import type { DirectorsCutAssetId } from "./directorsCutAssetManifest";

/*
 * Dialogue and special sequences address presentation through this small seam.
 * Legacy content is video-backed; unfinished and future case content can start
 * as text without changing investigation or dialogue rules.
 */
export type NarrativeCue =
  | {
      kind: "video";
      clipId: VideoClipId;
    }
  | {
      kind: "text";
      text: string;
      placeholderAssetId?: DirectorsCutAssetId;
    }
  | {
      kind: "text-sequence";
      cards: readonly string[];
      placeholderAssetId: DirectorsCutAssetId;
    }
  | {
      kind: "stills";
      frames: readonly {
        image: ImageMemberName;
        alt: string;
        text?: string;
      }[];
      placeholderAssetId?: DirectorsCutAssetId;
    };

export function videoCue(clipId: VideoClipId): NarrativeCue {
  return {
    kind: "video",
    clipId,
  };
}

export function textCue(
  text: string,
  placeholderAssetId?: DirectorsCutAssetId,
): Extract<NarrativeCue, { kind: "text" }> {
  return {
    kind: "text",
    text,
    ...(placeholderAssetId ? { placeholderAssetId } : {}),
  };
}

export function textSequenceCue(
  cards: readonly string[],
  placeholderAssetId: DirectorsCutAssetId,
): Extract<NarrativeCue, { kind: "text-sequence" }> {
  if (cards.length === 0) {
    throw new Error("A text sequence requires at least one card.");
  }
  return { kind: "text-sequence", cards, placeholderAssetId };
}

export function stillsCue(
  frames: Extract<NarrativeCue, { kind: "stills" }>["frames"],
  placeholderAssetId?: DirectorsCutAssetId,
): NarrativeCue {
  if (frames.length === 0) {
    throw new Error("A still-image cue requires at least one frame.");
  }

  return {
    kind: "stills",
    frames,
    ...(placeholderAssetId ? { placeholderAssetId } : {}),
  };
}
