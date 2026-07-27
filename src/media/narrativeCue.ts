import type { VideoClipId } from "./videoManifest";
import type { ImageMemberName } from "./imageManifest";

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
    }
  | {
      kind: "stills";
      frames: readonly {
        image: ImageMemberName;
        alt: string;
        text?: string;
      }[];
    };

export function videoCue(clipId: VideoClipId): NarrativeCue {
  return {
    kind: "video",
    clipId,
  };
}

export function textCue(text: string): NarrativeCue {
  return {
    kind: "text",
    text,
  };
}

export function stillsCue(
  frames: Extract<NarrativeCue, { kind: "stills" }>["frames"],
): NarrativeCue {
  if (frames.length === 0) {
    throw new Error("A still-image cue requires at least one frame.");
  }

  return {
    kind: "stills",
    frames,
  };
}
