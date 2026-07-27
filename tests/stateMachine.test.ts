import { describe, expect, it } from "vitest";
import {
  createInitialGameState,
  createInitialLoopState,
} from "../src/app/gameState";
import {
  KNOWLEDGE_IDS,
  type GameState,
} from "../src/app/types";
import { SCENES, toSceneId } from "../src/game/sceneRegistry";
import { reduceGameState } from "../src/game/stateMachine";
import { getNotebookKnowledgeIds } from "../src/ui/App";

function finishIntro(state = createInitialGameState()): GameState {
  return reduceGameState(state, { type: "INTRO_FINISHED" });
}

describe("legacy game state", () => {
  it("starts before the intro has revealed any knowledge", () => {
    const state = createInitialGameState();

    expect(state.phase).toBe("intro");
    expect(toSceneId(state.location, state.timeSlot)).toBe("A1");
    expect(state.loop).toBe(1);
    expect(state.dialogue.activePerson).toBeNull();
    expect(Object.keys(state.knowledge)).toEqual([...KNOWLEDGE_IDS]);
    expect(Object.values(state.knowledge).every((known) => !known)).toBe(true);
  });

  it("contains the complete five-location by four-time scene grid", () => {
    expect(SCENES).toHaveLength(20);
    expect(new Set(SCENES.map(({ id }) => id)).size).toBe(20);
    expect(SCENES.at(0)?.id).toBe("A1");
    expect(SCENES.at(-1)?.id).toBe("E4");
  });

  it.each(["INTRO_FINISHED", "SKIP_INTRO"] as const)(
    "%s enters A1 knowing that Ryan is murdered",
    (type) => {
      const started = reduceGameState(createInitialGameState(), { type });

      expect(started.phase).toBe("exploration");
      expect(toSceneId(started.location, started.timeSlot)).toBe("A1");
      expect(started.knowledge.ryan_was_murdered).toBe(true);
    },
  );

  it("keeps the time-loop premise out of the notebook's found clues", () => {
    const started = finishIntro();

    expect(started.knowledge.ryan_was_murdered).toBe(true);
    expect(getNotebookKnowledgeIds(started)).not.toContain(
      "ryan_was_murdered",
    );
    expect(getNotebookKnowledgeIds(started)).toEqual([]);
  });

  it("moves between locations without advancing time and applies entry effects", () => {
    const initial: GameState = {
      ...finishIntro(),
      timeSlot: 1,
    };
    const moved = reduceGameState(initial, {
      type: "MOVE_TO_LOCATION",
      location: "B",
    });

    expect(toSceneId(moved.location, moved.timeSlot)).toBe("B1");
    expect(moved.loop).toBe(1);
    expect(moved.knowledge.barbara_is_computer_expert).toBe(true);
  });

  it("keeps the source scene active until its transition is completed", () => {
    const initial: GameState = {
      ...finishIntro(),
      location: "B",
      timeSlot: 2,
    };
    const waiting = reduceGameState(initial, { type: "WAIT" });

    expect(toSceneId(waiting.location, waiting.timeSlot)).toBe("B2");
    expect(waiting.pendingTransition).toEqual({
      from: "B2",
      to: "B3",
      cause: {
        kind: "clock",
        eventId: "B2",
      },
      beginsNewLoop: false,
    });
    expect(waiting.loopState.seenTransitions).toEqual([]);

    const completed = reduceGameState(waiting, {
      type: "COMPLETE_TRANSITION",
    });
    expect(toSceneId(completed.location, completed.timeSlot)).toBe("B3");
    expect(completed.loopState.seenTransitions).toEqual(["B2"]);
    expect(completed.pendingTransition).toBeNull();
  });

  it("executes all 20 Director Vent transitions without changing location", () => {
    for (const scene of SCENES) {
      const initial: GameState = {
        ...finishIntro(),
        location: scene.location.id,
        timeSlot: scene.time.id,
      };
      const waiting = reduceGameState(initial, { type: "WAIT" });

      expect(waiting.pendingTransition?.from).toBe(scene.id);
      expect(waiting.pendingTransition?.cause).toEqual({
        kind: "clock",
        eventId: scene.id,
      });

      const completed = reduceGameState(waiting, {
        type: "COMPLETE_TRANSITION",
      });
      expect(completed.location).toBe(scene.location.id);
      expect(completed.timeSlot).toBe(
        scene.time.id === 4 ? 1 : scene.time.id + 1,
      );
      expect(completed.loop).toBe(scene.time.id === 4 ? 2 : 1);
    }
  });

  it("runs B4 through the Laura Suspekt contract before beginning the next loop", () => {
    const initial: GameState = {
      ...finishIntro(),
      location: "B",
      timeSlot: 4,
    };
    const waiting = reduceGameState(initial, { type: "WAIT" });

    expect(toSceneId(waiting.location, waiting.timeSlot)).toBe("B4");
    expect(waiting.loop).toBe(1);
    expect(waiting.knowledge.laura_hid_computer_activity).toBe(false);
    expect(waiting.pendingTransition).toMatchObject({
      from: "B4",
      to: "B1",
      cause: {
        kind: "clock",
        eventId: "B4",
      },
      beginsNewLoop: true,
    });

    const completed = reduceGameState(waiting, {
      type: "COMPLETE_TRANSITION",
    });
    expect(toSceneId(completed.location, completed.timeSlot)).toBe("B1");
    expect(completed.loop).toBe(2);
    expect(completed.knowledge.laura_hid_computer_activity).toBe(true);
    expect(completed.knowledge.barbara_is_computer_expert).toBe(true);
    expect(completed.loopState.seenTransitions).toEqual([]);
    expect(
      reduceGameState(completed, {
        type: "COMPLETE_TRANSITION",
      }),
    ).toBe(completed);
  });

  it("selects different evening events and effects from B4 and E4", () => {
    const atB4: GameState = {
      ...finishIntro(),
      location: "B",
      timeSlot: 4,
    };
    const atE4: GameState = {
      ...finishIntro(),
      location: "E",
      timeSlot: 4,
    };

    const waitingInB = reduceGameState(atB4, { type: "WAIT" });
    const waitingInE = reduceGameState(atE4, { type: "WAIT" });

    expect(waitingInB.pendingTransition?.cause).toEqual({
      kind: "clock",
      eventId: "B4",
    });
    expect(waitingInE.pendingTransition?.cause).toEqual({
      kind: "clock",
      eventId: "E4",
    });

    const nextB = reduceGameState(waitingInB, {
      type: "COMPLETE_TRANSITION",
    });
    const nextE = reduceGameState(waitingInE, {
      type: "COMPLETE_TRANSITION",
    });

    expect(toSceneId(nextB.location, nextB.timeSlot)).toBe("B1");
    expect(nextB.knowledge.laura_hid_computer_activity).toBe(true);
    expect(toSceneId(nextE.location, nextE.timeSlot)).toBe("E1");
    expect(nextE.knowledge.laura_hid_computer_activity).toBe(false);
  });

  it("learns about Ryan bullying Marie when the E1 transition completes", () => {
    const initial: GameState = {
      ...finishIntro(),
      location: "E",
      timeSlot: 1,
    };
    const waiting = reduceGameState(initial, { type: "WAIT" });

    expect(waiting.knowledge.ryan_bullied_marie).toBe(false);

    const completed = reduceGameState(waiting, {
      type: "COMPLETE_TRANSITION",
    });
    expect(completed.knowledge.ryan_bullied_marie).toBe(true);
  });

  it("requires separate C2 and E2 observations before next-loop passage surveillance", () => {
    let state: GameState = {
      ...finishIntro(),
      location: "E",
      timeSlot: 2,
    };
    const wait = (): void => {
      state = reduceGameState(state, { type: "WAIT" });
      state = reduceGameState(state, {
        type: "COMPLETE_TRANSITION",
      });
    };

    wait();
    expect(toSceneId(state.location, state.timeSlot)).toBe("E3");
    expect(
      state.knowledge.noticed_laura_disappear_near_reading_room,
    ).toBe(true);
    expect(state.knowledge.heard_scraping_behind_bookcase).toBe(false);

    wait();
    wait();
    expect(state.loop).toBe(2);
    expect(toSceneId(state.location, state.timeSlot)).toBe("E1");

    state = reduceGameState(state, {
      type: "MOVE_TO_LOCATION",
      location: "C",
    });
    wait();
    wait();
    expect(toSceneId(state.location, state.timeSlot)).toBe("C3");
    expect(state.knowledge.heard_scraping_behind_bookcase).toBe(true);
    expect(state.knowledge.laura_used_secret_passage).toBe(false);

    wait();
    wait();
    expect(state.loop).toBe(3);
    expect(toSceneId(state.location, state.timeSlot)).toBe("C1");

    wait();
    expect(toSceneId(state.location, state.timeSlot)).toBe("C2");

    state = reduceGameState(state, {
      type: "PERFORM_INTERACTION",
      id: "watch_secret_passage",
    });
    expect(state.pendingTransition).toEqual({
      from: "C2",
      to: "C3",
      cause: {
        kind: "interaction",
        id: "watch_secret_passage",
      },
      beginsNewLoop: false,
    });
    expect(state.knowledge.laura_used_secret_passage).toBe(false);

    state = reduceGameState(state, {
      type: "COMPLETE_TRANSITION",
    });
    expect(toSceneId(state.location, state.timeSlot)).toBe("C3");
    expect(state.loop).toBe(3);
    expect(state.knowledge.secret_passage_exists).toBe(true);
    expect(state.knowledge.laura_used_secret_passage).toBe(true);
    expect(state.loopState.seenTransitions).toEqual(["C1"]);
    expect(
      reduceGameState(state, {
        type: "COMPLETE_TRANSITION",
      }),
    ).toBe(state);
  });

  it("uses explicit manual interactions for the letter and necklace", () => {
    const atLetter: GameState = {
      ...finishIntro(),
      location: "D",
      timeSlot: 4,
    };
    const letterRead = reduceGameState(atLetter, {
      type: "PERFORM_INTERACTION",
      id: "inspect_girlfriend_letter",
    });
    expect(letterRead.knowledge.ryan_has_girlfriend_sarah).toBe(true);

    const atBody: GameState = {
      ...letterRead,
      location: "A",
      timeSlot: 3,
    };
    const bodyInspected = reduceGameState(atBody, {
      type: "PERFORM_INTERACTION",
      id: "inspect_ryans_body_and_necklace",
    });
    expect(bodyInspected.knowledge.killer_dropped_necklace).toBe(true);
  });

  it("keeps Director's body and trash interactions in every scored scene", () => {
    const atD1: GameState = {
      ...finishIntro(),
      location: "D",
      timeSlot: 1,
    };
    const letterRead = reduceGameState(atD1, {
      type: "PERFORM_INTERACTION",
      id: "inspect_girlfriend_letter",
    });
    expect(letterRead.knowledge.ryan_has_girlfriend_sarah).toBe(true);

    const atA4: GameState = {
      ...letterRead,
      location: "A",
      timeSlot: 4,
    };
    const bodyInspected = reduceGameState(atA4, {
      type: "PERFORM_INTERACTION",
      id: "inspect_ryans_body_and_necklace",
    });
    expect(bodyInspected.knowledge.killer_dropped_necklace).toBe(true);
  });

  it("connects the B2 eavesdropping and C-room book hotspots", () => {
    const atB2: GameState = {
      ...finishIntro(),
      location: "B",
      timeSlot: 2,
    };
    const eavesdropped = reduceGameState(atB2, {
      type: "PERFORM_INTERACTION",
      id: "eavesdrop_barbara_and_ryan",
    });
    expect(eavesdropped.knowledge.barbara_and_ryan_argued).toBe(true);

    const atC2: GameState = {
      ...eavesdropped,
      location: "C",
    };
    const passageFound = reduceGameState(atC2, {
      type: "PERFORM_INTERACTION",
      id: "inspect_secret_passage_book",
    });
    expect(passageFound.knowledge.secret_passage_exists).toBe(true);
  });

  it("preserves learned facts when evening wraps into another morning", () => {
    let state: GameState = {
      ...finishIntro(),
      location: "D",
      timeSlot: 4,
      loopState: {
        ...createInitialLoopState(),
        seenTransitions: ["A1", "C3"],
        dialogue: {
          askedChoices: ["Marie:marie_and_ryan"],
          barbaraHelp: "ready",
          refusesFurtherDialogue: ["Marie"],
        },
      },
    };

    state = reduceGameState(state, {
      type: "PERFORM_INTERACTION",
      id: "inspect_girlfriend_letter",
    });
    state = reduceGameState(state, { type: "WAIT" });

    expect(toSceneId(state.location, state.timeSlot)).toBe("D4");
    expect(state.loop).toBe(1);

    const nextDay = reduceGameState(state, {
      type: "COMPLETE_TRANSITION",
    });
    expect(toSceneId(nextDay.location, nextDay.timeSlot)).toBe("D1");
    expect(nextDay.loop).toBe(2);
    expect(nextDay.knowledge.ryan_has_girlfriend_sarah).toBe(true);
    expect(nextDay.loopState).toEqual(createInitialLoopState());
  });

  it("keeps conversation memory across time changes within the same day", () => {
    let state: GameState = {
      ...finishIntro(),
      location: "D",
      timeSlot: 1,
    };
    state = reduceGameState(state, {
      type: "START_DIALOGUE",
      person: "David",
    });
    state = reduceGameState(state, {
      type: "COMPLETE_DIALOGUE_CHOICE",
      person: "David",
      topic: "about_laura",
      completion: "ended",
    });
    state = reduceGameState(state, { type: "CLOSE_DIALOGUE" });
    state = reduceGameState(state, { type: "WAIT" });
    state = reduceGameState(state, { type: "COMPLETE_TRANSITION" });

    expect(state.timeSlot).toBe(2);
    expect(state.loopState.dialogue.askedChoices).toContain(
      "David:about_laura",
    );
  });

  it("keeps ordinary dialogue and repeated questions free", () => {
    let state: GameState = {
      ...finishIntro(),
      location: "D",
      timeSlot: 1,
    };

    for (let repeat = 0; repeat < 2; repeat += 1) {
      state = reduceGameState(state, {
        type: "START_DIALOGUE",
        person: "David",
      });
      state = reduceGameState(state, {
        type: "COMPLETE_DIALOGUE_CHOICE",
        person: "David",
        topic: "about_laura",
        completion: "ended",
      });
      state = reduceGameState(state, { type: "CLOSE_DIALOGUE" });
    }

    expect(toSceneId(state.location, state.timeSlot)).toBe("D1");
    expect(state.pendingTransition).toBeNull();
  });

  it("supports unlimited day loops without a deadline state", () => {
    let state: GameState = finishIntro();

    for (let interval = 0; interval < 40; interval += 1) {
      state = reduceGameState(state, { type: "WAIT" });
      state = reduceGameState(state, {
        type: "COMPLETE_TRANSITION",
      });
    }

    expect(state.phase).toBe("exploration");
    expect(state.loop).toBe(11);
    expect(toSceneId(state.location, state.timeSlot)).toBe("A1");
    expect(state.knowledge.ryan_was_murdered).toBe(true);
    expect(state.pendingTransition).toBeNull();
  });

  it("only completes the story from the morning passage with confession, passage, and warning knowledge", () => {
    const atPassage: GameState = {
      ...finishIntro(),
      location: "C",
      timeSlot: 1,
      loop: 2,
    };
    const withoutCase = reduceGameState(atPassage, {
      type: "PERFORM_INTERACTION",
      id: "prevent_ryans_murder",
    });
    expect(withoutCase).toBe(atPassage);

    const ready: GameState = {
      ...atPassage,
      knowledge: {
        ...atPassage.knowledge,
        laura_confessed: true,
        secret_passage_exists: true,
        ryan_dismissed_warning: true,
      },
    };
    const ending = reduceGameState(ready, {
      type: "PERFORM_INTERACTION",
      id: "prevent_ryans_murder",
    });

    expect(ending.phase).toBe("ending");
    expect(ending.knowledge.ryan_was_saved).toBe(true);
    expect(
      reduceGameState(ending, {
        type: "PERFORM_INTERACTION",
        id: "prevent_ryans_murder",
      }),
    ).toBe(ending);
  });

  it("does not run the prevention interaction outside C1", () => {
    const atC2: GameState = {
      ...finishIntro(),
      location: "C",
      timeSlot: 2,
    };
    const ready: GameState = {
      ...atC2,
      knowledge: {
        ...atC2.knowledge,
        laura_confessed: true,
        secret_passage_exists: true,
        ryan_dismissed_warning: true,
      },
    };

    expect(
      reduceGameState(ready, {
        type: "PERFORM_INTERACTION",
        id: "prevent_ryans_murder",
      }),
    ).toBe(ready);
  });

  it("rejects exploration actions outside exploration or during a transition", () => {
    const intro = createInitialGameState();
    expect(reduceGameState(intro, { type: "WAIT" })).toBe(intro);

    const waiting = reduceGameState(finishIntro(), { type: "WAIT" });
    expect(reduceGameState(waiting, { type: "WAIT" })).toBe(waiting);
    expect(
      reduceGameState(waiting, {
        type: "MOVE_TO_LOCATION",
        location: "E",
      }),
    ).toBe(waiting);
    expect(
      reduceGameState(waiting, {
        type: "PERFORM_INTERACTION",
        id: "inspect_girlfriend_letter",
      }),
    ).toBe(waiting);
  });

  it("only starts dialogue with a confirmed occupant of the current scene", () => {
    const atA1 = finishIntro();
    expect(
      reduceGameState(atA1, {
        type: "START_DIALOGUE",
        person: "Barbara",
      }),
    ).toBe(atA1);

    const atB1 = reduceGameState(atA1, {
      type: "MOVE_TO_LOCATION",
      location: "B",
    });
    const talking = reduceGameState(atB1, {
      type: "START_DIALOGUE",
      person: "Barbara",
    });

    expect(talking.phase).toBe("dialogue");
    expect(talking.dialogue.activePerson).toBe("Barbara");

    const closed = reduceGameState(talking, {
      type: "CLOSE_DIALOGUE",
    });
    expect(closed.phase).toBe("exploration");
    expect(closed.dialogue.activePerson).toBeNull();
    expect(toSceneId(closed.location, closed.timeSlot)).toBe("B1");
  });

  it("blocks movement and waiting while a dialogue is open", () => {
    const atB1 = reduceGameState(finishIntro(), {
      type: "MOVE_TO_LOCATION",
      location: "B",
    });
    const talking = reduceGameState(atB1, {
      type: "START_DIALOGUE",
      person: "Barbara",
    });

    expect(reduceGameState(talking, { type: "WAIT" })).toBe(talking);
    expect(
      reduceGameState(talking, {
        type: "MOVE_TO_LOCATION",
        location: "D",
      }),
    ).toBe(talking);
  });

  it("connects the first playable Barbara-to-David knowledge route", () => {
    let state = reduceGameState(finishIntro(), {
      type: "MOVE_TO_LOCATION",
      location: "B",
    });
    expect(state.knowledge.barbara_is_computer_expert).toBe(true);

    state = reduceGameState(state, {
      type: "MOVE_TO_LOCATION",
      location: "D",
    });
    state = reduceGameState(state, {
      type: "START_DIALOGUE",
      person: "David",
    });
    state = reduceGameState(state, {
      type: "COMPLETE_DIALOGUE_CHOICE",
      person: "David",
      topic: "barbara_and_computers",
      completion: "ended",
    });

    expect(state.phase).toBe("dialogue");
    expect(state.dialogue.activePerson).toBe("David");
    expect(state.loopState.dialogue.askedChoices).toContain(
      "David:barbara_and_computers",
    );
    expect(state.knowledge.barbara_hacker_alias_intruder).toBe(true);
  });

  it("only exposes Barbara's forged grades after the Intruder clue", () => {
    let state = reduceGameState(finishIntro(), {
      type: "MOVE_TO_LOCATION",
      location: "B",
    });
    const blocked = reduceGameState(state, {
      type: "PERFORM_INTERACTION",
      id: "inspect_barbaras_computer",
    });
    expect(blocked).toBe(state);

    state = reduceGameState(state, {
      type: "MOVE_TO_LOCATION",
      location: "D",
    });
    state = reduceGameState(state, {
      type: "START_DIALOGUE",
      person: "David",
    });
    state = reduceGameState(state, {
      type: "COMPLETE_DIALOGUE_CHOICE",
      person: "David",
      topic: "barbara_and_computers",
      completion: "ended",
    });
    state = reduceGameState(state, { type: "CLOSE_DIALOGUE" });
    state = reduceGameState(state, { type: "WAIT" });
    state = reduceGameState(state, { type: "COMPLETE_TRANSITION" });
    state = reduceGameState(state, {
      type: "MOVE_TO_LOCATION",
      location: "B",
    });
    state = reduceGameState(state, {
      type: "PERFORM_INTERACTION",
      id: "inspect_barbaras_computer",
    });

    expect(toSceneId(state.location, state.timeSlot)).toBe("B2");
    expect(state.knowledge.barbara_forged_grades).toBe(false);
    expect(state.pendingTransition).toEqual({
      from: "B2",
      to: "B3",
      cause: {
        kind: "interaction",
        id: "inspect_barbaras_computer",
      },
      beginsNewLoop: false,
    });

    const completed = reduceGameState(state, {
      type: "COMPLETE_TRANSITION",
    });
    expect(toSceneId(completed.location, completed.timeSlot)).toBe("B3");
    expect(completed.knowledge.barbara_forged_grades).toBe(true);
    expect(completed.loopState.seenTransitions).toEqual(["D1"]);

    const replayed = reduceGameState(completed, {
      type: "PERFORM_INTERACTION",
      id: "inspect_barbaras_computer",
    });
    expect(replayed).toBe(completed);
    expect(replayed.pendingTransition).toBeNull();
    expect(
      reduceGameState(completed, {
        type: "COMPLETE_TRANSITION",
      }),
    ).toBe(completed);
  });

  it("connects the report's Sarah-to-Marie motive route across a new day", () => {
    let state: GameState = {
      ...finishIntro(),
      location: "D",
      timeSlot: 4,
    };
    state = reduceGameState(state, {
      type: "PERFORM_INTERACTION",
      id: "inspect_girlfriend_letter",
    });
    expect(state.knowledge.ryan_has_girlfriend_sarah).toBe(true);

    state = reduceGameState(state, { type: "WAIT" });
    state = reduceGameState(state, { type: "COMPLETE_TRANSITION" });
    state = reduceGameState(state, {
      type: "MOVE_TO_LOCATION",
      location: "C",
    });
    state = reduceGameState(state, {
      type: "START_DIALOGUE",
      person: "Ryan",
    });
    state = reduceGameState(state, {
      type: "COMPLETE_DIALOGUE_CHOICE",
      person: "Ryan",
      topic: "about_sarah",
      completion: "ended",
    });
    expect(state.knowledge.ryan_and_laura_were_together).toBe(true);

    state = reduceGameState(state, { type: "CLOSE_DIALOGUE" });
    state = reduceGameState(state, {
      type: "MOVE_TO_LOCATION",
      location: "E",
    });
    state = reduceGameState(state, { type: "WAIT" });
    state = reduceGameState(state, { type: "COMPLETE_TRANSITION" });
    expect(state.knowledge.ryan_bullied_marie).toBe(true);

    state = reduceGameState(state, {
      type: "MOVE_TO_LOCATION",
      location: "D",
    });
    state = reduceGameState(state, {
      type: "START_DIALOGUE",
      person: "Marie",
    });
    state = reduceGameState(state, {
      type: "COMPLETE_DIALOGUE_CHOICE",
      person: "Marie",
      topic: "marie_and_ryan",
      completion: "ended",
    });
    expect(state.knowledge.ryan_left_laura).toBe(false);

    state = reduceGameState(state, {
      type: "COMPLETE_DIALOGUE_CHOICE",
      person: "Marie",
      topic: "marie_and_ryan",
      completion: "ended",
    });
    expect(state.knowledge.ryan_left_laura).toBe(true);
  });

  it("does not run a scene interaction from the wrong scene", () => {
    const atA1 = finishIntro();
    const unchanged = reduceGameState(atA1, {
      type: "PERFORM_INTERACTION",
      id: "inspect_girlfriend_letter",
    });

    expect(unchanged).toBe(atA1);
  });

  it("only learns facts monotonically", () => {
    const initial: GameState = {
      ...finishIntro(),
      location: "D",
      timeSlot: 4,
    };
    const learned = reduceGameState(initial, {
      type: "PERFORM_INTERACTION",
      id: "inspect_girlfriend_letter",
    });
    const repeated = reduceGameState(learned, {
      type: "PERFORM_INTERACTION",
      id: "inspect_girlfriend_letter",
    });

    expect(learned.knowledge.ryan_has_girlfriend_sarah).toBe(true);
    expect(repeated).toBe(learned);
  });

  it("can reset the entire game to its initial contract", () => {
    const changed = reduceGameState(
      {
        ...finishIntro(),
        loop: 7,
      },
      {
        type: "PERFORM_INTERACTION",
        id: "inspect_girlfriend_letter",
      },
    );
    const reset = reduceGameState(changed, { type: "RESET_GAME" });

    expect(reset).toEqual(createInitialGameState());
  });
});
