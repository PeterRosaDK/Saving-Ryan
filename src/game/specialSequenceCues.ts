import type { SpecialSequenceId } from "../app/types";
import {
  videoCue,
  type NarrativeCue,
} from "../media/narrativeCue";

const SPECIAL_SEQUENCE_CUES = {
  laura_suspect: videoCue("LauraSuspekt"),
} as const satisfies Record<SpecialSequenceId, NarrativeCue>;

export function getSpecialSequenceCue(
  sequenceId: SpecialSequenceId,
): NarrativeCue {
  return SPECIAL_SEQUENCE_CUES[sequenceId];
}
