export type AppPhase =
  | "menu"
  | "intro"
  | "exploration"
  | "dialogue"
  | "reconstruction"
  | "ending";

export const CASE_IDS = [
  "laura",
  "david",
  "barbara",
  "marie",
  "jorgen",
  "ryan",
] as const;

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
  "marie_trust_earned",
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
  "marie_wrote_report",
  "ryan_claimed_marie_work",
  "ryan_threatened_remove_marie_credit",
  "ryan_threatened_laura",
  "marie_discovered_passage",
  "marie_left_group_before_scream",
  "marie_claimed_no_absence",
  "marie_fragment_in_ryan_hand",
  "marie_fragment_has_edits",
  "marie_torn_page_in_folder",
  "marie_returned_dusty",
  "marie_motive_conclusion",
  "marie_alibi_conclusion",
  "marie_passage_conclusion",
  "marie_physical_conclusion",
  "marie_confessed",
  "marie_murder_method_known",
  "marie_reconstruction_recorded",
  "marie_prevention_plan",
  "marie_work_secured",
  "jorgen_prior_loop_reference_ready",
  "jorgen_note_references_previous_loop",
  "jorgen_unknown_knows_routes",
  "jorgen_other_remembers_conclusion",
  "jorgen_login_used",
  "jorgen_lookalike_seen",
  "jorgen_player_alibi",
  "jorgen_identity_used_conclusion",
  "jorgen_npc_alibis_hold",
  "jorgen_passage_test_placed",
  "jorgen_passage_marker_survived",
  "jorgen_outside_control_reset",
  "jorgen_unknown_in_passage_at_reset",
  "jorgen_passage_persistence_conclusion",
  "jorgen_fragment_in_ryan_hand",
  "jorgen_fragment_handwriting",
  "jorgen_current_page_intact",
  "jorgen_fragment_future_knowledge",
  "jorgen_fragment_from_future_conclusion",
  "jorgen_later_self_exists_conclusion",
  "jorgen_ryan_called_with_fragment",
  "jorgen_future_self_murderer_conclusion",
  "jorgen_revelation_completed",
  "jorgen_reconstruction_recorded",
  "jorgen_prevention_plan",
  "jorgen_decoy_planted",
  "jorgen_later_self_dissolved",
  "jorgen_paradox_broken",
  "ryan_fall_caused_death",
  "ryan_necklace_in_hand",
  "ryan_necklace_torn_clasp",
  "ryan_laura_on_ledge",
  "ryan_laura_owns_necklace",
  "ryan_laura_neck_injury",
  "ryan_laura_pushed",
  "ryan_laura_says_attacked_first",
  "ryan_laura_partial_admission",
  "ryan_physical_action_open_conclusion",
  "ryan_laura_dossier",
  "ryan_knew_dossier",
  "ryan_used_private_history_to_control",
  "ryan_group_manipulation_pattern",
  "ryan_silencing_motive_conclusion",
  "ryan_sent_meeting_message",
  "ryan_message_before_murder",
  "ryan_planned_alone",
  "ryan_knew_passage_before_meeting",
  "ryan_arranged_ledge_meeting_conclusion",
  "ryan_institution_research",
  "ryan_false_suicide_draft",
  "ryan_research_deleted",
  "ryan_premeditation_timestamp",
  "ryan_false_suicide_plan_conclusion",
  "ryan_self_defense_conclusion",
  "ryan_responsibility_conclusion",
  "ryan_manipulative_denial",
  "ryan_reconstruction_recorded",
  "ryan_prevention_plan",
  "ryan_message_copy_secured",
  "ryan_plan_files_secured",
  "ryan_laura_warned",
  "ryan_attack_prevented",
  "ryan_laura_saved",
  "ryan_ryan_saved",
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
  "marie_work",
  "marie_threat",
  "marie_location",
  "jorgen_sighting",
  "ryan_warning",
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
  seenResponses: string[];
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
  | "prevent_marie_murder"
  | "inspect_barbaras_computer"
  | "inspect_barbara_building_plans"
  | "compare_barbara_timestamps"
  | "inspect_marie_folder"
  | "inspect_marie_torn_page"
  | "inspect_marie_passage_trace"
  | "secure_marie_work"
  | "inspect_jorgen_anonymous_note"
  | "inspect_jorgen_login_audit"
  | "review_jorgen_alibis"
  | "place_jorgen_passage_test"
  | "inspect_jorgen_passage_test"
  | "compare_jorgen_notebook"
  | "confront_later_jorgen"
  | "plant_jorgen_decoy"
  | "prevent_jorgen_murder"
  | "inspect_ryan_lure_message"
  | "inspect_laura_ryan_dossier"
  | "inspect_ryan_passage_plan"
  | "inspect_ryan_research_cache"
  | "inspect_ryan_deleted_draft"
  | "compare_ryan_premeditation_timestamps"
  | "secure_ryan_evidence"
  | "prevent_ryan_attack";

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
  previousLoopTransitions: SceneId[];
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
