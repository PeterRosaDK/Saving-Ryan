export type AppPhase = "intro" | "exploration";

export type LocationId = "A" | "B" | "C" | "D" | "E";

export type TimeSlot = 1 | 2 | 3 | 4;

export type SceneId = `${LocationId}${TimeSlot}`;

export type KnowledgeStatus = "unknown" | "discovered" | "confirmed";

export type KnowledgeId =
  | "barbara_is_computer_expert"
  | "barbara_hacker_alias_intruder"
  | "barbara_forged_grades"
  | "ryan_has_girlfriend_sarah"
  | "ryan_bullied_marie"
  | "laura_hid_computer_activity"
  | "ryan_and_laura_were_together"
  | "ryan_left_laura"
  | "secret_passage_exists"
  | "laura_was_in_institution"
  | "laura_owns_polar_bear_necklace"
  | "ryan_was_murdered"
  | "killer_dropped_necklace"
  | "necklace_connects_laura_to_scene"
  | "laura_confessed";

export type CharacterId = "Barbara" | "David" | "Laura" | "Marie" | "Ryan";

export interface LoopState {
  seenTransitions: SceneId[];
}

export interface DialogueState {
  person: CharacterId | null;
  returnScene: SceneId | null;
  askedTopics: string[];
}

export interface GameState {
  version: 1;
  phase: AppPhase;
  location: LocationId;
  timeSlot: TimeSlot;
  loop: number;
  knowledge: Record<KnowledgeId, KnowledgeStatus>;
  loopState: LoopState;
  dialogue: DialogueState;
  lastTransition: string | null;
}

export type GameAction =
  | { type: "START_GAME" }
  | { type: "MOVE_TO_LOCATION"; location: LocationId }
  | { type: "WAIT" }
  | {
      type: "SET_KNOWLEDGE";
      id: KnowledgeId;
      status?: Exclude<KnowledgeStatus, "unknown">;
    }
  | { type: "DISMISS_TRANSITION" }
  | { type: "RESET_GAME" };
