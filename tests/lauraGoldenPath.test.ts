import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/app/gameState";
import type {
  GameAction,
  GameState,
} from "../src/app/types";
import { reduceGameState } from "../src/game/stateMachine";

describe("playable Laura golden path", () => {
  it("reaches Laura's confession through placed scenes and dialogue", () => {
    let state = createInitialGameState();
    const dispatch = (action: GameAction): void => {
      state = reduceGameState(state, action);
    };
    const move = (location: GameState["location"]): void => {
      dispatch({ type: "MOVE_TO_LOCATION", location });
    };
    const wait = (): void => {
      dispatch({ type: "WAIT" });
      dispatch({ type: "COMPLETE_TRANSITION" });
    };
    const talk = (
      person: NonNullable<GameState["dialogue"]["activePerson"]>,
    ): void => {
      dispatch({ type: "START_DIALOGUE", person });
    };
    const ask = (
      person: NonNullable<GameState["dialogue"]["activePerson"]>,
      topic: Extract<
        GameAction,
        { type: "COMPLETE_DIALOGUE_CHOICE" }
      >["topic"],
    ): void => {
      dispatch({
        type: "COMPLETE_DIALOGUE_CHOICE",
        person,
        topic,
        completion: "ended",
      });
    };
    const closeDialogue = (): void => {
      dispatch({ type: "CLOSE_DIALOGUE" });
    };

    dispatch({ type: "INTRO_FINISHED" });

    move("B");
    move("D");
    talk("David");
    ask("David", "barbara_and_computers");
    closeDialogue();
    wait();
    move("B");
    dispatch({
      type: "PERFORM_INTERACTION",
      id: "inspect_barbaras_computer",
    });
    dispatch({
      type: "PERFORM_INTERACTION",
      id: "eavesdrop_barbara_and_ryan",
    });

    wait();
    wait();
    move("D");
    dispatch({
      type: "PERFORM_INTERACTION",
      id: "inspect_girlfriend_letter",
    });
    move("B");
    wait();

    talk("Barbara");
    ask("Barbara", "ask_barbara_for_help");
    ask("Barbara", "ask_barbara_for_help");
    closeDialogue();

    move("C");
    dispatch({
      type: "PERFORM_INTERACTION",
      id: "inspect_secret_passage_book",
    });
    talk("Ryan");
    ask("Ryan", "about_sarah");
    closeDialogue();

    move("E");
    wait();
    move("D");
    talk("Marie");
    ask("Marie", "marie_and_ryan");
    ask("Marie", "marie_and_ryan");
    closeDialogue();

    move("A");
    wait();
    dispatch({
      type: "PERFORM_INTERACTION",
      id: "inspect_ryans_body_and_necklace",
    });
    talk("Laura");
    ask("Laura", "accuse");

    expect(state.knowledge).toMatchObject({
      barbara_is_computer_expert: true,
      barbara_hacker_alias_intruder: true,
      barbara_forged_grades: true,
      barbara_and_ryan_argued: true,
      laura_hid_computer_activity: true,
      laura_owns_polar_bear_necklace: true,
      ryan_has_girlfriend_sarah: true,
      ryan_and_laura_were_together: true,
      ryan_bullied_marie: true,
      ryan_left_laura: true,
      killer_dropped_necklace: true,
      necklace_connects_laura_to_scene: true,
      laura_confessed: true,
      secret_passage_exists: true,
    });
  });
});
