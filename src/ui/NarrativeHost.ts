import {
  VideoPlayer,
  type VideoPlaybackResultStatus,
  type VideoPlaybackState,
} from "../media/VideoPlayer";
import type { NarrativeCue } from "../media/narrativeCue";

export interface NarrativeCueResult {
  cue: NarrativeCue;
  status: VideoPlaybackResultStatus;
}

interface ActiveTextCue {
  token: symbol;
  cue: NarrativeCue & { kind: "text" };
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
  private readonly textCopy: HTMLElement;
  private readonly continueButton: HTMLButtonElement;
  private readonly skipButton: HTMLButtonElement;
  private readonly status: HTMLElement;
  private readonly videoPlayer: VideoPlayer;
  private readonly unsubscribeVideo: () => void;
  private activeToken: symbol | null = null;
  private activeText: ActiveTextCue | null = null;

  constructor(private readonly root: HTMLElement) {
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
      this.finishText("ended");
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

    if (cue.kind === "text") {
      this.video.hidden = true;
      this.textPanel.hidden = false;
      this.textCopy.textContent = cue.text;
      this.status.textContent = "Tekstsekvens";
      this.continueButton.focus();

      return new Promise((resolve) => {
        this.activeText = {
          token,
          cue,
          resolve,
        };
      });
    }

    this.textPanel.hidden = true;
    this.video.hidden = false;
    const result = await this.videoPlayer.play(cue.clipId);

    if (this.activeToken === token) {
      this.activeToken = null;
      this.root.hidden = true;
    }

    return {
      cue,
      status: result.status,
    };
  }

  skip(): boolean {
    if (this.activeText) {
      this.finishText("skipped");
      return true;
    }

    return this.videoPlayer.skip();
  }

  abort(): boolean {
    let aborted = false;

    if (this.activeText) {
      this.finishText("aborted");
      aborted = true;
    }

    if (this.videoPlayer.abort()) {
      aborted = true;
    }

    this.activeToken = null;
    this.root.hidden = true;
    return aborted;
  }

  destroy(): void {
    this.abort();
    this.unsubscribeVideo();
    this.videoPlayer.destroy();
    this.root.replaceChildren();
  }

  private finishText(status: VideoPlaybackResultStatus): void {
    const active = this.activeText;
    if (!active) {
      return;
    }

    this.activeText = null;
    if (this.activeToken === active.token) {
      this.activeToken = null;
      this.root.hidden = true;
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
}
