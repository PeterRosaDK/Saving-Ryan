import type {
  CharacterId,
  DialogueChoiceId,
  DialogueTopicId,
  GameEffect,
  GameState,
  KnowledgeId,
} from "../app/types";
import type { VideoClipId } from "../media/videoManifest";
import {
  stillsCue,
  textCue,
  textSequenceCue,
  videoCue,
  type NarrativeCue,
} from "../media/narrativeCue";
import {
  getMissingDavidConclusionLabels,
  hasAllDavidConclusions,
} from "./davidCase";
import {
  getMissingBarbaraConclusionLabels,
  hasAllBarbaraConclusions,
} from "./barbaraCase";
import {
  getMissingMarieConclusionLabels,
  hasAllMarieConclusions,
} from "./marieCase";

export const CHARACTERS = [
  "Barbara",
  "David",
  "Laura",
  "Marie",
  "Ryan",
] as const satisfies readonly CharacterId[];

const SUBJECT_TOPICS = {
  about_laura: "Laura",
  about_marie: "Marie",
  about_david: "David",
  about_ryan: "Ryan",
  about_barbara: "Barbara",
} as const satisfies Partial<Record<DialogueTopicId, CharacterId>>;

export interface DialogueChoice {
  id: DialogueChoiceId;
  person: CharacterId;
  topic: DialogueTopicId;
  label: string;
  requires: readonly KnowledgeId[];
  questionCue: NarrativeCue;
  answerCue: NarrativeCue | null;
  effects: readonly GameEffect[];
  repeatable: boolean;
  effectsOnSkip: boolean;
  skipSummary?: string;
  accusationOutcome?: "wrong" | "premature" | "conclusive";
  isNewTopic?: boolean;
  responseKey: string;
}

const TOPIC_LABELS: Readonly<Record<DialogueTopicId, string>> = {
  about_laura: "Hvad mener du om Laura?",
  about_marie: "Hvad mener du om Marie?",
  about_david: "Hvad mener du om David?",
  about_ryan: "Hvad mener du om Ryan?",
  about_barbara: "Hvad mener du om Barbara?",
  alibi: "Hvor var du, da Ryan blev myrdet?",
  theory: "Hvem tror du myrdede Ryan?",
  accuse: "Jeg tror, det var dig.",
  barbara_and_computers: "Hvad ved du om Barbara og computere?",
  necklace: "Kender du denne halskæde?",
  marie_and_ryan: "Hvad skete der mellem Marie og Ryan?",
  barbara_and_ryan: "Hvad foregår der mellem Barbara og Ryan?",
  ask_barbara_for_help: "Vil du hjælpe mig med Lauras computer?",
  warn_ryan: "Ryan, du er i fare.",
  about_sarah: "Hvad skete der mellem Sarah, Laura og dig?",
  david_breakup: "Hvordan tog David bruddet med Sarah?",
  david_saw_ryan: "Så du Ryan gå ind foran dig?",
  laura_necklace_bag: "Hvor er din isbjørnehalskæde?",
  laura_bag_access: "Hvem kunne komme til tasken?",
  barbara_time_with_ryan: "Hvor længe var du sammen med Ryan?",
  marie_work: "Hvor meget af rapporten er dit arbejde?",
  marie_threat: "Hvad truede Ryan dig med?",
  marie_location: "Så du Marie vende tilbage?",
  jorgen_sighting: "Så du nogen ved læsesalen?",
};

function choiceId(
  person: CharacterId,
  topic: DialogueTopicId,
): DialogueChoiceId {
  return `${person}:${topic}`;
}

function defineChoice(
  person: CharacterId,
  topic: DialogueTopicId,
  questionClip: VideoClipId,
  answerClip: VideoClipId | null,
  options: {
    requires?: readonly KnowledgeId[];
    effects?: readonly GameEffect[];
    effectsOnSkip?: boolean;
    label?: string;
    skipSummary?: string;
    accusationOutcome?: DialogueChoice["accusationOutcome"];
    isNewTopic?: boolean;
    responseKey?: string;
  } = {},
): DialogueChoice {
  return defineCueChoice(
    person,
    topic,
    videoCue(questionClip),
    answerClip ? videoCue(answerClip) : null,
    options,
  );
}

function defineCueChoice(
  person: CharacterId,
  topic: DialogueTopicId,
  questionCue: NarrativeCue,
  answerCue: NarrativeCue | null,
  options: {
    requires?: readonly KnowledgeId[];
    effects?: readonly GameEffect[];
    effectsOnSkip?: boolean;
    label?: string;
    skipSummary?: string;
    accusationOutcome?: DialogueChoice["accusationOutcome"];
    isNewTopic?: boolean;
    responseKey?: string;
  } = {},
): DialogueChoice {
  return {
    id: choiceId(person, topic),
    person,
    topic,
    label: options.label ?? TOPIC_LABELS[topic],
    requires: options.requires ?? [],
    questionCue,
    answerCue,
    effects: options.effects ?? [],
    repeatable: true,
    effectsOnSkip: options.effectsOnSkip ?? false,
    skipSummary: options.skipSummary,
    accusationOutcome: options.accusationOutcome,
    isNewTopic: options.isNewTopic,
    responseKey: options.responseKey ?? choiceId(person, topic),
  };
}

function getSubjectChoice(
  state: GameState,
  person: CharacterId,
  topic: keyof typeof SUBJECT_TOPICS,
): DialogueChoice {
  const subject = SUBJECT_TOPICS[topic];
  const isSelf = person === subject;
  const afterMurder = state.timeSlot >= 3;
  const usesMurderClips = subject === "Ryan" && !isSelf && afterMurder;
  const questionClip = (
    isSelf
      ? "Peter-omPeter"
      : usesMurderClips
        ? "Peter-omRyanDie"
        : `Peter-om${subject}`
  ) as VideoClipId;
  const answerClip = (
    usesMurderClips
      ? `${person}-omRyanDie`
      : `${person}-om${subject}`
  ) as VideoClipId;

  return defineChoice(person, topic, questionClip, answerClip);
}

function getAccusationClip(
  state: GameState,
  person: Exclude<CharacterId, "Ryan">,
): VideoClipId {
  if (person === "Laura") {
    if (isConclusiveAccusation(state, person)) {
      return "Peter-BeskyldLaura3";
    }

    if (
      state.knowledge.ryan_left_laura ||
      state.knowledge.necklace_connects_laura_to_scene
    ) {
      return "Peter-BeskyldLaura2";
    }
  }

  return `Peter-Beskyld${person}1` as VideoClipId;
}

export function isConclusiveAccusation(
  state: GameState,
  person: CharacterId,
): boolean {
  if (state.selectedCaseId === "david") {
    return person === "David" && hasAllDavidConclusions(state);
  }
  if (state.selectedCaseId === "barbara") {
    return person === "Barbara" && hasAllBarbaraConclusions(state);
  }
  if (state.selectedCaseId === "marie") {
    return person === "Marie" && hasAllMarieConclusions(state);
  }
  if (state.selectedCaseId === "jorgen") {
    return false;
  }
  return (
    person === "Laura" &&
    state.knowledge.ryan_left_laura &&
    state.knowledge.necklace_connects_laura_to_scene
  );
}

function getLegacySpecialChoices(
  state: GameState,
  person: CharacterId,
): DialogueChoice[] {
  const choices: DialogueChoice[] = [];
  const afterMurder = state.timeSlot >= 3;

  if (afterMurder && person !== "Ryan") {
    const accusationSolvesCase = isConclusiveAccusation(state, person);

    choices.push(
      defineChoice(
        person,
        "alibi",
        "Peter-omAlibi",
        `${person}-omAlibi` as VideoClipId,
      ),
      defineChoice(
        person,
        "theory",
        "Peter-omFormodning",
        `${person}-omFormodning` as VideoClipId,
      ),
      defineCueChoice(
        person,
        "accuse",
        videoCue(getAccusationClip(state, person)),
        accusationSolvesCase
          ? textCue(
              "Laura bryder sammen. Ryan forlod hende, og da han fandt den skjulte passage bag bogreolen i læsesalen, fulgte hun efter ham op på afsatsen. Der skubbede hun ham. Den hemmelige dør er vejen til første sal.",
            )
          : null,
        accusationSolvesCase
          ? {
              effects: [
                { type: "LEARN", id: "laura_confessed" },
                { type: "LEARN", id: "secret_passage_exists" },
              ],
            }
          : {},
      ),
    );
  }

  if (person !== "Barbara") {
    choices.push(
      defineChoice(
        person,
        "barbara_and_computers",
        "Peter-omBarbaraOgComputere",
        person === "David"
          ? "David-omBarbaraOgComputere"
          : (`${person}-VedIkke` as VideoClipId),
        person === "David"
          ? {
              requires: ["barbara_is_computer_expert"],
              effects: [
                {
                  type: "LEARN",
                  id: "barbara_hacker_alias_intruder",
                },
              ],
              effectsOnSkip: true,
            }
          : { requires: ["barbara_is_computer_expert"] },
      ),
    );
  }

  choices.push(
    defineChoice(
      person,
      "necklace",
      "Peter-omHalskaede",
      `${person}-VedIkke` as VideoClipId,
      { requires: ["killer_dropped_necklace"] },
    ),
  );

  if (person === "Marie") {
    const hasEarnedTrust = state.loopState.dialogue.askedChoices.includes(
      "Marie:marie_and_ryan",
    );
    const canConfide =
      hasEarnedTrust &&
      state.knowledge.ryan_and_laura_were_together;
    choices.push(
      defineChoice(
        person,
        "marie_and_ryan",
        canConfide ? "Marie-Fortrolighed2" : "Marie-Fortrolighed",
        null,
        canConfide
          ? {
              requires: [
                "ryan_bullied_marie",
                "ryan_and_laura_were_together",
              ],
              effects: [
                { type: "LEARN", id: "ryan_left_laura" },
              ],
              effectsOnSkip: true,
              responseKey: "Marie:marie_and_ryan:confidence",
            }
          : {
              requires: ["ryan_bullied_marie"],
              responseKey: "Marie:marie_and_ryan:initial",
            },
      ),
    );
  } else {
    choices.push(
      defineChoice(
        person,
        "marie_and_ryan",
        "Peter-omRyanOgMarie",
        `${person}-VedIkke` as VideoClipId,
        { requires: ["ryan_bullied_marie"] },
      ),
    );
  }

  choices.push(
    defineChoice(
      person,
      "barbara_and_ryan",
      "Peter-omBarbaraOgRyan",
      person === "Laura"
        ? "Laura-omBarbaraOgRyan"
        : (`${person}-VedIkke` as VideoClipId),
      person === "Laura"
        ? {
            requires: ["barbara_and_ryan_argued"],
            effects: [
              {
                type: "LEARN",
                id: "laura_acknowledged_barbara_and_ryan",
              },
            ],
            effectsOnSkip: true,
          }
        : { requires: ["barbara_and_ryan_argued"] },
    ),
  );

  if (
    person === "Barbara" &&
    state.loopState.dialogue.barbaraHelp !== "completed"
  ) {
    const isReady = state.loopState.dialogue.barbaraHelp === "ready";
    choices.push(
      defineChoice(
        person,
        "ask_barbara_for_help",
        isReady ? "Barbara-omHilfe2" : "Barbara-omHilfe1",
        isReady ? "BarbaraHacker" : null,
        isReady
          ? {
              requires: ["laura_hid_computer_activity"],
              effects: [
                {
                  type: "LEARN",
                  id: "laura_was_in_institution",
                },
                {
                  type: "LEARN",
                  id: "laura_owns_polar_bear_necklace",
                },
              ],
              effectsOnSkip: false,
              responseKey: "Barbara:ask_barbara_for_help:ready",
            }
          : {
              requires: ["laura_hid_computer_activity"],
              effectsOnSkip: true,
              responseKey: "Barbara:ask_barbara_for_help:request",
            },
      ),
    );
  }

  if (person === "Ryan" && state.timeSlot <= 2) {
    if (state.knowledge.ryan_has_girlfriend_sarah) {
      choices.push(
        defineCueChoice(
          person,
          "about_sarah",
          stillsCue([
            {
              image: "portrait-Ryan",
              alt: "Ryan lytter til Jørgens spørgsmål.",
              text:
                "Jørgen spørger: Jeg fandt et brev fra Sarah. Hvad skete der mellem dig og Laura?",
            },
          ]),
          videoCue("Ryan-omSaraOgLaura"),
          {
            requires: ["ryan_has_girlfriend_sarah"],
            effects: [
              {
                type: "LEARN",
                id: "ryan_and_laura_were_together",
              },
            ],
            effectsOnSkip: true,
          },
        ),
      );
    }

    if (state.knowledge.ryan_was_murdered) {
      const wasAsked = state.loopState.dialogue.askedChoices.includes(
        "Ryan:warn_ryan",
      );
      choices.push(
        defineChoice(
          person,
          "warn_ryan",
          wasAsked ? "Ryan-Advarsel2" : "Ryan-Advarsel1",
          null,
          {
            requires: ["ryan_was_murdered"],
            effects: [
              {
                type: "LEARN",
                id: "ryan_dismissed_warning",
              },
            ],
            responseKey: wasAsked
              ? "Ryan:warn_ryan:repeat"
              : "Ryan:warn_ryan:initial",
          },
        ),
      );
    }
  }

  return choices;
}

function getDavidAccusationAnswer(
  state: GameState,
  person: Exclude<CharacterId, "Ryan">,
): NarrativeCue {
  if (person === "Laura") {
    return textSequenceCue(
      [
        "Jørgen: Halskæden er din, og Ryan havde den i hånden. Det gør dig mistænkelig.",
        "Laura: Den er min, ja, men jeg havde den ikke, da Ryan faldt. Låsen var løs, og jeg må have tabt den i gangen.",
        "Jørgen tænker: Mistanken var forståelig, men ejerskab er ikke det samme som besiddelse på mordtidspunktet. Jeg må fastslå, hvem der havde halskæden umiddelbart før mordet.",
      ],
      "dc-david-laura-wrong-accusation",
    );
  }
  if (person !== "David") {
    return textCue(
      `${person} afviser anklagen. Jørgen har ikke beviser, der forbinder ${person} med mordet.`,
    );
  }
  if (!hasAllDavidConclusions(state)) {
    return textCue(
      `David afviser anklagen. Jørgen mangler stadig at dokumentere ${getMissingDavidConclusionLabels(
        state,
      ).join(" og ")}.`,
      "dc-david-accusation-sequence",
    );
  }
  return textSequenceCue(
    [
      "Jørgen: Sarah forlod dig for Ryan. Du samlede Lauras halskæde op, og kort før mordet fulgte du Ryan ind i læsesalen. Halskæden lå i hans hånd, da han døde.",
      "David: Det beviser ikke, at jeg slog ham ihjel.",
      "Jørgen: Det beviser, at du var tæt nok på ham til, at han kunne rive kæden fra dig. Hvordan kom du op på afsatsen?",
      "David: Ryan fandt en skjult dør bag bogreolen. Jeg så ham gå ind og fulgte efter.",
      "David: Jeg ville tale med ham om Sarah. Han grinede bare. Han sagde, at hun endelig havde valgt rigtigt.",
      "David: Jeg skubbede ham. Jeg havde ikke planlagt det. Da han faldt, greb han fat i kæden i min lomme.",
      "David: Jeg gik tilbage gennem passagen og lod, som om jeg kun havde hørt skriget.",
    ],
    "dc-david-accusation-sequence",
  );
}

function getDavidSpecialChoices(
  state: GameState,
  person: CharacterId,
): DialogueChoice[] {
  const choices: DialogueChoice[] = [];
  const afterMurder = state.timeSlot >= 3;

  if (afterMurder && person !== "Ryan") {
    const outcome =
      person !== "David"
        ? "wrong"
        : hasAllDavidConclusions(state)
          ? "conclusive"
          : "premature";
    choices.push(
      defineCueChoice(
        person,
        "alibi",
        textCue(
          person === "David"
            ? "Jørgen: Hvor var du, da Ryan faldt?"
            : `Jørgen spørger ${person} om et alibi.`,
          person === "David" ? "dc-david-alibi-voice" : undefined,
        ),
        textCue(
          person === "David"
            ? "David: I læsesalen. Jeg gik derind for at være alene. Jeg hørte skriget ligesom alle andre."
            : `${person} forklarer sin færden uden at blive forbundet med afsatsen.`,
          person === "David" ? "dc-david-alibi-voice" : undefined,
        ),
        {
          effectsOnSkip: true,
          skipSummary:
            person === "David"
              ? "David siger, at han var alene i læsesalen og kun hørte skriget."
              : `${person}s alibi gav ikke et nyt kernespor.`,
        },
      ),
      defineCueChoice(
        person,
        "theory",
        textCue(
          "Jørgen: Hvem tror du myrdede Ryan?",
          "dc-david-suspicions-dialogue",
        ),
        textCue(
          `${person}: Jeg ved det ikke. Alle virker påvirkede, men jeg så ikke selve faldet.`,
          "dc-david-suspicions-dialogue",
        ),
        {
          effectsOnSkip: true,
          skipSummary: `${person} har ingen sikker mistanke om morderen.`,
        },
      ),
      defineCueChoice(
        person,
        "accuse",
        textCue(
          person === "David"
            ? "Jørgen konfronterer David med sagen."
            : `Jørgen anklager ${person} for mordet.`,
          person === "David"
            ? "dc-david-accusation-sequence"
            : undefined,
        ),
        getDavidAccusationAnswer(
          state,
          person as Exclude<CharacterId, "Ryan">,
        ),
        {
          effects:
            outcome === "conclusive"
              ? [
                  { type: "LEARN", id: "david_confessed" },
                  { type: "LEARN", id: "secret_passage_exists" },
                  { type: "LEARN", id: "david_murder_method_known" },
                  { type: "LEARN", id: "david_prevention_plan" },
                ]
              : [],
          effectsOnSkip: true,
          accusationOutcome: outcome,
          skipSummary:
            outcome === "conclusive"
              ? "David tilstår og afslører passagen. Mordet skal stadig forhindres."
              : "Anklagen blev afvist; efterforskningen kan fortsætte.",
        },
      ),
    );
  }

  if (
    person === "Ryan" &&
    state.timeSlot <= 2 &&
    state.knowledge.ryan_has_girlfriend_sarah
  ) {
    choices.push(
      defineCueChoice(
        person,
        "about_sarah",
        textCue("Jørgen: Hvem er Sarah?", "dc-david-ryan-sarah-voice"),
        textCue(
          "Ryan: Min kæreste. Hun var sammen med David før, men det var vist ikke særlig spændende. Hun valgte heldigvis rigtigt til sidst.",
          "dc-david-ryan-sarah-voice",
        ),
        {
          label: "Hvem er Sarah?",
          effects: [
            { type: "LEARN", id: "sarah_left_david_for_ryan" },
          ],
          effectsOnSkip: true,
          skipSummary:
            "Sarah forlod David for Ryan; Ryan omtaler bruddet hånligt.",
          isNewTopic: true,
        },
      ),
    );
  }

  if (person === "Marie" && state.knowledge.ryan_has_girlfriend_sarah) {
    choices.push(
      defineCueChoice(
        person,
        "david_breakup",
        textCue(
          "Jørgen: Hvordan tog David bruddet med Sarah?",
          "dc-david-marie-breakup-voice",
        ),
        textCue(
          "Marie: Dårligt. Jeg fandt ham helt knust. Han prøver at lade, som om det er ligegyldigt, men Ryan gør det bestemt ikke lettere.",
          "dc-david-marie-breakup-voice",
        ),
        {
          effects: [
            { type: "LEARN", id: "marie_says_david_was_hurt" },
          ],
          effectsOnSkip: true,
          skipSummary: "Marie bekræfter, at David var knust efter bruddet.",
          isNewTopic: true,
        },
      ),
    );
  }

  if (
    person === "Laura" &&
    state.knowledge.necklace_found_in_ryans_hand
  ) {
    choices.push(
      defineCueChoice(
        person,
        "necklace",
        textCue(
          "Jørgen: Er isbjørnehalskæden din?",
          "dc-david-laura-necklace-voice",
        ),
        textCue(
          "Laura: Ja. Låsen har været løs hele dagen. Jeg må have tabt den i gangen, mens jeg talte med David.",
          "dc-david-laura-necklace-voice",
        ),
        {
          effects: [
            { type: "LEARN", id: "laura_owns_polar_bear_necklace" },
          ],
          effectsOnSkip: true,
          skipSummary:
            "Laura ejer halskæden, men den løse lås må være sprunget op i gangen.",
          isNewTopic: true,
        },
      ),
    );
  }

  if (
    person === "David" &&
    afterMurder &&
    state.knowledge.david_followed_ryan
  ) {
    choices.push(
      defineCueChoice(
        person,
        "david_saw_ryan",
        textCue(
          "Jørgen: Så du Ryan gå ind foran dig?",
          "dc-david-followup-lie-voice",
        ),
        textCue(
          "David: Nej. Jeg lagde ikke mærke til ham.",
          "dc-david-followup-lie-voice",
        ),
        {
          effects: [{ type: "LEARN", id: "david_lied_about_ryan" }],
          effectsOnSkip: true,
          skipSummary:
            "David benægter at have set Ryan, selv om Jørgen så ham følge efter.",
          isNewTopic: true,
        },
      ),
    );
  }

  return choices;
}

function getBarbaraAccusationAnswer(
  state: GameState,
  person: Exclude<CharacterId, "Ryan">,
): NarrativeCue {
  if (person !== "Barbara") {
    return textCue(
      `${person} afviser anklagen. Jørgen har ikke beviser, der forbinder ${person} med mordet.`,
    );
  }

  if (!hasAllBarbaraConclusions(state)) {
    return textCue(
      `Barbara afviser anklagen. Jørgen mangler stadig at dokumentere ${getMissingBarbaraConclusionLabels(
        state,
      ).join(" og ")}.`,
      "dc-barbara-accusation-sequence",
    );
  }

  return textSequenceCue(
    [
      "Jørgen: Ryan afpressede dig med de ændrede karakterer. Du kendte passagen, før han døde, og du forlod computerrummet sammen med ham.",
      "Barbara: Det beviser ikke, at jeg skubbede ham.",
      "Jørgen: Nej. Men billedet gør din forklaring umulig. Du viste mig Lauras halskæde, som om du netop havde fundet siden. Filen lå på din computer før mordet.",
      "Laura havde allerede lagt halskæden i sin taske, og den forsvandt, mens du havde adgang til hendes ting. Senere lå den i Ryans hånd.",
      "Barbara: Du kan ikke bevise, hvordan den kom der.",
      "Jørgen: Du gav den til ham. Du ville have, at alle skulle se Laura, når de så halskæden.",
      "Barbara: Ryan ville aldrig stoppe. Han havde kopier af mine karakterer. Han kunne ødelægge alt.",
      "Jeg fandt de gamle tegninger i systemet. Passagen gik fra læsesalen til afsatsen.",
      "Laura havde efterladt tasken. Jeg tog halskæden og gemte billedet af hende, så der ville være en forklaring, når den blev fundet.",
      "Jeg sagde til Ryan, at jeg havde fundet noget ved bogreolen. Ude på afsatsen gav jeg ham kæden. Han råbte ned til dig.",
      "Da han vendte ryggen til, skubbede jeg ham.",
      "Bagefter lod jeg, som om jeg hjalp dig. Jeg viste dig præcis det spor, jeg selv havde valgt.",
    ],
    "dc-barbara-confession-voice",
  );
}

function getBarbaraSpecialChoices(
  state: GameState,
  person: CharacterId,
): DialogueChoice[] {
  const choices: DialogueChoice[] = [];
  const afterMurder = state.timeSlot >= 3;

  if (afterMurder && person !== "Ryan") {
    const outcome =
      person !== "Barbara"
        ? "wrong"
        : hasAllBarbaraConclusions(state)
          ? "conclusive"
          : "premature";
    choices.push(
      defineCueChoice(
        person,
        "alibi",
        textCue(
          person === "Barbara"
            ? "Jørgen: Hvor var du, da Ryan faldt?"
            : `Jørgen spørger ${person} om et alibi.`,
          person === "Barbara" ? "dc-barbara-alibi-dialogue" : undefined,
        ),
        textCue(
          person === "Barbara"
            ? "Barbara: Jeg gik ud fra computerrummet, men Ryan fortsatte alene. Jeg vendte om. Da jeg hørte skriget, var jeg på vej tilbage."
            : `${person} forklarer sin færden uden at blive forbundet med afsatsen.`,
          person === "Barbara" ? "dc-barbara-alibi-dialogue" : undefined,
        ),
        {
          effects:
            person === "Barbara"
              ? [{ type: "LEARN", id: "barbara_alibi_gap" }]
              : [],
          effectsOnSkip: true,
          skipSummary:
            person === "Barbara"
              ? "Barbara indrømmer, at hun forlod rummet med Ryan, men forklaringen efterlader et hul før mordet."
              : `${person}s alibi gav ikke et nyt kernespor.`,
        },
      ),
      defineCueChoice(
        person,
        "theory",
        textCue(
          "Jørgen: Hvem tror du myrdede Ryan?",
          "dc-barbara-suspicions-dialogue",
        ),
        textCue(
          `${person}: Jeg ved det ikke. Jeg så ikke selve faldet.`,
          "dc-barbara-suspicions-dialogue",
        ),
        {
          effectsOnSkip: true,
          skipSummary: `${person} har ingen sikker mistanke om morderen.`,
        },
      ),
      defineCueChoice(
        person,
        "accuse",
        textCue(
          person === "Barbara"
            ? "Jørgen konfronterer Barbara med sagen."
            : `Jørgen anklager ${person} for mordet.`,
          person === "Barbara"
            ? "dc-barbara-accusation-sequence"
            : undefined,
        ),
        getBarbaraAccusationAnswer(
          state,
          person as Exclude<CharacterId, "Ryan">,
        ),
        {
          effects:
            outcome === "conclusive"
              ? [
                  { type: "LEARN", id: "barbara_confessed" },
                  { type: "LEARN", id: "secret_passage_exists" },
                  {
                    type: "LEARN",
                    id: "barbara_murder_method_known",
                  },
                  { type: "LEARN", id: "barbara_prevention_plan" },
                ]
              : [],
          effectsOnSkip: true,
          accusationOutcome: outcome,
          skipSummary:
            outcome === "conclusive"
              ? "Barbara tilstår mordet og den falske efterforskning. Mordet skal stadig forhindres."
              : "Anklagen blev afvist; efterforskningen kan fortsætte.",
        },
      ),
    );
  }

  if (
    person === "David" &&
    state.knowledge.barbara_is_computer_expert
  ) {
    choices.push(
      defineCueChoice(
        person,
        "barbara_and_computers",
        textCue(
          "Jørgen: Hvad ved du om Barbaras computerfærdigheder?",
          "dc-barbara-intruder-dialogue",
        ),
        textCue(
          "David: Hun kalder sig Intruder. Det er både hendes hackernavn og, så vidt jeg ved, den kode hun bruger, når hun vil være smart.",
          "dc-barbara-intruder-dialogue",
        ),
        {
          effects: [
            { type: "LEARN", id: "barbara_hacker_alias_intruder" },
          ],
          effectsOnSkip: true,
          skipSummary:
            "David fortæller, at Barbaras hackernavn og smarte adgangskode er Intruder.",
          isNewTopic: true,
        },
      ),
    );
  }

  if (
    person === "Laura" &&
    state.knowledge.laura_put_necklace_in_bag
  ) {
    choices.push(
      defineCueChoice(
        person,
        "laura_necklace_bag",
        textCue(
          "Jørgen: Hvor er din isbjørnehalskæde?",
          "dc-barbara-laura-missing-necklace",
        ),
        textCue(
          "Laura: Jeg tog den af i morges, fordi låsen var løs. Jeg lagde den i tasken. Den er væk nu.",
          "dc-barbara-laura-missing-necklace",
        ),
        {
          effects: [
            { type: "LEARN", id: "laura_owns_polar_bear_necklace" },
            { type: "LEARN", id: "necklace_missing_from_laura_bag" },
          ],
          effectsOnSkip: true,
          skipSummary:
            "Laura lagde halskæden i tasken om morgenen; nu er den væk.",
          isNewTopic: true,
        },
      ),
      defineCueChoice(
        person,
        "laura_bag_access",
        textCue(
          "Jørgen: Hvem kunne komme til tasken?",
          "dc-barbara-laura-missing-necklace",
        ),
        textCue(
          "Laura: Den stod alene et øjeblik efter mødet. Barbara var vist den sidste derinde, men det betyder jo ikke, at hun tog den.",
          "dc-barbara-laura-missing-necklace",
        ),
        {
          requires: ["necklace_missing_from_laura_bag"],
          effects: [
            { type: "LEARN", id: "barbara_had_access_to_laura_bag" },
          ],
          effectsOnSkip: true,
          skipSummary:
            "Barbara var den sidste ved den efterladte taske, men Laura så ikke noget tyveri.",
          isNewTopic: true,
        },
      ),
    );
  }

  if (
    person === "Marie" &&
    state.knowledge.barbara_had_access_to_laura_bag
  ) {
    choices.push(
      defineCueChoice(
        person,
        "laura_bag_access",
        textCue(
          "Jørgen: Så du nogen blive tilbage ved Lauras taske?",
          "dc-barbara-marie-bag-dialogue",
        ),
        textCue(
          "Marie: Barbara var den sidste derinde. Jeg så hende stå alene ved tasken, men ikke hvad hun gjorde.",
          "dc-barbara-marie-bag-dialogue",
        ),
        {
          effects: [{ type: "LEARN", id: "marie_saw_barbara_by_bag" }],
          effectsOnSkip: true,
          skipSummary:
            "Marie så Barbara alene ved Lauras taske, men så ikke et tyveri.",
          isNewTopic: true,
        },
      ),
    );
  }

  if (person === "David" && state.knowledge.barbara_left_with_ryan) {
    choices.push(
      defineCueChoice(
        person,
        "barbara_time_with_ryan",
        textCue(
          "Jørgen: Så du, hvor Barbara og Ryan gik hen?",
          "dc-barbara-david-movement-dialogue",
        ),
        textCue(
          "David: Barbara førte Ryan fra computerrummet i retning af læsesalen.",
          "dc-barbara-david-movement-dialogue",
        ),
        {
          effects: [
            { type: "LEARN", id: "david_saw_barbara_lead_ryan" },
          ],
          effectsOnSkip: true,
          skipSummary:
            "David så Barbara føre Ryan mod læsesalen.",
          isNewTopic: true,
        },
      ),
    );
  }

  if (
    person === "Barbara" &&
    afterMurder &&
    state.knowledge.barbara_left_with_ryan
  ) {
    choices.push(
      defineCueChoice(
        person,
        "barbara_time_with_ryan",
        textCue(
          "Jørgen: Hvor længe var du sammen med Ryan?",
          "dc-barbara-alibi-dialogue",
        ),
        textCue(
          "Barbara: Ikke længe. Vi skiltes i gangen.",
          "dc-barbara-alibi-dialogue",
        ),
        {
          effects: [{ type: "LEARN", id: "barbara_alibi_gap" }],
          effectsOnSkip: true,
          skipSummary:
            "Barbara siger, at de skiltes i gangen; tidsrummet før mordet er stadig uforklaret.",
          isNewTopic: true,
        },
      ),
    );
  }

  if (
    person === "Barbara" &&
    state.knowledge.laura_hid_computer_activity &&
    state.knowledge.barbara_hacker_alias_intruder &&
    state.knowledge.barbara_forged_grades &&
    !state.knowledge.barbara_presented_image_as_new
  ) {
    choices.push(
      defineCueChoice(
        person,
        "ask_barbara_for_help",
        textCue(
          "Jørgen: Vil du hjælpe mig med at undersøge Laura?",
          "dc-barbara-helper-sequence",
        ),
        textSequenceCue(
          [
            "Barbara: Fint. Jeg undersøger, hvor Laura har været. Men så holder du mund om mine karakterer.",
            "Barbara arbejder hurtigt. Efter få øjeblikke åbner hun en side med et gammelt billede af Laura.",
            "Barbara: Se. Hun har været indlagt. Og dér har hun halskæden på.",
            "Jørgen tænker: Barbara præsenterer billedet, som om hun netop har fundet det.",
            "Lauras private sygehistorie er ikke et bevis på mord.",
          ],
          "dc-barbara-helper-sequence",
        ),
        {
          effects: [
            { type: "LEARN", id: "barbara_presented_image_as_new" },
            {
              type: "LEARN",
              id: "laura_private_history_not_evidence",
            },
            { type: "LEARN", id: "laura_was_in_institution" },
            { type: "LEARN", id: "laura_owns_polar_bear_necklace" },
          ],
          effectsOnSkip: true,
          skipSummary:
            "Barbara præsenterer Lauras private historik og halskædebilledet som nye fund; privathistorikken er ikke et skyldbevis.",
          isNewTopic: true,
        },
      ),
    );
  }

  return choices;
}

function getMarieAccusationAnswer(
  state: GameState,
  person: Exclude<CharacterId, "Ryan">,
): NarrativeCue {
  if (person !== "Marie") {
    return textCue(
      `${person} afviser anklagen. Flere i gruppen havde grunde til at hade Ryan, men et motiv er ikke et bevis.`,
    );
  }

  if (!hasAllMarieConclusions(state)) {
    const missing = getMissingMarieConclusionLabels(state);
    if (!state.knowledge.marie_motive_conclusion) {
      return textCue(
        "Marie: Du har set Ryan være modbydelig. Det gør mig ikke til morder.",
        "dc-marie-accusation-sequence",
      );
    }
    if (!state.knowledge.marie_alibi_conclusion) {
      return textCue(
        "Marie: Du ved ikke engang, hvor jeg var.",
        "dc-marie-accusation-sequence",
      );
    }
    if (!state.knowledge.marie_physical_conclusion) {
      return textCue(
        "Marie: Du har intet, der placerer mig sammen med ham.",
        "dc-marie-accusation-sequence",
      );
    }
    if (!state.knowledge.marie_passage_conclusion) {
      return textCue(
        "Marie: Hvordan skulle jeg være kommet derop uden at nogen så mig?",
        "dc-marie-accusation-sequence",
      );
    }
    return textCue(
      `Marie afviser anklagen. Jørgen mangler stadig ${missing.join(" og ")}.`,
      "dc-marie-accusation-sequence",
    );
  }

  return textSequenceCue(
    [
      "Jørgen: Ryan truede med at tage dit arbejde og skade Laura. Du forlod grupperummet, du kendte passagen, og papiret i hans hånd blev revet fra den side, du stadig havde resten af.",
      "Marie: Han tog fragmentet i morges. Det beviser ikke, at jeg var på afsatsen.",
      "Jørgen: Siden blev skrevet og rettet efter morgenens konfrontation. Rivningen er frisk, og din mappe indeholder resten.",
      "Marie: Ryan havde taget æren for mit arbejde længe. Hver gang jeg protesterede, fik han mig til at tro, at ingen ville vælge min forklaring frem for hans.",
      "Denne morgen sagde han, at mit navn skulle helt væk. Og at han ville fortælle alle om Laura, hvis jeg gjorde modstand.",
      "Efter mødet gik jeg ind i læsesalen. Jeg skubbede til reolen og opdagede døren ved et tilfælde.",
      "Senere skrev jeg siden færdig. Jeg fulgte Ryan gennem passagen for at få ham til at anerkende, at arbejdet var mit.",
      "Han lo. Han rev i siden og sagde, at ingen ville tro mig. Så gentog han truslen mod Laura.",
      "Marie: Jeg gik derop for at få mit arbejde tilbage. Jeg ville have ham til at sige, at det var mit. Han lo bare. Da han sagde, at han også ville bruge Laura imod mig, skubbede jeg. Jeg nåede at se, at han stadig havde papiret i hånden.",
      "Jeg havde ikke planlagt at slå ham ihjel. Jeg tog resten af siden, gik tilbage gennem passagen og løj om, hvor længe jeg havde været væk.",
    ],
    "dc-marie-confession-voice",
  );
}

function getMarieSpecialChoices(
  state: GameState,
  person: CharacterId,
): DialogueChoice[] {
  const choices: DialogueChoice[] = [];
  const afterMurder = state.timeSlot >= 3;

  if (afterMurder && person !== "Ryan") {
    const outcome =
      person !== "Marie"
        ? "wrong"
        : hasAllMarieConclusions(state)
          ? "conclusive"
          : "premature";
    choices.push(
      defineCueChoice(
        person,
        "alibi",
        textCue(
          person === "Marie"
            ? "Jørgen: Hvor var du, da Ryan faldt?"
            : `Jørgen spørger ${person} om et alibi.`,
          person === "Marie" ? "dc-marie-alibi-dialogue" : undefined,
        ),
        textCue(
          person === "Marie"
            ? "Marie: I grupperummet. Jeg gik kun ud et øjeblik for at få luft og var tilbage, før jeg hørte skriget."
            : `${person} forklarer sin færden uden at blive forbundet med papiret eller passagen.`,
          person === "Marie" ? "dc-marie-alibi-dialogue" : undefined,
        ),
        {
          effects:
            person === "Marie"
              ? [{ type: "LEARN", id: "marie_claimed_no_absence" }]
              : [],
          effectsOnSkip: true,
          skipSummary:
            person === "Marie"
              ? "Marie påstår, at hun kun var væk et øjeblik, selv om hun forlod grupperummet i det afgørende tidsrum."
              : `${person}s alibi gav ikke et nyt kernespor.`,
        },
      ),
      defineCueChoice(
        person,
        "theory",
        textCue("Jørgen: Hvem tror du myrdede Ryan?"),
        textCue(
          `${person}: Jeg ved det ikke. Ryan havde gjort sig uvenner med næsten alle.`,
        ),
        {
          effectsOnSkip: true,
          skipSummary: `${person} har ingen sikker mistanke om morderen.`,
        },
      ),
      defineCueChoice(
        person,
        "accuse",
        textCue(
          person === "Marie"
            ? "Jørgen konfronterer Marie med sagen."
            : `Jørgen anklager ${person} for mordet.`,
          person === "Marie"
            ? "dc-marie-accusation-sequence"
            : undefined,
        ),
        getMarieAccusationAnswer(
          state,
          person as Exclude<CharacterId, "Ryan">,
        ),
        {
          effects:
            outcome === "conclusive"
              ? [
                  { type: "LEARN", id: "marie_confessed" },
                  { type: "LEARN", id: "secret_passage_exists" },
                  { type: "LEARN", id: "marie_murder_method_known" },
                  { type: "LEARN", id: "marie_prevention_plan" },
                ]
              : [],
          effectsOnSkip: true,
          accusationOutcome: outcome,
          responseKey: `Marie:accuse:${person}:${outcome}`,
          skipSummary:
            outcome === "conclusive"
              ? "Marie tilstår det impulsive skub og flugten gennem passagen. Hendes arbejde skal sikres, og mødet skal forhindres."
              : "Anklagen blev afvist; efterforskningen kan fortsætte.",
        },
      ),
    );
  }

  if (
    person === "Marie" &&
    state.knowledge.ryan_claimed_marie_work
  ) {
    choices.push(
      defineCueChoice(
        person,
        "marie_work",
        textCue(
          "Jørgen: Hvor meget af rapporten er egentlig dit arbejde?",
          "dc-marie-work-dialogue",
        ),
        textCue(
          "Marie: Analysen er min. Jeg har også gennemrettet de centrale afsnit, men Ryan afleverer siderne, som om de er hans.",
          "dc-marie-work-dialogue",
        ),
        {
          effects: [{ type: "LEARN", id: "marie_wrote_report" }],
          effectsOnSkip: true,
          skipSummary:
            "Marie har skrevet analysen og gennemrettet rapportens centrale sider.",
          isNewTopic: true,
        },
      ),
    );
  }

  if (
    person === "Marie" &&
    state.knowledge.ryan_threatened_remove_marie_credit
  ) {
    choices.push(
      defineCueChoice(
        person,
        "marie_threat",
        textCue(
          "Jørgen: Hvad truede Ryan dig med?",
          "dc-marie-threat-dialogue",
        ),
        textCue(
          "Marie: Han vil fjerne mit navn. Og hvis jeg siger imod, fortæller han gruppen om Lauras fortid og får det til at lyde, som om hun er problemet.",
          "dc-marie-threat-dialogue",
        ),
        {
          effects: [{ type: "LEARN", id: "ryan_threatened_laura" }],
          effectsOnSkip: true,
          skipSummary:
            "Ryan vil både fjerne Maries navn og bruge Lauras private fortid som våben.",
          isNewTopic: true,
        },
      ),
    );
  }

  if (
    person === "Laura" &&
    afterMurder &&
    state.knowledge.marie_left_group_before_scream
  ) {
    choices.push(
      defineCueChoice(
        person,
        "marie_location",
        textCue(
          "Jørgen: Så du Marie vende tilbage?",
          "dc-marie-dust-witness-dialogue",
        ),
        textCue(
          "Laura: Ja. Hun kom fra læsesalens retning lige efter skriget. Hun rystede, og der var lyst murstøv på hendes ærme.",
          "dc-marie-dust-witness-dialogue",
        ),
        {
          effects: [{ type: "LEARN", id: "marie_returned_dusty" }],
          effectsOnSkip: true,
          skipSummary:
            "Laura så Marie komme fra læsesalen, rystet og med lyst støv på ærmet.",
          isNewTopic: true,
        },
      ),
    );
  }

  return choices;
}

function getJorgenSpecialChoices(
  state: GameState,
  person: CharacterId,
): DialogueChoice[] {
  const choices: DialogueChoice[] = [];
  const afterMurder = state.timeSlot >= 3;

  if (afterMurder && person !== "Ryan") {
    choices.push(
      defineCueChoice(
        person,
        "alibi",
        textCue(`Jørgen spørger ${person} om tiden omkring faldet.`),
        textCue(
          `${person} forklarer sin rute. Den stemmer ubehageligt præcist med de registrerede tider.`,
          "dc-jorgen-npc-alibi-dialogue",
        ),
        {
          effectsOnSkip: true,
          skipSummary: `${person}s alibi holder bedre end forventet.`,
        },
      ),
      defineCueChoice(
        person,
        "theory",
        textCue("Jørgen: Hvem tror du stod bag Ryan?"),
        textCue(
          `${person}: Jeg ved det ikke. Men nogen kendte bygningen og vores bevægelser bedre, end nogen burde.`,
          "dc-jorgen-npc-alibi-dialogue",
        ),
        {
          effectsOnSkip: true,
          skipSummary:
            `${person} kan ikke navngive morderen, men oplevede en usædvanligt præcis plan.`,
        },
      ),
      defineCueChoice(
        person,
        "accuse",
        textCue(`Jørgen anklager ${person} for mordet.`),
        textSequenceCue(
          [
            `${person} afviser anklagen og gentager et alibi, der kan kontrolleres.`,
            state.knowledge.jorgen_npc_alibis_hold
              ? "Jørgen tænker: Jeg bliver ved med at lede efter en person, der passer ind i dagen. Måske er det selve antagelsen, der er forkert."
              : "Jørgen tænker: Et motiv er ikke nok. Jeg må kontrollere hele gruppens tider.",
          ],
          "dc-jorgen-wrong-accusation",
        ),
        {
          effectsOnSkip: true,
          accusationOutcome: "wrong",
          skipSummary:
            "Anklagen holder ikke. Personen har et kontrollerbart alibi, og efterforskningen fortsætter.",
        },
      ),
    );
  }

  if (
    person === "Marie" &&
    state.knowledge.jorgen_login_used
  ) {
    choices.push(
      defineCueChoice(
        person,
        "jorgen_sighting",
        textCue(
          "Jørgen: Så du nogen ved læsesalen, mens mit login blev brugt?",
          "dc-jorgen-lookalike-witness",
        ),
        textCue(
          "Marie: Jeg så dig — eller en, der lignede dig — ved bogreolen. Kun ryggen og frakken. Men du kan ikke have været dér, hvis loggen har ret.",
          "dc-jorgen-lookalike-witness",
        ),
        {
          effects: [{ type: "LEARN", id: "jorgen_lookalike_seen" }],
          effectsOnSkip: true,
          skipSummary:
            "Marie så en person med Jørgens ryg og frakke ved læsesalen, mens den spillede Jørgen var et andet sted.",
          isNewTopic: true,
        },
      ),
    );
  }

  return choices;
}

export function getDialogueChoices(
  state: GameState,
  person: CharacterId,
): readonly DialogueChoice[] {
  if (
    state.loopState.dialogue.refusesFurtherDialogue.includes(person)
  ) {
    return [];
  }

  if (person === "Ryan" && state.timeSlot >= 3) {
    return [];
  }

  const subjectChoices = (
    Object.keys(SUBJECT_TOPICS) as (keyof typeof SUBJECT_TOPICS)[]
  ).map((topic) => getSubjectChoice(state, person, topic));

  return [
    ...subjectChoices,
    ...(state.selectedCaseId === "david"
      ? getDavidSpecialChoices(state, person)
      : state.selectedCaseId === "barbara"
        ? getBarbaraSpecialChoices(state, person)
        : state.selectedCaseId === "marie"
          ? getMarieSpecialChoices(state, person)
          : state.selectedCaseId === "jorgen"
            ? getJorgenSpecialChoices(state, person)
      : getLegacySpecialChoices(state, person)),
  ];
}
