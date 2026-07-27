export type AppPhase = "intro" | "exploration" | "dialogue" | "ending";

export type LocationId = "A" | "B" | "C" | "D" | "E";

export type TimeSlot = 1 | 2 | 3 | 4;

export type SceneId = `${LocationId}${TimeSlot}`;

export const KNOWLEDGE_IDS = [
  "barbara_is_computer_expert",
  "barbara_hacker_alias_intruder",
  "barbara_forged_grades",
  "barbara_and_ryan_argued",
  "ryan_has_girlfriend_sarah",
  "ryan_bullied_marie",
  "laura_hid_computer_activity",
  "laura_acknowledged_barbara_and_ryan",
  "ryan_and_laura_were_together",
  "ryan_left_laura",
  "secret_passage_exists",
  "laura_was_in_institution",
  "laura_owns_polar_bear_necklace",
  "ryan_was_murdered",
  "killer_dropped_necklace",
  "necklace_connects_laura_to_scene",
  "laura_confessed",
  "ryan_dismissed_warning",
  "ryan_was_saved",
] as const;

export type KnowledgeId = (typeof KNOWLEDGE_IDS)[number];

export type CharacterId = "Barbara" | "David" | "Laura" | "Marie" | "Ryan";

export const DIALOGUE_TOPIC_IDS = [
  "about_laura",
  "about_marie",
  "about_david",
  "about_ryan",
  "about_barbara",
  "alibi",
  "theory",
  "accuse",
  "barbara_and_computers",
  "necklace",
  "marie_and_ryan",
  "barbara_and_ryan",
  "ask_barbara_for_help",
  "warn_ryan",
  "about_sarah",
] as const;

export type DialogueTopicId = (typeof DIALOGUE_TOPIC_IDS)[number];

export type DialogueChoiceId = `${CharacterId}:${DialogueTopicId}`;

export type BarbaraHelpState =
  | "not_requested"
  | "requested"
  | "ready"
  | "completed";

export interface DialogueProgress {
  activePerson: CharacterId | null;
  askedChoices: DialogueChoiceId[];
  barbaraHelp: BarbaraHelpState;
}

export type SpecialSequenceId = "laura_suspect";

export type SceneInteractionId =
  | "notice_barbara_computer_expertise"
  | "witness_ryan_bullying_marie"
  | "witness_laura_computer_activity"
  | "inspect_ryans_body_and_necklace"
  | "inspect_girlfriend_letter"
  | "eavesdrop_barbara_and_ryan"
  | "inspect_secret_passage_book"
  | "prevent_ryans_murder"
  | "inspect_barbaras_computer";

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
  dialogue: DialogueProgress;
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
  | { type: "START_DIALOGUE"; person: CharacterId }
  | { type: "CLOSE_DIALOGUE" }
  | {
      type: "COMPLETE_DIALOGUE_CHOICE";
      person: CharacterId;
      topic: DialogueTopicId;
      completion: "ended" | "skipped";
    }
  | { type: "RESET_GAME" };
