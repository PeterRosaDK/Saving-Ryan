import type {
  GameEffect,
  SceneId,
  SceneInteractionId,
  SceneInteractionTrigger,
  SpecialSequenceId,
} from "../app/types";

export interface SceneInteraction {
  id: SceneInteractionId;
  scene: SceneId;
  kind: "observe" | "inspect" | "special";
  trigger: SceneInteractionTrigger;
  label: string;
  effects: readonly GameEffect[];
  specialSequence?: SpecialSequenceId;
}

export const SCENE_INTERACTIONS = {
  notice_barbara_computer_expertise: {
    id: "notice_barbara_computer_expertise",
    scene: "B1",
    kind: "observe",
    trigger: "enter",
    label: "Læg mærke til Barbaras computerarbejde",
    effects: [{ type: "LEARN", id: "barbara_is_computer_expert" }],
  },
  witness_ryan_bullying_marie: {
    id: "witness_ryan_bullying_marie",
    scene: "E1",
    kind: "observe",
    trigger: "wait",
    label: "Overvær Ryan mobbe Marie",
    effects: [{ type: "LEARN", id: "ryan_bullied_marie" }],
  },
  witness_laura_computer_activity: {
    id: "witness_laura_computer_activity",
    scene: "B4",
    kind: "special",
    trigger: "wait",
    label: "Følg Lauras mistænkelige computeraktivitet",
    effects: [{ type: "LEARN", id: "laura_hid_computer_activity" }],
    specialSequence: "laura_suspect",
  },
  inspect_ryans_body_and_necklace: {
    id: "inspect_ryans_body_and_necklace",
    scene: "A3",
    kind: "inspect",
    trigger: "manual",
    label: "Undersøg liget og halskæden",
    effects: [{ type: "LEARN", id: "killer_dropped_necklace" }],
  },
  inspect_girlfriend_letter: {
    id: "inspect_girlfriend_letter",
    scene: "D4",
    kind: "inspect",
    trigger: "manual",
    label: "Læs brevet",
    effects: [{ type: "LEARN", id: "ryan_has_girlfriend_sarah" }],
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
      interaction.scene === scene && interaction.trigger === trigger,
  );
}
