import type { GameStore } from "../app/gameStore";
import type { GameState, KnowledgeId } from "../app/types";
import {
  getScene,
  LOCATIONS,
  toSceneId,
} from "../game/sceneRegistry";
import { getSceneInteractions } from "../game/sceneInteractions";
import { TRANSITION_TEXT } from "../game/transitionText";
import { getSceneBackgroundUrl } from "../media/imageManifest";

const CLUE_LABELS: Readonly<Record<KnowledgeId, string>> = {
  barbara_is_computer_expert: "Barbara er computerekspert",
  barbara_hacker_alias_intruder: "Barbara bruger hackernavnet Intruder",
  barbara_forged_grades: "Barbara har ændret sine karakterer",
  ryan_has_girlfriend_sarah: "Ryan har en kæreste, Sarah",
  ryan_bullied_marie: "Ryan behandler Marie ondt",
  laura_hid_computer_activity: "Laura skjuler sin computeraktivitet",
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

function renderExploration(root: HTMLElement, state: GameState, store: GameStore): void {
  const sceneId = toSceneId(state.location, state.timeSlot);
  const scene = getScene(sceneId);
  const manualInteractions = getSceneInteractions(sceneId, "manual").filter(
    ({ effects }) =>
      effects.some(
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
            src="${getSceneBackgroundUrl(scene.id)}"
            alt="Original scene fra ${scene.location.name}"
          />
          <div class="scene-vignette" aria-hidden="true"></div>
          <div class="scene-copy">
            <p class="scene-code">${scene.id}</p>
            <h2>${scene.location.name}</h2>
            <p>${scene.time.name}</p>
          </div>
          <div class="stage-actions" data-stage-actions></div>
        </div>

        <aside class="notebook" aria-labelledby="notebook-title">
          <p class="eyebrow">Jørgens noter</p>
          <h2 id="notebook-title">Spor</h2>
          ${renderKnowledge(state)}
        </aside>
      </section>

      <nav class="location-nav" aria-label="Gå til et andet lokale" data-location-nav></nav>

      ${
        transitionText
          ? `<div class="transition-dialog" role="dialog" aria-modal="true" aria-labelledby="transition-title">
              <div>
                <p class="eyebrow">Tiden går</p>
                <h2 id="transition-title">${scene.time.name}</h2>
                <p>${transitionText}</p>
                <button class="primary-action" type="button" data-dismiss>Fortsæt</button>
              </div>
            </div>`
          : ""
      }
    </main>
  `;

  const stageActions = root.querySelector("[data-stage-actions]");
  if (stageActions) {
    manualInteractions.forEach((interaction) => {
      stageActions.append(
        button(interaction.label, "secondary-action", () => {
          store.dispatch({
            type: "PERFORM_INTERACTION",
            id: interaction.id,
          });
        }),
      );
    });

    stageActions.append(
      button("Vent et tidsinterval", "clock-action", () => {
        store.dispatch({ type: "WAIT" });
      }),
    );
  }

  const navigation = root.querySelector("[data-location-nav]");
  LOCATIONS.forEach((location) => {
    navigation?.append(
      button(
        location.shortName,
        "location-action",
        () => {
          store.dispatch({
            type: "MOVE_TO_LOCATION",
            location: location.id,
          });
        },
        location.id === state.location,
      ),
    );
  });

  root.querySelector("[data-dismiss]")?.addEventListener("click", () => {
    store.dispatch({ type: "COMPLETE_TRANSITION" });
  });
}

export function mountApp(root: HTMLElement, store: GameStore): () => void {
  const appView = document.createElement("div");
  appView.dataset.appView = "";

  const mediaHost = document.createElement("section");
  mediaHost.className = "media-host";
  mediaHost.dataset.mediaHost = "";
  mediaHost.hidden = true;
  mediaHost.setAttribute("aria-label", "Videoafspiller");

  const video = document.createElement("video");
  video.dataset.videoPlayer = "";
  video.controls = true;
  video.playsInline = true;
  video.preload = "metadata";
  mediaHost.append(video);

  root.replaceChildren(appView, mediaHost);

  const unsubscribe = store.subscribe((state) => {
    if (state.phase === "intro") {
      renderIntro(appView, store);
      return;
    }

    renderExploration(appView, state, store);
  });

  return () => {
    unsubscribe();
    root.replaceChildren();
  };
}
