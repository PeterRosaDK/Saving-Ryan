import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/app/gameState";
import {
  DIALOGUE_TOPIC_IDS,
  KNOWLEDGE_IDS,
  type CharacterId,
  type GameState,
  type KnowledgeId,
} from "../src/app/types";
import {
  executeDialogueChoice,
  getDialogueSequenceCompletion,
  getAvailableDialogueChoices,
  hasSeenCurrentDialogueResponse,
} from "../src/game/dialogueEngine";
import {
  executeInvestigationStep,
  getReachableKnowledge,
  learnKnowledge,
} from "../src/game/knowledgeGraph";
import { reduceGameState } from "../src/game/stateMachine";
import type { NarrativeCue } from "../src/media/narrativeCue";
import { VIDEO_CLIP_IDS } from "../src/media/videoManifest";

function startedState(
  overrides: Partial<GameState> = {},
): GameState {
  const intro = reduceGameState(createInitialGameState(), {
    type: "START_CASE",
    caseId: "laura",
  });
  return {
    ...reduceGameState(intro, {
      type: "INTRO_FINISHED",
    }),
    ...overrides,
  };
}

function topics(state: GameState, person: CharacterId): string[] {
  return getAvailableDialogueChoices(state, person).map(
    (choice) => choice.topic,
  );
}

function videoClip(cue: NarrativeCue | null | undefined): string | null {
  return cue?.kind === "video" ? cue.clipId : null;
}

describe("legacy dialogue rules", () => {
  it("starts with Director's base topics but no premature warning", () => {
    const state = startedState();

    expect(topics(state, "Laura")).toEqual([
      "about_laura",
      "about_marie",
      "about_david",
      "about_ryan",
      "about_barbara",
    ]);
    expect(topics(state, "Ryan")).toEqual([
      "about_laura",
      "about_marie",
      "about_david",
      "about_ryan",
      "about_barbara",
    ]);
  });

  it("unlocks Ryan's warning after Jørgen has experienced the murder", () => {
    const state = learnKnowledge(startedState(), ["ryan_was_murdered"]);

    expect(topics(state, "Ryan")).toContain("warn_ryan");
  });

  it("uses living and post-murder Ryan clips according to world time", () => {
    const morning = getAvailableDialogueChoices(
      startedState({ timeSlot: 2 }),
      "David",
    ).find((choice) => choice.topic === "about_ryan");
    const afternoon = getAvailableDialogueChoices(
      startedState({ timeSlot: 3 }),
      "David",
    ).find((choice) => choice.topic === "about_ryan");

    expect(morning).toMatchObject({
      questionCue: { kind: "video", clipId: "Peter-omRyan" },
      answerCue: { kind: "video", clipId: "David-omRyan" },
    });
    expect(afternoon).toMatchObject({
      questionCue: { kind: "video", clipId: "Peter-omRyanDie" },
      answerCue: { kind: "video", clipId: "David-omRyanDie" },
    });
    expect(getAvailableDialogueChoices(
      startedState({ timeSlot: 3 }),
      "Ryan",
    )).toEqual([]);
  });

  it("uses Director's post-murder dialogue frames for alibi, theory, and accusation", () => {
    expect(topics(startedState({ timeSlot: 2 }), "Laura")).not.toContain(
      "alibi",
    );
    expect(topics(startedState({ timeSlot: 3 }), "Laura")).toEqual(
      expect.arrayContaining(["alibi", "theory", "accuse"]),
    );
  });

  it("keeps knowledge-unlocked topics available in a new loop", () => {
    const remembered = learnKnowledge(startedState(), [
      "ryan_bullied_marie",
      "barbara_and_ryan_argued",
    ]);

    expect(topics(remembered, "Marie")).toContain(
      "marie_and_ryan",
    );
    expect(topics(remembered, "Laura")).toContain(
      "barbara_and_ryan",
    );
  });

  it("records asked choices without disabling repeatable questions", () => {
    const first = executeDialogueChoice(
      startedState(),
      "Laura",
      "about_david",
    );

    expect(first.state.loopState.dialogue.askedChoices).toEqual([
      "Laura:about_david",
    ]);
    expect(first.state.loopState.dialogue.seenResponses).toEqual([
      "Laura:about_david",
    ]);
    expect(
      topics(first.state, "Laura"),
    ).toContain("about_david");

    const repeated = executeDialogueChoice(
      first.state,
      "Laura",
      "about_david",
    );
    expect(repeated.state.loopState.dialogue.askedChoices).toEqual([
      "Laura:about_david",
    ]);
    expect(repeated.state.loopState.dialogue.seenResponses).toEqual([
      "Laura:about_david",
    ]);
  });

  it("switches Ryan's warning clip after the first warning", () => {
    const warnedState = learnKnowledge(startedState(), [
      "ryan_was_murdered",
    ]);
    const first = executeDialogueChoice(
      warnedState,
      "Ryan",
      "warn_ryan",
    );
    expect(videoClip(first.choice?.questionCue)).toBe("Ryan-Advarsel1");
    expect(first.choice?.responseKey).toBe("Ryan:warn_ryan:initial");
    expect(first.state.knowledge.ryan_dismissed_warning).toBe(true);

    const second = executeDialogueChoice(
      first.state,
      "Ryan",
      "warn_ryan",
    );
    expect(videoClip(second.choice?.questionCue)).toBe("Ryan-Advarsel2");
    expect(second.choice?.responseKey).toBe("Ryan:warn_ryan:repeat");
    expect(
      hasSeenCurrentDialogueResponse(first.state, second.choice!),
    ).toBe(false);

    const third = executeDialogueChoice(
      second.state,
      "Ryan",
      "warn_ryan",
    );
    expect(videoClip(third.choice?.questionCue)).toBe("Ryan-Advarsel2");
    expect(third.choice?.responseKey).toBe("Ryan:warn_ryan:repeat");
    expect(
      hasSeenCurrentDialogueResponse(second.state, third.choice!),
    ).toBe(true);
  });

  it("resets Ryan's remembered warning stage on a new day but keeps Jørgen's knowledge", () => {
    const warnedState = learnKnowledge(
      startedState({
        location: "C",
        timeSlot: 1,
      }),
      ["ryan_was_murdered"],
    );
    const first = executeDialogueChoice(
      warnedState,
      "Ryan",
      "warn_ryan",
    ).state;
    const waiting = reduceGameState(
      {
        ...first,
        timeSlot: 4,
      },
      { type: "WAIT" },
    );
    const nextDay = reduceGameState(waiting, {
      type: "COMPLETE_TRANSITION",
    });
    const warning = getAvailableDialogueChoices(nextDay, "Ryan").find(
      ({ topic }) => topic === "warn_ryan",
    );

    expect(nextDay.knowledge.ryan_dismissed_warning).toBe(true);
    expect(nextDay.loopState.dialogue.askedChoices).toEqual([]);
    expect(nextDay.loopState.dialogue.seenResponses).toEqual([]);
    expect(videoClip(warning?.questionCue)).toBe("Ryan-Advarsel1");
  });

  it("does not learn that Ryan dismissed a skipped warning", () => {
    const warnedState = learnKnowledge(startedState(), [
      "ryan_was_murdered",
    ]);
    const skipped = executeDialogueChoice(
      warnedState,
      "Ryan",
      "warn_ryan",
      "skipped",
    );

    expect(skipped.state.knowledge.ryan_dismissed_warning).toBe(false);
  });

  it("uses the answer result for a two-cue dialogue sequence", () => {
    expect(getDialogueSequenceCompletion("skipped", "ended")).toBe(
      "ended",
    );
    expect(getDialogueSequenceCompletion("ended", "skipped")).toBe(
      "skipped",
    );
    expect(getDialogueSequenceCompletion("skipped")).toBe("skipped");
  });

  it("uses an intentional still question and the existing Ryan clip for the Sarah clue", () => {
    const state = learnKnowledge(startedState(), [
      "ryan_has_girlfriend_sarah",
    ]);
    const choice = getAvailableDialogueChoices(state, "Ryan").find(
      ({ topic }) => topic === "about_sarah",
    );

    expect(choice?.questionCue).toEqual({
      kind: "stills",
      frames: [
        {
          image: "portrait-Ryan",
          alt: "Ryan lytter til Jørgens spørgsmål.",
          text:
            "Jørgen spørger: Jeg fandt et brev fra Sarah. Hvad skete der mellem dig og Laura?",
        },
      ],
    });
    expect(videoClip(choice?.answerCue)).toBe("Ryan-omSaraOgLaura");

    const answered = executeDialogueChoice(
      state,
      "Ryan",
      "about_sarah",
    );
    expect(answered.state.knowledge.ryan_and_laura_were_together).toBe(
      true,
    );

    const skipped = executeDialogueChoice(
      state,
      "Ryan",
      "about_sarah",
      "skipped",
    );
    expect(skipped.state.knowledge.ryan_and_laura_were_together).toBe(
      true,
    );
  });

  it("unlocks David's useful computer answer and keeps the others as dead ends", () => {
    const state = learnKnowledge(startedState(), [
      "barbara_is_computer_expert",
    ]);
    const david = executeDialogueChoice(
      state,
      "David",
      "barbara_and_computers",
    );

    expect(david.choice).toMatchObject({
      questionCue: {
        kind: "video",
        clipId: "Peter-omBarbaraOgComputere",
      },
      answerCue: {
        kind: "video",
        clipId: "David-omBarbaraOgComputere",
      },
    });
    expect(
      david.state.knowledge.barbara_hacker_alias_intruder,
    ).toBe(true);

    for (const person of ["Laura", "Marie", "Ryan"] as const) {
      const deadEnd = executeDialogueChoice(
        state,
        person,
        "barbara_and_computers",
      );
      expect(videoClip(deadEnd.choice?.answerCue)).toBe(
        `${person}-VedIkke`,
      );
      expect(
        deadEnd.state.knowledge.barbara_hacker_alias_intruder,
      ).toBe(false);
    }

    expect(topics(state, "Barbara")).not.toContain(
      "barbara_and_computers",
    );
  });

  it("normalizes the missing Marie/Ryan member and VedIkk typo", () => {
    const state = learnKnowledge(
      startedState({ timeSlot: 2 }),
      ["ryan_bullied_marie"],
    );
    const deadEnd = executeDialogueChoice(
      state,
      "David",
      "marie_and_ryan",
    );

    expect(deadEnd.choice).toMatchObject({
      questionCue: {
        kind: "video",
        clipId: "Peter-omRyanOgMarie",
      },
      answerCue: { kind: "video", clipId: "David-VedIkke" },
    });
  });

  it("lets Marie reveal the motive only after both prerequisites", () => {
    const bullyingOnly = learnKnowledge(
      startedState({ timeSlot: 2 }),
      ["ryan_bullied_marie"],
    );
    const first = executeDialogueChoice(
      bullyingOnly,
      "Marie",
      "marie_and_ryan",
    );
    expect(videoClip(first.choice?.questionCue)).toBe(
      "Marie-Fortrolighed",
    );
    expect(first.state.knowledge.ryan_left_laura).toBe(false);

    const ready = learnKnowledge(first.state, [
      "ryan_and_laura_were_together",
    ]);
    const confidence = executeDialogueChoice(
      ready,
      "Marie",
      "marie_and_ryan",
    );
    expect(videoClip(confidence.choice?.questionCue)).toBe(
      "Marie-Fortrolighed2",
    );
    expect(confidence.state.knowledge.ryan_left_laura).toBe(true);
  });

  it("does not skip Marie's initial confidence exchange when both facts are already known", () => {
    const ready = learnKnowledge(
      startedState({ timeSlot: 2 }),
      ["ryan_bullied_marie", "ryan_and_laura_were_together"],
    );
    const trust = executeDialogueChoice(
      ready,
      "Marie",
      "marie_and_ryan",
    );

    expect(videoClip(trust.choice?.questionCue)).toBe(
      "Marie-Fortrolighed",
    );
    expect(trust.state.knowledge.ryan_left_laura).toBe(false);

    const confession = executeDialogueChoice(
      trust.state,
      "Marie",
      "marie_and_ryan",
    );
    expect(videoClip(confession.choice?.questionCue)).toBe(
      "Marie-Fortrolighed2",
    );
    expect(confession.state.knowledge.ryan_left_laura).toBe(true);
  });

  it("requires Marie's confidence exchange again after a day reset", () => {
    const ready = learnKnowledge(
      startedState({
        location: "D",
        timeSlot: 4,
      }),
      ["ryan_bullied_marie", "ryan_and_laura_were_together"],
    );
    const trusted = executeDialogueChoice(
      ready,
      "Marie",
      "marie_and_ryan",
    ).state;
    const nextDay = reduceGameState(
      reduceGameState(trusted, { type: "WAIT" }),
      { type: "COMPLETE_TRANSITION" },
    );
    const choice = getAvailableDialogueChoices(nextDay, "Marie").find(
      ({ topic }) => topic === "marie_and_ryan",
    );

    expect(nextDay.knowledge.ryan_and_laura_were_together).toBe(true);
    expect(videoClip(choice?.questionCue)).toBe("Marie-Fortrolighed");
  });

  it("keeps necklace questions as explicit dead ends", () => {
    const state = learnKnowledge(
      startedState({ timeSlot: 3 }),
      ["killer_dropped_necklace"],
    );

    for (const person of [
      "Barbara",
      "David",
      "Laura",
      "Marie",
    ] as const) {
      const result = executeDialogueChoice(
        state,
        person,
        "necklace",
      );
      expect(videoClip(result.choice?.answerCue)).toBe(
        `${person}-VedIkke`,
      );
      expect(result.choice?.effects).toEqual([]);
    }
  });

  it("keeps the necklace topic available to living Ryan in a later loop", () => {
    const state = learnKnowledge(startedState(), [
      "killer_dropped_necklace",
    ]);
    const choice = getAvailableDialogueChoices(state, "Ryan").find(
      ({ topic }) => topic === "necklace",
    );

    expect(choice).toMatchObject({
      questionCue: {
        kind: "video",
        clipId: "Peter-omHalskaede",
      },
      answerCue: {
        kind: "video",
        clipId: "Ryan-VedIkke",
      },
    });
  });

  it("applies pre-playback Director effects when their clip is skipped", () => {
    const state = learnKnowledge(startedState(), [
      "barbara_is_computer_expert",
    ]);
    const skipped = executeDialogueChoice(
      state,
      "David",
      "barbara_and_computers",
      "skipped",
    );

    expect(skipped.appliedEffects).toBe(true);
    expect(
      skipped.state.knowledge.barbara_hacker_alias_intruder,
    ).toBe(true);
    expect(skipped.state.loopState.dialogue.askedChoices).toContain(
      "David:barbara_and_computers",
    );
  });

  it("does not complete Laura's future confession when it is skipped", () => {
    const ready = learnKnowledge(
      startedState({ timeSlot: 3 }),
      ["ryan_left_laura", "necklace_connects_laura_to_scene"],
    );
    const skipped = executeDialogueChoice(
      ready,
      "Laura",
      "accuse",
      "skipped",
    );

    expect(skipped.appliedEffects).toBe(false);
    expect(skipped.state.knowledge.laura_confessed).toBe(false);
  });

  it("ends an inconclusively accused character's dialogue until the next day", () => {
    const accused = executeDialogueChoice(
      learnKnowledge(startedState({ timeSlot: 3 }), [
        "barbara_is_computer_expert",
      ]),
      "David",
      "accuse",
    ).state;

    expect(
      accused.loopState.dialogue.refusesFurtherDialogue,
    ).toContain("David");
    expect(getAvailableDialogueChoices(accused, "David")).toEqual([]);
    expect(topics(accused, "Laura")).toContain("accuse");

    const nextDay = reduceGameState(
      reduceGameState(
        {
          ...accused,
          timeSlot: 4,
        },
        { type: "WAIT" },
      ),
      { type: "COMPLETE_TRANSITION" },
    );

    expect(nextDay.knowledge.barbara_is_computer_expert).toBe(true);
    expect(
      nextDay.loopState.dialogue.refusesFurtherDialogue,
    ).toEqual([]);
    expect(topics(nextDay, "David")).toContain("about_laura");
  });

  it("models Barbara's help as a multi-step sequence", () => {
    let state = learnKnowledge(startedState(), [
      "laura_hid_computer_activity",
      "barbara_forged_grades",
      "killer_dropped_necklace",
    ]);

    const request = executeDialogueChoice(
      state,
      "Barbara",
      "ask_barbara_for_help",
    );
    expect(videoClip(request.choice?.questionCue)).toBe(
      "Barbara-omHilfe1",
    );
    expect(request.state.loopState.dialogue.barbaraHelp).toBe("ready");

    const help = executeDialogueChoice(
      request.state,
      "Barbara",
      "ask_barbara_for_help",
    );
    expect(help.choice).toMatchObject({
      responseKey: "Barbara:ask_barbara_for_help:ready",
      questionCue: {
        kind: "video",
        clipId: "Barbara-omHilfe2",
      },
      answerCue: { kind: "video", clipId: "BarbaraHacker" },
    });
    expect(
      hasSeenCurrentDialogueResponse(request.state, help.choice!),
    ).toBe(false);
    expect(help.state.loopState.dialogue.barbaraHelp).toBe("completed");
    expect(help.state.knowledge.laura_was_in_institution).toBe(true);
    expect(
      help.state.knowledge.laura_owns_polar_bear_necklace,
    ).toBe(true);
    expect(
      help.state.knowledge.necklace_connects_laura_to_scene,
    ).toBe(true);
    expect(topics(help.state, "Barbara")).not.toContain(
      "ask_barbara_for_help",
    );
  });

  it("executes the intended Laura solution path as deterministic transitions", () => {
    let state = startedState({ timeSlot: 3 });

    for (const step of [
      "read_sarah_letter",
      "ask_ryan_about_sarah",
      "witness_ryan_bullying_marie",
      "discover_secret_passage",
      "earn_maries_confidence",
      "observe_barbara_programming",
      "ask_david_about_barbara",
      "inspect_barbara_files",
      "observe_laura_at_computer",
      "get_barbaras_help",
      "inspect_murder_necklace",
    ] as const) {
      state = executeInvestigationStep(state, step);
    }

    expect(state.knowledge.ryan_left_laura).toBe(true);
    expect(
      state.knowledge.necklace_connects_laura_to_scene,
    ).toBe(true);

    const accusation = executeDialogueChoice(
      state,
      "Laura",
      "accuse",
    );
    expect(videoClip(accusation.choice?.questionCue)).toBe(
      "Peter-BeskyldLaura3",
    );
    expect(accusation.choice?.answerCue).toMatchObject({
      kind: "text",
    });
    expect(accusation.state.knowledge.laura_confessed).toBe(true);
    expect(
      accusation.state.knowledge.secret_passage_exists,
    ).toBe(true);
    expect(
      accusation.state.loopState.dialogue.refusesFurtherDialogue,
    ).not.toContain("Laura");
  });

  it("has Laura reveal the passage when motive and evidence make her confess", () => {
    const ready = learnKnowledge(
      startedState({ timeSlot: 3 }),
      ["ryan_left_laura", "necklace_connects_laura_to_scene"],
    );
    const accusation = executeDialogueChoice(
      ready,
      "Laura",
      "accuse",
    );

    expect(accusation.state.knowledge.laura_confessed).toBe(true);
    expect(
      accusation.state.knowledge.secret_passage_exists,
    ).toBe(true);
  });

  it("makes every required motive and evidence fact reachable", () => {
    const reachable = getReachableKnowledge(["ryan_was_murdered"]);
    const solutionFacts: readonly KnowledgeId[] = [
      "ryan_and_laura_were_together",
      "ryan_left_laura",
      "laura_was_in_institution",
      "laura_owns_polar_bear_necklace",
      "killer_dropped_necklace",
      "necklace_connects_laura_to_scene",
      "laura_confessed",
      "secret_passage_exists",
      "ryan_dismissed_warning",
      "ryan_was_saved",
    ];

    expect(
      solutionFacts.every((fact) => reachable.has(fact)),
    ).toBe(true);
  });

  it("makes the phase 9 observation loopback semantically reachable", () => {
    const reachable = getReachableKnowledge(["ryan_was_murdered"]);

    for (const fact of [
      "heard_scraping_behind_bookcase",
      "noticed_laura_disappear_near_reading_room",
      "laura_used_secret_passage",
    ] as const) {
      expect(reachable.has(fact)).toBe(true);
    }
  });

  it("only emits clips from the closed video catalogue", () => {
    const knownEverything = learnKnowledge(
      startedState(),
      KNOWLEDGE_IDS,
    );
    const catalogue = new Set(VIDEO_CLIP_IDS);

    for (const timeSlot of [1, 2, 3, 4] as const) {
      const state = { ...knownEverything, timeSlot };
      for (const person of [
        "Barbara",
        "David",
        "Laura",
        "Marie",
        "Ryan",
      ] as const) {
        for (const choice of getAvailableDialogueChoices(state, person)) {
          for (const cue of [choice.questionCue, choice.answerCue]) {
            if (cue?.kind === "video") {
              expect(catalogue.has(cue.clipId)).toBe(true);
            }
          }
        }
      }
    }
  });

  it("covers every recovered and report-backed dialogue topic", () => {
    const knownEverything = learnKnowledge(
      startedState(),
      KNOWLEDGE_IDS,
    );
    const recoveredTopics = new Set<string>();

    for (const timeSlot of [1, 2, 3] as const) {
      const state = { ...knownEverything, timeSlot };
      for (const person of [
        "Barbara",
        "David",
        "Laura",
        "Marie",
        "Ryan",
      ] as const) {
        for (const choice of getAvailableDialogueChoices(state, person)) {
          recoveredTopics.add(choice.topic);
        }
      }
    }

    expect(recoveredTopics).toEqual(
      new Set(
        DIALOGUE_TOPIC_IDS.filter(
          (topic) =>
            topic !== "david_breakup" &&
            topic !== "david_saw_ryan" &&
            topic !== "laura_necklace_bag" &&
            topic !== "laura_bag_access" &&
            topic !== "barbara_time_with_ryan" &&
            topic !== "marie_work" &&
            topic !== "marie_threat" &&
            topic !== "marie_location" &&
            topic !== "jorgen_sighting",
        ),
      ),
    );
  });
});
