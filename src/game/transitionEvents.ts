import type {
  GameEffect,
  SceneId,
  TransitionEventId,
} from "../app/types";
import {
  textCue,
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
      specialCue: textCue(
        "Lige før skriget hører du en tung, skrabende lyd fra området bag bogreolen. Du kan ikke se, hvad der bevæger sig.",
      ),
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

export function getLocationTransitionEvent(
  id: TransitionEventId,
): LocationTransitionEvent {
  return LOCATION_TRANSITION_EVENTS[id];
}
