export type AppPhase =
  | "menu"
  | "intro"
  | "exploration"
  | "dialogue"
  | "reconstruction"
  | "ending";

export const CASE_IDS = ["laura", "david", "barbara"] as const;

export type CaseId = (typeof CASE_IDS)[number];

export type LocationId = "A" | "B" | "C" | "D" | "E";

export type TimeSlot = 1 | 2 | 3 | 4;

export type SceneId = `${LocationId}${TimeSlot}`;

export type TransitionEventId = SceneId;

export const KNOWLEDGE_IDS = [
  "barbara_is_computer_expert",
  "barbara_hacker_alias_intruder",
  "barbara_forged_grades",
  "barbara_and_ryan_argued",
  "ryan_has_girlfriend_sarah",
  "ryan_bullied_marie",
  "laura_hid_computer_activity",
  "laura_acknowledged_barbara_and_ryan",
  "heard_scraping_behind_bookcase",
  "noticed_laura_disappear_near_reading_room",
  "laura_used_secret_passage",
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
  "sarah_left_david_for_ryan",
  "laura_dropped_necklace",
  "david_picked_up_necklace",
  "necklace_found_in_ryans_hand",
  "david_followed_ryan",
  "david_motive_conclusion",
  "david_necklace_possession_conclusion",
  "david_opportunity_conclusion",
  "marie_says_david_was_hurt",
  "david_lied_about_ryan",
  "david_confessed",
  "david_murder_method_known",
  "david_reconstruction_recorded",
  "david_prevention_plan",
  "barbara_blackmailed_by_ryan",
  "laura_put_necklace_in_bag",
  "necklace_missing_from_laura_bag",
  "barbara_had_access_to_laura_bag",
  "barbara_opened_plans_before_murder",
  "building_plans_show_passage",
  "barbara_saved_necklace_image_before_murder",
  "barbara_left_with_ryan",
  "barbara_alibi_gap",
  "barbara_presented_image_as_new",
  "barbara_timestamps_compared",
  "laura_private_history_not_evidence",
  "barbara_motive_conclusion",
  "barbara_opportunity_conclusion",
  "barbara_passage_conclusion",
  "barbara_staging_conclusion",
  "marie_saw_barbara_by_bag",
  "david_saw_barbara_lead_ryan",
  "barbara_confessed",
  "barbara_murder_method_known",
  "barbara_reconstruction_recorded",
  "barbara_prevention_plan",
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
  "david_breakup",
  "david_saw_ryan",
  "laura_necklace_bag",
  "laura_bag_access",
  "barbara_time_with_ryan",
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
}

export interface LoopDialogueState {
  askedChoices: DialogueChoiceId[];
  barbaraHelp: BarbaraHelpState;
  refusesFurtherDialogue: CharacterId[];
}

export type SceneInteractionId =
  | "notice_barbara_computer_expertise"
  | "inspect_ryans_body_and_necklace"
  | "inspect_girlfriend_letter"
  | "eavesdrop_barbara_and_ryan"
  | "inspect_secret_passage_book"
  | "watch_secret_passage"
  | "prevent_ryans_murder"
  | "prevent_david_murder"
  | "prevent_barbara_murder"
  | "inspect_barbaras_computer"
  | "inspect_barbara_building_plans"
  | "compare_barbara_timestamps";

export type SceneInteractionTrigger = "enter" | "manual";

export type GameEffect = { type: "LEARN"; id: KnowledgeId };

export interface LoopState {
  seenTransitions: SceneId[];
  dialogue: LoopDialogueState;
}

export type TimeAdvanceCause =
  | {
      kind: "clock";
      eventId: TransitionEventId;
    }
  | {
      kind: "interaction";
      id: SceneInteractionId;
    };

export interface PendingTransition {
  from: SceneId;
  to: SceneId;
  cause: TimeAdvanceCause;
  beginsNewLoop: boolean;
}

export interface CaseStatistics {
  confrontations: number;
  wrongAccusations: number;
  prematureAccusations: number;
}

export interface CaseProgress {
  currentLead: string;
  pendingInsights: KnowledgeId[];
  statistics: CaseStatistics;
  reconstructionAvailable: boolean;
  reconstructionCompleted: boolean;
}

export interface GameState {
  version: 3;
  selectedCaseId: CaseId;
  phase: AppPhase;
  location: LocationId;
  timeSlot: TimeSlot;
  loop: number;
  knowledge: Record<KnowledgeId, boolean>;
  dialogue: DialogueProgress;
  loopState: LoopState;
  pendingTransition: PendingTransition | null;
  caseProgress: CaseProgress;
}

export type GameAction =
  | { type: "START_CASE"; caseId: CaseId }
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
  | { type: "DISMISS_INSIGHTS" }
  | { type: "COMPLETE_RECONSTRUCTION" }
  | { type: "RESET_GAME" };
