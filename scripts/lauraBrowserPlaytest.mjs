const DEVTOOLS_URL = "http://127.0.0.1:9222";
const GAME_URL = "http://127.0.0.1:5173/";

const pages = await fetch(`${DEVTOOLS_URL}/json/list`).then((response) =>
  response.json()
);
const page = pages.find(({ type }) => type === "page");
if (!page?.webSocketDebuggerUrl) {
  throw new Error("No Chrome page target is available.");
}

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let commandId = 0;
const pending = new Map();
const browserErrors = [];

socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (message.id) {
    const request = pending.get(message.id);
    if (!request) {
      return;
    }
    pending.delete(message.id);
    if (message.error) {
      request.reject(new Error(message.error.message));
    } else {
      request.resolve(message.result);
    }
    return;
  }

  if (message.method === "Runtime.exceptionThrown") {
    browserErrors.push(
      message.params.exceptionDetails.exception?.description ??
        message.params.exceptionDetails.text,
    );
  }
  if (
    message.method === "Log.entryAdded" &&
    message.params.entry.level === "error"
  ) {
    browserErrors.push(message.params.entry.text);
  }
  if (
    message.method === "Runtime.consoleAPICalled" &&
    message.params.type === "error"
  ) {
    browserErrors.push(
      message.params.args
        .map(({ value, description }) => value ?? description)
        .join(" "),
    );
  }
});

function command(method, params = {}) {
  const id = ++commandId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
  });
}

await Promise.all([
  command("Page.enable"),
  command("Runtime.enable"),
  command("Log.enable"),
]);
await command("Page.navigate", { url: GAME_URL });
await new Promise((resolve) => setTimeout(resolve, 500));

const expression = String.raw`
(async () => {
  const sleep = (milliseconds = 25) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));
  const visible = (element) =>
    Boolean(element && !element.hidden && element.getClientRects().length);
  const requireElement = (selector, description = selector) => {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error("Missing browser element: " + description);
    }
    return element;
  };
  const waitFor = async (predicate, description, attempts = 240) => {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const result = predicate();
      if (result) {
        return result;
      }
      await sleep();
    }
    throw new Error("Timed out waiting for " + description);
  };
  const click = (element, description) => {
    if (!element) {
      throw new Error("Missing click target: " + description);
    }
    if (element.disabled) {
      throw new Error("Disabled click target: " + description);
    }
    element.click();
  };
  const buttonByText = (label) =>
    [...document.querySelectorAll("button")].find(
      (element) => element.textContent.trim() === label,
    );
  const clickText = async (label) => {
    click(
      await waitFor(() => buttonByText(label), JSON.stringify(label)),
      label,
    );
    await sleep();
  };
  const clickAria = async (label) => {
    click(
      await waitFor(
        () =>
          [...document.querySelectorAll("button[aria-label]")].find(
            (element) => element.getAttribute("aria-label") === label,
          ),
        JSON.stringify(label),
      ),
      label,
    );
    await sleep();
  };
  const dismissInsights = async () => {
    const dismiss = document.querySelector("[data-dismiss-insights]");
    if (dismiss) {
      click(dismiss, "notebook insight");
      await sleep();
    }
  };
  const finishNarrative = async () => {
    let observedNarrative = false;
    let quietTicks = 0;
    for (let attempt = 0; attempt < 400; attempt += 1) {
      const mediaHost = document.querySelector("[data-media-host]");
      if (visible(mediaHost)) {
        observedNarrative = true;
        quietTicks = 0;
        const continueButton = mediaHost.querySelector(
          "[data-text-continue]",
        );
        const video = mediaHost.querySelector("[data-video-player]");
        if (visible(continueButton)) {
          continueButton.click();
        } else if (video && !video.hidden) {
          video.dispatchEvent(new Event("ended"));
        }
      } else if (observedNarrative) {
        quietTicks += 1;
        if (
          quietTicks >= 4 &&
          !document.querySelector(".dialogue-choice:disabled")
        ) {
          return;
        }
      }
      await sleep();
    }
    throw new Error("Narrative sequence did not finish.");
  };
  const move = async (location) => {
    await dismissInsights();
    const directLabel = "Gå til " + location;
    const direct = [...document.querySelectorAll("button[aria-label]")].find(
      (element) => element.getAttribute("aria-label") === directLabel,
    );
    if (!direct && location !== "Gangarealet") {
      await clickAria("Gå til Gangarealet");
    }
    await clickAria("Gå til " + location);
  };
  const talk = async (person) => {
    await dismissInsights();
    await clickAria("Tal med " + person);
    await waitFor(
      () => document.querySelector("[data-dialogue-options]"),
      "dialogue with " + person,
    );
  };
  const ask = async (label) => {
    await clickText(label);
    await finishNarrative();
    await waitFor(
      () =>
        document.querySelector("[data-dialogue-options]") &&
        !document.querySelector(".dialogue-choice:disabled"),
      "completed dialogue choice " + label,
    );
  };
  const closeDialogue = async () => {
    await clickText("Afslut samtalen");
    await waitFor(
      () => document.querySelector(".exploration-stage"),
      "exploration after dialogue",
    );
  };
  const waitOneInterval = async () => {
    await dismissInsights();
    const clock = await waitFor(
      () => document.querySelector('button[aria-label^="Vent i "]'),
      "clock hotspot",
    );
    click(clock, clock.getAttribute("aria-label"));
    const dismiss = await waitFor(
      () => document.querySelector("[data-dismiss]"),
      "time transition",
    );
    click(dismiss, "continue time transition");
    await sleep();
    if (visible(document.querySelector("[data-media-host]"))) {
      await finishNarrative();
    }
    await waitFor(
      () =>
        !document.querySelector("[data-dismiss]") &&
        document.querySelector(".exploration-stage"),
      "completed time transition",
    );
  };
  const perform = async (label) => {
    await dismissInsights();
    await clickAria(label);
    await finishNarrative();
  };

  await clickText("Original historie");
  await clickText("Spring introen over");
  requireElement(".story-prologue", "story prologue").click();
  await waitFor(
    () => document.querySelector(".exploration-stage"),
    "first exploration scene",
  );

  await move("Computerrummet");
  await move("Grupperummet");
  await talk("David");
  await ask("Hvad ved du om Barbara og computere?");
  await closeDialogue();
  await waitOneInterval();

  await move("Computerrummet");
  await perform("Kryb ind under bordet og lyt");
  await perform(
    "Log ind på Barbaras computer — bruger tid frem til eftermiddag",
  );
  const timedDismiss = await waitFor(
    () => document.querySelector("[data-dismiss]"),
    "computer investigation time transition",
  );
  click(timedDismiss, "continue computer investigation");
  await waitFor(
    () => !document.querySelector("[data-dismiss]"),
    "completed computer investigation",
  );

  await waitOneInterval();
  await move("Grupperummet");
  await perform("Kig i papirkurven");
  await move("Computerrummet");
  await waitOneInterval();

  await talk("Barbara");
  await ask("Vil du hjælpe mig med Lauras computer?");
  await ask("Vil du hjælpe mig med Lauras computer?");
  await closeDialogue();

  await move("Læsesalen");
  await talk("Ryan");
  await ask("Hvad skete der mellem Sarah, Laura og dig?");
  await closeDialogue();

  await move("Gangarealet");
  await waitOneInterval();
  await move("Grupperummet");
  await talk("Marie");
  await ask("Nyt emne · Ryan gik hårdt efter dig. Er du okay?");
  await ask(
    "Nyt emne · Hvad ved du om Ryan og Lauras forhold?",
  );
  await closeDialogue();

  await move("Kantinen");
  await waitOneInterval();
  await perform("Undersøg liget og halskæden");
  await talk("Laura");
  await ask("Jeg tror, det var dig.");
  await closeDialogue();
  const confessionNotebook = document.querySelector(".notebook")?.textContent ?? "";

  if (!confessionNotebook.includes("Laura har tilstået")) {
    throw new Error("Laura's confession was not persisted in the notebook.");
  }
  if (!confessionNotebook.includes("Der findes en skjult passage")) {
    throw new Error("Passage knowledge was not persisted after confession.");
  }

  await waitOneInterval();
  await waitOneInterval();
  await move("Læsesalen");

  const blockedFallback = buttonByText(
    "Gå gennem passagen og vent på Laura",
  );
  click(blockedFallback, "blocked Laura finale fallback");
  await waitFor(
    () => visible(document.querySelector("[data-media-host]")),
    "blocked finale feedback",
  );
  const blockedFeedback =
    document.querySelector("[data-text-copy]")?.textContent ?? "";
  if (!blockedFeedback.includes("først advare Ryan")) {
    throw new Error("The blocked passage did not explain Ryan's warning.");
  }
  await finishNarrative();
  if (document.querySelector("#ending-title")) {
    throw new Error("Blocked prevention incorrectly started the epilogue.");
  }

  await talk("Ryan");
  await ask("Ryan, du er i fare.");
  await closeDialogue();

  const readyNotebook = document.querySelector(".notebook")?.textContent ?? "";
  if (!readyNotebook.includes("Ryan er advaret")) {
    throw new Error("Notebook did not confirm Ryan's warning.");
  }
  const fallback = buttonByText("Gå gennem passagen og vent på Laura");
  if (!fallback) {
    throw new Error("The text fallback for Laura's finale is missing.");
  }
  fallback.click();
  await finishNarrative();

  const epilogueTitle = await waitFor(
    () => document.querySelector("#ending-title")?.textContent,
    "Laura epilogue",
  );
  const epilogueText = document.querySelector("[data-app-view]")?.textContent ?? "";
  if (epilogueTitle !== "Dagen fortsætter") {
    throw new Error("Unexpected epilogue title: " + epilogueTitle);
  }
  if (!epilogueText.includes("For første gang fortsætter dagen uden mordet")) {
    throw new Error("Laura epilogue text is missing.");
  }

  await clickText("Se resultat");
  const resultTitle = await waitFor(
    () => document.querySelector("#result-title")?.textContent,
    "Laura result card",
  );
  const resultText = document.querySelector("[data-app-view]")?.textContent ?? "";
  if (resultTitle !== "Ryan er reddet") {
    throw new Error("Unexpected result title: " + resultTitle);
  }
  for (const expected of [
    "Laura tilstod",
    "Ryan overlever",
    "Mordet forhindret",
    "Tidsløkken er brudt",
  ]) {
    if (!resultText.includes(expected)) {
      throw new Error("Result card is missing: " + expected);
    }
  }

  return {
    confessionPersisted: true,
    blockedFeedback,
    warningConfirmed: true,
    fallbackVisible: true,
    epilogueTitle,
    resultTitle,
    resultSummary: resultText.replace(/\s+/g, " ").trim(),
  };
})()
`;

const evaluation = await command("Runtime.evaluate", {
  expression,
  awaitPromise: true,
  returnByValue: true,
});

if (evaluation.exceptionDetails) {
  throw new Error(
    evaluation.exceptionDetails.exception?.description ??
      evaluation.exceptionDetails.text,
  );
}
if (browserErrors.length > 0) {
  throw new Error(
    `Browser console reported errors:\n${browserErrors.join("\n")}`,
  );
}

console.log(JSON.stringify(evaluation.result.value, null, 2));
socket.close();
