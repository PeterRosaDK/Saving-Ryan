import type {
  GameEffect,
  GameState,
  KnowledgeId,
  SceneId,
  SceneInteractionId,
  SceneInteractionTrigger,
} from "../app/types";
import {
  hasKnowledge,
} from "./knowledgeGraph";
import {
  stillsCue,
  textCue,
  textSequenceCue,
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
  timeCost: 0 | 1;
  timeAdvanceCue?: Extract<NarrativeCue, { kind: "text" }>;
  cue?: NarrativeCue;
  blockedCue?: NarrativeCue;
  replaces?: readonly SceneInteractionId[];
  concludesStory?: boolean;
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
    timeCost: 0,
  },
  inspect_ryans_body_and_necklace: {
    id: "inspect_ryans_body_and_necklace",
    scenes: ["A3", "A4"],
    kind: "inspect",
    trigger: "manual",
    label: "Undersøg liget og halskæden",
    requires: [],
    effects: [{ type: "LEARN", id: "killer_dropped_necklace" }],
    timeCost: 0,
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
    timeCost: 0,
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
    timeCost: 1,
    timeAdvanceCue: textCue(
      "Det tager resten af tidsintervallet at gennemgå Barbaras filer grundigt.",
    ),
    cue: stillsCue([
      {
        image: "sektorB3",
        alt: "Barbaras computer i computerrummet.",
        text:
          "Du kaster et blik på Barbaras computer. Der er adgangskontrol på, så du prøver at bruge det navn, David fortalte dig. Det lykkes! Du kan se, at Barbara er inde i universitetets ellers utilgængelige filsystem over karakterer, og du kan desuden se, at hun tilsyneladende er inde under sit eget stamblad!",
      },
    ]),
    blockedCue: stillsCue([
      {
        image: "sektorB3",
        alt: "Barbaras computer i computerrummet.",
        text:
          "Du kaster et blik på Barbaras computer. Desværre er der adgangskontrol på, og du kender ikke brugernavnet.",
      },
    ]),
  },
  eavesdrop_barbara_and_ryan: {
    id: "eavesdrop_barbara_and_ryan",
    scenes: ["B2"],
    kind: "special",
    trigger: "manual",
    label: "Kryb ind under bordet og lyt",
    requires: [],
    effects: [{ type: "LEARN", id: "barbara_and_ryan_argued" }],
    timeCost: 0,
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
    timeCost: 0,
    cue: textCue(
      "Du hiver i bogen og opdager pludselig, at den i virkeligheden er en mystisk kontakt, der aktiverer en hemmelig dørmekanisme. En skydedør glider til side.",
    ),
  },
  watch_secret_passage: {
    id: "watch_secret_passage",
    scenes: ["C2"],
    kind: "special",
    trigger: "manual",
    label: "Hold øje med bogreolen",
    requires: [
      "heard_scraping_behind_bookcase",
      "noticed_laura_disappear_near_reading_room",
    ],
    effects: [
      { type: "LEARN", id: "secret_passage_exists" },
      { type: "LEARN", id: "laura_used_secret_passage" },
    ],
    timeCost: 1,
    timeAdvanceCue: textCue(
      "Du holder øje med bogreolen resten af middagen. Kort før skriget kommer Laura hastigt ind, aktiverer bogen og forsvinder gennem en skjult passage. Nu ved du, hvordan hun kan nå afsatsen uden at bruge dørene.",
    ),
    replaces: ["inspect_secret_passage_book"],
  },
  prevent_ryans_murder: {
    id: "prevent_ryans_murder",
    scenes: ["C1"],
    kind: "special",
    trigger: "manual",
    label: "Brug passagen og stands Laura",
    requires: [
      "laura_confessed",
      "secret_passage_exists",
      "ryan_dismissed_warning",
    ],
    effects: [{ type: "LEARN", id: "ryan_was_saved" }],
    timeCost: 0,
    cue: textCue(
      "Du trækker i bogen, åbner den skjulte dør og følger passagen op mod afsatsen. Denne gang når du frem først. Da Laura viser sig, står du allerede mellem hende og Ryan. Du griber ind, før hun kan nå ham, og hendes skjulte rute er afsløret. Ryan bliver ikke skubbet.",
    ),
    replaces: ["inspect_secret_passage_book"],
    concludesStory: true,
  },
  prevent_david_murder: {
    id: "prevent_david_murder",
    scenes: ["C2"],
    kind: "special",
    trigger: "manual",
    label: "Vent ved bogreolen",
    requires: ["david_prevention_plan", "david_reconstruction_recorded"],
    effects: [{ type: "LEARN", id: "ryan_was_saved" }],
    timeCost: 0,
    cue: textSequenceCue(
      [
        "Ryan går hen til bogreolen og trykker på en skjult mekanisme. En smal dør åbner sig.",
        "David kommer ind og går direkte efter ham. Jørgen træder ind mellem dem.",
        "Jørgen: Du kommer ikke med ham.",
        "David: Flyt dig.",
        "Jørgen: Lauras halskæde ligger i din lomme. Sarah forlod dig for Ryan. Og hvis du følger ham gennem den dør, kommer du til at slå ham ihjel.",
        "David stivner. Da han tager hånden op af lommen, ligger den lille isbjørn i hans hånd.",
        "Ryan når aldrig ud på afsatsen. David bryder sammen og indrømmer, hvad han havde tænkt sig at gøre.",
      ],
      "dc-david-prevention-sequence",
    ),
    replaces: ["inspect_secret_passage_book"],
    concludesStory: true,
  },
  prevent_barbara_murder: {
    id: "prevent_barbara_murder",
    scenes: ["C2"],
    kind: "special",
    trigger: "manual",
    label: "Vent ved bogreolen",
    requires: [
      "barbara_prevention_plan",
      "barbara_reconstruction_recorded",
    ],
    effects: [{ type: "LEARN", id: "ryan_was_saved" }],
    timeCost: 0,
    cue: textSequenceCue(
      [
        "Jørgen stiller sig bag bogreolen og venter.",
        "Barbara kommer ind sammen med Ryan. Hun trykker på den skjulte mekanisme, og den smalle dør åbner sig.",
        "Barbara: Jeg fandt noget derinde. Du bør se det.",
        "Hun tager Lauras isbjørnehalskæde frem og rækker den til Ryan.",
        "Ryan går ud på afsatsen og råber ned mod kantinen.",
        "Ryan: Jørgen! Kom lige og se, hvad jeg har fundet!",
        "Barbara træder hen bag ham og løfter hænderne.",
        "Jørgen springer frem og griber hendes håndled, før hun rammer Ryan.",
        "Jørgen: Ikke denne gang.",
        "Barbara: Hvad laver du?",
        "Jørgen: Jeg ved, hvor du fandt tegningen. Jeg ved, hvornår du gemte billedet. Og jeg ved, hvorfor Laura mangler sin halskæde.",
        "Ryan vender sig. Halskæden ligger stadig i hans hånd.",
        "Barbara kan ikke længere forklare, hvorfor hun har ført ham gennem en hemmelig passage med en stjålet genstand.",
        "Hun bryder sammen, før nogen bliver skubbet.",
      ],
      "dc-barbara-prevention-sequence",
    ),
    replaces: ["inspect_secret_passage_book"],
    concludesStory: true,
  },
  inspect_barbara_building_plans: {
    id: "inspect_barbara_building_plans",
    scenes: ["B2", "B3"],
    kind: "inspect",
    trigger: "manual",
    label: "Åbn bygningstegningen",
    requires: ["barbara_opened_plans_before_murder"],
    effects: [
      { type: "LEARN", id: "building_plans_show_passage" },
      { type: "LEARN", id: "secret_passage_exists" },
    ],
    timeCost: 0,
    cue: textCue(
      "Tegningen viser en smal servicegang bag bogreolen i læsesalen. Den fører direkte til afsatsen over kantinen.",
      "dc-barbara-building-plan-screen",
    ),
    replaces: ["inspect_barbaras_computer"],
  },
  compare_barbara_timestamps: {
    id: "compare_barbara_timestamps",
    scenes: ["B2", "B3"],
    kind: "inspect",
    trigger: "manual",
    label: "Sammenlign tidsstempler",
    requires: [
      "barbara_presented_image_as_new",
      "barbara_saved_necklace_image_before_murder",
      "barbara_opened_plans_before_murder",
    ],
    effects: [{ type: "LEARN", id: "barbara_timestamps_compared" }],
    timeCost: 0,
    cue: textSequenceCue(
      [
        "Siden, Barbara netop “fandt”, ligger allerede i computerens cache. Den blev åbnet og billedet gemt før mordet.",
        "Bygningstegningen blev åbnet i samme tidsrum.",
        "Jørgen tænker: Barbara fandt ikke sporet under efterforskningen. Hun kendte det på forhånd og førte mig med vilje hen til det.",
      ],
      "dc-barbara-timestamp-comparison",
    ),
    replaces: [
      "inspect_barbaras_computer",
      "inspect_barbara_building_plans",
    ],
  },
} as const satisfies Record<SceneInteractionId, SceneInteraction>;

const LAURA_ONLY_INTERACTIONS = new Set<SceneInteractionId>([
  "watch_secret_passage",
  "prevent_ryans_murder",
]);

const LEGACY_BARBARA_INTERACTIONS = new Set<SceneInteractionId>([
  "notice_barbara_computer_expertise",
  "inspect_barbaras_computer",
  "eavesdrop_barbara_and_ryan",
]);

const BARBARA_ONLY_INTERACTIONS = new Set<SceneInteractionId>([
  "prevent_barbara_murder",
  "inspect_barbara_building_plans",
  "compare_barbara_timestamps",
]);

const DAVID_STORY_INTERACTIONS = new Set<SceneInteractionId>([
  "prevent_david_murder",
]);

const DAVID_INTERACTION_OVERRIDES: Partial<
  Record<SceneInteractionId, SceneInteraction>
> = {
  inspect_ryans_body_and_necklace: {
    ...SCENE_INTERACTIONS.inspect_ryans_body_and_necklace,
    effects: [{ type: "LEARN", id: "necklace_found_in_ryans_hand" }],
    cue: stillsCue([
      {
        image: "sektorA3-Ryan1",
        alt: "Ryan ligger livløs på kantinens gulv.",
      },
      {
        image: "sektorA3-Ryan2",
        alt: "Ryans knyttede hånd med den knækkede halskæde.",
        text:
          "Ryans højre hånd er knyttet. Mellem fingrene sidder en lille isbjørn i en knækket halskæde.",
      },
    ], "dc-david-body-necklace-still"),
  },
  inspect_girlfriend_letter: {
    ...SCENE_INTERACTIONS.inspect_girlfriend_letter,
    cue: stillsCue([
      {
        image: "sektorD4-Brev1",
        alt: "Et sammenkrøllet brev i papirkurven.",
      },
      {
        image: "sektorD4-Brev2",
        alt: "Det romantiske brev til Ryan er foldet ud.",
        text:
          "I papirkurven ligger et sammenkrøllet brev til Ryan. Det er underskrevet Sarah, og tonen er tydeligt romantisk.",
      },
    ], "dc-david-letter-still"),
  },
};

const BARBARA_INTERACTION_OVERRIDES: Partial<
  Record<SceneInteractionId, SceneInteraction>
> = {
  inspect_ryans_body_and_necklace: {
    ...SCENE_INTERACTIONS.inspect_ryans_body_and_necklace,
    effects: [{ type: "LEARN", id: "necklace_found_in_ryans_hand" }],
    cue: stillsCue(
      [
        {
          image: "sektorA3-Ryan1",
          alt: "Ryan ligger livløs på kantinens gulv.",
        },
        {
          image: "sektorA3-Ryan2",
          alt: "Ryans hånd med den lille isbjørnehalskæde.",
          text:
            "Ryans hånd er knyttet om Lauras isbjørnehalskæde. Det beviser kun, hvem der ejede halskæden. Ikke hvem der gav den til Ryan.",
        },
      ],
      "dc-barbara-body-necklace-still",
    ),
  },
  inspect_barbaras_computer: {
    ...SCENE_INTERACTIONS.inspect_barbaras_computer,
    effects: [
      { type: "LEARN", id: "barbara_forged_grades" },
      { type: "LEARN", id: "barbara_opened_plans_before_murder" },
      {
        type: "LEARN",
        id: "barbara_saved_necklace_image_before_murder",
      },
    ],
    cue: textSequenceCue(
      [
        "Barbaras computer — vælg undersøgelse: Se eksamens-/karakterfiler eller se nyligt åbnede filer.",
        "Karakterfiler: Flere karakterer er ændret manuelt. Originalværdierne og de nye værdier ligger side om side i en skjult fil.",
        "Nyligt åbnede filer: En arkiveret bygningstegning er åbnet tidligere på dagen.",
        "En billedfil med navnet “laura_isbjoern” er gemt samme formiddag — før mordet.",
      ],
      "dc-barbara-computer-recent-files",
    ),
  },
  eavesdrop_barbara_and_ryan: {
    ...SCENE_INTERACTIONS.eavesdrop_barbara_and_ryan,
    effects: [
      { type: "LEARN", id: "barbara_and_ryan_argued" },
      { type: "LEARN", id: "barbara_blackmailed_by_ryan" },
    ],
    cue: textSequenceCue(
      [
        "Ryan: Du ved godt, hvad der sker, hvis nogen ser de rigtige karakterudskrifter.",
        "Barbara: Du har fået, hvad du ville have.",
        "Ryan: Indtil videre. Du gør, som jeg siger, ellers sender jeg det hele videre.",
      ],
      "dc-barbara-blackmail-sequence",
    ),
  },
};

export function getSceneInteraction(
  id: SceneInteractionId,
  state?: Pick<GameState, "selectedCaseId">,
): SceneInteraction {
  if (state?.selectedCaseId === "david") {
    return DAVID_INTERACTION_OVERRIDES[id] ?? SCENE_INTERACTIONS[id];
  }

  if (state?.selectedCaseId === "barbara") {
    return BARBARA_INTERACTION_OVERRIDES[id] ?? SCENE_INTERACTIONS[id];
  }

  return SCENE_INTERACTIONS[id];
}

export function getSceneInteractions(
  state: Pick<GameState, "selectedCaseId">,
  scene: SceneId,
  trigger: SceneInteractionTrigger,
): readonly SceneInteraction[] {
  return Object.values(SCENE_INTERACTIONS).filter(
    (interaction) =>
      (interaction.scenes as readonly SceneId[]).includes(scene) &&
      interaction.trigger === trigger &&
      (state.selectedCaseId === "laura"
        ? !DAVID_STORY_INTERACTIONS.has(interaction.id) &&
          !BARBARA_ONLY_INTERACTIONS.has(interaction.id)
        : state.selectedCaseId === "david"
          ? !LAURA_ONLY_INTERACTIONS.has(interaction.id) &&
            !LEGACY_BARBARA_INTERACTIONS.has(interaction.id) &&
            !BARBARA_ONLY_INTERACTIONS.has(interaction.id)
          : !LAURA_ONLY_INTERACTIONS.has(interaction.id) &&
            !DAVID_STORY_INTERACTIONS.has(interaction.id) &&
            interaction.id !== "inspect_girlfriend_letter"),
  ).map((interaction) => getSceneInteraction(interaction.id, state));
}

export function canPerformSceneInteraction(
  state: GameState,
  interaction: SceneInteraction,
): boolean {
  return hasKnowledge(state, interaction.requires);
}

export function getSceneInteractionTimeCost(
  state: GameState,
  interaction: SceneInteraction,
): 0 | 1 {
  const alreadyCompleted =
    interaction.effects.length > 0 &&
    interaction.effects.every(
      (effect) => state.knowledge[effect.id],
    );

  return alreadyCompleted ? 0 : interaction.timeCost;
}
