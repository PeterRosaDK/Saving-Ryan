import type { GameStore } from "../app/gameStore";
import type {
  CharacterId,
  GameState,
  KnowledgeId,
} from "../app/types";
import {
  getDialogueSequenceCompletion,
  getAvailableDialogueChoices,
  hasSeenCurrentDialogueResponse,
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
  calculateCaseScore,
  DEFAULT_CASE_ID,
  getDirectorsCutCaseOverride,
  getCaseDefinition,
  getMysteryCaseIds,
  isDirectorsCutQaMenuEnabled,
  selectDirectorsCutCase,
} from "../game/caseDefinitions";
import {
  getDirectorsCutCaseContent,
  isDirectorsCutCaseId,
} from "../game/directorsCutCaseContent";
import { textCue } from "../media/narrativeCue";
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
  sarah_left_david_for_ryan: "Sarah forlod David for Ryan",
  laura_dropped_necklace: "Laura tabte halskæden i gangen",
  david_picked_up_necklace: "David samlede halskæden op",
  necklace_found_in_ryans_hand:
    "Halskæden blev fundet i Ryans hånd efter faldet",
  david_followed_ryan:
    "David fulgte Ryan ind i læsesalen kort før mordet",
  david_motive_conclusion:
    "Ryan tog Sarah fra David. David havde et stærkt personligt motiv til at konfrontere ham.",
  david_necklace_possession_conclusion:
    "Halskæden peger ikke automatisk på Laura. David samlede den op og var den sidste kendte person, der havde den før mordet.",
  david_opportunity_conclusion:
    "David fulgte Ryan ind i læsesalen få minutter før faldet. Han var den sidste kendte person, der gik efter Ryan.",
  marie_says_david_was_hurt:
    "Marie så, at David var knust efter bruddet",
  david_lied_about_ryan:
    "David nedtoner, at han fulgte lige efter Ryan",
  david_confessed: "David har tilstået",
  david_murder_method_known:
    "David fulgte Ryan gennem den skjulte passage og skubbede ham impulsivt",
  david_reconstruction_recorded:
    "Jørgens private rekonstruktion er gemt",
  david_prevention_plan:
    "Plan: Stands David ved bogreolen i læsesalen ved middag",
  barbara_blackmailed_by_ryan:
    "Ryan afpressede Barbara med de ændrede karakterer",
  laura_put_necklace_in_bag:
    "Laura lagde den løse halskæde i yderlommen på sin taske",
  necklace_missing_from_laura_bag:
    "Halskæden forsvandt fra Lauras taske før mordet",
  barbara_had_access_to_laura_bag:
    "Barbara var den sidste ved Lauras efterladte taske",
  barbara_opened_plans_before_murder:
    "Barbara åbnede bygningstegningerne før mordet",
  building_plans_show_passage:
    "Tegningerne viser passagen fra læsesalen til afsatsen",
  barbara_saved_necklace_image_before_murder:
    "Barbara gemte billedet af Lauras halskæde før mordet",
  barbara_left_with_ryan:
    "Barbara og Ryan forlod computerrummet sammen",
  barbara_alibi_gap:
    "Barbaras forklaring efterlader et hul før mordet",
  barbara_presented_image_as_new:
    "Barbara præsenterede halskædebilledet som et nyt fund",
  barbara_timestamps_compared:
    "Tidsstemplerne viser, at Barbaras fund var forberedt",
  laura_private_history_not_evidence:
    "Lauras private sygehistorie er ikke et bevis på mord",
  barbara_motive_conclusion:
    "Ryan afpressede Barbara med karaktersvindlen og gav hende et motiv",
  barbara_opportunity_conclusion:
    "Barbara fulgtes med Ryan og har et uforklaret tidsrum før mordet",
  barbara_passage_conclusion:
    "Barbara kendte den skjulte rute til afsatsen før mordet",
  barbara_staging_conclusion:
    "Barbara stjal halskæden og forberedte Laura som syndebuk",
  marie_saw_barbara_by_bag:
    "Marie så Barbara alene ved Lauras taske",
  david_saw_barbara_lead_ryan:
    "David så Barbara føre Ryan mod læsesalen",
  barbara_confessed: "Barbara har tilstået",
  barbara_murder_method_known:
    "Barbara førte Ryan gennem passagen, gav ham halskæden og skubbede ham",
  barbara_reconstruction_recorded:
    "Jørgens private Barbara-rekonstruktion er gemt",
  barbara_prevention_plan:
    "Plan: Vent ved bogreolen i læsesalen ved middag",
  marie_wrote_report:
    "Marie har skrevet analysen og gennemrettet centrale dele af rapporten",
  ryan_claimed_marie_work:
    "Ryan tager æren for Maries arbejde",
  ryan_threatened_remove_marie_credit:
    "Ryan vil fjerne Maries navn fra hendes eget arbejde",
  ryan_threatened_laura:
    "Ryan truer med at bruge Lauras private fortid mod Marie og Laura",
  marie_discovered_passage:
    "Marie kendte den skjulte passage før mordet",
  marie_left_group_before_scream:
    "Marie forlod grupperummet kort før skriget",
  marie_claimed_no_absence:
    "Marie påstår, at hun kun var væk et øjeblik",
  marie_fragment_in_ryan_hand:
    "Ryan døde med et friskrevet papirfragment i hånden",
  marie_fragment_has_edits:
    "Fragmentet bærer Maries karakteristiske rettelser og initialer",
  marie_torn_page_in_folder:
    "Maries mappe indeholder resten af den friskrevne side",
  marie_returned_dusty:
    "Marie vendte rystet tilbage med støv fra læsesalen på tøjet",
  marie_motive_conclusion:
    "Ryan var ved at udslette Maries arbejde og bruge Lauras private fortid som våben. Marie havde et stærkt, personligt motiv til at standse ham.",
  marie_alibi_conclusion:
    "Marie var ikke i grupperummet under hele det afgørende tidsrum. Hendes alibi dækker ikke mordøjeblikket.",
  marie_passage_conclusion:
    "Marie kendte passagen, før Ryan døde. Hun kunne nå afsatsen uden at blive set på den normale vej.",
  marie_physical_conclusion:
    "Papiret i Ryans hånd blev revet direkte fra Maries side. De må have været i fysisk kontakt umiddelbart før faldet.",
  marie_confessed: "Marie har tilstået",
  marie_murder_method_known:
    "Marie fulgte Ryan gennem passagen og skubbede ham i affekt",
  marie_reconstruction_recorded:
    "Jørgens private Marie-rekonstruktion er gemt",
  marie_prevention_plan:
    "Plan: Sikr Maries arbejde og stands mødet ved passagen",
  marie_work_secured:
    "Maries arbejde er tidsstemplet og anerkendt foran gruppen",
  jorgen_prior_loop_reference_ready:
    "En faktisk rute fra det foregående loop er registreret",
  jorgen_note_references_previous_loop:
    "En anonym besked beskriver en handling, som kun jeg burde kunne huske",
  jorgen_unknown_knows_routes:
    "Den ukendte kender mine ruter og vaner",
  jorgen_other_remembers_conclusion:
    "Nogen ud over mig husker dagene.",
  jorgen_login_used:
    "Mit login blev brugt ved læsesalen uden min tilstedeværelse",
  jorgen_lookalike_seen:
    "Et vidne så en person, der lignede mig, ved læsesalen",
  jorgen_player_alibi:
    "Mine egne registrerede handlinger placerer mig et andet sted",
  jorgen_identity_used_conclusion:
    "Den ukendte bruger min identitet.",
  jorgen_npc_alibis_hold:
    "Alle de mennesker, jeg kan anklage, kan ikke have stået bag Ryan",
  jorgen_passage_test_placed:
    "Et dateret mærke er placeret i passagen med en kontrol udenfor",
  jorgen_passage_marker_survived:
    "Det daterede mærke inde i passagen overlevede reset",
  jorgen_outside_control_reset:
    "Kontrolmærket udenfor passagen blev nulstillet",
  jorgen_unknown_in_passage_at_reset:
    "Et bevaret fodspor viser, at den ukendte var i passagen under reset",
  jorgen_passage_persistence_conclusion:
    "Passagen står delvist uden for dagens reset.",
  jorgen_fragment_in_ryan_hand:
    "Ryan døde med en side fra mine egne noter i hånden",
  jorgen_fragment_handwriting:
    "Fragmentet er skrevet med min håndskrift",
  jorgen_current_page_intact:
    "Min tilsvarende noteside er stadig intakt",
  jorgen_fragment_future_knowledge:
    "Fragmentet indeholder viden, jeg først fik efter mordet",
  jorgen_fragment_from_future_conclusion:
    "Fragmentet kommer ikke fra min fortid. Det kommer fra min fremtid.",
  jorgen_later_self_exists_conclusion:
    "Hvis et menneske bliver i passagen under reset, kan næste morgen skabe en ny Jørgen uden at fjerne den gamle.",
  jorgen_ryan_called_with_fragment:
    "Ryan kaldte specifikt på mig, fordi nogen havde vist ham siden",
  jorgen_future_self_murderer_conclusion:
    "Morderen er mig — men ikke endnu.",
  jorgen_revelation_completed:
    "Jeg har konfronteret den senere Jørgen i passagen",
  jorgen_reconstruction_recorded:
    "Jørgens private paradoksrekonstruktion er gemt",
  jorgen_prevention_plan:
    "Plan: Plant en falsk forventning og vælg derefter en anden rute",
  jorgen_decoy_planted:
    "Den falske plan ligger, hvor min senere udgave vil læse den",
  jorgen_later_self_dissolved:
    "Den senere Jørgen forsvandt, da mordet blev forhindret",
  jorgen_paradox_broken:
    "Det selvskabte mordparadoks er brudt",
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
  const firstDirectorsCutCase = getMysteryCaseIds()[0];
  const directorsCut = getCaseDefinition(
    firstDirectorsCutCase ?? DEFAULT_CASE_ID,
  );
  const qaMenuEnabled = isDirectorsCutQaMenuEnabled(
    window.location.search,
  );
  const requestedCaseId = getDirectorsCutCaseOverride(
    window.location.search,
  );
  const qaCaseOptions = getMysteryCaseIds()
    .map((caseId) => {
      const definition = getCaseDefinition(caseId);
      return `<option value="${caseId}"${
        requestedCaseId === caseId ? " selected" : ""
      }>${definition.murderer}-sagen</option>`;
    })
    .join("");

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
              <p class="eyebrow">Kanonisk forløb</p>
              <h2>${defaultCase.menu.title}</h2>
              <p>${defaultCase.menu.description}</p>
              <button
                class="primary-action"
                type="button"
                data-start-default-case
              >
                Original historie
              </button>
            </article>
            <article class="case-option case-option--mystery">
              <p class="eyebrow">Alternative sager</p>
              <h2>${directorsCut.menu.title}</h2>
              <p id="mystery-case-description">
                ${directorsCut.menu.description}
              </p>
              ${
                qaMenuEnabled
                  ? `<div class="qa-case-picker">
                      <label for="qa-case-select">Skjult testvalg</label>
                      <select id="qa-case-select" data-qa-case-select>
                        <option value=""${
                          requestedCaseId === null ? " selected" : ""
                        }>Tilfældig case</option>
                        ${qaCaseOptions}
                      </select>
                      <small>Kun synlig med <code>?qa=1</code>. Valget opdaterer test-URL’en.</small>
                    </div>`
                  : ""
              }
              <button
                class="secondary-action"
                type="button"
                data-start-mystery-case
                aria-describedby="mystery-case-description"
              >
                Director’s Cut
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

  const qaCaseSelect =
    root.querySelector<HTMLSelectElement>("[data-qa-case-select]");
  qaCaseSelect?.addEventListener("change", () => {
    const url = new URL(window.location.href);
    const caseId = qaCaseSelect.value.trim();
    if (caseId) {
      url.searchParams.set("dcCase", caseId);
    } else {
      url.searchParams.delete("dcCase");
    }
    window.history.replaceState(null, "", url);
  });

  root
    .querySelector("[data-start-mystery-case]")
    ?.addEventListener("click", () => {
      const selection = selectDirectorsCutCase({
        requestedCaseId: qaCaseSelect
          ? qaCaseSelect.value.trim() || null
          : getDirectorsCutCaseOverride(window.location.search),
      });
      if (selection.caseId) {
        if (selection.source === "qa") {
          const selectedCase = getCaseDefinition(selection.caseId);
          console.info(
            `[Saving Ryan QA] Tvunget Director’s Cut-case: ${selectedCase.id} (${selectedCase.menu.title}).`,
          );
        }
        store.dispatch({ type: "START_CASE", caseId: selection.caseId });
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

export function renderKnowledge(state: GameState): string {
  const discoveries = getNotebookKnowledgeIds(state);

  if (
    discoveries.length === 0 &&
    !isDirectorsCutCaseId(state.selectedCaseId)
  ) {
    return "<p class=\"empty-state\">Du har endnu ikke samlet nogen spor.</p>";
  }

  if (!isDirectorsCutCaseId(state.selectedCaseId)) {
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

  const caseContent = getDirectorsCutCaseContent(state.selectedCaseId);
  const conclusions = new Set<KnowledgeId>(caseContent.coreConclusions);
  const hiddenSystemKnowledge = new Set<KnowledgeId>([
    caseContent.reconstructionKnowledgeId,
    caseContent.preventionPlanKnowledgeId,
    ...(caseContent.hiddenKnowledge ?? []),
  ]);
  const facts = discoveries.filter(
    (id) => !conclusions.has(id) && !hiddenSystemKnowledge.has(id),
  );
  const foundConclusions = discoveries.filter((id) =>
    conclusions.has(id),
  );
  const list = (ids: readonly KnowledgeId[]): string =>
    ids.length
      ? `<ul class="clue-list">${ids
          .map((id) => `<li><span>${CLUE_LABELS[id]}</span></li>`)
          .join("")}</ul>`
      : "<p class=\"empty-state\">Ingen endnu.</p>";

  return `
    <section class="notebook-section">
      <h3>Spor og fakta</h3>
      ${list(facts)}
    </section>
    <section class="notebook-section">
      <h3>Jørgens konklusioner</h3>
      ${list(foundConclusions)}
    </section>
    <section class="notebook-section notebook-lead">
      <h3>Aktuelt lead</h3>
      <p>${state.caseProgress.currentLead}</p>
    </section>
    ${
      state.caseProgress.reconstructionAvailable
        ? `<details class="reconstruction-notes">
            <summary>Læs den private rekonstruktion igen</summary>
            <ol>${caseContent.reconstructionCards.map(
              (card) => `<li>${card}</li>`,
            ).join("")}</ol>
          </details>`
        : ""
    }
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
    if (
      questionResult.status !== "aborted" &&
      choice.skipSummary
    ) {
      await narrativeHost.play(textCue(choice.skipSummary));
      store.dispatch({
        type: "COMPLETE_DIALOGUE_CHOICE",
        person,
        topic: choice.topic,
        completion: "skipped",
      });
      return;
    }
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
      if (
        answerResult.status !== "aborted" &&
        choice.skipSummary
      ) {
        await narrativeHost.play(textCue(choice.skipSummary));
        store.dispatch({
          type: "COMPLETE_DIALOGUE_CHOICE",
          person,
          topic: choice.topic,
          completion: "skipped",
        });
        return;
      }
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

  if (completion === "skipped" && choice.skipSummary) {
    await narrativeHost.play(textCue(choice.skipSummary));
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
    const visuallyAsked = hasSeenCurrentDialogueResponse(state, choice);
    options?.append(
      button(
        `${choice.isNewTopic && !asked ? "Nyt emne · " : ""}${choice.label}`,
        `dialogue-choice${visuallyAsked ? " is-asked" : ""}`,
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
  if (isDirectorsCutCaseId(state.selectedCaseId)) {
    const definition = getCaseDefinition(state.selectedCaseId);
    const caseContent = getDirectorsCutCaseContent(
      state.selectedCaseId,
    );
    const statistics = state.caseProgress.statistics;
    const optionalFound = caseContent.optionalEvidence.filter(
      (id) => state.knowledge[id],
    ).length;
    const score = calculateCaseScore(state);
    const title =
      score >= 1000
        ? caseContent.result?.topRating ?? "Skarp efterforsker"
        : score >= 750
          ? "Sagen løst"
          : "Vedholdende detektiv";
    const murdererLabel =
      caseContent.result?.murdererLabel ?? definition.murderer;
    const extraStatistics =
      caseContent.result?.extraStatistics
        ?.map(
          ({ label, value }) =>
            `<div><dt>${label}</dt><dd>${value}</dd></div>`,
        )
        .join("") ?? "";
    const playAgain = (): void => {
      store.dispatch({ type: "RESET_GAME" });
      const selection = selectDirectorsCutCase({
        requestedCaseId: getDirectorsCutCaseOverride(
          window.location.search,
        ),
      });
      if (selection.caseId) {
        if (selection.source === "qa") {
          const selectedCase = getCaseDefinition(selection.caseId);
          console.info(
            `[Saving Ryan QA] Nyt spil bruger tvunget case: ${selectedCase.id} (${selectedCase.menu.title}).`,
          );
        }
        store.dispatch({
          type: "START_CASE",
          caseId: selection.caseId,
        });
      }
    };
    root.innerHTML = `
      <main class="app-shell ending-shell">
        <section class="ending-card ending-card--results" aria-labelledby="ending-title" data-placeholder-asset-id="${caseContent.epilogueAssetId}">
          <div class="ending-copy">
            <p class="eyebrow">Director’s Cut · Epilog</p>
            <h1 id="ending-title">Sagen er opklaret</h1>
            ${caseContent.epilogue
              .map((paragraph) => `<p>${paragraph}</p>`)
              .join("")}
            <dl class="result-grid">
              <div><dt>Morder</dt><dd>${murdererLabel}</dd></div>
              <div><dt>Dage brugt</dt><dd>${state.loop}</dd></div>
              <div><dt>Konfrontationer</dt><dd>${statistics.confrontations}</dd></div>
              <div><dt>Forkerte anklager</dt><dd>${statistics.wrongAccusations}</dd></div>
              <div><dt>For tidlige anklager</dt><dd>${statistics.prematureAccusations}</dd></div>
              <div><dt>Afgørende konklusioner</dt><dd>${caseContent.coreConclusions.length}/${caseContent.coreConclusions.length}</dd></div>
              <div><dt>Ekstra spor</dt><dd>${optionalFound}/${caseContent.optionalEvidence.length}</dd></div>
              <div><dt>Score</dt><dd>${score} · ${title}</dd></div>
              ${extraStatistics}
            </dl>
            <p class="score-explanation">
              Par: ${definition.score.parDays} dage.
              Scoren justeres kun for ekstra dage, anklager og ekstra spor.
            </p>
            <div class="ending-actions">
              <button class="primary-action" type="button" data-play-again>Spil igen</button>
              <button class="secondary-action" type="button" data-restart>Tilbage til titel</button>
            </div>
          </div>
        </section>
      </main>
    `;
    root
      .querySelector("[data-play-again]")
      ?.addEventListener("click", playAgain);
    root.querySelector("[data-restart]")?.addEventListener("click", () => {
      store.dispatch({ type: "RESET_GAME" });
    });
    return;
  }

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

function renderReconstruction(
  root: HTMLElement,
  state: GameState,
  store: GameStore,
): void {
  if (!isDirectorsCutCaseId(state.selectedCaseId)) {
    return;
  }
  const caseContent = getDirectorsCutCaseContent(state.selectedCaseId);
  root.innerHTML = `
    <main class="app-shell reconstruction-shell">
      <section
        class="reconstruction-card"
        aria-labelledby="reconstruction-title"
        data-placeholder-asset-id="${caseContent.reconstructionAssetId}"
      >
        <p class="eyebrow">Jørgens private rekonstruktion</p>
        <h1 id="reconstruction-title">Sådan hænger sagen sammen</h1>
        <ol>
          ${caseContent.reconstructionCards.map(
            (card) => `<li>${card}</li>`,
          ).join("")}
        </ol>
        <p>Opsummeringen er gemt permanent i notesbogen.</p>
        <div class="ending-actions">
          <button class="primary-action" type="button" data-complete-reconstruction>
            Gå ind i det sidste loop
          </button>
          <button class="secondary-action" type="button" data-complete-reconstruction>
            Spring rekonstruktionen over
          </button>
        </div>
      </section>
    </main>
  `;
  root
    .querySelectorAll("[data-complete-reconstruction]")
    .forEach((element) => {
      element.addEventListener("click", () => {
        store.dispatch({ type: "COMPLETE_RECONSTRUCTION" });
      });
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
    if (
      !isCompletedPlayback(result.status) &&
      result.status === "aborted"
    ) {
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
      ? getLocationTransitionEvent(
          pending.cause.eventId,
          store.getState().selectedCaseId,
        ).specialCue
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
    if (store.getState().pendingTransition === pending) {
      store.dispatch({ type: "COMPLETE_TRANSITION" });
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
  const manualInteractions = getSceneInteractions(
    state,
    sceneId,
    "manual",
  ).filter(
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
      ? getLocationTransitionEvent(
          pending.cause.eventId,
          state.selectedCaseId,
        ).cue
      : getSceneInteraction(pending.cause.id, state).timeAdvanceCue
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
        state.caseProgress.pendingInsights.length > 0
          ? `<div class="insight-dialog" role="dialog" aria-modal="true" aria-labelledby="insight-title">
              <div>
                <p class="eyebrow">Jørgen tænker</p>
                <h2 id="insight-title">Ny konklusion</h2>
                ${state.caseProgress.pendingInsights
                  .map((id) => `<p>${CLUE_LABELS[id]}</p>`)
                  .join("")}
                <button class="primary-action" type="button" data-dismiss-insights>Notér</button>
              </div>
            </div>`
          : ""
      }
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
  root
    .querySelector("[data-dismiss-insights]")
    ?.addEventListener("click", () => {
      store.dispatch({ type: "DISMISS_INSIGHTS" });
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

    if (state.phase === "reconstruction") {
      renderReconstruction(appView, state, store);
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
