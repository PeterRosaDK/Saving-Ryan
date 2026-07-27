export type AppPhase = "intro" | "exploration";

export type LocationId = "A" | "B" | "C" | "D" | "E";

export type TimeSlot = 1 | 2 | 3 | 4;

export type SceneId = `${LocationId}${TimeSlot}`;

export const KNOWLEDGE_IDS = [
  "barbara_is_computer_expert",
  "barbara_hacker_alias_intruder",
  "barbara_forged_grades",
  "ryan_has_girlfriend_sarah",
  "ryan_bullied_marie",
  "laura_hid_computer_activity",
  "ryan_and_laura_were_together",
  "ryan_left_laura",
  "secret_passage_exists",
  "laura_was_in_institution",
  "laura_owns_polar_bear_necklace",
  "ryan_was_murdered",
  "killer_dropped_necklace",
  "necklace_connects_laura_to_scene",
  "laura_confessed",
] as const;

export type KnowledgeId = (typeof KNOWLEDGE_IDS)[number];

export type CharacterId = "Barbara" | "David" | "Laura" | "Marie" | "Ryan";

export type SpecialSequenceId = "laura_suspect";

export type SceneInteractionId =
  | "notice_barbara_computer_expertise"
  | "witness_ryan_bullying_marie"
  | "witness_laura_computer_activity"
  | "inspect_ryans_body_and_necklace"
  | "inspect_girlfriend_letter";

export type SceneInteractionTrigger = "enter" | "manual" | "wait";

export type GameEffect = { type: "LEARN"; id: KnowledgeId };

export interface LoopState {
  seenTransitions: SceneId[];
}

export interface PendingTransition {
  from: SceneId;
  to: SceneId;
  transitionId: SceneId;
  specialSequence?: SpecialSequenceId;
  beginsNewLoop: boolean;
}

export interface GameState {
  version: 1;
  phase: AppPhase;
  location: LocationId;
  timeSlot: TimeSlot;
  loop: number;
  knowledge: Record<KnowledgeId, boolean>;
  loopState: LoopState;
  pendingTransition: PendingTransition | null;
}

export type GameAction =
  | { type: "INTRO_FINISHED" }
  | { type: "SKIP_INTRO" }
  | { type: "MOVE_TO_LOCATION"; location: LocationId }
  | { type: "WAIT" }
  | { type: "COMPLETE_TRANSITION" }
  | { type: "PERFORM_INTERACTION"; id: SceneInteractionId }
  | { type: "RESET_GAME" };
