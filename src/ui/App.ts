import type { GameStore } from "../app/gameStore";
import type {
  CharacterId,
  GameState,
  KnowledgeId,
} from "../app/types";
import {
  getDialogueSequenceCompletion,
  getAvailableDialogueChoices,
} from "../game/dialogueEngine";
import type { DialogueChoice } from "../game/dialogueData";
import {
  getNextTimeSlot,
  getScene,
  getWaitActionLabel,
  LOCATIONS,
  toSceneId,
} from "../game/sceneRegistry";
import {
  INTRO_DURATION_MILLISECONDS,
  INTRO_SCORE,
  START_PROLOGUE_PARAGRAPHS,
} from "../game/introPresentation";
import {
  DEFAULT_CASE_ID,
  getCaseDefinition,
  getMysteryCaseIds,
  selectMysteryCaseId,
} from "../game/caseDefinitions";
import {
  DIRECTOR_STAGE,
  DIRECTOR_TOOL_RECTS,
  directorHotspotRectStyle,
  directorRectStyle,
  getScenePresentation,
  type DirectorHotspotRect,
  type DirectorRect,
  type FilmLoopPresentation,
} from "../game/scenePresentation";
import {
  canPerformSceneInteraction,
  getSceneInteractions,
  getSceneInteraction,
  getSceneInteractionTimeCost,
  type SceneInteraction,
} from "../game/sceneInteractions";
import { getLocationTransitionEvent } from "../game/transitionEvents";
import {
  getCharacterPortraitUrl,
  getClockImageUrl,
  getFilmLoopFrameUrls,
  getImageUrl,
  getSceneBackgroundUrl,
} from "../media/imageManifest";
import { getIntroAudioUrl } from "../media/audioManifest";
import { LocationMusicPlayer } from "../media/LocationMusicPlayer";
import { getClockTickUrl } from "../media/musicManifest";
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
  heard_scraping_behind_bookcase:
    "En skrabende lyd kom fra bogreolen i læsesalen",
  noticed_laura_disappear_near_reading_room:
    "Laura forsvandt fra gangen uden at bruge en dør",
  laura_used_secret_passage:
    "Laura benytter den skjulte passage ved bogreolen",
  ryan_and_laura_were_together: "Ryan og Laura har været kærester",
  ryan_left_laura: "Ryan forlod Laura",
  secret_passage_exists: "Der findes en skjult passage",
  laura_was_in_institution: "Laura har været på en institution",
  laura_owns_polar_bear_necklace: "Laura ejer isbjørnehalskæden",
  ryan_was_murdered: "Ryan bliver myrdet",
  killer_dropped_necklace: "Morderen tabte en halskæde",
  necklace_connects_laura_to_scene: "Halskæden forbinder Laura med gerningsstedet",
  laura_confessed: "Laura har tilstået",
  ryan_dismissed_warning: "Ryan afviser advarslen",
  ryan_was_saved: "Mordet på Ryan er forhindret",
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
  kind: "move" | "talk" | "inspect" | "quit" | "wait",
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

function toolbarButton(
  label: string,
  normalImage: Parameters<typeof getImageUrl>[0],
  hoverImage: Parameters<typeof getImageUrl>[0],
  rectangle: DirectorRect,
  onClick: () => void,
): HTMLButtonElement {
  const element = button("", "scene-toolbar-button", onClick);
  element.ariaLabel = label;
  element.title = label;
  element.dataset.hotspotLabel = label;
  element.setAttribute("style", directorRectStyle(rectangle));

  const normal = document.createElement("img");
  normal.className = "scene-toolbar-icon scene-toolbar-icon--normal";
  normal.src = getImageUrl(normalImage);
  normal.alt = "";
  normal.ariaHidden = "true";

  const hover = document.createElement("img");
  hover.className = "scene-toolbar-icon scene-toolbar-icon--hover";
  hover.src = getImageUrl(hoverImage);
  hover.alt = "";
  hover.ariaHidden = "true";

  element.append(normal, hover);
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

function renderMainMenu(root: HTMLElement, store: GameStore): void {
  const defaultCase = getCaseDefinition(DEFAULT_CASE_ID);
  const mysteryAvailable = getMysteryCaseIds().length > 0;

  root.innerHTML = `
    <main class="app-shell menu-shell">
      <section class="main-menu" aria-labelledby="main-menu-title">
        <img
          class="main-menu-background"
          src="${getImageUrl("sektorA1")}"
          alt=""
          aria-hidden="true"
        />
        <div class="main-menu-copy">
          <p class="eyebrow">Den restaurerede Director-fortælling</p>
          <h1 id="main-menu-title">Saving Ryan</h1>
          <p class="main-menu-intro">
            Gennemlev dagen igen og igen, saml sporene og stands mordet,
            før det sker.
          </p>
          <div class="case-options">
            <article class="case-option">
              <p class="eyebrow">Standard</p>
              <h2>${defaultCase.menu.title}</h2>
              <p>${defaultCase.menu.description}</p>
              <button
                class="primary-action"
                type="button"
                data-start-default-case
              >
                Start spil
              </button>
            </article>
            <article class="case-option case-option--mystery">
              <p class="eyebrow">Kuraterede variationer</p>
              <h2>Mystisk case</h2>
              <p id="mystery-case-description">
                ${
                  mysteryAvailable
                    ? "Vælg en håndskrevet alternativ sag uden at kende gerningspersonen på forhånd."
                    : "Den første alternative sag tilføjes som næste fortælletrin."
                }
              </p>
              <button
                class="secondary-action"
                type="button"
                data-start-mystery-case
                aria-describedby="mystery-case-description"
                ${mysteryAvailable ? "" : "disabled"}
              >
                Mystisk case
              </button>
            </article>
          </div>
        </div>
      </section>
    </main>
  `;

  root
    .querySelector("[data-start-default-case]")
    ?.addEventListener("click", () => {
      store.dispatch({
        type: "START_CASE",
        caseId: DEFAULT_CASE_ID,
      });
    });

  root
    .querySelector("[data-start-mystery-case]")
    ?.addEventListener("click", () => {
      const caseId = selectMysteryCaseId();
      if (caseId) {
        store.dispatch({ type: "START_CASE", caseId });
      }
    });
}

function renderIntro(root: HTMLElement, store: GameStore): void {
  const scoreElement = (
    image: string,
    alt: string,
    style: string,
    className = "",
  ): string => `
    <img
      class="intro-score-element ${className}"
      src="${getImageUrl(image as Parameters<typeof getImageUrl>[0])}"
      alt="${alt}"
      style="${style}"
    />
  `;
  const titleDuration =
    INTRO_SCORE.titleFrames * INTRO_SCORE.millisecondsPerFrame;
  const titleElements = INTRO_SCORE.title.map(({ image, alt, rect }) =>
    scoreElement(
      image,
      alt,
      `${directorRectStyle(rect)};--intro-delay:0ms;--intro-duration:${titleDuration}ms`,
      "intro-title-element",
    )
  ).join("");
  const creditElements = INTRO_SCORE.credits.map((credit, index) => {
    const startsAt =
      (credit.startsAtFrame - 1) * INTRO_SCORE.millisecondsPerFrame;
    const next = INTRO_SCORE.credits[index + 1];
    const endsAt = next
      ? (next.startsAtFrame - 1) * INTRO_SCORE.millisecondsPerFrame
      : (INTRO_SCORE.final.startsAtFrame - 1) *
        INTRO_SCORE.millisecondsPerFrame;
    const timing =
      `--intro-delay:${startsAt}ms;--intro-duration:${endsAt - startsAt}ms`;
    return `
      <div
        class="intro-credit-card${index === INTRO_SCORE.credits.length - 1 ? " intro-last-credit" : ""}"
        aria-label="${credit.character}, spillet af ${credit.actor}"
        style="${timing}"
      >
        ${scoreElement(
          credit.portrait.image,
          "",
          directorRectStyle(credit.portrait.rect),
        )}
        ${scoreElement(
          credit.title.image,
          "",
          directorRectStyle(credit.title.rect),
        )}
        ${scoreElement(
          credit.actorTitle.image,
          "",
          directorRectStyle(credit.actorTitle.rect),
        )}
      </div>
    `;
  }).join("");
  const finalStartsAt =
    (INTRO_SCORE.final.startsAtFrame - 1) *
    INTRO_SCORE.millisecondsPerFrame;
  const finalFadeDuration =
    (INTRO_SCORE.final.fullyVisibleAtFrame -
      INTRO_SCORE.final.startsAtFrame) *
    INTRO_SCORE.millisecondsPerFrame;
  const finalElement = `
    <div
      class="intro-final-card"
      style="--intro-delay:${finalStartsAt}ms;--intro-duration:${finalFadeDuration}ms"
    >
      ${scoreElement(
        INTRO_SCORE.final.image,
        INTRO_SCORE.final.alt,
        directorRectStyle(INTRO_SCORE.final.rect),
        "intro-final-image",
      )}
    </div>
  `;

  root.innerHTML = `
    <main class="app-shell">
      <section class="stage intro-stage" aria-labelledby="game-title">
        <h1 class="visually-hidden" id="game-title">Saving Ryan</h1>
        <div class="intro-score" aria-label="Original Director-intro">
          ${titleElements}
          ${creditElements}
          ${finalElement}
        </div>
        <audio
          data-intro-audio
          preload="auto"
          src="${getIntroAudioUrl()}"
        ></audio>
        <div class="intro-controls">
          <p aria-live="polite" data-intro-status hidden></p>
          <div>
            <button
              class="primary-action"
              type="button"
              data-play-intro
              hidden
            >
              Start intro
            </button>
            <button class="secondary-action" type="button" data-skip-intro>
              Spring introen over
            </button>
          </div>
        </div>
      </section>
    </main>
  `;

  const stage = root.querySelector<HTMLElement>(".intro-stage");
  const audio = root.querySelector<HTMLAudioElement>("[data-intro-audio]");
  const playButton = root.querySelector<HTMLButtonElement>(
    "[data-play-intro]",
  );
  const skipButton = root.querySelector<HTMLButtonElement>(
    "[data-skip-intro]",
  );
  const status = root.querySelector<HTMLElement>("[data-intro-status]");
  let scoreStarted = false;
  let scoreComplete = false;
  let prologueVisible = false;

  const beginGame = (): void => {
    store.dispatch({ type: "INTRO_FINISHED" });
  };
  const showPrologue = (): void => {
    if (prologueVisible) {
      return;
    }
    prologueVisible = true;
    audio?.pause();
    root.innerHTML = `
      <main class="app-shell">
        <section
          class="stage story-prologue"
          aria-labelledby="story-prologue-title"
          tabindex="0"
        >
          <article>
            <p class="eyebrow">Den første dag</p>
            <h1 id="story-prologue-title">Mordet, der endnu ikke er sket</h1>
            ${START_PROLOGUE_PARAGRAPHS.map(
              (paragraph) => `<p>${paragraph}</p>`,
            ).join("")}
            <p class="prologue-continue">Klik for at begynde</p>
          </article>
        </section>
      </main>
    `;

    const prologue = root.querySelector<HTMLElement>(".story-prologue");
    prologue?.addEventListener("click", beginGame, { once: true });
    prologue?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        beginGame();
      }
    });
    prologue?.focus();
  };
  const finishScore = (): void => {
    if (!stage?.isConnected) {
      return;
    }
    scoreComplete = true;
    stage.classList.add("is-complete");
    stage.ariaLabel = "Introen er færdig. Klik for at fortsætte.";
  };

  const startScore = async (): Promise<void> => {
    if (scoreStarted || prologueVisible || !audio) {
      return;
    }

    try {
      await audio.play();
      if (!stage?.isConnected || prologueVisible) {
        audio.pause();
        return;
      }
      scoreStarted = true;
      stage.classList.add("is-playing");
      if (status) {
        status.hidden = true;
      }
      if (playButton) {
        playButton.hidden = true;
      }
      window.setTimeout(finishScore, INTRO_DURATION_MILLISECONDS);
    } catch {
      if (status?.isConnected) {
        status.hidden = false;
        status.textContent =
          "Browseren kræver et klik, før introen kan starte.";
      }
      if (playButton?.isConnected) {
        playButton.hidden = false;
      }
    }
  };

  stage?.addEventListener("click", () => {
    if (scoreComplete) {
      showPrologue();
    }
  });
  playButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    void startScore();
  });
  skipButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    showPrologue();
  });
  void startScore();
}

export function getNotebookKnowledgeIds(
  state: Pick<GameState, "knowledge">,
): KnowledgeId[] {
  return Object.entries(state.knowledge).filter(([, known]) => known)
    .map(([id]) => id as KnowledgeId);
}

function renderKnowledge(state: GameState): string {
  const discoveries = getNotebookKnowledgeIds(state);

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

    completion = getDialogueSequenceCompletion(
      questionResult.status,
      answerResult.status,
    );
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
  const refusesFurtherDialogue =
    state.loopState.dialogue.refusesFurtherDialogue.includes(person);

  root.innerHTML = `
    <main class="app-shell dialogue-shell">
      <header class="game-header">
        <div>
          <p class="eyebrow">Samtale i ${scene.location.name}</p>
          <h1>${person}</h1>
        </div>
        <dl class="status-strip">
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
          <p class="dialogue-status" aria-live="polite" data-dialogue-status>${
            refusesFurtherDialogue
              ? `${person} vil ikke tale mere med Jørgen i dag efter anklagen.`
              : ""
          }</p>
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
    const asked = state.loopState.dialogue.askedChoices.includes(
      choice.id,
    );
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

function renderEnding(
  root: HTMLElement,
  state: GameState,
  store: GameStore,
): void {
  root.innerHTML = `
    <main class="app-shell ending-shell">
      <section class="ending-card" aria-labelledby="ending-title">
        <div class="ending-image">
          <img
            src="${getSceneBackgroundUrl("A1")}"
            alt="Kantinen efter det afværgede mord"
          />
        </div>
        <div class="ending-copy">
          <p class="eyebrow">Sagen er opklaret</p>
          <h1 id="ending-title">Ryan er reddet</h1>
          <p>
            For første gang fortsætter dagen uden mordet. Jørgen kendte
            motivet, beviset og vejen til afsatsen, og nåede derfor at
            standse Laura, før hun kunne skubbe Ryan.
          </p>
          <p>
            Tidsløkken har ført Jørgen tilbage til det øjeblik, hvor hans
            viden kunne ændre udfaldet.
          </p>
          <dl class="status-strip ending-status">
            <div><dt>Dage</dt><dd>${state.loop}</dd></div>
            <div><dt>Udfald</dt><dd>Ryan lever</dd></div>
          </dl>
          <button class="primary-action" type="button" data-restart>
            Tilbage til hovedmenuen
          </button>
        </div>
      </section>
    </main>
  `;

  root.querySelector("[data-restart]")?.addEventListener("click", () => {
    store.dispatch({ type: "RESET_GAME" });
  });
}

async function playSceneInteraction(
  interaction: SceneInteraction,
  store: GameStore,
  narrativeHost: NarrativeHost,
): Promise<void> {
  const canPerform = canPerformSceneInteraction(
    store.getState(),
    interaction,
  );
  const cue = canPerform ? interaction.cue : interaction.blockedCue;
  if (cue) {
    const result = await narrativeHost.play(cue);
    if (!isCompletedPlayback(result.status)) {
      return;
    }
  }

  if (canPerform) {
    store.dispatch({
      type: "PERFORM_INTERACTION",
      id: interaction.id,
    });
  }
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

  const specialCue =
    pending.cause.kind === "clock"
      ? getLocationTransitionEvent(pending.cause.eventId).specialCue
      : undefined;
  if (!specialCue) {
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

  const result = await narrativeHost.play(specialCue);
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
  musicPlayer: LocationMusicPlayer,
  clockAudio: HTMLAudioElement,
): void {
  const sceneId = toSceneId(state.location, state.timeSlot);
  const scene = getScene(sceneId);
  const presentation = getScenePresentation(sceneId);
  const manualInteractions = getSceneInteractions(sceneId, "manual").filter(
    (interaction) =>
      canPerformSceneInteraction(state, interaction) ||
      interaction.blockedCue !== undefined,
  );
  const replacedInteractionIds = new Set(
    manualInteractions.flatMap(
      (interaction) => interaction.replaces ?? [],
    ),
  );
  const visibleManualInteractions = manualInteractions.filter(
    (interaction) => !replacedInteractionIds.has(interaction.id),
  );
  const pending = state.pendingTransition;
  const transitionCue = pending
    ? pending.cause.kind === "clock"
      ? getLocationTransitionEvent(pending.cause.eventId).cue
      : getSceneInteraction(pending.cause.id).timeAdvanceCue
    : undefined;
  const transitionText = transitionCue?.text ?? null;
  const transitionTarget = pending ? getScene(pending.to) : null;
  const transitionKind = pending?.cause.kind ?? null;

  root.innerHTML = `
    <main class="app-shell">
      <header class="game-header">
        <div>
          <p class="eyebrow">Saving Ryan</p>
          <h1>${scene.location.name}</h1>
        </div>
        <dl class="status-strip">
          <div><dt>Tid</dt><dd>${scene.time.name}</dd></div>
          <div><dt>Dag</dt><dd>${state.loop}</dd></div>
        </dl>
      </header>

      <section class="game-layout">
        <div class="stage exploration-stage" aria-label="${scene.location.name}, ${scene.time.name}">
          <img
            class="director-stage-background"
            src="${getImageUrl("baggrund")}"
            alt=""
            aria-hidden="true"
          />
          <img
            class="scene-background"
            style="${directorRectStyle(DIRECTOR_STAGE.background)}"
            src="${getSceneBackgroundUrl(scene.id)}"
            alt="Original scene fra ${scene.location.name}"
          />
          <div data-film-loop></div>
          <p class="hotspot-info" aria-live="polite" data-hotspot-info></p>
          <div class="hotspot-layer" data-hotspot-layer></div>
          <div class="legacy-help" data-legacy-help hidden>
            <div role="dialog" aria-modal="true" aria-labelledby="legacy-help-title">
              <p class="eyebrow">Hjælp fra Director-udgaven</p>
              <h2 id="legacy-help-title">Sådan spiller du</h2>
              <ul>
                <li>Uret lader tiden gå ét interval fra det sted, hvor Jørgen står.</li>
                <li>Bevæg markøren over billedet for at finde personer, døre og spor.</li>
                <li>Noden tænder og slukker for musikken.</li>
                <li>Videoer og tekstsekvenser kan springes over.</li>
                <li>Jørgens viden bevares, når dagen begynder forfra.</li>
              </ul>
              <button class="primary-action" type="button" data-close-help>
                Tilbage til spillet
              </button>
            </div>
          </div>
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
                <p class="eyebrow">${
                  transitionKind === "interaction"
                    ? "Tidskrævende handling"
                    : "Tiden går"
                }</p>
                <h2 id="transition-title">${transitionTarget?.time.name ?? scene.time.name}</h2>
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
  const defaultHotspotLabel = "";
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
    const interaction = visibleManualInteractions.find(
      ({ id }) => id === interactionId,
    );
    if (interaction) {
      const canPerform = canPerformSceneInteraction(state, interaction);
      const timeCost = canPerform
        ? getSceneInteractionTimeCost(state, interaction)
        : 0;
      const nextTime =
        timeCost === 1
          ? getScene(
              toSceneId(
                state.location,
                getNextTimeSlot(state.timeSlot),
              ),
            ).time.name
          : null;
      const label = nextTime
        ? `${interaction.label} — bruger tid frem til ${nextTime.toLowerCase()}`
        : interaction.label;
      const hotspot = hotspotButton(label, "inspect", rect, () => {
        void playSceneInteraction(
          interaction,
          store,
          narrativeHost,
        );
      });
      if (timeCost === 1) {
        hotspot.classList.add("scene-hotspot--timed");
      }
      appendHotspot(hotspot);
    }
  });

  const helpPanel = root.querySelector<HTMLElement>("[data-legacy-help]");
  const helpButton = toolbarButton(
    "Vis hjælp",
    "tegn-sp",
    "tegn-sp2",
    DIRECTOR_TOOL_RECTS.help,
    () => {
      if (helpPanel) {
        helpPanel.hidden = false;
        helpPanel.querySelector<HTMLButtonElement>("[data-close-help]")?.focus();
      }
    },
  );
  appendHotspot(helpButton);

  let musicButton: HTMLButtonElement;
  const refreshMusicButton = (showStatus = false): void => {
    const musicState = musicPlayer.getState();
    const label = musicState.muted ? "Tænd musik" : "Sluk musik";
    const icon = musicState.muted ? "tegn-musik2" : "tegn-musik";
    musicButton.ariaLabel = label;
    musicButton.title = label;
    musicButton.dataset.hotspotLabel = label;
    musicButton.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
      image.src = getImageUrl(icon);
    });
    if (infoBox && showStatus) {
      infoBox.textContent = musicState.muted
        ? "Musikken er slået fra"
        : "Musikken er slået til";
    }
  };
  musicButton = toolbarButton(
    "Sluk musik",
    "tegn-musik",
    "tegn-musik",
    DIRECTOR_TOOL_RECTS.music,
    () => {
      musicPlayer.toggleMuted();
      refreshMusicButton(true);
    },
  );
  refreshMusicButton();
  appendHotspot(musicButton);

  appendHotspot(
    toolbarButton(
      "Afslut og begynd forfra",
      "tegn-afslut",
      "tegn-afslut2",
      DIRECTOR_TOOL_RECTS.quit,
      () => {
        if (window.confirm("Vil du forlade spillet og gå til hovedmenuen?")) {
          store.dispatch({ type: "RESET_GAME" });
        }
      },
    ),
  );

  helpPanel
    ?.querySelector("[data-close-help]")
    ?.addEventListener("click", () => {
      helpPanel.hidden = true;
      helpButton.focus();
    });

  const clockHotspot = hotspotButton(
    getWaitActionLabel(state.location, state.timeSlot),
    "wait",
    {
      x: presentation.clock.centerX - presentation.clock.width / 2,
      y: presentation.clock.centerY - presentation.clock.height / 2,
      width: presentation.clock.width,
      height: presentation.clock.height,
    },
    () => {
      clockAudio.currentTime = 0;
      void clockAudio.play().catch(() => {});
      store.dispatch({ type: "WAIT" });
    },
  );
  const clockImage = clockHotspot.querySelector("img");
  if (clockImage) {
    clockImage.src = getClockImageUrl(state.timeSlot);
  }
  appendHotspot(clockHotspot);

  root.querySelector("[data-dismiss]")?.addEventListener("click", () => {
    clockAudio.pause();
    clockAudio.currentTime = 0;
    void completePendingTransition(root, store, narrativeHost);
  });
}

export function mountApp(root: HTMLElement, store: GameStore): () => void {
  const appView = document.createElement("div");
  appView.dataset.appView = "";

  const musicAudio = document.createElement("audio");
  musicAudio.dataset.locationMusic = "";
  const musicPlayer = new LocationMusicPlayer(musicAudio);

  const clockAudio = document.createElement("audio");
  clockAudio.dataset.clockTick = "";
  clockAudio.preload = "auto";
  clockAudio.src = getClockTickUrl();

  const mediaHost = document.createElement("section");
  mediaHost.dataset.mediaHost = "";
  const narrativeHost = new NarrativeHost(mediaHost, (active) => {
    musicPlayer.setDucked(active);
  });

  root.replaceChildren(appView, mediaHost, musicAudio, clockAudio);

  const unsubscribe = store.subscribe((state) => {
    if (state.pendingTransition === null) {
      clockAudio.pause();
      clockAudio.currentTime = 0;
    }

    musicPlayer.setLocation(
      state.phase === "exploration" || state.phase === "dialogue"
        ? state.location
        : null,
    );

    if (state.phase === "menu") {
      renderMainMenu(appView, store);
      return;
    }

    if (state.phase === "intro") {
      renderIntro(appView, store);
      return;
    }

    if (state.phase === "dialogue") {
      renderDialogue(appView, state, store, narrativeHost);
      return;
    }

    if (state.phase === "ending") {
      renderEnding(appView, state, store);
      return;
    }

    renderExploration(
      appView,
      state,
      store,
      narrativeHost,
      musicPlayer,
      clockAudio,
    );
  });

  return () => {
    unsubscribe();
    narrativeHost.destroy();
    musicPlayer.destroy();
    clockAudio.pause();
    clockAudio.removeAttribute("src");
    clockAudio.load();
    root.replaceChildren();
  };
}
