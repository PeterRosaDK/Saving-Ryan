import {
  getVideoUrl,
  type VideoClipId,
} from "./videoManifest";

export type VideoPlaybackStatus =
  | "idle"
  | "loading"
  | "playing"
  | "ended"
  | "skipped"
  | "autoplay-blocked"
  | "missing-media"
  | "network-error"
  | "decode-error"
  | "aborted";

export type VideoPlaybackResultStatus = Exclude<
  VideoPlaybackStatus,
  "idle" | "loading" | "playing"
>;

export interface VideoPlaybackState {
  status: VideoPlaybackStatus;
  clipId: VideoClipId | null;
}

export interface VideoPlaybackResult {
  status: VideoPlaybackResultStatus;
  clipId: VideoClipId;
}

type StateSubscriber = (state: VideoPlaybackState) => void;

interface PlaybackSession {
  token: symbol;
  clipId: VideoClipId;
  resolve: (result: VideoPlaybackResult) => void;
  cleanup: () => void;
}

const MEDIA_ERROR_CODE = {
  aborted: 1,
  network: 2,
  decode: 3,
  sourceNotSupported: 4,
} as const;

function classifyMediaError(error: MediaError | null): VideoPlaybackResultStatus {
  switch (error?.code) {
    case MEDIA_ERROR_CODE.aborted:
      return "aborted";
    case MEDIA_ERROR_CODE.network:
      return "network-error";
    case MEDIA_ERROR_CODE.decode:
      return "decode-error";
    case MEDIA_ERROR_CODE.sourceNotSupported:
      return "missing-media";
    default:
      return "network-error";
  }
}

function classifyPlayRejection(error: unknown): VideoPlaybackResultStatus {
  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotAllowedError":
        return "autoplay-blocked";
      case "AbortError":
        return "aborted";
      case "NotSupportedError":
        return "decode-error";
    }
  }

  return "network-error";
}

export class VideoPlayer {
  private activeSession: PlaybackSession | null = null;
  private state: VideoPlaybackState = {
    status: "idle",
    clipId: null,
  };
  private readonly subscribers = new Set<StateSubscriber>();

  constructor(private readonly video: HTMLVideoElement) {}

  getState(): VideoPlaybackState {
    return this.state;
  }

  subscribe(subscriber: StateSubscriber): () => void {
    this.subscribers.add(subscriber);
    subscriber(this.state);

    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  play(clipId: VideoClipId): Promise<VideoPlaybackResult> {
    this.finishActiveSession("aborted");

    return new Promise((resolve) => {
      const token = Symbol(clipId);
      const onLoadedMetadata = () => {
        void this.beginPlayback(token);
      };
      const onEnded = () => {
        this.finishSession(token, "ended");
      };
      const onError = () => {
        this.finishSession(token, classifyMediaError(this.video.error));
      };

      const cleanup = () => {
        this.video.removeEventListener("loadedmetadata", onLoadedMetadata);
        this.video.removeEventListener("ended", onEnded);
        this.video.removeEventListener("error", onError);
      };

      this.activeSession = {
        token,
        clipId,
        resolve,
        cleanup,
      };
      this.video.addEventListener("loadedmetadata", onLoadedMetadata);
      this.video.addEventListener("ended", onEnded);
      this.video.addEventListener("error", onError);
      this.setState({ status: "loading", clipId });

      try {
        this.video.src = getVideoUrl(clipId);
        this.video.load();
      } catch (error) {
        this.finishSession(token, classifyPlayRejection(error));
      }
    });
  }

  skip(): boolean {
    return this.finishActiveSession("skipped");
  }

  abort(): boolean {
    return this.finishActiveSession("aborted");
  }

  destroy(): void {
    this.abort();
    this.subscribers.clear();
    this.video.removeAttribute("src");
    this.video.load();
    this.state = {
      status: "idle",
      clipId: null,
    };
  }

  private async beginPlayback(token: symbol): Promise<void> {
    if (
      this.activeSession?.token !== token ||
      this.state.status !== "loading"
    ) {
      return;
    }

    try {
      await this.video.play();
      if (this.activeSession?.token !== token) {
        return;
      }

      this.setState({
        status: "playing",
        clipId: this.activeSession.clipId,
      });
    } catch (error) {
      this.finishSession(token, classifyPlayRejection(error));
    }
  }

  private finishActiveSession(
    status: VideoPlaybackResultStatus,
  ): boolean {
    if (!this.activeSession) {
      return false;
    }

    return this.finishSession(this.activeSession.token, status);
  }

  private finishSession(
    token: symbol,
    status: VideoPlaybackResultStatus,
  ): boolean {
    const session = this.activeSession;
    if (!session || session.token !== token) {
      return false;
    }

    this.activeSession = null;
    session.cleanup();
    if (status !== "ended") {
      this.video.pause();
    }

    const result: VideoPlaybackResult = {
      status,
      clipId: session.clipId,
    };
    this.setState(result);
    session.resolve(result);
    return true;
  }

  private setState(state: VideoPlaybackState): void {
    this.state = state;
    this.subscribers.forEach((subscriber) => subscriber(state));
  }
}
