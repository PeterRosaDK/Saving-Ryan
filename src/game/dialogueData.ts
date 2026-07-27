import type {
  CharacterId,
  DialogueChoiceId,
  DialogueTopicId,
  GameEffect,
  GameState,
  KnowledgeId,
} from "../app/types";
import type { VideoClipId } from "../media/videoManifest";

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
  requires: readonly KnowledgeId[];
  questionClip: VideoClipId;
  answerClip: VideoClipId | null;
  effects: readonly GameEffect[];
  repeatable: boolean;
  effectsOnSkip: boolean;
}

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
  } = {},
): DialogueChoice {
  return {
    id: choiceId(person, topic),
    person,
    topic,
    requires: options.requires ?? [],
    questionClip,
    answerClip,
    effects: options.effects ?? [],
    repeatable: true,
    effectsOnSkip: options.effectsOnSkip ?? false,
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
    if (
      state.knowledge.ryan_left_laura &&
      state.knowledge.necklace_connects_laura_to_scene
    ) {
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

function getSpecialChoices(
  state: GameState,
  person: CharacterId,
): DialogueChoice[] {
  const choices: DialogueChoice[] = [];
  const afterMurder = state.timeSlot >= 3;

  if (afterMurder && person !== "Ryan") {
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
      defineChoice(
        person,
        "accuse",
        getAccusationClip(state, person),
        null,
        person === "Laura" &&
          state.knowledge.ryan_left_laura &&
          state.knowledge.necklace_connects_laura_to_scene
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

  if (afterMurder) {
    choices.push(
      defineChoice(
        person,
        "necklace",
        "Peter-omHalskaede",
        `${person}-VedIkke` as VideoClipId,
        { requires: ["killer_dropped_necklace"] },
      ),
    );
  }

  if (state.timeSlot >= 2) {
    if (person === "Marie") {
      const canConfide = state.knowledge.ryan_and_laura_were_together;
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
  }

  if (state.timeSlot >= 2) {
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
  }

  if (
    person === "Barbara" &&
    state.dialogue.barbaraHelp !== "completed"
  ) {
    const isReady = state.dialogue.barbaraHelp === "ready";
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
    const wasAsked = state.dialogue.askedChoices.includes(
      "Ryan:warn_ryan",
    );
    choices.push(
      defineChoice(
        person,
        "warn_ryan",
        wasAsked ? "Ryan-Advarsel2" : "Ryan-Advarsel1",
        null,
      ),
    );
  }

  return choices;
}

export function getDialogueChoices(
  state: GameState,
  person: CharacterId,
): readonly DialogueChoice[] {
  if (person === "Ryan" && state.timeSlot >= 3) {
    return [];
  }

  const subjectChoices = (
    Object.keys(SUBJECT_TOPICS) as (keyof typeof SUBJECT_TOPICS)[]
  ).map((topic) => getSubjectChoice(state, person, topic));

  return [...subjectChoices, ...getSpecialChoices(state, person)];
}
