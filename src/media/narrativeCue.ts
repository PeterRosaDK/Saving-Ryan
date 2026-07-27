import type { VideoClipId } from "./videoManifest";

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
