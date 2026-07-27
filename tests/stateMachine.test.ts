import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/app/gameState";
import {
  KNOWLEDGE_IDS,
  type GameState,
} from "../src/app/types";
import { SCENES, toSceneId } from "../src/game/sceneRegistry";
import { reduceGameState } from "../src/game/stateMachine";

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
      transitionId: "B2",
      specialSequence: undefined,
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
      specialSequence: "laura_suspect",
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

  it("preserves learned facts when evening wraps into another morning", () => {
    let state: GameState = {
      ...finishIntro(),
      location: "D",
      timeSlot: 4,
      loopState: {
        seenTransitions: ["A1", "C3"],
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
    expect(nextDay.loopState.seenTransitions).toEqual([]);
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
    expect(state.dialogue.askedChoices).toContain(
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
    state = reduceGameState(state, {
      type: "MOVE_TO_LOCATION",
      location: "B",
    });
    state = reduceGameState(state, {
      type: "PERFORM_INTERACTION",
      id: "inspect_barbaras_computer",
    });

    expect(state.knowledge.barbara_forged_grades).toBe(true);
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
