import type {
  CaseId,
  GameEffect,
  SceneId,
  TransitionEventId,
} from "../app/types";
import {
  stillsCue,
  textCue,
  textSequenceCue,
  videoCue,
  type NarrativeCue,
} from "../media/narrativeCue";

export interface LocationTransitionEvent {
  id: TransitionEventId;
  scene: SceneId;
  cue: Extract<NarrativeCue, { kind: "text" }>;
  specialCue?: NarrativeCue;
  effects: readonly GameEffect[];
}

function defineTransitionEvent(
  scene: SceneId,
  text: string,
  options: {
    specialCue?: NarrativeCue;
    effects?: readonly GameEffect[];
  } = {},
): LocationTransitionEvent {
  return {
    id: scene,
    scene,
    cue: {
      kind: "text",
      text,
    },
    specialCue: options.specialCue,
    effects: options.effects ?? [],
  };
}

/*
 * The primary text is verbatim from "Script Vent" in Spillet.dir. SceneId is
 * both the source location/time and the event lookup key, so simultaneous
 * transitions remain explicitly location-dependent. Phase 9 supplements use
 * separate special cues and leave the restored wording intact.
 */
export const LOCATION_TRANSITION_EVENTS = {
  A1: defineTransitionEvent(
    "A1",
    "Laura rejser sig og går ud mod gangen.",
  ),
  A2: defineTransitionEvent(
    "A2",
    "Pludselig hører du Ryans stemme råbe et eller andet, og sekundet efter kommer hans korpus svævende ned fra himlen og splatter ud.",
  ),
  A3: defineTransitionEvent(
    "A3",
    "Laura går over mod gangen. David kommer og sætter sig.",
  ),
  A4: defineTransitionEvent(
    "A4",
    "I ankommer til universitet. Efter et kort møde går folk hver til sit. Laura bliver siddende.",
  ),
  B1: defineTransitionEvent(
    "B1",
    "Barbara sidder og skriver på sin computer. Ryan kommer ind i lokalet. Han kalder Barbara over til sig i hjørnet. De to begynder at diskutere.",
  ),
  B2: defineTransitionEvent(
    "B2",
    "Ryan og Barbara går ud af rummet. Et par minutter efter hører du et skrig fra kantinen.",
  ),
  B3: defineTransitionEvent(
    "B3",
    "Laura og Marie kommer ind i rummet.",
  ),
  B4: defineTransitionEvent(
    "B4",
    "Marie forlader lokalet. Du venter lidt og går så hen til Laura.",
    {
      specialCue: videoCue("LauraSuspekt"),
      effects: [
        {
          type: "LEARN",
          id: "laura_hid_computer_activity",
        },
      ],
    },
  ),
  C1: defineTransitionEvent(
    "C1",
    "Ryan rejser sig og går ud i gangen.",
  ),
  C2: defineTransitionEvent(
    "C2",
    "Du går ud i gangen og holder en pause. På vejen derud møder du Ryan, der går ind i læsesalen. Lidt efter går også David derind. Pludselig høres et skrig fra kantinen!",
    {
      specialCue: stillsCue([
        {
          image: "sektorC2",
          alt: "Bogreolerne i læsesalen.",
          text:
            "Lige før skriget hører du en tung, skrabende lyd fra området bag bogreolen. Du kan ikke se, hvad der bevæger sig.",
        },
      ]),
      effects: [
        {
          type: "LEARN",
          id: "heard_scraping_behind_bookcase",
        },
      ],
    },
  ),
  C3: defineTransitionEvent(
    "C3",
    "David forlader læsesalen. Barbara kommer ind.",
  ),
  C4: defineTransitionEvent(
    "C4",
    "I ankommer til universitet. Efter et kort møde går folk hver til sit. Du går med Ryan ind i læsesalen.",
  ),
  D1: defineTransitionEvent(
    "D1",
    "David rejser sig og går ud i gangen.",
  ),
  D2: defineTransitionEvent(
    "D2",
    "Marie forlader lokalet. Nogle minutter senere høres et skrig fra kantinen!",
  ),
  D3: defineTransitionEvent(
    "D3",
    "Barbara går ud. Marie går med.",
  ),
  D4: defineTransitionEvent(
    "D4",
    "I ankommer til universitet. Efter et kort møde går folk hver til sit. Du går med Marie og David ind i grupperummet.",
  ),
  E1: defineTransitionEvent(
    "E1",
    "David kommer ud fra grupperummet. Laura kommer fra kantinen og snakker med ham. Imens begynder Ryan at mobbe Marie.",
    {
      effects: [
        {
          type: "LEARN",
          id: "ryan_bullied_marie",
        },
      ],
    },
  ),
  E2: defineTransitionEvent(
    "E2",
    "David og Laura holder op med at tale. David går ind i læsesalen, og Laura er pludselig væk.",
    {
      specialCue: textCue(
        "Du så ikke Laura gå gennem nogen af dørene i gangen. Hendes pludselige forsvinden må have en anden forklaring.",
      ),
      effects: [
        {
          type: "LEARN",
          id: "noticed_laura_disappear_near_reading_room",
        },
      ],
    },
  ),
  E3: defineTransitionEvent(
    "E3",
    "Du står og keder dig. Der sker intet som helst.",
  ),
  E4: defineTransitionEvent(
    "E4",
    "I ankommer til universitet. Efter et kort møde går folk hver til sit. Du går ud i gangen.",
  ),
} as const satisfies Record<SceneId, LocationTransitionEvent>;

export const TRANSITION_TEXT = Object.fromEntries(
  Object.entries(LOCATION_TRANSITION_EVENTS).map(([scene, event]) => [
    scene,
    event.cue.text,
  ]),
) as Readonly<Record<SceneId, string>>;

const DAVID_TRANSITION_OVERRIDES: Partial<
  Record<SceneId, LocationTransitionEvent>
> = {
  B4: defineTransitionEvent(
    "B4",
    "Marie forlader lokalet. Du venter lidt, før den nye morgen begynder.",
  ),
  C2: defineTransitionEvent(
    "C2",
    "Ryan går ind i læsesalen. David ser ham og følger efter. Kort efter høres et skrig fra kantinen.",
    {
      specialCue: textCue(
        "David fulgte Ryan ind i læsesalen få minutter før faldet. Han var den sidste kendte person, der gik efter Ryan.",
        "dc-david-reading-room-follow-sequence",
      ),
      effects: [{ type: "LEARN", id: "david_followed_ryan" }],
    },
  ),
  E1: defineTransitionEvent(
    "E1",
    "David og Laura taler sammen i gangen, mens Ryan begynder at genere Marie.",
    {
      specialCue: textSequenceCue(
        [
          "David og Laura taler sammen i gangen, mens Ryan begynder at genere Marie.",
          "Da Laura vender sig, hænger hendes halskæde fast. Låsen springer op, og den lille isbjørn falder på gulvet uden at hun opdager det.",
          "David ser sig omkring, samler halskæden op og lægger den i lommen.",
        ],
        "dc-david-hall-necklace-sequence",
      ),
      effects: [
        { type: "LEARN", id: "laura_dropped_necklace" },
        { type: "LEARN", id: "david_picked_up_necklace" },
      ],
    },
  ),
  E2: defineTransitionEvent(
    "E2",
    "David og Laura holder op med at tale. David går ind i læsesalen.",
  ),
};

const BARBARA_TRANSITION_OVERRIDES: Partial<
  Record<SceneId, LocationTransitionEvent>
> = {
  A1: defineTransitionEvent(
    "A1",
    "Morgenmødet bryder op, og Laura går ud for at se, hvad der sker med Marie.",
    {
      specialCue: textSequenceCue(
        [
          "Under morgenmødet fumler Laura med låsen på sin isbjørnehalskæde.",
          "“Den går op hele tiden,” mumler hun, tager kæden af og lægger den i den yderste lomme på sin taske.",
          "Da mødet bryder op, går Laura ud for at se, hvad der sker med Marie. Tasken bliver stående et øjeblik.",
          "Barbara er den sidste, der forlader rummet.",
        ],
        "dc-barbara-morning-necklace-sequence",
      ),
      effects: [
        { type: "LEARN", id: "laura_put_necklace_in_bag" },
        { type: "LEARN", id: "barbara_had_access_to_laura_bag" },
      ],
    },
  ),
  B2: defineTransitionEvent(
    "B2",
    "Ryan og Barbara går ud. Et par minutter senere høres et skrig fra kantinen.",
    {
      effects: [{ type: "LEARN", id: "barbara_left_with_ryan" }],
    },
  ),
  B4: defineTransitionEvent(
    "B4",
    "Marie forlader lokalet. Du venter lidt og ser Laura lukke et vindue på computeren, da du nærmer dig.",
    {
      specialCue: textCue(
        "Laura skjuler tydeligvis noget på computeren. Det er værd at undersøge, men hendes privatliv er ikke i sig selv et bevis på mord.",
      ),
      effects: [{ type: "LEARN", id: "laura_hid_computer_activity" }],
    },
  ),
  C2: defineTransitionEvent(
    "C2",
    "Du holder øje med området ved bogreolen. Kort efter høres et skrig fra kantinen.",
  ),
  E2: defineTransitionEvent(
    "E2",
    "David og Laura holder op med at tale. David går ind i læsesalen.",
  ),
};

const MARIE_TRANSITION_OVERRIDES: Partial<
  Record<SceneId, LocationTransitionEvent>
> = {
  B4: defineTransitionEvent(
    "B4",
    "Marie forlader lokalet. Du venter lidt, før den nye morgen begynder.",
  ),
  C1: defineTransitionEvent(
    "C1",
    "Marie kommer ind for at være alene. Da hun støtter sig til bogreolen, giver den efter med en tung, skrabende lyd.",
    {
      specialCue: textSequenceCue(
        [
          "Marie kommer ind i læsesalen, tydeligt rystet efter mødet med Ryan.",
          "Hun læner sig hårdt mod bogreolen. En skjult mekanisme klikker, og en smal dør glider nogle centimeter til side.",
          "Marie stirrer ind i mørket, lukker døren igen og går. Hun ved nu, at passagen findes.",
        ],
        "dc-marie-passage-discovery-sequence",
      ),
      effects: [
        { type: "LEARN", id: "marie_discovered_passage" },
        { type: "LEARN", id: "secret_passage_exists" },
      ],
    },
  ),
  D2: defineTransitionEvent(
    "D2",
    "Marie lægger sin mappe fra sig og forlader grupperummet kort før skriget.",
    {
      specialCue: textCue(
        "Marie er væk i det afgørende tidsrum. Da hun vender tilbage, er hun rystet og har lyst støv på ærmet.",
        "dc-marie-leaves-group-sequence",
      ),
      effects: [
        { type: "LEARN", id: "marie_left_group_before_scream" },
      ],
    },
  ),
  E1: defineTransitionEvent(
    "E1",
    "Ryan standser Marie i gangen og taler højt nok til, at de nærmeste kan høre ham.",
    {
      specialCue: textSequenceCue(
        [
          "Ryan vifter med en gennemrettet projektside foran Marie.",
          "Ryan: Det her kan ikke bruges. Jeg skriver afsnittet om og afleverer det som mit.",
          "Marie: Det er allerede mit afsnit. Det er mig, der har lavet analysen.",
          "Ryan: Ikke når dit navn er væk. Ingen tror alligevel, at du kunne have skrevet det.",
          "Han tager siden med sig og efterlader Marie ydmyget i gangen.",
        ],
        "dc-marie-morning-humiliation-sequence",
      ),
      effects: [
        { type: "LEARN", id: "ryan_bullied_marie" },
        { type: "LEARN", id: "ryan_claimed_marie_work" },
        {
          type: "LEARN",
          id: "ryan_threatened_remove_marie_credit",
        },
      ],
    },
  ),
};

export function getLocationTransitionEvent(
  id: TransitionEventId,
  caseId: CaseId = "laura",
): LocationTransitionEvent {
  if (caseId === "david") {
    return DAVID_TRANSITION_OVERRIDES[id] ?? LOCATION_TRANSITION_EVENTS[id];
  }

  if (caseId === "barbara") {
    return BARBARA_TRANSITION_OVERRIDES[id] ?? LOCATION_TRANSITION_EVENTS[id];
  }

  if (caseId === "marie") {
    return MARIE_TRANSITION_OVERRIDES[id] ?? LOCATION_TRANSITION_EVENTS[id];
  }

  return LOCATION_TRANSITION_EVENTS[id];
}
