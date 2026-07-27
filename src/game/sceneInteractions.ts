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
  stillsCue,
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
  blockedCue?: NarrativeCue;
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
    scenes: ["A3", "A4"],
    kind: "inspect",
    trigger: "manual",
    label: "Undersøg liget og halskæden",
    requires: [],
    effects: [{ type: "LEARN", id: "killer_dropped_necklace" }],
    cue: stillsCue([
      {
        image: "sektorA3-Ryan1",
        alt: "Ryan ligger livløs på kantinens gulv.",
      },
      {
        image: "sektorA3-Ryan2",
        alt: "Et nærbillede af halskæden ved Ryans hånd.",
        text:
          "I Ryans hånd ligger en isbjørnehalskæde. Den må være revet af morderen under faldet.",
      },
    ]),
  },
  inspect_girlfriend_letter: {
    id: "inspect_girlfriend_letter",
    scenes: ["D1", "D2", "D3", "D4"],
    kind: "inspect",
    trigger: "manual",
    label: "Kig i papirkurven",
    requires: [],
    effects: [{ type: "LEARN", id: "ryan_has_girlfriend_sarah" }],
    cue: stillsCue([
      {
        image: "sektorD4-Brev1",
        alt: "Et brev stikker op af papirkurven i grupperummet.",
      },
      {
        image: "sektorD4-Brev2",
        alt: "Kærestebrevet til Ryan er foldet ud.",
        text:
          "I papirkurven ligger et kærestebrev til Ryan. Det er underskrevet Sarah.",
      },
    ]),
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
      "Du kaster et blik på Barbaras computer. Der er adgangskontrol på, så du prøver at bruge det navn, David fortalte dig. Det lykkes! Du kan se, at Barbara er inde i universitetets ellers utilgængelige filsystem over karakterer, og du kan desuden se, at hun tilsyneladende er inde under sit eget stamblad!",
    ),
    blockedCue: textCue(
      "Du kaster et blik på Barbaras computer. Desværre er der adgangskontrol på, og du kender ikke brugernavnet.",
    ),
  },
  eavesdrop_barbara_and_ryan: {
    id: "eavesdrop_barbara_and_ryan",
    scenes: ["B2"],
    kind: "special",
    trigger: "manual",
    label: "Kryb ind under bordet og lyt",
    requires: [],
    effects: [{ type: "LEARN", id: "barbara_and_ryan_argued" }],
    cue: textCue(
      "Du kravler ind under bordet og overværer et skænderi mellem Ryan og Barbara. Det lyder, som om Ryan afpresser Barbara.",
    ),
  },
  inspect_secret_passage_book: {
    id: "inspect_secret_passage_book",
    scenes: ["C1", "C2", "C3", "C4"],
    kind: "special",
    trigger: "manual",
    label: "Kig nærmere på bogen",
    requires: [],
    effects: [{ type: "LEARN", id: "secret_passage_exists" }],
    cue: textCue(
      "Du hiver i bogen og opdager pludselig, at den i virkeligheden er en mystisk kontakt, der aktiverer en hemmelig dørmekanisme. En skydedør glider til side.",
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
