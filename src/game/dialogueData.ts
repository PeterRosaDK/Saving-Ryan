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
            }
          : { requires: ["ryan_bullied_marie"] },
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
            }
          : {
              requires: ["laura_hid_computer_activity"],
              effectsOnSkip: true,
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
      : getLegacySpecialChoices(state, person)),
  ];
}
