import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/app/gameState";
import type { GameState, KnowledgeId } from "../src/app/types";
import {
  executeDialogueChoice,
  getAvailableDialogueChoices,
  hasSeenCurrentDialogueResponse,
} from "../src/game/dialogueEngine";
import { learnKnowledge } from "../src/game/knowledgeGraph";
import { reduceGameState } from "../src/game/stateMachine";
import { getLocationTransitionEvent } from "../src/game/transitionEvents";
import { DIRECTORS_CUT_ASSET_MANIFEST } from "../src/media/directorsCutAssetManifest";
import { renderKnowledge } from "../src/ui/App";

function originalState(overrides: Partial<GameState> = {}): GameState {
  let state = reduceGameState(createInitialGameState(), {
    type: "START_CASE",
    caseId: "laura",
  });
  state = reduceGameState(state, { type: "SKIP_INTRO" });
  return { ...state, ...overrides };
}

function completeE1(state: GameState): GameState {
  const waiting = reduceGameState(
    { ...state, location: "E", timeSlot: 1 },
    { type: "WAIT" },
  );
  return reduceGameState(waiting, { type: "COMPLETE_TRANSITION" });
}

function marieChoice(state: GameState) {
  return getAvailableDialogueChoices(state, "Marie").find(
    ({ topic }) => topic === "marie_and_ryan",
  );
}

describe("Original historie: Marie motive and Barbara evidence regressions", () => {
  it("presents E1 as a separate text-first event and records the bullying once", () => {
    const event = getLocationTransitionEvent("E1", "laura");
    expect(event.specialCue).toMatchObject({
      kind: "text-sequence",
      placeholderAssetId: "legacy-laura-e1-bullying-still",
      cards: [
        expect.stringContaining("Ryan går efter Marie"),
        expect.stringContaining("Nyt spor: Ryan mobber Marie"),
      ],
    });

    const first = completeE1(originalState());
    expect(first.knowledge.ryan_bullied_marie).toBe(true);
    expect(first.caseProgress.currentLead).toBe(
      "Marie virkede tydeligt påvirket af Ryan. Tal med hende om, hvad der skete.",
    );
    expect(renderKnowledge(first)).toContain("Ryan mobber Marie");

    let nextLoop = reduceGameState(
      { ...first, location: "E", timeSlot: 4 },
      { type: "WAIT" },
    );
    nextLoop = reduceGameState(nextLoop, {
      type: "COMPLETE_TRANSITION",
    });
    const repeated = completeE1(nextLoop);
    const notebook = renderKnowledge(repeated);
    expect(repeated.knowledge.ryan_bullied_marie).toBe(true);
    expect(notebook.match(/Ryan mobber Marie/g)).toHaveLength(1);
  });

  it("unlocks trust then the distinct breakup follow-up when the relationship was known first", () => {
    let state = learnKnowledge(originalState(), [
      "ryan_and_laura_were_together",
    ]);
    state = completeE1(state);

    const supportive = marieChoice(state);
    expect(supportive).toMatchObject({
      label: "Ryan gik hårdt efter dig. Er du okay?",
      responseKey: "Marie:marie_and_ryan:initial",
      effectsOnSkip: true,
    });
    state = executeDialogueChoice(
      state,
      "Marie",
      "marie_and_ryan",
      "ended",
    ).state;
    expect(state.knowledge.marie_trust_earned).toBe(true);
    expect(state.caseProgress.currentLead).toBe(
      "Marie stoler mere på dig. Spørg hende, hvad hun ved om Ryan og Lauras forhold.",
    );

    const followUp = marieChoice(state);
    expect(followUp).toMatchObject({
      label: "Hvad ved du om Ryan og Lauras forhold?",
      responseKey: "Marie:marie_and_ryan:revelation",
      effectsOnSkip: true,
    });
    expect(hasSeenCurrentDialogueResponse(state, followUp!)).toBe(false);
    state = executeDialogueChoice(
      state,
      "Marie",
      "marie_and_ryan",
      "ended",
    ).state;
    expect(state.knowledge.ryan_left_laura).toBe(true);
    expect(renderKnowledge(state)).toContain(
      "Konklusion: Ryan forlod Laura. Hun havde et muligt motiv til at ønske ham ondt.",
    );
  });

  it("preserves trust until a later relationship discovery without repeating the supportive answer", () => {
    let state = completeE1(originalState());
    state = executeDialogueChoice(
      state,
      "Marie",
      "marie_and_ryan",
      "skipped",
    ).state;
    expect(state.knowledge.marie_trust_earned).toBe(true);
    expect(state.knowledge.ryan_left_laura).toBe(false);

    state = reduceGameState(
      { ...state, location: "E", timeSlot: 4 },
      { type: "WAIT" },
    );
    state = reduceGameState(state, { type: "COMPLETE_TRANSITION" });
    expect(state.loopState.dialogue.askedChoices).toEqual([]);
    expect(state.knowledge.marie_trust_earned).toBe(true);

    state = learnKnowledge(state, ["ryan_and_laura_were_together"]);
    expect(marieChoice(state)).toMatchObject({
      questionCue: {
        kind: "video",
        clipId: "Marie-Fortrolighed2",
      },
      responseKey: "Marie:marie_and_ryan:revelation",
    });
    state = executeDialogueChoice(
      state,
      "Marie",
      "marie_and_ryan",
      "skipped",
    ).state;
    expect(state.knowledge.ryan_left_laura).toBe(true);
  });

  it("gives full, skipped, and fallback Marie answers identical knowledge effects", () => {
    const base = completeE1(
      learnKnowledge(originalState(), [
        "ryan_and_laura_were_together",
      ]),
    );
    const fullTrust = executeDialogueChoice(
      base,
      "Marie",
      "marie_and_ryan",
      "ended",
    );
    const skippedTrust = executeDialogueChoice(
      base,
      "Marie",
      "marie_and_ryan",
      "skipped",
    );
    expect(skippedTrust.choice?.skipSummary).toBeTruthy();
    expect(fullTrust.state.knowledge.marie_trust_earned).toBe(true);
    expect(skippedTrust.state.knowledge.marie_trust_earned).toBe(true);

    for (const trusted of [fullTrust.state, skippedTrust.state]) {
      const full = executeDialogueChoice(
        trusted,
        "Marie",
        "marie_and_ryan",
        "ended",
      );
      const fallback = executeDialogueChoice(
        trusted,
        "Marie",
        "marie_and_ryan",
        "skipped",
      );
      expect(fallback.choice?.skipSummary).toBeTruthy();
      expect(full.state.knowledge.ryan_left_laura).toBe(true);
      expect(fallback.state.knowledge.ryan_left_laura).toBe(true);
    }
  });

  it("finishes BarbaraHacker with the same idempotent evidence on playback, skip, or media fallback", () => {
    const facts = [
      "laura_hid_computer_activity",
      "barbara_forged_grades",
      "killer_dropped_necklace",
    ] as const satisfies readonly KnowledgeId[];
    const request = executeDialogueChoice(
      learnKnowledge(originalState(), facts),
      "Barbara",
      "ask_barbara_for_help",
      "ended",
    ).state;
    const help = getAvailableDialogueChoices(request, "Barbara").find(
      ({ topic }) => topic === "ask_barbara_for_help",
    );
    expect(help).toMatchObject({
      answerCue: { kind: "video", clipId: "BarbaraHacker" },
      effectsOnSkip: true,
      skipSummary: expect.stringContaining(
        "Laura har været på en institution",
      ),
    });

    for (const completion of ["ended", "skipped"] as const) {
      let result = executeDialogueChoice(
        request,
        "Barbara",
        "ask_barbara_for_help",
        completion,
      ).state;
      expect(result.knowledge).toMatchObject({
        laura_was_in_institution: true,
        laura_owns_polar_bear_necklace: true,
        necklace_connects_laura_to_scene: true,
      });
      expect(result.caseProgress.pendingInsights).toContain(
        "necklace_connects_laura_to_scene",
      );
      expect(renderKnowledge(result)).toContain(
        "Konklusion: Ryan havde Lauras halskæde i hånden.",
      );
      expect(
        getAvailableDialogueChoices(result, "Barbara").some(
          ({ topic }) => topic === "ask_barbara_for_help",
        ),
      ).toBe(false);

      result = learnKnowledge(result, [
        "laura_was_in_institution",
        "laura_owns_polar_bear_necklace",
      ]);
      expect(renderKnowledge(result).match(/Laura ejer isbjørnehalskæden/g))
        .toHaveLength(1);
    }
  });

  it("registers five shared Legacy placeholders alongside unique case assets", () => {
    const ids = DIRECTORS_CUT_ASSET_MANIFEST.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
    const legacy = DIRECTORS_CUT_ASSET_MANIFEST.filter(
      ({ caseId }) => caseId === "laura",
    );
    expect(legacy).toHaveLength(5);
    expect(legacy.map(({ id }) => id)).toContain(
      "legacy-laura-e1-bullying-still",
    );
    expect(
      legacy.every(
        ({ fallbackText, status }) =>
          fallbackText.length > 0 && status === "placeholder",
      ),
    ).toBe(true);
  });
});
