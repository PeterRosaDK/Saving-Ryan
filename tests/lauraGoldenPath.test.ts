import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/app/gameState";
import type {
  GameAction,
  GameState,
} from "../src/app/types";
import {
  canPerformSceneInteraction,
  getSceneInteractions,
} from "../src/game/sceneInteractions";
import { getScenePresentation } from "../src/game/scenePresentation";
import { reduceGameState } from "../src/game/stateMachine";

describe("playable Laura golden path", () => {
  it("plays from the intro through confession and a later-loop prevention to the epilogue", () => {
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

    dispatch({ type: "START_CASE", caseId: "laura" });
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
      id: "eavesdrop_barbara_and_ryan",
    });
    dispatch({
      type: "PERFORM_INTERACTION",
      id: "inspect_barbaras_computer",
    });
    dispatch({ type: "COMPLETE_TRANSITION" });

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
    closeDialogue();

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

    wait();
    wait();
    expect(state.loop).toBe(3);
    expect(state.timeSlot).toBe(1);

    move("C");
    talk("Ryan");
    ask("Ryan", "warn_ryan");
    closeDialogue();
    expect(state.knowledge.ryan_dismissed_warning).toBe(true);

    dispatch({
      type: "PERFORM_INTERACTION",
      id: "prevent_ryans_murder",
    });

    expect(state.phase).toBe("ending");
    expect(state.knowledge.ryan_was_saved).toBe(true);
    expect(state.knowledge.laura_confessed).toBe(true);

    dispatch({ type: "RESET_GAME" });
    expect(state).toEqual(createInitialGameState());
  });

  it("preserves the finale state across reset and exposes the action after a skipped warning", () => {
    let state = createInitialGameState();
    state = reduceGameState(state, {
      type: "START_CASE",
      caseId: "laura",
    });
    state = reduceGameState(state, { type: "INTRO_FINISHED" });
    state = {
      ...state,
      location: "C",
      timeSlot: 4,
      knowledge: {
        ...state.knowledge,
        laura_used_secret_passage: true,
        secret_passage_exists: true,
        ryan_left_laura: true,
        killer_dropped_necklace: true,
        necklace_connects_laura_to_scene: true,
        laura_confessed: true,
        ryan_was_murdered: true,
      },
    };

    state = reduceGameState(state, { type: "WAIT" });
    state = reduceGameState(state, { type: "COMPLETE_TRANSITION" });

    expect(state).toMatchObject({
      phase: "exploration",
      location: "C",
      timeSlot: 1,
    });
    expect(state.knowledge).toMatchObject({
      laura_confessed: true,
      secret_passage_exists: true,
      laura_used_secret_passage: true,
    });

    state = reduceGameState(state, {
      type: "START_DIALOGUE",
      person: "Ryan",
    });
    state = reduceGameState(state, {
      type: "COMPLETE_DIALOGUE_CHOICE",
      person: "Ryan",
      topic: "warn_ryan",
      completion: "skipped",
    });
    state = reduceGameState(state, { type: "CLOSE_DIALOGUE" });

    const finale = getSceneInteractions(state, "C1", "manual").find(
      ({ id }) => id === "prevent_ryans_murder",
    );
    expect(finale).toMatchObject({
      label: "Gå gennem passagen og vent på Laura",
      concludesStory: true,
    });
    expect(finale && canPerformSceneInteraction(state, finale)).toBe(true);

    const hotspot = getScenePresentation("C1").interactions.find(
      ({ interactionId }) =>
        interactionId === "prevent_ryans_murder",
    );
    expect(hotspot?.rect.width).toBeGreaterThanOrEqual(44);
    expect(hotspot?.rect.height).toBeGreaterThanOrEqual(44);

    state = reduceGameState(state, {
      type: "PERFORM_INTERACTION",
      id: "prevent_ryans_murder",
    });
    expect(state.phase).toBe("ending");
    expect(state.knowledge.ryan_was_saved).toBe(true);
  });

  it("keeps the finale available after arriving too late and starting another loop", () => {
    let state = createInitialGameState();
    state = reduceGameState(state, {
      type: "START_CASE",
      caseId: "laura",
    });
    state = reduceGameState(state, { type: "INTRO_FINISHED" });
    state = {
      ...state,
      location: "C",
      timeSlot: 2,
      knowledge: {
        ...state.knowledge,
        laura_confessed: true,
        secret_passage_exists: true,
        ryan_was_murdered: true,
        ryan_dismissed_warning: true,
      },
    };

    const lateAttempt = reduceGameState(state, {
      type: "PERFORM_INTERACTION",
      id: "prevent_ryans_murder",
    });
    expect(lateAttempt).toBe(state);

    for (let step = 0; step < 3; step += 1) {
      state = reduceGameState(state, { type: "WAIT" });
      state = reduceGameState(state, { type: "COMPLETE_TRANSITION" });
    }

    expect(state).toMatchObject({
      phase: "exploration",
      location: "C",
      timeSlot: 1,
    });
    expect(state.knowledge).toMatchObject({
      laura_confessed: true,
      secret_passage_exists: true,
      ryan_dismissed_warning: true,
      ryan_was_murdered: true,
    });
    const finale = getSceneInteractions(state, "C1", "manual").find(
      ({ id }) => id === "prevent_ryans_murder",
    );
    expect(finale && canPerformSceneInteraction(state, finale)).toBe(true);
  });
});
