import type {
  GameEffect,
  GameState,
  KnowledgeId,
  SceneId,
  SceneInteractionId,
  SceneInteractionTrigger,
  SpecialSequenceId,
} from "../app/types";
import {
  hasKnowledge,
} from "./knowledgeGraph";
import {
  textCue,
  type NarrativeCue,
} from "../media/narrativeCue";

export interface SceneInteraction {
  id: SceneInteractionId;
  scenes: readonly SceneId[];
  kind: "observe" | "inspect" | "special";
  trigger: SceneInteractionTrigger;
  label: string;
  requires: readonly KnowledgeId[];
  effects: readonly GameEffect[];
  cue?: NarrativeCue;
  specialSequence?: SpecialSequenceId;
}

export const SCENE_INTERACTIONS = {
  notice_barbara_computer_expertise: {
    id: "notice_barbara_computer_expertise",
    scenes: ["B1"],
    kind: "observe",
    trigger: "enter",
    label: "Læg mærke til Barbaras computerarbejde",
    requires: [],
    effects: [{ type: "LEARN", id: "barbara_is_computer_expert" }],
  },
  witness_ryan_bullying_marie: {
    id: "witness_ryan_bullying_marie",
    scenes: ["E1"],
    kind: "observe",
    trigger: "wait",
    label: "Overvær Ryan mobbe Marie",
    requires: [],
    effects: [{ type: "LEARN", id: "ryan_bullied_marie" }],
  },
  witness_laura_computer_activity: {
    id: "witness_laura_computer_activity",
    scenes: ["B4"],
    kind: "special",
    trigger: "wait",
    label: "Følg Lauras mistænkelige computeraktivitet",
    requires: [],
    effects: [{ type: "LEARN", id: "laura_hid_computer_activity" }],
    specialSequence: "laura_suspect",
  },
  inspect_ryans_body_and_necklace: {
    id: "inspect_ryans_body_and_necklace",
    scenes: ["A3"],
    kind: "inspect",
    trigger: "manual",
    label: "Undersøg liget og halskæden",
    requires: [],
    effects: [{ type: "LEARN", id: "killer_dropped_necklace" }],
    cue: textCue(
      "I Ryans hånd ligger en isbjørnehalskæde. Den må være revet af morderen under faldet.",
    ),
  },
  inspect_girlfriend_letter: {
    id: "inspect_girlfriend_letter",
    scenes: ["D4"],
    kind: "inspect",
    trigger: "manual",
    label: "Læs brevet",
    requires: [],
    effects: [{ type: "LEARN", id: "ryan_has_girlfriend_sarah" }],
    cue: textCue(
      "I papirkurven ligger et kærestebrev til Ryan. Det er underskrevet Sarah.",
    ),
  },
  inspect_barbaras_computer: {
    id: "inspect_barbaras_computer",
    scenes: ["B2", "B3"],
    kind: "inspect",
    trigger: "manual",
    label: "Log ind på Barbaras computer",
    requires: ["barbara_hacker_alias_intruder"],
    effects: [{ type: "LEARN", id: "barbara_forged_grades" }],
    cue: textCue(
      "Koden Intruder virker. I Barbaras filer finder du ændrede eksamenskarakterer.",
    ),
  },
} as const satisfies Record<SceneInteractionId, SceneInteraction>;

export function getSceneInteraction(
  id: SceneInteractionId,
): SceneInteraction {
  return SCENE_INTERACTIONS[id];
}

export function getSceneInteractions(
  scene: SceneId,
  trigger: SceneInteractionTrigger,
): readonly SceneInteraction[] {
  return Object.values(SCENE_INTERACTIONS).filter(
    (interaction) =>
      (interaction.scenes as readonly SceneId[]).includes(scene) &&
      interaction.trigger === trigger,
  );
}

export function canPerformSceneInteraction(
  state: GameState,
  interaction: SceneInteraction,
): boolean {
  return hasKnowledge(state, interaction.requires);
}
