import type { GameStore } from "../app/gameStore";
import type {
  CharacterId,
  GameState,
  KnowledgeId,
} from "../app/types";
import {
  getAvailableDialogueChoices,
} from "../game/dialogueEngine";
import type { DialogueChoice } from "../game/dialogueData";
import {
  getScene,
  LOCATIONS,
  toSceneId,
} from "../game/sceneRegistry";
import {
  DIRECTOR_STAGE,
  directorHotspotRectStyle,
  directorRectStyle,
  getScenePresentation,
  type DirectorHotspotRect,
  type FilmLoopPresentation,
} from "../game/scenePresentation";
import {
  canPerformSceneInteraction,
  getSceneInteractions,
  type SceneInteraction,
} from "../game/sceneInteractions";
import { getSpecialSequenceCue } from "../game/specialSequenceCues";
import { TRANSITION_TEXT } from "../game/transitionText";
import {
  getCharacterPortraitUrl,
  getClockImageUrl,
  getFilmLoopFrameUrls,
  getSceneBackgroundUrl,
} from "../media/imageManifest";
import type { VideoPlaybackResultStatus } from "../media/VideoPlayer";
import { NarrativeHost } from "./NarrativeHost";

const CLUE_LABELS: Readonly<Record<KnowledgeId, string>> = {
  barbara_is_computer_expert: "Barbara er computerekspert",
  barbara_hacker_alias_intruder: "Barbara bruger hackernavnet Intruder",
  barbara_forged_grades: "Barbara har ændret sine karakterer",
  barbara_and_ryan_argued: "Barbara og Ryan havde en skjult konflikt",
  ryan_has_girlfriend_sarah: "Ryan har en kæreste, Sarah",
  ryan_bullied_marie: "Ryan behandler Marie ondt",
  laura_hid_computer_activity: "Laura skjuler sin computeraktivitet",
  laura_acknowledged_barbara_and_ryan:
    "Laura ved mere om Barbara og Ryan",
  ryan_and_laura_were_together: "Ryan og Laura har været kærester",
  ryan_left_laura: "Ryan forlod Laura",
  secret_passage_exists: "Der findes en skjult passage",
  laura_was_in_institution: "Laura har været på en institution",
  laura_owns_polar_bear_necklace: "Laura ejer isbjørnehalskæden",
  ryan_was_murdered: "Ryan bliver myrdet",
  killer_dropped_necklace: "Morderen tabte en halskæde",
  necklace_connects_laura_to_scene: "Halskæden forbinder Laura med gerningsstedet",
  laura_confessed: "Laura har tilstået",
};

function button(
  label: string,
  className: string,
  onClick: () => void,
  disabled = false,
): HTMLButtonElement {
  const element = document.createElement("button");
  element.type = "button";
  element.className = className;
  element.textContent = label;
  element.disabled = disabled;
  element.addEventListener("click", onClick);
  return element;
}

function hotspotButton(
  label: string,
  kind: "move" | "talk" | "inspect" | "wait",
  rectangle: DirectorHotspotRect,
  onClick: () => void,
): HTMLButtonElement {
  const element = button(
    "",
    `scene-hotspot scene-hotspot--${kind}`,
    onClick,
  );
  element.ariaLabel = label;
  element.title = label;
  element.dataset.hotspotLabel = label;
  element.setAttribute("style", directorHotspotRectStyle(rectangle));

  if (kind === "wait") {
    const clock = document.createElement("img");
    clock.alt = "";
    clock.ariaHidden = "true";
    element.append(clock);
  }

  return element;
}

function getActiveFilmFrame(
  filmLoop: FilmLoopPresentation,
  tick: number,
): number {
  let frameIndex = filmLoop.timeline[0]?.frameIndex ?? 0;

  for (const entry of filmLoop.timeline) {
    if (entry.tick > tick) {
      break;
    }
    frameIndex = entry.frameIndex;
  }

  return frameIndex;
}

function renderFilmLoop(
  host: HTMLElement,
  filmLoop: FilmLoopPresentation,
): void {
  const container = document.createElement("div");
  container.className = "director-film-loop";
  container.ariaHidden = "true";
  container.setAttribute("style", directorRectStyle(filmLoop.rect));

  const frames = getFilmLoopFrameUrls(filmLoop.name).map((url) => {
    const image = document.createElement("img");
    image.src = url;
    image.alt = "";
    container.append(image);
    return image;
  });

  host.append(container);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    frames.forEach((frame, index) => {
      frame.style.opacity =
        index === getActiveFilmFrame(filmLoop, 0) ? "1" : "0";
    });
    return;
  }

  frames.forEach((frame, frameIndex) => {
    const keyframes = Array.from(
      { length: filmLoop.ticks + 1 },
      (_, tick): Keyframe => ({
        offset: tick / filmLoop.ticks,
        opacity:
          getActiveFilmFrame(filmLoop, tick) === frameIndex ? 1 : 0,
        easing: "step-end",
      }),
    );

    frame.animate(keyframes, {
      duration: filmLoop.ticks * DIRECTOR_STAGE.tickMilliseconds,
      iterations: Infinity,
    });
  });
}

function connectHotspotLabel(
  hotspot: HTMLButtonElement,
  infoBox: HTMLElement,
  defaultLabel: string,
): void {
  const show = (): void => {
    infoBox.textContent = hotspot.dataset.hotspotLabel ?? defaultLabel;
  };
  const reset = (): void => {
    infoBox.textContent = defaultLabel;
  };

  hotspot.addEventListener("pointerenter", show);
  hotspot.addEventListener("pointerleave", reset);
  hotspot.addEventListener("focus", show);
  hotspot.addEventListener("blur", reset);
}

function renderIntro(root: HTMLElement, store: GameStore): void {
  root.innerHTML = `
    <main class="app-shell">
      <section class="stage intro-stage" aria-labelledby="game-title">
        <div class="storm" aria-hidden="true"></div>
        <div class="intro-copy">
          <p class="eyebrow">Et interaktivt mysterium</p>
          <h1 id="game-title">Saving Ryan</h1>
          <p class="lede">
            En storm. Et mord. Den samme dag, igen og igen.
          </p>
        </div>
      </section>
    </main>
  `;

  const introCopy = root.querySelector(".intro-copy");
  introCopy?.append(
    button("Begynd dagen", "primary-action", () => {
      store.dispatch({ type: "INTRO_FINISHED" });
    }),
  );
}

function renderKnowledge(state: GameState): string {
  const discoveries = Object.entries(state.knowledge).filter(([, known]) => known)
    .map(([id]) => id as KnowledgeId);

  if (discoveries.length === 0) {
    return "<p class=\"empty-state\">Du har endnu ikke samlet nogen spor.</p>";
  }

  return `
    <ul class="clue-list">
      ${discoveries
        .map(
          (id) =>
            `<li><span>${CLUE_LABELS[id]}</span><small>fundet</small></li>`,
        )
        .join("")}
    </ul>
  `;
}

const PLAYBACK_ERROR_LABELS: Readonly<
  Partial<Record<VideoPlaybackResultStatus, string>>
> = {
  "autoplay-blocked":
    "Browseren blokerede videoen. Prøv at vælge spørgsmålet igen.",
  "missing-media": "Et nødvendigt medieklip mangler.",
  "network-error": "Medieklippet kunne ikke indlæses.",
  "decode-error": "Browseren kunne ikke afkode medieklippet.",
};

function isCompletedPlayback(
  status: VideoPlaybackResultStatus,
): status is "ended" | "skipped" {
  return status === "ended" || status === "skipped";
}

async function playDialogueChoice(
  choice: DialogueChoice,
  person: CharacterId,
  root: HTMLElement,
  store: GameStore,
  narrativeHost: NarrativeHost,
): Promise<void> {
  const status = root.querySelector<HTMLElement>("[data-dialogue-status]");
  const controls = root.querySelectorAll<HTMLButtonElement>(
    ".dialogue-choice, [data-close-dialogue]",
  );
  controls.forEach((control) => {
    control.disabled = true;
  });
  if (status) {
    status.textContent = "Jørgen stiller spørgsmålet…";
  }

  const questionResult = await narrativeHost.play(choice.questionCue);
  if (!isCompletedPlayback(questionResult.status)) {
    if (questionResult.status !== "aborted" && status?.isConnected) {
      status.textContent =
        PLAYBACK_ERROR_LABELS[questionResult.status] ??
        "Sekvensen blev afbrudt.";
      controls.forEach((control) => {
        control.disabled = false;
      });
    }
    return;
  }

  let completion: "ended" | "skipped" = questionResult.status;
  if (choice.answerCue) {
    if (status?.isConnected) {
      status.textContent = `${person} svarer…`;
    }
    const answerResult = await narrativeHost.play(choice.answerCue);
    if (!isCompletedPlayback(answerResult.status)) {
      if (answerResult.status !== "aborted" && status?.isConnected) {
        status.textContent =
          PLAYBACK_ERROR_LABELS[answerResult.status] ??
          "Sekvensen blev afbrudt.";
        controls.forEach((control) => {
          control.disabled = false;
        });
      }
      return;
    }

    if (answerResult.status === "skipped") {
      completion = "skipped";
    }
  }

  const current = store.getState();
  if (
    current.phase === "dialogue" &&
    current.dialogue.activePerson === person
  ) {
    store.dispatch({
      type: "COMPLETE_DIALOGUE_CHOICE",
      person,
      topic: choice.topic,
      completion,
    });
  }
}

function renderDialogue(
  root: HTMLElement,
  state: GameState,
  store: GameStore,
  narrativeHost: NarrativeHost,
): void {
  const person = state.dialogue.activePerson;
  if (!person) {
    throw new Error("Dialogue phase requires an active person.");
  }

  const scene = getScene(toSceneId(state.location, state.timeSlot));
  const choices = getAvailableDialogueChoices(state, person);

  root.innerHTML = `
    <main class="app-shell dialogue-shell">
      <header class="game-header">
        <div>
          <p class="eyebrow">Samtale i ${scene.location.name}</p>
          <h1>${person}</h1>
        </div>
        <dl class="status-strip">
          <div><dt>Scene</dt><dd>${scene.id}</dd></div>
          <div><dt>Tid</dt><dd>${scene.time.name}</dd></div>
          <div><dt>Dag</dt><dd>${state.loop}</dd></div>
        </dl>
      </header>

      <section class="dialogue-layout" aria-labelledby="dialogue-title">
        <div class="dialogue-portrait">
          <img
            src="${getCharacterPortraitUrl(person)}"
            alt="Portræt af ${person}"
          />
        </div>
        <div class="dialogue-panel">
          <p class="eyebrow">Hvad vil du spørge om?</p>
          <h2 id="dialogue-title">Tal med ${person}</h2>
          <div class="dialogue-options" data-dialogue-options></div>
          <p class="dialogue-status" aria-live="polite" data-dialogue-status>
            Tidligere spørgsmål er dæmpet, men kan stilles igen.
          </p>
          <button
            class="secondary-action"
            type="button"
            data-close-dialogue
          >
            Afslut samtalen
          </button>
        </div>
      </section>
    </main>
  `;

  const options = root.querySelector("[data-dialogue-options]");
  choices.forEach((choice) => {
    const asked = state.dialogue.askedChoices.includes(choice.id);
    options?.append(
      button(
        choice.label,
        `dialogue-choice${asked ? " is-asked" : ""}`,
        () => {
          void playDialogueChoice(
            choice,
            person,
            root,
            store,
            narrativeHost,
          );
        },
      ),
    );
  });

  root
    .querySelector("[data-close-dialogue]")
    ?.addEventListener("click", () => {
      narrativeHost.abort();
      store.dispatch({ type: "CLOSE_DIALOGUE" });
    });
}

async function playSceneInteraction(
  interaction: SceneInteraction,
  store: GameStore,
  narrativeHost: NarrativeHost,
): Promise<void> {
  if (interaction.cue) {
    const result = await narrativeHost.play(interaction.cue);
    if (!isCompletedPlayback(result.status)) {
      return;
    }
  }

  store.dispatch({
    type: "PERFORM_INTERACTION",
    id: interaction.id,
  });
}

async function completePendingTransition(
  root: HTMLElement,
  store: GameStore,
  narrativeHost: NarrativeHost,
): Promise<void> {
  const pending = store.getState().pendingTransition;
  if (!pending) {
    return;
  }

  if (!pending.specialSequence) {
    store.dispatch({ type: "COMPLETE_TRANSITION" });
    return;
  }

  const dismiss = root.querySelector<HTMLButtonElement>("[data-dismiss]");
  const status = root.querySelector<HTMLElement>(
    "[data-transition-status]",
  );
  if (dismiss) {
    dismiss.disabled = true;
  }
  if (status) {
    status.textContent = "Sekvensen begynder…";
  }

  const result = await narrativeHost.play(
    getSpecialSequenceCue(pending.specialSequence),
  );
  if (isCompletedPlayback(result.status)) {
    if (store.getState().pendingTransition === pending) {
      store.dispatch({ type: "COMPLETE_TRANSITION" });
    }
    return;
  }

  if (result.status !== "aborted") {
    if (dismiss?.isConnected) {
      dismiss.disabled = false;
    }
    if (status?.isConnected) {
      status.textContent =
        PLAYBACK_ERROR_LABELS[result.status] ??
        "Sekvensen blev afbrudt.";
    }
  }
}

function renderExploration(
  root: HTMLElement,
  state: GameState,
  store: GameStore,
  narrativeHost: NarrativeHost,
): void {
  const sceneId = toSceneId(state.location, state.timeSlot);
  const scene = getScene(sceneId);
  const presentation = getScenePresentation(sceneId);
  const manualInteractions = getSceneInteractions(sceneId, "manual").filter(
    (interaction) =>
      canPerformSceneInteraction(state, interaction) &&
      interaction.effects.some(
        (effect) =>
          effect.type === "LEARN" && !state.knowledge[effect.id],
      ),
  );
  const transitionText = state.pendingTransition
    ? TRANSITION_TEXT[state.pendingTransition.transitionId]
    : null;

  root.innerHTML = `
    <main class="app-shell">
      <header class="game-header">
        <div>
          <p class="eyebrow">Saving Ryan</p>
          <h1>${scene.location.name}</h1>
        </div>
        <dl class="status-strip">
          <div><dt>Scene</dt><dd>${scene.id}</dd></div>
          <div><dt>Tid</dt><dd>${scene.time.name}</dd></div>
          <div><dt>Dag</dt><dd>${state.loop}</dd></div>
        </dl>
      </header>

      <section class="game-layout">
        <div class="stage exploration-stage" aria-label="${scene.location.name}, ${scene.time.name}">
          <img
            class="scene-background"
            style="${directorRectStyle(DIRECTOR_STAGE.background)}"
            src="${getSceneBackgroundUrl(scene.id)}"
            alt="Original scene fra ${scene.location.name}"
          />
          <div data-film-loop></div>
          <p class="hotspot-info" aria-live="polite" data-hotspot-info>
            Bevæg markøren over scenen
          </p>
          <div class="hotspot-layer" data-hotspot-layer></div>
        </div>

        <aside class="notebook" aria-labelledby="notebook-title">
          <p class="eyebrow">Jørgens noter</p>
          <h2 id="notebook-title">Spor</h2>
          ${renderKnowledge(state)}
        </aside>
      </section>

      ${
        transitionText
          ? `<div class="transition-dialog" role="dialog" aria-modal="true" aria-labelledby="transition-title">
              <div>
                <p class="eyebrow">Tiden går</p>
                <h2 id="transition-title">${scene.time.name}</h2>
                <p>${transitionText}</p>
                <p class="transition-status" aria-live="polite" data-transition-status></p>
                <button class="primary-action" type="button" data-dismiss>Fortsæt</button>
              </div>
            </div>`
          : ""
      }
    </main>
  `;

  const filmLoopHost = root.querySelector<HTMLElement>("[data-film-loop]");
  if (filmLoopHost && presentation.filmLoop) {
    renderFilmLoop(filmLoopHost, presentation.filmLoop);
  }

  const hotspotLayer = root.querySelector<HTMLElement>("[data-hotspot-layer]");
  const infoBox = root.querySelector<HTMLElement>("[data-hotspot-info]");
  const defaultHotspotLabel = "Bevæg markøren over scenen";
  const appendHotspot = (hotspot: HTMLButtonElement): void => {
    hotspotLayer?.append(hotspot);
    if (infoBox) {
      connectHotspotLabel(hotspot, infoBox, defaultHotspotLabel);
    }
  };

  presentation.navigation.forEach(({ target, rect }) => {
    const targetLocation = LOCATIONS.find(({ id }) => id === target);
    appendHotspot(
      hotspotButton(
        `Gå til ${targetLocation?.name ?? target}`,
        "move",
        rect,
        () => {
          store.dispatch({
            type: "MOVE_TO_LOCATION",
            location: target,
          });
        },
      ),
    );
  });

  presentation.characters.forEach(({ person, rect }) => {
    appendHotspot(
      hotspotButton(
        `Tal med ${person}`,
        "talk",
        rect,
        () => {
          store.dispatch({
            type: "START_DIALOGUE",
            person,
          });
        },
      ),
    );
  });

  presentation.interactions.forEach(({ interactionId, rect }) => {
    const interaction = manualInteractions.find(
      ({ id }) => id === interactionId,
    );
    if (interaction) {
      appendHotspot(
        hotspotButton(interaction.label, "inspect", rect, () => {
          void playSceneInteraction(
            interaction,
            store,
            narrativeHost,
          );
        }),
      );
    }
  });

  const clockHotspot = hotspotButton(
    "Vent et tidsinterval",
    "wait",
    {
      x: presentation.clock.centerX - presentation.clock.width / 2,
      y: presentation.clock.centerY - presentation.clock.height / 2,
      width: presentation.clock.width,
      height: presentation.clock.height,
    },
    () => {
        store.dispatch({ type: "WAIT" });
    },
  );
  const clockImage = clockHotspot.querySelector("img");
  if (clockImage) {
    clockImage.src = getClockImageUrl(state.timeSlot);
  }
  appendHotspot(clockHotspot);

  root.querySelector("[data-dismiss]")?.addEventListener("click", () => {
    void completePendingTransition(root, store, narrativeHost);
  });
}

export function mountApp(root: HTMLElement, store: GameStore): () => void {
  const appView = document.createElement("div");
  appView.dataset.appView = "";

  const mediaHost = document.createElement("section");
  mediaHost.dataset.mediaHost = "";
  const narrativeHost = new NarrativeHost(mediaHost);

  root.replaceChildren(appView, mediaHost);

  const unsubscribe = store.subscribe((state) => {
    if (state.phase === "intro") {
      renderIntro(appView, store);
      return;
    }

    if (state.phase === "dialogue") {
      renderDialogue(appView, state, store, narrativeHost);
      return;
    }

    renderExploration(appView, state, store, narrativeHost);
  });

  return () => {
    unsubscribe();
    narrativeHost.destroy();
    root.replaceChildren();
  };
}
