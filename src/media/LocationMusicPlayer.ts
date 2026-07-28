import type { LocationId } from "../app/types";
import {
  getLocationMusicUrl,
  LOCATION_MUSIC_TRACKS,
  type LegacyMusicTrackId,
} from "./musicManifest";

export type LocationMusicStatus =
  | "idle"
  | "loading"
  | "playing"
  | "blocked"
  | "error";

export interface LocationMusicState {
  status: LocationMusicStatus;
  location: LocationId | null;
  trackId: LegacyMusicTrackId | null;
  muted: boolean;
  ducked: boolean;
}

const NORMAL_VOLUME = 0.42;
const DUCKED_VOLUME = 0.08;

export class LocationMusicPlayer {
  private state: LocationMusicState = {
    status: "idle",
    location: null,
    trackId: null,
    muted: false,
    ducked: false,
  };
  private playbackToken: symbol | null = null;

  constructor(private readonly audio: HTMLAudioElement) {
    audio.loop = true;
    audio.preload = "auto";
    this.applyVolume();
  }

  getState(): LocationMusicState {
    return this.state;
  }

  setLocation(location: LocationId | null): void {
    if (location === this.state.location) {
      return;
    }

    this.playbackToken = null;
    this.audio.pause();

    if (location === null) {
      this.audio.removeAttribute("src");
      this.audio.load();
      this.state = {
        ...this.state,
        status: "idle",
        location: null,
        trackId: null,
      };
      return;
    }

    const trackId = LOCATION_MUSIC_TRACKS[location];
    this.audio.src = getLocationMusicUrl(location);
    this.audio.load();
    this.state = {
      ...this.state,
      status: "loading",
      location,
      trackId,
    };
    void this.beginPlayback();
  }

  toggleMuted(): void {
    if (this.state.status === "blocked" || this.state.status === "error") {
      this.state = {
        ...this.state,
        muted: false,
        status: "loading",
      };
      this.applyVolume();
      void this.beginPlayback();
      return;
    }

    this.state = {
      ...this.state,
      muted: !this.state.muted,
    };
    this.applyVolume();
  }

  setDucked(ducked: boolean): void {
    if (ducked === this.state.ducked) {
      return;
    }
    this.state = {
      ...this.state,
      ducked,
    };
    this.applyVolume();

    if (
      !ducked &&
      this.state.location !== null &&
      !this.state.muted &&
      this.state.status === "playing" &&
      this.audio.paused
    ) {
      this.state = {
        ...this.state,
        status: "loading",
      };
      void this.beginPlayback();
    }
  }

  destroy(): void {
    this.playbackToken = null;
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.audio.load();
    this.state = {
      status: "idle",
      location: null,
      trackId: null,
      muted: this.state.muted,
      ducked: false,
    };
  }

  private async beginPlayback(): Promise<void> {
    if (!this.state.location) {
      return;
    }

    const token = Symbol(this.state.trackId ?? "music");
    this.playbackToken = token;
    try {
      await this.audio.play();
      if (this.playbackToken !== token) {
        return;
      }
      this.state = {
        ...this.state,
        status: "playing",
      };
    } catch (error) {
      if (this.playbackToken !== token) {
        return;
      }
      this.state = {
        ...this.state,
        status:
          error instanceof DOMException && error.name === "NotAllowedError"
            ? "blocked"
            : "error",
      };
    }
  }

  private applyVolume(): void {
    this.audio.muted = this.state.muted;
    this.audio.volume = this.state.ducked
      ? DUCKED_VOLUME
      : NORMAL_VOLUME;
  }
}
