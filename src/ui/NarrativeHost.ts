import {
  VideoPlayer,
  type VideoPlaybackResultStatus,
  type VideoPlaybackState,
} from "../media/VideoPlayer";
import type { NarrativeCue } from "../media/narrativeCue";
import { getImageUrl } from "../media/imageManifest";

export interface NarrativeCueResult {
  cue: NarrativeCue;
  status: VideoPlaybackResultStatus;
}

interface ActivePanelCue {
  token: symbol;
  cue: Extract<NarrativeCue, { kind: "text" | "stills" }>;
  frameIndex: number;
  resolve: (result: NarrativeCueResult) => void;
}

const VIDEO_STATUS_LABELS: Readonly<
  Partial<Record<VideoPlaybackState["status"], string>>
> = {
  loading: "Indlæser sekvens…",
  playing: "Afspiller sekvens…",
  "autoplay-blocked": "Browseren blokerede afspilningen.",
  "missing-media": "Videofilen mangler.",
  "network-error": "Videofilen kunne ikke indlæses.",
  "decode-error": "Videofilen kunne ikke afkodes.",
};

export class NarrativeHost {
  private readonly video: HTMLVideoElement;
  private readonly textPanel: HTMLElement;
  private readonly stillImage: HTMLImageElement;
  private readonly textCopy: HTMLElement;
  private readonly continueButton: HTMLButtonElement;
  private readonly skipButton: HTMLButtonElement;
  private readonly status: HTMLElement;
  private readonly videoPlayer: VideoPlayer;
  private readonly unsubscribeVideo: () => void;
  private activeToken: symbol | null = null;
  private activePanel: ActivePanelCue | null = null;
  private isActive = false;

  constructor(
    private readonly root: HTMLElement,
    private readonly onActiveChange: (active: boolean) => void = () => {},
  ) {
    root.className = "media-host";
    root.hidden = true;
    root.setAttribute("aria-label", "Narrativ sekvens");
    root.innerHTML = `
      <div class="media-frame">
        <video
          data-video-player
          controls
          playsinline
          preload="metadata"
        ></video>
        <div class="text-cue" data-text-cue hidden>
          <img class="still-cue-image" data-still-image hidden />
          <p data-text-copy></p>
          <button class="primary-action" type="button" data-text-continue>
            Fortsæt
          </button>
        </div>
        <div class="media-controls">
          <p role="status" aria-live="polite" data-media-status></p>
          <button class="secondary-action" type="button" data-media-skip>
            Spring over
          </button>
        </div>
      </div>
    `;

    this.video = this.requireElement<HTMLVideoElement>(
      "[data-video-player]",
    );
    this.textPanel = this.requireElement<HTMLElement>("[data-text-cue]");
    this.stillImage = this.requireElement<HTMLImageElement>(
      "[data-still-image]",
    );
    this.textCopy = this.requireElement<HTMLElement>("[data-text-copy]");
    this.continueButton = this.requireElement<HTMLButtonElement>(
      "[data-text-continue]",
    );
    this.skipButton = this.requireElement<HTMLButtonElement>(
      "[data-media-skip]",
    );
    this.status = this.requireElement<HTMLElement>("[data-media-status]");
    this.videoPlayer = new VideoPlayer(this.video);
    this.unsubscribeVideo = this.videoPlayer.subscribe((state) => {
      this.status.textContent = VIDEO_STATUS_LABELS[state.status] ?? "";
    });

    this.continueButton.addEventListener("click", () => {
      this.continuePanel();
    });
    this.skipButton.addEventListener("click", () => {
      this.skip();
    });
  }

  async play(cue: NarrativeCue): Promise<NarrativeCueResult> {
    this.abort();
    const token = Symbol(cue.kind);
    this.activeToken = token;
    this.root.hidden = false;
    this.setActive(true);

    if (cue.kind === "text" || cue.kind === "stills") {
      this.video.hidden = true;
      this.textPanel.hidden = false;

      return new Promise((resolve) => {
        this.activePanel = {
          token,
          cue,
          frameIndex: 0,
          resolve,
        };
        this.renderPanelCue();
        this.continueButton.focus();
      });
    }

    this.textPanel.hidden = true;
    this.video.hidden = false;
    const result = await this.videoPlayer.play(cue.clipId);

    if (this.activeToken === token) {
      this.activeToken = null;
      this.root.hidden = true;
      this.setActive(false);
    }

    return {
      cue,
      status: result.status,
    };
  }

  skip(): boolean {
    if (this.activePanel) {
      this.finishPanel("skipped");
      return true;
    }

    return this.videoPlayer.skip();
  }

  abort(): boolean {
    let aborted = false;

    if (this.activePanel) {
      this.finishPanel("aborted");
      aborted = true;
    }

    if (this.videoPlayer.abort()) {
      aborted = true;
    }

    this.activeToken = null;
    this.root.hidden = true;
    this.setActive(false);
    return aborted;
  }

  destroy(): void {
    this.abort();
    this.unsubscribeVideo();
    this.videoPlayer.destroy();
    this.root.replaceChildren();
  }

  private continuePanel(): void {
    const active = this.activePanel;
    if (!active) {
      return;
    }

    if (
      active.cue.kind === "stills" &&
      active.frameIndex < active.cue.frames.length - 1
    ) {
      active.frameIndex += 1;
      this.renderPanelCue();
      return;
    }

    this.finishPanel("ended");
  }

  private renderPanelCue(): void {
    const active = this.activePanel;
    if (!active) {
      return;
    }

    if (active.cue.kind === "text") {
      this.stillImage.hidden = true;
      this.stillImage.removeAttribute("src");
      this.stillImage.alt = "";
      this.textCopy.textContent = active.cue.text;
      this.status.textContent = "Tekstsekvens";
      this.continueButton.textContent = "Fortsæt";
      return;
    }

    const frame = active.cue.frames[active.frameIndex];
    if (!frame) {
      throw new Error("Still-image cue has no frame to present.");
    }
    this.stillImage.hidden = false;
    this.stillImage.src = getImageUrl(frame.image);
    this.stillImage.alt = frame.alt;
    this.textCopy.textContent = frame.text ?? "";
    this.textCopy.hidden = frame.text === undefined;
    this.status.textContent =
      `Billedsekvens ${active.frameIndex + 1} af ${active.cue.frames.length}`;
    this.continueButton.textContent =
      active.frameIndex < active.cue.frames.length - 1
        ? "Næste"
        : "Fortsæt";
  }

  private finishPanel(status: VideoPlaybackResultStatus): void {
    const active = this.activePanel;
    if (!active) {
      return;
    }

    this.activePanel = null;
    this.textCopy.hidden = false;
    if (this.activeToken === active.token) {
      this.activeToken = null;
      this.root.hidden = true;
      this.setActive(false);
    }
    active.resolve({
      cue: active.cue,
      status,
    });
  }

  private requireElement<ElementType extends Element>(
    selector: string,
  ): ElementType {
    const element = this.root.querySelector<ElementType>(selector);
    if (!element) {
      throw new Error(`Narrative host element not found: ${selector}`);
    }

    return element;
  }

  private setActive(active: boolean): void {
    if (this.isActive === active) {
      return;
    }
    this.isActive = active;
    this.onActiveChange(active);
  }
}
